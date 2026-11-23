-- How to reach a couple, given on the editor's "Your website is live" panel (optional). email gets their edit link,
-- a daily note of new replies and a reminder before the site is deleted. phone (WhatsApp) is only stored for now.
-- marketing is 1 only if they ticked "send me new designs and offers": that row outlives the site, any other goes with it.
-- notified: replies up to this time are already in a sent note. reminded: the deletion reminder went out.
-- sent: edit-link emails sent, capped so one edit key can't be used to mail strangers.
CREATE TABLE contacts (slug TEXT PRIMARY KEY, email TEXT NOT NULL, phone TEXT NOT NULL, marketing INTEGER NOT NULL, at INTEGER NOT NULL, notified INTEGER NOT NULL, reminded INTEGER NOT NULL DEFAULT 0, sent INTEGER NOT NULL DEFAULT 0);
