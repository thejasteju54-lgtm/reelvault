import { supabase } from '../lib/supabase';
import { 
  SaveReelInput, 
  UpdateReelInput, 
  SaveReelSchema, 
  UpdateReelSchema, 
  ListReelsQuerySchema 
} from '../utils/validation';
import { ZodError } from 'zod';
import { normalizeInstagramUrl } from '../utils/url';
import { ApiError, handleSupabaseError } from '../utils/errors';
import type { ReelWithDetails } from '../types/database';

export const ReelsService = {
  async saveReel(payload: SaveReelInput): Promise<ReelWithDetails> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new ApiError('UNAUTHORIZED', 'User not authenticated', 401);
      }

      const validated = SaveReelSchema.parse(payload);
      
      const urlInfo = normalizeInstagramUrl(validated.url);
      if (!urlInfo) {
        throw new ApiError('INVALID_URL', 'Invalid Instagram Reel URL', 400);
      }

      const insertData: any = {
        user_id: user.user.id,
        instagram_url: validated.url,
        canonical_url: urlInfo.canonical_url,
        instagram_shortcode: urlInfo.shortcode,
        title: validated.title ?? null,
        notes: validated.notes ?? null,
        category_id: validated.category_id ?? null,
        creator_username: null,
        thumbnail_url: null,
        is_favorite: false,
        is_watched: false,
        is_archived: false,
        watched_at: null,
        archived_at: null,
      };

      // First, insert the reel
      const { data: reel, error: insertError } = await supabase
        .from('reels')
        .insert(insertData)
        .select(`*, category:categories(*)`)
        .single();

      if (insertError) {
        throw insertError;
      }

      // If there are tags, insert them
      let attachedTags: any[] = [];
      if (validated.tagNames && validated.tagNames.length > 0) {
        attachedTags = await this._syncTags(user.user.id, (reel as any).id, validated.tagNames);
      }

      return {
        ...(reel as any),
        tags: attachedTags
      } as ReelWithDetails;

    } catch (error) {
      if (error instanceof ZodError) {
        throw new ApiError('VALIDATION_ERROR', (error as any).errors[0]?.message || 'Validation error', 400, (error as any).errors);
      }
      return handleSupabaseError(error);
    }
  },

  async listReels(query: any = {}): Promise<{ data: ReelWithDetails[], meta: { total: number, page: number, limit: number, hasMore: boolean } }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new ApiError('UNAUTHORIZED', 'User not authenticated', 401);
      }

      const validated = ListReelsQuerySchema.parse(query);
      const { search, category_id, tag, status, limit, page, sortBy } = validated;

      let sbQuery: any = supabase
        .from('reels')
        .select(`*, category:categories(*), reel_tags!inner(tag:tags(*))`, { count: 'exact' });

      // Apply status filters
      if (status === 'favorites') {
        sbQuery = sbQuery.eq('is_favorite', true);
        sbQuery = sbQuery.eq('is_archived', false);
      } else if (status === 'watched') {
        sbQuery = sbQuery.eq('is_watched', true);
        sbQuery = sbQuery.eq('is_archived', false);
      } else if (status === 'unwatched') {
        sbQuery = sbQuery.eq('is_watched', false);
        sbQuery = sbQuery.eq('is_archived', false);
      } else if (status === 'archived') {
        sbQuery = sbQuery.eq('is_archived', true);
      } else {
        // all active
        sbQuery = sbQuery.eq('is_archived', false);
      }

      if (category_id) {
        sbQuery = sbQuery.eq('category_id', category_id);
      }

      if (search) {
        sbQuery = sbQuery.or(`title.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      if (tag) {
        sbQuery = sbQuery.eq('reel_tags.tag.name', tag);
      }

      // Sort
      if (sortBy === 'newest') {
        sbQuery = sbQuery.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        sbQuery = sbQuery.order('created_at', { ascending: true });
      } else if (sortBy === 'favorite') {
        sbQuery = sbQuery.order('is_favorite', { ascending: false }).order('created_at', { ascending: false });
      }

      // Pagination
      const offset = (page - 1) * limit;
      sbQuery = sbQuery.range(offset, offset + limit - 1);

      const { data, count, error } = await sbQuery;

      if (error) {
        throw error;
      }

      // Transform tags from the joined structure
      const transformedData = (data as any[]).map(reel => {
        const tags = (reel.reel_tags as any[]).map(rt => rt.tag).filter(Boolean);
        delete reel.reel_tags;
        return {
          ...reel,
          tags
        };
      });

      return {
        data: transformedData as ReelWithDetails[],
        meta: {
          total: count || 0,
          page,
          limit,
          hasMore: count ? offset + limit < count : false
        }
      };

    } catch (error) {
      if (error instanceof ZodError) {
        throw new ApiError('VALIDATION_ERROR', (error as any).errors[0]?.message || 'Validation error', 400, (error as any).errors);
      }
      return handleSupabaseError(error);
    }
  },

  async updateReel(id: string, payload: UpdateReelInput): Promise<ReelWithDetails> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new ApiError('UNAUTHORIZED', 'User not authenticated', 401);
      }

      const validated = UpdateReelSchema.parse(payload);
      
      const updateData: any = {};
      if (validated.title !== undefined) updateData.title = validated.title;
      if (validated.notes !== undefined) updateData.notes = validated.notes;
      if (validated.category_id !== undefined) updateData.category_id = validated.category_id;
      if (validated.is_favorite !== undefined) updateData.is_favorite = validated.is_favorite;
      if (validated.is_watched !== undefined) {
        updateData.is_watched = validated.is_watched;
        updateData.watched_at = validated.is_watched ? new Date().toISOString() : null;
      }
      if (validated.is_archived !== undefined) {
        updateData.is_archived = validated.is_archived;
        updateData.archived_at = validated.is_archived ? new Date().toISOString() : null;
      }

      const { data: reel, error: updateError } = await supabase
        .from('reels')
        .update(updateData as never)
        .eq('id', id)
        .select(`*, category:categories(*)`)
        .single();

      if (updateError) {
        throw updateError;
      }

      // Sync tags if provided
      let attachedTags: any[] = [];
      if (validated.tagNames !== undefined) {
        attachedTags = await this._syncTags(user.user.id, (reel as any).id, validated.tagNames);
      } else {
        // Fetch existing tags
        const { data: existingTags } = await supabase
          .from('reel_tags')
          .select('tag:tags(*)')
          .eq('reel_id', id);
        
        attachedTags = existingTags?.map((rt: any) => rt.tag).filter(Boolean) || [];
      }

      return {
        ...(reel as any),
        tags: attachedTags
      } as ReelWithDetails;

    } catch (error) {
      if (error instanceof ZodError) {
        throw new ApiError('VALIDATION_ERROR', (error as any).errors[0]?.message || 'Validation error', 400, (error as any).errors);
      }
      return handleSupabaseError(error);
    }
  },

  async deleteReel(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reels')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async _syncTags(userId: string, reelId: string, tagNames: string[]): Promise<any[]> {
    if (tagNames.length === 0) {
      // Remove all tags
      await supabase.from('reel_tags').delete().eq('reel_id', reelId);
      return [];
    }

    // 1. Get or create tags
    const tags: any[] = [];
    for (const name of tagNames) {
      const normalizedName = name.toLowerCase().trim();
      let { data: tag, error } = await supabase
        .from('tags')
        .select('*')
        .eq('name', normalizedName)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // Tag doesn't exist, create it
        const newTagData: any = { user_id: userId, name: normalizedName };
        const { data: newTag, error: createError } = await supabase
          .from('tags')
          .insert(newTagData)
          .select('*')
          .single();
          
        if (createError) throw createError;
        tag = newTag;
      } else if (error) {
        throw error;
      }
      if (tag) tags.push(tag);
    }

    // 2. Clear existing links
    await supabase.from('reel_tags').delete().eq('reel_id', reelId);

    // 3. Link new tags
    if (tags.length > 0) {
      const links: any[] = tags.map(t => ({
        reel_id: reelId,
        tag_id: t.id,
        user_id: userId
      }));
      const { error: linkError } = await supabase.from('reel_tags').insert(links as any);
      if (linkError) throw linkError;
    }

    return tags;
  }
};
