# DATABASE SPECIFICATION: ReelVault

## 1. Relational Schema Design

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                       -- UUID v4
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,                       -- UUID v4
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, slug)
);

-- 3. Reels Table
CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY,                       -- UUID v4
    user_id TEXT NOT NULL,
    instagram_url TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    instagram_shortcode TEXT NOT NULL,
    title TEXT,
    creator_username TEXT,
    thumbnail_url TEXT,
    notes TEXT,
    category_id TEXT,
    is_favorite INTEGER DEFAULT 0,            -- Boolean 0 or 1
    is_watched INTEGER DEFAULT 0,             -- Boolean 0 or 1
    is_archived INTEGER DEFAULT 0,            -- Boolean 0 or 1
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    watched_at DATETIME,
    archived_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_reel_shortcode UNIQUE (user_id, instagram_shortcode)
);

-- 4. Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,                       -- UUID v4
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,                       -- Clean normalized tag (e.g., 'python')
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, name)
);

-- 5. Reel-Tags Join Table
CREATE TABLE IF NOT EXISTS reel_tags (
    reel_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reel_id, tag_id),
    FOREIGN KEY (reel_id) REFERENCES reels(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## 2. Performance Indexing

To guarantee sub-millisecond query execution even with tens of thousands of saved reels:

```sql
-- User and Shortcode lookup for duplicate prevention
CREATE INDEX IF NOT EXISTS idx_reels_user_shortcode ON reels (user_id, instagram_shortcode);

-- User-scoped filtering and sorting queries
CREATE INDEX IF NOT EXISTS idx_reels_user_created ON reels (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_archived ON reels (user_id, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_favorites ON reels (user_id, is_favorite, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_watched ON reels (user_id, is_watched, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_user_category ON reels (user_id, category_id, is_archived);

-- Tag lookups
CREATE INDEX IF NOT EXISTS idx_reel_tags_reel ON reel_tags (reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_tags_tag ON reel_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_name ON tags (user_id, name);
```

## 3. Transactions & ACID Guarantees
- **Reel Creation Transaction:**
  1. Insert into `reels`.
  2. For each provided tag:
     - `INSERT OR IGNORE INTO tags (id, user_id, name) VALUES (...)`.
     - `SELECT id FROM tags WHERE user_id = ... AND name = ...`.
     - `INSERT OR IGNORE INTO reel_tags (reel_id, tag_id) VALUES (...)`.
  3. Commit transaction. If any step fails or violates `UNIQUE(user_id, instagram_shortcode)`, rollback completely.

- **Reel Deletion:**
  - Cascades delete automatically to `reel_tags`.
  - Optionally cleans up orphaned tags belonging to the user.
