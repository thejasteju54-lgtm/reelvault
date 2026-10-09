import { getDb, runTransaction } from '../db/database.js';
import { generateUuid } from '../utils/crypto.js';
import { parseInstagramUrl, normalizeTags } from '../utils/instagram.js';
import { Reel, CreateReelInput, UpdateReelInput, ReelQueryFilters, VaultStats } from '../../types/index.js';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class DuplicateReelError extends AppError {
  constructor(public existingReelId: string) {
    super('This Reel is already in your vault.', 'DUPLICATE_REEL', 409, { existingReelId });
    this.name = 'DuplicateReelError';
  }
}

interface RawReelRow {
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
  category_name?: string | null;
  category_color?: string | null;
  is_favorite: number;
  is_watched: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
  watched_at: string | null;
  archived_at: string | null;
}

function mapRowToReel(row: RawReelRow, tags: string[] = []): Reel {
  return {
    id: row.id,
    userId: row.user_id,
    instagramUrl: row.instagram_url,
    canonicalUrl: row.canonical_url,
    instagramShortcode: row.instagram_shortcode,
    title: row.title,
    creatorUsername: row.creator_username,
    thumbnailUrl: row.thumbnail_url,
    notes: row.notes,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categoryColor: row.category_color,
    isFavorite: Boolean(row.is_favorite),
    isWatched: Boolean(row.is_watched),
    isArchived: Boolean(row.is_archived),
    tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    watchedAt: row.watched_at,
    archivedAt: row.archived_at
  };
}

function getTagsForReels(reelIds: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (reelIds.length === 0) return map;

  const db = getDb();
  const placeholders = reelIds.map(() => '?').join(',');
  const query = db.prepare(`
    SELECT rt.reel_id, t.name
    FROM reel_tags rt
    JOIN tags t ON rt.tag_id = t.id
    WHERE rt.reel_id IN (${placeholders})
    ORDER BY t.name ASC
  `);

  const rows = query.all(...reelIds) as { reel_id: string; name: string }[];
  for (const row of rows) {
    const list = map.get(row.reel_id) || [];
    list.push(row.name);
    map.set(row.reel_id, list);
  }

  return map;
}

export function saveReel(userId: string, input: CreateReelInput): Reel {
  const parsed = parseInstagramUrl(input.url);
  if (!parsed.isValid || !parsed.shortcode || !parsed.canonicalUrl) {
    throw new AppError(parsed.error || 'Invalid Instagram Reel URL.', 'INVALID_INSTAGRAM_URL', 400);
  }

  const db = getDb();

  // Pre-check for duplicate reel for this specific user
  const duplicateCheck = db.prepare(`
    SELECT id FROM reels WHERE user_id = ? AND instagram_shortcode = ?
  `);
  const existing = duplicateCheck.get(userId, parsed.shortcode) as { id: string } | undefined;
  if (existing) {
    throw new DuplicateReelError(existing.id);
  }

  const reelId = generateUuid();
  const cleanTags = normalizeTags(input.tags);
  const cleanTitle = input.title?.trim() || null;
  const cleanNotes = input.notes?.trim() || null;
  const categoryId = input.categoryId?.trim() || null;

  return runTransaction((txDb) => {
    try {
      const insertStmt = txDb.prepare(`
        INSERT INTO reels (
          id, user_id, instagram_url, canonical_url, instagram_shortcode,
          title, notes, category_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        reelId,
        userId,
        input.url.trim(),
        parsed.canonicalUrl!,
        parsed.shortcode!,
        cleanTitle,
        cleanNotes,
        categoryId
      );
    } catch (err: unknown) {
      // Catch race-condition duplicate constraint violation
      const errorMsg = String(err);
      if (errorMsg.includes('UNIQUE constraint') || errorMsg.includes('uq_user_reel_shortcode')) {
        const existingRow = duplicateCheck.get(userId, parsed.shortcode!) as { id: string } | undefined;
        throw new DuplicateReelError(existingRow ? existingRow.id : reelId);
      }
      throw err;
    }

    // Insert and associate tags
    const findTagStmt = txDb.prepare('SELECT id FROM tags WHERE user_id = ? AND name = ?');
    const insertTagStmt = txDb.prepare('INSERT OR IGNORE INTO tags (id, user_id, name) VALUES (?, ?, ?)');
    const linkStmt = txDb.prepare('INSERT OR IGNORE INTO reel_tags (reel_id, tag_id) VALUES (?, ?)');

    for (const tag of cleanTags) {
      const tagId = generateUuid();
      insertTagStmt.run(tagId, userId, tag);
      const tagRow = findTagStmt.get(userId, tag) as { id: string } | undefined;
      if (tagRow) {
        linkStmt.run(reelId, tagRow.id);
      }
    }

    return getReelById(userId, reelId)!;
  });
}

export function getReels(userId: string, filters: ReelQueryFilters = {}): {
  reels: Reel[];
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
} {
  const db = getDb();
  const conditions: string[] = ['r.user_id = ?'];
  const params: (string | number)[] = [userId];

  // Archived filter (defaults to false)
  if (filters.archived === true) {
    conditions.push('r.is_archived = 1');
  } else {
    conditions.push('r.is_archived = 0');
  }

  // Favorite filter
  if (filters.favorite === true) {
    conditions.push('r.is_favorite = 1');
  }

  // Watched / Unwatched filter
  if (filters.status === 'watched') {
    conditions.push('r.is_watched = 1');
  } else if (filters.status === 'unwatched') {
    conditions.push('r.is_watched = 0');
  }

  // Category filter
  if (filters.categoryId) {
    conditions.push('r.category_id = ?');
    params.push(filters.categoryId);
  }

  // Tag filter
  if (filters.tag) {
    const cleanTag = filters.tag.trim().toLowerCase().replace(/^#+/, '');
    conditions.push(`
      EXISTS (
        SELECT 1 FROM reel_tags rt
        JOIN tags t ON rt.tag_id = t.id
        WHERE rt.reel_id = r.id AND t.name = ?
      )
    `);
    params.push(cleanTag);
  }

  // Multi-field search
  if (filters.q && filters.q.trim().length > 0) {
    const searchTerm = `%${filters.q.trim()}%`;
    conditions.push(`(
      r.title LIKE ? OR
      r.notes LIKE ? OR
      r.creator_username LIKE ? OR
      r.instagram_url LIKE ? OR
      EXISTS (
        SELECT 1 FROM reel_tags rt
        JOIN tags t ON rt.tag_id = t.id
        WHERE rt.reel_id = r.id AND t.name LIKE ?
      )
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Cursor pagination
  if (filters.cursor) {
    conditions.push('r.created_at < ?');
    params.push(filters.cursor);
  }

  // Sorting
  let orderBy = 'r.created_at DESC';
  if (filters.sort === 'oldest') {
    orderBy = 'r.created_at ASC';
  } else if (filters.sort === 'updated') {
    orderBy = 'r.updated_at DESC';
  } else if (filters.sort === 'alphabetical') {
    orderBy = 'COALESCE(r.title, r.canonical_url) ASC';
  }

  const whereClause = conditions.join(' AND ');
  const limit = Math.min(Math.max(Number(filters.limit) || 30, 1), 100);

  // Get total matching count
  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM reels r WHERE ${whereClause}`);
  const countRow = countStmt.get(...params) as unknown as { count: number } | undefined;
  const total = countRow?.count ?? 0;

  // Get paginated rows
  const queryStmt = db.prepare(`
    SELECT
      r.*,
      c.name AS category_name,
      c.color AS category_color
    FROM reels r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ?
  `);

  const rows = queryStmt.all(...params, limit) as unknown as RawReelRow[];
  const reelIds = rows.map((r) => r.id);
  const tagMap = getTagsForReels(reelIds);

  const reels = rows.map((row) => mapRowToReel(row, tagMap.get(row.id) || []));

  const hasMore = reels.length === limit;
  const nextCursor = hasMore && reels.length > 0 ? reels[reels.length - 1].createdAt : null;

  return {
    reels,
    total,
    nextCursor,
    hasMore
  };
}

export function getReelById(userId: string, reelId: string): Reel | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      r.*,
      c.name AS category_name,
      c.color AS category_color
    FROM reels r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.id = ? AND r.user_id = ?
  `);

  const row = stmt.get(reelId, userId) as RawReelRow | undefined;
  if (!row) return null;

  const tagMap = getTagsForReels([reelId]);
  return mapRowToReel(row, tagMap.get(reelId) || []);
}

export function updateReel(userId: string, reelId: string, input: UpdateReelInput): Reel {
  const existing = getReelById(userId, reelId);
  if (!existing) {
    throw new AppError('Reel not found.', 'NOT_FOUND', 404);
  }

  return runTransaction((txDb) => {
    const updateStmt = txDb.prepare(`
      UPDATE reels
      SET
        title = COALESCE(?, title),
        notes = ?,
        category_id = ?,
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `);

    updateStmt.run(
      input.title !== undefined ? input.title.trim() || null : existing.title,
      input.notes !== undefined ? input.notes.trim() || null : existing.notes,
      input.categoryId !== undefined ? input.categoryId : existing.categoryId,
      reelId,
      userId
    );

    // Update tags if provided
    if (input.tags !== undefined) {
      const cleanTags = normalizeTags(input.tags);
      // Remove existing links
      txDb.prepare('DELETE FROM reel_tags WHERE reel_id = ?').run(reelId);

      const findTagStmt = txDb.prepare('SELECT id FROM tags WHERE user_id = ? AND name = ?');
      const insertTagStmt = txDb.prepare('INSERT OR IGNORE INTO tags (id, user_id, name) VALUES (?, ?, ?)');
      const linkStmt = txDb.prepare('INSERT OR IGNORE INTO reel_tags (reel_id, tag_id) VALUES (?, ?)');

      for (const tag of cleanTags) {
        insertTagStmt.run(generateUuid(), userId, tag);
        const tagRow = findTagStmt.get(userId, tag) as { id: string } | undefined;
        if (tagRow) {
          linkStmt.run(reelId, tagRow.id);
        }
      }
    }

    return getReelById(userId, reelId)!;
  });
}

export function toggleFavorite(userId: string, reelId: string): Reel {
  const existing = getReelById(userId, reelId);
  if (!existing) {
    throw new AppError('Reel not found.', 'NOT_FOUND', 404);
  }

  const nextVal = existing.isFavorite ? 0 : 1;
  const db = getDb();
  db.prepare(`
    UPDATE reels
    SET is_favorite = ?, updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(nextVal, reelId, userId);

  return getReelById(userId, reelId)!;
}

export function toggleWatched(userId: string, reelId: string): Reel {
  const existing = getReelById(userId, reelId);
  if (!existing) {
    throw new AppError('Reel not found.', 'NOT_FOUND', 404);
  }

  const nextVal = existing.isWatched ? 0 : 1;
  const watchedAt = nextVal === 1 ? "datetime('now')" : 'NULL';
  const db = getDb();
  db.prepare(`
    UPDATE reels
    SET is_watched = ?, watched_at = ${watchedAt}, updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(nextVal, reelId, userId);

  return getReelById(userId, reelId)!;
}

export function toggleArchive(userId: string, reelId: string): Reel {
  const existing = getReelById(userId, reelId);
  if (!existing) {
    throw new AppError('Reel not found.', 'NOT_FOUND', 404);
  }

  const nextVal = existing.isArchived ? 0 : 1;
  const archivedAt = nextVal === 1 ? "datetime('now')" : 'NULL';
  const db = getDb();
  db.prepare(`
    UPDATE reels
    SET is_archived = ?, archived_at = ${archivedAt}, updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(nextVal, reelId, userId);

  return getReelById(userId, reelId)!;
}

export function deleteReel(userId: string, reelId: string): boolean {
  const existing = getReelById(userId, reelId);
  if (!existing) {
    throw new AppError('Reel not found.', 'NOT_FOUND', 404);
  }

  const db = getDb();
  db.prepare('DELETE FROM reels WHERE id = ? AND user_id = ?').run(reelId, userId);
  return true;
}

export function getVaultStats(userId: string): VaultStats {
  const db = getDb();
  const summaryStmt = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN is_watched = 1 AND is_archived = 0 THEN 1 ELSE 0 END) AS watched,
      SUM(CASE WHEN is_watched = 0 AND is_archived = 0 THEN 1 ELSE 0 END) AS unwatched,
      SUM(CASE WHEN is_favorite = 1 AND is_archived = 0 THEN 1 ELSE 0 END) AS favorites,
      SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) AS archived
    FROM reels
    WHERE user_id = ?
  `);

  const summary = (summaryStmt.get(userId) as {
    total: number;
    watched: number | null;
    unwatched: number | null;
    favorites: number | null;
    archived: number | null;
  } | undefined) || {
    total: 0,
    watched: 0,
    unwatched: 0,
    favorites: 0,
    archived: 0
  };

  const topTagsStmt = db.prepare(`
    SELECT t.name, COUNT(rt.reel_id) AS count
    FROM tags t
    JOIN reel_tags rt ON t.id = rt.tag_id
    JOIN reels r ON rt.reel_id = r.id
    WHERE t.user_id = ? AND r.is_archived = 0
    GROUP BY t.id
    ORDER BY count DESC
    LIMIT 8
  `);

  const topTags = topTagsStmt.all(userId) as { name: string; count: number }[];

  return {
    total: summary.total || 0,
    watched: summary.watched || 0,
    unwatched: summary.unwatched || 0,
    favorites: summary.favorites || 0,
    archived: summary.archived || 0,
    topTags: topTags || []
  };
}

export function exportVaultData(userId: string, format: 'json' | 'csv' = 'json'): string {
  const db = getDb();
  const query = db.prepare(`
    SELECT
      r.id, r.canonical_url, r.title, r.creator_username, r.notes,
      c.name AS category_name,
      r.is_favorite, r.is_watched, r.is_archived,
      r.created_at
    FROM reels r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `);

  const rows = query.all(userId) as unknown as (RawReelRow & { category_name: string | null })[];
  const tagMap = getTagsForReels(rows.map((r) => r.id));

  const items = rows.map((r) => ({
    url: r.canonical_url,
    title: r.title || '',
    creator: r.creator_username || '',
    category: r.category_name || '',
    tags: (tagMap.get(r.id) || []).join('; '),
    notes: r.notes || '',
    isFavorite: Boolean(r.is_favorite),
    isWatched: Boolean(r.is_watched),
    isArchived: Boolean(r.is_archived),
    savedAt: r.created_at
  }));

  if (format === 'csv') {
    const headers = ['URL', 'Title', 'Creator', 'Category', 'Tags', 'Notes', 'Favorite', 'Watched', 'Archived', 'SavedAt'];
    const csvLines = [headers.join(',')];
    for (const item of items) {
      const escape = (val: unknown) => `"${String(val).replace(/"/g, '""')}"`;
      csvLines.push([
        escape(item.url),
        escape(item.title),
        escape(item.creator),
        escape(item.category),
        escape(item.tags),
        escape(item.notes),
        item.isFavorite,
        item.isWatched,
        item.isArchived,
        escape(item.savedAt)
      ].join(','));
    }
    return csvLines.join('\n');
  }

  return JSON.stringify(items, null, 2);
}
