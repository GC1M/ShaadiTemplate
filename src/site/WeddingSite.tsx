import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { designByHash, DESIGNS, type Design } from './designs'
import { Backdrop, Blessings, PageSwitch, PhotoCredits, RsvpForm, SeeAlso, downloadIcs, jump, reducedMotion, useLenis, useTitle } from './shared'
import './organza.css'
import './site.css'

// One sample wedding website, drawn from a design in designs.ts. Every design shares the same sections and
// interactions (gate, unrolling scrolls, rolling save-the-date, hanging frames, arch cards); the theme colours,
// display face and hero layout are what tell them apart.

export const themeVars = ({ theme: t }: Design) =>
  ({ '--ov-kohl': t.bg, '--ov-smoke': t.raised, '--ov-zari': t.accent, '--ov-zari-deep': t.accent, '--ov-mogra': t.text, '--ov-gulab': t.soft, '--font-serif': t.display, '--ov-script': t.script, '--st-panel': t.panel ?? t.raised, '--st-panel-text': t.panelText ?? t.text }) as CSSProperties

// Event times are written in IST.
const istDate = (t: string) => new Date(t.replace(/(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)/, '$1-$2-$3T$4:$5:$6+05:30'))
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

// True once the element has scrolled into view; it stays true so reveals play once.
function useInView<T extends Element>(margin = '-12% 0px') {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, seen] as const
}

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`st-reveal ${className}`} data-in={seen || undefined} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ---------- Gate: two carved doors with a wax seal; tapping opens them onto the hero ---------- */

function Gate({ d, open, onOpen }: { d: Design; open: boolean; onOpen: () => void }) {
  const [gone, setGone] = useState(open)
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => setGone(true), 1900)
    return () => clearTimeout(t)
  }, [open])
  if (gone) return null
  return (
    <div className="st-gate" data-open={open || undefined}>
      <div className="st-door st-door-l" aria-hidden>
        <span className="st-door-panel" />
      </div>
      <div className="st-door st-door-r" aria-hidden>
        <span className="st-door-panel" />
      </div>
      <div className="st-gate-center">
        <p className="ov-meta uppercase text-(--ov-zari)">You are invited</p>
        <button type="button" onClick={onOpen} className="st-seal ov-press" aria-label={`Open the invitation from ${d.couple.join(' and ')}`}>
          <span className="ov-display text-3xl">
            {d.couple[0][0]}
            <i className="st-amp text-2xl">&amp;</i>
            {d.couple[1][0]}
          </span>
        </button>
        <p className="ov-display mt-2 text-2xl italic">{d.couple.join(' & ')}</p>
        <p className="ov-meta mt-1 text-[0.68rem] uppercase opacity-70">Tap the seal to open</p>
      </div>
    </div>
  )
}

/* ---------- Hero ---------- */

function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, istDate(to).getTime() - now)
  const parts: [number, string][] = [
    [Math.floor(left / 864e5), 'days'],
    [Math.floor(left / 36e5) % 24, 'hours'],
    [Math.floor(left / 6e4) % 60, 'min'],
    [Math.floor(left / 1e3) % 60, 'sec'],
  ]
  return (
    <dl className="mt-10 flex justify-center gap-3 sm:gap-5" aria-label="Time until the wedding">
      {parts.map(([n, label]) => (
        <div key={label} className="st-count flex flex-col-reverse items-center">
          <dt className="ov-meta mt-1.5 text-[0.6rem] uppercase opacity-70">{label}</dt>
          <dd className="ov-display text-[clamp(1.6rem,4vw,2.6rem)] leading-none tabular-nums">{String(n).padStart(2, '0')}</dd>
        </div>
      ))}
    </dl>
  )
}

// Each letter rises in turn once the gate has opened.
function Letters({ text, start }: { text: string; start: number }) {
  return (
    <span aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden className="st-letter" style={{ animationDelay: `${start + i * 70}ms` }}>
          {c}
        </span>
      ))}
    </span>
  )
}

function Names({ d, open }: { d: Design; open: boolean }) {
  const main = d.events[1] ?? d.events[0]
  if (!open) return <div className="h-[50svh]" />
  return (
    <div>
      <p className="ov-meta st-fade uppercase text-(--ov-gulab)" style={{ animationDelay: '500ms' }}>
        Together with their families
      </p>
      <h1 className="ov-display st-glow mt-6 text-[clamp(3.2rem,10vw,8rem)] leading-[0.95] [overflow-wrap:anywhere]">
        <span className="block sm:inline">
          <Letters text={d.couple[0]} start={700} />
        </span>
        <span className="st-amp st-fade block sm:inline" style={{ animationDelay: `${900 + d.couple[0].length * 70}ms` }}>
          &amp;
        </span>
        <span className="block sm:inline">
          <Letters text={d.couple[1]} start={1100 + d.couple[0].length * 70} />
        </span>
      </h1>
      <div className="st-fade" style={{ animationDelay: '2200ms' }}>
        <p className="ov-meta mt-7 uppercase">
          {main.date.split(', ')[1]} · {d.city}
        </p>
        <Countdown to={main.start} />
      </div>
    </div>
  )
}

// Scrolling past a full-bleed hero walks you into the photo: it scales up while the names fade.
function useScrollZoom() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (reducedMotion()) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => ref.current?.style.setProperty('--p', String(Math.min(1, scrollY / innerHeight))))
    }
    addEventListener('scroll', on, { passive: true })
    return () => (cancelAnimationFrame(raf), removeEventListener('scroll', on))
  }, [])
  return ref
}

function Hero({ d, open }: { d: Design; open: boolean }) {
  const zoomRef = useScrollZoom()
  const dust = <div className="st-dust" aria-hidden />
  if (d.layout === 'split')
    return (
      <header className="grid min-h-svh md:grid-cols-2">
        <div className="relative min-h-[52svh] overflow-hidden md:min-h-0">
          <Backdrop photo={d.hero} eager className={open ? 'st-zoom' : ''} />
        </div>
        <div className="relative grid place-items-center overflow-hidden px-6 py-20 text-center">
          {dust}
          <div className="st-frame-lines" aria-hidden />
          <Names d={d} open={open} />
        </div>
      </header>
    )
  if (d.layout === 'arch')
    return (
      <header className="relative flex min-h-svh flex-col items-center justify-center gap-12 overflow-hidden px-6 pb-20 pt-28 text-center">
        {dust}
        <div className="st-arch relative h-[48svh] w-[min(76vw,340px)]">
          <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
            <Backdrop photo={d.hero} eager className={open ? 'st-zoom' : ''} />
          </div>
        </div>
        <Names d={d} open={open} />
      </header>
    )
  return (
    <header ref={zoomRef} className="st-veil relative grid min-h-svh content-start justify-items-center overflow-hidden px-6 pt-[10svh] text-center">
      <Backdrop photo={d.hero} eager className={open ? 'st-zoom' : ''} />
      <div className="absolute inset-0 bg-linear-to-b from-(--ov-kohl)/90 via-(--ov-kohl)/30 via-55% to-(--ov-kohl)" />
      {dust}
      <div className="relative">
        <Names d={d} open={open} />
      </div>
    </header>
  )
}

/* ---------- Ornaments ---------- */

const Rule = () => <div className="st-rule" aria-hidden />

// A torn paper edge: `color` is the torn sheet, `on` the section it lies over.
function Torn({ color, on, flip }: { color: string; on: string; flip?: boolean }) {
  const pts = Array.from({ length: 41 }, (_, i) => `${i * 2.5},${(i * 37) % 7 === 0 ? 2 : 4 + ((i * 53) % 9)}`).join(' ')
  return (
    <svg viewBox="0 0 100 14" preserveAspectRatio="none" className={`block h-6 w-full sm:h-9 ${flip ? 'rotate-180' : ''}`} aria-hidden style={{ color, background: on, marginBlock: -1 }}>
      <polygon points={`0,14 ${pts} 100,14`} fill="currentColor" />
    </svg>
  )
}

// A paper scroll that unrolls between two gold-capped rods when it scrolls into view.
function Scroll({ title, children }: { title: string; children: ReactNode }) {
  const [ref, seen] = useInView<HTMLDivElement>('-20% 0px')
  return (
    <div ref={ref} className="st-scroll" data-in={seen || undefined}>
      <span className="st-rod" aria-hidden />
      <div className="st-paper">
        <div className="min-h-0">
          <div className="px-7 py-8 text-center sm:px-10">
            <p className="ov-display text-3xl text-(--ov-zari)">{title}</p>
            <div className="mt-4 leading-relaxed">{children}</div>
            <p className="mt-5 text-(--ov-zari)" aria-hidden>
              ❖
            </p>
          </div>
        </div>
      </div>
      <span className="st-rod" aria-hidden />
    </div>
  )
}

// A caparisoned elephant carrying a domed howdah, facing right. Drawn for these sites.
function Elephant({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 112" className={`st-elephant ${flip ? '-scale-x-100' : ''}`} aria-hidden>
      <path d="M44 6 C44 2 76 2 76 6 L78 14 H42 Z" fill="var(--ov-zari)" />
      <path d="M40 14 H80 L77 22 H43 Z" fill="var(--st-panel)" />
      <path d="M46 22 V34 M74 22 V34 M60 22 V34" stroke="var(--ov-zari)" strokeWidth="2" />
      <path d="M38 34 H82 V40 H38 Z" fill="var(--ov-zari)" />
      <path d="M14 104 V76 C14 52 30 38 56 38 C74 38 88 44 96 54 C104 63 108 74 108 88 C108 95 105 100 100 100 C100 92 99 84 95 80 L94 104 H82 V88 H40 V104 H28 V88 C22 90 16 96 14 104 Z" fill="var(--st-ivory)" stroke="var(--st-deep)" strokeWidth="1.5" />
      <path d="M30 42 H84 V74 C84 80 78 84 72 84 H42 C36 84 30 80 30 74 Z" fill="var(--st-panel)" />
      <path d="M30 74 C30 80 36 84 42 84 H72 C78 84 84 80 84 74" fill="none" stroke="var(--ov-zari)" strokeWidth="3" />
      {[38, 48, 58, 68, 78].map((x) => (
        <circle key={x} cx={x} cy={88} r="2.2" fill="var(--ov-zari)" />
      ))}
      <path d="M42 52 L57 62 L42 72 M72 52 L57 62 L72 72" fill="none" stroke="var(--ov-zari)" strokeWidth="1.6" />
      <circle cx="57" cy="62" r="4" fill="var(--ov-zari)" />
      <path d="M90 56 C96 54 102 58 103 64 L98 66 Z" fill="var(--st-panel)" stroke="var(--ov-zari)" strokeWidth="1.4" />
      <circle cx="96" cy="66" r="1.6" fill="var(--st-ink)" />
    </svg>
  )
}

/* ---------- Save the date: three tiles roll through numbers and land on the day ---------- */

function SaveTheDate({ d }: { d: Design }) {
  const main = d.events[1] ?? d.events[0]
  const s = main.start // IST, YYYYMMDDTHHMMSS
  const final = [String(+s.slice(6, 8)), MONTHS[+s.slice(4, 6) - 1], s.slice(0, 4)]
  const [ref, seen] = useInView<HTMLDivElement>('-25% 0px')
  const [shown, setShown] = useState(['00', '---', '0000'])
  useEffect(() => {
    if (!seen) return
    if (reducedMotion()) return setShown(final)
    let n = 0
    const t = setInterval(() => {
      n++
      setShown((cur) =>
        cur.map((v, i) => (n > 10 + i * 6 ? final[i] : i === 0 ? String(1 + Math.floor(Math.random() * 31)) : i === 1 ? MONTHS[Math.floor(Math.random() * 12)] : String(2020 + Math.floor(Math.random() * 10)))),
      )
      if (n > 24) clearInterval(t)
    }, 70)
    return () => clearInterval(t)
  }, [seen]) // `final` is derived from the design, which never changes while mounted
  const landed = shown.every((v, i) => v === final[i])
  return (
    <section className="px-6 py-[14svh] text-center">
      <p className="ov-meta uppercase text-(--ov-gulab)">Mark the day</p>
      <h2 className="ov-display mt-4 text-[clamp(2.6rem,6vw,4.5rem)] leading-none">Save the date</h2>
      <div ref={ref} className="mt-12 flex items-end justify-center gap-3 sm:gap-6" aria-label={main.date}>
        {d.elephants && <Elephant />}
        {shown.map((v, i) => (
          <div key={i} className="st-tile" data-landed={v === final[i] || undefined}>
            <span className="ov-meta text-[0.55rem] uppercase opacity-70">{['Day', 'Month', 'Year'][i]}</span>
            <span className="ov-display mt-1 text-[clamp(1.8rem,5vw,3rem)] leading-none tabular-nums">{v}</span>
          </div>
        ))}
        {d.elephants && <Elephant flip />}
      </div>
      <button type="button" onClick={() => downloadIcs(main, d)} className="ov-press ov-btn-gold mt-12" data-ready={landed || undefined}>
        ADD TO MY CALENDAR
      </button>
    </section>
  )
}

/* ---------- Story: frames hung from a picture rail, scrolled sideways ---------- */

type Frame = { kind: 'photo'; photo: Design['hero']; caption: string } | { kind: 'words'; year: string; title: string; body: string }

function Frames({ d }: { d: Design }) {
  const frames: Frame[] = [
    ...d.story.flatMap((s): Frame[] => [
      { kind: 'photo', photo: s.photo, caption: s.year },
      { kind: 'words', year: s.year, title: s.title, body: s.body },
    ]),
    ...d.gallery.map((p): Frame => ({ kind: 'photo', photo: p, caption: '' })),
  ]
  const row = useRef<HTMLUListElement>(null)
  const nudge = (dir: number) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.7, behavior: 'smooth' })
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <section id="story" className="bg-(--ov-smoke) py-[14svh]">
      <div className="px-6 text-center">
        <p className="ov-meta uppercase text-(--ov-gulab)">How we got here</p>
        <h2 className="ov-display mt-4 text-[clamp(2.6rem,6vw,4.5rem)] leading-none">Our story</h2>
        <p className="mt-4 text-sm opacity-60">Swipe along the wall</p>
      </div>
      <div ref={ref} className="st-wall relative mt-12" data-in={seen || undefined}>
        <div className="st-rail" aria-hidden />
        <ul ref={row} className="st-frames" aria-label="Our story in pictures">
          {frames.map((f, i) => (
            <li key={i} className="st-hang" style={{ '--i': i } as CSSProperties}>
              {f.kind === 'photo' ? (
                <figure className="st-pframe">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={f.photo.small} alt={f.photo.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: f.photo.pos }} />
                  </div>
                  {f.caption && <figcaption className="st-caption">{f.caption}</figcaption>}
                </figure>
              ) : (
                <div className="st-pframe st-wframe">
                  <p className="ov-display text-5xl leading-none text-(--ov-zari)">{f.year}</p>
                  <h3 className="ov-display mt-3 text-2xl leading-tight">{f.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed opacity-80">{f.body}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 hidden justify-center gap-4 md:flex">
          <button type="button" onClick={() => nudge(-1)} aria-label="Previous frames" className="ov-press ov-round">
            ←
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="Next frames" className="ov-press ov-round">
            →
          </button>
        </div>
      </div>
    </section>
  )
}

/* ---------- Meet the bride and groom: a letter each under a scalloped arch ---------- */

function Meet({ d }: { d: Design }) {
  if (!d.meet) return null
  return (
    <section className="px-6 py-[14svh]">
      <div className="mx-auto max-w-5xl text-center">
        <p className="ov-meta uppercase text-(--ov-gulab)">Say hello</p>
        <h2 className="ov-display st-foil mt-4 text-[clamp(2.6rem,6vw,4.5rem)] leading-none">Meet the bride &amp; groom</h2>
        <Rule />
        <div className="grid gap-14 md:grid-cols-2">
          {d.meet.map((m, i) => (
            <Reveal key={m.name} delay={i * 160}>
              <div className="st-cusp relative mx-auto aspect-[4/5] w-[min(80vw,320px)]">
                <img src={m.photo.small} alt={m.photo.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: m.photo.pos }} />
              </div>
              <p className="ov-display mt-6 text-5xl">
                <span className="st-amp text-6xl">{m.name}</span>
              </p>
              <p className="mx-auto mt-4 max-w-[38ch] text-lg leading-relaxed opacity-80">{m.bio}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Story as scattered polaroids: tap one to pick it up and read it ---------- */

const SCATTER = [
  [6, 4, -8],
  [58, 0, 6],
  [30, 30, -3],
  [70, 42, 9],
  [2, 52, 5],
  [40, 62, -7],
  [64, 74, 3],
]

function Polaroids({ d }: { d: Design }) {
  const items = [...d.story.map((s) => ({ photo: s.photo, title: `${s.year} · ${s.title}`, body: s.body })), ...d.gallery.map((p) => ({ photo: p, title: '', body: '' }))].slice(0, SCATTER.length)
  const [active, setActive] = useState<number | null>(null)
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <section id="story" className="overflow-hidden bg-(--ov-smoke) px-6 py-[14svh]">
      <div className="text-center">
        <p className="ov-meta uppercase text-(--ov-gulab)">How we got here</p>
        <h2 className="ov-display mt-4 text-[clamp(2.6rem,6vw,4.5rem)] leading-none">Our story</h2>
        <p className="mt-4 text-sm opacity-60">Tap a photo to pick it up</p>
      </div>
      <div ref={ref} className="st-table relative mx-auto mt-10 h-[min(150vw,760px)] max-w-4xl" data-in={seen || undefined}>
        {items.map((it, i) => {
          const [x, y, r] = SCATTER[i]
          const up = active === i
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(up ? null : i)}
              aria-expanded={up}
              aria-label={it.title || it.photo.alt}
              className="st-polaroid"
              data-up={up || undefined}
              style={{ '--x': `${x}%`, '--y': `${y}%`, '--r': `${r}deg`, '--i': i, zIndex: up ? 30 : i } as CSSProperties}
            >
              <span className="relative block aspect-square overflow-hidden">
                <img src={it.photo.small} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: it.photo.pos }} />
              </span>
              <span className="st-polaroid-text">
                <span className="block font-semibold">{it.title || it.photo.alt}</span>
                {up && it.body && <span className="mt-2 block text-[0.95rem] font-normal leading-snug">{it.body}</span>}
              </span>
            </button>
          )
        })}
        {active !== null && <button type="button" aria-label="Put the photo down" className="st-table-dim" onClick={() => setActive(null)} />}
      </div>
    </section>
  )
}

/* ---------- Closing countdown over a photo ---------- */

function Finale({ d }: { d: Design }) {
  const main = d.events.find((e) => e.photo === d.venuePhoto) ?? d.events[1] ?? d.events[0]
  return (
    <section className="relative grid min-h-svh place-items-center overflow-hidden px-6 text-center">
      <Backdrop photo={d.finale ?? d.hero} />
      <div className="absolute inset-0 bg-linear-to-b from-(--ov-kohl) via-(--ov-kohl)/40 to-(--ov-kohl)/70" />
      <Reveal className="relative">
        <p className="ov-meta uppercase text-(--ov-gulab)">{main.date}</p>
        <h2 className="ov-display st-foil mt-4 text-[clamp(2.8rem,7vw,5.5rem)] leading-none">The countdown begins</h2>
        <Countdown to={main.start} />
        <p className="ov-display mt-10 text-3xl italic">
          {d.couple[0]}
          <span className="st-amp">&amp;</span>
          {d.couple[1]}
        </p>
      </Reveal>
    </section>
  )
}

/* ---------- Ceremonies: arch-topped cards ---------- */

function Ceremonies({ d }: { d: Design }) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.venue)}`
  return (
    <section id="celebrations" className="bg-(--st-panel) px-6 pb-[14svh] pt-[10svh] text-(--st-panel-text)">
      <div className="mx-auto max-w-6xl text-center">
        <p className="ov-meta uppercase opacity-75">At {d.venue.split(',')[0]}</p>
        <h2 className="ov-display st-foil mt-4 text-[clamp(2.6rem,6vw,4.5rem)] leading-none">Ceremonies</h2>
        <Rule />
        <ul className={`grid gap-x-8 gap-y-12 md:grid-cols-2 ${d.events.length === 4 ? '' : 'lg:grid-cols-3'}`}>
          {d.events.map((e, i) => (
            <li key={e.id}>
              <Reveal delay={i * 140} className={`st-archcard text-(--ov-mogra) ${d.cards === 'cusp' ? 'st-archcard-cusp' : ''}`}>
                <div className="st-archcard-photo">
                  <img src={e.photo.small} alt={e.photo.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: e.photo.pos }} />
                </div>
                <div className="px-6 pb-7 pt-5">
                  <h3 className="ov-display text-4xl leading-none">{e.name}</h3>
                  <p className="ov-meta mt-3 text-[0.68rem] uppercase text-(--ov-zari)">{e.date}</p>
                  <p className="mt-2 opacity-80">{e.time}</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed opacity-70">{e.note}</p>
                  <div className="mt-5 flex items-center justify-center gap-5">
                    <a href={maps} target="_blank" rel="noreferrer" className="ov-link">
                      Directions
                    </a>
                    <button type="button" onClick={() => downloadIcs(e, d)} className="ov-link">
                      Add to calendar
                    </button>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function WeddingSite() {
  const d = designByHash(location.hash) ?? DESIGNS[0]
  useTitle(`${d.couple.join(' and ')}: ${d.name} wedding website`)
  useLenis()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    document.documentElement.style.overflow = open ? '' : 'hidden'
    return () => void (document.documentElement.style.overflow = '')
  }, [open])
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.venue)}`
  const bg = d.theme.bg
  const raised = d.theme.raised
  const panel = d.theme.panel ?? raised

  return (
    <div className="ov st" style={themeVars(d)}>
      <Gate d={d} open={open} onOpen={() => setOpen(true)} />

      <nav aria-label="Sections" className="st-nav" data-show={open || undefined}>
        <a href="#/websites" className="st-back">
          ← All designs
        </a>
        <div className="st-links">
          {[
            ['story', 'Story'],
            ['celebrations', 'Ceremonies'],
            ['venue', 'Venue'],
            ['rsvp', 'RSVP'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={(e) => jump(e, id, -64)}>
              {label}
            </a>
          ))}
        </div>
        <PageSwitch d={d} />
      </nav>

      <Hero d={d} open={open} />

      <section className="px-6 py-[14svh] text-center">
        <Reveal>
          <p className="ov-display mx-auto max-w-[26ch] text-[clamp(1.8rem,3.8vw,3rem)] italic leading-[1.25]">{d.invite}</p>
        </Reveal>
        <Rule />
        <div className="mx-auto grid max-w-4xl gap-14 md:grid-cols-2 md:gap-24">
          {d.couple.map((name, i) => (
            <Scroll key={name} title={name}>
              <p className="opacity-85">{d.parents[i]}</p>
            </Scroll>
          ))}
        </div>
      </section>

      <SaveTheDate d={d} />

      <Meet d={d} />

      <Torn color={raised} on={bg} />
      {d.storyStyle === 'polaroids' ? <Polaroids d={d} /> : <Frames d={d} />}
      <Torn color={panel} on={raised} />
      <Ceremonies d={d} />
      <Torn color={panel} on={bg} flip />

      <section id="venue" className="relative overflow-hidden">
        <Backdrop photo={d.venuePhoto} />
        <div className="absolute inset-0 bg-(--ov-kohl)/72" />
        <Reveal className="relative mx-auto max-w-3xl px-6 py-[18svh] text-center">
          <p className="ov-meta uppercase text-(--ov-gulab)">Where</p>
          <h2 className="ov-display st-foil mt-4 text-[clamp(2.4rem,6vw,4.5rem)] leading-none">{d.venue.split(',')[0]}</h2>
          <p className="mt-5 text-lg opacity-80">{d.venue.split(',').slice(1).join(',').trim() || d.city}</p>
          <p className="mx-auto mt-6 max-w-[44ch] opacity-70">Rooms are held for guests until a month before. Mention our names when you book, and tell us your arrival time in the RSVP.</p>
          <a href={maps} target="_blank" rel="noreferrer" className="ov-press ov-btn-gold mt-10">
            OPEN IN MAPS
          </a>
        </Reveal>
      </section>

      <RsvpForm d={d} />
      <Blessings d={d} />

      <section className="px-6 py-[14svh]" style={{ background: bg }}>
        <div className="mx-auto grid max-w-xl gap-16">
          {d.compliments && (
            <Scroll title="With best compliments from">
              <ul className="space-y-2 opacity-90">
                {d.compliments.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </Scroll>
          )}
          <Scroll title="Things to note">
            <ul className="space-y-3 text-left opacity-85">
              {d.notes.map((n) => (
                <li key={n} className="flex gap-3">
                  <span className="text-(--ov-zari)" aria-hidden>
                    ✦
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </Scroll>
        </div>
      </section>

      {d.closing === 'countdown' ? (
        <Finale d={d} />
      ) : (
      <section className="relative grid min-h-[80svh] place-items-center overflow-hidden px-6">
        <Backdrop photo={d.hero} />
        <div className="absolute inset-0 bg-(--ov-kohl)/45" />
        <Reveal className="st-sign relative">
          <p className="ov-display text-[clamp(1.8rem,4vw,2.8rem)] italic leading-tight">Your presence means the world to us</p>
          <p className="ov-display st-foil mt-5 text-4xl">
            {d.couple[0]}
            <span className="st-amp">&amp;</span>
            {d.couple[1]}
          </p>
        </Reveal>
      </section>
      )}

      <footer className="px-6 py-16 text-center text-sm opacity-80">
        <div className="mx-auto max-w-3xl">
          <SeeAlso d={d} />
        </div>
        <PhotoCredits d={d} />
      </footer>
    </div>
  )
}
