import type { Section } from '../types'
import type { Design, Ornaments } from './designs'
import type { Template } from '../templates'
import trMarigoldArch from './tr/marigold-arch-mehndi'
import trRaniDamask from './tr/rani-damask-mehndi'
import trEmeraldDamask from './tr/emerald-damask-mehndi'
import trGardenTerrace from './tr/garden-terrace-mehndi'
import trChandelierNight from './tr/chandelier-night-engagement'
import trBlushWatercolour from './tr/blush-watercolour-engagement'

// Four English mehndi cards and two English engagement cards copied from digital cards, built like designs-l: each
// page is the artwork with its words painted out and the words typed back in. Two came from videos: Garden Terrace
// plays like its video in the editor's preview (motion.ts), Blush Watercolour keeps its still frame. The 5:7 mehndi
// cards were made 9:16 by adding plain arch or more of their repeating damask in the middle; the 9:16 cards print
// from the same art with the empty sky or paper band squeezed. Painted lettering (Marigold Arch's
// "Mehndi", Garden Terrace's opening title) is an English cut-out with typed words in other languages.

const BASE = import.meta.env.BASE_URL
type Page = NonNullable<Design['pages']>[number]
// story band top/bottom in 540x960 px, print band on the 540x756 print art, x margins in % of width.
const page = (folder: string, n: number, top: number, bottom: number, x: [number, number], print: [number, number], more: Partial<Page> = {}): Page => ({
  src: `${BASE}templates/${folder}/${n}.jpg`,
  print: { src: `${BASE}templates/${folder}/${n}-print.jpg`, top: print[0], bottom: print[1] },
  top,
  bottom,
  head: 'lang',
  size: 1,
  x,
  ...more,
})
const art = (folder: string, widths: Record<string, number>, english: string[] = []): Ornaments =>
  Object.fromEntries(Object.entries(widths).map(([k, w]) => [k, { src: `${BASE}templates/${folder}/${k}.png`, w, ...(english.includes(k) ? { lang: 'en' as const } : {}) }]))

const None = () => null
const safe = { story: { top: 0, bottom: 0, x: 34 }, print: { top: 0, bottom: 0, x: 28 } }
const look = (id: string, sky: string, text: string, heading: string, fonts: Design['fonts'], accent = heading) => ({
  id,
  sky,
  colors: { title: heading, heading, text, accent, muted: text },
  fonts,
  type: { body: 1, heading: 1, lists: 'left' as const },
  Top: None,
  Bottom: None,
  safe,
})
const montserrat = '"Montserrat", sans-serif'
const caslon = '"Libre Caslon Text", Georgia, serif'
const jost = '"Jost", sans-serif'
const marcellus = '"Marcellus", serif'
const pinyon = '"Pinyon Script", cursive'

export const designs: Design[] = [
  {
    ...look('marigold-arch', '#f8f1e3', '#ffffff', '#f6c350', { title: montserrat, heading: montserrat, body: montserrat, names: '"Allura", cursive' }),
    ornaments: art('marigold-arch', { mehndi: 16.5, divider: 11.8, heart: 1.35, calendar: 1.35, clock: 1.35, pin: 1.1, bar: 0.07 }, ['mehndi']),
    pages: [page('marigold-arch', 1, 128, 281, [18, 18], [128, 281], { gap: 0.6 })],
  },
  {
    ...look('rani-damask', '#46081f', '#fdf1e0', '#fdf1e0', { title: caslon, heading: caslon, body: caslon, names: pinyon }),
    ornaments: art('rani-damask', { bar: 0.06 }),
    pages: [page('rani-damask', 1, 121, 352, [21, 21], [121, 345], { gap: 0.2, print: { src: `${BASE}templates/rani-damask/1-print.jpg`, top: 121, bottom: 345, x: [21, 21] } })],
  },
  {
    ...look('emerald-damask', '#0e3020', '#fbf2e4', '#fbf2e4', { title: caslon, heading: caslon, body: caslon, names: pinyon }),
    ornaments: art('emerald-damask', { bar: 0.06 }),
    pages: [page('emerald-damask', 1, 165, 292, [20, 20], [165, 284], { gap: 0.2 })],
  },
  {
    ...look('garden-terrace', '#dfe9d6', '#1d1d1b', '#1d1d1b', { title: marcellus, heading: marcellus, body: marcellus, names: pinyon }),
    ornaments: art('garden-terrace', { title: 16.4 }, ['title']),
    // Plays like its video in the preview: the couple fades in as the title types, then page 2 opens out of a circle,
    // its words type in line by line and the plants grow up from the bottom.
    pages: [
      page('garden-terrace', 1, 288, 505, [20, 20], [190, 471], { motion: { base: `${BASE}templates/garden-terrace/1-base.jpg`, art: 'fade', rows: [0, 27, 76, 100] } }),
      page('garden-terrace', 2, 160, 358, [23, 23], [160, 346], { gap: 0.6, motion: { base: `${BASE}templates/garden-terrace/2-base.jpg`, art: 'grow', iris: true } }),
    ],
  },
  {
    ...look('chandelier-night', '#2b2638', '#f1e6dc', '#e9cbb0', { title: jost, heading: jost, body: jost, names: pinyon }, '#f47c5a'),
    chip: '#2a1530',
    pages: [page('chandelier-night', 1, 226, 280, [21, 21], [226, 269], { gap: 0.4 })],
  },
  {
    ...look('blush-watercolour', '#f6e6d6', '#4a3d3c', '#4a3d3c', { title: jost, heading: jost, body: jost, names: pinyon }, '#b4524f'),
    chip: '#e2c0b5',
    pages: [page('blush-watercolour', 1, 128, 370, [16, 16], [128, 350], { gap: 0.4 })],
  },
]

const b = (body: string, size?: number): Section => ({ heading: '', body, size })
const mehndi = { lang: 'en', event: 'mehendi' } as const
const engagement = { lang: 'en', event: 'ring' } as const

export const templates: Template[] = [
  {
    id: 'marigold-arch-mehndi',
    name: 'Marigold Arch Mehndi',
    design: 'marigold-arch',
    symbol: 'floral',
    ...mehndi,
    featured: true,
    tr: trMarigoldArch,
    pages: [
      {
        title: 'Mehndi',
        sections: [
          b('^^PLEASE JOIN US^^\n^^FOR A^^', 0.72),
          b('[[mehndi|Mehndi]]'),
          b('^^CELEBRATION^^', 0.95),
          b('[[divider]]'),
          b('IN HONOUR OF', 0.72),
          b('~Usman & Rida~', 3.5),
          b('[[divider]]'),
          b('[[calendar]]//SATURDAY//19 SEP 2026 <> [[bar]] <> [[clock]]//AT//4:00 PM <> [[bar]] <> [[pin]]//123 ANYWHERE//STREET, ANY CITY', 0.74),
          b('^^LET’S CELEBRATE TOGETHER!^^', 0.76),
          b('[[heart]]'),
        ],
      },
    ],
  },
  {
    id: 'rani-damask-mehndi',
    name: 'Rani Damask Mehndi',
    design: 'rani-damask',
    symbol: 'floral',
    ...mehndi,
    featured: true,
    tr: trRaniDamask,
    pages: [
      {
        title: 'Mehndi Ceremony',
        sections: [
          b('You are cordially invited to', 0.72),
          b('~Aisha’s~', 4.8),
          b('~Mehndi~', 3),
          b('~Ceremony~', 4.8),
          b('ON MONDAY <> [[bar]] <> **12th**//JANUARY <> [[bar]] <> AT 8:00 PM', 0.9),
          b('123 Anywhere St., Any City', 0.95),
        ],
      },
    ],
  },
  {
    id: 'emerald-damask-mehndi',
    name: 'Emerald Damask Mehndi',
    design: 'emerald-damask',
    symbol: 'floral',
    ...mehndi,
    tr: trEmeraldDamask,
    pages: [
      {
        title: 'Mehndi Ceremony',
        sections: [
          b('You are invited to', 0.72),
          b('~Aisha’s~', 4.8),
          b('~Mehndi~', 3),
          b('~Ceremony~', 4.8),
          b('MONDAY <> [[bar]] <> **12th**//JANUARY <> [[bar]] <> AT 8:00 PM', 0.9),
          b('123 Anywhere St., Any City', 0.95),
        ],
      },
    ],
  },
  {
    id: 'garden-terrace-mehndi',
    name: 'Garden Terrace Mehndi',
    design: 'garden-terrace',
    symbol: 'floral',
    ...mehndi,
    tr: trGardenTerrace,
    pages: [
      { title: 'Mehndi', sections: [b('[[title|Join us for a **Mehndi** celebration]]')] },
      {
        title: 'Mehndi',
        sections: [
          b('~Maanvita~\n~&~\n~Darsh~', 3.3),
          b('December 25th at 6PM', 1.3),
          b('at', 1.3),
          b('123 Anywhere St., Any\nCity, ST 12345', 1.05),
          b('___________', 0.9),
          b('We can’t wait to celebrate\nwith you!', 1.3),
        ],
      },
    ],
  },
  {
    id: 'chandelier-night-engagement',
    name: 'Chandelier Night Engagement',
    design: 'chandelier-night',
    symbol: 'ganesha',
    ...engagement,
    tr: trChandelierNight,
    pages: [
      {
        title: 'Engagement',
        sections: [
          b('Together with our families, we invite you\nto the joyful engagement ceremony of.', 0.74),
          b('~Shaurya~', 4.7),
          b('AND', 1.1),
          b('~Prasha~', 4.7),
          b('MAY\n{{FRIDAY}} 30 {{AT 12:PM}}\n2055', 1.25),
          b('123 Anywhere St.,\nAny City, ST 12345', 0.74),
          b('Please join us to bless the couple and\ncelebrate their special day.', 0.74),
        ],
      },
    ],
  },
  {
    id: 'blush-watercolour-engagement',
    name: 'Blush Watercolour Engagement',
    design: 'blush-watercolour',
    symbol: 'ganesha',
    ...engagement,
    tr: trBlushWatercolour,
    pages: [
      {
        title: 'Engagement',
        sections: [
          b('Together with our families, we invite you\nto the joyful engagement ceremony of.', 0.82),
          b('~Shaurya~', 4.8),
          b('AND', 1),
          b('~Prasha~', 4.8),
          b('MAY\n{{FRIDAY}} 30 {{AT 12:PM}}\n2027', 1.35),
          b('Please join us to bless the couple and\ncelebrate their special day.', 0.82),
          b('Hare krishn farm', 0.82),
        ],
      },
    ],
  },
]
