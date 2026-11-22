import { Fragment, type CSSProperties, type ReactNode } from 'react'

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

// Gold line-art mandap, viewBox 1200x820, drawn in stages: platform, pillars, beam, crown, drapes, then the side
// ornaments and diyas.
const g = (d: number, dur = 1.6) => ({ '--d': `${d}s`, '--dur': `${dur}s` }) as CSSProperties
const cusps = (n: number, w: number, h: number) => Array(n).fill(`q${w / 2} ${h} ${w} 0`).join(' ')
const each = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join('')
const P = ({ d }: { d: string }) => <path d={d} pathLength={1} />
// Left-hand parts drawn once and mirrored onto the right pillar.
const Both = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <g transform="matrix(-1 0 0 1 1200 0)">{children}</g>
  </>
)

// Rajasthani crown: onion dome and chhatris, scalloped valance with tassels, marigold strings.
const Chhatri = () => (
  <>
    <g style={g(1, 1.4)}>
      <P d={`M264 314${cusps(8, 84, 34)}`} />
      <P d={each(7, (i) => `M${348 + i * 84} 314v12m-4 0h8l-4 10z`)} />
    </g>
    <g style={g(1.5, 1.8)}>
      <P d={`M420 288V268H780V288M430 268${cusps(10, 34, -16)}`} />
      <P d="M462 268C440 206 500 168 600 120C700 168 760 206 738 268" />
      <P d="M434 268C404 196 480 150 600 92C720 150 796 196 766 268M600 92C556 150 532 210 540 268M600 92C644 150 668 210 660 268M600 92V78M586 78Q600 58 614 78ZM600 58V40" />
      <circle cx="600" cy="34" r="6" pathLength={1} />
    </g>
    <g style={g(2)}>
      <P d="M264 330Q432 398 600 330Q768 398 936 330" />
    </g>
    <Both>
      <g style={g(1.5, 1.8)}>
        <P d="M182 288V274H278V288M188 274C178 238 206 214 230 188C254 214 282 238 272 274M230 188V172" />
        <circle cx="230" cy="166" r="4" pathLength={1} />
      </g>
      <g style={g(2.5, 1.2)}>
        <P d="M158 314V500M176 314V440" />
        {[...Array(9)].map((_, i) => <circle key={`a${i}`} cx="158" cy={334 + i * 20} r="6" pathLength={1} />)}
        {[...Array(6)].map((_, i) => <circle key={`b${i}`} cx="176" cy={334 + i * 20} r="5" pathLength={1} />)}
      </g>
    </Both>
  </>
)

// [x, delay after the drawing finishes, fall time, rose?] outside the left pillar; mirrored on the right.
const FLOWERS: [number, number, number, boolean][] = [
  [30, 0, 7, false], [70, 2.6, 8, true], [110, 1.2, 6.5, false], [150, 4.1, 7.5, true],
  [50, 5.2, 8.5, false], [130, 3.3, 7, true], [90, 6.4, 6.5, false],
]
// Flowers have five petals around a centre.
const FLOWER_PETALS = [0, 72, 144, 216, 288]

function Mandap() {
  return (
    <svg className="mandap" viewBox="0 0 1200 820" aria-hidden>
      <g style={g(0, 1.4)}>
        <P d="M120 760H1080M90 760H1110V786H90ZM60 786H1140V812H60Z" />
        <P d={each(25, (i) => `M${114 + i * 40} 773l6-6 6 6-6 6z`)} />
      </g>
      <g style={g(1, 1.4)}>
        <P d="M140 314H1060M140 300H1060V314M140 300V314M128 300V288H1072V300" />
      </g>
      <Both>
        <g style={g(0.4)}>
          <P d="M196 760V732H264V760M204 732V718H256V732" />
          <P d="M212 718V344M248 718V344M212 650H248M212 570H248M212 490H248M212 410H248" />
          <P d="M230 600l9 10-9 10-9-10zM230 520l9 10-9 10-9-10zM230 440l9 10-9 10-9-10z" />
          <P d="M212 344Q212 332 202 328H258Q248 332 248 344M194 328V314H266V328" />
        </g>
        <g style={g(2)}>
          <P d="M266 330C318 392 296 470 262 520C296 566 300 640 276 704M282 336C322 400 304 470 270 516" />
          <circle cx="263" cy="520" r="6" pathLength={1} />
        </g>
        <g style={g(2.5, 1.2)}>
          <P d="M130 748Q150 768 170 748Z" />
          <path className="flame" d="M150 744Q142 730 150 712Q158 730 150 744Z" />
        </g>
      </Both>
      <Chhatri />
      {/* Guests outside the pillars, each tossing flowers. */}
      <g>
        <Both>
          <g style={g(2.5, 1.4)}>
            <P d="M82 604Q76 650 74 700Q72 740 68 758H124Q120 730 116 690Q114 640 110 604ZM110 606Q94 640 76 690M110 608L128 592L136 568" />
            <circle cx="96" cy="586" r="11" pathLength={1} />
            <circle cx="85" cy="580" r="5" pathLength={1} />
            <circle cx="137" cy="564" r="3" pathLength={1} />
            <P d="M25 608H51L55 700H21ZM27 700L25 758M49 700L51 758M51 612L66 596L72 578M27 590Q27 572 38 570Q50 570 50 588M48 576Q58 572 56 562" />
            <circle cx="38" cy="592" r="10" pathLength={1} />
          </g>
        </Both>
      </g>
      {/* Marigold and rose flowers drifting down outside the pillars once the mandap is drawn, clear of the text. */}
      <g className="petals">
        <Both>
          {FLOWERS.map(([x, delay, dur, rose], i) => (
            <g key={i} transform={`translate(${x} 0)`}>
              <g
                className={rose ? 'petal rose' : 'petal'}
                style={{ '--delay': `${delay}s`, '--fall': `${dur}s` } as CSSProperties}
              >
                {FLOWER_PETALS.map((r) => (
                  <ellipse key={r} cx="0" cy="-6" rx="4" ry="5.5" transform={`rotate(${r})`} />
                ))}
                <circle className="eye" r="3.2" />
              </g>
            </g>
          ))}
        </Both>
      </g>
    </svg>
  )
}

// The site header. The last link swaps between the two products: the invitation cards page links to wedding
// websites, and the wedding websites page links back to the cards.
export function SiteHeader({ swap = ['Wedding websites', '#/websites'] }: { swap?: [string, string] }) {
  return (
  <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 sm:px-6">
    <a href="#" aria-label="ShaadiTemplate home">
      <Wordmark />
    </a>
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
      {[['Designs', 'templates/'], ['Guides', 'guides/'], swap].map(([label, href]) => (
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

// The intro (mandap drawing, headline) runs on the prerendered copy. When React replaces it, `elapsed` (ms since
// navigation) shifts every delay back so the animation carries on from the same point instead of restarting.
export function Hero({ draftName, elapsed = 0 }: { draftName?: string | null; elapsed?: number }) {
  return (
    <div className="velvet text-rose" style={{ '--t0': `${-Math.round(elapsed)}ms` } as CSSProperties}>
      <SiteHeader />

      {/* A gold mandap draws itself, and the headline stands in its opening. */}
      <section className="hero mandap-hero">
        <Mandap />
        <div className="hero-copy">
          <h1 className="intro text-[13px] font-medium uppercase tracking-[0.22em] text-zari" style={{ animationDelay: 'calc(700ms + var(--t0, 0ms))' }}>
            Free Indian wedding invitation maker
          </h1>
          <p className="mt-4 font-display text-[40px] leading-[1.04] tracking-[-0.02em] [text-wrap:balance] sm:text-[56px] lg:text-[64px]">
            {'Invitations as grand as the wedding'.split(' ').map((w, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <span className="intro inline-block" style={{ animationDelay: `calc(${900 + i * 70}ms + var(--t0, 0ms))` }}>
                  {w}
                </span>
              </Fragment>
            ))}
          </p>
          <p className="intro intro-2 mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-rose/85">
            Type your families' names in English or your own script, then download images for WhatsApp or a PDF for the press.
          </p>
          <div className="intro intro-3 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <a href="#templates" className="zari-button shine relative inline-block overflow-hidden rounded-full px-8 py-4 text-[15px] font-medium text-wine-deep">
              Choose a design
            </a>
            {draftName && (
              <a href="#edit" className="text-[15px] text-rose underline decoration-zari/70 underline-offset-[6px] hover:decoration-zari">
                Continue {draftName}
              </a>
            )}
          </div>
          <p className="intro intro-4 mt-6 text-sm text-rose/60">
            Free, with no login. English, <span lang="hi">हिन्दी</span>, <span lang="mr">मराठी</span>, <span lang="gu">ગુજરાતી</span>,{' '}
            <span lang="pa">ਪੰਜਾਬੀ</span> and <span lang="ta">தமிழ்</span>.
          </p>
        </div>
      </section>
    </div>
  )
}
