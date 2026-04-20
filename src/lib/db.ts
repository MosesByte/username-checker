import { getCloudflareContext } from "@opennextjs/cloudflare";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

let tablesReady = false;

export async function getDb(): Promise<D1Database> {
  const { env } = getCloudflareContext();
  const db = env.DB;
  if (!tablesReady) {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );
    await db.exec(
      `CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        username TEXT NOT NULL,
        url TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );
    await db.exec(
      `CREATE TABLE IF NOT EXISTS username_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        platform TEXT NOT NULL,
        username TEXT NOT NULL,
        result TEXT NOT NULL,
        checked_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );
    tablesReady = true;
  }
  return db;
}
