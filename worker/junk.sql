-- Sites that look like someone trying the editor rather than a real wedding. Read only: it lists, it deletes nothing.
--   npx wrangler d1 execute shaaditemplate-sites --remote --file junk.sql
-- A site is listed when it still has a design's sample couple (the editor blocks that since late November 2026), or
-- when nobody can be reached about it and no guest has replied or blessed it. Look at each one (shaaditemplate.com/w/<slug>)
-- before marking it. To delete, mark it and the next daily run removes it with its photos, RSVPs and blessings:
--   npx wrangler d1 execute shaaditemplate-sites --remote --command "UPDATE sites SET hidden = 2 WHERE slug IN ('a-b-7qrn', '...')"
-- sample: the demo couples in src/site/designs.ts; add a pair here when a design is added.
WITH sample(a, b) AS (VALUES ('Aditi','Vihaan'),('Krupa','Nirav'),('Ishita','Aarav'),('Tara','Shaurya'),('Ananya','Arjun'),('Simran','Harjot'),('Meenakshi','Karthik'),('Ria','Joel'),('Zoya','Kabir'),('Kavya','Rohan'),('Mrinalini','Advait'),('Naina','Dev'))
SELECT * FROM (
  SELECT
    s.slug,
    date(s.created / 1000, 'unixepoch') AS created,
    json_extract(s.data, '$.content.couple[0]') || ' & ' || json_extract(s.data, '$.content.couple[1]') AS couple,
    EXISTS (SELECT 1 FROM sample WHERE a = json_extract(s.data, '$.content.couple[0]') AND b = json_extract(s.data, '$.content.couple[1]')) AS sample_names,
    EXISTS (SELECT 1 FROM contacts c WHERE c.slug = s.slug AND (c.email != '' OR c.phone != '')) AS contact,
    (SELECT COUNT(*) FROM rsvps r WHERE r.slug = s.slug) AS rsvps,
    (SELECT COUNT(*) FROM blessings b WHERE b.slug = s.slug) AS blessings,
    s.source,
    s.heard
  FROM sites s
  WHERE s.hidden = 0
)
WHERE sample_names OR (contact = 0 AND rsvps = 0 AND blessings = 0)
ORDER BY sample_names DESC, created;
