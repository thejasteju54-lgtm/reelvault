export const SCHEMA_SQL = `
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, slug)
);

-- 3. Reels Table
CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    instagram_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    instagram_shortcode TEXT NOT NULL,
    title TEXT,
    creator_username TEXT,
    thumbnail_url TEXT,
    notes TEXT,
    category_id TEXT,
    is_favorite INTEGER DEFAULT 0,
    is_watched INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    watched_at TEXT,
    archived_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_reel_shortcode UNIQUE (user_id, instagram_shortcode)
);

-- 4. Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL COLLATE NOCASE,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, name)
);

-- 5. Reel Tags Join Table
CREATE TABLE IF NOT EXISTS reel_tags (
    reel_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (reel_id, tag_id),
    FOREIGN KEY (reel_id) REFERENCES reels(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_reels_user_shortcode ON reels (user_id, instagram_shortcode);
CREATE INDEX IF NOT EXISTS idx_reels_user_created ON reels (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_archived ON reels (user_id, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_favorites ON reels (user_id, is_favorite, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_watched ON reels (user_id, is_watched, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_category ON reels (user_id, category_id, is_archived);

CREATE INDEX IF NOT EXISTS idx_reel_tags_reel ON reel_tags (reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_tags_tag ON reel_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_name ON tags (user_id, name);
`;

export const DEFAULT_USER_CATEGORIES = [
  { name: 'Learning', slug: 'learning', color: '#3b82f6' },
  { name: 'Coding', slug: 'coding', color: '#10b981' },
  { name: 'AI & Tech', slug: 'ai-tech', color: '#8b5cf6' },
  { name: 'Productivity', slug: 'productivity', color: '#f59e0b' },
  { name: 'Inspiration', slug: 'inspiration', color: '#ec4899' },
  { name: 'Ideas', slug: 'ideas', color: '#06b6d4' }
];
