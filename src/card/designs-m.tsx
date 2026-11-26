import type { Design } from './designs'
import type { Template } from '../templates'
import { SCRIPT, Scene, Svg } from './designs-h'

// Vice Nights: the printable and phone card that goes with the Vice Nights wedding website
// (public/microsites/vicenights/): a neon beach night, a striped sunset on the horizon and palm silhouettes.

const INK = '#12061a'
// A palm silhouette: a curved trunk from the ground at x and a crown of fronds at its top. lean > 0 bends right.
function Palm({ x, h, lean, s = 1 }: { x: number; h: number; lean: number; s?: number }) {
  const tx = x + lean, ty = 340 - h
  const fronds = [-170, -145, -118, -62, -35, -10, 20, 160].map((a) => {
    const r = (a * Math.PI) / 180, len = 58 * s
    const ex = tx + Math.cos(r) * len, ey = ty + Math.sin(r) * len * 0.55 + 16 * s
    const mx = tx + Math.cos(r) * len * 0.55, my = ty + Math.sin(r) * len * 0.55 - 10 * s
    return `M${tx} ${ty} Q${mx} ${my - 7 * s} ${ex} ${ey} Q${mx} ${my + 6 * s} ${tx} ${ty + 3 * s}Z`
  })
  return (
    <g fill={INK}>
      <path d={`M${x} 340 Q${x + lean * 0.15} ${340 - h * 0.55} ${tx} ${ty}`} stroke={INK} strokeWidth={9 * s} strokeLinecap="round" fill="none" />
      {fronds.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  )
}

const vicenights: Design = {
  id: 'vicenights',
  sky: 'radial-gradient(ellipse at 50% 100%,rgba(255,79,154,.38),transparent 58%),linear-gradient(#1a0b24 0%,#2b1240 62%,#4a1d5c 100%)',
  colors: { title: '#ffc14d', heading: '#ff4f9a', text: '#fff1dc', accent: '#22d1c7', muted: '#e9d3c2', names: '#ff7a4d' },
  fonts: { title: '"Anton"', heading: '"Anton"', body: '"Archivo", sans-serif', names: '"Anton"' },
  script: SCRIPT,
  type: { title: 2.4, names: 2.2 },
  press: '0 0 14px rgba(255,79,154,.35)',
  Top: () => (
    <Svg h={70}>
      <line x1="0" y1="10" x2="540" y2="10" stroke="#22d1c7" strokeWidth="2" />
      <line x1="0" y1="10" x2="540" y2="10" stroke="#22d1c7" strokeWidth="8" opacity=".18" />
      {[[48, 34], [96, 52], [150, 28], [392, 30], [446, 50], [498, 32]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="1.6" fill="#fff1dc" opacity=".8" />
      ))}
    </Svg>
  ),
  Bottom: () => (
    <Scene>
      <defs>
        <linearGradient id="vn-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc14d" />
          <stop offset=".6" stopColor="#ff7a4d" />
          <stop offset="1" stopColor="#ff4f9a" />
        </linearGradient>
        <clipPath id="vn-half">
          <rect x="0" y="0" width="540" height="200" />
        </clipPath>
        <clipPath id="vn-disc">
          <circle cx="270" cy="200" r="92" />
        </clipPath>
      </defs>
      {/* striped sunset, half under the horizon */}
      <g clipPath="url(#vn-half)">
        <circle cx="270" cy="200" r="92" fill="url(#vn-sun)" />
        <g clipPath="url(#vn-disc)">
          {[150, 166, 180, 191].map((y, i) => (
            <rect key={y} x="170" y={y} width="200" height={2 + i * 1.6} fill="#2b1240" />
          ))}
        </g>
      </g>
      {/* skyline across the bay */}
      <path d="M0 200 V184 H22 V170 H40 V188 H66 V160 H84 V176 H110 V192 H140 V180 H160 V196 H380 V182 H398 V166 H414 V186 H440 V158 H458 V174 H486 V190 H508 V172 H526 V186 H540 V200Z" fill="#22113a" />
      {/* water with the sun's reflection */}
      <rect x="0" y="200" width="540" height="140" fill="#1a0b24" />
      {[212, 226, 242, 260, 282].map((y, i) => (
        <rect key={y} x={270 - (70 - i * 12)} y={y} width={(70 - i * 12) * 2} height="2.5" rx="1.2" fill="#ff7a4d" opacity={0.8 - i * 0.13} />
      ))}
      {/* neon horizon */}
      <line x1="0" y1="200" x2="540" y2="200" stroke="#ff4f9a" strokeWidth="10" opacity=".22" />
      <line x1="0" y1="200" x2="540" y2="200" stroke="#ff4f9a" strokeWidth="2" />
      {/* sand and palms */}
      <path d="M0 340 V300 Q140 284 270 300 T540 296 V340Z" fill={INK} />
      <Palm x={34} h={190} lean={28} />
      <Palm x={86} h={140} lean={-18} s={0.8} />
      <Palm x={506} h={196} lean={-30} />
      <Palm x={458} h={132} lean={16} s={0.78} />
    </Scene>
  ),
  safe: { story: { top: 74, bottom: 236, x: 44 }, print: { top: 40, bottom: 204, x: 36 } },
}

export const designs: Design[] = [vicenights]

export const templates: Template[] = [{ id: 'vice-nights', name: 'Vice Nights Neon Beach', design: 'vicenights', lang: 'en', symbol: 'ganesha', event: 'sangeet' }]
