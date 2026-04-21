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
    await db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))").run();
    await ensureColumn(db, "users", "username", "TEXT");
    await ensureColumn(db, "users", "name", "TEXT");
    await ensureColumn(db, "users", "role", "TEXT NOT NULL DEFAULT 'user'");
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)").run();
    await db.prepare("CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, platform TEXT NOT NULL, username TEXT NOT NULL, url TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))").run();
    await db.prepare("CREATE TABLE IF NOT EXISTS username_checks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, platform TEXT NOT NULL, username TEXT NOT NULL, result TEXT NOT NULL, checked_at TEXT NOT NULL DEFAULT (datetime('now')))").run();
    await db.prepare("CREATE TABLE IF NOT EXISTS invite_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, used_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), used_at TEXT)").run();
    tablesReady = true;
  }
  return db;
}

async function ensureColumn(
  db: D1Database,
  table: string,
  column: string,
  definition: string
) {
  const { results } = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  if (results.some((entry) => entry.name === column)) return;

  await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
}
