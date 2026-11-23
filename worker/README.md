# Wedding websites API

A Cloudflare Worker that stores couples' wedding websites (D1), their photos (R2), guests' RSVPs and blessings, and "report this site" reports. The main site stays on GitHub Pages; the app calls this Worker on its `workers.dev` address, so no DNS change is needed. Everything here fits Cloudflare's free tier (Workers 100k requests a day, D1 500 MB per database and 100k writes a day, R2 10 GB).

Why D1 and not KV: KV's free tier allows 1,000 writes a day across the whole account, which one busy wedding's RSVPs would use up. D1 allows 100k.

## Run it locally

```bash
npm --prefix worker install
npm --prefix worker run dev      # applies migrations to a local D1, serves http://localhost:8787
npm run dev                      # in another terminal; the app talks to :8787 in dev
node worker/smoke.mjs            # end-to-end check of every endpoint
```

Local data lives in `worker/.wrangler/state`. Delete that folder to start clean (the smoke test publishes one site per run, and one connection may publish 5 sites a day).

## Put it live (one time)

Done on 22 November 2026: the Worker is at `https://shaaditemplate-sites.shaaditemplate-sites.workers.dev`, with its database in the Asia-Pacific region. The steps are kept for a fresh account.

Run these from the `worker/` folder.

1. Create a free Cloudflare account and log in: `npx wrangler login`.
2. Create the database: `npx wrangler d1 create shaaditemplate-sites --location apac` (close to guests in India), and paste the `database_id` it prints into `worker/wrangler.toml`.
3. Turn on R2 in the dashboard (R2 Object Storage, then Enable; Cloudflare asks for a card even on the free plan), then create the bucket: `npx wrangler r2 bucket create shaaditemplate-photos`.
4. Set a secret salt for the IP hashes used in rate limits: `npx wrangler secret put IP_SALT` (any long random string).
5. Deploy: `npm run deploy` (applies migrations to the live D1, then deploys). It prints the address, like `https://shaaditemplate-sites.<your-subdomain>.workers.dev`.
6. Put that address in `.env.production` as `VITE_SITES_API=...` and push, so the next GitHub Pages build points the app at it. Until then the "Make yours free" buttons stay hidden.

Run step 5 again after changing anything in `worker/`.

## Couples' contact details and emails

After publishing, the editor asks (optionally) for an email and a WhatsApp number, with a separate unticked box for news of new designs. They land in the `contacts` table. An email gets:

- the edit link, as soon as it is saved (at most 5 such emails per site, so an edit key can't be used to mail strangers);
- a daily note of new RSVPs and blessings (the 3 am cron);
- one reminder 7 days before the site is deleted.

WhatsApp numbers are only stored; nothing sends to them yet. When a site is deleted its contact goes too, unless they ticked the news box.

Email goes out through [Resend](https://resend.com) (free: 3,000 a month, 100 a day). One-time setup:

1. Create a Resend account, add the domain `shaaditemplate.com`, and add the DNS records it shows at the domain's DNS host. Wait until Resend says the domain is verified.
2. Create an API key with "Sending access" and store it: `npx wrangler secret put RESEND_API_KEY`.
3. The sender is `MAIL_FROM` in `wrangler.toml` (`hello@shaaditemplate.com`); change it if you like.

Until the key is set nothing is sent: contacts are still saved and the editor says the email could not be sent. People who asked for news:

```sql
SELECT email, phone, datetime(at / 1000, 'unixepoch') FROM contacts WHERE marketing = 1;
```

## Sites are deleted 30 days after their last event

A daily Cron Trigger (`wrangler.toml`, 3 am India time) deletes every site whose latest event date is more than 30 days ago, with its photos, RSVPs and blessings (`expire()` in `src/index.ts`, up to 50 sites a run). The editor shows couples the date and lets them download their guest replies as a spreadsheet. This keeps photo storage inside the free 10 GB. To change the 30 days, change `KEEP_DAYS` in `src/index.ts`, `keepUntil` in `src/site/SiteEditor.tsx`, and the wording in `public/privacy.html` and `public/terms.html`.

Run it locally: with `npm run dev` going, run `curl http://localhost:8787/cdn-cgi/local/scheduled`.

## Moderation

Reports land in the `reports` table. In the dashboard, open D1, then `shaaditemplate-sites`, then Console:

```sql
SELECT * FROM reports ORDER BY at DESC;
UPDATE sites SET hidden = 1 WHERE slug = 'the-slug';   -- takes a site down (shows "taken down")
DELETE FROM blessings WHERE id = 123;
```

## Later: shaaditemplate.com/w/... and subdomains served by the Worker

Today `/w/<slug>` is answered by `public/404.html`, which hands it to the app. That works on GitHub Pages but returns a 404 status, and link previews show the generic page. Moving the domain's DNS to Cloudflare would let a Worker route serve `/w/*` (and a wildcard `*.shaaditemplate.com` for subdomains) with a real 200 page and per-couple preview tags.
