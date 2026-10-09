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

  const dbPath = config.dbPath || process.env.DATABASE_PATH || './data/reelvault.sqlite';

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Configure SQLite for high performance and integrity
  db.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
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
