import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errors';
import type { Category, Tag, VaultStats } from '../types/database';

export const TaxonomyService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async getTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  async getStats(): Promise<VaultStats> {
    try {
      // Execute parallel queries for different counts
      const [
        { count: total, error: e1 },
        { count: unwatched, error: e2 },
        { count: watched, error: e3 },
        { count: favorites, error: e4 },
        { count: archived, error: e5 }
      ] = await Promise.all([
        supabase.from('reels').select('*', { count: 'exact', head: true }).eq('is_archived', false),
        supabase.from('reels').select('*', { count: 'exact', head: true }).eq('is_watched', false).eq('is_archived', false),
        supabase.from('reels').select('*', { count: 'exact', head: true }).eq('is_watched', true).eq('is_archived', false),
        supabase.from('reels').select('*', { count: 'exact', head: true }).eq('is_favorite', true).eq('is_archived', false),
        supabase.from('reels').select('*', { count: 'exact', head: true }).eq('is_archived', true)
      ]);

      if (e1) throw e1;
      if (e2) throw e2;
      if (e3) throw e3;
      if (e4) throw e4;
      if (e5) throw e5;

      return {
        total: total || 0,
        unwatched: unwatched || 0,
        watched: watched || 0,
        favorites: favorites || 0,
        archived: archived || 0
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
};
