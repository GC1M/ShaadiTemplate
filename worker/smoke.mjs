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
const content = {
  couple: ['Asha', 'Dev'],
  families: ['Asha’s family', 'Dev’s family'],
  parents: ['Daughter of A', 'Son of B'],
  notes: ['Bring a shawl'],
  city: 'Pune',
  venue: 'Somewhere, Pune',
  invite: 'Come celebrate',
  rsvpBy: '1 May',
  story: [{ year: '2020', title: 'Met', body: 'At work', photo: { src: JPEG, alt: 'us' } }],
  events: [{ name: 'Wedding', date: '2028-05-01', time: '18:00', where: '', note: '' }],
  photos: { hero: { src: JPEG, alt: 'cover' }, gallery: [{ src: 'https://evil.example/x.jpg' }] },
}

assert.equal((await call('POST', '/api/sites', { slug: 'f-u-c-k', look: 'rajwada', content })).status, 400) // hyphens don't hide it
assert.equal((await call('POST', '/api/sites', { slug: 'fuckyou-1', look: 'rajwada', content })).status, 400)
assert.equal((await call('POST', '/api/sites', { slug: 'Bad Slug', look: 'rajwada', content })).status, 400)
assert.equal((await call('POST', '/api/sites', { slug: 'admin', look: 'rajwada', content })).status, 400)

const made = await call('POST', '/api/sites', { slug, look: 'rajwada', content })
assert.equal(made.status, 201, JSON.stringify(made.data))
const { key } = made.data
assert.match(made.data.content.photos.hero.src, /\/api\/photo\//) // the stored content comes back with the key
// A bad word is only matched inside one word: Durga and Andrew may marry (durGA-ANDrew).
const durga = await call('POST', '/api/sites', { slug: `durga-andrew-${slug.slice(-6)}`, look: 'rajwada', content: { ...content, story: [], photos: { gallery: [] } } })
assert.equal(durga.status, 201, JSON.stringify(durga.data))
assert.equal((await call('DELETE', `/api/sites/durga-andrew-${slug.slice(-6)}`, undefined, durga.data.key)).status, 200)
assert.equal((await call('POST', '/api/sites', { slug, look: 'rajwada', content })).status, 409)

const got = await call('GET', `/api/sites/${slug}`)
assert.equal(got.status, 200)
const hero = got.data.content.photos.hero.src
assert.match(hero, new RegExp(`/api/photo/${slug}/[a-f0-9]{16}\\.jpg$`))
assert.equal(got.data.content.story[0].photo.src, hero) // same upload stored once
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
const noPhotos = { ...edited, story: [], photos: { gallery: [] } }
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
assert.equal((await call('GET', `/api/sites/${slug}/rsvps`)).status, 403)
const rsvps = await call('GET', `/api/sites/${slug}/rsvps`, undefined, key)
assert.equal(rsvps.data[0].party, 3)
assert.equal((await call('DELETE', `/api/sites/${slug}/blessings/${list.data[0].id}`, undefined, key)).status, 200)
assert.equal((await call('GET', `/api/sites/${slug}/blessings`)).data.length, 0)
assert.equal((await call('POST', `/api/sites/${slug}/blessings`, { name: 'Asha', text: 'Two people who really deserve each other. May Maa Durga and Ganesh ji bless you.' })).status, 201)
assert.equal((await call('POST', `/api/sites/${slug}/report`, { reason: 'spam' })).status, 201)
assert.equal((await call('GET', '/api/sites/no-such-site')).status, 404)
assert.equal((await call('DELETE', `/api/sites/${slug}`, undefined, 'wrong')).status, 403)
assert.equal((await call('DELETE', `/api/sites/${slug}`, undefined, key)).status, 200)
assert.equal((await call('GET', `/api/sites/${slug}`)).status, 404)

console.log(`ok: ${slug}`)
