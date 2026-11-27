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

// Wedding websites: function times are typed as the venue's own clock, in the site's time zone (Content.zone, an IANA
// name; sites saved before it are India time). Starts are kept as that wall time, "YYYYMMDDTHHMMSS".
export const IST = 'Asia/Kolkata'

// The moment a wall time in `zone` stands for. null for a start that can't be read.
export function zoned(start: string, zone = IST): Date | null {
  const m = start.match(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)?/)
  if (!m) return null
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0))
  let f: Intl.DateTimeFormat
  try {
    f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return zone === IST ? null : zoned(start)
  }
  // How far the zone's clock is ahead of UTC at moment t; twice, so a start next to a daylight-saving change lands right.
  const ahead = (t: number) => {
    const p = Object.fromEntries(f.formatToParts(t).map((x) => [x.type, x.value]))
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t
  }
  return new Date(wall - ahead(wall - ahead(wall)))
}

// A function's start as the guest's own clock, for a guest whose clock differs from the venue's: "7:30 am EST" or,
// when it falls on another day there, "Fri Feb 19, 9 pm PST". '' when the guest's clock reads the same as the venue's,
// and for a start that can't be read. guest: the guest's zone (their browser's when left out).
export function guestTime(start: string, site = IST, guest?: string) {
  const at = zoned(start, site)
  if (!at) return ''
  const fmt = (zone: string | undefined, o: Intl.DateTimeFormatOptions) => {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: zone, ...o }).format(at)
    } catch {
      return new Intl.DateTimeFormat('en-US', { timeZone: IST, ...o }).format(at)
    }
  }
  const clock = { hour: 'numeric', minute: '2-digit', hour12: true } as const
  if (fmt(guest, clock) === fmt(site, clock)) return ''
  const time = fmt(guest, { ...clock, timeZoneName: 'short' }).replace(':00', '').replace('GMT+5:30', 'IST').replace(/ ([AP]M)/, (_, x: string) => ` ${x.toLowerCase()}`)
  const day = { weekday: 'short', day: 'numeric', month: 'short' } as const
  return fmt(guest, day) === fmt(site, day) ? time : `${fmt(guest, day).replace(',', '')}, ${time}`
}

// Time zones a couple picks from in the website editor, with the browser's own added when it is not one of these.
export const ZONES: [zone: string, label: string][] = [
  [IST, 'India (IST)'],
  ['America/New_York', 'US Eastern'],
  ['America/Chicago', 'US Central'],
  ['America/Denver', 'US Mountain'],
  ['America/Los_Angeles', 'US Pacific'],
  ['America/Toronto', 'Canada Eastern (Toronto)'],
  ['America/Vancouver', 'Canada Pacific (Vancouver)'],
  ['Europe/London', 'UK'],
  ['Asia/Dubai', 'UAE'],
  ['Australia/Sydney', 'Australia (Sydney)'],
  ['Asia/Singapore', 'Singapore'],
]
