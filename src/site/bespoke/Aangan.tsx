import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { mainOf, mapsUrl, type Design, type WeddingEvent } from '../designs'
import type { Photo } from '../photos'
import { Blessings, RsvpForm, downloadIcs, jump, reducedMotion, useLenis } from '../shared'
import { SiteFooter, SiteNav, themeVars, type SiteProps } from '../WeddingSite'
import '../organza.css'
import '../site.css'
import './aangan.css'
import { Music } from '../music'

// Diya Aangan: a dark haveli courtyard the guest lights by pulling a rope, then the invitation in a painted arch,
// each function on a scroll that unrolls, the couple behind parting trees, photos hanging in a courtyard, guest notes,
// RSVP under a royal night sky. Painted art is in public/site-art/aangan/; every word and photo comes from the design.

const ART = '/site-art/aangan/'
// Stages of the opening: 0 dark (rope), 1 lit, 2 names, 3 date, 4 venue, 5 lotus. Times are ms after the pull.
const LIGHT_AT = [200, 1200, 2200, 2550, 3100]

// A painted scene with a phone (m) and a computer (d) cut; `%` in the name is the cut letter.
function Scene({ name, className = '', eager }: { name: string; className?: string; eager?: boolean }) {
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={`${ART}${name.replace('%', 'd')}.webp`} />
      <img src={`${ART}${name.replace('%', 'm')}.webp`} alt="" aria-hidden loading={eager ? 'eager' : 'lazy'} decoding="async" className={`ag-scene ${className}`} />
    </picture>
  )
}

const Art = ({ src, className, style }: { src: string; className: string; style?: CSSProperties }) => (
  <img src={ART + src} alt="" aria-hidden loading="lazy" decoding="async" draggable={false} className={className} style={style} />
)

// The six painted function icons, matched by name in any of the usual spellings; anything else gets a diya.
const ICONS: [RegExp, string][] = [
  [/meh[ae]?n?d[hi]|mendhi|henna/i, 'mehendi'],
  [/haldi|pithi|tel ?baan|mayr?an/i, 'haldi'],
  [/sangeet|garba|dandiya|cocktail|music|ras/i, 'sangeet'],
  [/reception|dinner|party/i, 'reception'],
  [/vida+i|bida+i|farewell/i, 'vidaai'],
  [/shaadi|wedding|vivaa?h|phera|lagna|nikah|anand|kalyan|mandap|baraat/i, 'shaadi'],
]
const iconOf = (name: string) => {
  const hit = ICONS.find(([re]) => re.test(name))
  return hit ? `event/pn-evt-ico-${hit[1]}-x-v01.webp` : 'shared/diya.webp'
}

// "12 · February · 2028" from "Saturday, 12 February 2028".
const dotted = (e?: WeddingEvent) => e?.date.split(', ').pop()!.replace(/ /g, ' · ')

const Lotus = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden className="ag-lotus-mark">
    {[0, 60, -60, 120, -120, 180].map((r, i) => (
      <ellipse key={r} cx="11" cy="8" rx={i < 3 ? 2.8 : 2.2} ry={i < 3 ? 5.8 : 4.8} fill="currentColor" opacity={[0.8, 0.6, 0.6, 0.4, 0.4, 0.28][i]} transform={`rotate(${r} 11 11)`} />
    ))}
    <circle cx="11" cy="11" r="2" fill="currentColor" />
  </svg>
)

/* ---------- Opening: pull the rope, the courtyard lights up, tap the lotus to enter ---------- */

function Intro({ d, stage, light, skip }: { d: Design; stage: number; light: () => void; skip: () => void }) {
  const rope = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ y: number; peak: number } | null>(null)
  const [entering, setEntering] = useState(false)
  const lotus = useRef<HTMLButtonElement>(null)
  const keyed = useRef(false)
  const entry = useRef(0)
  useEffect(() => () => clearTimeout(entry.current), [])
  // A keyboard guest who lit the rope (which then goes away) lands on the lotus.
  useEffect(() => {
    if (stage === 5 && keyed.current) lotus.current?.focus({ preventScroll: true })
  }, [stage])
  const main = d.events.length ? mainOf(d) : undefined

  // How far the rope must come down: about a tenth of the screen.
  const threshold = () => Math.min(112, Math.max(84, Math.round(innerHeight * 0.11)))
  // The rope gives easily at first, then stiffens.
  const resist = (y: number, t: number) => (y <= t * 0.4 ? y * 0.9 : t * 0.36 + (y - t * 0.4) * 0.5)
  const setPull = (px: number) => {
    rope.current?.style.setProperty('--pull', `${px}px`)
    rope.current?.style.setProperty('--stretch', String(1 + px / 160))
  }
  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (stage) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* WebKit throws if the pointer is already gone; the pull still works without capture */
    }
    drag.current = { y: e.clientY, peak: 0 }
    e.currentTarget.dataset.pulling = ''
  }
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const g = drag.current
    if (!g) return
    const dy = Math.max(0, e.clientY - g.y)
    g.peak = Math.max(g.peak, dy)
    setPull(resist(dy, threshold()))
    if (dy >= threshold()) {
      drag.current = null
      delete e.currentTarget.dataset.pulling
      setPull(0)
      light()
    }
  }
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    drag.current = null
    delete e.currentTarget.dataset.pulling
    setPull(0)
  }
  const enter = () => {
    setEntering(true)
    entry.current = window.setTimeout(() => document.getElementById('ag-invite')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }), reducedMotion() ? 0 : 900)
  }

  const on = (n: number) => (stage >= n ? ' on' : '')
  return (
    <section className={`ag-intro${stage ? ' is-lit' : ''}`} aria-label="Opening">
      <Scene name="hero/pn-hro-bg-courtyard-dark-%-v03" className="ag-intro-bg" eager />
      <Scene name="hero/pn-hro-bg-courtyard-lit-%-v03" className="ag-intro-bg ag-intro-lit" eager />
      <div className="ag-intro-shade" aria-hidden />
      {stage > 0 && !reducedMotion() && <div className="ag-flash" aria-hidden />}
      <div className="ag-dust" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ left: `${18 + ((i * 37) % 64)}%`, bottom: `${10 + ((i * 23) % 55)}%`, animationDelay: `${(i * 0.7) % 8}s`, animationDuration: `${8 + (i % 5) * 2}s` }} />
        ))}
      </div>
      <Art src="hero/pn-shr-mot-floral-bush-cluster-x-v01.webp" className="ag-floral ag-floral-l" />
      <Art src="hero/pn-shr-mot-floral-bush-cluster-x-v01.webp" className="ag-floral ag-floral-r" />
      <Art src="hero/pn-shr-mot-diya-glow-x-v01.webp" className="ag-diya ag-diya-l" />
      <Art src="hero/pn-shr-mot-diya-glow-x-v01.webp" className="ag-diya ag-diya-r" />
      <Art src="shared/pn-shr-mot-jhoomer-hanging-x-v01.webp" className="ag-jhoomer" />

      <button
        ref={rope}
        type="button"
        className="ag-rope"
        aria-label="Pull the rope to light the courtyard"
        disabled={stage > 0}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        // A tap, a short tug or Enter/Space lights it too, so no guest is stuck in the dark. A keyboard click
        // (no pointer, detail 0) then moves focus on to the lotus.
        onClick={(e) => ((keyed.current = e.detail === 0), light())}
      >
        <img src={`${ART}hero/pn-hro-el-rope-hemp-pull-x-v01.webp`} alt="" draggable={false} className="ag-rope-img" />
        <span className="ag-rope-halo" aria-hidden />
      </button>

      {stage === 0 && (
        <div className="ag-pull" aria-live="polite">
          <p className="ag-pull-label">
            <span aria-hidden>↓ </span>Pull the rope to light us up
          </p>
        </div>
      )}

      <div className="ag-reveal">
        {d.invocation && <p className={`ag-invocation${on(2)}`}>{d.invocation}</p>}
        <h1 className={`ag-names${on(2)}`}>
          <span>{d.couple[0]}</span> <span className="ag-amp">&amp;</span>
          <br />
          <span>{d.couple[1]}</span>
        </h1>
        {d.nativeNames && (
          <p className={`ag-native${on(2)}`}>
            {d.nativeNames}
          </p>
        )}
        <div className={`ag-ornament${on(3)}`} aria-hidden>
          <span />
          <i />
          <span />
        </div>
        {main && <p className={`ag-date${on(3)}`}>{dotted(main)}</p>}
        <p className={`ag-venue${on(4)}`}>{d.venue}</p>
        <div className={`ag-lotus-cta${on(5)}`}>
          <button ref={lotus} type="button" className="ag-lotus" data-open={entering || undefined} onClick={enter} aria-label="Enter: see the invitation" tabIndex={stage >= 5 ? 0 : -1}>
            <img src={`${ART}hero/pn-fx-ovl-lotus-glow-burst-x-v01.webp`} alt="" className="ag-lotus-glow" />
            <img src={`${ART}hero/pn-rvl-btn-lotus-closed-x-v01.webp`} alt="" className="ag-lotus-closed" />
            <img src={`${ART}hero/pn-rvl-btn-lotus-open-x-v01.webp`} alt="" className="ag-lotus-open" />
          </button>
          <p className="ag-lotus-label" aria-hidden>
            Tap the lotus to enter
          </p>
        </div>
      </div>

      {stage === 0 && (
        <button type="button" className="ag-skip" onClick={skip}>
          Skip the opening
        </button>
      )}
    </section>
  )
}

/* ---------- Invitation in the painted arch ---------- */

function Invite({ d }: { d: Design }) {
  const main = d.events.length ? mainOf(d) : undefined
  const parents = d.parents.filter((p) => p.trim())
  return (
    <section id="ag-invite" className="ag-invite" aria-labelledby="ag-invite-title">
      <Scene name="invite/pn-inv-bg-panel-%-v01" className="ag-invite-bg" />
      <div className="ag-invite-shade" aria-hidden />
      <div className="ag-birds" aria-hidden>
        <i className="ag-bird ag-bird-a" />
        <i className="ag-bird ag-bird-b" />
      </div>
      <div className="ag-petals" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <Art key={i} src="invite/petal.webp" className="ag-petal" style={{ left: `${8 + i * 12}%`, animationDelay: `${i * 1.6}s`, animationDuration: `${11 + (i % 3) * 3}s` }} />
        ))}
      </div>
      <div className="ag-card" data-reveal>
        <div className="ag-card-text">
          {d.invite && <p className="ag-card-invite">{d.invite}</p>}
          <Art src="invite/pn-inv-div-lotus-divider-x-v01.webp" className="ag-card-div" />
          <h2 id="ag-invite-title" className="ag-card-names">
            {d.couple[0]} <span className="ag-amp">&amp;</span> {d.couple[1]}
          </h2>
          <Art src="invite/pn-inv-div-lotus-divider-x-v01.webp" className="ag-card-div" />
          {parents.map((p, i) => (
            <p key={i} className="ag-card-parents">
              {p}
            </p>
          ))}
          {main && <p className="ag-card-date">{main.date}</p>}
          <p className="ag-card-venue">{d.venue}</p>
        </div>
      </div>
      {d.events.length > 0 && (
        <a href="#ag-events" onClick={(e) => jump(e, 'ag-events')} className="ag-btn ag-invite-cta">
          See the functions
        </a>
      )}
    </section>
  )
}

/* ---------- Functions: one scroll per function, unrolling as it comes into view ---------- */

function Events({ d }: { d: Design }) {
  if (!d.events.length) return null
  const main = mainOf(d)
  return (
    <section id="ag-events" className="ag-events" aria-labelledby="ag-events-title">
      <div className="ag-stars" aria-hidden />
      <Art src="shared/pn-shr-mot-jhoomer-hanging-x-v01.webp" className="ag-evt-jhoomer" />
      <Art src="shared/pn-shr-div-floral-corner-top-left-x-v01.webp" className="ag-corner ag-corner-l" />
      <Art src="shared/pn-shr-div-floral-corner-top-right-x-v01.webp" className="ag-corner ag-corner-r" />
      <Art src="shared/pn-shr-mot-peacock-main-x-v01.webp" className="ag-evt-peacock" />
      <Art src="shared/pn-shr-mot-elephant-main-x-v01.webp" className="ag-evt-elephant" />
      <header className="ag-head" data-reveal>
        <p className="ag-eyebrow">The celebration journey</p>
        <h2 id="ag-events-title" className="ag-title">
          {d.events.length === 1 ? 'The function' : 'The functions'}
        </h2>
        <Art src="event/pn-evt-div-lotus-vine-x-v01.webp" className="ag-head-div" />
      </header>
      <div className="ag-journey">
        <div className="ag-vine" aria-hidden />
        <ol className="ag-stops">
          {d.events.map((e) => (
            <li key={e.id} className={`ag-stop${e === main && d.events.length > 1 ? ' is-main' : ''}`} data-reveal>
              <Art src="event/pn-evt-farman-rolled-x-v01.webp" className="ag-rolled" />
              <div className="ag-farman">
                <Art src="event/pn-evt-farman-open-x-v01.webp" className="ag-farman-paper" />
                <div className="ag-farman-text">
                  <img src={ART + iconOf(e.name)} alt="" loading="lazy" decoding="async" className="ag-farman-icon" />
                  <h3 className="ag-farman-name">{e.name}</h3>
                  <div className="ag-farman-rule" aria-hidden />
                  <p className="ag-farman-date">{e.date}</p>
                  <p className="ag-farman-where">{e.time}</p>
                  {e.note && <p className="ag-farman-note">{e.note}</p>}
                  <div className="ag-farman-actions">
                    <button type="button" className="ag-chip" onClick={() => downloadIcs(e, d)} aria-label={`Add ${e.name} to your calendar`}>
                      Add to calendar
                    </button>
                    {e.map && (
                      <a href={e.map} target="_blank" rel="noreferrer" className="ag-chip" aria-label={`Directions to ${e.name}`}>
                        Directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- The couple, behind trees that part ---------- */

function Couple({ d }: { d: Design }) {
  const meet = d.meet?.filter((m) => m.bio.trim()) ?? []
  const story = d.story.filter((s) => s.title.trim() || s.body.trim())
  if (!meet.length && !story.length) return null
  return (
    <section id="ag-couple" className="ag-couple" aria-labelledby="ag-couple-title" data-reveal>
      <Scene name="meet-the-couple/pn-cpl-bg-secret-garden-%-v01" className="ag-couple-bg" />
      <div className="ag-couple-shade" aria-hidden />
      <Art src="meet-the-couple/pn-cpl-ovl-tree-left-m-v01.webp" className="ag-tree ag-tree-l" />
      <Art src="meet-the-couple/pn-cpl-ovl-tree-right-m-v01.webp" className="ag-tree ag-tree-r" />
      <div className="ag-couple-text">
        <p className="ag-eyebrow">A love story</p>
        <h2 id="ag-couple-title" className="ag-title">
          {meet.length ? 'Meet the couple' : 'Our story'}
        </h2>
        <div className="ag-orn" aria-hidden>
          <span />
          <Lotus />
          <span />
        </div>
        {meet.length > 0 && (
          <div className="ag-meet">
            {meet.map((m, i) => (
              <figure key={i}>
                <img src={m.photo.small} alt={m.photo.alt} loading="lazy" decoding="async" style={{ objectPosition: m.photo.pos }} />
                <figcaption>
                  <span className="ag-meet-name">{m.name}</span>
                  {m.bio}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        {story.length > 0 && (
          <ol className="ag-story">
            {story.map((s, i) => (
              <li key={i}>
                {s.year && <span className="ag-story-year">{s.year}</span>}
                {s.title && <h3>{s.title}</h3>}
                {s.body && <p>{s.body}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

/* ---------- Gallery wall: photos in frames hanging in the courtyard ---------- */

// Each frame's glass, as insets of the frame (left, top, right, bottom), measured from the painted frames.
const FRAMES = {
  hero: { src: 'gallery/pn-gal-fr-hanging-hero-arch-x-v01.webp', ratio: '640 / 960', glass: [17.6, 28.4, 18, 9.9] },
  portrait: { src: 'gallery/pn-gal-fr-hanging-portrait-x-v01.webp', ratio: '520 / 780', glass: [21.9, 23.4, 21.9, 8.9] },
  landscape: { src: 'gallery/pn-gal-fr-hanging-landscape-x-v01.webp', ratio: '640 / 512', glass: [15.7, 33.1, 16.5, 12.1] },
}

function Frame({ photo, kind, onOpen, index }: { photo: Photo; kind: keyof typeof FRAMES; onOpen?: () => void; index: number }) {
  const f = FRAMES[kind]
  const [l, t, r, b] = f.glass
  const body = (
    <>
      <img src={photo.small} alt={photo.alt} loading="lazy" decoding="async" className="ag-frame-photo" style={{ left: `${l}%`, top: `${t}%`, width: `${100 - l - r}%`, height: `${100 - t - b}%`, objectPosition: photo.pos }} />
      <Art src={f.src} className="ag-frame-art" />
    </>
  )
  const style = { aspectRatio: f.ratio, transitionDelay: `${(index % 4) * 140}ms` } as CSSProperties
  return onOpen ? (
    <button type="button" className={`ag-frame ag-frame-${kind}`} style={style} onClick={onOpen} aria-label={`View larger: ${photo.alt}`} data-reveal>
      {body}
    </button>
  ) : (
    <div className={`ag-frame ag-frame-${kind}`} style={style} data-reveal>
      {body}
    </div>
  )
}

function Gallery({ d }: { d: Design }) {
  const photos = [...new Set([d.hero, ...d.gallery])]
  const box = useRef<HTMLDialogElement>(null)
  const [at, setAt] = useState(0)
  const show = (i: number) => (setAt(i), box.current?.open || box.current?.showModal())
  const step = (n: number) => setAt((i) => (i + n + photos.length) % photos.length)
  const p = photos[Math.min(at, photos.length - 1)]
  return (
    <section id="ag-gallery" className="ag-gallery" aria-labelledby="ag-gallery-title">
      <Scene name="gallery/pn-gal-bg-hanging-courtyard-%-v01" className="ag-gallery-bg" />
      <div className="ag-gallery-shade" aria-hidden />
      <header className="ag-head" data-reveal>
        <p className="ag-eyebrow">Memories</p>
        <h2 id="ag-gallery-title" className="ag-title">
          The gallery wall
        </h2>
      </header>
      <div className="ag-wall">
        {photos.map((ph, i) => (
          <Frame key={ph.src + i} photo={ph} index={i} kind={i === 0 ? 'hero' : i % 2 ? 'portrait' : 'landscape'} onOpen={() => show(i)} />
        ))}
      </div>
      <dialog
        ref={box}
        className="ag-lightbox"
        aria-label="Photo viewer"
        onClick={(e) => e.target === e.currentTarget && box.current?.close()}
        onKeyDown={(e) => (e.key === 'ArrowLeft' ? step(-1) : e.key === 'ArrowRight' ? step(1) : undefined)}
      >
        {p && <img src={p.src} srcSet={p.srcSet} sizes="90vw" alt={p.alt} />}
        <button type="button" className="ag-lb-close" onClick={() => box.current?.close()} aria-label="Close">
          ✕
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" className="ag-lb-prev" onClick={() => step(-1)} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" className="ag-lb-next" onClick={() => step(1)} aria-label="Next photo">
              ›
            </button>
          </>
        )}
      </dialog>
    </section>
  )
}

/* ---------- Venue and things to know ---------- */

function Know({ d, maps, stay, demo }: { d: Design; maps: string; stay: string; demo: boolean }) {
  const [place, ...rest] = d.venue.split(',')
  if (!d.venue && !stay && !d.notes.length) return null
  return (
    <section id="ag-know" className="ag-know" aria-labelledby="ag-know-title">
      <Art src="shared/pn-shr-mot-peacock-main-x-v01.webp" className="ag-motif ag-motif-peacock" />
      <Art src="shared/pn-shr-mot-elephant-main-x-v01.webp" className="ag-motif ag-motif-elephant" />
      <Art src="shared/pn-shr-mot-cow-main-x-v01.webp" className="ag-motif ag-motif-cow" />
      <header className="ag-head" data-reveal>
        <p className="ag-eyebrow">Guest essentials</p>
        <h2 id="ag-know-title" className="ag-title">
          {d.notes.length ? 'Things to know' : 'Where'}
        </h2>
        <div className="ag-orn" aria-hidden>
          <span />
          <Lotus />
          <span />
        </div>
      </header>
      {(d.venue || stay) && (
        <div className="ag-venue-card" data-reveal>
          {/* A couple's own venue photo only: the design's would show another city's palace as their venue. */}
          {d.venue && (demo || !d.venuePhoto.credit) && <Frame photo={d.venuePhoto} kind="landscape" index={0} />}
          <div>
            {d.venue && (
              <>
                <p className="ag-eyebrow">The venue</p>
                <h3 className="ag-venue-name">{place}</h3>
                {(rest.join(',').trim() || (d.city !== place ? d.city : '')) && <p className="ag-venue-city">{rest.join(',').trim() || d.city}</p>}
              </>
            )}
            {stay && <p className="ag-venue-stay">{stay}</p>}
            {d.venue && (
              <a href={maps} target="_blank" rel="noreferrer" className="ag-btn">
                Open in Maps
              </a>
            )}
          </div>
        </div>
      )}
      {d.notes.length > 0 && (
        <ul className="ag-notes">
          {d.notes.map((n, i) => (
            <li key={i} data-reveal style={{ transitionDelay: `${(i % 4) * 80}ms` }}>
              <Art src="shared/diya.webp" className="ag-note-diya" />
              <p>{n}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ---------- The page ---------- */

export default function Aangan({ d, mode, slug }: SiteProps) {
  useLenis()
  // Under reduced motion the courtyard opens already lit.
  const [stage, setStage] = useState(() => (reducedMotion() ? 5 : 0))
  const timers = useRef<number[]>([])
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // The page stays still only until the courtyard is lit.
  const dark = stage === 0
  useEffect(() => {
    if (!dark) return
    document.documentElement.style.overflow = 'hidden'
    return () => void (document.documentElement.style.overflow = '')
  }, [dark])

  // Sections rise in once, as they scroll into view. Runs again when the editor adds a function or photo.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.setAttribute('data-in', '')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    root.current?.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [d])

  const light = () => {
    if (stage || timers.current.length) return // a pull that lit it is followed by its own click
    timers.current = LIGHT_AT.map((t, i) => window.setTimeout(() => setStage(i + 1), t))
  }
  const skip = () => {
    timers.current.forEach(clearTimeout)
    setStage(5)
    // After the unlock has rendered.
    setTimeout(() => document.getElementById('ag-invite')?.scrollIntoView(), 30)
  }

  const maps = mapsUrl(d.venue)
  // The samples show a line about rooms; a couple's site shows only what they wrote.
  const stay = d.stay ?? (mode === 'demo' ? 'Rooms are held for guests until a month before. Mention our names when you book, and tell us your arrival time in the RSVP.' : '')
  const hasCouple = d.story.some((s) => s.title.trim() || s.body.trim()) || !!d.meet?.some((m) => m.bio.trim())
  const links: [string, string][] = [
    ['ag-invite', 'Invitation'],
    ...(d.events.length ? [['ag-events', 'Functions'] as [string, string]] : []),
    ...(hasCouple ? [['ag-couple', 'Our story'] as [string, string]] : []),
    ['ag-gallery', 'Gallery'],
    ['rsvp', 'RSVP'],
  ]
  const main = d.events.length ? mainOf(d) : undefined

  return (
    <div ref={root} className="ov ag" style={themeVars(d)}>
      <SiteNav d={d} mode={mode} links={links} show={stage > 0} className="ag-nav" />
      <Music music={d.music} />

      <Intro d={d} stage={stage} light={light} skip={skip} />
      <Invite d={d} />
      <Events d={d} />
      <Couple d={d} />
      <Gallery d={d} />
      <Know d={d} maps={maps} stay={stay} demo={mode === 'demo'} />

      <div className="ag-rsvp">
        <Scene name="rsvp/pn-rsvp-bg-royal-finale-%-v01" className="ag-rsvp-bg" />
        <Art src="rsvp/pn-rsvp-div-finale-lotus-x-v01.webp" className="ag-rsvp-lotus" />
        <RsvpForm d={d} slug={slug} />
      </div>
      <Blessings d={d} slug={slug} />

      {d.compliments && d.compliments.length > 0 && (
        <section className="ag-compliments" aria-labelledby="ag-comp-title">
          <p id="ag-comp-title" className="ag-eyebrow">
            With best compliments from
          </p>
          <ul>
            {d.compliments.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="ag-closing" aria-labelledby="ag-closing-title">
        <div className="ag-closing-frame" data-reveal>
          <Art src="invite/pn-inv-div-lotus-divider-x-v01.webp" className="ag-closing-lotus" />
          <p className="ag-eyebrow">With all our love</p>
          <h2 id="ag-closing-title" className="ag-closing-names">
            {d.couple[0]} <span className="ag-amp">&amp;</span> {d.couple[1]}
          </h2>
          <div className="ag-orn" aria-hidden>
            <span />
            <Lotus />
            <span />
          </div>
          <p className="ag-closing-line">{d.note || 'You make this moment complete.'}</p>
          {main && <p className="ag-closing-date">{dotted(main)}</p>}
        </div>
      </section>

      <footer className="ag-footer">
        <SiteFooter d={d} mode={mode} slug={slug} />
      </footer>
    </div>
  )
}
