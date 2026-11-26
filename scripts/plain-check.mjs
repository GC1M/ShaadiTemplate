// Fails when an editor text box would show a formatting mark, or when typing in the plain box would break a card's
// format. Every text of every template in every language is checked: its plain form has no marks, and typing or
// deleting a letter anywhere in it keeps the box showing exactly what was typed and every mark in place.
//
//   node scripts/plain-check.mjs        (CI runs this)
import { runnerImport } from 'vite'

const opts = { configFile: false, logLevel: 'error' }
const [{ module: tpl }, { module: types }, { module: plain }] = await Promise.all(
  ['/src/templates.ts', '/src/types.ts', '/src/card/plain.ts'].map((f) => runnerImport(f, opts)),
)
const { toPlain, fromPlain } = plain

const MARKS = /\[\[|\]\]|\*|~|\^\^|\{\{|\}\}|<>|^<<|^>>|___/m
// The marks of a text, with its words taken out: an edit inside the words must leave these alone.
const marksOf = (s) => s.replace(/\[\[[^\]|]+\|?/g, (m) => `\u0000${m}`).replace(/[^\u0000\[\]*~^{}<>_/|\n]|\/(?!\/)/g, '').replace(/\n+/g, '\n')

const texts = (pages) =>
  pages.flatMap((p) =>
    p.kind === 'cover'
      ? Object.values(p).flatMap((v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).filter((x) => typeof x === 'string') : []))
      : [p.title ?? '', ...p.sections.flatMap((s) => [s.heading, s.body])],
  )

const errors = []
// Whole-word edits a family makes: a name typed over keeps its script, a new line inside a styled run keeps both halves
// styled, and painted words stay one line.
for (const [text, typed, want] of [
  ['~Usman & Rida~', 'Ravi & Meera', '~Ravi & Meera~'],
  ['~Aisha’s~', 'Priya’s', '~Priya’s~'],
  ['ON MONDAY <> [[bar]] <> **12th**//JANUARY', 'ON FRIDAY · 3rd / MARCH', 'ON FRIDAY <> [[bar]] <> **3rd**//MARCH'],
  ['~Usman~', 'Us\nman', '~Us~\n~man~'],
  ['[[title|Join us for a **Mehndi** celebration]]', 'Join us for a Sangeet celebration', '[[title|Join us for a **Sangeet** celebration]]'],
  ['[[title|Join us]]', 'Join\nus', '[[title|Join us]]'],
  ['Rida\n[[divider]]\nAt home', 'Rida\nAt our home', 'Rida\n[[divider]]\nAt our home'],
]) {
  const out = fromPlain(typed, text)
  if (out !== want) errors.push(`${JSON.stringify(text)} typed as ${JSON.stringify(typed)} gives ${JSON.stringify(out)}, not ${JSON.stringify(want)}`)
}
let n = 0
for (const t of tpl.TEMPLATES)
  for (const lang of types.LANG_IDS) {
    for (const text of new Set(texts(tpl.samplePages(t, lang)))) {
      if (!text) continue
      n++
      const where = `${t.id} (${lang}): ${JSON.stringify(text.slice(0, 60))}`
      const p = toPlain(text)
      if (MARKS.test(p)) errors.push(`${where}: the box shows a mark: ${JSON.stringify(p.slice(0, 80))}`)
      if (fromPlain(p, text) !== text) errors.push(`${where}: unchanged box changes the text`)
      // Type a letter at every place, and delete each letter, in the plain box.
      // Not next to a column or row separator (" · ", " / "): those are kept whole, so typing beside them can land
      // on the other side.
      for (let i = 0; i <= p.length; i++) {
        if (/·| \/ /.test(p.slice(Math.max(0, i - 3), i + 3))) continue
        for (const q of [p.slice(0, i) + 'x' + p.slice(i), i < p.length ? p.slice(0, i) + p.slice(i + 1) : null]) {
          if (q === null || /\n\n/.test(q) !== /\n\n/.test(p)) continue
          const out = fromPlain(q, text)
          // Joining two lines across a line of artwork is refused: the box stays as it was.
          if (out === text && p[i] === '\n') continue
          if (toPlain(out) !== q) {
            const d = [...q].findIndex((c, k) => c !== toPlain(out)[k])
            errors.push(`${where}: typing at ${i} gives …${JSON.stringify(toPlain(out).slice(d - 20, d + 30))}, not …${JSON.stringify(q.slice(d - 20, d + 30))}`)
            break
          }
          if (q.length > p.length && marksOf(out) !== marksOf(text)) {
            errors.push(`${where}: typing at ${i} moved a mark: ${JSON.stringify(out.slice(0, 80))}`)
            break
          }
        }
      }
    }
  }

if (errors.length) {
  console.error([...new Set(errors)].slice(0, 40).join('\n'))
  console.error(`${errors.length} problems`)
  process.exit(1)
}
console.log(`All ${n} card texts edit as plain words`)
