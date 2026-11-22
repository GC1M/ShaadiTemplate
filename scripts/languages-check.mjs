// Fails when switching a template's language would change its layout. Every language must give the same pages,
// the same sections in the same order, with the same headings present and the same sizes; only the words differ.
// A template with its own pages needs a full translation (Template.tr) for every other language.
//
//   node scripts/languages-check.mjs        (CI runs this)
import { runnerImport } from 'vite'

const opts = { configFile: false, logLevel: 'error' }
const [{ module: tpl }, { module: types }] = await Promise.all([runnerImport('/src/templates.ts', opts), runnerImport('/src/types.ts', opts)])

// The layout of a page list: kinds, filled cover fields, and per section whether it has a heading, its size and its
// artwork icons (a [[ribbon|words]] counts as the ribbon), so a translation cannot drop a block or an ornament.
const icons = (s) => [...s.matchAll(/\[\[([^\]|]+)/g)].map((m) => m[1]).join(',')
const shape = (pages) =>
  pages.map(({ id, ...p }) =>
    p.kind === 'cover'
      ? `cover:${Object.keys(p).filter((k) => k !== 'kind' && (typeof p[k] === 'string' ? p[k] : Object.values(p[k]).some(Boolean))).sort()}`
      : `sections(${p.title ? 'title' : ''}):` + p.sections.map((s) => `${s.heading ? 'h' : '-'}/${s.size ?? 1}/${icons(s.heading)}|${icons(s.body)}`).join(' '),
  )

const errors = []
for (const t of tpl.TEMPLATES) {
  if (t.pages)
    for (const lang of types.LANG_IDS) {
      if (lang === t.lang) continue
      const tr = t.tr?.[lang]
      if (!tr) errors.push(`${t.id}: no ${lang} translation of its pages (Template.tr.${lang})`)
      else if (tr.length !== t.pages.length || tr.some((p, i) => p.sections.length !== t.pages[i].sections.length))
        errors.push(`${t.id}: ${lang} translation has a different number of pages or sections`)
    }
  if (errors.some((e) => e.startsWith(`${t.id}:`))) continue
  const ref = shape(tpl.samplePages(t, t.lang))
  for (const lang of types.LANG_IDS) {
    const got = shape(tpl.samplePages(t, lang))
    const i = got.findIndex((g, k) => g !== ref[k])
    if (got.length !== ref.length) errors.push(`${t.id}: ${got.length} pages in ${lang}, ${ref.length} in ${t.lang}`)
    else if (i >= 0) errors.push(`${t.id}: page ${i + 1} differs in ${lang}\n    ${t.lang}: ${ref[i]}\n    ${lang}: ${got[i]}`)
  }
}

// Switching language keeps what the family typed and swaps only the sample wording: every template, every language.
for (const t of tpl.TEMPLATES) {
  const mine = tpl.samplePages(t, t.lang)
  const p = mine.find((x) => x.kind === 'cover')
  if (p) p.bride = { ...p.bride, name: 'TYPED' }
  else mine[0].sections[0] = { ...mine[0].sections[0], body: 'TYPED' }
  for (const lang of types.LANG_IDS) {
    const got = tpl.keepEdits(mine, tpl.samplePages(t, t.lang), tpl.samplePages(t, lang))
    const want = tpl.samplePages(t, lang)
    if (p) want[0].bride.name = 'TYPED'
    else want[0].sections[0].body = 'TYPED'
    if (tpl.stripIds(got) !== tpl.stripIds(want)) errors.push(`${t.id}: switching to ${lang} doesn't keep typed text and swap the rest`)
  }
}

// A new card of the set starts with the names typed on the last one (cover designs only).
{
  const [a, b] = tpl.TEMPLATES.filter((t) => !t.pages && t.event !== 'save-the-date')
  const from = tpl.newInvite(a)
  from.pages[0] = { ...from.pages[0], groom: { ...from.pages[0].groom, name: 'TYPED' } }
  const to = tpl.carryDetails(from, tpl.newInvite(b))
  if (to?.pages[0].groom.name !== 'TYPED' || to.pages[0].bride.name !== tpl.newInvite(b).pages[0].bride.name) errors.push(`carryDetails: ${a.id} to ${b.id} didn't copy only the typed name`)
  if (tpl.carryDetails(tpl.newInvite(a), tpl.newInvite(b))) errors.push('carryDetails: an untouched card has nothing to carry')
}

if (errors.length) {
  console.error(`Language switch changes the layout:\n  ${errors.join('\n  ')}`)
  process.exit(1)
}
console.log(`All ${tpl.TEMPLATES.length} templates keep their layout in every language`)
