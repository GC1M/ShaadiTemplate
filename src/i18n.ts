import { en } from './samples/en'
import { gu } from './samples/gu'
import { hi } from './samples/hi'
import { mr } from './samples/mr'
import { pa } from './samples/pa'
import { ta } from './samples/ta'
import type { EventType, Lang, SampleText, SymbolId } from './types'

export const SAMPLES: Record<Lang, SampleText> = { en, hi, mr, gu, pa, ta }

// `native` labels the language in its own script; `title`/`body` are the card faces for that script.
export const LANGS: Record<Lang, { name: string; native: string; title: string; body: string }> = {
  en: { name: 'English', native: 'English', title: '', body: '' },
  hi: { name: 'Hindi', native: 'हिन्दी', title: '"Amita"', body: '"Tiro Devanagari Hindi"' },
  mr: { name: 'Marathi', native: 'मराठी', title: '"Amita"', body: '"Tiro Devanagari Marathi"' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી', title: '"Farsan"', body: '"Noto Serif Gujarati"' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', title: '"Baloo Paaji 2"', body: '"Tiro Gurmukhi"' },
  ta: { name: 'Tamil', native: 'தமிழ்', title: '"Arima"', body: '"Tiro Tamil"' },
}

export const SYMBOLS: Record<SymbolId, string> = {
  ganesha: 'Lord Ganesha',
  'radha-krishna': 'Radha-Krishna',
  shiva: 'Shiv-Parvati (Mahadev)',
  balaji: 'Tirupati Balaji',
  'gel-mataji': 'Gel Mataji',
  khodiyar: 'Khodiyar Maa',
  bahuchar: 'Bahuchar Maa',
  butbhavani: 'Rajrajeshwari Butbhavani Mataji',
  swaminarayan: 'Swaminarayan',
  mahalakshmi: 'Mahalakshmi Mataji',
  chamunda: 'Chamunda Maa',
  brahmani: 'Brahmani Mataji',
  mahakali: 'Mahakali Maa',
  umiya: 'Umiya Mataji',
  shrinathji: 'Shrinathji',
  ranchhodrai: 'Ranchhodraiji (Dakor)',
  ashapura: 'Ashapura Mataji',
  'ram-sita': 'Shri Ram-Sita',
  'ek-onkar': 'Ek Onkar',
  bismillah: 'Bismillah',
  jain: 'Jain (Ahimsa hand)',
  christian: 'Christian (Cross)',
  floral: 'Floral / no deity',
}

export const EVENTS: Record<EventType, string> = {
  'save-the-date': 'Save the Date',
  ring: 'Engagement (Ring Ceremony)',
  haldi: 'Haldi',
  mehendi: 'Mehendi',
  sangeet: 'Sangeet',
  wedding: 'Wedding (Vivah)',
  reception: 'Reception',
  'baby-shower': 'Baby Shower (Simant)',
}
