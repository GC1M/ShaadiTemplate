import type { Section } from '../types'
import type { Design, Ornaments } from './designs'
import type { Template } from '../templates'
import { gujarati } from './designs-f'
import trGulabiVinti from './tr/gulabi-vinti-chandla'
import trToranKamal from './tr/toran-kamal-chandla'
import trHaritMandap from './tr/harit-mandap-chandla'
import trBaghChhatri from './tr/bagh-chhatri-chandla'
import trNeelSagar from './tr/neel-sagar-chandla'
import trJhoomar from './tr/jhoomar-chandla'
import trKamalSaath from './tr/kamal-saath-chandla'
import trSiyaramToran from './tr/siyaram-toran-chandla'

// Eight Gujarati chandla vidhi (engagement) cards copied from printed digital cards, built like the simant set in
// designs-g: each page is the artwork with its words painted out, rings, dividers and the one lettered title are
// [[name]] cut-outs, and the words are typed back in. Harit Mandap was a 5:7 print card, widened to 9:16 with plain
// paper in its empty middle.

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
const fonts = { title: 'Georgia, serif', heading: 'Georgia, serif', body: 'Georgia, serif', names: '"Great Vibes", cursive' }
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
  {
    ...look('gulabi-vinti', '#fbf3ea', '#6e1f33', '#8b2240'),
    ornaments: art('gulabi-vinti', { '1-ring': 3.28, '1-rule': 5.28 }),
    pages: [page('gulabi-vinti', 1, 112, 130, { x: [9, 9] })],
  },
  { ...look('toran-kamal', '#f3ead8', '#4d2a3c', '#7a2448'), pages: [page('toran-kamal', 1, 108, 300, { x: [18, 18] })] },
  {
    ...look('harit-mandap', '#f7f7f4', '#1f3a1a', '#13301a', '#a8862e'),
    ornaments: art('harit-mandap', { '1-ring': 2.75 }),
    pages: [page('harit-mandap', 1, 86, 262, { x: [14, 14] })],
  },
  {
    ...look('bagh-chhatri', '#e4efe4', '#2f4f3a', '#245446', '#9c7b4f'),
    ornaments: gujarati(art('bagh-chhatri', { '1-title': 10.5, '1-ring': 5.14, '1-rule': 10.08, '2-ring': 3.19, '2-rule': 5.94 }), ['1-title']),
    pages: [
      page('bagh-chhatri', 1, 205, 320, { x: [20, 20], spread: true }),
      page('bagh-chhatri', 2, 186, 130, { x: [13, 9], colors: { heading: '#3f5f22', text: '#3a4a26' } }),
    ],
  },
  {
    ...look('neel-sagar', '#dfe6f0', '#2c4566', '#29446a'),
    ornaments: art('neel-sagar', { '2-ring': 2.06, '2-rule': 8.53 }),
    pages: [page('neel-sagar', 1, 330, 380, { x: [28, 28] }), page('neel-sagar', 2, 125, 236, { x: [9, 9] })],
  },
  {
    ...look('jhoomar', '#d9cfc4', '#3a2f22', '#3d4a1f'),
    ornaments: art('jhoomar', { '2-ring': 3.72 }),
    pages: [page('jhoomar', 1, 270, 500, { x: [28, 28] }), page('jhoomar', 2, 244, 128, { x: [13, 13] })],
  },
  { ...look('kamal-saath', '#f1dcd8', '#5a2a35', '#7a2438'), pages: [page('kamal-saath', 1, 142, 250, { x: [10, 10] })] },
  {
    ...look('siyaram-toran', '#f3e6d0', '#5a3a22', '#5c2e14', '#9b1c24'),
    ornaments: art('siyaram-toran', { '1-ring': 3.28, '3-rule': 7.67 }),
    pages: [
      page('siyaram-toran', 1, 238, 262, { x: [26, 26], spread: true }),
      page('siyaram-toran', 2, 378, 120, { x: [15, 15] }),
      page('siyaram-toran', 3, 378, 94, { x: [18, 18] }),
    ],
  },
]
export const designs: Design[] = designs_

const b = (body: string, size?: number): Section => ({ heading: '', body, size })
const INV = '|| શ્રી ગણેશાય નમઃ ||'
const TITLE = '**ચાંદલા વિધી**'
const PHONES = '૯૮૭૬૫ ૪૩૨૧૦, ૯૧૨૩૪ ૫૬૭૮૯'
const chandla = { lang: 'gu', event: 'ring' } as const

// The groom's family letter, the couple and the bride's family letter shared by Bagh Chhatri and Siyaram Toran.
const beladiya = 'સહર્ષ ખુશાલી સાથે જણાવવાનું કે\nઅમારા કુળદેવી શ્રી બ્રહ્માણી માતાજીની અસીમ કૃપાથી\nમાખણિયા નિવાસી (હાલ સુરત)\nઅ.સૌ. વર્ષાબેન તથા શ્રી ભરતભાઈ ગોપાલભાઈ બેલાડીયા ના સુપુત્ર'
const desai = (date: string, day: string) =>
  `શિવેન્દ્રનગર નિવાસી (હાલ સુરત)\nઅ.સૌ. હંસાબેન તથા શ્રી રમેશભાઈ નરશીભાઈ દેસાઈ ના સુપુત્રી\nસાથે ${day} તા. ${date}\nના શુભ દિવસે સાંજે ૫:૦૦ કલાકે ચાંદલા વિધિ રાખેલ છે.\nતો આ શુભ પ્રસંગે પધારી શોભામાં અભિવૃદ્ધી કરશોજી.`
const meal = (date: string, day: string, rule = '') => `***ભોજન સમારંભ***\n${rule}તા. ${date} ના ${day} ના રોજ\nસાંજે ૫:૦૦ કલાકે\nઆપશ્રી ........ વ્યકિત પધારશોજી.`
const hall = (rule = '') => `***શુભ સ્થળ***\n${rule}શ્રી હરિ કૃષ્ણ હોલ\nપ્રથમ માળ, નિલકંઠ પ્લાઝા,\nસ્ટેશન રોડ, રાજકોટ`
const hosts = (rule = '') => `***નિમંત્રક***\n${rule}ભરતભાઈ ગોપાલભાઈ બેલાડીયા\nગોપાલભાઈ રણછોડભાઈ બેલાડીયા\nઅલ્પેશભાઈ ગોપાલભાઈ બેલાડીયા\n${PHONES}`
// Toran Kamal and Kamal Saath carry the same letter; only the date differs.
const patel = (date: string) => [
  b(`*${INV}*`, 0.85),
  b(TITLE, 1.45),
  b('સ્નેહી સ્વજન ______________________', 0.9),
  b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે અમારા કુળદેવી\nશ્રી આશાપુરા માતાજીની અસીમ કૃપાથી\nઅ.સૌ. શેતલબેન તથા શ્રી પંકજભાઈ પટેલના સુપુત્ર', 0.9),
  b('**ચિ. આર્યન**', 1.25),
  b('સંગ', 0.9),
  b('**ચિ. રુશિતા**', 1.25),
  b('અ.સૌ. દક્ષાબેન તથા શ્રી રાજુભાઈ પટેલની સુપુત્રી સાથે રાખેલ છે.\nતો આ શુભ અવસરે પધારી શોભામાં અભિવૃદ્ધિ કરશોજી', 0.9),
  b(`**${date}**\nસવારે ૧૦:૦૦ કલાકે`, 0.9),
  b('***સ્થળ***\nટેસ્ટી મીલ્સ રેસ્ટોરન્ટ એન્ડ બેન્કવેટ.\nબીજો માળ, સુપ્રિમ સ્કવેર, બાપા સીતારામ ચોક રોડ,\nકૃષ્ણનગર, નવા નરોડા, અમદાવાદ', 0.9),
  b('***નિમંત્રક***\nશ્રી પંકજભાઈ રસિકભાઈ પટેલ\nશ્રી શેતલબેન પંકજભાઈ પટેલ', 0.9),
]

export const templates: Template[] = [
  {
    id: 'gulabi-vinti-chandla',
    name: 'Gulabi Vinti Chandla Vidhi',
    design: 'gulabi-vinti',
    symbol: 'ganesha',
    also: ['brahmani'],
    ...chandla,
    tr: trGulabiVinti,
    pages: [
      {
        title: 'ચાંદલા વિધી',
        sections: [
          b(`*${INV}*`, 0.85),
          b(TITLE, 1.5),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે\nઅમારા કુળદેવી શ્રી બ્રહ્માણી માતાજીની અસીમ કૃપાથી\nજમણવાવ નિવાસી (હાલ સુરત)\nઅ.સૌ. રસીલાબેન તથા શ્રી દેવરાજભાઈ હરિભાઈ ગોળકિયા ની સુપુત્રી', 0.85),
          b('**રુશિતા** [[1-ring]] **આર્યન**', 1.4),
          b('જમણવાવ નિવાસી (હાલ સુરત)\nઅ.સૌ. વનિતાબેન તથા શ્રી વિજયભાઈ મનજીભાઈ જસાણી ના સુપુત્ર\nસાથે સવંત ૨૦૮૩ ના પોષ સુદ ૧૧ ને રવિવાર તા. ૨૦.૧૨.૨૦૨૬\nના શુભ દિવસે સવારે ૮:૦૦ કલાકે ચાંદલા વિધિ રાખેલ છે.\nતો આ શુભ પ્રસંગે પધારી શોભામાં અભિવૃદ્ધી કરશોજી.', 0.85),
          b('***ભોજન સમારંભ***\n[[1-rule]]\nતા. ૨૦.૧૨.૨૦૨૬ ના રવિવાર ના રોજ\nબપોરે ૧૧:૦૦ કલાકે\nઆપશ્રી ........ વ્યકિત પધારશોજી.', 0.85),
          b('***શુભ સ્થળ***\n[[1-rule]]\nજય સિયારામ ફાર્મ\nબાપા સીતારામ ચોક,\nસિમાડા ખચતડ, અવધ ડેરી ની પાછળ,\nસુરત, ગુજરાત ૩૯૫૦૦૬', 0.85),
          b(`***નિમંત્રક***\n[[1-rule]]\nશ્રી દેવરાજભાઈ હરિભાઈ ગોળકિયા\nશ્રી ચિંતનભાઈ દેવરાજભાઈ ગોળકિયા\n${PHONES}`, 0.85),
        ],
      },
    ],
  },
  {
    id: 'toran-kamal-chandla',
    name: 'Toran Kamal Chandla Vidhi',
    design: 'toran-kamal',
    symbol: 'ganesha',
    also: ['ashapura'],
    ...chandla,
    tr: trToranKamal,
    pages: [{ title: 'ચાંદલા વિધી', sections: patel('સોમવાર ૦૮ માર્ચ ૨૦૨૭') }],
  },
  {
    id: 'harit-mandap-chandla',
    name: 'Harit Mandap Chandla Vidhi',
    design: 'harit-mandap',
    symbol: 'ganesha',
    also: ['khodiyar'],
    ...chandla,
    tr: trHaritMandap,
    pages: [
      {
        title: 'ચાંદલા વિધી',
        sections: [
          b(`*${INV}*`, 0.8),
          b(TITLE, 1.5),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે અમારા કુળદેવી\nઆઈશ્રી ખોડિયાર માતાજીની\nઅસીમ કૃપાથી દેવળીયા નિવાસી (હાલ ગારીયાધાર)\nઅ.સૌ. રેખાબેન તથા શ્રી રાજુભાઈ નાગજીભાઈ દેવાણી ની સુપુત્રી', 0.85),
          b('**રુશિતા** [[1-ring]] **આર્યન**', 1.4),
          b('ધામેલ નિવાસી (હાલ સુરત) અ.સૌ. હંસાબેન તથા\nશ્રી હિંમતભાઈ નરશીભાઈ વઘાસીયા ના સુપુત્ર સાથે સવંત ૨૦૭૯ ના\nવૈશાખ સુદ ૧૦ ને રવિવાર તા. ૩૦-૦૪-૨૦૨૩ ના શુભ દિવસે\nસવારે ૮-૩૦ કલાકે ચાંદલા વિધિ રાખેલ છે.\nતો આ શુભ પ્રસંગે પધારી શોભામાં અભિવૃદ્ધી કરશોજી.', 0.85),
          b('***ભોજન સમારંભ***\nતા. ૩૦-૦૪-૨૦૨૩ ના રવિવાર ના રોજ\nબપોરે ૧૧-૦૦ કલાકે\nઆપશ્રી ........ વ્યકિત પધારશોજી.', 0.85),
          b('***મંડપ મુહૂર્ત***\nશ્રી બાબુભાઈ થામજીભાઈ દેવાણી\nશ્રી નરેશભાઈ બાબુભાઈ દેવાણી\nશ્રી હિંમતભાઈ બાબુભાઈ દેવાણી\nશ્રી સુરજભાઈ હિંમતભાઈ દેવાણી', 0.85),
          b('***શુભ સ્થળ***\nહરે ક્રિષ્ના સોસાયટીની વાડી,\nમહારાજા ફાર્મની બાજુમાં,\nડી.માર્ટ. રોડ, મોટા વરાછા, સુરત.\nમો. ૯૮૭૬૫ ૪૩૨૧૦', 0.85),
        ],
      },
    ],
  },
  {
    id: 'bagh-chhatri-chandla',
    name: 'Bagh Chhatri Chandla Vidhi',
    design: 'bagh-chhatri',
    symbol: 'ganesha',
    also: ['brahmani'],
    ...chandla,
    tr: trBaghChhatri,
    pages: [
      {
        title: 'ચાંદલા વિધી',
        sections: [
          b(INV, 0.85),
          b('[[1-title|**ચાંદલા વિધી**]]'),
          b('<<**આર્યન**\n[[1-ring]]\n>>**રુશિતા**', 1.45),
          b('[[1-rule]]\n***રવિવાર, ૨૭-ડિસેમ્બર-૨૦૨૬***\n[[1-rule]]', 0.9),
        ],
      },
      {
        title: 'ચાંદલા વિધી',
        sections: [
          b(INV, 0.85),
          b(TITLE, 1.5),
          b(beladiya, 0.85),
          b('**આર્યન** [[2-ring]] **રુશિતા**', 1.4),
          b(desai('૨૭-૧૨-૨૦૨૬', 'સવંત ૨૦૮૩ ના પોષ સુદ ૮ ને રવિવાર'), 0.85),
          b(meal('૨૭-૧૨-૨૦૨૬', 'રવિવાર', '[[2-rule]]\n'), 0.85),
          b(hall('[[2-rule]]\n'), 0.85),
          b(hosts('[[2-rule]]\n'), 0.85),
        ],
      },
    ],
  },
  {
    id: 'neel-sagar-chandla',
    name: 'Neel Sagar Chandla Vidhi',
    design: 'neel-sagar',
    symbol: 'ganesha',
    also: ['swaminarayan'],
    ...chandla,
    featured: true,
    tr: trNeelSagar,
    pages: [
      { title: 'ચાંદલા વિધી', sections: [b('**રુશિતા**\n&\n**આર્યન**', 1.6), b('૩૦.૦૪.૨૦૨૩', 1.2)] },
      {
        title: 'ચાંદલા વિધી',
        sections: [
          b(INV, 0.8),
          b(TITLE, 1.5),
          b('સ્નેહી સ્વજન\nસહર્ષ ખુશાલી સાથે જણાવવાનું કે\nઅમારા ભગવાન શ્રી સ્વામીનારાયણ અને પ્રગટ ગુરુહરિ મહંત સ્વામી મહારાજ\nની અસીમ કૃપાથી અ.સૌ. ગીતાબેન તથા શ્રી દિનેશભાઈ પટેલની સુપુત્રી', 0.82),
          b('**ચિ. રુશિતા** [[2-ring]] **ચિ. આર્યન**', 1.3),
          b('અ.સૌ. ઈલાબેન તથા શ્રી રાજેશભાઈ બારસના સુપુત્ર\nસાથે રાખેલ છે. આ શુભ પ્રસંગે આપના તન મન અને હ્રદયની\nલાગણી સાથે અંતરના આશિર્વાદ આપવા પધારશોજી.', 0.82),
          b('[[2-rule]]\n***:: ભોજન સમારંભ ::***\nતા. ૩૦-૦૪-૨૦૨૩ ના રવિવાર\nના રોજ બપોરે ૧૧-૦૦ કલાકે\nઆપશ્રી ........ વ્યક્તિ પધારશોજી.', 0.85),
          b('[[2-rule]]\n***:: શુભ સ્થળ ::***\nબાલમંદ હોલ, સરદાર પટેલ\nરીંગ રોડ, શૈલા, અમદાવાદ\nસવારે ૧૦:૩૦ કલાકે', 0.85),
          b('[[2-rule]]\n***:: નિમંત્રક ::***\nદિનેશભાઈ કાહાભાઈ પટેલ\nગીતાબેન દિનેશભાઈ પટેલ', 0.85),
        ],
      },
    ],
  },
  {
    id: 'jhoomar-chandla',
    name: 'Jhoomar Chandla Vidhi',
    design: 'jhoomar',
    symbol: 'ganesha',
    also: ['brahmani'],
    ...chandla,
    tr: trJhoomar,
    pages: [
      { title: 'ચાંદલા વિધી', sections: [b('<<**આર્યન**\n[[2-ring]]\n>>**રુશિતા**', 1.7)] },
      {
        title: 'ચાંદલા વિધી',
        sections: [
          b(INV, 0.8),
          b(TITLE, 1.4),
          b('સહર્ષ ખુશાલી સાથે જણાવવાનું કે\nઅમારા કુળદેવી શ્રી બ્રહ્માણી માતાજીની અસીમ કૃપાથી\nતરવ નિવાસી (હાલ સુરત) અ.સૌ. વર્ષાબેન\nતથા શ્રી ભરતભાઈ ગોપાલભાઈ વિરાણી ના સુપુત્ર', 0.8),
          b('**આર્યન** [[2-ring]] **રુશિતા**', 1.3),
          b('શિવભાદર નિવાસી (હાલ સુરત)\nઅ.સૌ. હંસાબેન તથા શ્રી રમેશભાઈ નરશીભાઈ દેસાઈ ના સુપુત્રી\nસાથે સવંત ૨૦૮૧ ના પોષ વદ ૧૧ ને શનિવાર તા. ૨૫.૦૧.૨૦૨૫\nના શુભ દિવસે સાંજે ૫:૦૦ કલાકે ચાંદલા વિધિ રાખેલ છે.\nતો આ શુભ પ્રસંગે પધારી શોભામાં અભિવૃદ્ધી કરશોજી.', 0.8),
          b('***ભોજન સમારંભ***\nતા. ૨૫.૦૧.૨૦૨૫ ના શનિવાર ના રોજ\nસાંજે ૫:૦૦ કલાકે આપશ્રી ........ વ્યકિત પધારશોજી.', 0.8),
          b('***શુભ સ્થળ***\nપલ ફાર્મ, બાપા સીતારામ ચોક,\nસિલ્વર બિઝનેસ હબની સામે, સીમાડા ગામ, સુરત', 0.8),
          b(`***નિમંત્રક***\nગોપાલભાઈ રણછોડભાઈ વિરાણી\nઅલ્પેશભાઈ ગોપાલભાઈ વિરાણી\n${PHONES}`, 0.8),
        ],
      },
    ],
  },
  {
    id: 'kamal-saath-chandla',
    name: 'Kamal Saath Chandla Vidhi',
    design: 'kamal-saath',
    symbol: 'ganesha',
    also: ['ashapura'],
    ...chandla,
    featured: true,
    tr: trKamalSaath,
    pages: [{ title: 'ચાંદલા વિધી', sections: patel('રવિવાર ૦૮ માર્ચ ૨૦૨૬') }],
  },
  {
    id: 'siyaram-toran-chandla',
    name: 'Siyaram Toran Chandla Vidhi',
    design: 'siyaram-toran',
    symbol: 'ganesha',
    also: ['ram-sita', 'radha-krishna', 'brahmani'],
    ...chandla,
    featured: true,
    tr: trSiyaramToran,
    pages: [
      {
        title: 'ચાંદલા વિધી',
        sections: [b(INV, 0.85), b('**ચાંદલા વિધિ**', 1.7), b('~AR~', 2.6), b('**ચિ. આર્યન**\n[[1-ring]]\n**ચિ. રુશિતા**', 1.4)],
      },
      {
        title: 'ચાંદલા વિધી',
        sections: [
          b(INV, 0.85),
          b(beladiya, 0.9),
          b('**ચિ. આર્યન**\n[[1-ring]]\n**ચિ. રુશિતા**', 1.4),
          b(desai('૨૪-૦૧-૨૦૨૭', 'સવંત ૨૦૮૩ ના પોષ વદ ૨ ને રવિવાર'), 0.9),
        ],
      },
      {
        title: 'ભોજન સમારંભ',
        sections: [b(meal('૨૪-૦૧-૨૦૨૭', 'રવિવાર', '[[3-rule]]\n'), 0.95), b(hall('[[3-rule]]\n'), 0.95), b(hosts('[[3-rule]]\n'), 0.95)],
      },
    ],
  },
]
