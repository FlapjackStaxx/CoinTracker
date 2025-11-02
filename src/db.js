import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DB_FILENAME = 'cointracker.db';

function resolvePath(dbPath) {
  if (!dbPath || dbPath === ':memory:') {
    return dbPath ?? ':memory:';
  }
  if (path.isAbsolute(dbPath)) {
    return dbPath;
  }
  return path.join(process.cwd(), dbPath);
}

export function createDatabase(dbPath = process.env.COINTRACKER_DB_PATH || DEFAULT_DB_FILENAME) {
  const resolved = resolvePath(dbPath);
  if (resolved !== ':memory:') {
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
  }

  const db = new Database(resolved);
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS currency_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      denomination TEXT NOT NULL,
      year INTEGER,
      catalog_reference TEXT,
      description TEXT,
      estimated_value REAL,
      market_value REAL,
      status TEXT NOT NULL DEFAULT 'owned',
      notes TEXT,
      image_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}
