import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent } from 'react'
import './organza.css'
import { DESIGNS, designIntro, designPath, go, type Design, type WeddingEvent } from './designs'
import type { Photo } from './photos'
import { api, API } from './api'

// Shared pieces of the wedding websites. On a couple's published site (slug set) RSVPs and blessings go to the
// sites API (worker/), so every guest sees the blessings. The demo designs and the editor preview keep them in
// this browser's localStorage. The guest's own reply is remembered locally either way, to show "Change your reply".

/* ---------- local persistence ---------- */

// guest: a random id kept with this browser's reply, so changing the reply (even the name) replaces it for the couple.
type Rsvp = { name: string; side: string; events: string[]; party: number; note: string; guest?: string }
type Blessing = { name: string; text: string; at: number }
const rsvpKey = (d: Design, slug?: string) => (slug ? `site:${slug}:rsvp` : `shaadidraft:${d.id}:rsvp`)
const blessKey = (d: Design) => `shaadidraft:${d.id}:blessings`
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode: the page still works for this visit */
  }
}

const icsTime = (d: Date) => `${d.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`
// Event times are written in IST; UTC needs no VTIMEZONE block (a bare TZID breaks Outlook).
const fromIst = (t: string) => icsTime(new Date(t.replace(/(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/, '$1-$2-$3T$4:$5:$6+05:30')))

// Commas, semicolons, backslashes and line breaks are escaped in calendar text (RFC 5545).
const icsText = (s: string) => s.replace(/[\\,;]/g, '\\$&').replace(/\r?\n/g, '\\n')

export function downloadIcs(e: WeddingEvent, d: Design) {
  const slug = d.couple.join('-').toLowerCase()
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShaadiTemplate//Sample//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}-${slug}@shaaditemplate.com`,
    `DTSTAMP:${icsTime(new Date())}`,
    `DTSTART:${fromIst(e.start)}`,
    `DTEND:${fromIst(e.end)}`,
    `SUMMARY:${icsText(`${e.name}: ${d.couple.join(' and ')}`)}`,
    `LOCATION:${icsText(e.place || d.venue)}`,
    `DESCRIPTION:${icsText([e.time, e.note].filter(Boolean).join('. '))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  // In-app browsers (Instagram, Facebook, Android WebView) ignore downloads, so the button would do nothing there:
  // they get Google Calendar's add-event page instead.
  if (/\bwv\b|FBAN|FBAV|Instagram|Line\//.test(navigator.userAgent)) {
    const q = new URLSearchParams({ action: 'TEMPLATE', text: `${e.name}: ${d.couple.join(' and ')}`, dates: `${fromIst(e.start)}/${fromIst(e.end)}`, location: e.place || d.venue, details: [e.time, e.note].filter(Boolean).join('. ') })
    return void window.open(`https://calendar.google.com/calendar/render?${q}`, '_blank')
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = `${e.id}-${slug}.ics`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000) // Safari/Firefox fetch the blob after click returns
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
// Smooth inertial scrolling for the lifetime of a sample site page.
export function useLenis() {
  useEffect(() => {
    if (reducedMotion()) return
    const l = new Lenis({ autoRaf: true, lerp: 0.085 })
    lenis = l
    return () => {
      l.destroy()
      lenis = null
    }
  }, [])
}
let lenis: Lenis | null = null

// A full-bleed photograph used as a section background.
export function Backdrop({ photo, className = '', style, eager }: { photo: Photo; className?: string; style?: CSSProperties; eager?: boolean }) {
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes="100vw"
      alt=""
      aria-hidden
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      style={{ objectPosition: photo.pos, ...style }}
    />
  )
}

// Jump to another design.
export function PageSwitch({ d, className = '' }: { d: Design; className?: string }) {
  return (
    <select aria-label="Other designs" className={`ov-switch ${className}`} value={d.id} onChange={(e) => go(designPath({ id: e.target.value }))}>
      {DESIGNS.map((x) => (
        <option key={x.id} value={x.id}>
          {x.name}
        </option>
      ))}
    </select>
  )
}

// Footer line pointing at the other designs.
export function SeeAlso({ d }: { d: Design }) {
  const others = DESIGNS.filter((x) => x !== d)
  return (
    <>
      <h1 className="ov-display mt-4 text-3xl leading-tight">{designIntro(d).heading}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed">{designIntro(d).body}</p>
      <p className="mt-8">
        The couple and their story are fictional. Other designs:{' '}
        {others.map((x, i) => (
          <span key={x.id}>
            <a href={designPath(x)} className="underline underline-offset-4 hover:text-(--ov-zari)">
              {x.name}
            </a>
            {i < others.length - 1 ? ', ' : '. '}
          </span>
        ))}
        <a href="/websites/" className="underline underline-offset-4 hover:text-(--ov-zari)">
          See all designs
        </a>
        .
        {API && (
          <>
            {' '}
            <a href={`${designPath(d)}edit/`} className="underline underline-offset-4 hover:text-(--ov-zari)">
              Make your own wedding website with {d.name}
            </a>
            , free.
          </>
        )}
      </p>
    </>
  )
}

export const photosOf = (d: Design) => [...new Set([d.hero, d.venuePhoto, ...(d.finale ? [d.finale] : []), ...(d.meet ?? []).map((m) => m.photo), d.rsvpPhoto, d.blessPhoto, ...d.gallery, ...d.story.map((s) => s.photo), ...d.events.map((e) => e.photo)])]

export function PhotoCredits({ d }: { d: Design }) {
  const credited = photosOf(d).filter((p) => p.credit)
  if (!credited.length) return null
  return (
    <p className="mx-auto mt-4 max-w-3xl">
      Photographs from Wikimedia Commons, shown cropped and darkened:{' '}
      {credited.map(({ credit: c }, i) => (
        <span key={c!.file}>
          {i > 0 && '; '}
          <a href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(c!.file)}`} className="underline underline-offset-4 hover:text-(--ov-zari)" target="_blank" rel="noreferrer">
            {c!.by}
          </a>{' '}
          ({c!.licence})
        </span>
      ))}
      .
    </p>
  )
}

function Knot() {
  return (
    <svg viewBox="0 0 120 40" className="ov-knot h-10 w-32" aria-hidden>
      <path d="M2 20 C 30 20, 40 4, 60 20 S 90 36, 118 20" pathLength={1} />
      <path d="M2 20 C 30 20, 40 36, 60 20 S 90 4, 118 20" pathLength={1} className="ov-knot-rose" />
      <circle cx="60" cy="20" r="4" />
    </svg>
  )
}

export function RsvpForm({ d, slug }: { d: Design; slug?: string }) {
  const photo = d.rsvpPhoto
  const [saved, setSaved] = useState<Rsvp | null>(() => load<Rsvp | null>(rsvpKey(d, slug), null))
  const [editing, setEditing] = useState(!saved)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [party, setParty] = useState(saved?.party ?? 1)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name')).trim()
    const events = f.getAll('events').map(String)
    if (!name) {
      ;(e.currentTarget.elements.namedItem('name') as HTMLInputElement).focus()
      return setError('Add your name so the families know who is coming.')
    }
    const guest = saved?.guest ?? (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`)
    const r: Rsvp = { name, side: String(f.get('side')), events, party, note: String(f.get('note')).trim(), guest }
    if (slug) {
      setBusy(true)
      try {
        await api(`sites/${slug}/rsvps`, { method: 'POST', body: r })
      } catch (err) {
        return setError((err as Error).message)
      } finally {
        setBusy(false)
      }
    }
    save(rsvpKey(d, slug), r)
    setSaved(r)
    setEditing(false)
    setError('')
  }

  return (
    <section id="rsvp" className="relative overflow-hidden bg-(--ov-kohl) text-(--ov-mogra)">
      <Backdrop photo={photo} />
      <div className="absolute inset-0 bg-(--ov-kohl)/70" />
      <div className="relative mx-auto max-w-2xl px-6 py-[16svh]">
        <h2 className="ov-display text-center text-[clamp(3rem,7vw,5.5rem)] leading-none">Will you join us?</h2>
        <p className="mt-5 text-center text-(--ov-mogra)/70">{d.rsvpBy ? `Reply by ${d.rsvpBy} so` : 'Reply soon, so'} the families can plan rooms and seating.</p>
        {!editing && saved ? (
          <div className="ov-rise mt-14 flex flex-col items-center text-center" aria-live="polite">
            <Knot />
            <p className="ov-display mt-6 text-[clamp(2rem,4vw,3rem)] italic">
              {saved.events.length ? `See you ${d.city ? `in ${d.city}` : 'there'}, ${saved.name}.` : `We’ll miss you, ${saved.name}.`}
            </p>
            <p className="mt-3 text-(--ov-mogra)/75">
              {saved.events.length
                ? `Party of ${saved.party} for ${saved.events.map((id) => d.events.find((e) => e.id === id)?.name).filter(Boolean).join(', ') || 'the celebrations'}.`
                : 'You told us you can’t make it.'}
            </p>
            <button type="button" onClick={() => setEditing(true)} className="ov-link mt-8">
              Change your reply
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-14 space-y-10">
            <label className="block">
              <span className="ov-label">Your name</span>
              <input
                name="name"
                defaultValue={saved?.name}
                placeholder="Meera Sharma"
                aria-invalid={!!error}
                aria-describedby="rsvp-err"
                onChange={() => setError('')}
                className="ov-field"
              />
              <span id="rsvp-err" className="ov-error" role="alert">
                {error}
              </span>
            </label>
            <fieldset>
              <legend className="ov-label">You are with</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  ['a', d.families[0]],
                  ['b', d.families[1]],
                  ['both', 'Both, somehow'],
                ].map(([v, label]) => (
                  <label key={v} className="ov-chip">
                    <input type="radio" name="side" value={v} defaultChecked={(saved?.side ?? 'a') === v} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="ov-label">Which celebrations? Leave all unticked if you can’t come.</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {d.events.map((e) => (
                  <label key={e.id} className="ov-chip">
                    <input type="checkbox" name="events" value={e.id} defaultChecked={saved ? saved.events.includes(e.id) : true} className="sr-only" />
                    {e.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <span className="ov-label" id="party-l">
                How many of you, including you?
              </span>
              <div className="mt-4 flex items-center gap-6" role="group" aria-labelledby="party-l">
                <button type="button" aria-label="One fewer" onClick={() => setParty((n) => Math.max(1, n - 1))} className="ov-press ov-round">
                  −
                </button>
                <span key={party} className="ov-display ov-tick w-10 text-center text-5xl" aria-live="polite">
                  {party}
                </span>
                <button type="button" aria-label="One more" onClick={() => setParty((n) => Math.min(8, n + 1))} className="ov-press ov-round">
                  +
                </button>
              </div>
            </div>
            <label className="block">
              <span className="ov-label">Anything the hosts should know?</span>
              <input name="note" defaultValue={saved?.note} placeholder="Vegetarian, arriving the day before" className="ov-field" />
            </label>
            <div className="text-center">
              <button type="submit" disabled={busy} className="ov-press ov-btn-gold">
                {busy ? 'Sending…' : 'Send reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export function Blessings({ d, slug }: { d: Design; slug?: string }) {
  const photo = d.blessPhoto
  const [list, setList] = useState<Blessing[]>(() => (slug ? [] : load<Blessing[]>(blessKey(d), [])))
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [fresh, setFresh] = useState(0)
  useEffect(() => {
    if (slug) api<Blessing[]>(`sites/${slug}/blessings`).then(setList, () => {})
  }, [slug])
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return setError('Add your name and a few words before you post.')
    let b = { name: name.trim(), text: text.trim(), at: Date.now() }
    if (slug) {
      setBusy(true)
      try {
        b = await api<Blessing>(`sites/${slug}/blessings`, { method: 'POST', body: b })
      } catch (err) {
        return setError((err as Error).message)
      } finally {
        setBusy(false)
      }
    }
    const next = [b, ...list]
    if (!slug) save(blessKey(d), next)
    setList(next)
    setFresh(b.at)
    setError('')
    setText('')
  }

  return (
    <section id="blessings" className="relative overflow-hidden bg-(--ov-kohl) text-(--ov-mogra)">
      <Backdrop photo={photo} />
      <div className="absolute inset-0 bg-(--ov-kohl)/78" />
      <div className="relative mx-auto max-w-5xl px-6 py-[16svh]">
        <h2 className="ov-display text-center text-[clamp(3rem,7vw,5.5rem)] leading-none">Leave a blessing</h2>
        <p className="mt-5 text-center text-(--ov-mogra)/70">We’ll read every one on the morning of the wedding.</p>
        <div className="mt-14 grid items-start gap-12 md:grid-cols-2">
          <form onSubmit={submit} noValidate className="grid gap-8">
            <label className="block">
              <span className="ov-label">Your name</span>
              <input value={name} onChange={(e) => (setName(e.target.value), setError(''))} maxLength={60} placeholder="Meera Sharma" className="ov-field" />
            </label>
            <label className="block">
              <span className="ov-label">Your blessing</span>
              <textarea
                value={text}
                onChange={(e) => (setText(e.target.value), setError(''))}
                rows={3}
                maxLength={280}
                placeholder="May your home always be this full of people who love you."
                className="ov-field resize-none"
              />
            </label>
            <div className="-mt-4 flex items-center justify-between text-sm">
              <span className="ov-error !mt-0" role="alert">
                {error}
              </span>
              <span className="text-(--ov-mogra)/50">{280 - text.length} left</span>
            </div>
            <button type="submit" disabled={busy} className="ov-press ov-btn-gold justify-self-start">
              {busy ? 'Posting…' : 'Post blessing'}
            </button>
          </form>
          {/* Live preview: the blessing takes shape as the guest types. */}
          <figure aria-hidden className="ov-preview" data-empty={!text || undefined}>
            <span className="ov-display block text-6xl leading-none text-(--ov-zari)">“</span>
            <p className="ov-display -mt-4 text-[1.9rem] italic leading-snug">{text || 'Your words will appear here as you write.'}</p>
            <p className="ov-meta mt-6 text-(--ov-gulab)">{name || 'Your name'}</p>
          </figure>
        </div>
        {list.length > 0 && (
          <ul className="mt-20 grid gap-x-12 sm:grid-cols-2">
            {list.map((b, i) => (
              <li key={`${b.at}-${i}`} className={`border-t border-(--ov-zari)/35 py-8 ${b.at === fresh ? 'ov-rise' : ''}`}>
                <p className="ov-display text-2xl italic leading-snug">{b.text}</p>
                <p className="ov-meta mt-4 text-(--ov-gulab)">{b.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// A website page's title. Leaving for the home page puts the home title back (as in index.html): the visit may have
// started on a website page, so the title found on arrival is not always the home page's.
export function useTitle(title: string) {
  useEffect(() => {
    document.title = title
    return () => void (document.title = 'ShaadiTemplate · Free Indian Wedding Invitation Maker')
  }, [title])
}


// Section links must not overwrite the sample site's route hash.
export function jump(e: MouseEvent, id: string, offset = 0) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 })
  else el.scrollIntoView()
}
