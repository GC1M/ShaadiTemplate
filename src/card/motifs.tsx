// Shared SVG kit for card backdrops. Everything is drawn on a 540-wide grid and scaled by the
// caller, so one motif serves both the 9:16 phone card and the 5:7 print card.
import type { ReactNode } from 'react'
import type { SymbolId } from '../types'


/* ---------------- small pieces ---------------- */

export function Flower({ x, y, r, n = 6, fill, center }: { x: number; y: number; r: number; n?: number; fill: string; center: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx={r * 0.55} cy="0" rx={r * 0.55} ry={r * 0.3} fill={fill} transform={`rotate(${(360 / n) * i})`} />
      ))}
      <circle r={r * 0.24} fill={center} />
    </g>
  )
}

export function Marigold({ x, y, r, dark = '#d35400', light = '#f39c12' }: { x: number; y: number; r: number; dark?: string; light?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={dark} />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={r * 0.55} cy="0" r={r * 0.42} fill={light} transform={`rotate(${i * 36})`} />
      ))}
      <circle r={r * 0.4} fill={dark} />
    </g>
  )
}


export function LotusBloom({ x, y, s = 1, petal = '#f4a7b9', deep = '#c2185b' }: { x: number; y: number; s?: number; petal?: string; deep?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-62, -32, 0, 32, 62].map((a) => (
        <ellipse key={a} cy="-17" rx="6.5" ry="17" fill={petal} stroke={deep} strokeWidth="0.7" opacity="0.8" transform={`rotate(${a})`} />
      ))}
      {[-38, -12, 12, 38].map((a) => (
        <ellipse key={a} cy="-13" rx="6" ry="13" fill={petal} stroke={deep} strokeWidth="0.8" transform={`rotate(${a})`} />
      ))}
      <ellipse cy="-12" rx="5" ry="13" fill={deep} opacity="0.85" />
    </g>
  )
}


/* ---------------- top decor ---------------- */







/* ---------------- bottom scenes (540 x 340 grid, anchored to the card's bottom) ---------------- */



// Nagara temple: curvilinear shikhara with amalaka and flag, plus a small mandapa.
export function Temple({ x = 400, y = 270, s = 1, stone = '#d9a35b', line = '#9a6a2c' }: { x?: number; y?: number; s?: number; stone?: string; line?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-60 0 L-60 -40 Q-60 -150 -8 -190 L8 -190 Q60 -150 60 -40 L60 0 Z" fill={stone} stroke={line} strokeWidth="1.5" />
      {[-40, -80, -120, -155].map((yy, i) => (
        <path key={yy} d={`M${-55 + i * 9} ${yy} Q0 ${yy - 8} ${55 - i * 9} ${yy}`} stroke={line} strokeWidth="1.2" fill="none" />
      ))}
      <line x1="0" y1="-185" x2="0" y2="-10" stroke={line} strokeWidth="1" />
      <ellipse cx="0" cy="-194" rx="12" ry="5" fill={stone} stroke={line} strokeWidth="1.2" />
      <path d="M0 -199 L0 -232" stroke={line} strokeWidth="1.6" />
      <path d="M0 -232 L24 -224 L0 -216 Z" fill="#e2552d" />
      <path d="M-150 0 L-150 -50 Q-120 -95 -90 -50 L-90 0 Z M-95 0 L-95 -40 Q-75 -80 -55 -40 L-55 0 Z" fill={stone} stroke={line} strokeWidth="1.2" />
      <rect x="-150" y="-12" width="210" height="12" fill={line} opacity="0.5" />
    </g>
  )
}




// Udaipur-style palace skyline: chhatris and domes.
export function Palace({ fill, line, y = 260 }: { fill: string; line: string; y?: number }) {
  const chhatri = (x: number, s: number) => (
    <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-26" y="-60" width="52" height="60" fill={fill} stroke={line} strokeWidth="1.2" />
      {[-16, 0, 16].map((xx) => (
        <path key={xx} d={`M${xx - 6} 0 L${xx - 6} -30 Q${xx} -40 ${xx + 6} -30 L${xx + 6} 0`} fill={line} opacity="0.35" />
      ))}
      <path d="M-30 -60 L30 -60 L24 -68 L-24 -68 Z" fill={fill} stroke={line} strokeWidth="1.2" />
      <path d="M-20 -68 Q0 -110 20 -68 Z" fill={fill} stroke={line} strokeWidth="1.2" />
      <path d="M0 -100 L0 -114" stroke={line} strokeWidth="1.5" />
      <circle cy="-116" r="2.5" fill={line} />
    </g>
  )
  return (
    <g>
      <rect x="20" y={y - 40} width="500" height="40" fill={fill} stroke={line} strokeWidth="1.2" />
      {Array.from({ length: 20 }, (_, i) => (
        <path key={i} d={`M${34 + i * 24} ${y} L${34 + i * 24} ${y - 22} Q${40 + i * 24} ${y - 30} ${46 + i * 24} ${y - 22} L${46 + i * 24} ${y}`} fill={line} opacity="0.3" />
      ))}
      {[80, 170, 270, 370, 460].map((x, i) => chhatri(x, i === 2 ? 1.25 : 0.95))}
    </g>
  )
}



// Wedding mandap: four pillars, a draped canopy and kalash on top.
export function Mandap({ fill, line, cloth, y = 300 }: { fill: string; line: string; cloth: string; y?: number }) {
  return (
    <g>
      {[150, 210, 330, 390].map((x) => (
        <g key={x}>
          <rect x={x - 6} y={y - 150} width="12" height="150" fill={fill} stroke={line} strokeWidth="1.2" />
          {[0.25, 0.5, 0.75].map((t) => (
            <rect key={t} x={x - 8} y={y - 150 + 150 * t} width="16" height="5" fill={line} />
          ))}
        </g>
      ))}
      <path d={`M130 ${y - 150} L410 ${y - 150} L380 ${y - 190} L160 ${y - 190} Z`} fill={cloth} stroke={line} strokeWidth="1.2" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${140 + i * 35} ${y - 150} q17.5 18 35 0`} fill={cloth} stroke={line} strokeWidth="1" />
      ))}
      <path d={`M240 ${y - 190} Q270 ${y - 236} 300 ${y - 190} Z`} fill={fill} stroke={line} strokeWidth="1.2" />
      <circle cx="270" cy={y - 232} r="8" fill={line} />
      <path d={`M190 ${y} L350 ${y} L340 ${y - 14} L200 ${y - 14} Z`} fill={line} opacity="0.6" />
    </g>
  )
}

export function Diya({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-16 0 Q0 16 16 0 Z" fill="#c0702a" stroke="#7a3f12" strokeWidth="1" />
      <ellipse cy="-8" rx="4" ry="9" fill="#ff9f1c" />
      <ellipse cy="-5" rx="2" ry="5" fill="#ffe08a" />
    </g>
  )
}

export function PeacockFeather({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 L0 -110" stroke="#6b8f3a" strokeWidth="1.6" />
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i}>
          <path d={`M0 ${-30 - i * 5} L${-14 + i * 0.4} ${-44 - i * 5}`} stroke="#4f9a5a" strokeWidth="0.9" />
          <path d={`M0 ${-30 - i * 5} L${14 - i * 0.4} ${-44 - i * 5}`} stroke="#4f9a5a" strokeWidth="0.9" />
        </g>
      ))}
      <ellipse cy="-108" rx="17" ry="22" fill="#2e8b57" />
      <ellipse cy="-106" rx="12" ry="16" fill="#d4af37" />
      <ellipse cy="-104" rx="8" ry="11" fill="#1f5fa8" />
      <ellipse cy="-102" rx="4" ry="6" fill="#0b2545" />
    </g>
  )
}

/* ---------------- sacred emblems (drawn in a 100x100 box) ---------------- */

export function Emblem({ symbol, color, accent, size }: { symbol: SymbolId; color: string; accent: string; size: number | string }) {
  const ring = (
    <>
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="1.6" fill="none" />
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse key={i} cx="50" cy="9" rx="3" ry="6" fill={accent} opacity="0.85" transform={`rotate(${i * 22.5} 50 50)`} />
      ))}
    </>
  )
  let inner: ReactNode
  if (symbol === 'ganesha')
    inner = (
      <text x="50" y="66" textAnchor="middle" fontSize="46" fill={color} style={{ fontFamily: '"Tiro Devanagari Hindi", serif' }}>
        ॐ
      </text>
    )
  else if (symbol === 'ek-onkar')
    inner = (
      <text x="50" y="68" textAnchor="middle" fontSize="48" fill={color} style={{ fontFamily: '"Tiro Gurmukhi", serif' }}>
        ੴ
      </text>
    )
  else if (symbol === 'radha-krishna')
    inner = (
      <g>
        <g transform="rotate(-28 50 50)">
          <rect x="16" y="47" width="68" height="6" rx="3" fill={color} />
          {[30, 40, 50, 60].map((x) => (
            <circle key={x} cx={x} cy="50" r="1.4" fill={accent} />
          ))}
        </g>
        <g transform="translate(58 82) rotate(18) scale(0.55)">
          <PeacockFeather x={0} y={0} />
        </g>
      </g>
    )
  else if (symbol === 'shiva')
    inner = (
      <g>
        {/* Trishul with a damaru tied below the prongs */}
        <rect x="48" y="30" width="4" height="56" rx="2" fill={color} />
        <path d="M50 14 L54 30 L46 30 Z M34 24 Q34 40 48 42 L48 38 Q38 36 38 24 Z M66 24 Q66 40 52 42 L52 38 Q62 36 62 24 Z" fill={color} />
        <path d="M40 48 L60 48 L52 55 L60 62 L40 62 L48 55 Z" fill={accent} />
      </g>
    )
  else if (symbol === 'balaji')
    inner = (
      <g>
        {/* Namam: white U with a red centre line, between conch and discus */}
        <path d="M38 30 L38 62 Q50 76 62 62 L62 30 L56 30 L56 60 Q50 66 44 60 L44 30 Z" fill="#fffaf0" stroke={color} strokeWidth="1.2" />
        <rect x="48" y="34" width="4" height="30" rx="2" fill="#d32f2f" />
        <g transform="translate(22 46)">
          <circle r="9" fill="none" stroke={color} strokeWidth="2" />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="0" y1="0" x2="9" y2="0" stroke={color} strokeWidth="1.2" transform={`rotate(${i * 45})`} />
          ))}
        </g>
        <path d="M78 38 C 86 40 88 50 82 56 C 78 60 72 58 72 52 C 72 46 76 44 78 38 Z" fill={color} />
      </g>
    )
  else if (symbol === 'gel-mataji')
    inner = (
      <g>
        {/* Mataji's shrine with a red dhaja flying from the kalash */}
        <path d="M32 66 Q36 46 50 36 Q64 46 68 66 Z" fill={color} />
        <rect x="28" y="66" width="44" height="16" rx="1.5" fill={color} />
        <path d="M44 82 L44 74 Q50 68 56 74 L56 82 Z" fill={accent} />
        <circle cx="50" cy="34" r="3" fill={accent} />
        <rect x="49" y="14" width="2" height="20" fill={color} />
        <path d="M51 14 L72 19 L51 25 Z" fill="#d32f2f" />
      </g>
    )
  else if (symbol === 'khodiyar')
    inner = (
      <g>
        {/* Khodiyar Maa's trishul over her mount, the crocodile (magar) */}
        <rect x="48.5" y="26" width="3" height="40" rx="1.5" fill={color} />
        <path d="M50 12 L53 26 L47 26 Z M38 18 Q38 32 48 33 L48 30 Q41 29 41 18 Z M62 18 Q62 32 52 33 L52 30 Q59 29 59 18 Z" fill={color} />
        <path d="M18 74 Q22 66 34 66 L70 66 Q80 66 86 72 L74 72 L72 76 Q60 80 40 78 L30 82 L32 77 Q22 78 18 74 Z" fill={color} />
        <circle cx="76" cy="69" r="1.4" fill={accent} />
        {[40, 50, 60].map((x) => (
          <path key={x} d={`M${x} 66 l3 -4 l3 4 Z`} fill={accent} />
        ))}
      </g>
    )
  else if (symbol === 'bahuchar')
    inner = (
      <g>
        {/* Bahuchar Maa's mount, the rooster, under a red chundadi canopy */}
        <path d="M24 30 Q50 14 76 30 Z" fill="#d32f2f" />
        <path d="M44 40 Q48 34 52 38 Q56 34 56 42 Q62 46 60 52 L66 50 Q78 40 80 56 Q76 50 72 58 Q78 56 76 64 Q68 74 54 74 Q38 74 36 62 Q34 52 44 48 L38 46 Q40 42 44 44 Z" fill={color} />
        <path d="M46 36 Q48 30 52 34 Q54 30 56 36" fill="#d32f2f" />
        <circle cx="47" cy="45" r="1.4" fill={accent} />
        <path d="M48 74 L46 84 M56 74 L58 84" stroke={color} strokeWidth="2" />
      </g>
    )
  else if (symbol === 'butbhavani')
    inner = (
      <g>
        {/* Mataji's three-peaked mukut over a lamp */}
        <path d="M28 58 L28 36 L38 46 L50 26 L62 46 L72 36 L72 58 Z" fill={color} />
        <rect x="26" y="58" width="48" height="6" rx="2" fill={accent} />
        {[38, 50, 62].map((x) => (
          <circle key={x} cx={x} cy="52" r="2.4" fill={accent} />
        ))}
        <path d="M40 74 Q50 84 60 74 Z" fill={color} />
        <path d="M50 74 Q46 68 50 62 Q54 68 50 74 Z" fill="#e8892b" />
      </g>
    )
  else if (symbol === 'swaminarayan')
    inner = (
      <g>
        {/* Tilak-chandlo: saffron U-shaped tilak with a round red chandlo */}
        <path d="M36 20 L36 58 Q50 82 64 58 L64 20 L57 20 L57 56 Q50 68 43 56 L43 20 Z" fill={accent} stroke={color} strokeWidth="1.4" />
        <circle cx="50" cy="48" r="7" fill="#d32f2f" stroke={color} strokeWidth="1" />
      </g>
    )
  else if (symbol === 'mahalakshmi')
    inner = (
      <g>
        {/* Lakshmi's lotus with gold coins falling into it */}
        <LotusBloom x={50} y={74} s={1} petal={accent} deep={color} />
        {[
          [36, 30],
          [50, 22],
          [64, 30],
          [50, 40],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={accent} stroke={color} strokeWidth="1.4" />
        ))}
      </g>
    )
  else if (symbol === 'chamunda')
    inner = (
      <g>
        {/* Chamunda Maa's shrine on Chotila hill, with her red dhaja */}
        <path d="M14 82 Q34 54 50 50 Q66 54 86 82 Z" fill={color} />
        <rect x="42" y="38" width="16" height="14" fill={accent} />
        <path d="M40 38 L50 28 L60 38 Z" fill={accent} />
        <rect x="49" y="12" width="2" height="18" fill={color} />
        <path d="M51 12 L68 16 L51 21 Z" fill="#d32f2f" />
      </g>
    )
  else if (symbol === 'brahmani')
    inner = (
      <g>
        {/* Brahmani Mataji's mount, the hamsa (swan) */}
        <path d="M26 66 Q30 80 52 80 Q76 80 80 62 Q66 70 56 66 Q50 62 54 50 Q58 38 50 30 Q42 24 36 32 L28 32 L36 36 Q44 34 46 42 Q48 50 42 58 Q34 66 26 66 Z" fill={color} />
        <path d="M58 64 Q66 56 76 58 Q70 66 58 64 Z" fill={accent} />
        <circle cx="40" cy="32" r="1.6" fill={accent} />
      </g>
    )
  else if (symbol === 'mahakali')
    inner = (
      <g>
        {/* Mahakali's khadga (curved sword) with a flame above */}
        <path d="M46 84 L54 84 L54 74 L46 74 Z" fill={color} />
        <rect x="40" y="70" width="20" height="4" rx="2" fill={accent} />
        <path d="M47 70 Q40 50 50 26 Q62 48 53 70 Z" fill={color} />
        <path d="M50 22 Q44 16 50 8 Q56 16 50 22 Z" fill="#e8892b" />
      </g>
    )
  else if (symbol === 'umiya')
    inner = (
      <g>
        {/* Umiya Mataji's temple shikhar with a saffron flag */}
        <path d="M30 80 L30 58 Q34 34 50 24 Q66 34 70 58 L70 80 Z" fill={color} />
        <path d="M44 80 L44 68 Q50 60 56 68 L56 80 Z" fill={accent} />
        {[46, 52].map((y) => (
          <line key={y} x1="34" y1={y} x2="66" y2={y} stroke={accent} strokeWidth="1.4" />
        ))}
        <rect x="49" y="8" width="2" height="18" fill={color} />
        <path d="M51 8 L68 13 L51 18 Z" fill="#e8892b" />
      </g>
    )
  else if (symbol === 'shrinathji')
    inner = (
      <g>
        {/* Shrinathji lifting Govardhan hill on his raised left hand */}
        <path d="M18 34 Q34 14 50 18 Q66 14 82 34 Z" fill={color} />
        <rect x="47" y="34" width="6" height="34" rx="3" fill={color} />
        <circle cx="50" cy="35" r="5" fill={accent} />
        <path d="M36 84 Q50 66 64 84 Z" fill={accent} />
      </g>
    )
  else if (symbol === 'ranchhodrai')
    inner = (
      <g>
        {/* Ranchhodraiji of Dakor: the Sudarshan chakra over a red dhaja */}
        <circle cx="50" cy="44" r="18" fill="none" stroke={color} strokeWidth="3" />
        <circle cx="50" cy="44" r="5" fill={accent} />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30} 50 44)`}>
            <line x1="50" y1="44" x2="50" y2="27" stroke={color} strokeWidth="1.4" />
            <path d="M47 26 L50 19 L53 26 Z" fill={accent} />
          </g>
        ))}
        <path d="M30 74 L70 74 L64 84 L36 84 Z" fill="#d32f2f" />
      </g>
    )
  else if (symbol === 'ashapura')
    inner = (
      <g>
        {/* Ashapura Mataji of Mata no Madh: her trishul over a red chunri, with the kumkum dot */}
        <path d="M22 84 Q50 64 78 84 Z" fill="#c62828" />
        <rect x="48.5" y="24" width="3" height="56" fill={color} />
        <path d="M36 22 Q36 40 50 42 Q64 40 64 22 L60 22 Q60 36 50 37 Q40 36 40 22 Z" fill={color} />
        <path d="M47 24 L50 12 L53 24 Z" fill={color} />
        <path d="M34 24 L38 14 L41 24 Z" fill={color} />
        <path d="M59 24 L62 14 L66 24 Z" fill={color} />
        <circle cx="50" cy="52" r="4" fill="#c62828" stroke={accent} strokeWidth="1" />
      </g>
    )
  else if (symbol === 'ram-sita')
    inner = (
      <g>
        {/* Shri Ram's kodanda bow and arrow, with Sita's lotus at its foot */}
        <path d="M34 14 Q70 50 34 86" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="34" y1="14" x2="34" y2="86" stroke={color} strokeWidth="1.2" />
        <line x1="22" y1="50" x2="80" y2="50" stroke={color} strokeWidth="2" />
        <path d="M80 50 L70 45 L70 55 Z" fill={color} />
        <path d="M22 50 L16 45 M22 50 L16 55" stroke={accent} strokeWidth="2" />
        <LotusBloom x={58} y={80} s={0.55} petal={accent} deep={color} />
      </g>
    )
  else if (symbol === 'jain')
    inner = (
      <g>
        {/* Ahimsa hand: raised palm with the dharma wheel */}
        {[36, 44, 52, 60].map((x, i) => (
          <rect key={x} x={x} y={i === 0 || i === 3 ? 26 : 20} width="7" height="30" rx="3.5" fill={color} />
        ))}
        <rect x="24" y="44" width="7" height="22" rx="3.5" fill={color} transform="rotate(-35 27.5 55)" />
        <path d="M34 46 L68 46 L68 70 Q68 84 51 84 Q34 84 34 70 Z" fill={color} />
        <circle cx="51" cy="64" r="9" fill="none" stroke={accent} strokeWidth="2" />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="51" y1="64" x2="51" y2="55" stroke={accent} strokeWidth="1.2" transform={`rotate(${i * 45} 51 64)`} />
        ))}
      </g>
    )
  else if (symbol === 'christian')
    inner = (
      <g>
        <rect x="46" y="18" width="8" height="66" rx="1.5" fill={color} />
        <rect x="30" y="34" width="40" height="8" rx="1.5" fill={color} />
      </g>
    )
  else if (symbol === 'bismillah')
    inner = (
      <g>
        <path d="M62 27 A26 26 0 1 0 62 73 A24 24 0 0 1 62 27 Z" fill={color} />
        <path d="M66 42 L68.5 48 L75 48 L70 52 L72 58 L66 54.5 L60 58 L62 52 L57 48 L63.5 48 Z" fill={accent} />
      </g>
    )
  else
    inner = (
      <g>
        <LotusBloom x={50} y={66} s={1.2} petal={accent} deep={color} />
      </g>
    )
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {ring}
      {inner}
    </svg>
  )
}

// Small ornamental divider used between text groups.
export function Flourish({ color, width = 160 }: { color: string; width?: number | string }) {
  return (
    <svg viewBox="0 0 160 16" width={width} style={{ display: 'block', margin: '0 auto' }}>
      <path d="M2 8 Q30 0 62 8 M98 8 Q130 0 158 8" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M80 1 L87 8 L80 15 L73 8 Z" fill={color} />
      <circle cx="66" cy="8" r="2" fill={color} />
      <circle cx="94" cy="8" r="2" fill={color} />
    </svg>
  )
}
