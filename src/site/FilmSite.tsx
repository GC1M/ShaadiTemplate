import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Blessings, EVENTS, PhotoCredits, RsvpForm, SHOTS, STORY, VENUE, clamp01, downloadIcs, jump, reducedMotion, useLenis, useScroll, useTitle, type Photo, type WeddingEvent } from './shared'
import './film.css'

// The sample couple website told as a short film: a monogram opening, footage of Rajasthan under cinemascope
// bars, the story and the ceremonies as chapters with subtitles, and the replies under the closing credits.

const film = (f: string) => `${import.meta.env.BASE_URL}sample/film/${f}`
// Footage of Jaisalmer and the Thar from Wikimedia Commons, re-cut and compressed. Credited in the closing credits.
const CLIPS = {
  hero: { src: film('hero.mp4'), poster: film('hero.jpg') },
  dunes: { src: film('dunes.mp4'), poster: film('dunes.jpg') },
  lake: { src: film('lake.mp4'), poster: film('lake.jpg') },
}
const FOOTAGE = [
  { by: 'Incredible India', what: 'Jaisalmer Fort', file: 'Jaisalmer Fort - Rajasthan - India.webm', licence: 'CC BY 3.0' },
  { by: 'Incredible India', what: 'Rajasthan: you haven’t seen it all', file: "Rajasthan - You haven't seen it all.webm", licence: 'CC BY 3.0' },
]

const ROMAN = ['I', 'II', 'III', 'IV']

type Chapter = { id: string; card: string; title: string; body: string; photo: Photo; event?: WeddingEvent }
const STORY_CHAPTERS: Chapter[] = STORY.map((s, i) => ({ id: s.year, card: `Chapter ${ROMAN[i]}, ${s.year}`, title: s.title, body: s.body, photo: s.photo }))
const EVENT_CHAPTERS: Chapter[] = EVENTS.map((e) => ({ id: e.id, card: e.date, title: e.name, body: `${e.time}. ${e.note}`, photo: e.photo, event: e }))

/* ---------- Sound: a tanpura drone, synthesised, so there's no audio file to load ---------- */

function useTanpura() {
  const ctx = useRef<AudioContext | null>(null)
  const out = useRef<{ gain: GainNode; timer: number } | null>(null)
  const [on, setOn] = useState(false)

  const stop = () => {
    const o = out.current
    const ac = ctx.current
    if (!o || !ac) return
    clearInterval(o.timer)
    o.gain.gain.cancelScheduledValues(ac.currentTime)
    o.gain.gain.setTargetAtTime(0, ac.currentTime, 0.4)
    setTimeout(() => o.gain.disconnect(), 3000)
    out.current = null
    setOn(false)
  }

  const start = () => {
    const ac = (ctx.current ??= new AudioContext())
    void ac.resume()
    const gain = ac.createGain()
    gain.gain.setValueAtTime(0, ac.currentTime)
    gain.gain.linearRampToValueAtTime(0.14, ac.currentTime + 3)
    gain.connect(ac.destination)
    // Pa, Sa, Sa, low Sa in C sharp: one string every 1.2 s, as a tanpura is played.
    const notes = [103.83, 138.59, 138.59, 69.3]
    const pluck = (f: number, at: number) => {
      const env = ac.createGain()
      env.gain.setValueAtTime(0.0001, at)
      env.gain.exponentialRampToValueAtTime(0.5, at + 0.03)
      env.gain.exponentialRampToValueAtTime(0.001, at + 4.6)
      const lp = ac.createBiquadFilter()
      lp.type = 'lowpass'
      lp.Q.value = 6
      // The bright buzz of the jawari bridge, mellowing as the string rings.
      lp.frequency.setValueAtTime(2600, at)
      lp.frequency.exponentialRampToValueAtTime(500, at + 3.5)
      lp.connect(env).connect(gain)
      for (const detune of [-4, 4]) {
        const o = ac.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = f
        o.detune.value = detune
        o.connect(lp)
        o.start(at)
        o.stop(at + 4.8)
      }
    }
    let next = ac.currentTime + 0.1
    let i = 0
    const schedule = () => {
      while (next < ac.currentTime + 1.5) {
        pluck(notes[i++ % 4], next)
        next += 1.2
      }
    }
    schedule()
    out.current = { gain, timer: window.setInterval(schedule, 400) }
    setOn(true)
  }

  useEffect(() => () => stop(), [])
  return { on, toggle: () => (on ? stop() : start()) }
}

/* ---------- Pieces ---------- */

function Clip({ clip, className = '' }: { clip: { src: string; poster: string }; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  // Plays only while on screen, and never for people who asked for less motion.
  useEffect(() => {
    const v = ref.current!
    if (reducedMotion()) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? void v.play().catch(() => {}) : v.pause()))
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} src={clip.src} poster={clip.poster} muted loop playsInline preload="metadata" aria-hidden className={`absolute inset-0 h-full w-full object-cover ${className}`} />
}

// Each letter arrives on its own, like a title being set.
function Letters({ text, delay }: { text: string; delay: number }) {
  return (
    <span aria-label={text} className="fm-letters">
      {[...text].map((c, i) => (
        <span key={i} aria-hidden style={{ animationDelay: `${delay + i * 85}ms` }}>
          {c}
        </span>
      ))}
    </span>
  )
}

function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <circle cx="100" cy="100" r="92" pathLength={1} className="fm-draw" />
      <circle cx="100" cy="100" r="84" pathLength={1} className="fm-draw fm-draw-late" />
      <path d="M100 30 L103 36 L100 42 L97 36 Z M100 158 L103 164 L100 170 L97 164 Z" className="fm-gem" />
      <text x="100" y="118" textAnchor="middle" className="fm-mono-text">
        A<tspan className="fm-mono-amp">&amp;</tspan>A
      </text>
    </svg>
  )
}

function Opening({ open }: { open: boolean }) {
  return (
    <div className="fm-opening" data-open={open || undefined} aria-hidden>
      <Monogram className="fm-opening-mark" />
    </div>
  )
}

function Hero({ open }: { open: boolean }) {
  return (
    <header className="fm-hero" data-open={open || undefined}>
      <Clip clip={CLIPS.hero} className="fm-hero-clip" />
      <div className="fm-hero-shade absolute inset-0" />
      <span className="fm-bar fm-bar-top" aria-hidden />
      <span className="fm-bar fm-bar-bottom" aria-hidden />
      <div className="fm-frame" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="fm-fade ov-meta text-(--ov-mogra)/80" style={{ '--d': '300ms' } as CSSProperties}>
          The Sharma and Rao families present
        </p>
        <h1 className="ov-display fm-names mt-6">
          <Letters text="Ananya" delay={900} />
          <span className="fm-fade fm-amp" style={{ '--d': '1500ms' } as CSSProperties}>
            and
          </span>
          <Letters text="Arjun" delay={1700} />
        </h1>
        <p className="fm-fade ov-meta mt-8 text-(--ov-zari)" style={{ '--d': '2600ms' } as CSSProperties}>
          Udaipur, 20 and 21 November 2027
        </p>
      </div>
      <span className="fm-fade fm-cue" style={{ '--d': '3400ms' } as CSSProperties} aria-hidden />
    </header>
  )
}

// A title card that holds, then gives way to the scene and its subtitle as you scroll.
function Scene({ c }: { c: Chapter }) {
  const ref = useRef<HTMLElement>(null)
  const sub = useRef<HTMLDivElement>(null)
  useScroll(() => {
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const p = clamp01(-r.top / (r.height - innerHeight))
    el.style.setProperty('--p', p.toFixed(4))
    const phase = p < 0.32 ? 'card' : 'scene'
    if (el.dataset.phase !== phase) {
      el.dataset.phase = phase
      sub.current!.inert = phase !== 'scene'
    }
  })
  return (
    <section ref={ref} id={c.event ? c.id : undefined} className="fm-scene" data-phase="card" aria-label={c.title}>
      <div className="fm-stage">
        <img src={c.photo.src} srcSet={c.photo.srcSet} sizes="100vw" alt={c.photo.alt} loading="lazy" className="fm-plate" style={{ objectPosition: c.photo.pos }} />
        <div className="fm-scene-shade" />
        <span className="fm-bar fm-bar-top" aria-hidden />
        <span className="fm-bar fm-bar-bottom" aria-hidden />
        <div className="fm-card">
          <p className="ov-meta text-(--ov-zari)">{c.card}</p>
          <h3 className="ov-display mt-5 text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.95]">{c.title}</h3>
        </div>
        <div ref={sub} className="fm-sub" inert>
          <p className="ov-display fm-subtitle">{c.body}</p>
          {c.event && (
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => downloadIcs(c.event!)} className="ov-press ov-btn-gold">
                Add to calendar
              </button>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE)}`} target="_blank" rel="noreferrer" className="ov-press ov-btn-line">
                Get directions
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Intertitle({ id, kicker, title, clip }: { id?: string; kicker: string; title: string; clip: { src: string; poster: string } }) {
  return (
    <section id={id} className="fm-intertitle">
      <Clip clip={clip} />
      <div className="absolute inset-0 bg-(--fm-ink)/55" />
      <span className="fm-bar fm-bar-top" aria-hidden />
      <span className="fm-bar fm-bar-bottom" aria-hidden />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="ov-meta text-(--ov-zari)">{kicker}</p>
        <h2 className="ov-display mt-5 max-w-[16ch] text-[clamp(3rem,8vw,7rem)] leading-[0.95]">{title}</h2>
      </div>
    </section>
  )
}

function Credits() {
  const rows: [string, ReactNode][] = [
    ['Starring', 'Ananya Sharma and Arjun Rao'],
    ['With', 'The Sharma and Rao families, and everyone who came'],
    ['Venue', VENUE],
    ['Music', 'A tanpura, tuned to C sharp'],
    [
      'Footage',
      FOOTAGE.map((f, i) => (
        <span key={f.file}>
          {i > 0 && '; '}
          <a href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(f.file)}`} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-(--ov-zari)">
            {f.what}
          </a>{' '}
          by {f.by} ({f.licence})
        </span>
      )),
    ],
    ['Made with', 'ShaadiTemplate'],
  ]
  return (
    <footer className="bg-(--fm-ink) px-6 pb-16 pt-[16svh] text-(--ov-mogra)">
      <Monogram className="fm-credit-mark mx-auto" />
      <dl className="fm-credits mx-auto mt-16 max-w-3xl">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mx-auto mt-16 max-w-3xl text-center text-[13px] leading-relaxed text-(--ov-mogra)/55">
        <p>
          A sample wedding website. The couple and their story are fictional. See the same invitation as a{' '}
          <a href="#/ananya-arjun/hall" className="underline underline-offset-4 hover:text-(--ov-zari)">
            walk through a 3D palace hall
          </a>
          . Wedding websites like this are coming soon; for now,{' '}
          <a href="#templates" className="underline underline-offset-4 hover:text-(--ov-zari)">
            make your invitation card
          </a>
          .
        </p>
        <PhotoCredits />
      </div>
    </footer>
  )
}

export default function FilmSite() {
  useTitle('Ananya and Arjun, a film in Udaipur')
  useLenis()
  const [open, setOpen] = useState(reducedMotion)
  const [scrolled, setScrolled] = useState(false)
  const sound = useTanpura()
  useEffect(() => {
    if (open) return
    const t = setTimeout(() => setOpen(true), 2600)
    return () => clearTimeout(t)
  }, [open])
  useScroll(() => setScrolled(scrollY > innerHeight * 0.8))

  return (
    <div className="ov fm">
      <Opening open={open} />
      <div className="fm-grain" aria-hidden />

      <nav aria-label="Sections" className="fm-nav" data-show={scrolled || undefined}>
        <span className="ov-monogram" aria-label="Ananya and Arjun">
          A<i>&amp;</i>A
        </span>
        <div className="fm-links">
          <a href="#story" onClick={(e) => jump(e, 'story')}>
            Story
          </a>
          <a href="#celebrations" onClick={(e) => jump(e, 'celebrations')}>
            Celebrations
          </a>
          <a href="#rsvp" onClick={(e) => jump(e, 'rsvp')}>
            RSVP
          </a>
          <a href="#blessings" onClick={(e) => jump(e, 'blessings')}>
            Blessings
          </a>
        </div>
      </nav>

      <button type="button" onClick={sound.toggle} aria-pressed={sound.on} className="fm-sound ov-press">
        <span className="fm-eq" data-on={sound.on || undefined} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        {sound.on ? 'Sound on' : 'Play the tanpura'}
      </button>

      <Hero open={open} />

      <section className="bg-(--fm-ink) px-6 py-[20svh] text-center">
        <p className="ov-display mx-auto max-w-[24ch] text-[clamp(2rem,4.2vw,3.4rem)] italic leading-[1.2]">
          With the blessings of our families, we would love you to be with us in Udaipur as we marry.
        </p>
      </section>

      <div id="story">
        <Intertitle kicker="Part one" title="How we got here" clip={CLIPS.dunes} />
        {STORY_CHAPTERS.map((c) => (
          <Scene key={c.id} c={c} />
        ))}
      </div>
      <div id="celebrations">
        <Intertitle kicker="Part two, at The Leela Palace" title="Two days by the lake" clip={CLIPS.lake} />
        {EVENT_CHAPTERS.map((c) => (
          <Scene key={c.id} c={c} />
        ))}
      </div>

      <RsvpForm photo={SHOTS.embrace} />
      <Blessings photo={SHOTS.bazaar} />
      <Credits />
    </div>
  )
}
