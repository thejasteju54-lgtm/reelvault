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

  const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.VERCEL_URL ||
    process.env.NOW_REGION
  );

  let dbPath = config.dbPath || process.env.DATABASE_PATH;
  if (isVercel) {
    dbPath = (dbPath === ':memory:') ? ':memory:' : '/tmp/reelvault.sqlite';
  } else if (!dbPath) {
    dbPath = './data/reelvault.sqlite';
  }

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

  let db: DatabaseSync;
  try {
    db = new DatabaseSync(dbPath);
  } catch (err) {
    console.warn(`[ReelVault DB] Failed to initialize SQLite at '${dbPath}', falling back to ':memory:':`, err);
    db = new DatabaseSync(':memory:');
    dbPath = ':memory:';
  }

  // Configure SQLite for high performance and integrity
  try {
    db.exec('PRAGMA foreign_keys = ON;');
    if (dbPath !== ':memory:' && !isVercel) {
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
