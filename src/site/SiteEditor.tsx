import { ArrowLeft, Copy, ExternalLink, Loader2, Mail, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Wordmark } from '../Hero'
import { api, editKey, editLink, lean, liveLink } from './api'
import { go, LOOKS, lookById, type Content, type Look } from './designs'
import type { SiteData } from './HostedSite'
import type { Photo } from './photos'
import { useTitle } from './shared'
import { Segmented, useSplit } from '../ui'

// The wedding website editor: /websites/<design>/edit starts a new site from a design, /w/<slug>/edit#<key>
// edits a published one (the secret link from publishing; App.tsx keeps the key and takes it off the address). The form is on the left, and the live site on the
// right in an iframe (/websites/preview, HostedSite.tsx), so its full-screen sections behave as on a phone.
// A new site's draft is kept in localStorage until it is published, and after, so this browser can keep editing.

type Draft = SiteData & { slug: string; slugTouched?: boolean; key?: string }
type Rsvp = { id: number; at: number; name: string; side: string; events: string[]; party: number; note: string }
type Blessing = { id: number; name: string; text: string; at: number }

const DRAFT = 'sitedraft'
const MAX_PHOTOS = 12
const inputCls = 'mt-1.5 w-full rounded-md border border-wine/20 bg-paper px-3.5 py-2.5 text-base outline-none transition-colors hover:border-wine/40 focus:border-wine focus:ring-2 focus:ring-zari/40'
const btn = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-60 pointer-coarse:min-h-11'
const small = 'inline-flex items-center gap-1.5 rounded-full border border-wine/25 px-3 py-1.5 text-sm text-wine hover:bg-wine/5 pointer-coarse:min-h-11'

// A look's demo words, without its photos: anything left out shows the design's own photo.
const fresh = (l: Look): Content => ({
  ...l.demo,
  story: l.demo.story.map(({ photo: _, ...s }) => s),
  meet: l.demo.meet?.map(({ photo: _, ...m }) => m),
  events: l.demo.events.map(({ photo: _, ...e }, i) => ({ ...e, id: `e${i}` })),
  photos: { gallery: [] },
})
const ascii = (s: string) => s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// names-xxxx: the random tail keeps two couples with the same names apart, and stays put while the names are typed.
const suggest = (c: Content['couple'], tail = Math.random().toString(36).slice(2, 6)) => `${[ascii(c[0]), ascii(c[1])].filter(Boolean).join('-').slice(0, 30) || 'wedding'}-${tail}`

function startDraft(lookId: string): Draft {
  const look = lookById(lookId) ?? LOOKS[0]
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT) ?? 'null', (_, v) => (typeof v?.src === 'string' && !v.small ? { ...v, small: v.src } : v)) as Draft | null
    if (saved?.content) return { ...saved, look: look.id }
  } catch {
    /* no draft */
  }
  const content = fresh(look)
  return { look: look.id, content, slug: suggest(content.couple) }
}

// Blank optional sections are left out, and blank lines dropped, so the site doesn't draw empty scrolls.
const prep = (c: Content): Content => ({
  ...c,
  notes: c.notes.map((n) => n.trim()).filter(Boolean),
  compliments: c.compliments?.map((n) => n.trim()).filter(Boolean).length ? c.compliments.map((n) => n.trim()).filter(Boolean) : undefined,
  meet: c.meet?.some((m) => m.bio.trim()) ? c.meet : undefined,
  invocation: c.invocation?.trim() || undefined,
  note: c.note?.trim() || undefined,
})

// After a save: the server's copy (uploaded photos now have addresses), keeping the lines and bios as typed.
const stored = (mine: Content, server: Content): Content => ({ ...server, notes: mine.notes, compliments: mine.compliments, meet: mine.meet, invocation: mine.invocation, note: mine.note })

const photosIn = (c: Content) =>
  new Set([c.photos.hero, c.photos.venue, ...c.photos.gallery, ...c.story.map((s) => s.photo), ...(c.meet ?? []).map((m) => m.photo)].filter((p): p is Photo => !!p).map((p) => p.src))

// Phone photos are large; shrink each to 1600px JPEG under ~1.4 MB before it goes anywhere.
async function shrink(file: File, alt: string): Promise<Photo> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * scale)
  c.height = Math.round(bmp.height * scale)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  let q = 0.82
  let src = c.toDataURL('image/jpeg', q)
  while (src.length * 0.75 > 1_400_000 && q > 0.4) src = c.toDataURL('image/jpeg', (q -= 0.15))
  return { src, small: src, alt, pos: 'center' }
}

// For a draft too big to store: without the photos not yet published, so the words survive a reload.
const unsent = (k: string, v: any) => (k === 'gallery' ? v.filter((p: Photo) => !p.src.startsWith('data:')) : typeof v?.src === 'string' && v.src.startsWith('data:') ? undefined : v)

export default function SiteEditor() {
  const linked = location.pathname.match(/^\/w\/([a-z0-9-]+)\/edit/)?.[1] // opened from an edit link
  const key = linked ? editKey(linked) : ''
  const [local] = useState(() => (linked ? null : startDraft(location.pathname.split('/')[2])))
  // A published site is read from the server first: this browser's copy may be older than the live one (edited
  // since from the emailed link), and saving it would undo those edits.
  const [draft, setDraft] = useState<Draft | null>(local?.key ? null : local)
  const [error, setError] = useState(linked && !key ? 'This edit link is missing its key. Open the full link from your email.' : '')
  useEffect(() => {
    const slug = linked ?? (local?.key ? local.slug : '')
    if (!slug || (linked && !key)) return
    api<SiteData>(`sites/${slug}`).then(
      (s) => {
        if (!linked) history.replaceState(null, '', `/websites/${s.look}/edit/`)
        setDraft({ ...s, slug, key: key || local!.key })
      },
      (e: Error & { status?: number }) => {
        if (linked || e.status === 410) return setError(e.message)
        if (e.status !== 404) return setDraft(local) // offline: this browser's copy
        localStorage.removeItem(DRAFT) // deleted since, from the edit link
        setDraft(startNew(local!.look))
      },
    )
  }, [])
  useEffect(() => {
    if (!draft || linked) return
    try {
      localStorage.setItem(DRAFT, JSON.stringify(draft, lean))
    } catch {
      try {
        localStorage.setItem(DRAFT, JSON.stringify(draft, unsent))
      } catch {
        /* storage is off; the draft lasts as long as this page */
      }
    }
  }, [draft])
  useTitle('Make your wedding website | ShaadiTemplate')
  if (error)
    return (
      <main className="velvet grid min-h-svh place-items-center px-6 text-center text-rose">
        <p>{error}</p>
      </main>
    )
  if (!draft) return <div className="velvet min-h-svh" aria-busy="true" />
  return <Workbench draft={draft} setDraft={setDraft as (f: (d: Draft) => Draft) => void} />
}

function Workbench({ draft, setDraft }: { draft: Draft; setDraft: (f: (d: Draft) => Draft) => void }) {
  const c = draft.content
  // Edits apply to the latest draft, as photos finish shrinking after other edits.
  const up = (f: (c: Content) => Partial<Content>) =>
    setDraft((d) => {
      const patch = f(d.content)
      return { ...d, content: { ...d.content, ...patch }, slug: !d.key && !d.slugTouched && patch.couple ? suggest(patch.couple, d.slug.split('-').pop()) : d.slug }
    })
  const pair = (k: 'couple' | 'families' | 'parents', i: number, v: string) => up((c) => ({ [k]: (i ? [c[k][0], v] : [v, c[k][1]]) as [string, string] }))
  const item = <K extends 'events' | 'story'>(k: K, i: number, patch: Partial<Content[K][number]>) => up((c) => ({ [k]: c[k].map((x, j) => (j === i ? { ...x, ...patch } : x)) }))
  const drop = (k: 'events' | 'story', i: number) =>
    up((c) => {
      // The wedding day stays the same event when one before it goes (when not picked, it is the second event).
      const main = c.mainEvent ?? Math.min(1, c.events.length - 1)
      return { [k]: c[k].filter((_, j) => j !== i), ...(k === 'events' && { mainEvent: main === i ? undefined : main > i ? main - 1 : main }) }
    })
  const photo = (k: 'hero' | 'venue') => (p: Photo | undefined) => up((c) => ({ photos: { ...c.photos, [k]: p } }))
  // A new site's address bar names its design, so a reload keeps the one picked here.
  const pickLook = (look: string) => {
    if (location.pathname.startsWith('/websites/')) history.replaceState(null, '', `/websites/${look}/edit/`)
    setDraft((d) => ({ ...d, look }))
  }
  // Back to a blank site: after deleting one, or to make another. From an edit link this leaves for the new-site page.
  const restart = () => {
    try {
      localStorage.removeItem(DRAFT)
    } catch {
      /* nothing saved */
    }
    if (location.pathname.startsWith('/websites/')) setDraft(() => startNew(draft.look))
    else go(`/websites/${draft.look}/edit/`)
  }
  const count = photosIn(c).size
  const names = c.couple.filter(Boolean).join(' and ') || 'Your names'

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [justPublished, setJustPublished] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  // Up to the links, once they are on the page (a scroll started before that is cut short as the page grows).
  useEffect(() => {
    if (justPublished) scrollTo(0, 0)
  }, [justPublished])
  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 4000)
    return () => clearTimeout(t)
  }, [saved])

  const publish = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    const body = { slug: draft.slug, look: draft.look, content: prep(c) }
    try {
      if (draft.key) {
        const s = await api<SiteData>(`sites/${draft.slug}`, { method: 'PUT', key: draft.key, body })
        setDraft((d) => ({ ...d, content: stored(d.content, s.content) }))
        setSaved(true)
      } else {
        // The reply carries the stored content: uploaded photos now have addresses, so the next save doesn't send them again.
        const r = await api<SiteData & { key: string }>('sites', { method: 'POST', body })
        setDraft((d) => ({ ...d, content: stored(d.content, r.content), key: r.key }))
        setJustPublished(true)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Live preview: the iframe asks for the site when it loads, and gets every edit after (a beat later, so typing
  // doesn't re-draw it on every key).
  const frame = useRef<HTMLIFrameElement>(null)
  const split = useSplit('site')
  const [view, setView] = useState<'phone' | 'computer'>('phone')
  const computer = view === 'computer'
  const stage = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setScale(Math.max(0.1, Math.min(1, (e.contentRect.width - 12) / 1280, (e.contentRect.height - 12) / 800))))
    ro.observe(stage.current!)
    return () => ro.disconnect()
  }, [])
  const latest = useRef<SiteData>(null)
  latest.current = { look: draft.look, content: prep(c) }
  useEffect(() => {
    const on = (e: MessageEvent) => e.origin === location.origin && e.data === 'preview-ready' && frame.current?.contentWindow?.postMessage(latest.current, location.origin)
    addEventListener('message', on)
    return () => removeEventListener('message', on)
  }, [])
  useEffect(() => {
    const t = setTimeout(() => frame.current?.contentWindow?.postMessage(latest.current, location.origin), 150)
    return () => clearTimeout(t)
  }, [draft])

  const photoField = (label: string, photo: Photo | undefined, set: (p: Photo | undefined) => void, alt: string) => (
    <PhotoPick label={label} photo={photo} onChange={set} alt={alt} full={count >= MAX_PHOTOS} onError={setError} />
  )

  return (
    // Couples' names and details never reach Clarity recordings.
    <div className="min-h-screen bg-rose text-ink" data-clarity-mask="true">
      <header className="velvet sticky top-0 z-20 text-rose shadow-[0_8px_24px_-12px_rgba(10,0,4,0.6)]">
        <div className="flex items-center gap-x-4 px-4 py-3 sm:px-6">
          <a href="/websites/" className="inline-flex shrink-0 items-center gap-1.5 py-2 text-[15px] text-rose/80 hover:text-rose pointer-coarse:min-h-11">
            <ArrowLeft className="size-4" aria-hidden /> <span className="hidden sm:inline">All designs</span>
            <span className="sm:hidden">Back</span>
          </a>
          <span className="hidden lg:inline">
            <Wordmark />
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setShowPreview(true)} className={`${btn} border border-zari/70 text-rose hover:bg-white/10 lg:hidden`}>
              Preview
            </button>
            <button type="submit" form="site-form" disabled={busy} className={`${btn} zari-button text-wine-deep`}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {draft.key ? 'Save changes' : 'Publish free'}
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_min(var(--pane,450px),calc(100vw-420px))]" style={split.style}>
        <form id="site-form" onSubmit={publish} className="min-w-0 px-4 pb-24 pt-8 sm:px-8 lg:px-12">
          {/* Nothing can be typed while a save is on its way: the reply replaces the form's content. */}
          <div className="mx-auto max-w-2xl space-y-12" inert={busy}>
            <section className="space-y-4">
              <h1 className="font-display text-[34px] leading-tight tracking-[-0.015em] sm:text-[42px]">Your wedding website</h1>
              <p className="text-ink/70">Free, on shaaditemplate.com. Fill in your details and publish; you can keep editing after.</p>
              {draft.key && <Live draft={draft} fresh={justPublished} />}
            </section>

            {draft.key && <Replies slug={draft.slug} edit={draft.key} events={c.events} />}

            <section className="space-y-5">
              <Step n={1} title="Design and address" />
              <label className="block">
                <span className="text-[13px] text-ink/65">Design</span>
                <select value={draft.look} onChange={(e) => pickLook(e.target.value)} className={`${inputCls} select-chevron pr-10`}>
                  {LOOKS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.tradition})
                    </option>
                  ))}
                </select>
              </label>
              {draft.key ? (
                <p className="text-[15px] text-ink/75">
                  Your address: <strong className="font-medium">shaaditemplate.com/w/{draft.slug}</strong>
                </p>
              ) : (
                <label className="block">
                  <span className="text-[13px] text-ink/65">Your address</span>
                  <span className="mt-1.5 flex items-stretch overflow-hidden rounded-md border border-wine/20 bg-paper focus-within:border-wine focus-within:ring-2 focus-within:ring-zari/40">
                    <span className="flex items-center bg-wine/5 px-3 text-[15px] text-ink/60">shaaditemplate.com/w/</span>
                    <input
                      value={draft.slug}
                      onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'), slugTouched: true }))}
                      required
                      minLength={4}
                      maxLength={40}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      title="Lowercase letters, numbers and single hyphens"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base outline-none"
                    />
                  </span>
                  <span className="mt-1.5 block text-[13px] text-ink/55">Lowercase letters, numbers and hyphens. You can't change it after publishing.</span>
                </label>
              )}
            </section>

            <section className="space-y-5">
              <Step n={2} title="The two of you" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-4">
                    <Text label={i ? 'Second name' : 'First name'} value={c.couple[i]} onChange={(v) => pair('couple', i, v)} required maxLength={40} />
                    <Text label="Family, as guests pick it in the RSVP" value={c.families[i]} onChange={(v) => pair('families', i, v)} maxLength={80} />
                    <Text label="Son or daughter of" value={c.parents[i]} onChange={(v) => pair('parents', i, v)} multiline maxLength={300} />
                  </div>
                ))}
              </div>
              <Text label="Invitation line" value={c.invite} onChange={(invite) => up(() => ({ invite }))} multiline maxLength={400} />
              <Text label="Invocation on the opening screen (optional)" value={c.invocation ?? ''} onChange={(invocation) => up(() => ({ invocation }))} placeholder="श्री गणेशाय नमः" maxLength={80} />
            </section>

            <section className="space-y-5">
              <Step n={3} title="Where and when" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="City" value={c.city} onChange={(city) => up(() => ({ city }))} maxLength={60} />
                <Text label="Reply by" value={c.rsvpBy} onChange={(rsvpBy) => up(() => ({ rsvpBy }))} placeholder="15 November" maxLength={40} />
              </div>
              <Text label="Venue (the map link searches for this)" value={c.venue} onChange={(venue) => up(() => ({ venue }))} maxLength={160} />
              <div className="space-y-4">
                {c.events.map((e, i) => (
                  <fieldset key={i} className="space-y-3 rounded-md bg-paper/70 p-4 ring-1 ring-wine/10">
                    <legend className="sr-only">Event {i + 1}</legend>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                      <Text label="Event" value={e.name} onChange={(name) => item('events', i, { name })} required maxLength={60} />
                      <label className="block">
                        <span className="text-[13px] text-ink/65">Date</span>
                        <input type="date" value={e.date} onChange={(x) => item('events', i, { date: x.target.value })} required className={inputCls} />
                      </label>
                      <label className="block">
                        <span className="text-[13px] text-ink/65">Starts (IST)</span>
                        <input type="time" value={e.time} onChange={(x) => item('events', i, { time: x.target.value })} required className={inputCls} />
                      </label>
                    </div>
                    <Text label="Time and place, in words (optional)" value={e.where} onChange={(where) => item('events', i, { where })} placeholder="7 pm, in the palace lawns" maxLength={120} />
                    <Text label="Note for guests" value={e.note} onChange={(note) => item('events', i, { note })} maxLength={300} />
                    {c.events.length > 1 && (
                      <button type="button" onClick={() => drop('events', i)} className={small}>
                        <Trash2 className="size-4" aria-hidden /> Remove {e.name || 'event'}
                      </button>
                    )}
                  </fieldset>
                ))}
                {c.events.length > 1 && (
                  <label className="block">
                    <span className="text-[13px] text-ink/65">The wedding day (for the countdown and save-the-date)</span>
                    <select value={c.mainEvent ?? Math.min(1, c.events.length - 1)} onChange={(e) => up(() => ({ mainEvent: Number(e.target.value) }))} className={`${inputCls} select-chevron pr-10`}>
                      {c.events.map((e, i) => (
                        <option key={i} value={i}>
                          {e.name || `Event ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {c.events.length < 8 && (
                  <button type="button" onClick={() => up((c) => ({ events: [...c.events, { id: Math.random().toString(36).slice(2, 8), name: '', date: '', time: '19:00', where: '', note: '' }] }))} className={small}>
                    <Plus className="size-4" aria-hidden /> Add an event
                  </button>
                )}
              </div>
            </section>

            <section className="space-y-5">
              <Step n={4} title="Photos" />
              <p className="text-[15px] text-ink/70">
                Up to {MAX_PHOTOS} photos ({count} used). Any you leave out show the design's own photo.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {photoField('Cover photo', c.photos.hero, photo('hero'), names)}
                {photoField('Venue photo', c.photos.venue, photo('venue'), c.venue)}
              </div>
              <div>
                <span className="text-[13px] text-ink/65">Gallery (up to 8)</span>
                <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {c.photos.gallery.map((p, i) => (
                    <li key={p.src.slice(-40) + i} className="relative">
                      <img src={p.src} alt="" className="aspect-square w-full rounded-md object-cover" />
                      <button type="button" aria-label={`Remove gallery photo ${i + 1}`} onClick={() => up((c) => ({ photos: { ...c.photos, gallery: c.photos.gallery.filter((_, j) => j !== i) } }))} className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-wine-deep/80 text-rose pointer-coarse:size-11">
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                  {c.photos.gallery.length < 8 && count < MAX_PHOTOS && (
                    <li>
                      <label className="grid aspect-square w-full cursor-pointer place-items-center rounded-md border border-dashed border-wine/30 text-sm text-wine hover:bg-wine/5">
                        <span className="flex flex-col items-center gap-1">
                          <Plus className="size-5" aria-hidden /> Add photos
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={async (e) => {
                            const room = Math.min(8 - c.photos.gallery.length, MAX_PHOTOS - count)
                            const files = [...(e.target.files ?? [])].slice(0, room)
                            e.target.value = ''
                            try {
                              const added = await Promise.all(files.map((f) => shrink(f, names)))
                              up((c) => ({ photos: { ...c.photos, gallery: [...c.photos.gallery, ...added] } }))
                            } catch {
                              setError('One of those photos could not be opened. Try a JPEG or PNG.')
                            }
                          }}
                        />
                      </label>
                    </li>
                  )}
                </ul>
              </div>
            </section>

            <section className="space-y-5">
              <Step n={5} title="Your story" />
              {c.story.map((s, i) => (
                <fieldset key={i} className="space-y-3 rounded-md bg-paper/70 p-4 ring-1 ring-wine/10">
                  <legend className="sr-only">Chapter {i + 1}</legend>
                  <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
                    <Text label="Year" value={s.year} onChange={(year) => item('story', i, { year })} maxLength={12} />
                    <Text label="Title" value={s.title} onChange={(title) => item('story', i, { title })} maxLength={80} />
                  </div>
                  <Text label="What happened" value={s.body} onChange={(body) => item('story', i, { body })} multiline maxLength={400} />
                  {photoField('Photo', s.photo, (photo) => item('story', i, { photo }), s.title)}
                  <button type="button" onClick={() => drop('story', i)} className={small}>
                    <Trash2 className="size-4" aria-hidden /> Remove this chapter
                  </button>
                </fieldset>
              ))}
              {c.story.length < 6 && (
                <button type="button" onClick={() => up((c) => ({ story: [...c.story, { year: '', title: '', body: '' }] }))} className={small}>
                  <Plus className="size-4" aria-hidden /> Add a chapter
                </button>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <Text
                    key={i}
                    label={`About ${c.couple[i] || (i ? 'the second of you' : 'the first of you')} (optional)`}
                    value={c.meet?.[i]?.bio ?? ''}
                    onChange={(bio) => up((c) => ({ meet: [0, 1].map((j) => (j === i ? { ...c.meet?.[j], bio } : (c.meet?.[j] ?? { bio: '' }))) }))}
                    multiline
                    maxLength={500}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <Step n={6} title="Notes for guests" />
              <Text label="A note from the two of you (optional)" value={c.note ?? ''} onChange={(note) => up(() => ({ note }))} multiline maxLength={400} />
              <Text label="Things to note, one per line" value={c.notes.join('\n')} onChange={(v) => up(() => ({ notes: v.split('\n') }))} multiline rows={4} />
              <Text label="With best compliments from, one per line (optional)" value={(c.compliments ?? []).join('\n')} onChange={(v) => up(() => ({ compliments: v.split('\n') }))} multiline rows={3} />
            </section>

            <section className="space-y-3 border-t border-zari/40 pt-8">
              <button type="submit" disabled={busy} className={`${btn} zari-button px-6 text-wine-deep`}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {draft.key ? 'Save changes' : 'Publish free'}
              </button>
              <p className="text-[13px] text-ink/60">
                By publishing you agree to our{' '}
                <a href="/terms.html" className="underline underline-offset-2">
                  terms
                </a>
                . Your site can be seen by anyone with its link and is not listed by search engines. See our{' '}
                <a href="/privacy.html" className="underline underline-offset-2">
                  privacy policy
                </a>
                .
              </p>
              {draft.key && (
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <button
                    type="button"
                    className="text-[13px] text-wine underline underline-offset-2 pointer-coarse:min-h-11"
                    onClick={() => confirm('Start a new website? Keep your edit link: it is the only way back to this one.') && restart()}
                  >
                    Start a new website instead
                  </button>
                  <button
                    type="button"
                    className="text-[13px] text-maroon underline underline-offset-2 pointer-coarse:min-h-11"
                    onClick={async () => {
                      if (!confirm('Delete your website for good? Its photos, replies and blessings go too. This cannot be undone.')) return
                      try {
                        await api(`sites/${draft.slug}`, { method: 'DELETE', key: draft.key })
                        alert('Your website has been deleted.')
                        restart()
                      } catch (err) {
                        setError((err as Error).message)
                      }
                    }}
                  >
                    Delete this website
                  </button>
                </div>
              )}
            </section>
          </div>
        </form>

        {/* Fixed to the screen, so it is seen wherever in the long form the button was pressed. */}
        {(error || saved) && (
          <p role="alert" className={`fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-md px-4 py-3 text-[15px] shadow-xl ${error ? 'bg-maroon text-rose' : 'bg-paper text-wine ring-1 ring-zari'}`}>
            <span className="flex-1">{error || 'Saved. Your website is up to date.'}</span>
            <button type="button" onClick={() => (setError(''), setSaved(false))} className="underline underline-offset-2 pointer-coarse:min-h-11">
              Close
            </button>
          </p>
        )}

        {/* The live site: in a phone-sized frame, or as a computer shows it (a 1280 by 800 window, scaled to fit).
            On wide screens it sits beside the form; on phones it opens full screen behind "Preview". */}
        <aside className={`${showPreview ? 'fixed inset-0 z-30 flex' : 'hidden'} velvet flex-col lg:sticky lg:top-[64px] lg:z-auto lg:flex lg:h-[calc(100svh-64px)] lg:p-6`}>
          {split.handle}
          <div className="flex items-center justify-between px-4 py-2 text-rose lg:hidden">
            <span className="text-sm text-rose/75">Preview</span>
            <button type="button" onClick={() => setShowPreview(false)} className={`${btn} border border-zari/70`}>
              Back to editing
            </button>
          </div>
          <div ref={stage} className="grid min-h-0 w-full flex-1 place-items-center overflow-hidden">
            <div className={computer ? 'overflow-hidden rounded-lg border-[6px] border-[#120b0e] shadow-2xl' : 'h-full w-full lg:max-w-[402px]'} style={computer ? { width: 1280 * scale + 12, height: 800 * scale + 12 } : undefined}>
              <iframe
                ref={frame}
                src="/websites/preview/"
                title="Preview of your wedding website"
                className={`block border-0 bg-[#0e0a0c] ${computer ? 'origin-top-left' : 'h-full w-full lg:rounded-[1.6rem] lg:border-[6px] lg:border-[#120b0e] lg:shadow-2xl'}`}
                style={computer ? { width: 1280, height: 800, transform: `scale(${scale})` } : undefined}
              />
            </div>
          </div>
          <div className="mx-auto my-2 flex flex-wrap items-center justify-center gap-3 lg:mb-0 lg:mt-4">
            <Segmented
              dark
              label="Preview as seen on"
              value={view}
              onChange={(v) => {
                setView(v)
                // A computer's view needs room to be read: give the preview half the window if it has less.
                if (v === 'computer' && innerWidth >= 1024 && stage.current!.clientWidth < 600) split.set(innerWidth / 2)
              }}
              options={[
                { id: 'phone', label: 'Phone' },
                { id: 'computer', label: 'Computer' },
              ]}
            />
            <button type="button" onClick={() => frame.current?.contentWindow?.postMessage('preview-replay', location.origin)} className={`${btn} border border-zari/70 text-rose hover:bg-white/10`}>
              Replay the opening
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}

const startNew = (look: string): Draft => {
  const content = fresh(lookById(look) ?? LOOKS[0])
  return { look, content, slug: suggest(content.couple) }
}

const Step = ({ n, title }: { n: number; title: string }) => (
  <h2 className="flex items-baseline gap-3 border-b border-zari/40 pb-3 font-display text-2xl">
    <span className="font-display text-xl italic text-zari">{n}</span>
    {title}
  </h2>
)

function Text({ label, value, onChange, multiline, rows = 3, ...rest }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number; required?: boolean; maxLength?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink/65">{label}</span>
      {multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${inputCls} resize-y`} {...rest} /> : <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} {...rest} />}
    </label>
  )
}

function PhotoPick({ label, photo, onChange, alt, full, onError }: { label: string; photo?: Photo; onChange: (p: Photo | undefined) => void; alt: string; full: boolean; onError: (e: string) => void }) {
  return (
    <div>
      <span className="text-[13px] text-ink/65">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        {photo ? <img src={photo.src} alt="" className="size-16 rounded-md object-cover" /> : <span className="grid size-16 place-items-center rounded-md bg-wine/5 text-center text-[11px] leading-tight text-ink/50">Design photo</span>}
        <label className={`${small} ${full && !photo ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
          {photo ? 'Change' : 'Choose photo'}
          <input
            type="file"
            accept="image/*"
            disabled={full && !photo}
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) shrink(f, alt).then(onChange, () => onError('That photo could not be opened. Try a JPEG or PNG.'))
            }}
          />
        </label>
        {photo && (
          <button type="button" onClick={() => onChange(undefined)} className={small}>
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const copy = (text: string, done: (s: string) => void) => navigator.clipboard.writeText(text).then(() => done('Copied'), () => done('Select the link and copy it'))

// The live link and the secret edit link, shown big right after publishing and small after that.
function Live({ draft, fresh }: { draft: Draft; fresh: boolean }) {
  const live = liveLink(draft.slug)
  const edit = editLink(draft.slug, draft.key!)
  const [note, setNote] = useState('')
  const names = draft.content.couple.join(' & ')
  const mail = `mailto:?subject=${encodeURIComponent('Our wedding website: edit link')}&body=${encodeURIComponent(`Our wedding website: ${live}\n\nSecret edit link (keep it private, anyone with it can change the site):\n${edit}`)}`
  return (
    <div className={`space-y-4 rounded-md p-5 ring-1 ${fresh ? 'bg-paper ring-zari' : 'bg-paper/70 ring-wine/10'}`}>
      {fresh && <p className="font-display text-2xl">Your website is live.</p>}
      <div>
        <span className="text-[13px] text-ink/65">Share this link with guests</span>
        <p className="mt-1 break-all font-medium">{live}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => copy(live, setNote)} className={small}>
            <Copy className="size-4" aria-hidden /> Copy
          </button>
          <a href={live} target="_blank" rel="noreferrer" className={small}>
            <ExternalLink className="size-4" aria-hidden /> Open
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(`${names}: our wedding website ${live}`)}`} target="_blank" rel="noreferrer" className={small}>
            Send on WhatsApp
          </a>
        </div>
      </div>
      <div className={fresh ? 'rounded-md bg-zari/15 p-4' : ''}>
        <span className="text-[13px] text-ink/65">Your secret edit link</span>
        <p className="mt-1 break-all text-[15px]">{edit}</p>
        <p className="mt-1 text-[13px] text-ink/60">There is no password. Anyone with this link can change your site, and we can't send it again, so email it to yourself now.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={mail} className={small}>
            <Mail className="size-4" aria-hidden /> Email it to me
          </a>
          <button type="button" onClick={() => copy(edit, setNote)} className={small}>
            <Copy className="size-4" aria-hidden /> Copy
          </button>
        </div>
      </div>
      <p className="text-[13px] text-wine" aria-live="polite">
        {note}
      </p>
    </div>
  )
}

// Guests' replies and blessings, for the couple only (needs the edit key).
function Replies({ slug, edit, events }: { slug: string; edit: string; events: Content['events'] }) {
  const eventName = (id: string) => events.find((e, i) => (e.id ?? `e${i}`) === id)?.name || 'an event since removed'
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null)
  const [blessings, setBlessings] = useState<Blessing[]>([])
  useEffect(() => {
    api<Rsvp[]>(`sites/${slug}/rsvps`, { key: edit }).then(setRsvps, () => setRsvps([]))
    api<Blessing[]>(`sites/${slug}/blessings`).then(setBlessings, () => {})
  }, [slug, edit])
  if (!rsvps) return null
  // A guest who replies twice counts once: their latest reply.
  const latest = [...new Map([...rsvps].reverse().map((r) => [r.name.toLowerCase(), r])).values()] // rows come newest first
  const coming = latest.filter((r) => r.events.length)
  const remove = async (id: number) => {
    if (!confirm('Remove this blessing from your site?')) return
    await api(`sites/${slug}/blessings/${id}`, { method: 'DELETE', key: edit }).then(() => setBlessings((b) => b.filter((x) => x.id !== id)), () => {})
  }
  return (
    <section className="space-y-5">
      <h2 className="border-b border-zari/40 pb-3 font-display text-2xl">Guest replies</h2>
      <p className="text-[15px] text-ink/75">
        {latest.length ? `${latest.length} ${latest.length === 1 ? 'reply' : 'replies'}: ${plural(coming.reduce((n, r) => n + r.party, 0), 'guest')} coming, ${latest.length - coming.length} can't make it.` : 'No replies yet. Share your link with guests.'}
      </p>
      {latest.length > 0 && (
        <Details summary="See every reply">
          <ul className="divide-y divide-wine/10">
            {latest.map((r) => (
              <li key={r.id} className="py-3 text-[15px]">
                <span className="font-medium">{r.name}</span> · {r.events.length ? `${r.party} for ${r.events.map(eventName).join(', ')}` : "can't come"}
                {r.note && <span className="block text-ink/65">{r.note}</span>}
              </li>
            ))}
          </ul>
        </Details>
      )}
      {blessings.length > 0 && (
        <Details summary={`${blessings.length} ${blessings.length === 1 ? 'blessing' : 'blessings'}`}>
          <ul className="divide-y divide-wine/10">
            {blessings.map((b) => (
              <li key={b.id} className="flex items-start justify-between gap-3 py-3 text-[15px]">
                <span>
                  {b.text} <span className="text-ink/60">· {b.name}</span>
                </span>
                <button type="button" onClick={() => remove(b.id)} className={small}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </Details>
      )}
    </section>
  )
}

const Details = ({ summary, children }: { summary: string; children: ReactNode }) => (
  <details className="rounded-md bg-paper/70 px-4 py-2 ring-1 ring-wine/10">
    <summary className="cursor-pointer select-none py-1 text-wine pointer-coarse:py-3">{summary}</summary>
    {children}
  </details>
)
