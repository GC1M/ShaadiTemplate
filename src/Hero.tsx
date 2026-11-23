import { type CSSProperties, type ReactNode } from 'react'
import { SHOTS } from './site/photos'

// The gallery's header and hero. vite.config.ts also renders this into index.html at build time, so crawlers get
// the H1 and the page doesn't jump when React mounts. Keep it free of browser-only code.

export const Wordmark = () => (
  <span className="inline-flex items-center gap-2.5 font-display text-2xl italic tracking-tight">
    <img src={`${import.meta.env.BASE_URL}logo-on-dark.svg`} alt="" width="28" height="30" className="-mt-1" />
    ShaadiTemplate{' '}
    <span className="ml-1 font-deva text-base not-italic text-zari">
      <span lang="hi">शादी</span>
    </span>
  </span>
)

export const preview = (id: string) => `templates/previews/${id}.webp`

// The site header: both products, then the guides, on every page.
export function SiteHeader() {
  return (
  <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 sm:px-6">
    <a href="/" aria-label="ShaadiTemplate home">
      <Wordmark />
    </a>
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
      {[['Invitation cards', '/#templates'], ['Wedding websites', '/websites/'], ['Guides', '/guides/']].map(([label, href]) => (
        <a key={href} href={href} className="text-rose/80 underline-offset-[6px] hover:text-rose hover:underline">
          {label}
        </a>
      ))}
      <span className="flex items-center gap-4">
        <a href="https://www.instagram.com/shaaditemplate/" target="_blank" rel="me noopener" aria-label="ShaadiTemplate on Instagram" title="Instagram" className="text-zari hover:text-rose">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a href="https://in.pinterest.com/shaaditemplate/" target="_blank" rel="me noopener" aria-label="ShaadiTemplate on Pinterest" title="Pinterest" className="text-zari hover:text-rose">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-3.64 19.31c-.09-.78-.17-1.98.03-2.83l1.17-4.96s-.3-.6-.3-1.48c0-1.39.8-2.42 1.81-2.42.85 0 1.26.64 1.26 1.4 0 .86-.55 2.14-.83 3.32-.24 1 .5 1.81 1.48 1.81 1.78 0 3.15-1.88 3.15-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.13-4.52 4.34 0 .86.33 1.78.74 2.28a.3.3 0 0 1 .07.29l-.28 1.13c-.04.18-.15.22-.34.13-1.25-.58-2.03-2.41-2.03-3.88 0-3.16 2.29-6.06 6.62-6.06 3.47 0 6.17 2.48 6.17 5.79 0 3.45-2.18 6.23-5.2 6.23-1.02 0-1.97-.53-2.3-1.15l-.62 2.38c-.23.87-.84 1.96-1.25 2.62A10 10 0 1 0 12 2Z" />
          </svg>
        </a>
      </span>
    </nav>
  </header>
  )
}

// A tall gold line-art mandap, viewBox 600x900, that draws itself on load (platform, pillars, beam, dome, drapes,
// then the diyas and garlands) around the hero card, which stands on its platform like the couple at the vedi.
// Every stroke has pathLength=1, so one dash sliding from offset 1 to 0 reveals it (index.css).
const g = (d: number, dur = 1.6) => ({ '--d': `${d}s`, '--dur': `${dur}s` }) as CSSProperties
const cusps = (n: number, w: number, h: number) => Array(n).fill(`q${w / 2} ${h} ${w} 0`).join(' ')
const each = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join('')
const P = ({ d }: { d: string }) => <path d={d} pathLength={1} />
// Left-hand parts drawn once and mirrored onto the right.
const Both = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <g transform="matrix(-1 0 0 1 600 0)">{children}</g>
  </>
)
// [x, delay after the drawing finishes, fall time, rose?] beside the left pillar; mirrored on the right.
const FLOWERS: [number, number, number, boolean][] = [
  [18, 0, 7, false], [40, 2.6, 8, true], [22, 4.4, 6.5, false], [36, 1.3, 7.5, true],
]
const FLOWER_PETALS = [0, 72, 144, 216, 288]

function Mandap() {
  return (
    <svg className="mandap" viewBox="0 0 600 900" aria-hidden>
      <g style={g(0, 1.4)}>
        <P d="M20 840H580V866H20ZM0 866H600V892H0Z" />
        <P d={each(13, (i) => `M${54 + i * 41} 847l6-6 6 6-6 6z`)} />
      </g>
      <Both>
        <g style={g(0.4)}>
          <P d="M66 840V812H134V840M74 812V798H126V812" />
          <P d="M84 798V300M116 798V300M84 720H116M84 620H116M84 520H116M84 420H116" />
          <P d="M100 662l8 9-8 9-8-9zM100 562l8 9-8 9-8-9zM100 462l8 9-8 9-8-9z" />
          <P d="M84 300Q84 288 74 284H126Q116 288 116 300M66 284V270H134V284" />
        </g>
        <g style={g(1.5, 1.6)}>
          <P d="M70 244V232H130V244M76 232C68 204 86 186 100 166C114 186 132 204 124 232M100 166V152" />
          <circle cx="100" cy="146" r="4" pathLength={1} />
        </g>
        <g style={g(2)}>
          <P d="M136 278C178 338 162 404 140 446C162 482 166 560 146 640M150 284C184 342 170 404 148 442" />
          <circle cx="141" cy="446" r="5" pathLength={1} />
        </g>
        <g style={g(2.5, 1.2)}>
          <P d="M52 290V470" />
          {[...Array(9)].map((_, i) => <circle key={i} cx="52" cy={302 + i * 20} r="6" pathLength={1} />)}
          <P d="M14 834Q30 850 46 834Z" />
          <path className="flame" d="M30 830Q23 816 30 800Q37 816 30 830Z" />
        </g>
      </Both>
      <g style={g(1, 1.4)}>
        <P d="M56 270H544M56 256H544V270M56 256V270M44 256V244H556V256" />
        <P d={`M136 270${cusps(8, 41, 18)}`} />
        <P d={each(7, (i) => `M${177 + i * 41} 270v9m-3 0h6l-3 8z`)} />
      </g>
      <g style={g(1.5, 1.8)}>
        <P d="M196 244V226H404V244" />
        <P d="M212 226C194 168 238 128 300 82C362 128 406 168 388 226M300 82C274 128 262 178 266 226M300 82C326 128 338 178 334 226" />
        <P d="M300 82V68M290 68Q300 50 310 68ZM300 50V38" />
        <circle cx="300" cy="32" r="5" pathLength={1} />
      </g>
      <g className="petals">
        <Both>
          {FLOWERS.map(([x, delay, dur, rose], i) => (
            <g key={i} transform={`translate(${x} 0)`}>
              <g className={rose ? 'petal rose' : 'petal'} style={{ '--delay': `${delay}s`, '--fall': `${dur}s` } as CSSProperties}>
                {FLOWER_PETALS.map((r) => (
                  <ellipse key={r} cx="0" cy="-5" rx="3.4" ry="4.6" transform={`rotate(${r})`} />
                ))}
                <circle className="eye" r="2.7" />
              </g>
            </g>
          ))}
        </Both>
      </g>
    </svg>
  )
}

// The website's own building: an arched haveli gateway (viewBox 300x620, drawn at the mandap's scale so the two
// platforms meet on one ground line), with the phone standing in its doorway. The websites open on carved doors.
const Mirror = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <g transform="matrix(-1 0 0 1 300 0)">{children}</g>
  </>
)
// Mango-leaf toran hung in a curve under the cornice: [x, y] of each leaf.
const TORAN = Array.from({ length: 9 }, (_, i) => {
  const x = 46 + i * 26
  return [x, 112 + 26 * (1 - ((x - 150) / 120) ** 2)] as const
})

function Gateway() {
  return (
    <svg className="mandap" viewBox="0 0 300 620" aria-hidden>
      <g style={g(0.3, 1.4)}>
        <P d="M10 560H290V586H10ZM0 586H300V612H0Z" />
        <P d={each(7, (i) => `M${24 + i * 41} 567l6-6 6 6-6 6z`)} />
      </g>
      <Mirror>
        <g style={g(0.7)}>
          <P d="M30 560V536H76V560M38 536V250M68 536V250M38 470H68M38 390H68M38 310H68" />
          <P d="M53 422l7 8-7 8-7-8zM53 342l7 8-7 8-7-8z" />
          <P d="M38 250Q38 240 30 236H76Q68 240 68 250" />
        </g>
        <g style={g(1.6)}>
          <P d="M68 236C68 178 104 150 150 104" />
          <P d="M84 240A16 16 0 0 1 90 216A16 16 0 0 1 104 194A18 18 0 0 1 124 172A18 18 0 0 1 150 158" />
          <circle cx="56" cy="160" r="9" pathLength={1} />
        </g>
        <g style={g(2.5, 1.2)}>
          <P d="M14 102V138M8 138L14 130L20 138L14 158L8 138Z" />
        </g>
        {/* A carved door leaf swung open against the pillar, as the websites open. */}
        <g style={g(2, 1.4)}>
          <P d="M68 250L92 262V544L68 556ZM74 286L86 292V392L74 390ZM74 420L86 422V512L74 518Z" />
          <circle cx="88" cy="406" r="2.5" pathLength={1} />
        </g>
      </Mirror>
      <g style={g(1.2, 1.4)}>
        <P d="M24 236H276M14 102H286V90H14ZM26 102V236M274 102V236" />
      </g>
      <g style={g(1.8, 1.6)}>
        <P d="M108 90V78H192V90M116 78C108 52 128 38 150 20C172 38 192 52 184 78M150 20V10" />
        <circle cx="150" cy="6" r="4" pathLength={1} />
      </g>
      <g style={g(2.2, 1.4)}>
        <P d="M30 112Q150 164 270 112" />
        <P d={TORAN.map(([x, y]) => `M${x} ${y}q-5 8 0 16q5-8 0-16`).join('')} />
      </g>
    </svg>
  )
}

// The languages the hero card speaks, in the order it cycles through them; the card's own sample (Gujarati) first.
// No Punjabi: its sample wording is for an Anand Karaj, which is wrong under this card's Shiv-Parvati art.
export const HERO_LANGS = [
  ['gu', 'ગુજરાતી'],
  ['hi', 'हिन्दी'],
  ['mr', 'मराठी'],
  ['ta', 'தமிழ்'],
  ['en', 'English'],
] as const
export const HERO_CARD = 'sandhya-kankotri'

// The hero opens on the product itself: a real painted card whose words change script while its art stays put,
// which is the thing no printer's catalogue does. Both products are named in the headline copy and the buttons;
// the phone beside the card is the website. `demo` is the live card (App.tsx); the prerendered copy shows its
// cover image in the same box, so nothing moves when React takes over.
export function Hero({ draftName, elapsed = 0, demo }: { draftName?: string | null; elapsed?: number; demo?: ReactNode }) {
  return (
    <div className="velvet text-rose" style={{ '--t0': `${-Math.round(elapsed)}ms` } as CSSProperties}>
      <SiteHeader />
      <section className="hero hero-grid mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 md:pb-20 md:pt-10">
        <div className="hero-copy">
          <h1 className="intro font-display text-[42px] leading-[1.04] tracking-[-0.02em] [text-wrap:balance] sm:text-[54px] lg:text-[58px]" style={{ animationDelay: 'calc(200ms + var(--t0, 0ms))' }}>
            Indian wedding invitations in your family's language
          </h1>
          <p className="intro mt-6 max-w-[46ch] text-[18px] leading-relaxed text-rose/80" style={{ animationDelay: 'calc(350ms + var(--t0, 0ms))' }}>
            Make the card for WhatsApp and the printing press, and a wedding website with every function, the venue map and RSVPs. Free, with no login.
          </p>
          <div className="intro mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: 'calc(500ms + var(--t0, 0ms))' }}>
            <a href="#templates" className="zari-button shine relative inline-flex min-h-13 items-center overflow-hidden rounded-full px-8 text-[16px] font-medium text-wine-deep">
              Make your invitation card
            </a>
            <a href="/websites/" className="inline-flex min-h-13 items-center rounded-full border border-zari/70 px-7 text-[16px] text-rose hover:border-zari hover:bg-zari/10">
              Make a wedding website
            </a>
          </div>
          {draftName && (
            <p className="intro mt-6 text-[15px] text-rose/70" style={{ animationDelay: 'calc(600ms + var(--t0, 0ms))' }}>
              Your card is saved on this phone.{' '}
              <a href="#edit" className="text-rose underline decoration-zari/70 underline-offset-[6px] hover:decoration-zari">
                Continue {draftName}
              </a>
            </p>
          )}
        </div>
        {demo ?? <HeroDemo lang="gu" />}
      </section>
    </div>
  )
}

// The mandap with the card standing in it and the language tabs under it, then the gateway with the website phone in
// its doorway. `card` is the live card; without it (the prerendered page) the card's cover image stands in.
export function HeroDemo({ lang, onLang, card }: { lang: string; onLang?: (l: string) => void; card?: ReactNode }) {
  return (
    <div className="hero-scene">
      <div className="scene-mandap">
        <div className="relative">
          <Mandap />
          <div className="hero-card intro">
            {card ?? <img src={preview(HERO_CARD)} width={540} height={960} alt="Sandhya kankotri, a painted Gujarati wedding card" className="h-full w-full" />}
          </div>
        </div>
        <div className="intro mt-5 text-center" style={{ animationDelay: 'calc(650ms + var(--t0, 0ms))' }}>
          <p className="text-sm text-rose/65">See this card in</p>
          <div role="group" aria-label="Card language" className="mt-2 flex flex-wrap justify-center gap-1">
            {HERO_LANGS.map(([id, name]) => (
              <button
                key={id}
                type="button"
                lang={id}
                aria-pressed={lang === id}
                onClick={() => onLang?.(id)}
                className={`rounded-full px-3 py-1.5 text-[15px] transition-colors ${lang === id ? 'bg-zari text-wine-deep' : 'text-rose/75 ring-1 ring-zari/30 hover:text-rose hover:ring-zari/70'}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <a href="/websites/" className="scene-gate group">
        <div className="relative">
          <Gateway />
          <span className="hero-phone intro">
            <img src={SHOTS.mubarakMahal.small} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: SHOTS.mubarakMahal.pos }} />
            <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent px-1 pb-[16%] pt-[50%] text-center font-display text-[12px] leading-tight text-white">
              Aditi &amp; Vihaan
            </span>
          </span>
        </div>
        <span className="intro mt-5 block text-center text-sm text-rose/65" style={{ animationDelay: 'calc(800ms + var(--t0, 0ms))' }}>
          <span className="block font-display text-[19px] text-rose underline decoration-transparent underline-offset-4 group-hover:decoration-zari">Wedding website</span>
          RSVPs, venue map, one link
        </span>
      </a>
    </div>
  )
}
