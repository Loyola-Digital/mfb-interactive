import { DatabaseSync } from 'node:sqlite';

export type Db = DatabaseSync;

export function openDb(path: string): Db {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'family' CHECK (role IN ('family', 'admin'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress_events (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      mission_id TEXT,
      attempt_id TEXT,
      at INTEGER NOT NULL,
      received_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS progress_events_user ON progress_events(user_id);
    -- Links de acesso: só o hash do token fica guardado; cada link vale uma vez, até expirar ou ser cancelado.
    CREATE TABLE IF NOT EXISTS invites (
      id INTEGER PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('invite', 'reset')),
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      revoked_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS invites_email ON invites(email);
  `);
  // Bancos criados antes dos acertos de prova, da escolha de apostila e dos papéis.
  const cols = (table: string) => (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);
  if (!cols('progress_events').includes('data')) db.exec('ALTER TABLE progress_events ADD COLUMN data TEXT');
  if (!cols('users').includes('role')) db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'family' CHECK (role IN ('family', 'admin'))");
  return db;
}
