import { z } from 'zod';
import { normalizeInstagramUrl } from './url';

export const SaveReelSchema = z.object({
  url: z.string().url().refine((val) => normalizeInstagramUrl(val) !== null, {
    message: "Invalid Instagram Reel URL",
  }),
  title: z.string().max(255).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  tagNames: z.array(z.string().max(30)).max(10).optional()
});

export const UpdateReelSchema = z.object({
  title: z.string().max(255).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  is_favorite: z.boolean().optional(),
  is_watched: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  tagNames: z.array(z.string().max(30)).max(10).optional()
});

export const ListReelsQuerySchema = z.object({
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  tag: z.string().optional(),
  status: z.enum(['all', 'unwatched', 'watched', 'favorites', 'archived']).default('all'),
  limit: z.number().min(1).max(50).default(20),
  page: z.number().min(1).default(1),
  sortBy: z.enum(['newest', 'oldest', 'favorite']).default('newest')
});

export type SaveReelInput = z.infer<typeof SaveReelSchema>;
export type UpdateReelInput = z.infer<typeof UpdateReelSchema>;
export type ListReelsQuery = z.infer<typeof ListReelsQuerySchema>;
