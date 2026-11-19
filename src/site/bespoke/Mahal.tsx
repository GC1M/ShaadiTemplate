import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { invokesGanesh, mainOf, mapsUrl, type Design } from '../designs'
import { Blessings, RsvpForm, downloadIcs, jump, reducedMotion, useLenis } from '../shared'
import { istDate, SiteFooter, SiteNav, themeVars, type SiteProps } from '../WeddingSite'
import '../organza.css'
import '../site.css'
import './mahal.css'
import { Music } from '../music'

// Mahal at Dusk: a painted palace that swells as the guest scrolls, elephants walking into the invitation card, and a
// curtain the bride and groom pull open on the couple. Every word and photo comes from the Design; the art is the
// design's own (public/site-art/mahal).

const art = (p: string) => `/site-art/mahal/${p}.webp`
const clamp = (n: number) => Math.min(1, Math.max(0, n))

// The painted icon for a function, by its name; anything unknown gets the diya.
const ICONS: [RegExp, string][] = [
  [/haldi|pithi|turmeric|ubtan|mayun/i, 'haldi'],
  [/meh[ae]?n?d[hi]|mendhi|henna/i, 'mehendi'],
  [/sangeet|cocktail|garba|dandiya|party|dinner|mixer/i, 'cocktail'],
  [/recep|walima/i, 'reception'],
  [/shaadi|wedding|viva+h|phera|nikah|lagna|melap|kalyanam|anand|marriage/i, 'shaadi'],
]
const iconOf = (name: string) => ICONS.find(([re]) => re.test(name))?.[1] ?? 'sagan'

// Plays each .mh-in block in once it scrolls into view. Runs again when the content changes (the editor preview),
// so new events and chapters get observed too.
function useReveal(root: RefObject<HTMLDivElement | null>, d: Design) {
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>('.mh-in:not([data-in])') ?? []
    if (reducedMotion()) return els.forEach((e) => (e.dataset.in = ''))
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          ;(e.target as HTMLElement).dataset.in = ''
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [root, d])
}

// Flowers drifting down; placed by index so every render (and the cover still) is the same.
function Petals({ n }: { n: number }) {
  return (
    <div className="mh-petals" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <img
          key={i}
          src={art('elements/element-2')}
          alt=""
          style={{ '--x': `${((i * 37 + 11) % 92) + 4}%`, '--t': `${10 + ((i * 5) % 7)}s`, '--w': `${14 + ((i * 7) % 14)}px`, '--dl': `${-i * 2.1}s`, '--dx': `${((i * 53) % 130) - 65}px` } as CSSProperties}
        />
      ))}
    </div>
  )
}

function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, istDate(to).getTime() - now)
  if (!left) return <p className="mh-begun">The celebrations have begun</p>
  const parts: [number, string][] = [
    [Math.floor(left / 864e5), 'Days'],
    [Math.floor(left / 36e5) % 24, 'Hrs'],
    [Math.floor(left / 6e4) % 60, 'Min'],
    [Math.floor(left / 1e3) % 60, 'Sec'],
  ]
  return (
    <dl className="mh-count" aria-label="Time until the wedding">
      {parts.map(([n, label]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{String(n).padStart(2, '0')}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ---------- Hero: the palace swells and tilts as the guest scrolls; the names fade out as it fills the screen ---------- */

function Hero({ d }: { d: Design }) {
  const wrap = useRef<HTMLDivElement>(null)
  const palace = useRef<HTMLImageElement>(null)
  const moon = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const nudge = useRef<HTMLDivElement>(null)
  const main = mainOf(d)

  useEffect(() => {
    if (reducedMotion()) return
    const fine = matchMedia('(pointer: fine)').matches
    let p = 0, ep = 0, mx = 0, my = 0, emx = 0, emy = 0, raf = 0
    // The refs go null before this effect's cleanup runs (a Suspense hide on leaving the page, a remount on Replay),
    // and scroll and resize events still arrive in between: every handler here returns early on a missing node.
    const draw = () => {
      const pal = palace.current, mo = moon.current, cp = copy.current, nu = nudge.current
      if (!pal || !mo || !cp || !nu) return void (raf = 0)
      ep += (p - ep) * 0.08
      emx += (mx - emx) * 0.08
      emy += (my - emy) * 0.08
      pal.style.transform = `translateX(-50%) perspective(1400px) rotateX(${(emy * -9).toFixed(2)}deg) rotateY(${(emx * -14).toFixed(2)}deg) scale(${(1 + ep * 0.45).toFixed(3)})`
      mo.style.transform = `translate(${(emx * -6).toFixed(1)}px, ${(ep * -40 + emy * -6).toFixed(1)}px)`
      const out = clamp((ep - 0.5) / 0.35)
      cp.style.opacity = String(1 - out)
      cp.style.transform = `translateY(${(ep * -32).toFixed(1)}px)`
      cp.style.filter = out ? `blur(${(out * 14).toFixed(1)}px)` : ''
      nu.style.opacity = String(clamp(1 - ep / 0.15))
      raf = Math.abs(p - ep) + Math.abs(mx - emx) + Math.abs(my - emy) > 0.001 ? requestAnimationFrame(draw) : 0
    }
    const kick = () => void (raf ||= requestAnimationFrame(draw))
    const onScroll = () => {
      const w = wrap.current
      if (!w) return
      p = clamp(-w.getBoundingClientRect().top / Math.max(1, w.offsetHeight - innerHeight))
      kick()
    }
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5
      my = e.clientY / innerHeight - 0.5
      kick()
    }
    addEventListener('scroll', onScroll, { passive: true })
    if (fine) addEventListener('pointermove', onMove, { passive: true })
    onScroll()
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={wrap} className="mh-hero">
      <div className="mh-pin">
        <div className="mh-sky" />
        <div ref={moon} className="mh-moon" />
        <img ref={palace} className="mh-palace" src={art('layers/herp-palace')} width={778} height={721} alt="" fetchPriority="high" />
        <div aria-hidden>
          <img className="mh-diya mh-diya-l" src={art('elements/element-1')} width={147} height={240} alt="" />
          <img className="mh-diya mh-diya-r" src={art('elements/element-1')} width={147} height={240} alt="" />
          <img className="mh-fall mh-fall-l" src={art('elements/element-4')} width={240} height={167} alt="" />
          <img className="mh-fall mh-fall-r" src={art('elements/element-5')} width={234} height={240} alt="" />
        </div>
        <Petals n={9} />
        <div ref={copy} className="mh-copy">
          <h1 className="mh-names">
            <span>{d.couple[0]}</span> <span className="mh-weds">weds</span> <span>{d.couple[1]}</span>
          </h1>
          {d.nativeNames && <p className="mh-native">{d.nativeNames}</p>}
          {main && (
            <p className="mh-when">
              {[main.date.split(', ').pop(), d.city].filter(Boolean).join(' · ')}
            </p>
          )}
          {main && <Countdown key={main.start} to={main.start} />}
        </div>
        <div ref={nudge} className="mh-nudge" aria-hidden>
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </div>
  )
}

function Head({ eye, title, em }: { eye: string; title: string; em: string }) {
  return (
    <div className="mh-head mh-in">
      <p className="mh-eye">{eye}</p>
      <h2 className="mh-h">
        {title} <em>{em}</em>
      </h2>
    </div>
  )
}

const Rule = () => (
  <svg className="mh-rule" viewBox="0 0 300 8" aria-hidden>
    <line x1="0" y1="4" x2="128" y2="4" />
    <polygon points="150,1 160,4 150,7 140,4" />
    <line x1="172" y1="4" x2="300" y2="4" />
  </svg>
)

/* ---------- Invitation: elephants walk in above a frosted card ---------- */

// "Daughter of Mrs. Anita ..." sets "Daughter of" apart, as the printed card does.
function Parent({ text }: { text: string }) {
  const m = text.match(/^(.{0,24}?\bof)\s+(.+)$/i)
  return <p className="mh-parent">{m ? <><em>{m[1]}</em>{m[2]}</> : text}</p>
}

function Invite({ d }: { d: Design }) {
  const parents = d.parents.filter((p) => p.trim())
  return (
    <>
      <div className="mh-bridge" aria-hidden>
        <img className="mh-eleph mh-eleph-l" src={art('elements/elephant-l')} width={560} height={548} alt="" loading="lazy" />
        <div className="mh-confetti">
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} style={{ '--x': `${i % 2 ? 66 + (i % 5) * 2 : 26 + (i % 5) * 2}%`, '--dl': `${-i * 0.37}s`, '--dx': `${((i * 29) % 60) - 30}px` } as CSSProperties} />
          ))}
        </div>
        <img className="mh-eleph mh-eleph-r" src={art('elements/elephant-r')} width={560} height={552} alt="" loading="lazy" />
      </div>
      <section id="invite" className="mh-invite">
        <img className="mh-fill" src={art('backgrounds/background-6')} alt="" loading="lazy" />
        <img className="mh-invite-couple" src={art('layers/hero-couple')} width={640} height={579} alt="" loading="lazy" />
        <img className="mh-toran" src={art('backgrounds/background-4')} alt="" loading="lazy" />
        <img className="mh-float-moon" src={art('elements/element-3')} width={240} height={207} alt="" loading="lazy" />
        <img className="mh-leaf mh-leaf-l" src={art('elements/element-4')} width={240} height={167} alt="" loading="lazy" />
        <img className="mh-leaf mh-leaf-r" src={art('elements/element-5')} width={234} height={240} alt="" loading="lazy" />
        <div className="mh-card mh-in">
          {d.invocation && (
            <>
              {invokesGanesh(d.invocation) && <img className="mh-ganesha" src={art('elements/element-6')} width={266} height={280} alt="Shri Ganesh" loading="lazy" />}
              <p className="mh-invocation">{d.invocation}</p>
            </>
          )}
          <Rule />
          {d.invite && <p className="mh-bless">{d.invite}</p>}
          <p className="mh-card-names">
            <span>{d.couple[0]}</span>
            <span className="mh-amp">&amp;</span>
            <span>{d.couple[1]}</span>
          </p>
          <Rule />
          {parents.length > 0 && (
            <div className="mh-fam">
              {parents.map((p, i) => (
                <div key={i} className="contents">
                  {i > 0 && (
                    <span className="mh-fam-dot" aria-hidden>
                      ✦
                    </span>
                  )}
                  <Parent text={p} />
                </div>
              ))}
            </div>
          )}
          {d.events.length > 0 && <p className="mh-close">On the following auspicious occasions</p>}
        </div>
      </section>
    </>
  )
}

/* ---------- Events: painted icons bobbing in a zigzag, each with its time, calendar and map ---------- */

function Events({ d }: { d: Design }) {
  if (!d.events.length) return null
  const main = mainOf(d)
  return (
    <section id="events" className="mh-events">
      <img className="mh-leaf mh-leaf-l" src={art('elements/element-4')} width={240} height={167} alt="" loading="lazy" />
      <img className="mh-leaf mh-leaf-r" src={art('elements/element-5')} width={234} height={240} alt="" loading="lazy" />
      <Head eye="The celebrations" title="Our" em="Events" />
      <ol className="mh-ev-list" data-cols={Math.min(3, d.events.length)}>
        {d.events.map((e, i) => (
          <li key={e.id} className={`mh-ev mh-in ${e === main ? 'mh-ev-main' : ''}`} style={{ '--sd': `${(i % 3) * 0.1}s`, '--bob': `${5 + (i % 4) * 0.6}s` } as CSSProperties}>
            <div className="mh-ev-icon">
              <img src={art(`icons/icon-${iconOf(e.name)}`)} alt="" loading="lazy" />
            </div>
            <h3 className="mh-ev-name">{e.name}</h3>
            <p className="mh-ev-date">{e.date.replace(/ \d{4}$/, '')}</p>
            <p className="mh-ev-time">{e.time}</p>
            {e.note && <p className="mh-ev-note">{e.note}</p>}
            <p className="mh-ev-links">
              <button type="button" onClick={() => downloadIcs(e, d)}>
                Add to calendar
              </button>
              {e.map && (
                <a href={e.map} target="_blank" rel="noreferrer">
                  Directions
                </a>
              )}
              {e.live && (
                <a href={e.live} target="_blank" rel="noreferrer">
                  Watch live
                </a>
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------- Story: the bride and groom pull a curtain open on the couple, then the chapters ---------- */

function Story({ d }: { d: Design }) {
  const meet = d.meet?.filter((m) => m.bio.trim()) ?? []
  const stage = useRef<HTMLDivElement>(null)
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)
  const bride = useRef<HTMLImageElement>(null)
  const groom = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const s = stage.current!
    // Null-safe for the same reason as the hero's handlers.
    const set = (a: number) => {
      const l = left.current, r = right.current, b = bride.current, g = groom.current
      if (!l || !r || !b || !g) return
      l.style.transform = `translateX(${(-a * 100).toFixed(2)}%)`
      r.style.transform = `translateX(${(a * 100).toFixed(2)}%)`
      b.style.transform = `translateX(${(-a * 28).toFixed(1)}px) scale(${(1 - a * 0.04).toFixed(3)})`
      g.style.transform = `translateX(${(a * 28).toFixed(1)}px) scale(${(1 - a * 0.04).toFixed(3)})`
      if (a >= 0.7) s.dataset.open = ''
    }
    if (reducedMotion()) return set(1)
    let ready = false
    let t = 0
    // How far the curtain has parted: it opens over most of a screen of scrolling once the stage is well in view.
    const apply = () => {
      if (!ready) return
      const p = clamp((innerHeight * 0.55 - s.getBoundingClientRect().top) / (innerHeight * 0.9))
      set(1 - Math.pow(1 - p, 3.2))
    }
    // First the two figures lean back on the ropes, then the curtain follows the scroll.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        s.dataset.pull = ''
        t = window.setTimeout(() => {
          delete s.dataset.pull
          ready = true
          apply()
        }, 1100)
      },
      { threshold: 0.22 },
    )
    io.observe(s)
    addEventListener('scroll', apply, { passive: true })
    addEventListener('resize', apply)
    return () => {
      io.disconnect()
      clearTimeout(t)
      removeEventListener('scroll', apply)
      removeEventListener('resize', apply)
    }
  }, [])

  return (
    <section id="story" className="mh-story">
      <div ref={stage} className="mh-stage">
        <div className="mh-reveal">
          <svg className="mh-mandala" viewBox="0 0 320 320" aria-hidden>
            <circle cx="160" cy="160" r="130" />
            <circle cx="160" cy="160" r="100" />
            <circle cx="160" cy="160" r="70" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
              <ellipse key={r} cx="160" cy="60" rx="10" ry="28" transform={`rotate(${r} 160 160)`} />
            ))}
          </svg>
          <p className="mh-eye">Our journey</p>
          <h2 className="mh-h">
            Meet the <em>Couple</em>
          </h2>
          <p className="mh-st-names">
            {d.couple[0]} <span className="mh-amp">&amp;</span> {d.couple[1]}
          </p>
          {d.note && <p className="mh-verse">{d.note}</p>}
        </div>
        <img ref={bride} className="mh-char mh-bride" src={art('elements/element-bride')} width={545} height={700} alt="" loading="lazy" />
        <img ref={groom} className="mh-char mh-groom" src={art('elements/element-groom')} width={401} height={700} alt="" loading="lazy" />
        <div className="mh-curtains" aria-hidden>
          <div ref={left} className="mh-curt mh-curt-l">
            <img src={art('elements/element-curtain')} alt="" loading="lazy" />
          </div>
          <div ref={right} className="mh-curt mh-curt-r">
            <img src={art('elements/element-curtain')} alt="" loading="lazy" />
          </div>
        </div>
      </div>

      {meet.length > 0 && (
        <div className="mh-meet">
          {meet.map((m, i) => (
            <article key={i} className="mh-glass mh-in" style={{ '--sd': `${i * 0.12}s` } as CSSProperties}>
              <img src={m.photo.small} alt={m.photo.alt} loading="lazy" style={{ objectPosition: m.photo.pos }} />
              <h3>{m.name}</h3>
              <p>{m.bio}</p>
            </article>
          ))}
        </div>
      )}

      {d.story.length > 0 && (
        <ol className="mh-chapters">
          {d.story.map((s, i) => (
            <li key={i} className="mh-glass mh-in" style={{ '--sd': `${(i % 3) * 0.12}s` } as CSSProperties}>
              <img src={s.photo.small} alt={s.photo.alt} loading="lazy" style={{ objectPosition: s.photo.pos }} />
              <p className="mh-year">{s.year}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function Gallery({ d }: { d: Design }) {
  if (!d.gallery.length) return null
  return (
    <section id="gallery" className="mh-gallery">
      <img className="mh-fill" src={art('backgrounds/background-6')} alt="" loading="lazy" />
      <Head eye="Moments" title="Our" em="Gallery" />
      <div className="mh-gal" data-n={Math.min(d.gallery.length, 4)}>
        {d.gallery.map((p, i) => (
          <figure key={i} className="mh-in" style={{ '--sd': `${(i % 4) * 0.08}s` } as CSSProperties}>
            <img src={p.small} srcSet={p.srcSet} sizes="(min-width: 640px) 25vw, 50vw" alt={p.alt} loading="lazy" style={{ objectPosition: p.pos }} />
          </figure>
        ))}
      </div>
    </section>
  )
}

function Tile({ icon, label, children }: { icon: ReactNode; label?: string; children: ReactNode }) {
  return (
    <li className="mh-tile mh-in">
      <svg viewBox="0 0 32 32" aria-hidden>
        {icon}
      </svg>
      {label && <p className="mh-tile-l">{label}</p>}
      <div className="mh-tile-v">{children}</div>
    </li>
  )
}

function Things({ d, maps }: { d: Design; maps: string }) {
  return (
    <section id="things" className="mh-things">
      <Head eye="Good to know" title="Things to" em="Know" />
      <ul className="mh-tiles">
        {d.venue && (
          <Tile label="Venue" icon={<><path d="M16 3a10 10 0 0 1 10 10c0 9-10 18-10 18S6 22 6 13A10 10 0 0 1 16 3z" /><circle cx="16" cy="13" r="3.5" /></>}>
            <p>{d.venue}</p>
            <a href={maps} target="_blank" rel="noreferrer" className="mh-link">
              Open in Google Maps
            </a>
          </Tile>
        )}
        {d.stay && (
          <Tile label="Stay" icon={<path d="M4 26V10m0 10h24v6M4 20v-4h24v4M8 16v-3h6v3" />}>
            <p>{d.stay}</p>
          </Tile>
        )}
        {d.rsvpBy && (
          <Tile label="Reply by" icon={<><circle cx="16" cy="16" r="12" /><path d="M16 10v6l4 3" /></>}>
            <p>{d.rsvpBy}</p>
            <a href="#rsvp" onClick={(e) => jump(e, 'rsvp', -64)} className="mh-link">
              Send your reply
            </a>
          </Tile>
        )}
        {d.notes.map((n, i) => (
          <Tile key={i} icon={<path d="M16 4l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />}>
            <p>{n}</p>
          </Tile>
        ))}
      </ul>
      {d.compliments && d.compliments.length > 0 && (
        <div className="mh-compl mh-in">
          <p className="mh-eye">With best compliments from</p>
          <ul>
            {d.compliments.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default function Mahal({ d, mode, slug }: SiteProps) {
  useLenis()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root, d)
  const maps = mapsUrl(d.venue)
  const main = mainOf(d)
  // The curtain and story only when there is something behind them, and the details only when there are some.
  const hasCouple = d.story.some((s) => s.title.trim() || s.body.trim()) || !!d.meet?.some((m) => m.bio.trim()) || !!d.note
  const hasThings = !!(d.venue || d.stay || d.rsvpBy || d.notes.length || d.compliments?.length)
  const links = [['invite', 'Invitation'], ...(d.events.length ? [['events', 'Events']] : []), ...(hasCouple ? [['story', 'Story']] : []), ...(hasThings ? [['things', d.venue ? 'Venue' : 'Details']] : []), ...(d.hide?.includes('rsvp') ? [] : [['rsvp', 'RSVP']])]

  return (
    <div ref={root} className="ov mh" style={themeVars(d)}>
      <SiteNav d={d} mode={mode} links={links} show className="mh-nav" namesClass="mh-nav-names" />
      <Music music={d.music} />

      <Hero d={d} />
      <Invite d={d} />
      <Events d={d} />
      {hasCouple && <Story d={d} />}
      <Gallery d={d} />
      {hasThings && <Things d={d} maps={maps} />}

      {!d.hide?.includes('rsvp') && (
        <div className="mh-rsvp">
          <img className="mh-rsvp-toran" src={art('backgrounds/background-4')} alt="" loading="lazy" />
          <img className="mh-diya mh-rsvp-diya-l" src={art('elements/element-1')} width={147} height={240} alt="" loading="lazy" />
          <img className="mh-diya mh-rsvp-diya-r" src={art('elements/element-1')} width={147} height={240} alt="" loading="lazy" />
          <RsvpForm d={d} slug={slug} />
        </div>
      )}
      {!d.hide?.includes('blessings') && <Blessings d={d} slug={slug} />}

      <footer className="mh-footer">
        <p className="mh-ft-names">
          {d.couple[0]} <span className="mh-amp">&amp;</span> {d.couple[1]}
        </p>
        <div className="mh-ft-rule" />
        <p className="mh-ft-date">{[main?.date.split(', ').pop(), d.venue].filter(Boolean).join(' · ')}</p>
        <div className="mt-12">
          <SiteFooter d={d} mode={mode} slug={slug} />
        </div>
      </footer>
    </div>
  )
}
