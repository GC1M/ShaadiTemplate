import type { Lang } from './types'

// Indian day-first date formats for the card's "Date & day" line.
export const DATE_FORMATS = ['dd/mm/yyyy', 'dd-mm-yyyy', 'dd.mm.yyyy', 'dd month yyyy'] as const
export type DateFormat = (typeof DATE_FORMATS)[number]

// Native digits where the sample text uses them.
const DIGITS: Partial<Record<Lang, string>> = { gu: 'gujr', mr: 'deva' }

// Some browsers ship no Punjabi calendar names (they print "M12", "Wed"), so Punjabi carries its own.
const PA_DAYS = ['ਐਤਵਾਰ', 'ਸੋਮਵਾਰ', 'ਮੰਗਲਵਾਰ', 'ਬੁੱਧਵਾਰ', 'ਵੀਰਵਾਰ', 'ਸ਼ੁੱਕਰਵਾਰ', 'ਸ਼ਨੀਵਾਰ']
const PA_MONTHS = ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ']

// iso: "2026-12-02" from <input type="date">. Weekday wording follows each language's samples.
export function formatDate(iso: string, fmt: DateFormat, lang: Lang): string {
  const d = new Date(`${iso}T00:00:00Z`)
  const loc = `${lang}-IN-u-nu-${DIGITS[lang] ?? 'latn'}`
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(loc, { timeZone: 'UTC', ...o }).format(d)
  const day = part({ day: '2-digit' })
  const year = part({ year: 'numeric' })
  const date =
    fmt === 'dd month yyyy' ? `${day} ${lang === 'pa' ? PA_MONTHS[d.getUTCMonth()] : part({ month: 'long' })} ${year}` : [day, part({ month: '2-digit' }), year].join(fmt[2])
  const weekday = lang === 'pa' ? PA_DAYS[d.getUTCDay()] : part({ weekday: 'long' })
  if (lang === 'gu') return `તા. ${date} ને ${weekday}`
  if (lang === 'pa' || lang === 'ta') return `${date}, ${weekday}`
  return `${weekday}, ${date}`
}

// A wedding website's function time ("YYYYMMDDTHHMMSS", written in India time) as the guest's own clock, for a guest
// whose browser is not on India time: "7:30 am EST" or, when it falls on another day there, "Fri 19 Feb, 9 pm PST".
// '' for guests on India time (or Sri Lanka's, the same clock) and for a start that can't be read.
export function guestTime(start: string, zone?: string) {
  const m = start.match(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)/)
  if (!m) return ''
  const at = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+05:30`)
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: zone, ...o }).format(at)
  const ist = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', ...o }).format(at)
  const clock = { hour: 'numeric', minute: '2-digit', hour12: true } as const
  if (fmt(clock) === ist(clock)) return ''
  const time = fmt({ ...clock, timeZoneName: 'short' }).replace(':00', '').replace(/ ([AP]M)/, (_, x: string) => ` ${x.toLowerCase()}`)
  const day = { weekday: 'short', day: 'numeric', month: 'short' } as const
  return fmt(day) === ist(day) ? time : `${fmt(day).replace(',', '')}, ${time}`
}
