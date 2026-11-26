import type { FC } from 'react'
import type { Lang } from '../types'
import { designs as batchD } from './designs-d'
import { designs as batchE } from './designs-e'
import { designs as batchF } from './designs-f'
import { designs as batchG } from './designs-g'
import { designs as batchK } from './designs-k'
import { designs as batchL } from './designs-l'
import { designs as batchM } from './designs-m'
import { designs as batchH } from './designs-h'
import { designs as batchI } from './designs-i'
import { designs as batchJ } from './designs-j'

export interface Design {
  id: string
  sky: string // CSS background of the whole card
  colors: { title: string; heading: string; text: string; accent: string; muted: string; names?: string } // names default to heading
  fonts: { title: string; heading: string; body: string; names: string } // Latin faces
  script?: Partial<Record<Lang, { title: string; body: string }>> // replaces the app-wide face for a script
  tracking?: string // letter-spacing for body text
  // Type sizes in em, where a design departs from the defaults (body .88, heading 1.05, names 1.95, RSVP heading .95).
  type?: { body?: number; heading?: number; names?: number; rsvpHeading?: number; plainDate?: boolean; lists?: 'left' | 'right'; grow?: number; title?: number }
  // Cover pieces a design draws in its own artwork instead (its hero replaces the small emblem and the flourish rule).
  cover?: { emblem?: false; flourish?: false }
  // CSS text-shadow on all text: letterpress on paper, a soft lift on velvet.
  press?: string
  // Cut-outs from the artwork, w in em. couple sits between the names, swirl-l/-r flank the RSVP heading;
  // any of them can be placed in text as [[name]].
  ornaments?: Ornaments
  Top: FC // full-width top decoration, natural height
  Bottom: FC // 540 x 340 scene anchored to the bottom (print crops its sky)
  Overlay?: FC<{ h: number }> // full-card frame, h in 540-wide units
  // Full-bleed 1080x1920 artwork, one per page (cycled), replacing Top/Bottom/Overlay.
  // top/bottom are the text-free band in 540x960 story px; print crops the image to 5:7.
  // head: the image already prints the page title, symbol and invocation, so the card leaves them out.
  // size: starting text size for that page, before shrinking to fit (pages differ in density).
  // head 'lang': the page images carry no title, the template's own sample places its cut-out title in the text,
  // so titles are left out only in that language. colors: this page's ink where it differs (a dark page in a light set).
  // gap: space between text blocks in em (default .55); spread: blocks share out the band's spare height evenly
  // (a print-shaped page stretched to 9:16, whose text was spaced down the whole page). x: left/right text margin in % of width where the page's
  // frame is off-centre. cols: up to this many headed sections share a row. photo: a see-through window in the
  // artwork, [x, y, w, h] in story px, filled with the couple's own photo (or the sample src) under the art; fade: the photo melts into the page at
  // its bottom instead of ending on a hard edge. plain: the same artwork with its painted words (title, invocation) removed,
  // used in every language but the template's own, with its own text band top; the page title is then typed.
  pages?: {
    src: string
    top: number
    bottom: number
    head?: boolean | 'lang'
    size?: number
    colors?: Partial<Design['colors']>
    gap?: number
    spread?: boolean
    x?: [number, number]
    cols?: number
    photo?: { box: [number, number, number, number]; src: string; fade?: boolean }
    plain?: { src: string; top: number }
    // print: the page's own 5:7 artwork (540x756 px) and text band, used whole in the print shape instead of cropping the 9:16 one.
    print?: { src: string; top: number; bottom: number; x?: [number, number]; spread?: boolean; lead?: { box: [number, number, number, number] } }
    // lead: the first section in its own box [x, y, w, h] in story px (a title inside a painted frame), centred and fitted alone.
    lead?: { box: [number, number, number, number] }
  }[]
  // Text safe area in px, per format (story 540x960, print 450x630).
  safe: { story: Box; print: Box }
}
type Box = { top: number; bottom: number; x: number }
// Cut-outs for [[name]] in text, w in em. lang: the cut-out carries words painted in that language, so in any other
// language it is swapped for plain (the same piece without the words, if there is one) and the words typed after the
// | in [[name|words]] are shown instead: over the plain piece, or under or above it (at).
export type Ornament = { src: string; w: number; lang?: Lang; plain?: string; at?: 'below' | 'above' }
export type Ornaments = Record<string, Ornament>

export const DESIGNS: Record<string, Design> = Object.fromEntries(
  [...batchD, ...batchE, ...batchF, ...batchG, ...batchH, ...batchI, ...batchJ, ...batchK, ...batchL, ...batchM].map((d) => [d.id, d]),
)

