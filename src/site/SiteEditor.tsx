import { ArrowLeft, ArrowUp, Copy, Download, ExternalLink, Loader2, Mail, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { track } from '../analytics'
import { Wordmark } from '../Hero'
import { api, editKey, editLink, lean, liveLink } from './api'
import { go, LOOKS, lookById, type Content, type Look } from './designs'
import type { SiteData } from './HostedSite'
import type { Photo } from './photos'
import { useTitle } from './shared'
import { TRACKS, youTubeClip, clipLink, clock, unclock, useClipPlayer, type Track } from './music'
import { Segmented, useSplit } from '../ui'

// The wedding website editor: /websites/<design>/edit starts a new site from a design, /w/<slug>/edit#<key>
// edits a published one (the secret link from publishing; App.tsx keeps the key and takes it off the address). The form is on the left, and the live site on the
// right in an iframe (/websites/preview, HostedSite.tsx), so its full-screen sections behave as on a phone.
// A new site's draft is kept in localStorage until it is published, and after, so this browser can keep editing.

type Draft = SiteData & { slug: string; slugTouched?: boolean; key?: string }
type Rsvp = { id: number; at: number; name: string; side: string; events: string[]; party: number; note: string; guest?: string }
type Blessing = { id: number; name: string; text: string; at: number }

const DRAFT = 'sitedraft'
const MAX_PHOTOS = 16
const inputCls = 'mt-1.5 w-full rounded-md border border-wine/20 bg-paper px-3.5 py-2.5 text-base outline-none transition-colors hover:border-wine/40 focus:border-wine focus:ring-2 focus:ring-zari/40'
const btn = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-60 pointer-coarse:min-h-11'
const small = 'inline-flex items-center gap-1.5 rounded-full border border-wine/25 px-3 py-1.5 text-sm text-wine hover:bg-wine/5 pointer-coarse:min-h-11'

// A look's demo words, without its photos (anything left out shows the design's own photo) and without what
// nobody should publish by leaving the box alone: the demo couple's names in their script, their invocation (a
// god that may not be the couple's; not checked in leftovers, as couples type the same common lines themselves)
// and their bios. Its events start with no directions (`map: ''`), which a couple adds per event.
const fresh = (l: Look): Content => ({
  ...l.demo,
  nativeNames: undefined,
  invocation: undefined,
  families: ['', ''],
  story: l.demo.story.map(({ photo: _, ...s }) => s),
  meet: l.demo.meet?.map(() => ({ bio: '' })),
  events: l.demo.events.map(({ photo: _, ...e }, i) => ({ ...e, id: `e${i}`, map: '' })),
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

// The parts of a site still holding a design's sample words, named as the form names them. Every design is checked:
// switching design keeps the words typed (or not) so far.
const DEMOS = LOOKS.map((l) => l.demo)
export function leftovers(c: Content): string[] {
  const any = (f: (d: Look['demo']) => (string | undefined)[], mine: (string | undefined)[]) => {
    const sample = new Set(DEMOS.flatMap(f).filter(Boolean))
    return mine.some((v) => v?.trim() && sample.has(v.trim()))
  }
  const found: [string, boolean][] = [
    ['your names', DEMOS.some((d) => d.couple[0] === c.couple[0].trim() && d.couple[1] === c.couple[1].trim())],
    ['family names', any((d) => [...d.families, ...d.parents], [...c.families, ...c.parents])],
    ['invitation line', any((d) => [d.invite], [c.invite])],
    ['city and venue', any((d) => [d.city, d.venue], [c.city, c.venue])],
    ['reply-by date', any((d) => [d.rsvpBy], [c.rsvpBy])],
    ['travel and stay', any((d) => [d.stay], [c.stay])],
    ['event dates', any((d) => d.events.map((e) => e.date), c.events.map((e) => e.date))],
    ['event places and notes', any((d) => d.events.flatMap((e) => [e.where, e.note]), c.events.flatMap((e) => [e.where, e.note]))],
    ['your story', any((d) => d.story.flatMap((x) => [x.title, x.body]), c.story.flatMap((x) => [x.title, x.body]))],
    ['note from the two of you', any((d) => [d.note], [c.note])],
    ['things to note', any((d) => d.notes, c.notes)],
    ['about the two of you', any((d) => d.meet?.map((m) => m.bio) ?? [], c.meet?.map((m) => m.bio) ?? [])],
    ['best compliments', any((d) => d.compliments ?? [], c.compliments ?? [])],
  ]
  return found.filter(([, on]) => on).map(([name]) => name)
}

// Blank optional sections are left out, and blank lines dropped, so the site doesn't draw empty scrolls.
const prep = (c: Content): Content => ({
  ...c,
  notes: c.notes.map((n) => n.trim()).filter(Boolean),
  compliments: c.compliments?.map((n) => n.trim()).filter(Boolean).length ? c.compliments.map((n) => n.trim()).filter(Boolean) : undefined,
  meet: c.meet?.some((m) => m.bio.trim()) ? c.meet : undefined,
  nativeNames: c.nativeNames?.trim() || undefined,
  invocation: c.invocation?.trim() || undefined,
  note: c.note?.trim() || undefined,
  stay: c.stay?.trim() || undefined,
  music: c.music?.trim() || undefined,
})

// After a save: the server's copy (uploaded photos now have addresses), keeping the lines and bios as typed.
const stored = (mine: Content, server: Content): Content => ({
  ...server,
  notes: mine.notes,
  compliments: mine.compliments,
  meet: mine.meet?.map((m, i) => ({ ...m, photo: server.meet?.[i]?.photo ?? m.photo })),
  nativeNames: mine.nativeNames,
  invocation: mine.invocation,
  note: mine.note,
  stay: mine.stay,
})

const photosIn = (c: Content) =>
  new Set([c.photos.hero, c.photos.venue, ...c.photos.gallery, ...c.story.map((s) => s.photo), ...c.events.map((e) => e.photo), ...(c.meet ?? []).map((m) => m.photo)].filter((p): p is Photo => !!p).map((p) => p.src))

// Phone photos are large; shrink each to 1600px JPEG under ~1 MB before it goes anywhere (16 of them fit one save).
// iPhones cap canvas memory, so the decoded photo and the canvas are let go as soon as the JPEG exists, and a canvas
// that could not be made fails as "could not be opened" rather than saving a blank photo.
let shrinking = 0 // photos still being shrunk: publish() waits for them
async function shrink(file: File, alt: string): Promise<Photo> {
  shrinking++
  const c = document.createElement('canvas')
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    c.width = Math.round(bmp.width * scale)
    c.height = Math.round(bmp.height * scale)
    const ctx = c.getContext('2d')
    if (!ctx) throw new Error('no canvas')
    ctx.drawImage(bmp, 0, 0, c.width, c.height)
    bmp.close()
    let q = 0.82
    let src = c.toDataURL('image/jpeg', q)
    while (src.length * 0.75 > 1_000_000 && q > 0.4) src = c.toDataURL('image/jpeg', (q -= 0.15))
    if (!src.startsWith('data:image/jpeg')) throw new Error('no image')
    return { src, small: src, alt, pos: 'center' }
  } finally {
    c.width = c.height = 0
    shrinking--
  }
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
        if (linked) return setError(e.message)
        if (e.status !== 404 && e.status !== 410) return setDraft(local) // offline: this browser's copy
        // Deleted since (from the edit link), or taken down: this browser starts a new site.
        try {
          localStorage.removeItem(DRAFT)
        } catch {
          /* storage is off */
        }
        setDraft(startNew(local!.look))
      },
    )
  }, [])
  // Saved a beat after typing stops: with photos the draft is megabytes, too much to write on every key. A new edit
  // key (just published) is written at once, and leaving the page writes whatever is still waiting.
  const savedKey = useRef(local?.key)
  useEffect(() => {
    if (!draft || linked) return
    const save = () => {
      clearTimeout(t)
      removeEventListener('pagehide', save)
      savedKey.current = draft.key
      try {
        localStorage.setItem(DRAFT, JSON.stringify(draft, lean))
      } catch {
        try {
          localStorage.setItem(DRAFT, JSON.stringify(draft, unsent))
        } catch {
          /* storage is off; the draft lasts as long as this page */
        }
      }
    }
    const t = setTimeout(save, draft.key !== savedKey.current ? 0 : 400)
    addEventListener('pagehide', save)
    return () => (clearTimeout(t), removeEventListener('pagehide', save))
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
  // Event dates may be at most a year ahead (the worker checks too, allowing a day more for time zones). Dates the
  // site already has on the server stay allowed: some were saved before the rule. The date box gets the limit, so
  // the browser points at the event before anything is sent, sample dates included.
  const [kept, setKept] = useState(() => new Set(draft.key ? c.events.map((e) => e.date) : []))
  const lastDay = new Date(Date.now() + 5.5 * 36e5 + 365 * 864e5).toISOString().slice(0, 10) // a year from today in India
  const tooFar = (date: string) => date > lastDay && !kept.has(date)
  // Edits apply to the latest draft, as photos finish shrinking after other edits.
  const up = (f: (c: Content) => Partial<Content>) => {
    setDirty(true)
    setDraft((d) => {
      const patch = f(d.content)
      return { ...d, content: { ...d.content, ...patch }, slug: !d.key && !d.slugTouched && patch.couple ? suggest(patch.couple, d.slug.split('-').pop()) : d.slug }
    })
  }
  const pair = (k: 'couple' | 'families' | 'parents', i: number, v: string) => up((c) => ({ [k]: (i ? [c[k][0], v] : [v, c[k][1]]) as [string, string] }))
  const item = <K extends 'events' | 'story'>(k: K, i: number, patch: Partial<Content[K][number]>) => up((c) => ({ [k]: c[k].map((x, j) => (j === i ? { ...x, ...patch } : x)) }))
  const drop = (k: 'events' | 'story', i: number) =>
    up((c) => {
      // The wedding day stays the same event when one before it goes (when not picked, it is the second event).
      const main = c.mainEvent ?? Math.min(1, c.events.length - 1)
      return { [k]: c[k].filter((_, j) => j !== i), ...(k === 'events' && { mainEvent: main === i ? undefined : main > i ? main - 1 : main }) }
    })
  // An event moves one place earlier; the wedding day stays the same event, and each keeps the id replies point at.
  const raise = (i: number) =>
    up((c) => {
      const events = c.events.map((e, j) => ({ ...e, id: e.id ?? `e${j}` }))
      ;[events[i - 1], events[i]] = [events[i], events[i - 1]]
      const main = c.mainEvent ?? Math.min(1, c.events.length - 1)
      return { events, mainEvent: main === i ? i - 1 : main === i - 1 ? i : main }
    })
  const photo = (k: 'hero' | 'venue') => (p: Photo | undefined) => up((c) => ({ photos: { ...c.photos, [k]: p } }))
  // A new site's address bar names its design, so a reload keeps the one picked here.
  const pickLook = (look: string) => {
    if (location.pathname.startsWith('/websites/')) history.replaceState(null, '', `/websites/${look}/edit/`)
    setDirty(true)
    setDraft((d) => ({ ...d, look }))
  }
  // Back to a blank site: after deleting one, or to make another. From an edit link this leaves for the new-site page.
  const restart = () => {
    try {
      localStorage.removeItem(DRAFT)
    } catch {
      /* nothing saved */
    }
    if (location.pathname.startsWith('/websites/')) {
      setKept(new Set())
      setDraft(() => startNew(draft.look))
    }
    else go(`/websites/${draft.look}/edit/`)
  }
  const count = photosIn(c).size
  const names = c.couple.filter(Boolean).join(' and ') || 'Your names'

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // A published site's edits live only on this page until saved (a reload opens the saved copy), so leaving asks first.
  const [dirty, setDirty] = useState(false)
  const unsaved = dirty && !!draft.key
  useEffect(() => {
    if (!unsaved) return
    const ask = (e: BeforeUnloadEvent) => e.preventDefault()
    addEventListener('beforeunload', ask)
    return () => removeEventListener('beforeunload', ask)
  }, [unsaved])
  // Whether the address is free, asked a beat after typing stops ('' while unknown).
  const [slugState, setSlugState] = useState<'' | 'free' | 'taken'>('')
  useEffect(() => {
    setSlugState('')
    if (draft.key || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug) || draft.slug.length < 4) return
    let live = true
    const t = setTimeout(
      () =>
        api(`sites/${draft.slug}`).then(
          () => live && setSlugState('taken'),
          (e: { status?: number }) => live && setSlugState(e.status === 404 ? 'free' : e.status === 410 ? 'taken' : ''),
        ),
      500,
    )
    return () => ((live = false), clearTimeout(t))
  }, [draft.slug, draft.key])
  // How to reach the couple and how they found us, asked with a first publish (all optional, see Reach).
  const [reach, setReach] = useState({ email: '', phone: '', marketing: false, heard: '' })
  // What a first publish stops for once (see publish): sample words guests would read as the couple's, and no way
  // to send the edit link again.
  const [warned, setWarned] = useState(false)
  const left = leftovers(c)
  const checks = [
    ...(left.length ? [`These still have the design's sample words, which guests will read as yours: ${left.join(', ')}.`] : []),
    ...(!reach.email.trim() && !reach.phone.trim() ? ["There's no email or WhatsApp number to send your edit link to. If you lose it, you can't change your site."] : []),
  ]
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
    if (shrinking) return setError('A photo is still being added. Try again in a moment.')
    // A first publish with sample words still in, or with no way to send the edit link, stops once and lists them
    // above the button (an in-page step: some in-app browsers skip confirm() without showing it).
    if (!draft.key && checks.length && !warned) {
      setWarned(true)
      setTimeout(() => document.getElementById('before-publish')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30)
      return
    }
    setBusy(true)
    setError('')
    setSaved(false)
    const body = { slug: draft.slug, look: draft.look, content: prep(c) }
    try {
      if (draft.key) {
        const s = await api<SiteData>(`sites/${draft.slug}`, { method: 'PUT', key: draft.key, body })
        setKept(new Set(s.content.events.map((e) => e.date)))
        setDraft((d) => ({ ...d, content: stored(d.content, s.content) }))
        setSaved(true)
        setDirty(false)
      } else {
        // The reply carries the stored content: uploaded photos now have addresses, so the next save doesn't send them again.
        const { heard, ...contact } = reach
        let source = ''
        try {
          source = localStorage.getItem('source') ?? ''
        } catch {
          /* storage blocked */
        }
        const r = await api<SiteData & { key: string }>('sites', { method: 'POST', body: { ...body, contact, source, heard } })
        setKept(new Set(r.content.events.map((e) => e.date)))
        setDraft((d) => ({ ...d, content: stored(d.content, r.content), key: r.key }))
        setDirty(false)
        setJustPublished(true)
        track('site_publish', { design: draft.look, contact: !!(contact.email || contact.phone), heard })
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
            {unsaved && <span className="hidden text-[13px] text-rose/75 sm:inline">Unsaved changes</span>}
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
              <Step n={1} title="Design, music and address" />
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
              <MusicField value={c.music} onChange={(music) => up(() => ({ music }))} />
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
                      onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-/, ''), slugTouched: true }))}
                      required
                      minLength={4}
                      maxLength={40}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      title="Lowercase letters, numbers and single hyphens"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base outline-none"
                    />
                  </span>
                  <span className="mt-1.5 block text-[13px] text-ink/55">
                    Lowercase letters, numbers and hyphens. You can't change it after publishing.{' '}
                    <span aria-live="polite" className={slugState === 'taken' ? 'font-medium text-maroon' : 'font-medium text-wine'}>
                      {slugState === 'free' ? 'This address is free.' : slugState === 'taken' ? 'This address is taken. Try another.' : ''}
                    </span>
                  </span>
                </label>
              )}
            </section>

            <section className="space-y-5">
              <Step n={2} title="The two of you" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-4">
                    <Text label={i ? "Groom's first name" : "Bride's first name"} value={c.couple[i]} onChange={(v) => pair('couple', i, v)} required maxLength={40} />
                    <Text label="Family name guests pick in the RSVP (optional)" value={c.families[i]} onChange={(v) => pair('families', i, v)} placeholder={c.couple[i] ? `${c.couple[i]}’s family` : 'Sharma family'} maxLength={80} />
                    <Text label="Son or daughter of" value={c.parents[i]} onChange={(v) => pair('parents', i, v)} multiline maxLength={300} />
                  </div>
                ))}
              </div>
              <Text label="Invitation line (optional)" value={c.invite} onChange={(invite) => up(() => ({ invite }))} multiline maxLength={400} />
              <Text label="Your names in your own language (optional)" value={c.nativeNames ?? ''} onChange={(nativeNames) => up(() => ({ nativeNames }))} placeholder="अदिति संग विहान" maxLength={80} />
              <Text label="Invocation on the opening screen (optional)" value={c.invocation ?? ''} onChange={(invocation) => up(() => ({ invocation }))} placeholder="श्री गणेशाय नमः" maxLength={80} />
            </section>

            <section className="space-y-5">
              <Step n={3} title="Where and when" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="City (optional)" value={c.city} onChange={(city) => up(() => ({ city }))} maxLength={60} />
                <Text label="Reply by (optional)" value={c.rsvpBy} onChange={(rsvpBy) => up(() => ({ rsvpBy }))} placeholder="15 November" maxLength={40} />
              </div>
              <Text label="Main venue (optional, the map link searches for this)" value={c.venue} onChange={(venue) => up(() => ({ venue }))} maxLength={160} />
              <Text label="Travel and stay, shown under the venue (optional)" value={c.stay ?? ''} onChange={(stay) => up(() => ({ stay }))} placeholder="Rooms are held at the hotel until 1 November. Mention our names when you book." multiline rows={2} maxLength={300} />
              <div className="space-y-4">
                {c.events.map((e, i) => (
                  <fieldset key={i} className="space-y-3 rounded-md bg-paper/70 p-4 ring-1 ring-wine/10">
                    <legend className="sr-only">Event {i + 1}</legend>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                      <Text label="Event" value={e.name} onChange={(name) => item('events', i, { name })} required maxLength={60} />
                      <label className="block">
                        <span className="text-[13px] text-ink/65">Date</span>
                        <input type="date" value={e.date} onChange={(x) => item('events', i, { date: x.target.value })} required max={kept.has(e.date) ? undefined : lastDay} className={inputCls} />
                      </label>
                      <label className="block">
                        <span className="text-[13px] text-ink/65">Starts (IST)</span>
                        <input type="time" value={e.time} onChange={(x) => item('events', i, { time: x.target.value })} required className={inputCls} />
                      </label>
                    </div>
                    {tooFar(e.date) && <p className="text-[13px] text-maroon">Choose a date up to a year from today, by {new Date(`${lastDay}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}.</p>}
                    <Text label="Place within the venue (optional)" value={e.where} onChange={(where) => item('events', i, { where })} placeholder="in the palace lawns" maxLength={120} />
                    <Text label="Note for guests (optional)" value={e.note} onChange={(note) => item('events', i, { note })} maxLength={300} />
                    <Text label="Directions (optional): a Google Maps link or the address" value={e.map ?? ''} onChange={(map) => item('events', i, { map })} placeholder="https://maps.app.goo.gl/…" maxLength={500} />
                    {photoField('Photo', e.photo, (photo) => item('events', i, { photo }), e.name)}
                    <div className="flex flex-wrap gap-2">
                      {i > 0 && (
                        <button type="button" onClick={() => raise(i)} className={small}>
                          <ArrowUp className="size-4" aria-hidden /> Move earlier
                        </button>
                      )}
                      {c.events.length > 1 && (
                        <button type="button" onClick={() => drop('events', i)} className={small}>
                          <Trash2 className="size-4" aria-hidden /> Remove {e.name || 'event'}
                        </button>
                      )}
                    </div>
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
                Up to {MAX_PHOTOS} photos across the site ({count} used), counting the ones on your events and story. Any you leave out show the design's own photo.
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
                              const added: Photo[] = []
                              for (const f of files) added.push(await shrink(f, names)) // one at a time: each is ~200 MB decoded on a phone
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
                  <div key={i} className="space-y-3">
                  <Text
                    label={`About ${c.couple[i] || (i ? 'the second of you' : 'the first of you')} (optional)`}
                    value={c.meet?.[i]?.bio ?? ''}
                    onChange={(bio) => up((c) => ({ meet: [0, 1].map((j) => (j === i ? { ...c.meet?.[j], bio } : (c.meet?.[j] ?? { bio: '' }))) }))}
                    multiline
                    maxLength={500}
                  />
                  {photoField('Photo beside it', c.meet?.[i]?.photo, (photo) => up((c) => ({ meet: [0, 1].map((j) => ({ bio: '', ...c.meet?.[j], ...(j === i && { photo }) })) })), c.couple[i])}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <Step n={6} title="Notes for guests" />
              <Text label="A note from the two of you (optional)" value={c.note ?? ''} onChange={(note) => up(() => ({ note }))} multiline maxLength={400} />
              <Text label="Things to note, one per line (optional)" value={c.notes.join('\n')} onChange={(v) => up(() => ({ notes: v.split('\n').slice(0, 20) }))} multiline rows={4} />
              <Text label="With best compliments from, one per line (optional)" value={(c.compliments ?? []).join('\n')} onChange={(v) => up(() => ({ compliments: v.split('\n').slice(0, 20) }))} multiline rows={3} />
            </section>

            {!draft.key && <Reach value={reach} onChange={setReach} />}

            <section className="space-y-3 border-t border-zari/40 pt-8">
              {warned && !draft.key && checks.length > 0 && (
                <div id="before-publish" role="alert" className="space-y-2 rounded-md bg-rose/40 p-4 ring-1 ring-maroon/25">
                  <p className="font-medium text-maroon">Before you publish</p>
                  <ul className="list-disc space-y-1 pl-5 text-[15px] text-ink/80">
                    {checks.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <p className="text-[13px] text-ink/60">Fix them above, or publish as it is.</p>
                </div>
              )}
              <button type="submit" disabled={busy} className={`${btn} zari-button px-6 text-wine-deep`}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {draft.key ? 'Save changes' : warned && checks.length ? 'Publish anyway' : 'Publish free'}
              </button>
              <p className="text-[13px] text-ink/60">
                By publishing you agree to our{' '}
                <a href="/terms.html" className="underline underline-offset-2">
                  terms
                </a>
                . Your site can be seen by anyone with its link and is not listed by search engines, and it is deleted 30 days after your last function. See our{' '}
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

// Background music, next to the design because it sets the site's feel: off, a built-in instrumental (starts with
// the guest's first tap) or any YouTube song (plays in YouTube's player when the guest taps "Play our song"). Each
// instrumental can be heard here before choosing it.
function MusicField({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const [yt, setYt] = useState(!!value && !value.startsWith('track:'))
  const clip = yt && value ? youTubeClip(value) : undefined
  const id = clip?.id
  const sample = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const listen = (t: Track) => {
    const a = sample.current
    if (!a) return
    if (playing === t.id) return a.pause()
    a.src = t.src
    a.play().catch(() => setPlaying(null))
  }
  const choice = yt ? 'youtube' : (value ?? '')
  const pick = (v: string) => {
    setYt(v === 'youtube')
    onChange(v === 'youtube' || !v ? undefined : v)
  }
  const row = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 ring-1 transition'
  const ring = (on: boolean) => (on ? 'bg-paper ring-wine/40' : 'ring-wine/10 hover:ring-wine/25')
  return (
    <fieldset className="space-y-2">
      <legend className="text-[13px] text-ink/65">Background music (optional)</legend>
      <audio ref={sample} onPlay={() => setPlaying(TRACKS.find((t) => sample.current?.src === t.src)?.id ?? null)} onPause={() => setPlaying(null)} onEnded={() => setPlaying(null)} />
      <label className={`${row} ${ring(choice === '')}`}>
        <input type="radio" name="music" checked={choice === ''} onChange={() => pick('')} className="size-4 accent-wine" />
        No music
      </label>
      {TRACKS.map((t) => (
        <div key={t.id} className={`${row} ${ring(choice === `track:${t.id}`)}`}>
          <label className="flex flex-1 cursor-pointer items-center gap-3">
            <input type="radio" name="music" checked={choice === `track:${t.id}`} onChange={() => pick(`track:${t.id}`)} className="size-4 accent-wine" />
            {t.name}
          </label>
          <button type="button" onClick={() => listen(t)} aria-label={`${playing === t.id ? 'Stop' : 'Listen to'} ${t.name}`} className="rounded-full px-3 py-1 text-[13px] text-wine ring-1 ring-wine/20 hover:bg-wine/5 pointer-coarse:min-h-11">
            {playing === t.id ? 'Stop' : 'Listen'}
          </button>
        </div>
      ))}
      <label className={`${row} ${ring(yt)}`}>
        <input type="radio" name="music" checked={yt} onChange={() => pick('youtube')} className="size-4 accent-wine" />
        A song of your choice from YouTube
      </label>
      {yt && (
        <div className="space-y-2 pt-1">
          <Text label="YouTube link" value={value ?? ''} onChange={(v) => onChange(v)} placeholder="https://youtu.be/…" maxLength={200} />
          <p className="text-[13px] text-ink/60">
            {value && !id
              ? 'That doesn’t look like a YouTube video link. Copy it from Share on the video.'
              : 'It starts in a small YouTube player when a guest first taps your site, and plays the part you choose below over and over. Some music labels block their videos on other sites; if yours won’t play here, pick another upload of the song.'}
          </p>
          {clip && <ClipPicker key={clip.id} {...clip} onChange={(s, e) => onChange(clipLink(clip.id, s, e))} />}
        </div>
      )}
      {!yt && <p className="text-[13px] text-ink/55">Free to use, credited on your site. It starts when a guest first taps the page.</p>}
    </fieldset>
  )
}

// Pick the part of the song that loops: play the video, tap "Starts here" and "Ends here" (or type the times).
function ClipPicker({ id, start, end, onChange }: { id: string; start: number; end?: number; onChange: (start: number, end?: number) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const player = useClipPlayer(box, id, start, end, { width: 280, height: 200 })
  const now = () => Math.floor(player.current?.getCurrentTime() ?? 0)
  const replay = () => player.current?.loadVideoById({ videoId: id, startSeconds: start, endSeconds: end })
  const time = (label: string, v: number | undefined, set: (n: number | undefined) => void, mark: () => void) => (
    <div className="flex items-end gap-2">
      <label className="block">
        <span className="text-[13px] text-ink/65">{label}</span>
        <input key={v} defaultValue={v === undefined ? '' : clock(v)} placeholder={v === undefined ? 'end of song' : '0:00'} inputMode="numeric" onBlur={(e) => set(e.target.value.trim() ? unclock(e.target.value) : undefined)} className={`${inputCls} w-28`} />
      </label>
      <button type="button" onClick={mark} className={`${small} mb-px`}>
        Set to now
      </button>
    </div>
  )
  return (
    <div className="space-y-3 rounded-md p-3 ring-1 ring-wine/10">
      <p className="text-[13px] text-ink/65">Choose the part that loops. Play the video, then tap Set to now where the part should start and end.</p>
      <div ref={box} className="h-[200px] w-[280px] max-w-full overflow-hidden rounded bg-black" />
      <div className="flex flex-wrap gap-4">
        {time('Starts at', start, (n) => onChange(n ?? 0, end && end > (n ?? 0) ? end : undefined), () => onChange(now(), end && end > now() ? end : undefined))}
        {time('Ends at', end, (n) => onChange(start, n && n > start ? n : undefined), () => onChange(start, now() > start ? now() : undefined))}
      </div>
      <button type="button" onClick={replay} className={small}>
        Play the loop
      </button>
    </div>
  )
}

function Text({ label, value, onChange, multiline, rows = 3, ...rest }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number; required?: boolean; maxLength?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink/65">{label}</span>
      {multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`${inputCls} resize-y`} {...rest} /> : <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} {...rest} />}
    </label>
  )
}

// The photo whole, with a mark on the part that stays in view wherever the site crops it. A tap moves the mark.
function Focus({ photo, onChange }: { photo: Photo; onChange: (p: Photo) => void }) {
  const [x, y] = /^\d+% \d+%$/.test(photo.pos) ? photo.pos.split(' ').map(parseFloat) : [50, 50]
  return (
    <button
      type="button"
      aria-label="Tap the part of the photo to keep in view"
      className="relative block cursor-crosshair overflow-hidden rounded-md"
      onClick={(e) => {
        if (!e.detail) return // a key press has no place on the photo
        const r = e.currentTarget.getBoundingClientRect()
        const pct = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100)
        onChange({ ...photo, pos: `${pct((e.clientX - r.left) / r.width)}% ${pct((e.clientY - r.top) / r.height)}%` })
      }}
    >
      <img src={photo.small} alt="" className="block max-h-40 w-auto max-w-full" />
      <span className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.5),0_0_8px_rgb(0_0_0/0.6)]" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden />
    </button>
  )
}

function PhotoPick({ label, photo, onChange, alt, full, onError }: { label: string; photo?: Photo; onChange: (p: Photo | undefined) => void; alt: string; full: boolean; onError: (e: string) => void }) {
  return (
    <div>
      <span className="text-[13px] text-ink/65">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        {photo ? <Focus photo={photo} onChange={onChange} /> : <span className="grid size-16 place-items-center rounded-md bg-wine/5 text-center text-[11px] leading-tight text-ink/50">Design photo</span>}
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
      {photo && <p className="mt-1.5 text-[13px] text-ink/55">Tap the part of the photo that should stay in view.</p>}
    </div>
  )
}

// The day a site is deleted: 30 days after its last event (KEEP_DAYS in worker/src/index.ts). Empty with no dates.
const keepUntil = (events: Content['events']) => {
  const last = events.map((e) => e.date).filter(Boolean).sort().at(-1)
  if (!last) return ''
  const d = new Date(`${last}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 30)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
// Some in-app browsers have no navigator.clipboard: that is a "select it yourself", not an error.
const copy = (text: string, done: (s: string) => void) =>
  Promise.resolve()
    .then(() => navigator.clipboard.writeText(text))
    .then(() => done('Copied'), () => done('Select the link and copy it'))

// The live link and the secret edit link, shown big right after publishing and small after that.
function Live({ draft, fresh }: { draft: Draft; fresh: boolean }) {
  const live = liveLink(draft.slug)
  const edit = editLink(draft.slug, draft.key!)
  const [note, setNote] = useState('')
  const names = draft.content.couple.join(' & ')
  const left = leftovers(draft.content)
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
        <p className="mt-1 text-[13px] text-ink/60">There is no password. Anyone with this link can change your site. Add your email below and we'll send it to you, so you can always find it.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={mail} className={small}>
            <Mail className="size-4" aria-hidden /> Email it to me
          </a>
          {/* Sent to their own chat ("Message yourself"), where couples keep things. */}
          <a href={`https://wa.me/?text=${encodeURIComponent(`Our wedding website's secret edit link (keep it private, anyone with it can change the site):\n${edit}`)}`} target="_blank" rel="noreferrer" className={small}>
            Save to my WhatsApp
          </a>
          <button type="button" onClick={() => copy(edit, setNote)} className={small}>
            <Copy className="size-4" aria-hidden /> Copy
          </button>
        </div>
      </div>
      <Contact slug={draft.slug} edit={draft.key!} />
      {left.length > 0 && (
        <p className="rounded-md bg-wine/5 p-3 text-[14px] text-wine">
          Still the design's sample words: {left.join(', ')}. Change them below and press Save changes.
        </p>
      )}
      {fresh && (
        <div className="space-y-1 text-[14px] text-ink/75">
          <p>
            Sharing it on Instagram? Tag{' '}
            <a href="https://instagram.com/shaaditemplate" target="_blank" rel="noreferrer" onClick={() => track('site_instagram_click')} className="text-wine underline underline-offset-4">
              @shaaditemplate
            </a>{' '}
            and we may feature your site.
          </p>
          <p>
            Need invitation cards to match?{' '}
            <a href="/" onClick={() => track('site_cards_click')} className="text-wine underline underline-offset-4">
              Make one free
            </a>
            , ready to send on WhatsApp or print.
          </p>
        </div>
      )}
      {keepUntil(draft.content.events) && (
        <p className="text-[13px] text-ink/65">
          Your website stays up until <span className="font-medium text-ink">{keepUntil(draft.content.events)}</span>, 30 days after your last function. Then it is deleted with its photos, replies and blessings, so download your guest replies before that.
        </p>
      )}
      <p className="text-[13px] text-wine" aria-live="polite">
        {note}
      </p>
    </div>
  )
}

// Answers for "How did you find us?" (value sent, label shown). Stored as given; the dashboard shows the value.
const HEARD = [
  ['instagram', 'Instagram'],
  ['reddit', 'Reddit'],
  ['pinterest', 'Pinterest'],
  ['google', 'Google search'],
  ['whatsapp', 'WhatsApp'],
  ['friend', 'Friend or family'],
  ['guest', "Saw someone's wedding website"],
  ['other', 'Somewhere else'],
]

// Asked before a first publish: where to send the edit link (the server emails it), and how they found us.
// All optional; publishing without an email or number asks once (publish()). After publishing, Contact edits them.
function Reach({ value, onChange }: { value: { email: string; phone: string; marketing: boolean; heard: string }; onChange: (v: typeof value) => void }) {
  const set = (k: 'email' | 'phone' | 'heard') => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value })
  return (
    <section className="space-y-4">
      <Step n={7} title="Where should we send your edit link?" />
      <p className="text-[15px] text-ink/75">Your edit link is the only way to change your site later. We'll email it to you, tell you when guests reply, and remind you before your site is deleted.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[13px] text-ink/65">
          Email
          <input id="reach-email" type="email" autoComplete="email" maxLength={120} value={value.email} onChange={set('email')} className={inputCls} />
        </label>
        <label className="block text-[13px] text-ink/65">
          WhatsApp number
          <input type="tel" autoComplete="tel" maxLength={30} placeholder="+91" value={value.phone} onChange={set('phone')} className={inputCls} />
        </label>
      </div>
      <label className="flex items-start gap-2 text-[14px] text-ink/75 pointer-coarse:min-h-11">
        <input type="checkbox" checked={value.marketing} onChange={(e) => onChange({ ...value, marketing: e.target.checked })} className="mt-1 size-4 accent-wine" />
        Also send me new designs and offers now and then.
      </label>
      <label className="block text-[13px] text-ink/65 sm:max-w-xs">
        How did you find us? (optional)
        <select value={value.heard} onChange={set('heard')} className={inputCls}>
          <option value="">Choose one</option>
          {HEARD.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}

// How to reach the couple (both optional): a new email gets the edit link, a daily note of replies and a reminder
// before the site is deleted. News of new designs only with the box ticked, which starts unticked.
function Contact({ slug, edit }: { slug: string; edit: string }) {
  const [form, setForm] = useState({ email: '', phone: '', marketing: false })
  const [state, setState] = useState<'loading' | 'idle' | 'saving'>('loading')
  const [note, setNote] = useState('')
  useEffect(() => {
    api<typeof form>(`sites/${slug}/contact`, { key: edit }).then(
      (c) => (setForm(c), setState('idle')),
      () => setState('idle'),
    )
  }, [slug, edit])
  const save = async () => {
    setState('saving')
    setNote('')
    try {
      const r = await api<{ tried: boolean; sent: boolean }>(`sites/${slug}/contact`, { method: 'PUT', key: edit, body: form })
      setNote(
        r.sent
          ? `Saved. We've emailed your edit link to ${form.email}.`
          : r.tried
            ? "Saved, but we couldn't send the email just now. Copy your edit link above to keep it safe."
            : form.email || form.phone
              ? "Saved. We'll use it only for your website."
              : 'Removed.',
      )
      track('site_contact', { email: !!form.email, phone: !!form.phone, marketing: form.marketing })
    } catch (err) {
      setNote((err as Error).message)
    } finally {
      setState('idle')
    }
  }
  const set = (k: 'email' | 'phone') => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))
  if (state === 'loading') return null
  return (
    // Its own little form inside the site's form: Enter here saves the contact, not the site.
    <div className="space-y-3 rounded-md border border-wine/15 p-4" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), save())}>
      <div>
        <p className="font-medium">Where should we send your edit link?</p>
        <p className="mt-0.5 text-[13px] text-ink/65">Optional. We'll also tell you when guests reply, and remind you before your site is deleted.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[13px] text-ink/65">
          Email
          <input type="email" autoComplete="email" maxLength={120} value={form.email} onChange={set('email')} className={inputCls} />
        </label>
        <label className="block text-[13px] text-ink/65">
          WhatsApp number
          <input type="tel" autoComplete="tel" maxLength={30} placeholder="+91" value={form.phone} onChange={set('phone')} className={inputCls} />
        </label>
      </div>
      <label className="flex items-start gap-2 text-[14px] text-ink/75 pointer-coarse:min-h-11">
        <input type="checkbox" checked={form.marketing} onChange={(e) => setForm((f) => ({ ...f, marketing: e.target.checked }))} className="mt-1 size-4 accent-wine" />
        Also send me new designs and offers now and then.
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={state === 'saving'} className={small}>
          {state === 'saving' && <Loader2 className="size-4 animate-spin" aria-hidden />} Save
        </button>
        <span className="text-[13px] text-wine" aria-live="polite">
          {note}
        </span>
      </div>
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
  // A guest who replies twice counts once: their latest reply. First by the guest's browser id (a reply changed in
  // the same browser replaces the old one, even renamed), then by name (the same guest from a second browser).
  const byKey = (rows: Rsvp[], key: (r: Rsvp) => string) => [...new Map([...rows].reverse().map((r) => [key(r), r])).values()].reverse()
  const latest = byKey(byKey(rsvps, (r) => r.guest || r.name.toLowerCase()), (r) => r.name.toLowerCase()) // rows come newest first
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
        <button type="button" onClick={() => download(slug, latest, eventName)} className={small}>
          <Download className="size-4" aria-hidden /> Download replies
        </button>
      )}
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

// Guest replies as a spreadsheet (CSV), to keep after the site is deleted.
function download(slug: string, rows: Rsvp[], eventName: (id: string) => string) {
  // A guest's text starting like a formula (=, +, -, @) gets a leading apostrophe, so a spreadsheet never runs it.
  const cell = (v: string | number) => `"${String(v).replace(/^[=+\-@]/, "'$&").replace(/"/g, '""')}"`
  const lines = [['Name', 'Side', 'Coming to', 'Guests', 'Note', 'Replied on'], ...rows.map((r) => [r.name, r.side, r.events.map(eventName).join(', ') || "Can't come", r.events.length ? r.party : 0, r.note, new Date(r.at).toLocaleDateString('en-IN')])]
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + lines.map((l) => l.map(cell).join(',')).join('\r\n')], { type: 'text/csv' }))
  a.download = `${slug}-guest-replies.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000) // Safari reads the link after click() returns
}

const Details = ({ summary, children }: { summary: string; children: ReactNode }) => (
  <details className="rounded-md bg-paper/70 px-4 py-2 ring-1 ring-wine/10">
    <summary className="cursor-pointer select-none py-1 text-wine pointer-coarse:py-3">{summary}</summary>
    {children}
  </details>
)
