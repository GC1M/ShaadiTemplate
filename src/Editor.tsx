import { ArrowDown, ArrowLeft, ArrowUp, Check, Eye, FileDown, ImagePlus, ImageDown, Loader2, Plus, RotateCcw, Share2, Trash2 } from 'lucide-react'
import { flushSync } from 'react-dom'
import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Wordmark } from './Hero'
import { CardPage, PHOTO_FIT, SIZES, photoStyle } from './card/Card'
import { DESIGNS } from './card/designs'
import { DATE_FORMATS, formatDate, type DateFormat } from './dates'
import { LANGS, SAMPLES } from './i18n'
import { keepEdits, samplePages, sectionsPage, stripIds, templateById } from './templates'
import { TransliterateInput } from './transliterate'
import { LANG_IDS, type CoverPage, type FontScale, type Format, type Invite, type Lang, type Page, type Photo, type SectionsPage } from './types'
import { ScaledCard, Segmented } from './ui'
import { track } from './analytics'

type Props = { invite: Invite; setInvite: Dispatch<SetStateAction<Invite | null>>; onBack: () => void }

const inputCls = 'mt-1.5 w-full rounded-md border border-wine/20 bg-paper px-3.5 py-2.5 text-base outline-none transition-colors hover:border-wine/40 focus:border-wine focus:ring-2 focus:ring-zari/40'

export default function Editor({ invite, setInvite, onBack }: Props) {
  const t = templateById(invite.templateId)
  const [current, setCurrent] = useState(invite.pages[0]?.id)
  const [zoom, setZoom] = useState<'fit' | '100'>('fit')
  const [phonetic, setPhonetic] = useState(true)
  const [busy, setBusy] = useState<'' | 'png' | 'pdf' | 'share'>('')
  const [toast, setToast] = useState('')
  const exportRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLElement>(null)
  const asideRef = useRef<HTMLElement>(null)
  // Phones stack the preview under the form; a floating button jumps to it while it's out of view.
  const [previewSeen, setPreviewSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPreviewSeen(e.isIntersecting))
    io.observe(asideRef.current!)
    return () => io.disconnect()
  }, [])
  const stacked = () => !matchMedia('(min-width: 1024px)').matches

  const page = invite.pages.find((p) => p.id === current) ?? invite.pages[0]
  const index = invite.pages.indexOf(page)
  const { w, h } = SIZES[invite.format]
  const L = invite.lang
  // Painted designs with a photo window on this page: index of the design page the photo belongs to.
  const artPages = DESIGNS[t.design].pages
  const artIndex = artPages ? index % artPages.length : -1
  const photoSlot = artPages?.[artIndex]?.photo
  const fit = { ...PHOTO_FIT, ...invite.photos?.[artIndex] }
  const ownPhoto = fit.src
  const setFit = (f: Photo) => set({ photos: { ...invite.photos, [artIndex]: f } })
  const pickPhoto = async (file?: File) => {
    if (!file) return
    try {
      const url = await shrinkPhoto(file)
      setFit({ ...PHOTO_FIT, y: 30, src: url })
      track('photo_upload', { template: invite.templateId })
    } catch {
      setToast('Could not read that photo. Please try a JPEG or PNG.')
    }
  }
  const resetPhoto = () => {
    const { [artIndex]: _gone, ...rest } = invite.photos ?? {}
    set({ photos: rest })
  }

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(id)
  }, [toast])

  // Keep the page being edited in view in the preview.
  useEffect(() => {
    const box = previewRef.current
    const el = box?.querySelector<HTMLElement>(`[data-page="${page.id}"]`)
    if (box && el) box.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }, [page.id, zoom, invite.format])

  const set = (patch: Partial<Invite>) => setInvite((i) => i && { ...i, ...patch })
  const editPage = (fn: (p: Page) => Page) => setInvite((i) => i && { ...i, pages: i.pages.map((p) => (p.id === page.id ? fn(p) : p)) })
  const editCover = (patch: Partial<CoverPage>) => editPage((p) => ({ ...(p as CoverPage), ...patch }))
  const editSections = (fn: (p: SectionsPage) => SectionsPage) => editPage((p) => fn(p as SectionsPage))

  // Swap the sample wording into the new language and keep everything the family typed (names, venue, phone).
  const changeLang = (lang: Lang) => {
    const pages = keepEdits(invite.pages, samplePages(t, invite.lang), samplePages(t, lang))
    const kept = stripIds(pages) !== stripIds(samplePages(t, lang))
    set({ lang, pages })
    if (kept) setToast(`Switched the wording to ${LANGS[lang].name}. Your names and details are kept as you typed them.`)
  }
  const reset = () => {
    if (!confirm('Replace every page with the sample text?')) return
    const pages = samplePages(t, invite.lang)
    set({ pages })
    setCurrent(pages[0].id)
  }

  const move = (dir: -1 | 1) =>
    setInvite((i) => {
      if (!i) return i
      const pages = [...i.pages]
      const j = index + dir
      ;[pages[index], pages[j]] = [pages[j], pages[index]]
      return { ...i, pages }
    })
  const remove = () => {
    if (invite.pages.length < 2 || !confirm('Delete this page?')) return
    const pages = invite.pages.filter((p) => p.id !== page.id)
    set({ pages })
    setCurrent(pages[Math.max(0, index - 1)].id)
  }
  const s = SAMPLES[L]
  const PAGE_KINDS: { label: string; make: () => SectionsPage }[] = [
    { label: 'Event details', make: () => sectionsPage(s.functions.title, s.functions.sections.slice(0, 2)) },
    { label: 'Invitation letter', make: () => sectionsPage(s.letter.title, [['', s.letter.body]]) },
    { label: 'Family names', make: () => sectionsPage(s.family.title, s.family.sections) },
    { label: 'Message / RSVP', make: () => sectionsPage(s.message.title, [['', s.message.body]]) },
  ]
  const addPage = (make: () => SectionsPage) => {
    const p = make()
    set({ pages: [...invite.pages, p] })
    setCurrent(p.id)
  }

  const cover = invite.pages.find((p) => p.kind === 'cover') as CoverPage | undefined
  const slug =
    [cover?.bride.name, cover?.groom.name]
      .map((n) => (n ?? '').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '')) // keeps Indic names
      .filter(Boolean)
      .join('-') || t.id

  // Renders pages off-screen at full size, then captures them.
  const [exportPages, setExportPages] = useState<Page[] | null>(null)
  const run = async (kind: 'png' | 'pdf' | 'share') => {
    setBusy(kind)
    // Mount the off-screen pages (and run their auto-fit layout effects) before capturing.
    flushSync(() => setExportPages(kind === 'png' ? [page] : invite.pages))
    try {
      const m = await import('./pdf')
      const el = exportRef.current!
      if (kind === 'pdf') {
        save(await m.buildPdf(el, invite.format, `${slug}-invitation`))
        setToast('PDF downloaded')
      } else {
        const files = await m.buildPngs(el, invite.format, kind === 'png' ? `${slug}-page-${index + 1}` : `${slug}-invitation`)
        if (kind === 'share' && navigator.canShare?.({ files })) {
          await navigator.share({ files, title: 'Wedding invitation' }).catch((e) => {
            if (e.name !== 'AbortError') throw e
          })
        } else {
          files.forEach(save)
          setToast(files.length > 1 ? `${files.length} images downloaded` : 'Image downloaded')
        }
      }
      track('export', { kind, format: invite.format, pages: invite.pages.length, template: invite.templateId })
    } catch (e) {
      console.error(e)
      track('export_failed', { kind, format: invite.format, template: invite.templateId, error: String(e).slice(0, 150) })
      setToast('Could not create the file. Please try again.')
    } finally {
      setBusy('')
      setExportPages(null)
    }
  }

  const btn = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-60 pointer-coarse:min-h-11'
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    // Families' names, dates and venues never reach Clarity recordings; clicks and layout still do.
    <div className="min-h-screen" data-clarity-mask="true">
      <header className="velvet sticky top-0 z-20 text-rose shadow-[0_8px_24px_-12px_rgba(10,0,4,0.6)]">
        <div className="flex items-center gap-x-4 px-4 py-3 sm:px-6">
          <button onClick={onBack} className="inline-flex shrink-0 items-center gap-1.5 py-2 text-[15px] pointer-coarse:min-h-11 text-rose/80 hover:text-rose">
            <ArrowLeft className="size-4" aria-hidden /> <span className="hidden sm:inline">All designs</span>
            <span className="sm:hidden">Back</span>
          </button>
          <span className="hidden lg:inline">
            <Wordmark />
          </span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => run('png')} disabled={!!busy} className={`${btn} zari-button text-wine-deep`}>
              {busy === 'png' ? <Loader2 className="size-4 animate-spin" /> : <ImageDown className="size-4" />}
              <span>
                Download <span className="hidden sm:inline">image</span>
              </span>
            </button>
            <button onClick={() => run('pdf')} disabled={!!busy} className={`${btn} border border-zari/70 text-rose hover:bg-white/10`}>
              {busy === 'pdf' ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />} PDF
              <span className="hidden sm:inline">({invite.pages.length} {invite.pages.length === 1 ? 'page' : 'pages'})</span>
            </button>
            {canShare && (
              <button onClick={() => run('share')} disabled={!!busy} aria-label="Share" className={`${btn} border border-zari/70 text-rose hover:bg-white/10`}>
                {busy === 'share' ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* An ivory workbench on the left, and the card on a velvet display on the right. */}
      <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,min(46vw,640px))]">
        <div className="min-w-0 px-4 pb-16 pt-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl space-y-12">
            <section className="space-y-6">
              <h1 className="font-display text-[34px] leading-tight tracking-[-0.015em] sm:text-[42px]">{t.name}</h1>
              <Step n={1} title="Card settings" />
              <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
                <label className="block">
                  <span className="text-[13px] text-ink/65">Card language</span>
                  <select value={L} onChange={(e) => changeLang(e.target.value as Lang)} className={`${inputCls} select-chevron w-auto pr-10`}>
                    {LANG_IDS.map((l) => (
                      <option key={l} value={l}>
                        {l === 'en' ? 'English' : `${LANGS[l].name} (${LANGS[l].native})`}
                      </option>
                    ))}
                  </select>
                </label>
                <Control label="Card shape">
                  <Segmented<Format>
                    label="Card shape"
                    value={invite.format}
                    onChange={(format) => set({ format })}
                    options={[
                      { id: 'story', label: 'Phone 9:16' },
                      { id: 'print', label: 'Print 5:7' },
                    ]}
                  />
                </Control>
                <Control label="Text size">
                  <Segmented<FontScale>
                    label="Text size"
                    value={invite.scale}
                    onChange={(scale) => set({ scale })}
                    options={[
                      { id: 's', label: 'S' },
                      { id: 'm', label: 'M' },
                      { id: 'l', label: 'L' },
                    ]}
                  />
                </Control>
              </div>
              {L !== 'en' && (
                <label className="flex items-start gap-3 rounded-md bg-wine/[0.04] p-4 text-[15px] text-ink/85 ring-1 ring-wine/10">
                  <input type="checkbox" checked={phonetic} onChange={(e) => setPhonetic(e.target.checked)} className="mt-1 size-4 shrink-0 accent-wine pointer-coarse:size-6 pointer-coarse:mt-0" />
                  <span>
                    Type in English letters and get {LANGS[L].native}. Press space to accept a word, Esc to keep English.
                    <span className="mt-1 block text-[13px] text-ink/55">Each word you type is sent to Google's transliteration service.</span>
                  </span>
                </label>
              )}
            </section>

            <section className="space-y-5">
              <Step n={2} title="Pages" />
              <ol className="flex flex-wrap gap-2">
                {invite.pages.map((p, i) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setCurrent(p.id)}
                      aria-current={p.id === page.id}
                      className={`flex max-w-[13rem] items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm pointer-coarse:min-h-11 transition-colors ${p.id === page.id ? 'bg-wine text-rose' : 'bg-paper text-ink/80 ring-1 ring-wine/15 hover:ring-wine/40'}`}
                    >
                      <span className={`grid size-6 shrink-0 place-items-center rounded-full font-display text-[13px] italic ${p.id === page.id ? 'bg-zari text-wine-deep' : 'bg-wine/[0.07]'}`}>{i + 1}</span>
                      <span className="truncate">{p.title || 'Untitled'}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 text-ink/60">This page:</span>
                <button onClick={() => move(-1)} disabled={index === 0} className={iconBtn} aria-label="Move page earlier">
                  <ArrowUp className="size-4" />
                </button>
                <button onClick={() => move(1)} disabled={index === invite.pages.length - 1} className={iconBtn} aria-label="Move page later">
                  <ArrowDown className="size-4" />
                </button>
                <button onClick={remove} disabled={invite.pages.length < 2} className={iconBtn} aria-label="Delete page">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 text-ink/60">Add a page:</span>
                {PAGE_KINDS.map((k) => (
                  <button key={k.label} onClick={() => addPage(k.make)} className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-wine pointer-coarse:min-h-11 ring-1 ring-wine/25 hover:bg-wine/5 hover:ring-wine/50">
                    <Plus className="size-3.5" aria-hidden /> {k.label}
                  </button>
                ))}
              </div>
            </section>

            <section ref={formRef} className="scroll-mt-24 space-y-5">
              <Step n={3} title={`Words on page ${index + 1}`} />
              <details className="text-[14px] text-ink/65">
                <summary className="cursor-pointer select-none text-wine hover:underline pointer-coarse:py-3">Formatting tips</summary>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                  {[
                    ['*word*', 'Accent colour'],
                    ['**line**', 'Large line'],
                    ['***word***', 'Bold'],
                    ['~Name~', 'Script letters for names (some designs)'],
                    ['<<  >>', 'Lean a line left or right (at its start)'],
                    ['___', 'A line to write on'],
                    ['[[maps]]  [[hands]]', 'Artwork icon (some designs)'],
                    ['[[icon|words]]', 'Words written on a painted ribbon'],
                  ].map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt><code className="rounded bg-wine/5 px-1.5 py-0.5 font-mono text-[13px] text-ink/80">{k}</code></dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              {photoSlot && (
                <div className="flex flex-wrap items-start gap-4 rounded-md bg-wine/[0.04] p-4 ring-1 ring-wine/10">
                  <PhotoCrop slot={photoSlot} art={artPages![artIndex].src} fit={fit} onChange={setFit} />
                  <div className="min-w-48 flex-1 space-y-2 text-[15px]">
                    <p className="text-ink/85">{ownPhoto ? 'Your photo is on this page.' : 'This page has a photo. Add your own in place of the sample.'}</p>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-sm pointer-coarse:min-h-11 text-rose hover:bg-wine-deep focus-within:ring-2 focus-within:ring-zari/60">
                        <ImagePlus className="size-4" aria-hidden /> {ownPhoto ? 'Change photo' : 'Upload photo'}
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => (pickPhoto(e.target.files?.[0]), (e.target.value = ''))} />
                      </label>
                      {invite.photos?.[artIndex] && (
                        <button onClick={resetPhoto} className="rounded-full px-4 py-2 text-sm pointer-coarse:min-h-11 text-wine ring-1 ring-wine/25 hover:bg-wine/5">
                          {ownPhoto ? 'Use sample photo' : 'Reset'}
                        </button>
                      )}
                    </div>
                    <p className="text-[13px] text-ink/55">Drag the photo to choose what shows in the frame, and use the slider to zoom. Your photo stays in this browser. It is not uploaded anywhere.</p>
                  </div>
                </div>
              )}
              {page.kind === 'cover' ? (
                <CoverForm p={page} on={editCover} lang={L} phonetic={phonetic} />
              ) : (
                <SectionsForm p={page} on={editSections} lang={L} phonetic={phonetic} />
              )}
              <button onClick={reset} className="inline-flex items-center gap-1.5 pt-2 text-sm pointer-coarse:min-h-11 text-ink/60 hover:text-wine">
                <RotateCcw className="size-4" aria-hidden /> Reset every page to the sample text
              </button>
            </section>
          </div>
        </div>

        <aside ref={asideRef} className="velvet min-w-0 scroll-mt-16 text-rose">
          <div className="flex flex-col lg:sticky lg:top-[66px] lg:h-[calc(100svh-66px)]">
            <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-8">
              <p className="text-sm text-rose/70">
                Page {index + 1} of {invite.pages.length}
              </p>
              <Segmented<'fit' | '100'>
                label="Zoom"
                dark
                value={zoom}
                onChange={setZoom}
                options={[
                  { id: 'fit', label: 'Fit' },
                  { id: '100', label: '100%' },
                ]}
              />
            </div>
            {/* Every page in one scrollable column, like a PDF viewer. Click a page to edit it. */}
            <div ref={previewRef} className="relative max-h-[85svh] min-h-0 flex-1 space-y-8 overflow-auto px-5 pb-10 pt-4 sm:px-8 lg:max-h-none">
              {invite.pages.map((p, i) => (
                <button
                  key={p.id}
                  data-page={p.id}
                  onClick={() => {
                    setCurrent(p.id)
                    if (stacked()) formRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  aria-label={`Edit page ${i + 1}`}
                  aria-current={p.id === page.id}
                  className={`mx-auto block transition-[outline-color] ${p.id === page.id ? 'outline outline-1 outline-offset-[7px] outline-zari' : 'opacity-80 hover:opacity-100'}`}
                  style={zoom === 'fit' ? { width: '100%', maxWidth: invite.format === 'story' ? 400 : 480 } : { width: w }}
                >
                  <div className="pointer-events-none">
                    {zoom === 'fit' ? (
                      <ScaledCard w={w} h={h} className="shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
                        <CardPage invite={invite} page={p} />
                      </ScaledCard>
                    ) : (
                      <div className="shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
                        <CardPage invite={invite} page={p} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {exportPages && (
        <div ref={exportRef} aria-hidden className="pointer-events-none fixed top-0" style={{ left: -100000 }}>
          {exportPages.map((p) => (
            <div key={p.id}>
              <CardPage invite={invite} page={p} />
            </div>
          ))}
        </div>
      )}

      {!previewSeen && !toast && (
        <button
          type="button"
          onClick={() => asideRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="zari-button fixed bottom-5 right-4 z-30 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-wine-deep lg:hidden [body:has(:is(textarea,input:not([type])):focus)_&]:hidden"
        >
          <Eye className="size-4" aria-hidden /> Preview page {index + 1}
        </button>
      )}

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-wine-deep px-5 py-3 text-sm text-rose shadow-xl ring-1 ring-zari/40">
          <Check className="size-4 text-zari" aria-hidden /> {toast}
        </div>
      )}
    </div>
  )
}

function save(file: File) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const iconBtn = 'inline-flex size-10 pointer-coarse:size-11 items-center justify-center rounded-full bg-paper text-ink/80 ring-1 ring-wine/15 hover:text-wine hover:ring-wine/40 disabled:opacity-30'

// The editor is a sequence (settings, pages, words), so its sections carry their step number.
const Step = ({ n, title }: { n: number; title: string }) => (
  <h2 className="flex items-baseline gap-3 border-b border-zari/40 pb-3 font-display text-2xl">
    <span className="font-display text-xl italic text-zari">{n}</span>
    {title}
  </h2>
)

const Control = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <span className="mb-1.5 block text-[13px] text-ink/65">{label}</span>
    {children}
  </div>
)

type FieldProps = { label: string; value: string; onChange: (v: string) => void; lang: Lang; phonetic: boolean; multiline?: boolean; rows?: number; person?: boolean }

function Field({ label, value, onChange, lang, phonetic, multiline, rows = 3, person }: FieldProps) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink/65">{label}</span>
      <TransliterateInput lang={lang} enabled={phonetic} person={person} value={value} onChange={onChange} multiline={multiline} rows={multiline ? rows : undefined} className={inputCls} />
    </label>
  )
}

// Picks a date and writes it into "Date & day" in the chosen day-first format, in the card's language.
function DatePicker({ lang, onPick }: { lang: Lang; onPick: (date: string) => void }) {
  const [iso, setIso] = useState('')
  const [fmt, setFmt] = useState<DateFormat>('dd/mm/yyyy')
  const pick = (i: string, f: DateFormat) => {
    setIso(i)
    setFmt(f)
    if (i) onPick(formatDate(i, f, lang))
  }
  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="block">
        <span className="text-[13px] text-ink/65">Pick a date</span>
        <input type="date" value={iso} onChange={(e) => pick(e.target.value, fmt)} className={`${inputCls} w-auto`} />
      </label>
      <label className="block">
        <span className="text-[13px] text-ink/65">Date format</span>
        <select value={fmt} onChange={(e) => pick(iso, e.target.value as DateFormat)} className={`${inputCls} select-chevron w-auto pr-10`}>
          {DATE_FORMATS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function CoverForm({ p, on, lang, phonetic }: { p: CoverPage; on: (patch: Partial<CoverPage>) => void; lang: Lang; phonetic: boolean }) {
  const f = (label: string, key: keyof CoverPage, multiline = false) => (
    <Field label={label} value={p[key] as string} onChange={(v) => on({ [key]: v })} lang={lang} phonetic={phonetic} multiline={multiline} rows={2} />
  )
  const person = (who: 'bride' | 'groom', title: string) => (
    <fieldset className="space-y-3">
      <legend className="mb-1 font-display text-xl italic">{title}</legend>
      <Field label="Name" value={p[who].name} onChange={(name) => on({ [who]: { ...p[who], name } })} lang={lang} phonetic={phonetic} person />
      <Field label="Parents (optional)" value={p[who].parents} onChange={(parents) => on({ [who]: { ...p[who], parents } })} lang={lang} phonetic={phonetic} />
    </fieldset>
  )
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {f('Sacred invocation / header', 'invocation')}
        {f('Event title', 'title')}
      </div>
      {f('Shlok (optional)', 'shlok', true)}
      {f('Host / parents line', 'hostLine', true)}
      <div className="grid gap-6 sm:grid-cols-2">
        {person('bride', 'Bride')}
        {person('groom', 'Groom')}
      </div>
      {f('Word between the names', 'joiner')}
      <DatePicker lang={lang} onPick={(date) => on({ date })} />
      <div className="grid gap-4 sm:grid-cols-2">
        {f('Date & day', 'date')}
        {f('Time / Shubh Muhurat', 'time')}
        {f('Venue name', 'venue')}
        {f('Full address', 'address')}
        {f('RSVP heading', 'rsvpTitle')}
      </div>
      {f('RSVP / family contact details', 'rsvp', true)}
    </div>
  )
}

function SectionsForm({ p, on, lang, phonetic }: { p: SectionsPage; on: (fn: (p: SectionsPage) => SectionsPage) => void; lang: Lang; phonetic: boolean }) {
  const setSection = (i: number, patch: Partial<SectionsPage['sections'][number]>) =>
    on((q) => ({ ...q, sections: q.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))
  return (
    <div className="space-y-5">
      <Field label="Page title" value={p.title} onChange={(title) => on((q) => ({ ...q, title }))} lang={lang} phonetic={phonetic} />
      {p.sections.map((s, i) => (
        <fieldset key={i} className="space-y-3 rounded-md bg-paper/70 p-4 ring-1 ring-wine/10">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={`Section ${i + 1} heading (optional)`} value={s.heading} onChange={(heading) => setSection(i, { heading })} lang={lang} phonetic={phonetic} />
            </div>
            <button
              onClick={() => on((q) => ({ ...q, sections: q.sections.filter((_, j) => j !== i) }))}
              className="mb-0.5 inline-flex size-11 items-center justify-center rounded-full text-ink/60 ring-1 ring-wine/15 hover:text-wine hover:ring-wine/40"
              aria-label={`Remove section ${i + 1}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <Field label="Text" value={s.body} onChange={(body) => setSection(i, { body })} lang={lang} phonetic={phonetic} multiline rows={Math.min(10, Math.max(3, s.body.split('\n').length + 1))} />
        </fieldset>
      ))}
      <button
        onClick={() => on((q) => ({ ...q, sections: [...q.sections, { heading: '', body: '' }] }))}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-wine pointer-coarse:min-h-11 ring-1 ring-wine/25 hover:bg-wine/5 hover:ring-wine/50"
      >
        <Plus className="size-4" aria-hidden /> Add section
      </button>
    </div>
  )
}

// Photos are kept in the saved draft (localStorage), so they are scaled down to a phone-card size first.
async function shrinkPhoto(file: File) {
  const img = await createImageBitmap(file)
  const k = Math.min(1, 1600 / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * k)
  c.height = Math.round(img.height * k)
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  img.close()
  return c.toDataURL('image/jpeg', 0.85)
}

// The photo window as it looks on the card (artwork on top), at a small size. Dragging pans the photo; the slider zooms.
function PhotoCrop({ slot, art, fit, onChange }: { slot: { box: number[]; src: string; fade?: boolean }; art: string; fit: Photo; onChange: (f: Photo) => void }) {
  const [bx, by, bw, bh] = slot.box
  const fw = 160
  const fh = (fw * bh) / bw
  const img = useRef<HTMLImageElement>(null)
  const drag = useRef<{ x: number; y: number; fit: Photo } | null>(null)
  const move = (e: React.PointerEvent) => {
    const d = drag.current
    const el = img.current
    if (!d || !el?.naturalWidth) return
    // How far the cover-fitted, zoomed photo overhangs the frame: dragging across that distance pans 0..100%.
    const c = Math.max(fw / el.naturalWidth, fh / el.naturalHeight) * d.fit.zoom
    const pan = (v: number, delta: number, over: number) => (over > 1 ? Math.min(100, Math.max(0, v - (delta * 100) / over)) : v)
    onChange({ ...d.fit, x: pan(d.fit.x, e.clientX - d.x, el.naturalWidth * c - fw), y: pan(d.fit.y, e.clientY - d.y, el.naturalHeight * c - fh) })
  }
  return (
    <div className="space-y-2">
      <div
        className="relative cursor-grab touch-none overflow-hidden rounded ring-1 ring-wine/15 active:cursor-grabbing"
        style={{ width: fw, height: fh }}
        onPointerDown={(e) => (e.currentTarget.setPointerCapture(e.pointerId), (drag.current = { x: e.clientX, y: e.clientY, fit }))}
        onPointerMove={move}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <img ref={img} src={fit.src ?? slot.src} alt="" draggable={false} className="size-full object-cover" style={photoStyle(fit)} />
        {/* The artwork around the window, cropped to the frame, so the couple sees where the arch cuts the photo. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `url("${art}") ${bw < 540 ? (bx * 100) / (540 - bw) : 0}% ${(by * 100) / (960 - bh)}% / ${(540 * 100) / bw}% auto no-repeat` }}
        />
      </div>
      <input type="range" min={1} max={3} step={0.05} value={fit.zoom} aria-label="Zoom photo" className="w-full accent-wine" onChange={(e) => onChange({ ...fit, zoom: +e.target.value })} />
    </div>
  )
}
