import { getDb } from '../db/database.js';
import { generateUuid } from '../utils/crypto.js';
import { Category } from '../../types/index.js';
import { AppError } from './reels.service.js';

export function getCategories(userId: string): Category[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      c.id, c.user_id, c.name, c.slug, c.color, c.created_at,
      COUNT(r.id) AS count
    FROM categories c
    LEFT JOIN reels r ON c.id = r.category_id AND r.is_archived = 0
    WHERE c.user_id = ?
    GROUP BY c.id
    ORDER BY c.name ASC
  `);

  const rows = stmt.all(userId) as {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    color: string;
    created_at: string;
    count: number;
  }[];

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    slug: r.slug,
    color: r.color,
    count: r.count,
    createdAt: r.created_at
  }));
}

export function createCategory(userId: string, name: string, color?: string): Category {
  const cleanName = name.trim();
  if (!cleanName || cleanName.length > 50) {
    throw new AppError('Category name must be between 1 and 50 characters.', 'VALIDATION_ERROR', 400);
  }

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const id = generateUuid();
  const cleanColor = color?.trim() || '#6366f1';
  const db = getDb();

  try {
    db.prepare(`
      INSERT INTO categories (id, user_id, name, slug, color)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, cleanName, slug, cleanColor);
  } catch (err: unknown) {
    if (String(err).includes('UNIQUE constraint')) {
      throw new AppError('A category with this name already exists.', 'DUPLICATE_CATEGORY', 409);
    }
    throw err;
  }

  return {
    id,
    userId,
    name: cleanName,
    slug,
    color: cleanColor,
    count: 0,
    createdAt: new Date().toISOString()
  };
}

export function deleteCategory(userId: string, categoryId: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(categoryId, userId);
  return res.changes > 0;
}
