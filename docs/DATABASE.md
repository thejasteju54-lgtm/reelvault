# Database Design & Schema Specification: ReelVault

## 1. Overview
The ReelVault database layer uses **PostgreSQL** with Row-Level Security (RLS). Every table is isolated by `user_id` linked to the authenticated principal (`auth.uid()`). Primary keys use UUIDv4 (`gen_random_uuid()`).

---

## 2. Complete SQL Schema & DDL

```sql
-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    color VARCHAR(16) DEFAULT '#6366F1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
);

-- ============================================================================
-- 2. REELS TABLE
-- ============================================================================
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

-- ============================================================================
-- 3. TAGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tags_user_name UNIQUE (user_id, name)
);

-- ============================================================================
-- 4. REEL_TAGS (Junction Table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reel_tags (
    reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (reel_id, tag_id)
);
```

---

## 3. Query Performance & Indexing Strategy

```sql
-- Feed ordering & pagination
CREATE INDEX idx_reels_user_created ON public.reels(user_id, created_at DESC);

-- Duplicate prevention lookup
CREATE INDEX idx_reels_user_shortcode ON public.reels(user_id, instagram_shortcode);

-- Common filter tabs
CREATE INDEX idx_reels_user_favorite ON public.reels(user_id, created_at DESC) WHERE is_favorite = TRUE;
CREATE INDEX idx_reels_user_archived ON public.reels(user_id, created_at DESC) WHERE is_archived = TRUE;
CREATE INDEX idx_reels_user_watched ON public.reels(user_id, is_watched);
CREATE INDEX idx_reels_user_category ON public.reels(user_id, category_id);

-- Junction lookups
CREATE INDEX idx_reel_tags_user_tag ON public.reel_tags(user_id, tag_id);

-- Fast text search on title & notes
CREATE INDEX idx_reels_trgm_search ON public.reels USING gin (
    (COALESCE(title, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(creator_username, '')) gin_trgm_ops
);
```

---

## 4. Row-Level Security (RLS) Policies

```sql
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_tags ENABLE ROW LEVEL SECURITY;

-- CATEGORIES RLS
CREATE POLICY "Categories isolation" ON public.categories
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REELS RLS
CREATE POLICY "Reels isolation" ON public.reels
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TAGS RLS
CREATE POLICY "Tags isolation" ON public.tags
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REEL_TAGS RLS
CREATE POLICY "Reel_tags isolation" ON public.reel_tags
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

---

## 5. Multi-Tenant Isolation Guarantee
No client API can bypass the `auth.uid() = user_id` check. Attempting to select or update another user's Reel returns an empty set or 0 rows modified, preventing both data leaks and cross-user modification.
