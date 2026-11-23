import { createContext, useContext, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { LANGS } from '../i18n'
import { templateOf } from '../templates'
import type { CoverPage, Format, Invite, Lang, Page, Photo, SectionsPage, SymbolId } from '../types'
import { DESIGNS, type Design, type Ornaments } from './designs'
import { Emblem, Flourish } from './motifs'
import { styled } from './style'

// Where a photo sits in its frame until the couple moves it: centred, near the top so heads are not cut.
export const PHOTO_FIT: Photo = { x: 50, y: 0, zoom: 1 }
// Cover-fit the photo, show the chosen part, and zoom in around that same point.
export const photoStyle = (f: Photo): CSSProperties => ({
  objectPosition: `${f.x}% ${f.y}%`,
  transform: `scale(${f.zoom})`,
  transformOrigin: `${f.x}% ${f.y}%`,
})

export const SIZES: Record<Format, { w: number; h: number }> = {
  story: { w: 540, h: 960 }, // 9:16, exported at 2x = 1080 x 1920
  print: { w: 450, h: 630 }, // 5:7, exported at 4x = 1800 x 2520
}
const SCALE = { s: 0.9, m: 1, l: 1.1 }

// Any script can appear in any field (a Bismillah line on an English card, a Gurmukhi ੴ...),
// so every stack ends with one face per script.
const SCRIPTS = '"Amiri", "Tiro Devanagari Hindi", "Noto Serif Gujarati", "Tiro Gurmukhi", "Tiro Tamil", serif'
const DANDA: Lang[] = ['hi', 'mr', 'gu', 'pa']

interface Look {
  d: Design
  lang: Lang
  f: { title: string; heading: string; body: string; names: string }
}

function look(design: Design, lang: Lang): Look {
  const L = { ...LANGS[lang], ...design.script?.[lang] }
  const pick = (latin: string, indic: string) => `${indic ? indic + ', ' : ''}${latin}, ${SCRIPTS}`
  return {
    d: design,
    lang,
    f: {
      title: pick(design.fonts.title, L.title),
      heading: pick(design.fonts.heading, L.body),
      body: pick(design.fonts.body, L.body),
      names: pick(design.fonts.names, L.title),
    },
  }
}

// The design's artwork icons, for [[name]] in text.
const Art = createContext<{ orn: Ornaments; lang?: Lang }>({ orn: {} })

// "\n" = new line, *word* = accent colour, **words** = large heading colour, ***words*** = bold, ~words~ = the
// design's names font in the accent colour (a wedding script for the couple's names),
// [[name]] = artwork icon, [[name|words]] = words written on that artwork (a ribbon plate), ___ = a rule to write on, and a line starting << or >> leans left or right.
function Rich({ text, accent, big, inline }: { text: string; accent: string; big: string; inline?: boolean }) {
  const { orn, lang } = useContext(Art)
  return (
    <>
      {text.split('\n').map((raw, i) => {
        const lean = raw.startsWith('<<') ? 'left' : raw.startsWith('>>') ? 'right' : undefined
        const line = lean ? raw.slice(2) : raw
        const pad = lean === 'left' ? { paddingLeft: '14%' } : lean === 'right' ? { paddingRight: '14%' } : {}
        // "left <> middle <> right": spread across the line (corner blessings such as || Shubh || and || Labh ||).
        if (!inline && line.includes('<>'))
          return (
            <span key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              {line.split('<>').map((p, k) => <span key={k}><Rich inline text={p.trim()} accent={accent} big={big} /></span>)}
            </span>
          )
        return (
        <span key={i} style={inline ? undefined : { display: 'block', minHeight: '1em', textAlign: lean, ...pad, whiteSpace: line.includes('[[') ? 'nowrap' : undefined }}>
          {line.split(/(\[\[[^\]]+\]\]|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~[^~]+~|_{3,})/).map((part, j) => {
            const [icon, words] = /^\[\[.+\]\]$/.test(part) ? part.slice(2, -2).split(/\|(.*)/s) : []
            const a = icon !== undefined ? orn[icon] : undefined
            // A cut-out painted with another language's words: its plain piece, or just the typed words.
            const lettered = !!a?.lang && a.lang !== lang
            const src = lettered ? a?.plain : a?.src
            const say = words && (lettered || !a?.lang) ? <Rich inline text={words} accent={accent} big={big} /> : null
            // Words alone stand in for painted lettering: sized to take about the width the lettering took.
            const fill = words ? Math.min(1.6, Math.max(0.8, (a?.w ?? 0) * 0.85 / (words.replace(/[*~]/g, '').length * 0.55 * (/^\*\*[^*]/.test(words) ? 1.6 : 1)))) : 1
            return a && !src ? (
              <span key={j} style={{ fontSize: `${fill.toFixed(2)}em` }}>{say}</span>
            ) : a && say && a.at ? (
              <span key={j} style={{ display: 'inline-flex', flexDirection: a.at === 'below' ? 'column' : 'column-reverse', alignItems: 'center', verticalAlign: 'middle' }}>
                <img src={src} alt="" style={{ display: 'block', width: `${a.w}em` }} />
                {say}
              </span>
            ) : a ? (
              <span key={j} style={{ position: 'relative', display: 'inline-block', width: `${a.w}em`, verticalAlign: 'middle' }}>
                <img src={src} alt="" style={{ display: 'block', width: '100%' }} />
                {say && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.68em', textShadow: '0 0 3px rgba(0,0,0,.45)' }}>{say}</span>}
              </span>
            ) : /^_{3,}$/.test(part) ? (
              <span key={j} style={{ display: 'inline-block', width: `${part.length * 0.45}em`, borderBottom: '1px solid currentColor', marginLeft: '0.2em' }} />
            ) : part.length > 6 && part.startsWith('***') && part.endsWith('***') ? (
              <span key={j} style={{ fontWeight: 700, fontSize: '1.2em' }}>
                {part.slice(3, -3)}
              </span>
            ) : part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
              <span key={j} style={{ color: big, fontWeight: 700, fontSize: '1.6em', lineHeight: 1.25 }}>
                {part.slice(2, -2)}
              </span>
            ) : part.length > 2 && part.startsWith('~') && part.endsWith('~') ? (
              <span key={j} style={{ color: accent, fontFamily: 'var(--names)' }}>
                {part.slice(1, -1)}
              </span>
            ) : part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
              <span key={j} style={{ color: accent, fontWeight: 700 }}>
                {part.slice(1, -1)}
              </span>
            ) : (
              part
            )
          })}
        </span>
        )
      })}
    </>
  )
}

function Heading({ x, children, size = 1.05 }: { x: Look; children: string; size?: number }) {
  if (!children.trim()) return null
  // A heading painted on the artwork (a ribbon plate) is placed as its cut-out.
  if (/^\[\[[^\]]+\]\]$/.test(children.trim())) return <Rich text={children.trim()} accent={x.d.colors.accent} big={x.d.colors.heading} />
  // Headings typed with their own marks (":: Li. Snehadhin ::") keep them.
  const own = /^(::|॥|\|\||II |\.\.\.)/.test(children.trim())
  const text = DANDA.includes(x.lang) && !own ? `॥ ${children} ॥` : children
  return (
    <p style={{ fontFamily: x.f.heading, color: x.d.colors.heading, fontSize: `${size}em`, fontWeight: 700, letterSpacing: x.lang === 'en' ? '0.06em' : 0 }}>
      {text}
    </p>
  )
}

const P = ({ show, style, children }: { show: boolean; style: CSSProperties; children: ReactNode }) => (show ? <div style={style}>{children}</div> : null)

function Cover({ x, p, symbol, head }: { x: Look; p: CoverPage; symbol: SymbolId; head: boolean }) {
  const c = x.d.colors
  const o = x.d.ornaments?.couple ? x.d.ornaments : undefined
  const ty = x.d.type ?? {}
  const name: CSSProperties = { fontFamily: x.f.names, color: c.names ?? c.heading, fontSize: `${ty.names ?? 1.95}em`, lineHeight: 1.2 }
  return (
    <>
      <P show={!head && !!p.invocation} style={{ fontSize: '0.92em', color: c.heading, fontWeight: 600 }}>
        {p.invocation}
      </P>
      <P show={!head && !!p.shlok} style={{ fontSize: '0.76em', color: c.muted, lineHeight: 1.35 }}>
        <Rich text={p.shlok} accent={c.accent} big={c.heading} />
      </P>
      {!head && x.d.cover?.emblem !== false && (
        <div style={{ width: '3.4em', alignSelf: 'center' }}>
          <Emblem symbol={symbol} color={c.title} accent={c.accent} size="100%" />
        </div>
      )}
      <P show={!head && !!p.title} style={{ fontFamily: x.f.title, color: c.title, fontSize: `${ty.title ?? 2.5}em`, lineHeight: 1.15 }}>
        {p.title}
      </P>
      <P show={!!p.hostLine} style={{ fontSize: '0.92em', lineHeight: 1.4 }}>
        <Rich text={p.hostLine} accent={c.accent} big={c.heading} />
      </P>
      {o ? (
        // Names side by side around the artwork's couple icon, as on the printed card.
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1em', width: '100%' }}>
          {(['bride', 'groom'] as const).map((who, i) => (
            <div key={who} style={{ flex: 1, minWidth: 0, order: i * 2, textAlign: i ? 'left' : 'right' }}>
              <P show={!!p[who].name} style={name}>
                {p[who].name}
              </P>
              <P show={!!p[who].parents} style={{ fontSize: '0.8em', color: c.muted }}>
                {p[who].parents}
              </P>
            </div>
          ))}
          <img src={o.couple.src} alt="" style={{ order: 1, width: `${o.couple.w}em` }} />
        </div>
      ) : (
        <div>
          <P show={!!p.bride.name} style={name}>
            {p.bride.name}
          </P>
          <P show={!!p.bride.parents} style={{ fontSize: '0.8em', color: c.muted }}>
            {p.bride.parents}
          </P>
          <P show={!!p.joiner} style={{ fontFamily: x.f.names, color: c.title, fontSize: '1.1em', margin: '0.15em 0' }}>
            {p.joiner}
          </P>
          <P show={!!p.groom.name} style={name}>
            {p.groom.name}
          </P>
          <P show={!!p.groom.parents} style={{ fontSize: '0.8em', color: c.muted }}>
            {p.groom.parents}
          </P>
        </div>
      )}
      {!head && x.d.cover?.flourish !== false && (
        <div style={{ width: '9em', alignSelf: 'center' }}>
          <Flourish color={c.heading} width="100%" />
        </div>
      )}
      <div>
        <P show={!!p.date} style={ty.plainDate ? { fontSize: '1.05em' } : { fontFamily: x.f.heading, color: c.heading, fontSize: '1.05em', fontWeight: 700 }}>
          {p.date}
        </P>
        <P show={!!p.time} style={{ fontSize: '0.92em' }}>
          <Rich text={p.time} accent={c.accent} big={c.heading} />
        </P>
        <P show={!!p.venue} style={{ fontSize: '1em', fontWeight: 700, marginTop: '0.3em' }}>
          {p.venue}
        </P>
        <P show={!!p.address} style={{ fontSize: '0.85em' }}>
          {p.address}
        </P>
      </div>
      {p.rsvp.trim() && (
        <div style={{ marginTop: ty.plainDate ? '1em' : 0 }}>
          {o ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35em' }}>
              <img src={o['swirl-l'].src} alt="" style={{ width: `${o['swirl-l'].w}em` }} />
              <Heading x={x} size={ty.rsvpHeading ?? 0.95}>
                {p.rsvpTitle}
              </Heading>
              <img src={o['swirl-r'].src} alt="" style={{ width: `${o['swirl-r'].w}em` }} />
            </div>
          ) : (
            <Heading x={x} size={0.95}>
              {p.rsvpTitle}
            </Heading>
          )}
          <div style={{ fontSize: '0.85em', lineHeight: 1.4 }}>
            <Rich text={p.rsvp} accent={c.accent} big={c.heading} />
          </div>
        </div>
      )}
    </>
  )
}

// Name list as two centred tables whose words line up, the way kankotri family lists are typeset.
function Table({ lines, accent, big }: { lines: string[]; accent: string; big: string }) {
  // Long rows (five-word names) stay one table; shorter ones split into two side by side.
  const half = Math.max(...lines.map((l) => l.trim().split(/\s+/).length)) > 4 ? lines.length : Math.ceil(lines.length / 2)
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.6em' }}>
      {[lines.slice(0, half), lines.slice(half)].map((col, k) => {
        const words = col.map((l) => l.trim().split(/\s+/))
        const n = Math.max(...words.map((w) => w.length))
        return (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, auto)`, columnGap: '0.4em', textAlign: 'left' }}>
            {words.flatMap((w, i) => Array.from({ length: n }, (_, j) => <Rich key={`${i}.${j}`} text={w[j] ?? ''} accent={accent} big={big} />))}
          </div>
        )
      })}
    </div>
  )
}

type Sec = SectionsPage['sections'][number]
const lineCount = (b: string) => b.split('\n').length

function Sections({ x, p, head, cols }: { x: Look; p: SectionsPage; head: boolean; cols?: number }) {
  const c = x.d.colors
  const ty = x.d.type ?? {}
  // A painted page that sets cols lays out every headed section in rows, however long.
  const short = (s: Sec) => !!s.heading && (!!cols || (lineCount(s.body) <= 6 && s.heading.length < 24))
  // Pair consecutive short sections side by side, as kankotris do; long ones take the full width.
  // In a run of 5, 9... the middle one stands alone, centred between the pairs.
  const rows: Sec[][] = []
  for (let i = 0; i < p.sections.length; ) {
    let n = 0
    while (i + n < p.sections.length && short(p.sections[i + n])) n++
    if (!n) {
      rows.push([p.sections[i++]])
      continue
    }
    const run = p.sections.slice(i, i + n)
    const mid = n % 4 === 1 && n >= 5 ? (n - 1) / 2 : -1
    for (let j = 0; j < n; ) {
      const take = j === mid ? 1 : Math.min(cols ?? 2, n - j)
      rows.push(run.slice(j, j + take))
      j += take
    }
    i += n
  }
  // Name lists flow into two columns; long sentences (an invitation letter) stay one wide column.
  // Not on a painted page laid out in columns, nor a block holding a cut-out (an event with its ribbon or pin).
  const list = (b: string) => !cols && !b.includes('[[') && lineCount(b) > 6 && Math.max(...b.split('\n').map((l) => l.length)) <= 40
  return (
    <>
      <P show={!head && !!p.title} style={{ fontFamily: x.f.title, color: c.title, fontSize: '2.3em', lineHeight: 1.15 }}>
        {p.title}
      </P>
      {!head && x.d.cover?.flourish !== false && (
        <div style={{ width: '9em', alignSelf: 'center' }}>
          <Flourish color={c.heading} width="100%" />
        </div>
      )}
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: '1em', width: '100%' }}>
          {row.map((s, j) => (
            <div key={j} style={{ flex: 1, minWidth: 0 }}>
              <Heading x={x} size={ty.heading}>
                {s.heading}
              </Heading>
              {/* columnCount only for real lists: a one-column multicol box with a fixed height pushes overflow into an invisible extra column on export. */}
              <div
                style={{
                  fontSize: `${(ty.body ?? 0.88) * (s.size ?? 1)}em`,
                  lineHeight: 1.5,
                  columnCount: list(s.body) && ty.lists !== 'left' ? 2 : undefined,
                  columnGap: '1.2em',
                  textAlign: list(s.body) && ty.lists === 'right' ? 'right' : undefined,
                }}
              >
                {list(s.body) && ty.lists === 'left' ? <Table lines={s.body.split('\n')} accent={c.accent} big={c.heading} /> : <Rich text={s.body} accent={c.accent} big={c.heading} />}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

export function CardPage({ invite, page }: { invite: Invite; page: Page }) {
  const t = templateOf(invite)
  const base0 = styled(DESIGNS[t.design], invite.style).d
  const { w, h } = SIZES[invite.format]
  // Painted templates: each page has its own artwork and its own text band, scaled from story px.
  const own = base0.pages?.[Math.max(0, invite.pages.indexOf(page)) % base0.pages.length]
  // In another language a page with painted words uses its plain artwork, and its title is typed instead.
  const lang = own?.plain && invite.lang !== t.lang ? { ...own, ...own.plain, head: false } : own
  // Print with its own 5:7 artwork: shown whole, no crop of the 9:16 page.
  const art = lang?.print && invite.format === 'print' ? { ...lang, ...lang.print } : lang
  const d = art?.colors ? { ...base0, colors: { ...base0.colors, ...art.colors } } : base0
  // 'lang': the template's own pages type their title in the text, in its language and in every translation (tr).
  const head = art?.head === 'lang' ? invite.lang === t.lang || !!t.tr?.[invite.lang] : !!art?.head
  const k = w / 540
  const crop = art?.print && invite.format === 'print' ? 0 : (960 * k - h) / 2
  const safe = art ? { top: art.top * k - crop, bottom: art.bottom * k - crop, x: d.safe.story.x * k } : d.safe[invite.format]
  const side = art?.x ? { left: (art.x[0] * w) / 100, right: (art.x[1] * w) / 100 } : { left: safe.x, right: safe.x }
  const fit = art?.photo && { ...PHOTO_FIT, ...invite.photos?.[base0.pages!.indexOf(own!)] }
  const photo = art?.photo && { src: fit!.src ?? art.photo.src, b: art.photo.box.map((v) => v * k), fade: art.photo.fade }
  const x = look(d, invite.lang)
  const base = w / 30
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  // lead: the first section gets its own band (a title typed into a painted frame), fitted on its own.
  const leadBox = useRef<HTMLDivElement>(null)
  const leadInner = useRef<HTMLDivElement>(null)
  // In print, only the print art's own lead box applies: the story box is placed for the cropped 9:16 page.
  const leadDef = art !== lang ? lang?.print?.lead : art?.lead
  const lead = leadDef && page.kind !== 'cover' && page.sections.length > 1 ? leadDef : undefined
  const body = lead && page.kind !== 'cover' ? { ...page, sections: page.sections.slice(1) } : page

  // Shrink text until it fits the safe area, so long family lists never spill onto the artwork.
  // Designs with type.grow start larger, so sparse pages fill their band as a designer would.
  useLayoutEffect(() => {
    const fitOne = (b: HTMLDivElement | null, el: HTMLDivElement | null) => {
      if (!b || !el) return
      let k = SCALE[invite.scale] * (art?.size ?? d.type?.grow ?? 1)
      el.style.fontSize = `${base * k}px`
      // Also shrink when a line is wider than the band (a long name in another script, a row with an ornament).
      while ((el.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1) && k > 0.5) {
        k -= 0.03
        el.style.fontSize = `${base * k}px`
      }
    }
    const fit = () => {
      fitOne(box.current, inner.current)
      fitOne(leadBox.current, leadInner.current)
    }
    fit()
    // Re-fit whenever a web font finishes loading (faces load lazily on first use), not on every keystroke.
    document.fonts?.addEventListener('loadingdone', fit)
    // Ornament images (painted cut-outs) load after the first fit and grow the text block, so fit again.
    const el = inner.current
    el?.addEventListener('load', fit, true)
    return () => {
      document.fonts?.removeEventListener('loadingdone', fit)
      el?.removeEventListener('load', fit, true)
    }
    // Only pages whose content or look changed re-fit; untouched pages keep their object identity.
  }, [page, base, invite.scale, invite.lang, invite.templateId, invite.format, own, invite.style])

  return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, background: d.sky, color: d.colors.text, fontFamily: x.f.body, letterSpacing: d.tracking, textShadow: d.press, '--names': x.f.names } as CSSProperties}>
      {/* Painted art is an <img>, not a CSS background: Safari's export drops a url() background's size and colour, so pages came out black. */}
      {art && !photo && <img src={art.src} alt="" className="absolute inset-0 size-full object-cover" />}
      {photo && (
        <>
          {/* The photo sits under the artwork, which is see-through where the printed card had its photo. */}
          <div className="absolute overflow-hidden" style={{ left: photo.b[0], top: photo.b[1] - crop, width: photo.b[2], height: photo.b[3], maskImage: photo.fade ? 'linear-gradient(#000 62%, transparent 100%)' : undefined }}>
            <img src={photo.src} alt="" className="size-full object-cover" style={photoStyle(fit!)} />
          </div>
          <img src={art!.src} alt="" className="absolute inset-0 size-full object-cover" />
        </>
      )}
      {!art && (
        <>
          {d.Overlay && <d.Overlay h={(h * 540) / w} />}
          <div className="absolute inset-x-0 top-0">
            <d.Top />
          </div>
          <div className="absolute inset-x-0 bottom-0" style={{ height: invite.format === 'story' ? (w * 340) / 540 : w * 0.46 }}>
            <d.Bottom />
          </div>
        </>
      )}
      {lead && page.kind !== 'cover' && (
        <div ref={leadBox} className="absolute overflow-hidden" style={{ top: lead.box[1] * k - crop, height: lead.box[3] * k, left: lead.box[0] * k, width: lead.box[2] * k }}>
          <div ref={leadInner} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', lineHeight: 1.3, fontSize: base }}>
            <Art.Provider value={{ orn: d.ornaments ?? {}, lang: invite.lang }}>
              <Sections x={x} p={{ ...page, sections: page.sections.slice(0, 1) }} head />
            </Art.Provider>
          </div>
        </div>
      )}
      <div ref={box} className="absolute overflow-hidden" style={{ top: safe.top, bottom: safe.bottom, ...side }}>
        <div
          ref={inner}
          style={{
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: art?.spread ? 'space-evenly' : 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: `${art?.gap ?? 0.55}em`,
            lineHeight: 1.3,
            fontSize: base,
          }}
        >
          <Art.Provider value={{ orn: d.ornaments ?? {}, lang: invite.lang }}>{page.kind === 'cover' ? <Cover x={x} p={page} symbol={t.symbol} head={head} /> : <Sections x={x} p={body as SectionsPage} head={head} cols={art?.cols} />}</Art.Provider>
        </div>
      </div>
    </div>
  )
}
