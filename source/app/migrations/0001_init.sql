-- D1 schema for Sal Marinho. Applied by the platform on deploy
-- (app.manifest.json sets "db": true). Additive only: CREATE ... IF NOT EXISTS
-- and ADD COLUMN. A destructive change here hits live production data.

CREATE TABLE IF NOT EXISTS menu_categories (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT 'volcanic',
  image TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'wave',
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER,
  category TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT '',
  influence TEXT NOT NULL DEFAULT '',
  ingredients TEXT NOT NULL DEFAULT '[]',
  technique TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]',
  dietary TEXT NOT NULL DEFAULT '[]',
  spice_level INTEGER NOT NULL DEFAULT 0,
  chef_recommendation INTEGER NOT NULL DEFAULT 0,
  pairing TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS dishes_category_idx ON dishes (category, sort);

CREATE TABLE IF NOT EXISTS journal_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  cover TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS journal_published_idx ON journal_posts (published, published_at);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  request TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS reservations_created_idx ON reservations (created_at);
CREATE INDEX IF NOT EXISTS reservations_ip_idx ON reservations (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS login_attempts_idx ON login_attempts (ip_hash, created_at);
