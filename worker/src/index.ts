// API for couples' wedding websites: publish and edit a site, its photos, guests' RSVPs and blessings, and
// "report this site". No accounts: publishing returns a secret edit key, and only its SHA-256 is stored.
//
//   POST   /api/sites                    {slug, look, content, contact?, source?, heard?} -> {slug, key, look, content, sent}
//   GET    /api/sites/:slug                                     -> {look, content}
//   PUT    /api/sites/:slug              (Bearer key) {look, content}
//   DELETE /api/sites/:slug              (Bearer key)           deletes the site, its photos, RSVPs and blessings
//   GET    /api/sites/:slug/blessings                           -> [{id, name, text, at}]
//   POST   /api/sites/:slug/blessings    {name, text}
//   DELETE /api/sites/:slug/blessings/:id (Bearer key)
//   GET    /api/sites/:slug/rsvps        (Bearer key)           -> [{id, at, name, side, events, party, note}]
//   POST   /api/sites/:slug/rsvps        {name, side, events, party, note}
//   POST   /api/sites/:slug/report       {reason}
//   GET    /api/sites/:slug/contact      (Bearer key)           -> {email, phone, marketing}
//   PUT    /api/sites/:slug/contact      (Bearer key) {email, phone, marketing} -> {ok, tried, sent}; a new email gets the edit link
//   GET    /api/photo/:slug/:file
//   GET    /api/stats                                           -> {sites} live (not hidden) sites, for the home page
//
// Once a day (the cron in wrangler.toml) couples who gave an email get a note of new replies and, a week before,
// a reminder that their site is going; then sites whose last event was more than KEEP_DAYS ago are deleted.

interface Env {
  DB: D1Database
  PHOTOS: R2Bucket
  IP_SALT?: string
  // Email goes out through Resend (worker/README.md). Without the key nothing is sent and contacts are only stored.
  RESEND_API_KEY?: string
  MAIL_FROM: string
  SITE_URL: string
}

const MAX_PHOTOS = 16
const MAX_PHOTO_BYTES = 1_500_000
const MAX_BODY = 25_000_000
const HOUR = 36e5
const DAY = 24 * HOUR
// Days a site stays up after its last event. The editor says the same date (keepUntil in src/site/SiteEditor.tsx).
const KEEP_DAYS = 30
// The deletion reminder goes this many days before the site is deleted.
const REMIND_DAYS = 7
// Edit-link emails one site may send, so an edit key can't be used to mail strangers.
const MAX_SENT = 5

type Photo = { src: string; small: string; alt: string; pos: string }

class Fail {
  constructor(
    readonly status: number,
    readonly error: string,
  ) {}
}
const fail = (status: number, error: string): never => {
  throw new Fail(status, error)
}
const json = (data: unknown, status = 200) => Response.json(data, { status })

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // Open CORS: nothing rides on cookies, and editing needs the key in the Authorization header.
    const cors = { 'Access-Control-Allow-Origin': '*' }
    if (req.method === 'OPTIONS')
      return new Response(null, { headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400' } })
    let res: Response
    try {
      res = await route(req, env)
    } catch (e) {
      if (e instanceof Fail) res = json({ error: e.error }, e.status)
      else {
        console.error(e)
        res = json({ error: 'Something went wrong. Please try again.' }, 500)
      }
    }
    res = new Response(res.body, res)
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v)
    return res
  },
  async scheduled(_: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(daily(env))
  },
}

// Each job runs even if another fails, so one bad email never stops the night's deletions.
async function daily(env: Env) {
  for (const job of [remind, digest, expire]) await job(env).catch((e) => console.error(`${job.name} failed: ${e}`))
}

// A site's latest event date. Dates are YYYY-MM-DD, so they compare as text.
const LAST = `(SELECT MAX(json_extract(value, '$.date')) FROM json_each(s.data, '$.content.events') WHERE json_extract(value, '$.date') != '')`
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString().slice(0, 10)
const deleteDay = (last: string) => {
  const d = new Date(`${last}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + KEEP_DAYS)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// Deletes sites whose latest event date is more than KEEP_DAYS ago.
// ponytail: 50 sites a run keeps one run well inside the Worker's limits; any left over go the next day.
async function expire(env: Env) {
  const { results } = await env.DB.prepare(`SELECT slug FROM sites s WHERE ${LAST} < ? LIMIT 50`).bind(daysAgo(KEEP_DAYS)).all<{ slug: string }>()
  for (const { slug } of results) await remove(env, slug)
  if (results.length) console.log(`expired ${results.length} sites`)
}

// Emails couples whose site goes within REMIND_DAYS, once.
// ponytail: 10 reminders and 30 reply notes a run stay under the free plan's 50 outside requests; the rest go the next day.
async function remind(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT c.slug, c.email, ${LAST} AS last FROM contacts c JOIN sites s ON s.slug = c.slug WHERE c.email != '' AND c.reminded = 0 AND s.hidden = 0 AND ${LAST} < ? LIMIT 10`,
  )
    .bind(daysAgo(KEEP_DAYS - REMIND_DAYS))
    .all<{ slug: string; email: string; last: string }>()
  for (const r of results) {
    const text = `Your wedding website ${env.SITE_URL}/w/${r.slug} will be deleted on ${deleteDay(r.last)}, ${KEEP_DAYS} days after your last function, with its photos, guest replies and blessings.\n\nTo keep your guest list, open your secret edit link (it is in the first email we sent you) and press "Download replies".\n\nThank you for celebrating with ShaadiTemplate. Congratulations again!`
    if (await mail(env, r.email, 'Your wedding website will be deleted soon', text)) await env.DB.prepare('UPDATE contacts SET reminded = 1 WHERE slug = ?').bind(r.slug).run()
  }
}

// Emails couples a note of guests' replies and blessings since the last note. Runs once a day.
async function digest(env: Env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM (SELECT c.slug, c.email, (SELECT COUNT(*) FROM rsvps r WHERE r.slug = c.slug AND r.at > c.notified) AS r, (SELECT COUNT(*) FROM blessings b WHERE b.slug = c.slug AND b.at > c.notified) AS b FROM contacts c JOIN sites s ON s.slug = c.slug WHERE c.email != '' AND s.hidden = 0) WHERE r > 0 OR b > 0 LIMIT 30`,
  ).all<{ slug: string; email: string; r: number; b: number }>()
  const now = Date.now()
  for (const n of results) {
    const what = [n.r && plural(n.r, 'new reply', 'new replies'), n.b && plural(n.b, 'new blessing', 'new blessings')].filter(Boolean).join(' and ')
    const text = `Your wedding website has ${what} since our last note.\n\nOpen your secret edit link (it is in the first email we sent you) to see who is coming and download the list.\n\nYour website: ${env.SITE_URL}/w/${n.slug}`
    if (await mail(env, n.email, `${what[0].toUpperCase()}${what.slice(1)} on your wedding website`, text))
      await env.DB.prepare('UPDATE contacts SET notified = ? WHERE slug = ?').bind(now, n.slug).run()
  }
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

// Sends a plain-text email. Returns false (and logs why) if it was not sent.
async function mail(env: Env, to: string, subject: string, text: string) {
  if (!env.RESEND_API_KEY) {
    console.log(`mail not sent (no RESEND_API_KEY): ${subject}`)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text }),
    })
    if (!res.ok) console.error(`mail failed ${res.status}: ${await res.text()}`)
    return res.ok
  } catch (e) {
    console.error(`mail failed: ${e}`)
    return false
  }
}

// Deletes a site, its photos, RSVPs, blessings and contact (kept only if they asked for news of new designs).
// Photos go first: if that fails the rows stay, and the next run tries again instead of leaving photos behind.
// A kept contact moves off the slug (slug#<time>), so a new site at the same address never mails it.
async function remove(env: Env, slug: string) {
  const listed = await env.PHOTOS.list({ prefix: `${slug}/` })
  if (listed.objects.length) await env.PHOTOS.delete(listed.objects.map((o) => o.key))
  await env.DB.batch([
    ...['sites', 'blessings', 'rsvps'].map((t) => env.DB.prepare(`DELETE FROM ${t} WHERE slug = ?`).bind(slug)),
    env.DB.prepare('DELETE FROM contacts WHERE slug = ? AND marketing = 0').bind(slug),
    env.DB.prepare("UPDATE contacts SET slug = slug || '#' || ? WHERE slug = ?").bind(String(Date.now()), slug),
  ])
}

async function route(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url)
  const [api, kind, slug, sub, id] = url.pathname.split('/').filter(Boolean)
  const m = req.method
  if (api !== 'api') fail(404, 'Not found.')
  if (kind === 'photo' && m === 'GET' && slug && sub) return photo(env, slug, sub)
  if (kind === 'stats' && m === 'GET' && !slug) return json({ sites: await count(env, 'SELECT COUNT(*) AS n FROM sites WHERE hidden = 0') })
  if (kind !== 'sites') fail(404, 'Not found.')
  if (!slug && m === 'POST') return create(req, env, url.origin)
  if (!slug) fail(404, 'Not found.')
  if (!sub && m === 'GET') {
    const s = await site(env, slug)
    return json(JSON.parse(s.data))
  }
  if (!sub && m === 'PUT') return update(req, env, slug, url.origin)
  if (!sub && m === 'DELETE') {
    await owner(req, env, slug)
    await remove(env, slug)
    return json({ ok: true })
  }
  if (sub === 'blessings' && m === 'GET') {
    await site(env, slug)
    const { results } = await env.DB.prepare('SELECT id, name, text, at FROM blessings WHERE slug = ? ORDER BY at DESC LIMIT 300').bind(slug).all()
    return json(results)
  }
  if (sub === 'blessings' && m === 'POST') return bless(req, env, slug)
  if (sub === 'blessings' && m === 'DELETE' && id) {
    await owner(req, env, slug)
    await env.DB.prepare('DELETE FROM blessings WHERE slug = ? AND id = ?').bind(slug, Number(id)).run()
    return json({ ok: true })
  }
  if (sub === 'rsvps' && m === 'GET') {
    await owner(req, env, slug)
    const { results } = await env.DB.prepare('SELECT id, at, data FROM rsvps WHERE slug = ? ORDER BY at DESC LIMIT 2000').bind(slug).all<{ id: number; at: number; data: string }>()
    return json(results.map((r) => ({ id: r.id, at: r.at, ...JSON.parse(r.data) })))
  }
  if (sub === 'rsvps' && m === 'POST') return rsvp(req, env, slug)
  if (sub === 'report' && m === 'POST') return report(req, env, slug)
  if (sub === 'contact' && m === 'GET') {
    await owner(req, env, slug)
    const c = await env.DB.prepare('SELECT email, phone, marketing FROM contacts WHERE slug = ?').bind(slug).first<{ email: string; phone: string; marketing: number }>()
    return json({ email: c?.email ?? '', phone: c?.phone ?? '', marketing: !!c?.marketing })
  }
  if (sub === 'contact' && m === 'PUT') return contact(req, env, slug)
  return fail(404, 'Not found.')
}

/* ---------- helpers ---------- */

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
const sha256 = async (s: string) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
const ipOf = (req: Request, env: Env) => sha256(`${env.IP_SALT ?? ''}:${req.headers.get('CF-Connecting-IP') ?? 'local'}`)

async function body(req: Request): Promise<any> {
  if (Number(req.headers.get('Content-Length') ?? 0) > MAX_BODY) fail(413, 'That is too much to send at once. Use smaller photos.')
  return req.json().catch(() => fail(400, 'Could not read the request.'))
}

async function count(env: Env, sql: string, ...args: unknown[]) {
  const row = await env.DB.prepare(sql).bind(...args).first<{ n: number }>()
  return row?.n ?? 0
}

async function site(env: Env, slug: string) {
  const s = await env.DB.prepare('SELECT data, key_hash, hidden FROM sites WHERE slug = ?').bind(slug).first<{ data: string; key_hash: string; hidden: number }>()
  if (!s) fail(404, 'There is no wedding website at this address.')
  if (s!.hidden) fail(410, 'This wedding website has been taken down.')
  return s!
}

async function owner(req: Request, env: Env, slug: string) {
  const s = await site(env, slug)
  const key = req.headers.get('Authorization')?.replace(/^Bearer /, '') ?? ''
  if (!key || (await sha256(key)) !== s.key_hash) fail(403, 'This edit link is not right. Open the full link from your email.')
  return s
}

/* ---------- abuse checks ---------- */

// Matched anywhere inside a word (long enough not to hit real names).
const BAD_ANYWHERE = ['fuck', 'cunt', 'bitch', 'nigg', 'whore', 'madarchod', 'maderchod', 'behenchod', 'bhenchod', 'benchod', 'bhosd', 'chutiy', 'chutia', 'gaand', 'lavda', 'lauda', 'pornhub']
// Matched only as a whole word.
// 'porn' is here, not above: matched inside words it blocked the name Pornima.
const BAD_WORDS = new Set(['porn', 'porno', 'shit', 'rape', 'sex', 'sexy', 'nude', 'nudes', 'cock', 'pussy', 'slut', 'fag', 'nazi', 'hitler', 'retard', 'gandu', 'lund', 'loda', 'randi', 'harami', 'kamina', 'kutta', 'bsdk', 'mc', 'bc', 'mkc', 'bkl', 'chod', 'escort', 'casino', 'viagra', 'crypto', 'loan'])
const RESERVED = new Set(['api', 'admin', 'edit', 'new', 'www', 'help', 'support', 'about', 'contact', 'login', 'official', 'shaaditemplate', 'shaadi-template', 'test', 'demo', 'sample'])
// ponytail: word lists only, so "fu-ck" or a misspelling gets through; couples can remove blessings and anyone can
// report a site. Swap in a moderation API if abuse shows up.
const isAbusive = (text: string) => {
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  // Letters spelled out one at a time (f-u-c-k) are read as one word. Whole text is never joined: "who really" is fine.
  const spelled = words.filter((w) => w.length === 1).join('')
  return [...words, spelled].some((w) => BAD_ANYWHERE.some((b) => w.includes(b))) || words.some((w) => BAD_WORDS.has(w))
}
const slugProblem = (slug: unknown) => {
  if (typeof slug !== 'string' || slug.length < 4 || slug.length > 40 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return 'Use 4 to 40 lowercase letters, numbers and single hyphens.'
  if (RESERVED.has(slug)) return 'That address is taken. Try another.'
  if (isAbusive(slug)) return 'Please choose a different address.'
  return ''
}

/* ---------- content ---------- */

// A real calendar day: the shape alone lets 2027-02-31 or 2027-13-01 through, which break the site in browsers.
const realDate = (d: unknown) => {
  if (typeof d !== 'string' || !/^\d{4}-\d\d-\d\d$/.test(d)) return false
  const t = new Date(`${d}T00:00:00Z`)
  return !isNaN(t.getTime()) && t.toISOString().startsWith(d)
}
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const arr = <T>(v: unknown, max: number, f: (x: any) => T) => (Array.isArray(v) ? v.slice(0, max).map(f) : [])
const DATA_URL = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+=*)$/

// Keeps only the fields the site draws, trimmed to sane lengths. Photos must be new uploads (data URLs) or ones
// already stored for this site; any other URL is dropped.
function clean(raw: any, ownPhoto: (src: string) => boolean) {
  const photos: Photo[] = []
  const photo = (v: any): Photo | undefined => {
    const src = v?.src
    if (typeof src !== 'string' || !(DATA_URL.test(src) || ownPhoto(src))) return undefined
    const p = { src, small: src, alt: str(v.alt, 200), pos: /^\d{1,3}% \d{1,3}%$/.test(v.pos) ? v.pos : 'center' }
    photos.push(p)
    return p
  }
  const c = raw ?? {}
  const content = {
    couple: [str(c.couple?.[0], 40), str(c.couple?.[1], 40)],
    families: [str(c.families?.[0], 80), str(c.families?.[1], 80)],
    parents: [str(c.parents?.[0], 300), str(c.parents?.[1], 300)],
    meet: Array.isArray(c.meet) ? arr(c.meet, 2, (m) => ({ bio: str(m?.bio, 500), photo: photo(m?.photo) })) : undefined,
    // All blank lines is no list at all: an empty one would draw an empty "With best compliments from".
    compliments: (() => {
      const xs = Array.isArray(c.compliments) ? arr(c.compliments, 10, (x) => str(x, 160)).filter(Boolean) : []
      return xs.length ? xs : undefined
    })(),
    nativeNames: str(c.nativeNames, 80) || undefined,
    invocation: str(c.invocation, 80) || undefined,
    note: str(c.note, 400) || undefined,
    stay: str(c.stay, 300) || undefined,
    notes: arr(c.notes, 10, (x) => str(x, 300)).filter(Boolean),
    city: str(c.city, 60),
    venue: str(c.venue, 160),
    invite: str(c.invite, 400),
    rsvpBy: str(c.rsvpBy, 40),
    story: arr(c.story, 6, (s) => ({ year: str(s?.year, 12), title: str(s?.title, 80), body: str(s?.body, 400), photo: photo(s?.photo) })),
    events: arr(c.events, 8, (e) => ({
      id: /^[a-z0-9]{1,8}$/.test(e?.id) ? e.id : undefined,
      name: str(e?.name, 60),
      date: realDate(e?.date) ? e.date : '',
      time: /^([01]\d|2[0-3]):[0-5]\d$/.test(e?.time) ? e.time : '',
      where: str(e?.where, 120),
      note: str(e?.note, 300),
      photo: photo(e?.photo),
    })),
    mainEvent: Number.isInteger(c.mainEvent) && c.mainEvent >= 0 && c.mainEvent < 8 ? c.mainEvent : undefined,
    photos: { hero: photo(c.photos?.hero), venue: photo(c.photos?.venue), gallery: arr(c.photos?.gallery, 8, photo).filter(Boolean) },
  }
  if (!content.couple[0] || !content.couple[1]) fail(400, 'Add both of your names.')
  if (!content.events.length) fail(400, 'Add at least one event.')
  // An undated event would show guests a made-up date. The editor asks for one; this catches anything else.
  const undated = content.events.find((e) => !e.date)
  if (undated) fail(400, `Add a date for ${undated.name || 'every event'}.`)
  // A date years away would keep the site up for good (expire() goes by the last event).
  if (content.events.some((e) => e.date > new Date(Date.now() + 3 * 365 * DAY).toISOString().slice(0, 10)))
    fail(400, 'One of your event dates is more than 3 years away. Check the year.')
  // expire() would delete such a site the same night: most likely a mistyped year.
  if (content.events.every((e) => e.date < new Date(Date.now() - KEEP_DAYS * DAY).toISOString().slice(0, 10)))
    fail(400, `Your last event was more than ${KEEP_DAYS} days ago, so the site would be deleted tonight. Check the dates and the year.`)
  if (content.mainEvent !== undefined && content.mainEvent >= content.events.length) content.mainEvent = undefined
  if (new Set(photos.map((p) => p.src)).size > MAX_PHOTOS) fail(400, `A site can have up to ${MAX_PHOTOS} photos.`)
  return { content, photos }
}

// Saves new photos to R2 and points them at /api/photo/. Returns every photo key the site now uses.
// ponytail: photo URLs carry the Worker's origin. If the API moves to another host, old sites keep working (the
// old host still serves them) but an edit would drop photos; accept the old origin in update() then.
async function storePhotos(env: Env, slug: string, origin: string, photos: Photo[]) {
  const prefix = `${origin}/api/photo/`
  // Every new photo is read before any is saved, so one bad photo leaves nothing behind.
  const fresh = new Map<string, { key: string; type: string; bytes: Uint8Array }>()
  for (const p of photos) {
    if (!p.src.startsWith('data:') || fresh.has(p.src)) continue
    const [, type, b64] = p.src.match(DATA_URL)!
    let bytes: Uint8Array
    try {
      // A plain loop: Uint8Array.from with a callback per byte costs real CPU time on the free plan for 16 photos.
      const bin = atob(b64)
      bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    } catch {
      return fail(400, 'One of the photos could not be read.')
    }
    if (bytes.length > MAX_PHOTO_BYTES) fail(413, 'Each photo must be under 1.5 MB.')
    fresh.set(p.src, { key: `${slug}/${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}.${type === 'jpeg' ? 'jpg' : type}`, type, bytes })
  }
  await Promise.all([...fresh.values()].map((f) => env.PHOTOS.put(f.key, f.bytes, { httpMetadata: { contentType: `image/${f.type}` } })))
  for (const p of photos) {
    const f = fresh.get(p.src)
    if (f) p.src = p.small = prefix + f.key
  }
  return new Set(photos.map((p) => p.src.slice(prefix.length)))
}

const LOOK = /^[a-z0-9-]{2,30}$/

async function create(req: Request, env: Env, origin: string) {
  const b = await body(req)
  const problem = slugProblem(b?.slug)
  if (problem) fail(400, problem)
  if (!LOOK.test(b.look)) fail(400, 'Pick a design.')
  if (await env.DB.prepare('SELECT 1 FROM sites WHERE slug = ?').bind(b.slug).first()) fail(409, 'That address is taken. Try another.')
  const ip = await ipOf(req, env)
  // ponytail: 5 new sites a day per IP; a shared office or college IP could hit it. Raise it if couples write in.
  if ((await count(env, 'SELECT COUNT(*) AS n FROM sites WHERE ip = ? AND created > ?', ip, Date.now() - DAY)) >= 5)
    fail(429, 'You have published several sites today. Please try again tomorrow, or edit the one you made.')
  // Checked before anything is stored, so a mistyped email stops the publish rather than losing the contact.
  const reach = contactOf(b.contact)
  const { content, photos } = clean(b.content, () => false)
  const saved = await storePhotos(env, b.slug, origin, photos)
  const key = hex(crypto.getRandomValues(new Uint8Array(24)).buffer as ArrayBuffer)
  const now = Date.now()
  try {
    await env.DB.prepare('INSERT INTO sites (slug, data, key_hash, ip, created, updated, source, heard) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(b.slug, JSON.stringify({ look: b.look, content }), await sha256(key), ip, now, now, str(b.source, 60), str(b.heard, 30))
      .run()
  } catch (e) {
    // Lost a race for the same slug (or a database hiccup): take this request's photos back out either way.
    if (saved.size) await env.PHOTOS.delete([...saved])
    if (!String(e).includes('UNIQUE')) throw e
    fail(409, 'That address is taken. Try another.')
  }
  // The site is already stored: a failed contact save or email must not turn the publish into an error (a retry would
  // find the address taken). The couple can add it again from the "Your website is live" panel.
  const { sent } = reach.email || reach.phone ? await saveContact(env, b.slug, key, reach).catch((e) => (console.error(`contact on publish: ${e}`), { sent: false })) : { sent: false }
  // The stored content comes back with the key, so the editor never needs a second request to keep it.
  return json({ slug: b.slug, key, look: b.look, content, sent }, 201)
}

async function update(req: Request, env: Env, slug: string, origin: string) {
  await owner(req, env, slug)
  const b = await body(req)
  if (!LOOK.test(b?.look)) fail(400, 'Pick a design.')
  // A photo is kept only if it is still in this site's folder: an old copy of the site can name ones since deleted.
  const have = new Set((await env.PHOTOS.list({ prefix: `${slug}/` })).objects.map((o) => o.key))
  const prefix = `${origin}/api/photo/`
  const { content, photos } = clean(b.content, (src) => src.startsWith(prefix) && have.has(src.slice(prefix.length)))
  const keep = await storePhotos(env, slug, origin, photos)
  await env.DB.prepare('UPDATE sites SET data = ?, updated = ? WHERE slug = ?').bind(JSON.stringify({ look: b.look, content }), Date.now(), slug).run()
  // Delete photos the site no longer uses.
  const gone = [...have].filter((k) => !keep.has(k))
  if (gone.length) await env.PHOTOS.delete(gone)
  return json({ look: b.look, content })
}

async function photo(env: Env, slug: string, file: string) {
  await site(env, slug) // a deleted or taken-down site's photos go with it
  const obj = await env.PHOTOS.get(`${slug}/${file}`)
  if (!obj) return fail(404, 'Not found.')
  return new Response(obj.body, {
    headers: { 'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
  })
}

async function bless(req: Request, env: Env, slug: string) {
  await site(env, slug)
  const b = await body(req)
  const name = str(b?.name, 60)
  const text = str(b?.text, 280)
  if (!name || !text) fail(400, 'Add your name and a few words before you post.')
  if (isAbusive(`${name} ${text}`)) fail(400, 'Please keep your blessing kind.')
  const ip = await ipOf(req, env)
  // ponytail: 30 an hour per network per site. Guests at the venue share Wi-Fi or a carrier's address, so 5 blocked
  // real guests; per-browser limits would need a token.
  if ((await count(env, 'SELECT COUNT(*) AS n FROM blessings WHERE slug = ? AND ip = ? AND at > ?', slug, ip, Date.now() - HOUR)) >= 30)
    fail(429, 'You have posted several blessings already. Please try again later.')
  const at = Date.now()
  const r = await env.DB.prepare('INSERT INTO blessings (slug, name, text, ip, at) VALUES (?, ?, ?, ?, ?)').bind(slug, name, text, ip, at).run()
  return json({ id: r.meta.last_row_id, name, text, at }, 201)
}

async function rsvp(req: Request, env: Env, slug: string) {
  await site(env, slug)
  const b = await body(req)
  const r = {
    name: str(b?.name, 60),
    side: ['a', 'b', 'both'].includes(b?.side) ? b.side : 'both',
    events: arr(b?.events, 8, (x) => str(x, 8)),
    party: Math.min(8, Math.max(1, Math.round(Number(b?.party)) || 1)),
    note: str(b?.note, 200),
    // The guest's browser id, so the couple sees a changed reply replace the old one.
    guest: typeof b?.guest === 'string' && /^[a-z0-9-]{8,40}$/i.test(b.guest) ? b.guest : '',
  }
  if (!r.name) fail(400, 'Add your name so the families know who is coming.')
  const ip = await ipOf(req, env)
  if ((await count(env, 'SELECT COUNT(*) AS n FROM rsvps WHERE slug = ? AND ip = ? AND at > ?', slug, ip, Date.now() - HOUR)) >= 20)
    fail(429, 'Too many replies from here. Please try again later.')
  await env.DB.prepare('INSERT INTO rsvps (slug, data, ip, at) VALUES (?, ?, ?, ?)').bind(slug, JSON.stringify(r), ip, Date.now()).run()
  return json(r, 201)
}

async function report(req: Request, env: Env, slug: string) {
  if (!(await env.DB.prepare('SELECT 1 FROM sites WHERE slug = ?').bind(slug).first())) fail(404, 'There is no wedding website at this address.')
  const b = await body(req)
  const reason = str(b?.reason, 500)
  if (!reason) fail(400, 'Tell us what is wrong with this site.')
  const ip = await ipOf(req, env)
  if ((await count(env, 'SELECT COUNT(*) AS n FROM reports WHERE ip = ? AND at > ?', ip, Date.now() - DAY)) >= 5) fail(429, 'Thank you, we already have your reports.')
  await env.DB.prepare('INSERT INTO reports (slug, reason, ip, at) VALUES (?, ?, ?, ?)').bind(slug, reason, ip, Date.now()).run()
  return json({ ok: true }, 201)
}

// Saves how to reach the couple. A new email address gets the edit link, so a lost link can be found again.
async function contact(req: Request, env: Env, slug: string) {
  await owner(req, env, slug)
  const reach = contactOf(await body(req))
  return json({ ok: true, ...(await saveContact(env, slug, req.headers.get('Authorization')!.replace(/^Bearer /, ''), reach)) })
}

type Reach = { email: string; phone: string; marketing: boolean }

// A couple's email and WhatsApp number as sent (both optional), checked.
function contactOf(b: any): Reach {
  const email = str(b?.email, 120).toLowerCase()
  const phone = str(b?.phone, 30).replace(/[\s()-]/g, '')
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail(400, 'Check your email address.')
  if (phone && !/^\+?\d{8,15}$/.test(phone)) fail(400, 'Check your WhatsApp number. Use only digits, with the country code if you like.')
  return { email, phone, marketing: b?.marketing === true }
}

// Stores how to reach the couple; a new email gets the edit link.
async function saveContact(env: Env, slug: string, key: string, { email, phone, marketing }: Reach) {
  const old = await env.DB.prepare('SELECT email, sent FROM contacts WHERE slug = ?').bind(slug).first<{ email: string; sent: number }>()
  // Clearing both blanks the row rather than deleting it, so the count of edit-link emails sent stays.
  const now = Date.now()
  await env.DB.prepare(
    'INSERT INTO contacts (slug, email, phone, marketing, at, notified) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (slug) DO UPDATE SET email = excluded.email, phone = excluded.phone, marketing = excluded.marketing, at = excluded.at',
  )
    .bind(slug, email, phone, (email || phone) && marketing ? 1 : 0, now, now)
    .run()
  let sent = false
  const tried = !!email && email !== old?.email && (old?.sent ?? 0) < MAX_SENT
  if (tried) {
    const live = `${env.SITE_URL}/w/${slug}`
    const text = `Your wedding website is live: ${live}\n\nYour secret edit link (keep it private, anyone with it can change your site):\n${live}/edit#${key}\n\nOpen it to change your site and see who has replied. We will email you here once a day when guests reply, and once before your site is deleted.\n\nShaadiTemplate`
    sent = await mail(env, email, 'Your wedding website edit link', text)
    if (sent) await env.DB.prepare('UPDATE contacts SET sent = sent + 1 WHERE slug = ?').bind(slug).run()
  }
  return { tried, sent }
}
