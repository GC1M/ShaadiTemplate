import { useEffect, useMemo, useRef, useState } from 'react'
import { API } from '../api'
import { designPath, invokesGanesh, mainOf, mapsUrl, passId, THEME, type Design } from '../designs'
import { Music } from '../music'
import { COUPLE, SHOTS } from '../photos'
import { Blessings, RsvpForm } from '../shared'
import { SiteFooter, themeVars, type SiteProps } from '../WeddingSite'
import '../organza.css'
import '../site.css'

// The themed websites (Night Call, Web Line, Forge Heart, Vice Nights): each is its own hand-built page with its own music in
// public/microsites/<id>/, shown here full screen in a frame. Its sample page is the demo; for a couple's site or
// the editor's preview this sends the couple's words in (public/microsites/fill.js fills the page), and the page's
// RSVP and blessings buttons open the site's own forms here, so replies reach the couple like on every design.

// What the page needs, in plain values (fill.js derives the day, month and clock from each start).
function content(d: Design, preview: boolean) {
  const main = mainOf(d)
  return {
    couple: d.couple,
    parents: d.parents,
    families: d.families,
    invocation: d.invocation ?? '',
    ganesh: invokesGanesh(d.invocation),
    invite: d.invite,
    note: d.note ?? '',
    notes: d.notes,
    compliments: d.compliments ?? [],
    story: d.story.map(({ year, title, body }) => ({ year, title, body })),
    events: d.events.map((e, i) => ({ id: passId(e.name, i), name: e.name, date: e.date, time: e.time, note: e.note, map: e.map ?? '', start: e.start, main: e.id === main?.id })),
    main: { name: main?.name ?? '', date: main?.date ?? '', time: main?.time ?? '', start: main?.start ?? '' },
    venue: d.venue,
    venueName: d.venue.split(',')[0].trim(),
    venueRest: d.venue.split(',').slice(1).join(',').trim(),
    city: d.city,
    map: mapsUrl(d.venue),
    stay: d.stay ?? '',
    rsvpBy: d.rsvpBy,
    // Only the couple's own photo: never the sample couple, nor the place photo standing in for theirs.
    photo: d.hero === COUPLE || Object.values(SHOTS).includes(d.hero) ? '' : d.hero.small,
    hide: d.hide ?? [],
    // '' plays the page's own theme; 'off' none there (no music, or a track or song, which plays here instead).
    music: d.music === THEME ? '' : 'off',
    // The editor's preview never starts music on its own.
    preview,
  }
}

// A guest pass, from a link the couple made for one guest (SiteEditor.tsx): ?guest=Rohan%20Shah&events=sangeet,wedding.
// The name is plain text, at most 40 characters; event ids that match none of this site's functions are dropped.
function guestPass(d: Design) {
  const q = new URLSearchParams(location.search)
  const guest = (q.get('guest') ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40)
  const ids = (q.get('events') ?? '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
  const events = d.events.map((e, i) => ({ id: e.id, pass: passId(e.name, i) })).filter((e) => ids.includes(e.pass))
  return guest || events.length ? { guest, events: events.map((e) => e.pass), picks: events.map((e) => e.id) } : null
}

export default function Themed({ d, mode, slug }: SiteProps) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [open, setOpen] = useState<'rsvp' | 'bless' | 'about' | null>(null)
  const back = useRef<Element | null>(null)
  const data = useMemo(() => (mode === 'demo' ? null : content(d, mode === 'preview')), [d, mode])
  const pass = useMemo(() => (mode === 'preview' ? null : guestPass(d)), [d, mode])
  useEffect(() => {
    const send = () => {
      const w = frame.current?.contentWindow
      if (data) w?.postMessage({ type: 'microsite-content', data }, location.origin)
      if (pass) w?.postMessage({ type: 'microsite-pass', pass: { guest: pass.guest, events: pass.events } }, location.origin)
    }
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return
      if (e.data?.type === 'microsite-ready') send()
      if (e.data?.type === 'microsite-act') {
        back.current = frame.current
        setOpen(e.data.act === 'bless' ? 'bless' : 'rsvp')
      }
      // A tap inside the page counts as a tap on the site, so a chosen song (<Music>) starts with it.
      if (e.data?.type === 'microsite-tap') dispatchEvent(new Event('pointerup'))
    }
    addEventListener('message', on)
    send()
    return () => removeEventListener('message', on)
  }, [data, pass])
  const close = () => {
    setOpen(null)
    ;(back.current as HTMLElement | null)?.focus?.()
  }
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close()
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [open])
  const pill = 'flex min-h-11 items-center rounded-full bg-black/70 px-4 text-sm text-white shadow-lg backdrop-blur'
  return (
    <div className="ov st" style={themeVars(d)}>
      {/* A sample's song (Vice Nights) plays here too, its button lifted above the sample strip. */}
      {(mode !== 'demo' || !!d.music) && d.music !== THEME && (
        <div className={mode === 'demo' ? '[&_[data-music]]:bottom-[76px]' : undefined}>
          <Music music={d.music} />
        </div>
      )}
      <iframe ref={frame} src={`/microsites/${d.bespoke}/index.html`} title={`${d.couple.join(' & ')}: wedding website`} allow="autoplay; fullscreen" inert={!!open} className={`fixed inset-x-0 top-0 w-full border-0 ${mode === 'demo' ? 'h-[calc(100svh-4rem)]' : 'h-svh'}`} />
      {/* The sample: a strip under the page with the way back to every design and the way to make it yours. A couple's
          site: the site's credit, the report form and photo credits behind a small button above the page's own sound
          button (bottom right), clear of the page’s words. */}
      {mode === 'demo' ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center gap-2 bg-black px-3">
          <a href="/websites/" aria-label="All designs" className={pill}>
            ←
          </a>
          {API && (
            <a href={`${designPath(d)}edit/`} className={`${pill} font-medium`}>
              Make yours free
            </a>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            back.current = e.currentTarget
            setOpen('about')
          }}
          aria-label="About this website"
          className={`${pill} fixed right-4 z-40 w-11 ${d.music === THEME ? 'bottom-[76px]' : 'bottom-4'} justify-center px-0 font-serif text-lg italic`}
        >
          i
        </button>
      )}
      {open && (
        <div role="dialog" aria-modal="true" aria-label={open === 'rsvp' ? 'RSVP' : open === 'bless' ? 'Blessings' : 'About this website'} className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" style={{ background: d.theme.bg }}>
          <button type="button" onClick={close} autoFocus aria-label="Back to the invitation" className="fixed right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-black/60 text-2xl text-white">
            ×
          </button>
          {open === 'rsvp' ? (
            <RsvpForm
              d={d}
              slug={slug}
              prefill={pass ? { name: pass.guest, events: pass.picks } : undefined}
              // Vice Nights shows the reply as its own full-screen "mission passed".
              onDone={
                d.bespoke === 'vicenights'
                  ? (r) => {
                      setOpen(null)
                      frame.current?.focus()
                      frame.current?.contentWindow?.postMessage({ type: 'microsite-rsvp-done', name: r.name, coming: r.events.length > 0 }, location.origin)
                    }
                  : undefined
              }
            />
          ) : open === 'bless' ? <Blessings d={d} slug={slug} /> : <div className="h-20" />}
          <footer className="px-6 pb-16 text-center text-sm opacity-75">
            <SiteFooter d={d} mode={mode} slug={slug} />
          </footer>
        </div>
      )}
    </div>
  )
}
