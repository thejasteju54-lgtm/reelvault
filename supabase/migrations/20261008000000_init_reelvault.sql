-- ============================================================================
-- REELVAULT: INITIAL DATABASE MIGRATION
-- Migration: 20261008000000_init_reelvault.sql
-- Description: Complete schema for ReelVault bookmarks, categories, tags, 
--              relations, indexes, and Row-Level Security policies.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    color VARCHAR(16) NOT NULL DEFAULT '#6366F1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

-- 3. REELS TABLE
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    instagram_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    instagram_shortcode VARCHAR(64) NOT NULL,
    title VARCHAR(255),
    creator_username VARCHAR(128),
    thumbnail_url TEXT,
    notes TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_watched BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    watched_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    CONSTRAINT uq_reels_user_shortcode UNIQUE (user_id, instagram_shortcode)
);

-- 4. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tags_user_name UNIQUE (user_id, name)
);

-- 5. REEL_TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.reel_tags (
    reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (reel_id, tag_id)
);

-- ============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================

-- Primary feeds and timeline queries
CREATE INDEX IF NOT EXISTS idx_reels_user_created 
    ON public.reels(user_id, created_at DESC);

-- Duplicate prevention & rapid shortcode lookup
CREATE INDEX IF NOT EXISTS idx_reels_user_shortcode 
    ON public.reels(user_id, instagram_shortcode);

-- Filtered views
CREATE INDEX IF NOT EXISTS idx_reels_user_favorite 
    ON public.reels(user_id, created_at DESC) 
    WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS idx_reels_user_archived 
    ON public.reels(user_id, created_at DESC) 
    WHERE is_archived = TRUE;

CREATE INDEX IF NOT EXISTS idx_reels_user_watched 
    ON public.reels(user_id, is_watched);

CREATE INDEX IF NOT EXISTS idx_reels_user_category 
    ON public.reels(user_id, category_id);

-- Junction lookups
CREATE INDEX IF NOT EXISTS idx_reel_tags_user_tag 
    ON public.reel_tags(user_id, tag_id);

CREATE INDEX IF NOT EXISTS idx_reel_tags_reel_id 
    ON public.reel_tags(reel_id);

-- Trigram search index on title, notes, creator_username
CREATE INDEX IF NOT EXISTS idx_reels_trgm_search 
    ON public.reels USING gin (
        (COALESCE(title, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(creator_username, '')) gin_trgm_ops
    );

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_tags ENABLE ROW LEVEL SECURITY;

-- CATEGORIES POLICIES
CREATE POLICY "Users can manage their own categories"
    ON public.categories
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REELS POLICIES
CREATE POLICY "Users can manage their own reels"
    ON public.reels
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TAGS POLICIES
CREATE POLICY "Users can manage their own tags"
    ON public.tags
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REEL_TAGS POLICIES
CREATE POLICY "Users can manage their own reel_tags"
    ON public.reel_tags
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reels_updated_at ON public.reels;
CREATE TRIGGER trigger_reels_updated_at
    BEFORE UPDATE ON public.reels
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
