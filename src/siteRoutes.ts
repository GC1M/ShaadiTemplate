import { lazy } from 'react'
import { keepKey } from './site/api'

// Routes for the wedding website pages: the designs (/websites), each design's sample site (/websites/<id>,
// site/designs.ts), the website editor (/websites/<id>/edit, /w/<slug>/edit) and couples' published sites (/w/<slug>).
// main.tsx loads only SiteApp for these addresses, so a guest opening a website never downloads the card editor;
// App.tsx uses the same routes when the gallery links to a website page.
const Websites = lazy(() => import('./site/Websites'))
const WeddingSite = lazy(() => import('./site/WeddingSite'))
const HostedSite = lazy(() => import('./site/HostedSite'))
const SiteEditor = lazy(() => import('./site/SiteEditor'))

// A website page's path without its trailing slash, or '' for any other page.
export const sitePath = (path: string) => {
  const p = path.replace(/\/$/, '')
  return p === '/websites' || p.startsWith('/websites/') || p.startsWith('/w/') ? p : ''
}

export function land() {
  // These pages were hash routes once, so links already shared (/#/websites/<id>, /#/w/<slug>,
  // /#/w/<slug>/edit?k=<key>) land on the path. GitHub Pages has no file at /w/<slug>, so public/404.html sends
  // it here the same way on every load.
  // A guest pass (/#/w/<slug>?guest=…, from public/404.html) goes back on as the address's query.
  const old = location.hash.match(/^#(\/[^?]*)(?:\?k=(.*)|(\?.*))?$/)
  if (old && (sitePath(old[1]) || old[1].startsWith('/ananya-arjun')))
    history.replaceState(null, '', (sitePath(old[1]).startsWith('/w/') ? old[1] : `${sitePath(old[1]) || '/websites'}/`) + (old[3] ?? '') + (old[2] ? `#${old[2]}` : ''))
  // The edit key (/w/<slug>/edit#<key>) leaves the address here, before analytics starts and reports it (see keepKey).
  const keyed = (location.pathname + location.hash).match(/^\/w\/([a-z0-9-]+)\/edit\/?#([a-f0-9]+)$/)
  if (!keyed) return
  keepKey(keyed[1], keyed[2])
  history.replaceState(null, '', location.pathname)
}

export const siteView = (path: string) =>
  path === '/websites' ? Websites : path.endsWith('/edit') ? SiteEditor : path.startsWith('/w/') || path === '/websites/preview' ? HostedSite : WeddingSite
