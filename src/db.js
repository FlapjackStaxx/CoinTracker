import fs from 'node:fs';
import path from 'node:path';
import { Low } from 'lowdb';
import { JSONFile, Memory } from 'lowdb/node';

const DEFAULT_DB_FILENAME = 'cointracker.json';
const DEFAULT_DATA = { items: [], nextId: 1 };

function resolvePath(dbPath) {
  if (!dbPath || dbPath === ':memory:') {
    return dbPath ?? ':memory:';
  }
  if (path.isAbsolute(dbPath)) {
    return dbPath;
  }
  return path.join(process.cwd(), dbPath);
}

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

export async function createDatabase(options = {}) {
  const normalized =
    typeof options === 'string'
      ? { dbPath: options }
      : options;

  const {
    dbPath = process.env.COINTRACKER_DB_PATH || DEFAULT_DB_FILENAME,
    adapter
  } = normalized;

  if (adapter) {
    const db = new Low(adapter, cloneDefaultData());
    await db.read();
    db.data ||= cloneDefaultData();
    if (!Array.isArray(db.data.items)) {
      db.data.items = [];
    }
    if (typeof db.data.nextId !== 'number') {
      db.data.nextId = 1;
    }
    return db;
  }

  const resolved = resolvePath(dbPath);
  let dbAdapter;
  if (resolved === ':memory:') {
    dbAdapter = new Memory();
  } else {
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    dbAdapter = new JSONFile(resolved);
  }

  const db = new Low(dbAdapter, cloneDefaultData());
  await db.read();
  db.data ||= cloneDefaultData();
  if (!Array.isArray(db.data.items)) {
    db.data.items = [];
  }
  if (typeof db.data.nextId !== 'number') {
    db.data.nextId = 1;
  }
  await db.write();
  return db;
}
