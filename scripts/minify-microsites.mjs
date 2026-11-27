// Runs after vite build (npm run build). The themed websites (public/microsites) are copied into dist as written;
// ship them minified, without the working comments, so a saved copy is harder to reuse. The copyright notice
// (<!-- © ...) stays. Only inline scripts are minified, not the import map, JSON-LD or src= scripts.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { transform } from 'lightningcss'
import { minify } from 'vite'

const dir = 'dist/microsites'
const js = async (name, code) => {
  const r = await minify(name, code, {}) // keeps top-level names: the pages call fill.js's globals
  if (r.errors.length) throw new Error(`${name}: ${r.errors[0].message}`)
  return r.code
}
writeFileSync(`${dir}/fill.js`, await js('fill.js', readFileSync(`${dir}/fill.js`, 'utf8')))
for (const id of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const file = `${dir}/${id}/index.html`
  const before = readFileSync(file, 'utf8')
  let page = before.replace(/<!--(?! ©)[\s\S]*?-->\n?/g, '')
  for (const [whole, open, body, close] of page.matchAll(/(<script(?![^>]*\b(?:src=|type="(?:importmap|application\/ld\+json)"))[^>]*>)([\s\S]*?)(<\/script>)/g)) {
    const code = await js(`${id}.js`, body)
    page = page.replace(whole, () => open + code + close)
  }
  for (const [whole, open, css, close] of page.matchAll(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g)) {
    const { code } = transform({ filename: `${id}.css`, code: Buffer.from(css), minify: true })
    page = page.replace(whole, () => open + code.toString() + close)
  }
  writeFileSync(file, page)
  console.log(`microsites/${id}: ${before.length} -> ${page.length} bytes`)
}
