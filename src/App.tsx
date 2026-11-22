import { lazy, Suspense, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react'
import { CardPage, SIZES } from './card/Card'
import Editor from './Editor'
import { EVENTS, LANGS, SYMBOLS } from './i18n'
import { carryDetails, isEdited, liveId, loadDrafts, newInvite, saveDrafts, templateById, TEMPLATES, type Template } from './templates'
import { EVENT_IDS, LANG_IDS, SYMBOL_IDS, type EventType, type Invite, type Lang, type SymbolId } from './types'
import { Hero, preview } from './Hero'
import { ScaledCard, ZariBorder } from './ui'
import { track } from './analytics'
import { keepKey } from './site/api'
import Reviews from './Reviews'

// Hash routes: #edit (editor), the wedding website designs (#/websites), each design's sample site
// (site/designs.ts), the website editor (#/websites/<id>/edit, #/w/<slug>/edit) and couples' published sites
// (#/w/<slug>), else the gallery. Sites load on demand to keep the main bundle small.
const isEditor = () => location.hash === '#edit'
const Websites = lazy(() => import('./site/Websites'))
const WeddingSite = lazy(() => import('./site/WeddingSite'))
const HostedSite = lazy(() => import('./site/HostedSite'))
const SiteEditor = lazy(() => import('./site/SiteEditor'))
// A couple's published site, /w/<slug> (public/404.html sends it here as #/w/<slug>; the dev server serves it as is).
if (/^\/w\/[a-z0-9-]+(\/edit)?\/?$/.test(location.pathname))
  history.replaceState(null, '', `/#${location.pathname.replace(/\/$/, '')}${location.hash ? `?k=${location.hash.slice(1)}` : ''}`)
// The edit key leaves the address here, before analytics starts and reports it (see keepKey).
function takeKey() {
  const keyed = location.hash.match(/^#\/w\/([a-z0-9-]+)\/edit\?k=([a-f0-9]+)$/)
  if (!keyed) return
  keepKey(keyed[1], keyed[2])
  history.replaceState(null, '', `#/w/${keyed[1]}/edit`)
}
takeKey()
const isSite = () =>
  location.hash === '#/websites' || location.hash.startsWith('#/ananya-arjun') ? '#/websites' : location.hash.startsWith('#/websites/') || location.hash.startsWith('#/w/') ? location.hash : ''
const siteView = (hash: string) =>
  hash === '#/websites' ? Websites : hash.endsWith('/edit') || hash.includes('/edit?') ? SiteEditor : hash.startsWith('#/w/') || hash === '#/websites/preview' ? HostedSite : WeddingSite
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
    const onHash = () => {
      takeKey()
      setInEditor(isEditor())
      setInSite(isSite())
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
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
      <Hero draftName={draftName} elapsed={elapsed} />
      <ZariBorder />

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
            {shown.map((t) => {
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
                  className="design group flex min-w-0 flex-col text-left"
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
      </section>

      <Reviews />

      <ZariBorder />
    </div>
  )
}
