import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { defineConfig, runnerImport, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Renders the gallery header and hero (src/Hero.tsx) into index.html's <!-- app-hero --> placeholder, so the static
// shell and the React app share one source and can't drift apart (a mismatch shows up as layout shift).
function prerenderHero(): Plugin {
  let base = '/'
  return {
    name: 'prerender-hero',
    configResolved: (c) => void (base = c.base),
    transformIndexHtml: {
      order: 'post', // after Vite's own URL rewriting, which would try to resolve the public-dir image paths
      async handler(html) {
        const { module } = await runnerImport<typeof import('./src/Hero')>('/src/Hero.tsx', { configFile: false, logLevel: 'error', base })
        return html.replace('<!-- app-hero -->', renderToStaticMarkup(createElement(module.Hero)))
      },
    },
  }
}

// GitHub Pages serves files only, so each wedding website page (src/App.tsx) gets its own copy of index.html, or its
// address would answer with the 404 page: the designs gallery and each design (src/site/designs.ts) with their own
// title and description, the editor and its preview marked noindex. The copies leave out the home page's static
// content. Couples' sites (/w/<slug>) have no file; public/404.html hands those to the app.
function sitePages(): Plugin {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  return {
    name: 'site-pages',
    apply: 'build',
    enforce: 'post', // after Vite has written index.html into the bundle
    async generateBundle(_, bundle) {
      const load = <T,>(file: string) => runnerImport<T>(file, { configFile: false, logLevel: 'error' }).then((r) => r.module)
      const { DESIGNS, designPath } = await load<typeof import('./src/site/designs')>('/src/site/designs.ts')
      const { default: sitemap } = await load<{ default: string }>('/public/sitemap.xml?raw')
      const index = bundle['index.html']
      if (index?.type !== 'asset') throw new Error('index.html is not in the bundle')
      const home = String(index.source)
        .replace(/[ \t]*<!-- home -->.*?<!-- \/home -->\n?/gs, '')
        .replace(/[ \t]*<script type="application\/ld\+json">.*?<\/script>\n?/s, '')
      const write = (path: string, title: string, desc?: string) => {
        const url = `https://shaaditemplate.com${path}`
        if (desc && !sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`${url} is not in public/sitemap.xml: run python3 scripts/seo.py`)
        let page = home.replace(/<title>.*?<\/title>/, () => `<title>${esc(title)}</title>`).replace(/(property="og:title" content=")[^"]*/, (_: string, a: string) => a + esc(title))
        page = desc
          ? page
              .replace(/((?:name="description"|property="og:description") content=")[^"]*/g, (_: string, a: string) => a + esc(desc))
              .replace(/((?:rel="canonical" href|property="og:url" content)=")[^"]*/g, (_: string, a: string) => a + url)
          : page.replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex" />')
        this.emitFile({ type: 'asset', fileName: `${path.slice(1)}index.html`, source: page })
      }
      const edit = 'Make your wedding website | ShaadiTemplate'
      write('/websites/', 'Wedding website designs | ShaadiTemplate', 'Free Indian wedding website designs. One link for every guest: your story, every function, the venue, RSVPs and blessings, on any phone. Open a design to try the live sample.')
      write('/websites/preview/', edit)
      for (const d of DESIGNS) {
        write(designPath(d), `${d.couple.join(' and ')}: ${d.name} wedding website`, `${d.name}, a sample wedding website design from ShaadiTemplate. ${d.blurb}`)
        write(`${designPath(d)}edit/`, edit)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderHero(), sitePages()],
})
