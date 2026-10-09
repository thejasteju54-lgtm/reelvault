import {
  User,
  Reel,
  Category,
  Tag,
  CreateReelInput,
  UpdateReelInput,
  ReelQueryFilters,
  VaultStats,
  AuthResponseData
} from '../../types/index.js';

const TOKEN_KEY = 'reelvault_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    removeStoredToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.error?.message || 'An unexpected error occurred.') as Error & {
      code?: string;
      details?: unknown;
      existingReelId?: string;
    };
    error.code = data.error?.code;
    error.details = data.error?.details;
    error.existingReelId = data.error?.existingReelId;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    async register(email: string, password: string, displayName?: string, website?: string): Promise<AuthResponseData> {
      const res = await request<{ data: AuthResponseData }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName, website })
      });
      setStoredToken(res.data.token);
      return res.data;
    },

    async login(email: string, password: string, website?: string): Promise<AuthResponseData> {
      const res = await request<{ data: AuthResponseData }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, website })
      });
      setStoredToken(res.data.token);
      return res.data;
    },

    async me(): Promise<User> {
      const res = await request<{ data: User }>('/api/auth/me');
      return res.data;
    },

    logout(): void {
      removeStoredToken();
    }
  },

  reels: {
    async save(input: CreateReelInput): Promise<Reel> {
      const res = await request<{ data: Reel }>('/api/reels', {
        method: 'POST',
        body: JSON.stringify(input)
      });
      return res.data;
    },

    async list(filters: ReelQueryFilters = {}): Promise<{
      reels: Reel[];
      total: number;
      nextCursor: string | null;
      hasMore: boolean;
    }> {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.status) params.set('status', filters.status);
      if (filters.favorite !== undefined) params.set('favorite', String(filters.favorite));
      if (filters.archived !== undefined) params.set('archived', String(filters.archived));
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.tag) params.set('tag', filters.tag);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.cursor) params.set('cursor', filters.cursor);

      const qs = params.toString();
      const res = await request<{
        data: Reel[];
        meta: { total: number; nextCursor: string | null; hasMore: boolean };
      }>(`/api/reels${qs ? `?${qs}` : ''}`);

      return {
        reels: res.data,
        total: res.meta?.total ?? res.data.length,
        nextCursor: res.meta?.nextCursor ?? null,
        hasMore: res.meta?.hasMore ?? false
      };
    },

    async get(id: string): Promise<Reel> {
      const res = await request<{ data: Reel }>(`/api/reels/${id}`);
      return res.data;
    },

    async update(id: string, input: UpdateReelInput): Promise<Reel> {
      const res = await request<{ data: Reel }>(`/api/reels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input)
      });
      return res.data;
    },

    async toggleFavorite(id: string): Promise<Reel> {
      const res = await request<{ data: Reel }>(`/api/reels/${id}/favorite`, {
        method: 'POST'
      });
      return res.data;
    },

    async toggleWatched(id: string): Promise<Reel> {
      const res = await request<{ data: Reel }>(`/api/reels/${id}/watched`, {
        method: 'POST'
      });
      return res.data;
    },

    async toggleArchive(id: string): Promise<Reel> {
      const res = await request<{ data: Reel }>(`/api/reels/${id}/archive`, {
        method: 'POST'
      });
      return res.data;
    },

    async delete(id: string): Promise<void> {
      await request(`/api/reels/${id}`, {
        method: 'DELETE'
      });
    }
  },

  categories: {
    async list(): Promise<Category[]> {
      const res = await request<{ data: Category[] }>('/api/categories');
      return res.data;
    },

    async create(name: string, color?: string): Promise<Category> {
      const res = await request<{ data: Category }>('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name, color })
      });
      return res.data;
    },

    async delete(id: string): Promise<void> {
      await request(`/api/categories/${id}`, {
        method: 'DELETE'
      });
    }
  },

  tags: {
    async list(): Promise<Tag[]> {
      const res = await request<{ data: Tag[] }>('/api/tags');
      return res.data;
    },

    async delete(id: string): Promise<void> {
      await request(`/api/tags/${id}`, {
        method: 'DELETE'
      });
    }
  },

  stats: {
    async get(): Promise<VaultStats> {
      const res = await request<{ data: VaultStats }>('/api/stats');
      return res.data;
    }
  },

  export: {
    async download(format: 'json' | 'csv'): Promise<void> {
      const token = getStoredToken();
      const res = await fetch(`/api/export?format=${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reelvault-export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  }
};
