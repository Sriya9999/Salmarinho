-- Sal Marinho Events: enquiries from the Events page, read in /admin.
CREATE TABLE IF NOT EXISTS event_enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  guests INTEGER NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  ip_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS event_enquiries_created_idx ON event_enquiries (created_at);
CREATE INDEX IF NOT EXISTS event_enquiries_ip_idx ON event_enquiries (ip_hash, created_at);

-- The restaurant is in a garden in Anjuna, not on the beach: keep the journal from implying otherwise.
UPDATE journal_posts
SET body = REPLACE(body, 'By the sea, days keep a different time.', 'On this coast, days keep a different time.')
WHERE id = 'post-no-clock';
