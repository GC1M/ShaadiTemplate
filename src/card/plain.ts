// The editor's text boxes show plain words: a card's formatting marks (~names~, **big**, [[ornament|words]], {{chip}},
// ^^spaced^^, <> columns, // rows, << >> lean, ___ rules) stay hidden in the saved text, around the words they belong
// to. toPlain gives what the box shows; fromPlain applies an edit of that plain text back onto the marked-up text, so
// the card keeps its format whatever the family types. Lines that are only artwork (a divider, a heart) are hidden.

type Tok = { m: string; p: string; pair?: number; open?: boolean; orn?: boolean; lean?: boolean }

const INLINE = /(\[\[[^\]]+\]\]|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~[^~]+~|\^\^[^^]+\^\^|\{\{[^}]+\}\}|_{3,})/
const WRAPS: [string, string][] = [['***', '***'], ['**', '**'], ['^^', '^^'], ['{{', '}}'], ['*', '*'], ['~', '~']]

let ids = 0
const chars = (s: string): Tok[] => [...s].map((c) => ({ m: c, p: c }))
const mark = (m: string): Tok => ({ m, p: '' })
const plainOf = (t: Tok[]) => t.map((x) => x.p).join('')

function inline(s: string): Tok[] {
  return s.split(INLINE).flatMap((part, j): Tok[] => {
    if (j % 2 === 0) return chars(part)
    if (part.startsWith('[[')) {
      const bar = part.indexOf('|')
      if (bar < 0) return [mark(part)]
      const id = ++ids
      return [{ m: part.slice(0, bar + 1), p: '', pair: id, open: true, orn: true }, ...inline(part.slice(bar + 1, -2)), { m: ']]', p: '', pair: id, orn: true }]
    }
    if (/^_{3,}$/.test(part)) return [mark(part)]
    const [a, b] = WRAPS.find(([a, b]) => part.length > a.length + b.length && part.startsWith(a) && part.endsWith(b))!
    const id = ++ids
    return [{ m: a, p: '', pair: id, open: true }, ...chars(part.slice(a.length, -b.length)), { m: b, p: '', pair: id }]
  })
}

// A row of columns ("a <> b <> c", each column "top//bottom"): columns read " · ", rows " / ", and a column or row
// that is only artwork joins the separator next to it, so the box shows no stray dots.
function columns(line: string): Tok[] {
  const rows = line.includes('//')
  const out: Tok[] = []
  let sep = ''
  for (const [k, col] of line.split(/(\s*<>\s*)/).entries()) {
    if (k % 2) {
      sep += col
      continue
    }
    const t: Tok[] = []
    let gap = ''
    for (const [r, row] of (rows ? col.split('//') : [col]).entries()) {
      const toks = inline(row)
      if (r) gap += '//'
      if (!plainOf(toks)) {
        gap += toks.map((x) => x.m).join('')
        continue
      }
      if (gap) t.push({ m: gap, p: plainOf(t) ? ' / ' : '' })
      gap = ''
      t.push(...toks)
    }
    if (!plainOf(t)) {
      sep += t.map((x) => x.m).join('') + gap
      continue
    }
    if (sep || k) out.push({ m: sep, p: plainOf(out) ? ' · ' : '' })
    sep = ''
    out.push(...t)
    if (gap) out.push(mark(gap))
  }
  if (sep) out.push(mark(sep))
  return out
}

function tokens(text: string): Tok[] {
  const lines = text.split('\n').map((raw): Tok[] => {
    const lean: Tok[] = /^(<<|>>)/.test(raw) ? [{ m: raw.slice(0, 2), p: '', lean: true }] : []
    const line = lean.length ? raw.slice(2) : raw
    return [...lean, ...(line.includes('<>') ? columns(line) : inline(line))]
  })
  const out: Tok[] = []
  let seen = false // a line with words so far
  lines.forEach((t, i) => {
    const m = t.map((x) => x.m).join('')
    if (m && !plainOf(t)) out.push(mark(i ? '\n' + m : m))
    else {
      // Before the first line with words, the break belongs to the artwork line above it.
      if (i && seen) out.push({ m: '\n', p: '\n' })
      else if (i) out[out.length - 1].m += '\n'
      out.push(...t)
      seen = true
    }
  })
  return out
}

export const toPlain = (text: string) => plainOf(tokens(text))

// Which letters of `was` stay, and what is typed before each place (ins[i] goes before was[i]): a longest common
// subsequence, so a whole line pasted over keeps the marks of the words it shares with the old one.
function diff(was: string[], next: string[]) {
  let a = 0
  while (a < was.length && a < next.length && was[a] === next[a]) a++
  let b = 0
  while (b < was.length - a && b < next.length - a && was[was.length - 1 - b] === next[next.length - 1 - b]) b++
  const n = was.length - a - b
  const m = next.length - a - b
  const w = m + 1
  const L = new Uint32Array((n + 1) * w)
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i * w + j] = was[a + i] === next[a + j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1])
  const keep = was.map(() => true)
  const ins = Array.from({ length: was.length + 1 }, () => '')
  let i = 0
  let j = 0
  while (i < n || j < m) {
    if (i < n && j < m && was[a + i] === next[a + j]) i++, j++
    else if (j < m && (i === n || L[i * w + j + 1] >= L[(i + 1) * w + j])) ins[a + i] += next[a + j++]
    else keep[a + i++] = false
  }
  return { keep, ins }
}

export function fromPlain(next: string, text: string): string {
  const t = tokens(text)
  if (plainOf(t) === next) return text
  const { keep, ins } = diff([...plainOf(t)], [...next])
  const out: Tok[] = []
  let at = 0 // place in the plain text, in letters
  let here: Tok[] = [] // marks at this place, before its new letters are known
  const flush = (typed: string) => {
    // New letters go before the first closing mark (they extend the word they follow) or a hidden line below, and
    // after opening marks (at the start of a line they join its first word).
    let cut = here.findIndex((x) => (x.pair && !x.open) || x.m.startsWith('\n'))
    if (cut < 0) cut = here.length
    out.push(...here.slice(0, cut), ...chars(typed), ...here.slice(cut))
    here = []
  }
  for (const x of t) {
    if (!x.p) {
      here.push(x)
      continue
    }
    const n = [...x.p].length
    flush(ins[at])
    // A separator (" · ") is kept whole unless a letter of it is deleted; letters typed inside it go after it.
    if (keep.slice(at, at + n).every(Boolean)) out.push(x)
    here = []
    const inside = ins.slice(at + 1, at + n).join('')
    at += n
    if (inside) out.push(...chars(inside))
  }
  flush(ins[at])
  const s = build(out)
  // A line that is only artwork (a divider, a swirl) keeps its own line: joining lines across it is refused.
  const lines = (v: string) => tokens(v).filter((x) => !x.p && x.m.includes('\n')).length
  return lines(s) === lines(text) ? s : text
}

// Drop pairs left empty, and keep a pair from spanning a new line (each line is formatted on its own).
function build(t: Tok[]): string {
  const filled = new Set<number>()
  const open: Tok[] = []
  for (const x of t) {
    if (x.pair && x.open) open.push(x)
    else if (x.pair) open.splice(open.findIndex((o) => o.pair === x.pair), 1)
    else if (x.p) open.forEach((o) => filled.add(o.pair!))
  }
  const live = t.filter((x) => !x.pair || filled.has(x.pair))
  const stack: Tok[] = []
  let s = ''
  for (const x of live) {
    if (x.pair && x.open) stack.push(x)
    else if (x.pair) stack.splice(stack.findIndex((o) => o.pair === x.pair), 1)
    if (x.p === '\n' && stack.length) {
      // Painted words stay on one line; any other mark closes before the break and opens again after it.
      if (stack.some((o) => o.orn)) {
        s += ' '
        continue
      }
      const closers = [...stack].reverse().map((o) => live.find((y) => y.pair === o.pair && !y.open)!.m)
      s += closers.join('') + '\n' + stack.map((o) => o.m).join('')
      continue
    }
    // A lean (<< >>) only means something at the start of a line: one left mid-line by joining two lines is dropped.
    if (x.lean && s && !s.endsWith('\n')) continue
    s += x.m
  }
  return s
}
