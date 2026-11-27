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
      const { DESIGNS, WEBSITES_TITLE, designIntro, designKind, designPath, designTitle } = await load<typeof import('./src/site/designs')>('/src/site/designs.ts')
      const { default: sitemap } = await load<{ default: string }>('/public/sitemap.xml?raw')
      const index = bundle['index.html']
      if (index?.type !== 'asset') throw new Error('index.html is not in the bundle')
      const home = String(index.source)
        .replace(/[ \t]*<!-- home -->.*?<!-- \/home -->\n?/gs, '')
        .replace(/[ \t]*<script type="application\/ld\+json">.*?<\/script>\n?/s, '')
      const SITE = 'https://shaaditemplate.com'
      const org = { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'ShaadiTemplate', url: `${SITE}/` }
      const hub = { name: 'Wedding websites', url: `${SITE}/websites/` }
      // 1200x630 share images drawn by scripts/seo.py from each design's hero photo.
      const og = (d?: { id: string }) => `${SITE}/og/websites${d ? `-${d.id}` : ''}.jpg`
      const crumbs = (...items: { name: string; url: string }[]) => ({
        '@type': 'BreadcrumbList',
        itemListElement: [{ name: 'Home', url: `${SITE}/` }, ...items].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
      })
      // Plain text and links inside #root (React replaces it on mount), so crawlers see words and the other designs
      // without running the app.
      const links = DESIGNS.map((d) => `<li><a href="${designPath(d)}">${esc(d.name)}</a>: ${esc(d.blurb)}</li>`).join('')
      const text = (h1: string, p: string) =>
        `<main class="mx-auto max-w-3xl px-4 py-16"><h1>${esc(h1)}</h1><p>${esc(p)}</p>` +
        `<h2>Wedding website designs</h2><ul>${links}</ul>` +
        `<p><a href="/websites/">All wedding website designs</a> | <a href="/">Invitation cards</a> | <a href="/guides/">Guides</a></p></main>`
      // desc and seo only for pages meant to be found: they get a canonical, a share image and structured data.
      const write = (path: string, title: string, desc?: string, seo?: { image: string; alt: string; graph: object[]; body: string }) => {
        const url = `${SITE}${path}`
        if (desc && !sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`${url} is not in public/sitemap.xml: run python3 scripts/seo.py`)
        if (title.length > 60 || (desc?.length ?? 0) > 160) throw new Error(`${path}: title over 60 or description over 160 characters`)
        let page = home.replace(/<title>.*?<\/title>/, () => `<title>${esc(title)}</title>`).replace(/(property="og:title" content=")[^"]*/, (_: string, a: string) => a + esc(title))
        page = desc
          ? page
              .replace(/((?:name="description"|property="og:description") content=")[^"]*/g, (_: string, a: string) => a + esc(desc))
              .replace(/((?:rel="canonical" href|property="og:url" content)=")[^"]*/g, (_: string, a: string) => a + url)
          : page.replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex" />')
        if (seo) {
          const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': seo.graph }).replace(/<\//g, '<\\/')
          page = page
            .replace(/(property="og:image" content=")[^"]*/, (_: string, a: string) => a + esc(seo.image))
            .replace(/(property="og:image:alt" content=")[^"]*/, (_: string, a: string) => a + esc(seo.alt))
            .replace('<!-- /seo -->', `<script type="application/ld+json">${ld}</script>\n    <!-- /seo -->`)
            .replace('<div id="root">', () => `<div id="root">${seo.body}`)
        }
        this.emitFile({ type: 'asset', fileName: `${path.slice(1)}index.html`, source: page })
      }
      const edit = 'Make your wedding website | ShaadiTemplate'
      const hubDesc = 'Free Indian wedding website templates with RSVP: your story, every function, the venue map and guest blessings on one link for WhatsApp.'
      write('/websites/', WEBSITES_TITLE, hubDesc, {
        image: og(),
        alt: 'Free wedding website designs from ShaadiTemplate',
        graph: [
          { '@type': 'CollectionPage', name: 'Wedding website designs', url: hub.url, description: hubDesc, inLanguage: 'en', isPartOf: { '@id': `${SITE}/#website` },
            mainEntity: { '@type': 'ItemList', numberOfItems: DESIGNS.length,
              itemListElement: DESIGNS.map((d, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'CreativeWork', name: `${d.name} wedding website`, url: `${SITE}${designPath(d)}`, image: og(d) } })) } },
          crumbs(hub),
        ],
        body: text('Free wedding website designs', `${hubDesc} Pick a design, add your names, functions and photos, and send one link to every guest.`),
      })
      write('/websites/preview/', edit)
      for (const d of DESIGNS) {
        const url = `${SITE}${designPath(d)}`
        const desc = `Free ${designKind(d)} website: ${d.blurb} Story, events, map and RSVP on one link.`
        write(designPath(d), designTitle(d), desc, {
          image: og(d),
          alt: `${d.name}, a free ${designKind(d)} website design`,
          graph: [
            { '@type': 'CreativeWork', name: `${d.name} wedding website`, url, description: desc, image: og(d), inLanguage: 'en', isAccessibleForFree: true, publisher: org, copyrightHolder: { '@id': org['@id'] }, copyrightYear: 2026, license: `${SITE}/terms.html#copying`, isPartOf: { '@type': 'CollectionPage', url: hub.url } },
            crumbs(hub, { name: d.name, url }),
          ],
          body: text(designIntro(d).heading, designIntro(d).body),
        })
        write(`${designPath(d)}edit/`, edit)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderHero(), sitePages()],
})
