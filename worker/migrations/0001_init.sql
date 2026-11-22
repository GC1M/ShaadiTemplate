-- Couples' wedding websites. data is {"look": "<design id>", "content": {...}} (src/site/designs.ts Content).
-- Only a SHA-256 of the edit key is kept. ip is a salted hash, used only for rate limits.
CREATE TABLE sites (slug TEXT PRIMARY KEY, data TEXT NOT NULL, key_hash TEXT NOT NULL, ip TEXT NOT NULL, created INTEGER NOT NULL, updated INTEGER NOT NULL, hidden INTEGER NOT NULL DEFAULT 0);
CREATE INDEX sites_ip ON sites (ip, created);

CREATE TABLE blessings (id INTEGER PRIMARY KEY, slug TEXT NOT NULL, name TEXT NOT NULL, text TEXT NOT NULL, ip TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX blessings_slug ON blessings (slug, at);

CREATE TABLE rsvps (id INTEGER PRIMARY KEY, slug TEXT NOT NULL, data TEXT NOT NULL, ip TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX rsvps_slug ON rsvps (slug, at);

-- "Report this site". Read them in the D1 console; to take a site down: UPDATE sites SET hidden = 1 WHERE slug = '...'.
CREATE TABLE reports (id INTEGER PRIMARY KEY, slug TEXT NOT NULL, reason TEXT NOT NULL, ip TEXT NOT NULL, at INTEGER NOT NULL);
