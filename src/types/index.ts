export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  slug: string;
  color: string;
  count?: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  count?: number;
  createdAt: string;
}

export interface Reel {
  id: string;
  userId: string;
  instagramUrl: string;
  canonicalUrl: string;
  instagramShortcode: string;
  title: string | null;
  creatorUsername: string | null;
  thumbnailUrl: string | null;
  notes: string | null;
  categoryId: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  isFavorite: boolean;
  isWatched: boolean;
  isArchived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  watchedAt: string | null;
  archivedAt: string | null;
}

export interface CreateReelInput {
  url: string;
  title?: string;
  notes?: string;
  categoryId?: string;
  tags?: string[];
}

export interface UpdateReelInput {
  title?: string;
  notes?: string;
  categoryId?: string | null;
  tags?: string[];
}

export interface ReelQueryFilters {
  q?: string;
  status?: 'all' | 'unwatched' | 'watched';
  favorite?: boolean;
  archived?: boolean;
  categoryId?: string;
  tag?: string;
  sort?: 'newest' | 'oldest' | 'updated' | 'alphabetical';
  limit?: number;
  cursor?: string;
}

export interface VaultStats {
  total: number;
  watched: number;
  unwatched: number;
  favorites: number;
  archived: number;
  topTags: { name: string; count: number }[];
}

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    existingReelId?: string;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export interface AuthResponseData {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
}
