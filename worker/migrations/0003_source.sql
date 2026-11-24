-- Where a couple came from, for the owner's analytics dashboard. source: first-touch utm_source or referring site
-- ("direct" when neither), kept by the browser from its first visit. heard: their own answer to "How did you find us?".
-- Both may be ''. They go with the site when it is deleted.
ALTER TABLE sites ADD COLUMN source TEXT NOT NULL DEFAULT '';
ALTER TABLE sites ADD COLUMN heard TEXT NOT NULL DEFAULT '';
