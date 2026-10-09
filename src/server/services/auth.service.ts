import jwt from 'jsonwebtoken';
import { getDb, runTransaction } from '../db/database.js';
import { DEFAULT_USER_CATEGORIES } from '../db/schema.js';
import { hashPassword, verifyPassword, generateUuid } from '../utils/crypto.js';
import { User, AuthResponseData } from '../../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'reelvault_dev_secret_key_minimum_32_characters_long_123';
const TOKEN_EXPIRY = '7d';

export class AuthError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
  }
}

export function signToken(user: { id: string; email: string }): string {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY
  });
}

export function verifyToken(token: string): { userId: string; email: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    throw new AuthError('Invalid or expired token.', 'UNAUTHORIZED', 401);
  }
}

export function registerUser(email: string, password: string, displayName?: string): AuthResponseData {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password || password.length < 6) {
    throw new AuthError('Valid email and password (minimum 6 characters) are required.', 'VALIDATION_ERROR', 400);
  }

  // Check existing user
  const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const existing = checkStmt.get(normalizedEmail);
  if (existing) {
    throw new AuthError('An account with this email already exists.', 'EMAIL_EXISTS', 409);
  }

  const userId = generateUuid();
  const passwordHash = hashPassword(password);
  const cleanDisplayName = displayName?.trim() || normalizedEmail.split('@')[0];

  return runTransaction((transactionDb) => {
    const insertUser = transactionDb.prepare(`
      INSERT INTO users (id, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run(userId, normalizedEmail, passwordHash, cleanDisplayName);

    // Seed default starter categories
    const insertCat = transactionDb.prepare(`
      INSERT INTO categories (id, user_id, name, slug, color)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const cat of DEFAULT_USER_CATEGORIES) {
      insertCat.run(generateUuid(), userId, cat.name, cat.slug, cat.color);
    }

    const token = signToken({ id: userId, email: normalizedEmail });
    return {
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        displayName: cleanDisplayName
      }
    };
  });
}

export function loginUser(email: string, password: string): AuthResponseData {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  const userStmt = db.prepare('SELECT id, email, password_hash, display_name FROM users WHERE email = ?');
  const user = userStmt.get(normalizedEmail) as {
    id: string;
    email: string;
    password_hash: string;
    display_name: string | null;
  } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  const token = signToken({ id: user.id, email: user.email });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name
    }
  };
}

export function getUserById(userId: string): User | null {
  const db = getDb();
  const stmt = db.prepare('SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = ?');
  const row = stmt.get(userId) as {
    id: string;
    email: string;
    display_name: string | null;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function ensureUserExists(userId: string, email: string): void {
  const db = getDb();
  try {
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existing) {
      const cleanDisplayName = email.split('@')[0];
      db.prepare(`
        INSERT OR IGNORE INTO users (id, email, password_hash, display_name)
        VALUES (?, ?, 'serverless_session_hash', ?)
      `).run(userId, email, cleanDisplayName);

      // Seed starter categories for this user
      const insertCat = db.prepare(`
        INSERT OR IGNORE INTO categories (id, user_id, name, slug, color)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const cat of DEFAULT_USER_CATEGORIES) {
        insertCat.run(generateUuid(), userId, cat.name, cat.slug, cat.color);
      }
    }
  } catch (err) {
    console.warn('ensureUserExists warning:', err);
  }
}
