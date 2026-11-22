import { templates as batchD } from './card/designs-d'
import { templates as batchE } from './card/designs-e'
import { templates as batchF } from './card/designs-f'
import { templates as batchG } from './card/designs-g'
import { templates as batchH } from './card/designs-h'
import { templates as batchI } from './card/designs-i'
import { templates as batchJ } from './card/designs-j'
import { SAMPLES } from './i18n'
import type { CoverPage, EventType, Invite, Lang, Page, Section, SampleText, SectionsPage, SymbolId } from './types'

export interface Template {
  id: string
  name: string
  design: string // key in DESIGNS
  lang: Lang
  symbol: SymbolId
  event: EventType
  also?: SymbolId[] // other sacred figures in the artwork, so the symbol filter finds the card under each
  featured?: true // starred: shown first in the gallery with a badge
  // Replaces sample fields when the card is in the template's own language (e.g. a Nikkah couple, a church wedding).
  override?: Partial<Pick<CoverPage, 'title' | 'hostLine' | 'joiner' | 'time' | 'venue' | 'address' | 'rsvp'>> &
    Partial<Pick<SampleText, 'functions' | 'ceremonies' | 'letter' | 'family' | 'message'>> & { bride?: [string, string]; groom?: [string, string] }
  // The printed card's own words, page by page, used as is when the card is in the template's language.
  pages?: { title: string; sections: Section[] }[]
  // The same pages in every other language: the same pages and sections in the same order, only the words change
  // (sizes come from pages). scripts/languages-check.mjs fails CI when a language is missing or its shape differs.
  tr?: Partial<Record<Lang, { title: string; sections: Pick<Section, 'heading' | 'body'>[] }[]>>
}

export const TEMPLATES: Template[] = [...batchD, ...batchE, ...batchF, ...batchG, ...batchH, ...batchI, ...batchJ]

// Designs retired in the luxury restyle, mapped to the nearest live card (same event, then the same god or
// sacred symbol, then language), so a saved draft or an old #template/ link keeps its occasion.
const RETIRED: Record<string, string> = {
  'gulabi-kankotri': 'sandhya-kankotri', // gu/ganesha/wedding to gu/ganesha/wedding
  'royal-udaipur': 'sandhya-kankotri', // en/ganesha/wedding to gu/ganesha/wedding
  'shubh-vivah': 'gota-patti', // hi/ganesha/wedding to hi/ganesha/wedding
  'haldi-sunshine': 'genda-haldi', // en/floral/haldi to en/floral/haldi
  'henna-courtyard': 'mehndi-jaal', // en/floral/mehendi to en/floral/mehendi
  'vrindavan': 'pichhwai-lotus', // hi/radha-krishna/sangeet to hi/radha-krishna/sangeet
  'anand-karaj': 'harmandir-gold-leaf', // pa/ek-onkar/wedding to pa/ek-onkar/wedding
  'kanchipuram': 'korvai-silk', // ta/balaji/wedding to ta/balaji/wedding
  'nikkah-walima': 'pietra-dura-walima', // en/bismillah/reception to en/bismillah/reception
  'mangalashtak': 'patola-sagai', // mr/ganesha/ring to gu/ganesha/ring
  'bandhani': 'choodi-save-the-date', // gu/ganesha/save-the-date to hi/ganesha/save-the-date
  'ivory-monogram': 'deco-black-tie', // en/floral/save-the-date to en/floral/save-the-date
  'nischayathartham': 'kolam-nischayathartham', // ta/balaji/ring to ta/balaji/ring
  'peacock-mehfil': 'mehndi-jaal', // en/floral/mehendi to en/floral/mehendi
  'palace-night': 'aaina-mahal', // hi/ganesha/reception to hi/ganesha/reception
  'mangala-snanam': 'thipka-rangoli', // ta/balaji/haldi to mr/ganesha/haldi
  'monsoon-postcard': 'deco-black-tie', // en/floral/save-the-date to en/floral/save-the-date
  'kite-festival': 'choodi-save-the-date', // gu/ganesha/save-the-date to hi/ganesha/save-the-date
  'calendar-circle': 'choodi-save-the-date', // hi/ganesha/save-the-date to hi/ganesha/save-the-date
  'celestial-moon': 'deco-black-tie', // en/floral/save-the-date to en/floral/save-the-date
  'rose-gold-solitaire': 'patola-sagai', // en/floral/ring to gu/ganesha/ring
  'gol-dhana': 'patola-sagai', // gu/ganesha/ring to gu/ganesha/ring
  'misri-roka': 'kalire-chunni', // pa/ek-onkar/ring to pa/ek-onkar/ring
  'turmeric-splash': 'genda-haldi', // en/floral/haldi to en/floral/haldi
  'haldi-kalash': 'thipka-rangoli', // hi/ganesha/haldi to mr/ganesha/haldi
  'pithi-mirror-work': 'pithi-bandhani', // gu/ganesha/haldi to gu/ganesha/haldi
  'rangoli-haldi': 'thipka-rangoli', // mr/ganesha/haldi to mr/ganesha/haldi
  'mehendi-hands': 'mehndi-jaal', // en/floral/mehendi to en/floral/mehendi
  'jharokha-jaal': 'mehndi-jaal', // hi/floral/mehendi to en/floral/mehendi
  'mayun-night': 'phulkari-bagh', // pa/ek-onkar/mehendi to pa/floral/mehendi
  'bollywood-marquee': 'garbo-navratri', // en/floral/sangeet to gu/ganesha/sangeet
  'garba-raas-night': 'garbo-navratri', // gu/ganesha/sangeet to gu/ganesha/sangeet
  'dhol-jaago': 'garbo-navratri', // pa/ek-onkar/sangeet to gu/ganesha/sangeet
  'qawwali-mehfil': 'pietra-dura-walima', // en/bismillah/sangeet to en/bismillah/reception
  'black-tie-emerald': 'aaina-mahal', // en/floral/reception to hi/ganesha/reception
  'garden-fairy-lights': 'aaina-mahal', // en/floral/reception to hi/ganesha/reception
  'champagne-minimal': 'aaina-mahal', // en/floral/reception to hi/ganesha/reception
  'sheesh-mahal': 'aaina-mahal', // hi/ganesha/reception to hi/ganesha/reception
  'shubho-bibaho': 'sandhya-kankotri', // en/ganesha/wedding to gu/ganesha/wedding
  'kerala-kasavu': 'sandhya-kankotri', // en/floral/wedding to gu/ganesha/wedding
  'pelli-patrika': 'korvai-silk', // en/balaji/wedding to ta/balaji/wedding
  'jain-lagna-patrika': 'jain-kalpasutra', // gu/jain/wedding to gu/jain/wedding
  'white-chapel': 'rose-window-wedding', // en/christian/wedding to en/christian/wedding
  'parsi-lagan': 'sandhya-kankotri', // gu/floral/wedding to gu/ganesha/wedding
  'kashmiri-chinar': 'gota-patti', // hi/ganesha/wedding to hi/ganesha/wedding
}
export const liveId = (id: string) => RETIRED[id] ?? id
export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]

let n = 0
const uid = () => `p${Date.now().toString(36)}${(n++).toString(36)}`

export function sectionsPage(title: string, sections: [string, string][]): SectionsPage {
  return { id: uid(), kind: 'sections', title, sections: sections.map(([heading, body]) => ({ heading, body })) }
}

// Sample pages for a template in a language. Weddings get the full kankotri set; other events are one card.
export function samplePages(t: Template, lang: Lang): Page[] {
  if (t.pages) {
    const words = lang === t.lang ? t.pages : (t.tr?.[lang] ?? t.pages)
    return t.pages.map((p, i) => ({
      id: uid(),
      kind: 'sections',
      title: words[i].title,
      sections: p.sections.map((x, j) => ({ ...x, heading: words[i].sections[j].heading, body: words[i].sections[j].body })),
    }))
  }
  const s = SAMPLES[lang]
  const e = t.event
  const o = lang === t.lang ? (t.override ?? {}) : {}
  const lineage = e === 'wedding' || e === 'ring' || e === 'reception'
  const bride = o.bride ?? s.bride
  const groom = o.groom ?? s.groom
  const cover: CoverPage = {
    id: uid(),
    kind: 'cover',
    invocation: s.invocation[t.symbol],
    shlok: t.symbol === 'ganesha' && e === 'wedding' ? s.shlok : '',
    title: o.title ?? s.titles[e],
    hostLine: o.hostLine ?? s.hostLine[e],
    bride: { name: bride[0], parents: lineage ? bride[1] : '' },
    groom: { name: groom[0], parents: lineage ? groom[1] : '' },
    joiner: o.joiner ?? s.joiner,
    date: s.date[e],
    time: o.time ?? s.time[e],
    venue: e === 'save-the-date' ? '' : (o.venue ?? s.venue),
    address: o.address ?? s.address,
    rsvpTitle: s.rsvpTitle,
    rsvp: o.rsvp ?? s.rsvp,
  }
  if (e !== 'wedding') return [cover]
  const { functions, ceremonies, letter, family, message } = { ...s, ...o }
  return [
    cover,
    sectionsPage(functions.title, functions.sections),
    sectionsPage(ceremonies.title, ceremonies.sections),
    sectionsPage(letter.title, [['', letter.body]]),
    sectionsPage(family.title, family.sections),
    sectionsPage(message.title, [['', message.body]]),
  ]
}

export function newInvite(t: Template, lang: Lang = t.lang): Invite {
  return { version: 2, templateId: t.id, lang, format: 'story', scale: 'm', pages: samplePages(t, lang) }
}

// One draft per design, the one being edited first, so a family can make the haldi, mehendi and wedding cards side by side.
const KEY = 'shaadidraft:drafts:v1'
const OLD_KEY = 'shaadidraft:invite:v2' // the single draft kept before drafts were per design

export function loadDrafts(): Invite[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? [JSON.parse(localStorage.getItem(OLD_KEY) ?? 'null')]
    const seen = new Set<string>()
    return (v as (Invite | null)[])
      .filter((i): i is Invite => i?.version === 2)
      .map((i) => ({ ...i, templateId: liveId(i.templateId) }))
      .filter((i) => !seen.has(i.templateId) && !!seen.add(i.templateId)) // two retired designs can map to one live card
  } catch {
    return [] // corrupt or unavailable storage: start fresh
  }
}

export function saveDrafts(drafts: Invite[]) {
  // Untouched sample cards aren't worth keeping, except the one open now.
  const keep = drafts.filter((d, i) => i === 0 || isEdited(d))
  // Photos make drafts large: when storage is full, drop the least recently opened cards rather than stop saving
  // the one being edited.
  for (let n = keep.length; n > 0; n--) {
    try {
      return localStorage.setItem(KEY, JSON.stringify(keep.slice(0, n)))
    } catch {
      // quota: try with one card fewer; private mode: editing still works, just not persisted
    }
  }
}

// Page ids are random, so they're ignored when comparing text.
export const stripIds = (x: unknown) => JSON.stringify(x, (k, v) => (k === 'id' ? undefined : v))
export const isEdited = (i: Invite) => stripIds(i) !== stripIds(newInvite(templateById(i.templateId), i.lang))

// The text the family typed, kept field by field: anything still equal to the old sample is swapped for the new
// sample, anything they changed (names, venue, phone) stays. Used when a card changes language.
export function keepEdits(pages: Page[], oldSample: Page[], newSample: Page[]): Page[] {
  const swap = (mine: string, was?: string, now?: string) => (mine === was && now !== undefined ? now : mine)
  return pages.map((p, i) => {
    // Pages can be deleted or moved, so find the sample page this one came from by its title, else by position.
    const same = (o?: Page) => o?.kind === p.kind && o.title === p.title
    const j = oldSample.findIndex(same)
    const k = same(oldSample[i]) || j < 0 ? i : j
    const was = oldSample[k]
    const now = newSample[k]
    if (!was || !now || was.kind !== p.kind || now.kind !== p.kind) return p
    if (p.kind === 'cover') {
      const w = was as CoverPage
      const n = now as CoverPage
      const out = { ...p }
      for (const f of ['invocation', 'shlok', 'title', 'hostLine', 'joiner', 'date', 'time', 'venue', 'address', 'rsvpTitle', 'rsvp'] as const) out[f] = swap(p[f], w[f], n[f])
      for (const who of ['bride', 'groom'] as const)
        out[who] = { name: swap(p[who].name, w[who].name, n[who].name), parents: swap(p[who].parents, w[who].parents, n[who].parents) }
      return out
    }
    const w = was as SectionsPage
    const n = now as SectionsPage
    return {
      ...p,
      title: swap(p.title, w.title, n.title),
      sections: p.sections.map((x, s) => ({ ...x, heading: swap(x.heading, w.sections[s]?.heading, n.sections[s]?.heading), body: swap(x.body, w.sections[s]?.body, n.sections[s]?.body) })),
    }
  })
}

// Names, parents, venue and phone the family typed on one card's cover, copied onto another design's cover, so the
// next card of the set starts filled in. Null when there's nothing to carry (designs with their own printed pages
// have no shared fields).
export function carryDetails(from: Invite, to: Invite): Invite | null {
  const was = samplePages(templateById(from.templateId), from.lang)[0]
  const mine = from.pages.find((p) => p.kind === 'cover')
  const [cover, ...rest] = to.pages
  if (was?.kind !== 'cover' || !mine || mine.kind !== 'cover' || cover?.kind !== 'cover') return null
  const out = { ...cover, bride: { ...cover.bride }, groom: { ...cover.groom } }
  let carried = false
  const take = (mineV: string, wasV: string, set: (v: string) => void, slot: string) => {
    // Only what was typed, and only into a slot this design shows (a haldi card has no parents' line).
    if (mineV !== wasV && mineV.trim() && slot) {
      set(mineV)
      carried = true
    }
  }
  for (const who of ['bride', 'groom'] as const) {
    take(mine[who].name, was[who].name, (v) => (out[who].name = v), cover[who].name)
    take(mine[who].parents, was[who].parents, (v) => (out[who].parents = v), cover[who].parents)
  }
  for (const f of ['venue', 'address', 'rsvp'] as const) take(mine[f], was[f], (v) => (out[f] = v), cover[f])
  return carried ? { ...to, pages: [out, ...rest] } : null
}
