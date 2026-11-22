import type { Section } from '../types'
import type { Design } from './designs'
import type { Template } from '../templates'
import { cormorant } from './designs-h'
import trMeadowVows from './tr/meadow-vows-engagement'
import trRoseArch from './tr/rose-arch-engagement'
import trEucalyptusRing from './tr/eucalyptus-ring-engagement'
import trSageScript from './tr/sage-script-engagement'
import trLanternCanopy from './tr/lantern-canopy-engagement'

// Five English engagement cards copied from painted digital cards, built like the chandla set in designs-k: each
// page is the artwork with its words painted out, widened from 5:7 to 9:16 by repeating plain rows, and the words
// are typed back in. Eucalyptus Ring keeps its empty gold frame; its title (the first section) is a lead, fitted into
// the frame on its own.

const BASE = import.meta.env.BASE_URL
type Page = NonNullable<Design['pages']>[number]
// print: the band on the original 5:7 art (540x756 px), so the print shape keeps the whole card, emblem included.
const page = (folder: string, top: number, bottom: number, x: [number, number], print: [number, number], more: Partial<Page> = {}): Page => ({
  src: `${BASE}templates/${folder}/1.jpg`,
  print: { src: `${BASE}templates/${folder}/1-print.jpg`, top: print[0], bottom: print[1] },
  top,
  bottom,
  head: 'lang',
  size: 1,
  x,
  ...more,
})

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
const cinzel = '"Cinzel", Georgia, serif'

export const designs: Design[] = [
  {
    ...look('meadow-vows', '#efe9d6', '#5b5732', '#5b5732', { title: cinzel, heading: cinzel, body: cormorant, names: '"Pinyon Script", cursive' }),
    pages: [page('meadow-vows', 92, 318, [17, 17], [62, 286])],
  },
  {
    ...look('rose-arch', '#fdfaf5', '#86223f', '#86223f', { title: cormorant, heading: cormorant, body: cormorant, names: '"Great Vibes", cursive' }),
    pages: [page('rose-arch', 165, 300, [28, 29], [160, 261])],
  },
  {
    ...look('eucalyptus-ring', '#f7f7f6', '#5e5631', '#5e5631', { title: cormorant, heading: cinzel, body: cormorant, names: '"Pinyon Script", cursive' }),
    pages: [{ ...page('eucalyptus-ring', 352, 245, [16, 16], [300, 231]), lead: { box: [174, 160, 212, 76] }, print: { src: `${BASE}templates/eucalyptus-ring/1-print.jpg`, top: 300, bottom: 231, lead: { box: [174, 149, 212, 76] } } }],
  },
  {
    ...look('sage-script', '#fbfcf8', '#5f7258', '#5f7258', { title: '"Jost", sans-serif', heading: '"Jost", sans-serif', body: '"Jost", sans-serif', names: '"Great Vibes", cursive' }),
    ornaments: { heart: { src: `${BASE}templates/sage-script/heart.png`, w: 0.62 } },
    pages: [page('sage-script', 200, 205, [10, 10], [192, 200])],
  },
  {
    ...look('lantern-canopy', '#f1f3f1', '#3b3a18', '#3b3a18', { title: '"Marcellus", serif', heading: '"Marcellus", serif', body: cormorant, names: '"Marcellus", serif' }),
    pages: [{ ...page('lantern-canopy', 108, 500, [14, 14], [100, 366]), print: { src: `${BASE}templates/lantern-canopy/1-print.jpg`, top: 100, bottom: 366, x: [21, 21], spread: true } }],
  },
]

const b = (body: string, size?: number): Section => ({ heading: '', body, size })
const engagement = { lang: 'en', event: 'ring' } as const

export const templates: Template[] = [
  {
    id: 'meadow-vows-engagement',
    name: 'Meadow Vows Engagement',
    design: 'meadow-vows',
    symbol: 'floral',
    ...engagement,
    featured: true,
    tr: trMeadowVows,
    pages: [
      {
        title: 'Engagement',
        sections: [
          b('***CELEBRATE WITH US AS***\n***WE EXCHANGE RINGS***', 0.68),
          b('~Aryan &~\n~Rushita~', 3.4),
          b('***YOUR COMPANY IS REQUESTED***\n***AT OUR ENGAGEMENT***', 0.68),
          b('**20 | DECEMBER | 2026**', 1.05),
          b('At 4 o’clock in the afternoon\n***Sayaji Garden Lawns***\n14 Lake View Road, Vadodara', 0.85),
        ],
      },
    ],
  },
  {
    id: 'rose-arch-engagement',
    name: 'Rose Arch Engagement',
    design: 'rose-arch',
    symbol: 'floral',
    ...engagement,
    featured: true,
    tr: trRoseArch,
    pages: [
      {
        title: 'Engagement',
        sections: [
          b('Together with our\nfamilies', 0.85),
          b('~Aryan~', 4),
          b('and', 0.8),
          b('~Rushita~', 4),
          b('We cordially invite you to\njoin our engagement on', 0.85),
          b('JANUARY | **17TH** | 2027', 0.85),
          b('6 o’clock in the evening\nThe Rose Pavilion, Pune', 0.8),
        ],
      },
    ],
  },
  {
    id: 'eucalyptus-ring-engagement',
    name: 'Eucalyptus Ring Engagement',
    design: 'eucalyptus-ring',
    symbol: 'floral',
    ...engagement,
    tr: trEucalyptusRing,
    pages: [
      {
        title: 'Engagement',
        sections: [
          b('~Engagement Ceremony~', 1.6),
          b('~Aryan~\n~& Rushita~', 3.2),
          b('**14 | FEBRUARY | 2027**', 1.3),
          b('At 11 o’clock in the morning\n***Shubh Banquets***\nMG Road, Ahmedabad', 1.15),
        ],
      },
    ],
  },
  {
    id: 'sage-script-engagement',
    name: 'Sage Script Engagement',
    design: 'sage-script',
    symbol: 'floral',
    ...engagement,
    tr: trSageScript,
    pages: [
      {
        title: 'Engaged',
        sections: [
          b('~Engaged~ [[heart]]', 5.2),
          b('JOIN US TO CELEBRATE THE\nENGAGEMENT OF', 0.95),
          b('~Aryan + Rushita~', 3.1),
          b('SATURDAY, MARCH 13, 2027 | 7 - 11 PM\nTHE GREEN HOUSE, 21 PARK STREET,\nKOLKATA 700016', 0.85),
          b('RSVP: MEERA 98765 43210', 0.85),
        ],
      },
    ],
  },
  {
    id: 'lantern-canopy-engagement',
    name: 'Lantern Canopy Engagement',
    design: 'lantern-canopy',
    symbol: 'ganesha',
    ...engagement,
    tr: trLanternCanopy,
    pages: [
      {
        title: 'Engagement',
        sections: [
          b('***We warmly invite you to join in the***\n***celebration of their love and***\n***togetherness***', 0.8),
          b('~Aryan & Rushita~', 2.2),
          b('***at 12:30 pm, 22nd May,***\n***2027***', 0.95),
          b('***at***\nHotel Silver Oak,\nC G Road, Ahmedabad', 0.9),
        ],
      },
    ],
  },
]
