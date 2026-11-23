import type { Section } from '../types'
import type { Design, Ornaments } from './designs'
import type { Template } from '../templates'
import { gujarati } from './designs-f'
import trGulabiMamta from './tr/gulabi-mamta-simant'
import trBalGopal from './tr/bal-gopal-simant'
import trKailash from './tr/kailash-simant'
import trMorPankh from './tr/mor-pankh-simant'
import trTeddyBalloon from './tr/teddy-balloon-simant'
import trRangeenMor from './tr/rangeen-mor-simant'
import trHindolo from './tr/hindolo-simant'
import trHaryali from './tr/haryali-simant'

// Eight Gujarati simant (baby shower) cards copied from printed digital cards. The originals came as flat images, so
// each page is the artwork with its words painted out; lettered titles, dividers and small icons the words sat beside
// are lifted out as [[name]] cut-outs, and the words are typed back in Hind Vadodara.

const BASE = import.meta.env.BASE_URL
// Cut-out widths in em at text size 1 (1080px artwork / 36).
const art = (folder: string, widths: Record<string, number>): Ornaments =>
  Object.fromEntries(Object.entries(widths).map(([k, w]) => [k, { src: `${BASE}templates/${folder}/${k}.png`, w }]))
type Page = NonNullable<Design['pages']>[number]
const page = (folder: string, n: number, top: number, bottom: number, more: Partial<Page> = {}): Page => ({
  src: `${BASE}templates/${folder}/${n}.jpg`,
  top,
  bottom,
  head: 'lang',
  size: 1,
  ...more,
})

const kankotri = { title: '"Kankotri Gujarati"', body: '"Kankotri Gujarati"' }
const fonts = { title: 'Georgia, serif', heading: 'Georgia, serif', body: 'Georgia, serif', names: 'Georgia, serif' }
const None = () => null
const safe = { story: { top: 0, bottom: 0, x: 34 }, print: { top: 0, bottom: 0, x: 28 } }
const look = (id: string, sky: string, text: string, heading: string, accent = heading) => ({
  id,
  sky,
  colors: { title: heading, heading, text, accent, muted: text },
  fonts,
  script: { gu: kankotri },
  type: { body: 1, heading: 1, lists: 'left' as const },
  Top: None,
  Bottom: None,
  safe,
})

const designs_: Design[] = [
  { ...look('gulabi-mamta', '#f8e6e6', '#3b4a12', '#8a1426'), pages: [page('gulabi-mamta', 1, 135, 320, { spread: true }), page('gulabi-mamta', 2, 135, 270), page('gulabi-mamta', 3, 135, 360, { spread: true })] },
  {
    ...look('bal-gopal', '#b9cdbf', '#2f4731', '#213223'),
    ornaments: gujarati(art('bal-gopal', { '4-rule': 8.33, '5-thanks': 20 }), ['5-thanks']),
    pages: [
      page('bal-gopal', 1, 325, 505, { x: [32, 32] }),
      page('bal-gopal', 2, 190, 455, { spread: true }),
      page('bal-gopal', 3, 195, 360, { spread: true }),
      page('bal-gopal', 4, 180, 280, { spread: true }),
      page('bal-gopal', 5, 215, 380, { spread: true }),
    ],
  },
  {
    ...look('kailash', '#dfeaf5', '#2e2050', '#0d6b2a'),
    ornaments: gujarati(art('kailash', { '1-title': 15.25 }), ['1-title']),
    pages: [page('kailash', 1, 120, 490, { colors: { heading: '#3c1a5e' }, gap: 2.2 }), page('kailash', 2, 120, 363)],
  },
  {
    ...look('mor-pankh', '#f6ecd6', '#1c2f52', '#3d4f12'),
    ornaments: gujarati(art('mor-pankh', { '1-title': 9.42, '1-flourish': 6.17 }), ['1-title']),
    pages: [page('mor-pankh', 1, 80, 295, { x: [19, 19] }), page('mor-pankh', 2, 42, 428, { x: [25, 25], spread: true })],
  },
  {
    ...look('teddy-balloon', '#eef3ea', '#1f2547', '#7a0f1f'),
    ornaments: art('teddy-balloon', { '2-rule': 5.56 }),
    pages: [page('teddy-balloon', 1, 125, 378, { x: [21, 21], spread: true }), page('teddy-balloon', 2, 105, 170, { x: [16, 17] })],
  },
  {
    ...look('rangeen-mor', '#ecebe8', '#4a4640', '#a1874c'),
    ornaments: gujarati(art('rangeen-mor', { '1-ganesh': 2.83, '1-title': 11.75, '1-girl': 2.97, '1-boy': 3.19, '1-rule': 4.31 }), ['1-title']),
    pages: [page('rangeen-mor', 1, 164, 135, { x: [14, 13], gap: 0.4 })],
  },
  {
    ...look('hindolo', '#8cc3ec', '#1d2b5a', '#8a1c45'),
    ornaments: gujarati(art('hindolo', { '1-title': 14.67, '1-rule': 8.33, '2-title': 14.44, '3-rule': 10.78 }), ['1-title', '2-title']),
    pages: [
      page('hindolo', 1, 370, 363, { x: [22, 28] }),
      page('hindolo', 2, 240, 275, { x: [5, 7] }),
      page('hindolo', 3, 400, 215, { x: [9, 7], spread: true }),
      page('hindolo', 4, 430, 448, { x: [28, 31] }),
    ],
  },
  {
    ...look('haryali', '#f3ecd2', '#4a3f2a', '#a0843f', '#7a0d1d'),
    ornaments: art('haryali', { '1-rule': 5.08 }),
    // cols: the last two blocks sit in the right half, beside the painted mother, as on the printed card.
    pages: [page('haryali', 1, 75, 110, { x: [7, 9], cols: 2, gap: 0.45 })],
  },
]
export const designs: Design[] = designs_

const b = (body: string, size?: number): Section => ({ heading: '', body, size })
// A headed block with a blank heading: an empty column, so the block after it sits in the right half (Haryali).
const gap = (size?: number): Section => ({ heading: ' ', body: ' ', size })
const INV = '|| શ્રી ગણેશાય નમઃ ||'
const simant = { lang: 'gu', event: 'baby-shower' } as const

export const templates: Template[] = [
  {
    id: 'gulabi-mamta-simant',
    name: 'Gulabi Mamta Simant',
    design: 'gulabi-mamta',
    symbol: 'ganesha',
    also: ['radha-krishna', 'mahalakshmi'],
    ...simant,
    featured: true,
    tr: trGulabiMamta,
    pages: [
      {
        title: 'સીમંત સંસ્કાર',
        sections: [
          b(`*${INV}*`, 0.95),
          b('દામ્પત્ય જીવનની મધુર, સુંદર\nઅને સમૃધ્ધ ઘડી એટલે', 1.15),
          b('**માતૃત્વ**', 2.1),
          b('પ્રથમ માતૃત્વ પ્રાપ્તિની ગૌરવવંતી\nશુભ ક્ષણ એટલે', 1.15),
          b('**સીમંત સંસ્કાર**', 2.2),
        ],
      },
      {
        title: 'સીમંત વિધિ',
        sections: [
          b(`*${INV}*`, 0.95),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે\nઅમારા કુળદેવી મહાલક્ષ્મી માતાજીની અસીમ કૃપા અને આશિર્વાદ થી\nઅ.સૌ. રંજનબેન તથા શ્રી માધવલાલ મણીલાલ પટેલના સુપુત્ર', 0.85),
          b('*ચિ. શુભમ નાં ધર્મપત્ની*', 1.35),
          b('*અ.સૌ. હીરલ*', 1.55),
          b('ના સીમંત વિધીનું શુભ મુહૂર્ત વિક્રમ સંવત ૨૦૮૨ ના\nફાગણ સુદ બીજ ને ગુરૂવાર, તા. ૧૯-૦૨-૨૦૨૬ ના\nસવારે ૧૦:૦૦ વાગ્યાથી વૈદિક પરંપરા તથા શાસ્ત્રોક્ત\nરીતે નિર્ધારેલ છે તો આ શુભ પ્રસંગે અમારા પુત્રવધુ ને\nઆશીર્વાદ આપવા પધારી શોભામાં અભિવૃદ્ધિ કરશોજી..', 0.92),
          b('*:: ભોજન સમારંભ ::*\nગુરુવાર, તા. ૧૯-૦૨-૨૦૨૬ ને\nસવારે ૧૦:૪૫ કલાકથી આપના આગમન સુધી', 0.92),
          b('*:: શુભ સ્થળ ::*\nવાંગી રેસ્ટોરન્ટ, શોપ નં. ૬,૭,\nસેલિસ્ટર બિલ્ડિંગ, રાજપથ રંગોલી રોડ,\nબોડકદેવ, અમદાવાદ, ગુજરાત', 0.92),
        ],
      },
      {
        title: 'પટેલ પરિવાર',
        sections: [
          b(`*${INV}*`, 0.95),
          b('*:: નિમંત્રક ::*\nસ્વ. મણીલાલ ઈશ્વરદાસ પટેલ\nશ્રી માધવલાલ મણીલાલ પટેલ\nઅ.સૌ. રંજનબેન માધવલાલ પટેલ\nકુમાર મયંકકુમાર માધવલાલ પટેલ\nમો. ૯૮૭૬૫ ૪૩૨૧૦, ૯૧૨૩૪ ૫૬૭૮૯', 1),
          b('**પટેલ પરિવાર**', 1.9),
          b('આપનું હાર્દિક સ્વાગત કરે છે.', 1.45),
        ],
      },
    ],
  },
  {
    id: 'bal-gopal-simant',
    name: 'Bal Gopal Simant',
    design: 'bal-gopal',
    symbol: 'radha-krishna',
    also: ['chamunda'],
    ...simant,
    tr: trBalGopal,
    pages: [
      { title: 'સીમંત સંસ્કાર', sections: [b('**સીમંત**\n**સંસ્કાર**', 1.5)] },
      {
        title: 'માતૃત્વ',
        sections: [
          b('દામ્પત્ય જીવનની સુંદરતા\nઅને સમૃધ્ધ એવી ઘડી એટલે', 1.3),
          b('**માતૃત્વ**', 1.9),
          b('***ચિ. હર્ષ ના ધર્મપત્ની***', 1.45),
          b('***અ.સૌ. ભુમિ***', 1.45),
        ],
      },
      {
        title: 'સીમંત વિધિ',
        sections: [
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે અમારા કુળદેવી\nશ્રી ચામુંડા માતાજી ની અસીમ કૃપાથી\nઅ.સૌ પુષ્પાબેન તથા શ્રી ચંદ્રકાન્ત શેલત ના સુપુત્ર', 1.1),
          b('***ચિ. હર્ષ***', 1.6),
          b('નાં ધર્મપત્ની', 1.1),
          b('***અ.સૌ. ભુમિ***', 1.6),
          b('ના શ્રીમંત વિધિ નું મુહૂર્ત વિક્રમ સંવત ૨૦૮૧ પોષવદ\nફાગણ વદ, બીજ ને રવિવાર', 1.1),
        ],
      },
      {
        title: 'શુભ મુહૂર્ત',
        sections: [
          b('***શુભ મુહૂર્ત***\n[[4-rule]]\nરવિવાર તા. ૧૬.૦૩.૨૦૨૫ ને\nસવારે ૯:૩૦ કલાકે', 1.25),
          b('***ભોજન સમારંભ***\n[[4-rule]]\nરવિવાર તા. ૧૬.૦૩.૨૦૨૫ ને\nબપોરે ૧૨:૦૦ કલાકે', 1.25),
          b('***શુભ સ્થળ***\n[[4-rule]]\nરમોઢેશ્વરી હોલ,\nમાતરીયા તળાવ ની બાજુ માં,\nલિંક રોડ, ભરૂચ ૩૯૨૦૦૧', 1.25),
        ],
      },
      {
        title: 'આભાર',
        sections: [b('***નિમંત્રક***\n[[4-rule]]\nચંદ્રકાંત ડી શેલત\nમો. ૯૮૭૬૫ ૪૩૨૧૦ . ૯૧૨૩૪ ૫૬૭૮૯', 1.25), b('[[5-thanks|**Thank You**]]')],
      },
    ],
  },
  {
    id: 'kailash-simant',
    name: 'Kailash Wisteria Simant',
    design: 'kailash',
    symbol: 'shiva',
    also: ['ganesha', 'brahmani', 'khodiyar'],
    ...simant,
    tr: trKailash,
    pages: [
      { title: 'સીમંત સંસ્કાર', sections: [b('[[1-title|**સીમંત સંસ્કાર**]]'), b('**અ.સૌ.**\n**હામી**', 1.45)] },
      {
        title: 'સીમંત વિધિ',
        sections: [
          b(`*${INV}*`, 0.8),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે અમારા કુળદેવી\nશ્રી બ્રહ્માણી માતાજી તથા શ્રી ખોડિયાર માતાજીની અસીમ કૃપાથી\nઅ.સૌ સંગીતાબેન તથા શ્રી હિંમતભાઈ પોપટભાઈ મેંદપરા ના સુપુત્ર', 0.8),
          b('**ચિ. અક્ષય ના ધર્મપત્ની**', 0.85),
          b('**અ.સૌ. હામી**', 0.85),
          b('ના લગ્ન સંસ્કારની ફળશ્રુતિ હવે અમારા આંગણે એક નાનકડુ\nબાળ સ્વરૂપ આકાર લઈ રહ્યુ છે. તો આ સીમંત વિધિનું શુભ મુહૂર્ત\nસવંત ૨૦૮૧ વૈશાખ વદ ૧ ને મંગળવાર તા. ૧૩-૦૫-૨૦૨૫ ના શુભદિને\nસવારે ૯:૦૦ કલાકે રાખેલ છે. તો માતૃત્વ તરફ પગલા માંડવા\nઅમારી લાડકવાયી પુત્રવધુને આશિષ આપવા પધારશોજી.', 0.8),
          b('**-: સ્વરુચિ ભોજન :-**\nતા. ૧૩-૦૫-૨૦૨૫ મંગળવાર,\nના સવારે ૧૧:૦૦ કલાકે\nઆપશ્રી સર્વો વ્યક્તિ પધારશોજી.', 0.85),
          b('**-: સ્થળ :-**\nઆમંત્રણ ગાર્ડન રેસ્ટોરન્ટ,\nદુખીયાના દરબાર રોડ, મોટા વરાછા, સુરત.', 0.85),
        ],
      },
    ],
  },
  {
    id: 'mor-pankh-simant',
    name: 'Mor Pankh Simant',
    design: 'mor-pankh',
    symbol: 'radha-krishna',
    also: ['ganesha', 'shrinathji', 'umiya'],
    ...simant,
    tr: trMorPankh,
    pages: [
      {
        title: 'આમંત્રણ',
        sections: [
          b(`${INV}\n|| શ્રીનાથજી બાવા || <> || શ્રી ઉમિયા માં ||`, 0.6),
          b('[[1-title|**આમંત્રણ**]]'),
          b('દાંપત્યજીવન ની સુંદર અને સમૃધ્ધ એવી ઘડી એટલે...', 0.82),
          b('**“માતૃત્વ”**', 0.95),
          b('પ્રથમ માતૃત્વ પ્રાપ્તિની ગૌરવવંતી શુભ ક્ષણ એટલે', 0.82),
          b('**“સીમંત સંસ્કાર”**\n[[1-flourish]]', 0.95),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે અમારા કુળદેવી\nશ્રી શ્રીનાથજી બાવા ની અને ઉમિયા માતાજી ની\nઅસીમ કૃપાથી શ્રી અલ્પાબેન તથા શ્રી શૈલેષભાઈ\nજીવનભાઈ વાછાણી ના સુપુત્ર', 0.82),
          b('***ચિ. આરઝુ ના ધર્મપત્ની***', 0.95),
          b('***અ.સૌ. રોશની***', 1.4),
        ],
      },
      {
        title: 'નિમંત્રક',
        sections: [
          b('**સ્વરુચિ ભોજન**\n[[1-flourish]]\nતા. ૦૪-૦૫-૨૦૨૫ રવિવાર,\nના સાંજે ૬:૩૦ કલાકે\nઆપશ્રી પધારશોજી.', 0.9),
          b('**શુભ સ્થળ**\n[[1-flourish]]\nઅમારા નિવાસ સ્થાને,\nD - ૪૦૪, વેદાંત એલીગેન્સ,\nમોટા વરાછા, તળાવ પાસે, સુરત.', 0.9),
          b('**નિમંત્રક**\n[[1-flourish]]\nશ્રી શૈલેષભાઈ જીવનભાઈ વાછાણી\nશ્રી અલ્પાબેન શૈલેષભાઈ વાછાણી\nશ્રી ખુશી શૈલેષભાઈ વાછાણી\n(૯૮૭૬૫ ૪૩૨૧૦)', 0.9),
        ],
      },
    ],
  },
  {
    id: 'teddy-balloon-simant',
    name: 'Teddy Balloon Simant',
    design: 'teddy-balloon',
    symbol: 'ganesha',
    also: ['brahmani'],
    ...simant,
    tr: trTeddyBalloon,
    pages: [
      {
        title: 'સીમંત સંસ્કાર',
        sections: [b(INV, 0.85), b('<<**સીમંત**\n>>**સંસ્કાર**', 1.7), b('***પટેલ પરિવાર***', 1.2), b('આપનું હાર્દિક સ્વાગત કરે છે.', 1.1)],
      },
      {
        title: 'સીમંત વિધિ',
        sections: [
          b(INV, 0.8),
          b('**સીમંત સંસ્કાર**', 1.2),
          b('સહર્ષ જણાવવાનું કે અમારા કુળદેવી\nશ્રી બ્રહ્માણી માતાજી ની અસીમ કૃપાથી\nદેપળા નિવાસી (હાલ સુરત) અ.સૌ. શોભનાબેન તથા\nશ્રી દીપકભાઈ મનોજભાઈ પટેલ ના સુપુત્ર', 0.85),
          b('*શ્રી. ધૃવિત ના ધર્મપત્ની*', 1.05),
          b('**અ.સૌ. નિધી**', 1),
          b('ના સીમંત વિધિનું શુભ મુહૂર્ત સંવત ૨૦૮૧ ના\nફાગણ સુદ ૪ ને સોમવાર તા. ૦૩-૦૩-૨૦૨૫ ના\nસાંજે ૫:૩૦ કલાકે રાખેલ છે તો આ શુભ પ્રસંગે\nઅમારી પુત્રવધૂ આશિર્વાદ આપવા પધારશો.', 0.85),
          b('[[2-rule]]\n*:: ભોજન સમારંભ ::*\nસાંજે ૫:૦૦ કલાકે\nઆપશ્રી ........... વ્યક્તિ પધારશો.', 0.85),
          b('[[2-rule]]\n*:: શુભ સ્થળ ::*\nગોકુલ ફાર્મ,\nપી.પી. સવાણી સ્કૂલની સામે,\nઅબ્રામા રોડ, મોટાવરાછા, સુરત.', 0.85),
        ],
      },
    ],
  },
  {
    id: 'rangeen-mor-simant',
    name: 'Rangeen Mor Simant',
    design: 'rangeen-mor',
    symbol: 'ganesha',
    also: ['ranchhodrai'],
    ...simant,
    tr: trRangeenMor,
    pages: [
      {
        title: 'સીમંત સંસ્કાર',
        sections: [
          b(`*${INV}*`, 0.6),
          b('[[1-ganesh]]'),
          b('[[1-title|**સીમંત સંસ્કાર**]]'),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે\nભગવાન શ્રી રણછોડરાયની અસીમ કૃપાથી\nઅ.સૌ. નિકીતાબેન તથા શ્રી દિલીપભાઈ પટેલ ના સુપુત્ર', 0.62),
          b('*ચિ. ધવલ ના ધર્મપત્ની*\n[[1-girl]] **અ.સૌ. પ્રિન્સુ** [[1-boy]]', 0.8),
          b('નુ સીમંત વિધીનું શુભ મુહૂર્ત સંવત ૨૦૮૦ ના વૈશાખ વદ પાંચમ ને\nમંગળવાર, તા. ૨૮-૦૫-૨૦૨૪ ના શુભદિને સવારે ૧૦:૦૦ કલાકે રાખેલ છે.\nતો આ શુભ પ્રસંગે આપશ્રી સહપરિવાર આશીર્વાદ પાઠવવા પધારશોજી.', 0.62),
          b('[[1-rule]]\n**ભોજન સમારંભ**\nસવારે ૧૨:૦૦ કલાકે\n[[1-rule]]', 0.62),
          b('**શુભ સ્થળ**\n"Grand Darshan" તરસાલી બાયપાસ,\nNHP 48 કપુરાઈ અને તરસાલી બ્રિજની વચ્ચે, વડોદરા.\n[[1-rule]]', 0.62),
          b('**નિમંત્રક**', 0.62),
          b(
            'શ્રી ઘનશ્યામભાઈ રણછોડભાઈ પટેલ\nશ્રી સુરેશભાઈ ગિરધરભાઈ પટેલ\nશ્રી દિલીપભાઈ રણછોડભાઈ પટેલ\nશ્રી ગિરીશભાઈ ગિરધરભાઈ પટેલ\nશ્રી ગીતાબેન ઘનશ્યામભાઈ પટેલ\nશ્રી કોમલબેન સુરેશભાઈ પટેલ\nશ્રી નિકીતાબેન દિલીપભાઈ પટેલ\nશ્રી કીર્તિકાબેન ગિરીશભાઈ પટેલ',
            0.6,
          ),
        ],
      },
    ],
  },
  {
    id: 'hindolo-simant',
    name: 'Hindolo Simant',
    design: 'hindolo',
    symbol: 'radha-krishna',
    also: ['ganesha', 'khodiyar', 'mahakali'],
    ...simant,
    featured: true,
    tr: trHindolo,
    pages: [
      { title: 'સીમંત સંસ્કાર', sections: [b('[[1-title|**સીમંત સંસ્કાર**]]'), b('[[1-rule]]\n***અ.સૌ. હસ્તી***\n[[1-rule]]', 1.3)] },
      {
        title: 'સીમંત વિધિ',
        sections: [
          b(`${INV}\n|| શ્રી ખોડિયાર માં || <> || શ્રી મહાકાળી માં ||`, 0.72),
          b('[[2-title|**સીમંત સંસ્કાર**]]'),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે અમારા કુળદેવી શ્રી ખોડિયાર માતાજી\nતથા શ્રી મહાકાળી માતાજીની અસીમ કૃપાથી\nઅ.સૌ. મુક્તાબેન તથા શ્રી દિનેશભાઈ ગણેશભાઈ માવાણી ના સુપુત્ર', 0.9),
          b('*ચિ. હર્ષિલ ના ધર્મપત્ની*', 1.05),
          b('***અ.સૌ. હસ્તી***', 1.3),
          b('નુ શ્રીમંત વિધીનું શુભ મુહૂર્ત સંવત ૨૦૮૦ ના મહા વદ ૭ ને\nરવિવાર, તા. ૦૩-૦૩-૨૦૨૪ ના શુભદિને નિર્ધારેલ છે.\nતો આ શુભ પ્રસંગે આપશ્રી આશીર્વાદ પાઠવવા પધારશોજી.', 0.9),
        ],
      },
      {
        title: 'નિમંત્રક',
        sections: [
          b('*સ્વરુચિ ભોજન*\nતા. ૦૩-૦૩-૨૦૨૪ ને રવિવારના રોજ સાંજે ૦૬:૦૦ કલાકે\nઆપશ્રી પધારી શોભામાં અભિવૃદ્ધિ કરશોજી.', 0.98),
          b('*સ્થળ*\nમાધવ ફાર્મ, આનંદ ધારા વી-૩ ની સામે,\nરત્ન દિપ ફાર્મ ની પાછળ, મોટા વરાછા, સુરત.', 0.98),
          b('*નિમંત્રક*\nસ્વ. ગણેશભાઈ કરશનભાઈ માવાણી (મો. ૯૮૭૬૫ ૪૩૨૧૦)\nશ્રી દિનેશભાઈ ગણેશભાઈ માવાણી (મો. ૯૧૨૩૪ ૫૬૭૮૯)', 0.98),
          b('૧૭, સૌરાષ્ટ્ર બંગ્લોઝ, મહારાજ ફાર્મ પાસે, મોટાવરાછા, સુરત.\n[[3-rule]]', 0.98),
        ],
      },
      { title: 'જય શ્રી ક્રિષ્ના', sections: [b('**માવાણી પરિવારના**\n**જય શ્રી ક્રિષ્ના**', 1)] },
    ],
  },
  {
    id: 'haryali-simant',
    name: 'Haryali Mamta Simant',
    design: 'haryali',
    symbol: 'ganesha',
    also: ['ranchhodrai'],
    ...simant,
    tr: trHaryali,
    pages: [
      {
        title: 'સીમંત સંસ્કાર',
        sections: [
          b(`**${INV}**`, 0.55),
          b('**સીમંત સંસ્કાર**', 1.5),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે\nભગવાન શ્રી રણછોડરાયની અસીમ કૃપાથી\nઅ.સૌ. નિકીતાબેન તથા શ્રી દિલીપભાઈ પટેલ ના સુપુત્ર', 0.85),
          b('*ચિ. ધવલ ના ધર્મપત્ની*', 1.15),
          b('*અ.સૌ. પ્રિન્સુ*', 1.9),
          b('નુ સીમંત વિધીનું શુભ મુહૂર્ત સંવત ૨૦૮૨ ના વૈશાખ વદ પાંચમ ને\nમંગળવાર, તા. ૧૭.૧૧.૨૦૨૬ ના શુભદિને સવારે ૯:૦૦ કલાકે રાખેલ છે.\nતો આ શુભ પ્રસંગે આપશ્રી સહપરિવાર આશીર્વાદ પાઠવવા પધારશોજી.', 0.8),
          gap(0.85),
          { heading: '[[1-rule]]', body: '**ભોજન સમારંભ**\nસવારે ૧૧:૦૦ કલાકે', size: 0.85 },
          gap(0.85),
          { heading: '[[1-rule]]', body: '**શુભ સ્થળ**\n"Grand Darshan"\nતરસાલી બાયપાસ,\nNHP 48 કપુરાઈ અને તરસાલી\nબ્રિજની વચ્ચે, વડોદરા.\n[[1-rule]]', size: 0.85 },
        ],
      },
    ],
  },
]
