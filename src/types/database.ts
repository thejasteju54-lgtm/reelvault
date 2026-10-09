export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: string;
  user_id: string;
  instagram_url: string;
  canonical_url: string;
  instagram_shortcode: string;
  title: string | null;
  creator_username: string | null;
  thumbnail_url: string | null;
  notes: string | null;
  category_id: string | null;
  is_favorite: boolean;
  is_watched: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  watched_at: string | null;
  archived_at: string | null;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface ReelTag {
  reel_id: string;
  tag_id: string;
  user_id: string;
  created_at: string;
}

export interface ReelWithDetails extends Reel {
  category?: Category | null;
  tags?: Tag[];
}

export interface VaultStats {
  total: number;
  unwatched: number;
  watched: number;
  favorites: number;
  archived: number;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Category, 'id' | 'user_id'>>;
      };
      reels: {
        Row: Reel;
        Insert: Omit<Reel, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Reel, 'id' | 'user_id'>>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Tag, 'id' | 'user_id'>>;
      };
      reel_tags: {
        Row: ReelTag;
        Insert: Omit<ReelTag, 'created_at'> & {
          created_at?: string;
        };
        Update: Partial<ReelTag>;
      };
    };
  };
}
