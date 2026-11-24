// Google Analytics 4 (traffic, countries, engagement time, funnels, errors) and Microsoft Clarity (heatmaps,
// session recordings, rage clicks, JS errors). IDs come from .env.production, so dev and preview builds
// without it send nothing. Both IDs are public by design; they are not secrets.
const GA = import.meta.env.VITE_GA_ID as string | undefined
const CLARITY = import.meta.env.VITE_CLARITY_ID as string | undefined

type Gtag = (...args: unknown[]) => void
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
    clarity?: Gtag
  }
}

// EEA, UK and Switzerland need consent before analytics or ad cookies. Until a consent banner (AdSense's
// "Privacy & messaging") grants it, GA sends cookieless pings there and everyone else is measured normally.
const CONSENT_REGIONS = 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH'.split(' ')

// The address as analytics may see it: never with a wedding website's edit key (App.tsx takes it off on arrival;
// this covers both shapes a link can carry it in, should one slip through).
const href = () => location.href.replace(/\?k=[a-f0-9]+|(\/w\/[a-z0-9-]+\/edit\/?)#.*/, '$1')

const load = (src: string) => document.head.appendChild(Object.assign(document.createElement('script'), { async: true, src }))

export function track(name: string, params: Record<string, string | number | boolean> = {}) {
  window.gtag?.('event', name, params)
  window.clarity?.('event', name)
}

// Visiting any page with ?notrack turns analytics off in this browser (so the owner's own devices are not counted);
// ?track turns it back on. Stored per browser, so it holds on any network but is lost if site data is cleared.
// public/analytics.js has the same check for the static pages.
function optedOut() {
  try {
    const q = new URLSearchParams(location.search)
    if (q.has('notrack')) localStorage.setItem('notrack', '1')
    if (q.has('track')) localStorage.removeItem('notrack')
    return localStorage.getItem('notrack') === '1'
  } catch {
    return false
  }
}

// Where this browser first came from: the link's utm_source, else the site that sent it ("l.instagram.com" is kept
// as "instagram.com"), else "wedding-site" for a couple's site, else "direct". Kept once, and sent with a wedding website when it is published so the owner's
// dashboard shows which channel brought each couple. public/analytics.js keeps it on the static pages too.
export function rememberSource() {
  try {
    if (localStorage.getItem('source')) return
    const ref = document.referrer && new URL(document.referrer).hostname.replace(/^(www|l|lm|m|out)\./, '')
    // A first visit to a couple's site (a guest, usually from a WhatsApp link that carries no referrer) counts as one.
    const from = new URLSearchParams(location.search).get('utm_source') || (ref && ref !== location.hostname.replace(/^www\./, '') ? ref : /^\/w\/[^/]+\/?$/.test(location.pathname) ? 'wedding-site' : 'direct')
    localStorage.setItem('source', from.slice(0, 60))
  } catch {
    /* storage blocked: the site goes without a source */
  }
}

export function initAnalytics() {
  rememberSource()
  if (optedOut()) return
  if (GA) {
    window.dataLayer = window.dataLayer || []
    // gtag must push the arguments object itself, not an array.
    window.gtag = function () {
      window.dataLayer!.push(arguments)
    }
    const denied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }
    window.gtag('consent', 'default', { ...denied, region: CONSENT_REGIONS })
    window.gtag('js', new Date())
    // GA sends the first page view itself (it ignored send_page_view: false and double-counted every load).
    // Pages changed in place (#edit, /websites/...) don't count as page changes to GA, so those are sent by hand.
    window.gtag('config', GA, { page_location: href() })
    load(`https://www.googletagmanager.com/gtag/js?id=${GA}`)
    let last = href()
    const page = () => {
      if (href() === last) return // a hash change fires both events
      last = href()
      window.gtag!('set', { page_location: last })
      track('page_view', { page_location: last, page_title: document.title })
    }
    addEventListener('hashchange', page)
    addEventListener('popstate', page)
  }
  if (CLARITY) {
    window.clarity = function () {
      ;((window.clarity as unknown as { q?: unknown[] }).q ||= []).push(arguments)
    }
    load(`https://www.clarity.ms/tag/${CLARITY}`)
  }
  if (GA || CLARITY) {
    // GA keeps 100 characters of a parameter: the message, then the file's name and line. Errors from the editor's
    // preview frame start with "preview:". Other sites' scripts (GA, Clarity, in-app browsers) reach us only as
    // "Script error." with no file: nothing to act on, so they are not counted.
    const where = top === self ? '' : 'preview: '
    const report = (msg: string, file = '', line = 0) => track('exception', { description: `${where}${msg} @ ${file.split('/').pop()}:${line}`.slice(0, 100), fatal: false })
    addEventListener('error', (e) => e.filename && report(e.message, e.filename, e.lineno))
    addEventListener('unhandledrejection', (e) => report(String(e.reason)))
  }
}
