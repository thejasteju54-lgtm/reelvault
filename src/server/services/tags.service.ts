import { getDb } from '../db/database.js';
import { Tag } from '../../types/index.js';

export function getTags(userId: string): Tag[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      t.id, t.user_id, t.name, t.created_at,
      COUNT(rt.reel_id) AS count
    FROM tags t
    LEFT JOIN reel_tags rt ON t.id = rt.tag_id
    LEFT JOIN reels r ON rt.reel_id = r.id AND r.is_archived = 0
    WHERE t.user_id = ?
    GROUP BY t.id
    ORDER BY count DESC, t.name ASC
  `);

  const rows = stmt.all(userId) as {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    count: number;
  }[];

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    count: r.count,
    createdAt: r.created_at
  }));
}

export function deleteTag(userId: string, tagId: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').run(tagId, userId);
  return res.changes > 0;
}
