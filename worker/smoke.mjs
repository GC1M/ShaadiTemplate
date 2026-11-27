// End-to-end check of the sites API against `npm run dev` (wrangler dev on :8787). Usage: node smoke.mjs [base]
import assert from 'node:assert/strict'

const API = process.argv[2] ?? 'http://localhost:8787'
const call = async (method, path, body, key) => {
  const res = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(key && { Authorization: `Bearer ${key}` }) }, body: body && JSON.stringify(body) })
  return { status: res.status, data: res.headers.get('Content-Type')?.includes('json') ? await res.json() : await res.arrayBuffer() }
}
// A 1x1 JPEG.
const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
const slug = `smoke-${Date.now().toString(36)}`
const SOON = new Date(Date.now() + 200 * 864e5).toISOString().slice(0, 10) // event dates may be at most a year ahead
const content = {
  couple: ['Asha', 'Dev'],
  nativeNames: 'आशा संग देव',
  families: ['Asha’s family', 'Dev’s family'],
  parents: ['Daughter of A', 'Son of B'],
  notes: ['Bring a shawl'],
  city: 'Pune',
  venue: 'Somewhere, Pune',
  invite: 'Come celebrate',
  rsvpBy: '1 May',
  story: [{ year: '2020', title: 'Met', body: 'At work', photo: { src: JPEG, alt: 'us' } }],
  events: [{ name: 'Wedding', date: SOON, time: '18:00', where: '', note: '', photo: { src: JPEG, alt: 'mandap', pos: '30% 70%' } }],
  photos: { hero: { src: JPEG, alt: 'cover' }, gallery: [{ src: 'https://evil.example/x.jpg' }] },
}

assert.equal((await call('POST', '/api/sites', { slug: 'f-u-c-k', look: 'rajwada', content })).status, 400) // hyphens don't hide it
assert.equal((await call('POST', '/api/sites', { slug: 'fuckyou-1', look: 'rajwada', content })).status, 400)
assert.equal((await call('POST', '/api/sites', { slug: 'Bad Slug', look: 'rajwada', content })).status, 400)
assert.equal((await call('POST', '/api/sites', { slug: 'admin', look: 'rajwada', content })).status, 400)
assert.equal((await call('POST', '/api/sites', { slug, look: 'rajwada', content: { ...content, events: [{ ...content.events[0], date: '2020-05-01' }] } })).status, 400) // long past: it would be deleted tonight
const withEvents = (...events) => call('POST', '/api/sites', { slug, look: 'rajwada', content: { ...content, events: events.map((e) => ({ ...content.events[0], ...e })) } })
assert.equal((await withEvents({ date: '2028-02-31' })).status, 400) // not a real day: it would break the site in Safari
assert.equal((await withEvents({ date: '2028-13-01' })).status, 400)
assert.equal((await withEvents({ date: '2099-05-01' })).status, 400) // years away: the site would never expire
assert.equal((await withEvents({ name: 'Wedding', date: new Date(Date.now() + 400 * 864e5).toISOString().slice(0, 10) })).data.error, 'Wedding is more than a year away. Check the year, or add it closer to the day.')
assert.equal((await withEvents({}, { name: 'Sangeet', date: '' })).data.error, 'Add a date for Sangeet.') // guests would see a made-up date
// A bad time is dropped, not fatal; 'porn' inside a word no longer blocks the name Pornima.
const pornima = await call('POST', '/api/sites', { slug: `pornima-rahul-${slug.slice(-6)}`, look: 'rajwada', content: { ...content, story: [], photos: { gallery: [] }, events: [{ ...content.events[0], time: '25:61', photo: undefined }] } })
assert.equal(pornima.status, 201, JSON.stringify(pornima.data))
assert.equal(pornima.data.content.events[0].time, '')
// A livestream link is kept only as https.
const streams = await call('POST', '/api/sites', { slug: `stream-${slug.slice(-6)}`, look: 'rajwada', content: { ...content, story: [], photos: { gallery: [] }, events: [{ ...content.events[0], live: 'https://youtube.com/live/abc', photo: undefined }, { ...content.events[0], name: 'Haldi', live: 'javascript:alert(1)', photo: undefined }] } })
assert.equal(streams.status, 201, JSON.stringify(streams.data))
assert.deepEqual(streams.data.content.events.map((e) => e.live), ['https://youtube.com/live/abc', undefined])
// The wedding's time zone is kept when it is a real zone, and dropped (India time) when not.
assert.equal(streams.data.content.zone, undefined)
const zoned = await call('PUT', `/api/sites/stream-${slug.slice(-6)}`, { look: 'rajwada', content: { ...streams.data.content, zone: 'America/Chicago' } }, streams.data.key)
assert.equal(zoned.data.content.zone, 'America/Chicago', JSON.stringify(zoned.data))
assert.equal((await call('PUT', `/api/sites/stream-${slug.slice(-6)}`, { look: 'rajwada', content: { ...streams.data.content, zone: 'Mars/Olympus' } }, streams.data.key)).data.content.zone, undefined)
assert.equal((await call('DELETE', `/api/sites/stream-${slug.slice(-6)}`, undefined, streams.data.key)).status, 200)

const made = await call('POST', '/api/sites', { slug, look: 'rajwada', content })
assert.equal(made.status, 201, JSON.stringify(made.data))
const { key } = made.data
assert.match(made.data.content.photos.hero.src, /\/api\/photo\//) // the stored content comes back with the key
// A bad word is only matched inside one word: Durga and Andrew may marry (durGA-ANDrew).
const durgaContent = { ...content, story: [], photos: { gallery: [] } }
const durga = await call('POST', '/api/sites', { slug: `durga-andrew-${slug.slice(-6)}`, look: 'rajwada', content: durgaContent })
assert.equal(durga.status, 201, JSON.stringify(durga.data))
assert.equal((await call('DELETE', `/api/sites/durga-andrew-${slug.slice(-6)}`, undefined, durga.data.key)).status, 200)
// Hidden sections: only the known ones, once each.
const hidden = await call('POST', '/api/sites', { slug: `hide-${slug.slice(-6)}`, look: 'rajwada', content: { ...durgaContent, hide: ['rsvp', 'story', 'rsvp', 'gallery'] } })
assert.deepEqual(hidden.data.content.hide, ['rsvp', 'gallery'])
assert.equal((await call('DELETE', `/api/sites/hide-${slug.slice(-6)}`, undefined, hidden.data.key)).status, 200)
// Contact given with the publish: a bad one stops it before anything is stored, a good one is saved with the site.
const withContact = { slug: `meera-raj-${slug.slice(-6)}`, look: 'rajwada', content: durgaContent, source: 'instagram.com', heard: 'instagram' }
assert.equal((await call('POST', '/api/sites', { ...withContact, contact: { email: 'nope' } })).status, 400)
assert.equal((await call('GET', `/api/sites/${withContact.slug}`)).status, 404)
const meera = await call('POST', '/api/sites', { ...withContact, contact: { email: 'Meera@Example.com', phone: '', marketing: false } })
assert.equal(meera.status, 201, JSON.stringify(meera.data))
assert.equal(meera.data.sent, false) // no RESEND_API_KEY locally
assert.deepEqual((await call('GET', `/api/sites/${withContact.slug}/contact`, undefined, meera.data.key)).data, { email: 'meera@example.com', phone: '', marketing: false })
assert.equal((await call('PUT', `/api/sites/${withContact.slug}/contact`, { email: 'meera@example.com', marketing: true }, meera.data.key)).status, 200)
assert.equal((await call('DELETE', `/api/sites/${withContact.slug}`, undefined, meera.data.key)).status, 200)
// The address is free again; the kept (marketing) contact must not come with it.
const again = await call('POST', '/api/sites', { ...withContact, slug: withContact.slug })
assert.equal(again.status, 201, JSON.stringify(again.data))
assert.deepEqual((await call('GET', `/api/sites/${withContact.slug}/contact`, undefined, again.data.key)).data, { email: '', phone: '', marketing: false })
assert.equal((await call('DELETE', `/api/sites/${withContact.slug}`, undefined, again.data.key)).status, 200)
assert.equal((await call('DELETE', `/api/sites/pornima-rahul-${slug.slice(-6)}`, undefined, pornima.data.key)).status, 200)
assert.equal((await call('POST', '/api/sites', { slug, look: 'rajwada', content })).status, 409)

const got = await call('GET', `/api/sites/${slug}`)
assert.equal(got.status, 200)
const hero = got.data.content.photos.hero.src
assert.match(hero, new RegExp(`/api/photo/${slug}/[a-f0-9]{16}\\.jpg$`))
assert.equal(got.data.content.story[0].photo.src, hero) // same upload stored once
assert.equal(got.data.content.events[0].photo.src, hero) // an event's own photo
assert.equal(got.data.content.events[0].photo.pos, '30% 70%') // and the part of it to keep in view
assert.equal(got.data.content.nativeNames, 'आशा संग देव')
assert.equal(got.data.content.photos.gallery.length, 0) // foreign URL dropped
const img = await fetch(hero)
assert.equal(img.status, 200)
assert.equal(img.headers.get('Content-Type'), 'image/jpeg')

// Edit: needs the key; dropping the story photo keeps the shared file, dropping the hero too deletes it.
const edited = { ...got.data.content, city: 'Mumbai' }
assert.equal((await call('PUT', `/api/sites/${slug}`, { look: 'pichola', content: edited }, 'wrong')).status, 403)
assert.equal((await call('PUT', `/api/sites/${slug}`, { look: 'pichola', content: edited }, key)).status, 200)
const after = await call('GET', `/api/sites/${slug}`)
assert.equal(after.data.look, 'pichola')
assert.equal(after.data.content.city, 'Mumbai')
assert.equal(after.data.content.photos.hero.src, hero)
const noPhotos = { ...edited, story: [], events: edited.events.map(({ photo, ...e }) => e), photos: { gallery: [] } }
assert.equal((await call('PUT', `/api/sites/${slug}`, { look: 'pichola', content: noPhotos }, key)).status, 200)
assert.equal((await fetch(hero)).status, 404)
// An old copy of the site that still names the deleted photo saves without it.
const stale = await call('PUT', `/api/sites/${slug}`, { look: 'pichola', content: edited }, key)
assert.equal(stale.status, 200)
assert.equal(stale.data.content.photos.hero, undefined)

// Guests.
assert.equal((await call('POST', `/api/sites/${slug}/blessings`, { name: 'Meera', text: 'Much love!' })).status, 201)
assert.equal((await call('POST', `/api/sites/${slug}/blessings`, { name: 'Troll', text: 'you are shit' })).status, 400)
const list = await call('GET', `/api/sites/${slug}/blessings`)
assert.equal(list.data.length, 1)
assert.equal((await call('POST', `/api/sites/${slug}/rsvps`, { name: 'Ravi', side: 'a', events: ['e0'], party: 3, note: 'veg' })).status, 201)
assert.equal((await call('POST', `/api/sites/${slug}/rsvps`, { name: 'Ravi K', side: 'a', events: [], party: 1, note: '', guest: 'g-1234abcd' })).data.guest, 'g-1234abcd') // kept, so a changed reply replaces the old one
assert.equal((await call('GET', `/api/sites/${slug}/rsvps`)).status, 403)
const rsvps = await call('GET', `/api/sites/${slug}/rsvps`, undefined, key)
assert.equal(rsvps.data.find((r) => r.name === 'Ravi').party, 3)
// A reply the couple got by phone: only with the edit key, marked as theirs, and a family bigger than a guest may claim.
assert.equal((await call('POST', `/api/sites/${slug}/rsvps`, { name: 'Masi', side: 'b', events: ['e0'], party: 12 }, 'wrong-key')).status, 403)
const byPhone = await call('POST', `/api/sites/${slug}/rsvps`, { name: 'Masi', side: 'b', events: ['e0'], party: 12, note: 'called', guest: 'g-faked123' }, key)
assert.equal(byPhone.status, 201, JSON.stringify(byPhone.data))
assert.deepEqual([byPhone.data.by, byPhone.data.party, byPhone.data.guest], ['couple', 12, ''])
assert.equal((await call('POST', `/api/sites/${slug}/rsvps`, { name: 'Big', side: 'a', events: ['e0'], party: 12 })).data.party, 8) // a guest still gets 8 at most
assert.equal((await call('DELETE', `/api/sites/${slug}/blessings/${list.data[0].id}`, undefined, key)).status, 200)
assert.equal((await call('GET', `/api/sites/${slug}/blessings`)).data.length, 0)
assert.equal((await call('POST', `/api/sites/${slug}/blessings`, { name: 'Asha', text: 'Two people who really deserve each other. May Maa Durga and Ganesh ji bless you.' })).status, 201)
assert.equal((await call('POST', `/api/sites/${slug}/report`, { reason: 'spam' })).status, 201)

// Contact: owner only, checked, and removed with the site (kept only with the news box ticked).
assert.equal((await call('GET', `/api/sites/${slug}/contact`)).status, 403)
assert.deepEqual((await call('GET', `/api/sites/${slug}/contact`, undefined, key)).data, { email: '', phone: '', marketing: false })
assert.equal((await call('PUT', `/api/sites/${slug}/contact`, { email: 'not-an-email' }, key)).status, 400)
assert.equal((await call('PUT', `/api/sites/${slug}/contact`, { phone: '12' }, key)).status, 400)
const saved = await call('PUT', `/api/sites/${slug}/contact`, { email: 'Asha@Example.com', phone: '+91 98765 43210', marketing: true }, key)
assert.equal(saved.status, 200, JSON.stringify(saved.data))
assert.equal(saved.data.tried, true) // a new email address gets the edit link
assert.equal(saved.data.sent, false) // no RESEND_API_KEY locally
assert.deepEqual((await call('GET', `/api/sites/${slug}/contact`, undefined, key)).data, { email: 'asha@example.com', phone: '+919876543210', marketing: true })
assert.equal((await call('PUT', `/api/sites/${slug}/contact`, { email: '', phone: '' }, key)).status, 200)
assert.deepEqual((await call('GET', `/api/sites/${slug}/contact`, undefined, key)).data, { email: '', phone: '', marketing: false })
assert.equal((await call('PUT', `/api/sites/${slug}/contact`, { email: 'asha@example.com' }, key)).data.tried, true) // cleared and re-added: still counted, below the cap
assert.equal((await call('GET', '/api/sites/no-such-site')).status, 404)
assert.equal((await call('DELETE', `/api/sites/${slug}`, undefined, 'wrong')).status, 403)
assert.equal((await call('DELETE', `/api/sites/${slug}`, undefined, key)).status, 200)
assert.equal((await call('GET', `/api/sites/${slug}`)).status, 404)

console.log(`ok: ${slug}`)
