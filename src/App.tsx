import { lazy, Suspense, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react'
import { CardPage, SIZES } from './card/Card'
import Editor from './Editor'
import { EVENTS, LANGS, SYMBOLS } from './i18n'
import { carryDetails, isEdited, liveId, loadDrafts, newInvite, saveDrafts, templateById, TEMPLATES, type Template } from './templates'
import { EVENT_IDS, LANG_IDS, SYMBOL_IDS, type EventType, type Invite, type Lang, type SymbolId } from './types'
import { Hero, HERO_CARD, HERO_LANGS, HeroDemo, preview } from './Hero'
import { ScaledCard, ZariBorder } from './ui'
import { track } from './analytics'
import { land, sitePath, siteView } from './siteRoutes'
import Reviews, { reviewsOnce } from './Reviews'
import { API } from './site/api'

// The wedding websites row is drawn by the website pages' own code, fetched once the page is up.
const Showcase = lazy(() => import('./site/Websites').then((m) => ({ default: m.Showcase })))

// Routes: #edit (the card editor) on the home page, the wedding website pages (siteRoutes.ts, loaded on demand to
// keep this bundle small), else the gallery.
const isEditor = () => location.hash === '#edit'
const isSite = () => sitePath(location.pathname)
// Static template pages link to #template/<id> to open that design. Consumed once, so StrictMode's re-run is a no-op.
let linked = location.hash.startsWith('#template/') ? TEMPLATES.find((t) => t.id === liveId(location.hash.slice(10))) : undefined

export default function App() {
  // Every card the family has made, the one being edited first.
  const [drafts, setDrafts] = useState<Invite[]>(loadDrafts)
  const invite = drafts[0] ?? null
  const setInvite = (u: SetStateAction<Invite | null>) =>
    setDrafts(([cur, ...rest]) => {
      const next = typeof u === 'function' ? u(cur ?? null) : u
      return next ? [next, ...rest] : rest
    })
  const [inEditor, setInEditor] = useState(isEditor)
  const [inSite, setInSite] = useState(isSite)

  useEffect(() => {
    saveDrafts(drafts)
  }, [drafts])
  useEffect(() => {
    const sync = () => {
      land()
      setInEditor(isEditor())
      setInSite(isSite())
    }
    // A link to the home page or a website page changes the page in place; a link within the page is the browser's.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a')
      if (!(a instanceof HTMLAnchorElement) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.origin !== location.origin) return
      if ((a.pathname !== '/' && !sitePath(a.pathname)) || (a.pathname === location.pathname && a.hash)) return
      e.preventDefault()
      history.pushState(null, '', a.href)
      dispatchEvent(new PopStateEvent('popstate')) // runs sync, and lets analytics count the page (analytics.ts)
    }
    addEventListener('hashchange', sync)
    addEventListener('popstate', sync)
    document.addEventListener('click', onClick)
    return () => {
      removeEventListener('hashchange', sync)
      removeEventListener('popstate', sync)
      document.removeEventListener('click', onClick)
    }
  }, [])
  useEffect(() => {
    // A link to #templates from the sample site lands on the designs; anything else starts at the top.
    const target = location.hash === '#templates' && document.getElementById('templates')
    if (target) target.scrollIntoView()
    else scrollTo(0, 0)
  }, [inEditor, inSite])
  // The static guide, FAQ and footer in index.html belong to the gallery only.
  const view = inSite ? 'site' : inEditor && invite ? 'editor' : 'home'
  useEffect(() => {
    document.documentElement.dataset.view = view
  }, [view])

  // Opens the family's own copy of a design if they've started one, else a fresh card, in `lang` when the gallery's
  // language filter is set. A fresh card can start with the names and venue from the card they made last.
  const open = (t: Template, lang?: Lang) => {
    const mine = drafts.find((d) => d.templateId === t.id)
    if (mine) setDrafts((d) => [mine, ...d.filter((x) => x !== mine)])
    else {
      const fresh = newInvite(t, lang)
      // The most recently opened card that has names to share (printed-page designs have none).
      const last = drafts.find((d) => isEdited(d) && carryDetails(d, fresh))
      const filled = last && carryDetails(last, fresh)
      const use = filled && confirm(`Start ${t.name} with the names, venue and phone from your ${templateById(last.templateId).name} card?`)
      setDrafts((d) => [use ? filled : fresh, ...d])
    }
    track('template_open', { template: t.id, lang: mine?.lang ?? lang ?? t.lang, event: t.event })
    location.hash = 'edit'
  }
  useEffect(() => {
    if (!linked) return
    const t = linked
    linked = undefined
    history.replaceState(null, '', location.pathname + location.search) // cancelling the draft prompt leaves a clean gallery URL
    open(t)
  }, [])

  if (inSite) {
    const Site = siteView(inSite)
    return (
      <Suspense fallback={<div className="min-h-svh bg-[#0e0a0c]" />}>
        <Site key={inSite} />
      </Suspense>
    )
  }
  if (inEditor && invite) return <Editor invite={invite} setInvite={setInvite} onBack={() => (location.hash = '')} />
  return <Gallery onOpen={open} draft={invite} drafts={drafts} />
}

// The hero and grid show each card's pre-rendered cover (public/templates/previews/<id>.webp), which is far lighter
// than rendering every card live. A template without a preview yet is rendered live instead.

function Preview({ t }: { t: Template }) {
  const [live, setLive] = useState(false)
  const inv = useMemo(() => (live ? newInvite(t) : null), [live, t])
  if (inv)
    return (
      <ScaledCard w={SIZES.story.w} h={SIZES.story.h} className="design-card">
        <CardPage invite={inv} page={inv.pages[0]} />
      </ScaledCard>
    )
  return <img src={preview(t.id)} width={540} height={960} loading="lazy" alt={`${t.name}, ${EVENTS[t.event]} invitation card`} onError={() => setLive(true)} className="design-card h-auto w-full" />
}

// Plain facts about the maker. Downloads and live websites are the owner's real totals on 2026-11-22 (Google
// Analytics download events, the sites table), rounded down; raise them as they grow. Once the worker's live count
// (/api/stats) passes the floor it shows instead. The rating is the visitors' own (Reviews.tsx). Never invented numbers.
const DOWNLOADS = '9,000+'
const SITES_FLOOR = 100
const MIN_REVIEWS = 5
function Numbers() {
  const [sites, setSites] = useState(0)
  const [rating, setRating] = useState<[avg: number, n: number] | null>(null)
  useEffect(() => {
    reviewsOnce().then((r) => r.length >= MIN_REVIEWS && setRating([r.reduce((s, x) => s + x.stars, 0) / r.length, r.length]), () => {})
    if (API)
      fetch(`${API}/api/stats`)
        .then((r) => r.json())
        .then((d) => setSites(d.sites ?? 0), () => {})
  }, [])
  const items: [string, string][] = [
    [DOWNLOADS, 'cards downloaded'],
    [sites > SITES_FLOOR ? sites.toLocaleString('en-IN') : `${SITES_FLOOR}+`, 'wedding websites live'],
    ...(rating ? [[`${rating[0].toFixed(1)}★`, `from ${rating[1]} families' reviews`] as [string, string]] : []),
    [String(TEMPLATES.length), 'card designs'],
    [String(LANG_IDS.length), 'languages, typed in English'],
    ['₹0', 'no login, no watermark'],
  ]
  return (
    <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-12 sm:flex sm:flex-wrap sm:justify-between sm:gap-x-10 sm:px-6">
      {items.map(([n, label]) => (
        <div key={label} className="flex flex-col-reverse">
          <dt className="mt-1 max-w-[16ch] text-sm leading-snug text-ink/65">{label}</dt>
          <dd className="font-display text-[40px] leading-none text-wine sm:text-[48px]">{n}</dd>
        </div>
      ))}
    </dl>
  )
}

// The hero's card, drawn live so its words can change script. It moves to the next language every few seconds
// until the visitor picks one (or never, under reduced motion).
function LiveCard({ onOpen }: { onOpen: (t: Template, lang?: Lang) => void }) {
  const t = templateById(HERO_CARD)
  const [lang, setLang] = useState<string>('gu')
  const [picked, setPicked] = useState(false)
  const inv = useMemo(() => newInvite(t, lang as Lang), [t, lang])
  useEffect(() => {
    if (picked || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setLang((l) => HERO_LANGS[(HERO_LANGS.findIndex(([x]) => x === l) + 1) % HERO_LANGS.length][0]), 3500)
    return () => clearInterval(id)
  }, [picked])
  const pick = (l: string) => {
    setPicked(true)
    setLang(l)
    track('hero_language', { lang: l })
  }
  return (
    <HeroDemo
      lang={lang}
      onLang={pick}
      card={
        <a href={`templates/${t.id}.html`} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); onOpen(t, lang as Lang) }} aria-label={`Make ${t.name} in this language`} className="block">
          <div key={lang} className="hero-card-swap">
            <ScaledCard w={SIZES.story.w} h={SIZES.story.h} className="">
              <CardPage invite={inv} page={inv.pages[0]} />
            </ScaledCard>
          </div>
        </a>
      }
    />
  )
}
const STEPS: [string, string][] = [
  ['Pick a design', 'A card or a website, by ceremony, language, or the god or sacred symbol your family uses.'],
  ['Add your details', 'Type names in English and see them in Gujarati, Hindi, Marathi, Punjabi or Tamil. No Indian keyboard needed.'],
  ['Send it', 'Download the card for WhatsApp or as a print PDF, or publish your website and share one link.'],
]

const GREETINGS = ['Shubh Vivah', 'शुभ विवाह', 'શુભ લગ્ન', 'ਸ਼ੁਭ ਵਿਆਹ', 'சுப முகூர்த்தம்', 'शुभमंगल सावधान', 'Save the Date']

function Gallery({ onOpen, draft, drafts }: { onOpen: (t: Template, lang?: Lang) => void; draft: Invite | null; drafts: Invite[] }) {
  const [lang, setLang] = useState<Lang | 'all'>('all')
  const [symbol, setSymbol] = useState<SymbolId | 'all'>('all')
  const [event, setEvent] = useState<EventType | 'all'>('all')
  // How far the prerendered hero's intro has run, so React's copy picks it up mid-way instead of replaying it.
  const [elapsed] = useState(() => performance.now())
  // Every design can be made in every language, so the language filter picks the card's language instead of hiding designs.
  const bySymbol = TEMPLATES.filter((t) => symbol === 'all' || t.symbol === symbol || !!t.also?.includes(symbol))
  const shown = bySymbol.filter((t) => event === 'all' || t.event === event).sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const count = (e: EventType | 'all') => bySymbol.filter((t) => e === 'all' || t.event === e).length
  const filtered = lang !== 'all' || symbol !== 'all' || event !== 'all'
  // The home page opens on the first eight (featured first); every card stays in the page for crawlers.
  const [all, setAll] = useState(false)
  const short = !all && !filtered && shown.length > 8
  const clear = () => {
    setLang('all')
    setSymbol('all')
    setEvent('all')
  }
  // The language a card opens in: the family's own copy's, else the filter's, else the design's sample.
  const cardLang = (t: Template) => drafts.find((d) => d.templateId === t.id)?.lang ?? (lang === 'all' ? t.lang : lang)
  const mine = drafts.filter(isEdited)
  const draftName = draft && TEMPLATES.find((t) => t.id === draft.templateId)?.name
  // When a filter changes, bring the top of the grid back into view and fade the new set in.
  const top = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) return void (first.current = false)
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (top.current && top.current.getBoundingClientRect().top < 0) top.current.scrollIntoView({ behavior: still ? 'auto' : 'smooth' })
    if (!still) grid.current?.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' })
  }, [lang, symbol, event])
  const select = 'select-chevron min-w-0 truncate rounded-full border border-wine/25 bg-paper py-2.5 pl-4 pr-10 text-[15px] text-ink hover:border-wine/50 focus:border-wine'

  return (
    <div className="min-h-screen">
      <div className="scroll-progress" aria-hidden />
      <Hero draftName={draftName} elapsed={elapsed} demo={<LiveCard onOpen={onOpen} />} />
      <ZariBorder />
      <Numbers />

      {/* A slow ribbon of the greeting in every script the maker supports. */}
      <div className="overflow-hidden border-b border-wine/10 py-5" aria-hidden>
        <div className="ribbon flex w-max whitespace-nowrap font-display text-[26px] italic text-wine/70 sm:text-[32px]">
          {[0, 1].map((k) =>
            GREETINGS.map((g, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-10 pr-10">
                {g}
                <span className="text-[18px] not-italic text-zari">✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      <section id="templates" className="mx-auto max-w-6xl scroll-mt-2 px-4 pb-24 pt-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <h2 className="reveal font-display text-[40px] leading-none tracking-[-0.015em] sm:text-[56px]">Choose your design</h2>
          <div className="grid w-full grid-cols-2 items-center gap-3 sm:flex sm:w-auto sm:flex-wrap">
            <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang | 'all')} className={select}>
              <option value="all">Any language</option>
              {LANG_IDS.map((l) => (
                <option key={l} value={l}>
                  {l === 'en' ? 'English' : `${LANGS[l].name} (${LANGS[l].native})`}
                </option>
              ))}
            </select>
            <select aria-label="God or sacred symbol" value={symbol} onChange={(e) => setSymbol(e.target.value as SymbolId | 'all')} className={select}>
              <option value="all">Any symbol</option>
              {SYMBOL_IDS.map((s) => (
                <option key={s} value={s}>
                  {SYMBOLS[s]}
                </option>
              ))}
            </select>
            {filtered && (
              <button onClick={clear} className="col-span-2 justify-self-start px-2 py-2 text-[15px] text-wine underline decoration-zari underline-offset-[6px] hover:decoration-wine">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {mine.length > 0 && (
          <nav aria-label="Your cards" className="mt-8 flex flex-wrap items-center gap-2 text-[15px]">
            <span className="mr-1 text-ink/60">Your cards:</span>
            {mine.map((d) => {
              const t = templateById(d.templateId)
              return (
                <button key={t.id} onClick={() => onOpen(t)} className="rounded-full border border-wine/25 bg-paper px-4 py-1.5 text-wine hover:border-wine/60">
                  {t.name} <span className="text-ink/50">· {EVENTS[t.event]}</span>
                </button>
              )
            })}
          </nav>
        )}

        {/* The event is the first thing people know, so it leads and stays in reach while scrolling. */}
        <div ref={top} className="mt-8" />
        <div className="sticky top-0 z-20 -mx-4 bg-rose/90 px-4 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-1 border-b border-wine/15 pt-3" role="group" aria-label="Invitation type">
              {(['all', ...EVENT_IDS] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEvent(e)}
                  aria-pressed={event === e}
                  className={`event-tab relative px-3.5 pb-3.5 pt-1 text-[15px] transition-colors ${event === e ? 'text-wine' : 'text-ink/60 hover:text-ink'}`}
                >
                  {e === 'all' ? 'All' : EVENTS[e]}
                  <span className="ml-1.5 text-xs text-ink/40">{count(e)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="mt-14 rounded-sm border border-dashed border-wine/30 px-6 py-14 text-center">
            <p className="font-display text-2xl">No design matches these filters yet.</p>
            <p className="mt-2 text-ink/70">Try another symbol or invitation type.</p>
            <button onClick={clear} className="mt-6 rounded-full bg-wine px-6 py-3 text-[15px] text-rose hover:bg-wine-deep">
              Clear filters
            </button>
          </div>
        ) : (
          <div ref={grid} className="mt-12 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-10 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((t, i) => {
              return (
                // A link to the design's own page, so crawlers reach every design from the homepage; a plain click opens the editor.
                <a
                  key={t.id}
                  href={`templates/${t.id}.html`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return
                    e.preventDefault()
                    onOpen(t, lang === 'all' ? undefined : lang)
                  }}
                  className={`design group ${short && i >= 8 ? 'hidden' : 'flex'} min-w-0 flex-col text-left`}
                >
                  <div className="pointer-events-none relative w-full transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                    {t.featured && (
                      <span className="zari-button absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-xs font-medium text-wine-deep shadow">★ Featured</span>
                    )}
                    <Preview t={t} />
                  </div>
                  <h3 className="mt-5 font-display text-[19px] leading-snug">{t.name}</h3>
                  <p className="mt-1 text-sm text-ink/60">
                    {EVENTS[t.event]}, {LANGS[cardLang(t)].native}
                  </p>
                  <span className="mt-2.5 text-sm font-medium text-wine underline decoration-zari underline-offset-[6px] group-hover:decoration-wine">
                    Customize
                  </span>
                </a>
              )
            })}
          </div>
        )}
        {short && (
          <div className="mt-14 text-center">
            <button onClick={() => setAll(true)} className="rounded-full bg-wine px-8 py-3.5 text-[15px] text-rose hover:bg-wine-deep">
              Show all {shown.length} card designs
            </button>
          </div>
        )}
      </section>

      <ZariBorder />
      <section id="websites" className="velvet scroll-mt-2 text-rose">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-[40px] leading-none tracking-[-0.015em] sm:text-[56px]">Wedding websites</h2>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-rose/80">
            One link for every guest: your story, each function with its time and venue map, RSVPs and blessings. Free, and it comes down 30 days after your last function.
          </p>
          <Suspense fallback={<div className="mt-12 h-[640px]" />}>
            <Showcase />
          </Suspense>
        </div>
      </section>
      <ZariBorder />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-[34px] leading-tight sm:text-[44px]">Three steps to your guests' phones</h2>
        <ol className="mt-10 grid gap-10 sm:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="border-t border-zari/60 pt-5">
              <span className="font-display text-[48px] leading-none text-gold">{i + 1}</span>
              <h3 className="mt-3 font-display text-[24px]">{title}</h3>
              <p className="mt-2 max-w-[34ch] text-ink/75">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <Reviews />

      {/* The two doors again, for whoever scrolled all the way down. */}
      <section className="velvet text-rose">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-[36px] leading-tight sm:text-[48px]">Haan ji, hum tayaar hain</h2>
          <p className="mt-4 text-[17px] text-rose/80">Start with the card or the website. Both are free, and you can make the other one later.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#templates" className="zari-button inline-flex min-h-12 items-center rounded-full px-8 text-[15px] font-medium text-wine-deep">
              Make the card
            </a>
            <a href="/websites/" className="inline-flex min-h-12 items-center rounded-full border border-zari px-8 text-[15px] text-zari hover:bg-zari hover:text-wine-deep">
              Make the website
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
