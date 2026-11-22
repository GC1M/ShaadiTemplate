import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent } from 'react'
import './organza.css'
import { PAGES } from './pages'

// Shared pieces of the sample couple website. Demo content only: Ananya, Arjun, their story and the guests
// are fictional. The photographs are from Wikimedia Commons (CC BY / CC BY-SA, credited in the footer).
// The site goes out before the wedding, so no wedding photos: a real couple would use their pre-wedding shoot.
// ponytail: RSVPs and blessings live in this browser's localStorage, so guests can't see each other's.
// Swap the two load/save helpers for a realtime backend (e.g. Supabase) when the hosted microsite ships.

// w = the original's width: Commons refuses thumbnails wider than the original.
export const commons = (path: string, w: number, alt: string, by: string, licence: string, pos = 'center') => {
  const name = path.split('/').pop()!
  const thumb = (x: number) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${x}px-${name}`
  const widths = [960, 1280, 1920].filter((x) => x < w)
  return {
    src: widths.length ? thumb(widths[Math.min(1, widths.length - 1)]) : `https://upload.wikimedia.org/wikipedia/commons/${path}`,
    small: widths.length ? thumb(widths[0]) : `https://upload.wikimedia.org/wikipedia/commons/${path}`, // for small frames
    srcSet: widths.map((x) => `${thumb(x)} ${x}w`).join(', ') || undefined,
    alt,
    pos,
    credit: { by, licence, file: decodeURIComponent(name) },
  }
}
export type Photo = ReturnType<typeof commons>
// Pre-wedding pictures only: engagement shoots, the lake and palace, and the things each ceremony is made of.
export const SHOTS = {
  silhouette: commons('c/ce/Sunset_beach_couple_%28Unsplash%29.jpg', 3456, 'A couple holding hands, silhouetted against the dusk sky', 'Caleb Ekeroth', 'CC0', '50% 65%'),
  sunsetTree: commons('5/52/Pink_sunset_couple_%28Unsplash%29.jpg', 5152, 'Two people watching the sun go down under a tree', 'Harli Marten', 'CC0', '40% 50%'),
  ring: commons('f/f8/Engaged_couple_linking_fingers_%28Unsplash%29.jpg', 3780, 'Two hands linking fingers, an engagement ring on one', 'Paul García', 'CC0', '55% 50%'),
  twirl: commons('2/2e/Punjabi_Pre_wedding_shoot_-_December_2020_03.jpg', 6048, 'A couple on a terrace at dusk, her skirt mid-twirl', 'Raja Photographer (Khalsa Studio)', 'CC BY-SA 4.0', '40% 50%'),
  bazaar: commons('c/c0/Punjabi_Pre_wedding_shoot_-_December_2020_02.jpg', 6048, 'A couple in festive clothes among juttis and parandis', 'Raja Photographer (Khalsa Studio)', 'CC BY-SA 4.0', '45% 50%'),
  embrace: commons('c/c0/Sweet_Embrace_%28163554735%29.jpeg', 2048, 'A couple embracing on a tree-lined road in golden light', 'Sushant Sakhalkar', 'CC0'),
  lodhi: commons('3/3b/Couple_Photoshoot_at_The_Lodhi_Garden.jpg', 5009, 'A couple on the steps of a tomb in Lodhi Garden', 'Akarshan Sapra', 'CC BY-SA 4.0', '50% 75%'),
  henna: commons('3/32/Mehndi_and_henna_cone.jpg', 960, 'A hand with fresh mehendi beside a henna cone', "Ilona's Henna 'n' Stuff", 'CC BY-SA 4.0', '40% 50%'),
  marigold: commons('3/3c/African_Marigold_%28405632987%29.jpg', 2816, 'A marigold in bloom', 'Dinesh Valke', 'CC BY-SA 2.0', '60% 50%'),
  diyas: commons('e/e7/Rows_of_diyas.jpg', 3872, 'Rows of lit clay diyas', 'Sneha G Gupta', 'CC BY-SA 4.0'),
  diyaLedge: commons('5/53/Diya_on_a_balcony_ledge.jpg', 4608, 'Diyas burning along a balcony ledge', 'siddarth varanasi', 'CC BY 2.0'),
  lakePalace: commons('f/f4/Taj_Lake_Palace_Udaipur.jpg', 8278, 'The Lake Palace lit up at night', 'Jakub Michankow', 'CC BY 2.0'),
}

export const STORY: { year: string; title: string; body: string; photo: Photo }[] = [
  {
    year: '2016',
    title: 'A borrowed umbrella',
    body: 'First week of college in Pune, the monsoon came early, and Arjun had the only umbrella at the bus stop. Ananya kept it for a month.',
    photo: SHOTS.silhouette,
  },
  {
    year: '2019',
    title: 'Bengaluru to Delhi',
    body: 'Two jobs, two cities, and three years of video calls that started with “have you eaten?”',
    photo: SHOTS.sunsetTree,
  },
  {
    year: '2025',
    title: 'The question, on Lake Pichola',
    body: 'A boat, a sunset and a ring that nearly went overboard. She said yes before he finished asking.',
    photo: SHOTS.ring,
  },
  {
    year: '2027',
    title: 'Udaipur, with everyone',
    body: 'We’re getting married by the lake, with the people who’ve watched all of this happen.',
    photo: SHOTS.twirl,
  },
]

export type WeddingEvent = { id: string; name: string; date: string; start: string; end: string; time: string; note: string; photo: Photo }
export const VENUE = 'The Leela Palace, Lake Pichola, Udaipur'
export const EVENTS: WeddingEvent[] = [
  { id: 'mehendi', name: 'Mehendi', date: 'Saturday, 20 November 2027', start: '20271120T160000', end: '20271120T220000', time: '4 pm until late, on the lake lawns', note: 'Floor seating and a lot of henna. Wear something you can sit cross-legged in.', photo: SHOTS.henna },
  { id: 'haldi', name: 'Haldi', date: 'Sunday, 21 November 2027', start: '20271121T100000', end: '20271121T123000', time: '10 am, in the courtyard', note: 'You will be painted yellow. Wear white you don’t mind losing.', photo: SHOTS.marigold },
  { id: 'pheras', name: 'Pheras', date: 'Sunday, 21 November 2027', start: '20271121T153000', end: '20271121T193000', time: '3:30 pm, by the water', note: 'Seven rounds of the fire as the sun goes down, then dinner on the lawns.', photo: SHOTS.diyas },
]


/* ---------- local persistence ---------- */

type Rsvp = { name: string; side: string; events: string[]; party: number; note: string }
type Blessing = { name: string; text: string; at: number }
const RSVP_KEY = 'shaadidraft:ananya-arjun:rsvp'
const BLESS_KEY = 'shaadidraft:ananya-arjun:blessings'
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

export function downloadIcs(e: WeddingEvent) {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShaadiTemplate//Sample//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}-ananya-arjun@shaaditemplate.com`,
    `DTSTAMP:${icsTime(new Date())}`,
    `DTSTART:${fromIst(e.start)}`,
    `DTEND:${fromIst(e.end)}`,
    `SUMMARY:${e.name}: Ananya and Arjun`,
    `LOCATION:${VENUE.replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = `${e.id}-ananya-arjun.ics`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000) // Safari/Firefox fetch the blob after click returns
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

// One rAF-throttled scroll callback. Lenis scrolls the real window, so native scroll events still fire.
export function useScroll(fn: () => void) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => ref.current())
    }
    on()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
    }
  }, [])
}

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

// Jump to another version of the site.
export function PageSwitch({ className = '' }: { className?: string }) {
  return (
    <select aria-label="Other versions of this site" className={`ov-switch ${className}`} value={location.hash} onChange={(e) => (location.hash = e.target.value)}>
      {PAGES.map(([label, href]) => (
        <option key={href} value={href}>
          {label}
        </option>
      ))}
    </select>
  )
}

// Footer line pointing at the other versions.
export function SeeAlso() {
  const others = PAGES.filter(([, href]) => href !== location.hash)
  return (
    <p className="mt-8">
      A sample wedding website made with ShaadiTemplate. The couple and their story are fictional. Other versions:{' '}
      {others.map(([label, href], i) => (
        <span key={href}>
          <a href={href} className="underline underline-offset-4 hover:text-(--ov-zari)">
            {label}
          </a>
          {i < others.length - 1 ? ', ' : '. '}
        </span>
      ))}
      Wedding websites like this are coming soon; for now,{' '}
      <a href="#templates" className="underline underline-offset-4 hover:text-(--ov-zari)">
        make your invitation card
      </a>
      .
    </p>
  )
}

export function PhotoCredits() {
  return (
    <p className="mx-auto mt-4 max-w-3xl">
      Photographs from Wikimedia Commons, shown cropped and darkened:{' '}
      {Object.values(SHOTS).map(({ credit: c }, i) => (
        <span key={c.file}>
          {i > 0 && '; '}
          <a href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(c.file)}`} className="underline underline-offset-4 hover:text-(--ov-zari)" target="_blank" rel="noreferrer">
            {c.by}
          </a>{' '}
          ({c.licence})
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

export function RsvpForm({ photo = SHOTS.lakePalace }: { photo?: Photo }) {
  const [saved, setSaved] = useState<Rsvp | null>(() => load<Rsvp | null>(RSVP_KEY, null))
  const [editing, setEditing] = useState(!saved)
  const [error, setError] = useState('')
  const [party, setParty] = useState(saved?.party ?? 1)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name')).trim()
    const events = f.getAll('events').map(String)
    if (!name) {
      ;(e.currentTarget.elements.namedItem('name') as HTMLInputElement).focus()
      return setError('Add your name so the families know who is coming.')
    }
    const r: Rsvp = { name, side: String(f.get('side')), events, party, note: String(f.get('note')).trim() }
    save(RSVP_KEY, r)
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
        <p className="mt-5 text-center text-(--ov-mogra)/70">Reply by 1 October so the families can plan rooms and seating.</p>
        {!editing && saved ? (
          <div className="ov-rise mt-14 flex flex-col items-center text-center" aria-live="polite">
            <Knot />
            <p className="ov-display mt-6 text-[clamp(2rem,4vw,3rem)] italic">
              {saved.events.length ? `See you in Udaipur, ${saved.name}.` : `We’ll miss you, ${saved.name}.`}
            </p>
            <p className="mt-3 text-(--ov-mogra)/75">
              {saved.events.length
                ? `Party of ${saved.party} for ${saved.events.map((id) => EVENTS.find((e) => e.id === id)?.name).join(', ')}.`
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
                  ['ananya', 'Ananya’s family'],
                  ['arjun', 'Arjun’s family'],
                  ['both', 'Both, somehow'],
                ].map(([v, label]) => (
                  <label key={v} className="ov-chip">
                    <input type="radio" name="side" value={v} defaultChecked={(saved?.side ?? 'ananya') === v} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="ov-label">Which celebrations? Leave all unticked if you can’t come.</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {EVENTS.map((e) => (
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
              <input name="note" defaultValue={saved?.note} placeholder="Vegetarian, arriving from Delhi on the 20th" className="ov-field" />
            </label>
            <div className="text-center">
              <button type="submit" className="ov-press ov-btn-gold">
                Send reply
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export function Blessings({ photo = SHOTS.bazaar }: { photo?: Photo }) {
  const [list, setList] = useState<Blessing[]>(() => load<Blessing[]>(BLESS_KEY, []))
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [fresh, setFresh] = useState(0)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return setError('Add your name and a few words before you post.')
    const b = { name: name.trim(), text: text.trim(), at: Date.now() }
    const next = [b, ...list]
    save(BLESS_KEY, next)
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
        <p className="mt-5 text-center text-(--ov-mogra)/70">We’ll read every one on the morning of the pheras.</p>
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
            <button type="submit" className="ov-press ov-btn-gold justify-self-start">
              Post blessing
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

export function useTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    return () => void (document.title = prev)
  }, [title])
}


// Smooth scroll to an absolute page offset.
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 2.4 })
  else scrollTo(0, y)
}

// Section links must not overwrite the sample site's route hash.
export function jump(e: MouseEvent, id: string, offset = 0) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 })
  else el.scrollIntoView()
}
