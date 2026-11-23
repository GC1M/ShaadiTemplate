// The luxe layer over the drawn (vector) designs: a foil frame, a tone-on-tone woven pattern, paper or silk texture,
// a colour palette and a lettering pairing. Drawn designs start as drawn (Original); the couple can change any part
// in the editor (Invite.style). Painted designs (Design.pages) are left as they are.
import type { ReactElement } from 'react'
import type { CardStyle } from '../types'
import { DESIGNS, type Design } from './designs'
import { FoilDefs, GRAIN, GRAIN_LIGHT, VIGNETTE, foil, type Foil } from './luxe'

export const FRAMES = { original: 'Original', filigree: 'Filigree', jharokha: 'Jharokha arch', temple: 'Temple border', zari: 'Zari band', deco: 'Art deco', hairline: 'Hairline' } as const
export const PATTERNS = { none: 'Plain', jaal: 'Jaal trellis', buta: 'Buta florals', bandhani: 'Bandhani dots', scallop: 'Deco fans', stars: 'Starlight' } as const
export const FOILS: Record<Foil, string> = { gold: 'Gold', rose: 'Rose gold', silver: 'Silver', copper: 'Copper' }
// Metal swatches for the editor's foil picker.
export const FOIL_SWATCH: Record<Foil, string> = {
  gold: 'linear-gradient(135deg,#8d6a22,#f6e3a1 45%,#b8913b)',
  rose: 'linear-gradient(135deg,#8f5348,#f8dacd 45%,#c4887a)',
  silver: 'linear-gradient(135deg,#7c7f87,#ffffff 45%,#b9bcc4)',
  copper: 'linear-gradient(135deg,#82401c,#f2b48a 45%,#b3602f)',
}
export const FONTS = { original: 'Original', regal: 'Regal', romantic: 'Romantic', editorial: 'Editorial', heritage: 'Heritage' } as const

type Palette = { label: string; sky: string; colors: Design['colors'] }
export const PALETTES: Record<string, Palette | null> = {
  original: null,
  maroon: { label: 'Maharani maroon', sky: 'linear-gradient(180deg,#5a1424,#3a0a16 60%,#2a0710)', colors: { title: '#ecd08a', heading: '#e9cf8f', text: '#f4e6cc', accent: '#f2b99c', muted: '#d8c0a2', names: '#f6dfa0' } },
  emerald: { label: 'Emerald darbar', sky: 'linear-gradient(180deg,#0f4636,#0a2f25 60%,#061f18)', colors: { title: '#e6cc86', heading: '#e3c987', text: '#eef0e2', accent: '#f0c98a', muted: '#bcd0c2', names: '#f2dc9c' } },
  sapphire: { label: 'Midnight sapphire', sky: 'linear-gradient(180deg,#18295a,#0e1a3d 60%,#08102a)', colors: { title: '#e8cf8e', heading: '#e2cb93', text: '#eef0f8', accent: '#f1c7a0', muted: '#b8c2dc', names: '#f3dea6' } },
  noir: { label: 'Black tie', sky: 'linear-gradient(180deg,#1c1a18,#100f0e 60%,#080807)', colors: { title: '#e3cb8f', heading: '#d9c08a', text: '#efe8da', accent: '#e8c07a', muted: '#b9ad97', names: '#f0dca8' } },
  ivory: { label: 'Ivory pearl', sky: 'linear-gradient(180deg,#fbf6ec,#f3ead8 60%,#ece0c8)', colors: { title: '#875814', heading: '#6e1a2b', text: '#3b2a1a', accent: '#835a19', muted: '#6b5a45', names: '#7a2e24' } },
  blush: { label: 'Blush rose', sky: 'linear-gradient(180deg,#f8e4e3,#f0d1d1 60%,#e8c2c4)', colors: { title: '#7c3442', heading: '#6e2232', text: '#4a1f28', accent: '#7e453a', muted: '#6f4b55', names: '#7c3442' } },
}

const LATIN = {
  regal: { title: '"Cinzel"', heading: '"Cinzel"', body: '"Cormorant Garamond", Georgia, serif', names: '"Pinyon Script"' },
  romantic: { title: '"Great Vibes"', heading: '"Marcellus"', body: '"Cormorant Garamond", Georgia, serif', names: '"Great Vibes"' },
  editorial: { title: '"Bodoni Moda"', heading: '"Bodoni Moda"', body: '"Cormorant Garamond", Georgia, serif', names: '"Bodoni Moda"' },
  heritage: { title: '"Marcellus"', heading: '"Cinzel"', body: '"Cormorant Garamond", Georgia, serif', names: '"Pinyon Script"' },
}

// Parts for Make your own, borrowed from the featured designs that draw them, so anyone can mix and match: every
// top decoration and bottom scene, and every border that is more than a hairline (the Hairline frame covers those).
export const TOPS = {
  none: 'None', genda: 'Marigold garland', kalire: 'Kalire tassels', garbo: 'Copper bunting', korvai: 'Gold brocade', 'gota-patti': 'Gota lace',
  patola: 'Ikat band', 'pithi-bandhani': 'Bandhani mirrors', 'jain-manuscript': 'Manuscript band', phulkari: 'Phulkari band', 'mehndi-jaal': 'Henna mandala',
  pichhwai: 'Lotus buds', paithani: 'Pallu stripe', kolam: 'Kolam edge', thipka: 'Rangoli dots', choodi: 'Bangle charm', deco: 'Deco lines', 'rose-window': 'Rose window',
} as Record<string, string>
export const SCENES = {
  none: 'None', genda: 'Brass urli', garbo: 'Diya lamp', choodi: 'Bangles', deco: 'Deco fan', harmandir: 'Golden temple',
  pichhwai: 'Lotus pond', paithani: 'Peacock pallu', korvai: 'Zari border', patola: 'Ikat diamonds', 'jain-manuscript': 'Elephant frieze', 'pithi-bandhani': 'Bandhani mirrors',
  phulkari: 'Phulkari bagh', 'pietra-dura': 'Inlay vase', thipka: 'Rangoli lotus', kalire: 'Red chooda', 'gota-patti': 'Gota leaves', kolam: 'Kolam lattice', 'mehndi-jaal': 'Henna mandala',
} as Record<string, string>
export const BORDERS = {
  none: 'None', thanjavur: 'Gilt mandapa', aaina: 'Mirror arch', korvai: 'Zari sides', patola: 'Ikat sides', 'jain-manuscript': 'Lapis sides',
  genda: 'Marigold strings', 'pietra-dura': 'Marble inlay', paithani: 'Gold butis', phulkari: 'Phulkari dots', kalire: 'Gold dots',
} as Record<string, string>
// Parts that show a sacred place or symbol: offered only on a card for that faith.
export const SACRED: Record<string, string> = { harmandir: 'ek-onkar', 'rose-window': 'christian' }

export const PLAIN: CardStyle = { frame: 'original', pattern: 'none', foil: 'gold', palette: 'original', fonts: 'original' }

// Designer's choice where it differs from the design as drawn.
export const LOOKS: Record<string, CardStyle> = {
  custom: { frame: 'filigree', pattern: 'jaal', foil: 'gold', palette: 'maroon', fonts: 'regal', top: 'none', scene: 'choodi' },
}

// Designs with no art along the top edge: only there does a frame keep its top crest (elsewhere it would sit on a
// garland, band or frieze).
const OPEN_TOP = new Set(['custom', 'aaina', 'thanjavur', 'pietra-dura', 'rose-window'])

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const rl = (c: number[]) => {
  const [r, g, b] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: number[], b: number[]) => {
  const [x, y] = [rl(a), rl(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
// Nudges an ink toward white (dark ground) or black (light ground) until it reaches the WCAG contrast min against
// every colour stop of the ground, so muted and accent words stay readable on any palette.
function legible(ink: string, ground: string, dark: boolean, min: number) {
  if (!/^#[0-9a-f]{6}$/i.test(ink)) return ink
  const stops = (ground.match(/#[0-9a-f]{6}\b/gi) ?? []).map(rgb)
  let c = rgb(ink)
  for (let k = 0; k < 24 && stops.some((g) => ratio(c, g) < min); k++) c = c.map((v) => Math.round(v + ((dark ? 255 : 0) - v) * 0.1))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}

const lum = (hex: string) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16)
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

// The design as the chosen style draws it. Drawn designs only; a painted design is returned as is.
// Cached, so the card's frame components keep their identity between renders (no remount on every keystroke).
const memo = new Map<string, { d: Design; s: CardStyle | null }>()
export function styled(d: Design, own?: Partial<CardStyle>): { d: Design; s: CardStyle | null } {
  if (d.pages) return { d, s: null }
  // Nothing picked: the card exactly as designed.
  if (!LOOKS[d.id] && !own) return { d, s: PLAIN }
  const key = `${d.id}|${JSON.stringify(own ?? {})}`
  if (!memo.has(key)) memo.set(key, build(d, own))
  return memo.get(key)!
}

function build(d: Design, own?: Partial<CardStyle>): { d: Design; s: CardStyle } {
  const s = { ...(LOOKS[d.id] ?? PLAIN), ...own }
  const p = PALETTES[s.palette]
  const ink = p ? p.colors : d.colors
  const dark = lum(ink.text) > 0.55
  const ground = p ? p.sky : d.sky
  const colors = Object.fromEntries(Object.entries(ink).map(([k, v]) => [k, legible(v, ground, dark, ['title', 'heading', 'names'].includes(k) ? 3 : 4.5)])) as Design['colors']
  // Paper or silk tooth and a soft edge vignette over the ground; a layer the design's own sky already has is not added twice.
  const add = [dark ? GRAIN_LIGHT : GRAIN, VIGNETTE].filter((l) => !ground.includes(l))
  const sky = [...add.map((l) => (l === VIGNETTE ? l.replace('55%', '68%').replace('.28', dark ? '.3' : '.1') : l)), ground].join(',')
  const fonts = s.fonts === 'original' ? d.fonts : LATIN[s.fonts]
  const framed = s.frame !== 'original'
  // Border art borrowed from another design (Make your own), or the design's own.
  const art = !s.border ? d.Overlay : s.border === 'none' ? undefined : (DESIGNS[s.border]?.Overlay ?? d.Overlay)
  const Overlay = framed || s.pattern !== 'none' ? (({ h }: { h: number }) => <Layers h={h} s={s} dark={dark} own={art} ink={colors.title} crest={s.top ? s.top === 'none' : OPEN_TOP.has(d.id)} />) : art
  // A frame takes the edge, so text keeps clear of it; the wide bands (zari, temple) take more.
  const x = s.frame === 'zari' || s.frame === 'temple' ? 58 : 50
  const safe: Design['safe'] = framed ? { story: { ...d.safe.story, x: Math.max(d.safe.story.x, x) }, print: { ...d.safe.print, x: Math.max(d.safe.print.x, x * 0.85) } } : { ...d.safe }
  // A borrowed scene or top keeps the words clear of itself, as on the card it comes from.
  const lend = (id: string | undefined) => (id && id !== 'none' ? DESIGNS[id]?.safe : undefined)
  const [up, down, side] = [lend(s.top), lend(s.scene), lend(s.border)]
  for (const f of ['story', 'print'] as const) {
    if (side) safe[f] = { ...safe[f], x: Math.max(safe[f].x, side[f].x) }
    if (up) safe[f] = { ...safe[f], top: Math.max(safe[f].top, up[f].top) }
    if (down) safe[f] = { ...safe[f], bottom: Math.max(safe[f].bottom, down[f].bottom) }
  }
  // A top decoration or scene borrowed from another design (Make your own), or none.
  const part = (id: string | undefined, key: 'Top' | 'Bottom') => (!id ? d[key] : id === 'none' ? Empty : (DESIGNS[id]?.[key] ?? d[key]))
  return { d: { ...d, sky, colors, fonts, Overlay, safe, Top: part(s.top, 'Top'), Bottom: part(s.scene, 'Bottom') }, s }
}

function Layers({ h, s, dark, own: Own, ink, crest }: { h: number; s: CardStyle; dark: boolean; own?: Design['Overlay']; ink: string; crest: boolean }) {
  return (
    <>
      {s.pattern !== 'none' && <Pattern h={h} id={s.pattern} fill={dark ? foil(s.foil) : ink} opacity={dark ? 0.12 : 0.09} />}
      {Own && <Own h={h} />}
      {s.frame !== 'original' && <Frame h={h} id={s.frame} f={s.foil} crest={crest} />}
    </>
  )
}

const Empty = () => null

const full = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const

function Pattern({ h, id, fill, opacity }: { h: number; id: CardStyle['pattern']; fill: string; opacity: number }) {
  const T: Record<Exclude<CardStyle['pattern'], 'none'>, [number, number, ReactElement]> = {
    jaal: [60, 90, <g fill="none" stroke={fill} strokeWidth="0.9"><path d="M30 0 C52 20 52 25 30 45 C8 65 8 70 30 90 M30 0 C8 20 8 25 30 45 C52 65 52 70 30 90" /><circle cx="30" cy="45" r="2.2" fill={fill} stroke="none" /><circle cx="0" cy="0" r="1.6" fill={fill} stroke="none" /><circle cx="60" cy="0" r="1.6" fill={fill} stroke="none" /><circle cx="0" cy="90" r="1.6" fill={fill} stroke="none" /><circle cx="60" cy="90" r="1.6" fill={fill} stroke="none" /></g>],
    buta: [56, 56, <g fill={fill}>{[[14, 14], [42, 42]].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}>{[0, 90, 180, 270].map((a) => <ellipse key={a} cy="-4.2" rx="2" ry="4.2" transform={`rotate(${a})`} />)}<circle r="1.4" /></g>)}{[[42, 14], [14, 42]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1" />)}</g>],
    bandhani: [34, 34, <g fill="none" stroke={fill} strokeWidth="0.7"><circle cx="8.5" cy="8.5" r="1.6" /><circle cx="25.5" cy="25.5" r="1.6" /><circle cx="8.5" cy="8.5" r="0.5" fill={fill} /><circle cx="25.5" cy="25.5" r="0.5" fill={fill} /></g>],
    scallop: [48, 48, <g fill="none" stroke={fill} strokeWidth="0.8">{[[0, 24], [24, 48], [-24, 48], [48, 48]].map(([x, y]) => <g key={`${x}${y}`} transform={`translate(${x} ${y})`}><path d="M0 0 A24 24 0 0 1 48 0" /><path d="M8 0 A16 16 0 0 1 40 0" /><path d="M16 0 A8 8 0 0 1 32 0" /></g>)}</g>],
    stars: [96, 96, <g fill={fill}>{[[12, 18, 2.6], [58, 9, 1.4], [80, 46, 2], [34, 60, 1.2], [66, 82, 2.8], [8, 78, 1.5], [44, 34, 0.9]].map(([x, y, r]) => <path key={x} d={`M${x} ${y - r * 2} L${x + r * 0.4} ${y - r * 0.4} L${x + r * 2} ${y} L${x + r * 0.4} ${y + r * 0.4} L${x} ${y + r * 2} L${x - r * 0.4} ${y + r * 0.4} L${x - r * 2} ${y} L${x - r * 0.4} ${y - r * 0.4} Z`} />)}</g>],
  }
  if (id === 'none') return null
  const [w, ph, tile] = T[id]
  const pid = `lxp-${id}-${fill.replace(/\W/g, '')}` // per ink: the gallery shows many cards in one document
  return (
    <svg viewBox={`0 0 540 ${h}`} width="100%" height="100%" preserveAspectRatio="none" style={full}>
      <FoilDefs />
      <defs>
        <pattern id={pid} patternUnits="userSpaceOnUse" width={w} height={ph}>
          {tile}
        </pattern>
      </defs>
      <rect width="540" height={h} fill={`url(#${pid})`} opacity={opacity} />
    </svg>
  )
}

function Frame({ h, id, f, crest }: { h: number; id: CardStyle['frame']; f: Foil; crest: boolean }) {
  const g = foil(f)
  if (id === 'filigree') return <LuxeFrame h={h} f={f} jewels={crest} />
  const svg = (children: ReactElement) => (
    <svg viewBox={`0 0 540 ${h}`} width="100%" height="100%" preserveAspectRatio="none" style={full}>
      <FoilDefs />
      {children}
    </svg>
  )
  if (id === 'hairline')
    // Two fine rules, a lotus bud at each corner and a jewel at the middle of the top and bottom edges.
    return svg(
      <g fill="none" stroke={g}>
        <rect x="22" y="22" width="496" height={h - 44} strokeWidth="1" />
        <rect x="30" y="30" width="480" height={h - 60} strokeWidth="0.5" />
        {[[22, 22, 45], [518, 22, 135], [22, h - 22, -45], [518, h - 22, -135]].map(([x, y, a]) => (
          <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${a + 90})`} fill={g} stroke="none">
            <ellipse cy="-7" rx="3" ry="7" />
            <ellipse cy="-5" rx="2.2" ry="6" transform="rotate(-38)" />
            <ellipse cy="-5" rx="2.2" ry="6" transform="rotate(38)" />
          </g>
        ))}
        {[crest && 22, h - 22].map((y) =>
          y ? (
            <g key={y} transform={`translate(270 ${y})`}>
              <EdgeJewel fill={g} />
            </g>
          ) : null,
        )}
      </g>,
    )
  if (id === 'jharokha') {
    // A cusped Mughal arch: an ogee window with a finial, its spring line lowered on taller cards.
    const arch = (i: number) => `M${40 + i} ${h - 40 - i} V${250 + i} C${40 + i} ${175 + i} ${130 + i} ${128 + i} ${222} ${104 + i} C${246} ${98 + i} ${262} ${84 + i} 270 ${66 + i} C278 ${84 + i} ${294} ${98 + i} ${318} ${104 + i} C${410 - i} ${128 + i} ${500 - i} ${175 + i} ${500 - i} ${250 + i} V${h - 40 - i} Z`
    return svg(
      <g fill="none" stroke={g}>
        <rect x="16" y="16" width="508" height={h - 32} strokeWidth="1.8" />
        <rect x="22" y="22" width="496" height={h - 44} strokeWidth="0.5" />
        <path d={arch(0)} strokeWidth="1.8" />
        <path d={arch(7)} strokeWidth="0.6" />
        <path d={arch(12)} strokeWidth="1" strokeDasharray="0.1 6" strokeLinecap="round" />
        {crest && <path d="M270 66 L270 44 M262 52 Q270 36 278 52" strokeWidth="1.2" />}
        {crest && <circle cx="270" cy="36" r="3.2" fill={g} stroke="none" />}
        {[[22, 22, 1], [518, 22, -1]].map(([x, y, sx]) => (
          <path key={x} d={`M${x} ${y + 70} C${x + sx * 10} ${y + 30} ${x + sx * 30} ${y + 10} ${x + sx * 70} ${y}`} strokeWidth="0.8" />
        ))}
      </g>,
    )
  }
  if (id === 'deco') {
    const step = (x: number, y: number, sx: number, sy: number) => `M${x} ${y + sy * 60} V${y + sy * 18} H${x + sx * 8} V${y + sy * 8} H${x + sx * 18} V${y} H${x + sx * 60}`
    return svg(
      <g fill="none" stroke={g}>
        <rect x="18" y="18" width="504" height={h - 36} strokeWidth="1.4" />
        {[[30, 30, 1, 1], [510, 30, -1, 1], [30, h - 30, 1, -1], [510, h - 30, -1, -1]].map(([x, y, sx, sy]) => (
          <g key={`${x}${y}`}>
            <path d={step(x, y, sx, sy)} strokeWidth="1.2" />
            <path d={step(x + sx * 6, y + sy * 6, sx, sy)} strokeWidth="0.5" />
          </g>
        ))}
        <path d={`M36 220 V${h - 220} M42 240 V${h - 240} M504 220 V${h - 220} M498 240 V${h - 240}`} strokeWidth="0.6" />
        {(crest ? [0, 1] : [1]).map((k) => (
          <g key={k} transform={k ? `translate(270 ${h - 18}) scale(1 -1)` : 'translate(270 18)'}>
            <path d="M-46 0 A46 46 0 0 0 46 0" strokeWidth="1.2" />
            <path d="M-34 0 A34 34 0 0 0 34 0" strokeWidth="0.6" />
            {Array.from({ length: 9 }, (_, i) => {
              const a = (Math.PI * (i + 1)) / 10
              return <path key={i} d={`M${-Math.cos(a) * 12} ${Math.sin(a) * 12} L${-Math.cos(a) * 44} ${Math.sin(a) * 44}`} strokeWidth="0.6" />
            })}
            <path d="M-12 0 A12 12 0 0 0 12 0 Z" fill={g} stroke="none" />
          </g>
        ))}
      </g>,
    )
  }
  if (id === 'temple')
    // A Kanjivaram-style border: a heavy zari band with a row of temple beads, and a stepped gopuram crest.
    return svg(
      <g fill="none" stroke={g}>
        <rect x="18" y="18" width="504" height={h - 36} strokeWidth="4" />
        <rect x="29" y="29" width="482" height={h - 58} strokeWidth="2.4" strokeDasharray="0.1 8" strokeLinecap="round" />
        <rect x="38" y="38" width="464" height={h - 76} strokeWidth="0.7" />
        {crest && (
          <g transform="translate(270 38) scale(.7)" fill={g} stroke="none">
            <path d="M-54 0 H54 V-6 H40 V-12 H26 V-18 H12 V-24 H-12 V-18 H-26 V-12 H-40 V-6 H-54 Z" />
            <circle cy="-29" r="3.4" />
          </g>
        )}
        {[[38, 38], [502, 38], [38, h - 38], [502, h - 38]].map(([x, y]) => (
          <g key={`${x}${y}`} transform={`translate(${x} ${y})`} fill={g} stroke="none">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} cy="-6" rx="2.2" ry="5" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        ))}
      </g>,
    )
  // zari: a woven brocade band all round, diamonds and dots between two rules.
  return svg(
    <g>
      <defs>
        <pattern id={`lx-zari-${f}`} patternUnits="userSpaceOnUse" width="16" height="16">
          <path d="M8 4 L12 8 L8 12 L4 8 Z" fill={g} />
          <circle cx="0" cy="0" r="1.3" fill={g} />
          <circle cx="16" cy="16" r="1.3" fill={g} />
          <circle cx="16" cy="0" r="1.3" fill={g} />
          <circle cx="0" cy="16" r="1.3" fill={g} />
        </pattern>
      </defs>
      <path d={`M14 14 H526 V${h - 14} H14 Z M28 28 V${h - 28} H512 V28 Z`} fill={`url(#lx-zari-${f})`} fillRule="evenodd" opacity="0.55" />
      <g fill="none" stroke={g}>
        <rect x="14" y="14" width="512" height={h - 28} strokeWidth="1.4" />
        <rect x="28" y="28" width="484" height={h - 56} strokeWidth="1.4" />
        <rect x="34" y="34" width="472" height={h - 68} strokeWidth="0.5" />
      </g>
    </g>,
  )
}


// Baroque corner in a 120x120 box, pointing at (0,0). Rotate/flip for other corners.
function FiligreeCorner({ fill, s = 1 }: { fill: string; s?: number }) {
  return (
    <g transform={`scale(${s})`} fill="none" stroke={fill} strokeLinecap="round">
      <path d="M8 66 C8 34 34 8 66 8" strokeWidth="1.6" />
      <path d="M16 74 C16 42 42 16 74 16" strokeWidth="0.7" />
      <path d="M66 8 C88 8 98 22 88 32 C80 39 70 31 76 24 C80 20 85 23 84 27" strokeWidth="1.4" />
      <path d="M8 66 C8 88 22 98 32 88 C39 80 31 70 24 76 C20 80 23 85 27 84" strokeWidth="1.4" />
      <path d="M74 16 C96 18 112 12 118 4" strokeWidth="0.9" />
      <path d="M16 74 C18 96 12 112 4 118" strokeWidth="0.9" />
      <path d="M22 22 C36 26 46 36 50 50 C36 46 26 36 22 22 Z" fill={fill} stroke="none" />
      <path d="M32 14 C38 5 49 4 54 11 C45 11 38 13 32 14 Z" fill={fill} stroke="none" />
      <path d="M14 32 C5 38 4 49 11 54 C11 45 13 38 14 32 Z" fill={fill} stroke="none" />
      <path d="M40 24 C46 20 52 22 54 27 M24 40 C20 46 22 52 27 54" strokeWidth="0.8" />
      <circle cx="58" cy="58" r="2.6" fill={fill} stroke="none" />
      <circle cx="28" cy="52" r="1.5" fill={fill} stroke="none" />
      <circle cx="52" cy="28" r="1.5" fill={fill} stroke="none" />
      <circle cx="96" cy="10" r="1.4" fill={fill} stroke="none" />
      <circle cx="10" cy="96" r="1.4" fill={fill} stroke="none" />
    </g>
  )
}

// Small cartouche for the middle of a frame edge, centred on (0,0).
function EdgeJewel({ fill }: { fill: string }) {
  return (
    <g fill="none" stroke={fill} strokeLinecap="round">
      <path d="M0 -9 L9 0 L0 9 L-9 0 Z" fill={fill} stroke="none" />
      <path d="M-12 0 C-22 -10 -34 -8 -36 0 C-34 8 -22 10 -12 0 M12 0 C22 -10 34 -8 36 0 C34 8 22 10 12 0" strokeWidth="1.1" />
      <path d="M-40 0 L-60 0 M40 0 L60 0" strokeWidth="0.8" />
      <circle cx="-64" cy="0" r="1.6" fill={fill} stroke="none" />
      <circle cx="64" cy="0" r="1.6" fill={fill} stroke="none" />
    </g>
  )
}

// Full-card frame: triple rule, filigree corners, edge jewels. h in 540-wide units.
function LuxeFrame({ h, f = 'gold', inset = 16, corners = true, jewels = true }: { h: number; f?: Foil; inset?: number; corners?: boolean; jewels?: boolean }) {
  const g = foil(f)
  const i2 = inset + 7
  const i3 = inset + 12
  return (
    <svg viewBox={`0 0 540 ${h}`} width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <FoilDefs />
      <rect x={inset} y={inset} width={540 - inset * 2} height={h - inset * 2} stroke={g} strokeWidth="2.4" fill="none" />
      <rect x={i2} y={i2} width={540 - i2 * 2} height={h - i2 * 2} stroke={g} strokeWidth="0.8" fill="none" />
      <rect x={i3} y={i3} width={540 - i3 * 2} height={h - i3 * 2} stroke={g} strokeWidth="0.9" strokeDasharray="0.1 5" strokeLinecap="round" fill="none" />
      {corners &&
        [
          [i2, i2, 1, 1],
          [540 - i2, i2, -1, 1],
          [i2, h - i2, 1, -1],
          [540 - i2, h - i2, -1, -1],
        ].map(([x, y, sx, sy]) => (
          <g key={`${sx}${sy}`} transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
            <FiligreeCorner fill={g} s={0.85} />
          </g>
        ))}
      {jewels && (
        <>
          <g transform={`translate(270 ${inset})`}>
            <EdgeJewel fill={g} />
          </g>
          <g transform={`translate(270 ${h - inset})`}>
            <EdgeJewel fill={g} />
          </g>
        </>
      )}
    </svg>
  )
}


// A picture of one choice for the editor's option chips: the design's ground, frame and art as that choice draws
// them, no words. view is the part of the 540x960 card to show [x, y, w, h], so a pattern or a frame corner is
// zoomed in far enough to read.
export function Thumb({ d, style, w, view = [0, 0, 540, 960] }: { d: Design; style: Partial<CardStyle>; w: number; view?: [number, number, number, number] }) {
  const x = styled(d, style).d
  const k = w / view[2]
  return (
    <div aria-hidden style={{ width: w, height: view[3] * k, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: 540, height: 960, position: 'absolute', left: -view[0] * k, top: -view[1] * k, transform: `scale(${k})`, transformOrigin: 'top left', background: x.sky }}>
        {x.Overlay && <x.Overlay h={960} />}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
          <x.Top />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 340 }}>
          <x.Bottom />
        </div>
      </div>
    </div>
  )
}
