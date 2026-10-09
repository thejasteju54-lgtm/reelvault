import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from './schema.js';

let dbInstance: DatabaseSync | null = null;

export interface DatabaseConfig {
  dbPath?: string;
}

export function initDatabase(config: DatabaseConfig = {}): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const defaultPath = process.env.VERCEL ? '/tmp/reelvault.sqlite' : './data/reelvault.sqlite';
  const dbPath = config.dbPath || process.env.DATABASE_PATH || defaultPath;

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
        // Ignored if directory already exists or created concurrently
      }
    }
  }

  const db = new DatabaseSync(dbPath);

  // Configure SQLite for high performance and integrity
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    if (dbPath !== ':memory:' && !process.env.VERCEL) {
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA synchronous = NORMAL;');
    }
  } catch (pragmaErr) {
    console.warn('SQLite PRAGMA warning:', pragmaErr);
  }

  // Execute schema creation
  db.exec(SCHEMA_SQL);

  dbInstance = db;
  return db;
}

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

/**
 * Runs a block of code inside a SQLite immediate transaction.
 * Rolls back automatically if an exception is thrown.
 */
export function runTransaction<T>(operation: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE;');
  try {
    const result = operation(db);
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
