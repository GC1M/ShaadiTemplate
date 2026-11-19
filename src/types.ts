// Single serializable source of truth for an invite. Persisted to localStorage today;
// the same JSON is intended to power a hosted couple microsite in Phase 2.

export const LANG_IDS = ['en', 'hi', 'mr', 'gu', 'pa', 'ta'] as const
export type Lang = (typeof LANG_IDS)[number]

export const SYMBOL_IDS = ['ganesha', 'radha-krishna', 'shiva', 'balaji', 'gel-mataji', 'khodiyar', 'bahuchar', 'butbhavani', 'swaminarayan', 'mahalakshmi', 'chamunda', 'brahmani', 'mahakali', 'umiya', 'shrinathji', 'ranchhodrai', 'ashapura', 'ram-sita', 'ek-onkar', 'bismillah', 'jain', 'christian', 'floral'] as const
export type SymbolId = (typeof SYMBOL_IDS)[number]

export const EVENT_IDS = ['save-the-date', 'ring', 'haldi', 'mehendi', 'sangeet', 'wedding', 'reception', 'baby-shower'] as const
export type EventType = (typeof EVENT_IDS)[number]

export type Format = 'story' | 'print' // 9:16 phone image, 5:7 print card
export type FontScale = 's' | 'm' | 'l'

// Text fields use "\n" for line breaks and *word* to set a word in the accent colour.
export interface CoverPage {
  id: string
  kind: 'cover'
  invocation: string // || Shri Ganeshaya Namah ||
  shlok: string
  title: string // Shubh Vivah, Haldi Ceremony...
  hostLine: string
  bride: { name: string; parents: string }
  groom: { name: string; parents: string }
  joiner: string // word between the names
  date: string
  time: string
  venue: string
  address: string
  rsvpTitle: string
  rsvp: string
}

export interface Section {
  heading: string
  body: string // more than 6 lines are laid out in two columns
  size?: number // text size of this block, set by a template's own sample (1 = the design's body size)
}

export interface SectionsPage {
  id: string
  kind: 'sections'
  title: string
  sections: Section[]
}

export type Page = CoverPage | SectionsPage

export interface Invite {
  version: 2
  templateId: string
  lang: Lang
  format: Format
  scale: FontScale
  pages: Page[]
  // Photo windows, by the index of the design page they belong to: the couple's own photo (src, a JPEG data URL;
  // none means the sample) and the part of it shown in the frame.
  photos?: Record<number, Photo>
  // A small "shaaditemplate.com" line at the foot of each page, in the editor and every download. On
  // unless the family unticks it (false).
  credit?: boolean
  // A QR code on the last page pointing at this link (the couple's wedding website or one function's link). Off when
  // undefined; '' while the family has ticked it but not typed the link yet.
  qr?: string
}

// x, y: object-position in % (which part of the photo the frame shows); zoom: 1 fills the frame, up to 3.
export interface Photo {
  src?: string
  x: number
  y: number
  zoom: number
}

// Everything a template needs to pre-fill itself in one language. One file per language in src/samples/.
export interface SampleText {
  invocation: Record<SymbolId, string>
  shlok: string // Ganesha shlok, shown on Ganesha templates only
  titles: Record<EventType, string>
  hostLine: Record<EventType, string>
  bride: [name: string, parents: string]
  groom: [name: string, parents: string]
  joiner: string
  date: Record<EventType, string>
  time: Record<EventType, string>
  venue: string
  address: string
  rsvpTitle: string
  rsvp: string
  // Extra pages of a full wedding set (kankotri). Sections are [heading, body].
  functions: { title: string; sections: [string, string][] }
  ceremonies: { title: string; sections: [string, string][] }
  letter: { title: string; body: string }
  family: { title: string; sections: [string, string][] }
  message: { title: string; body: string }
}
