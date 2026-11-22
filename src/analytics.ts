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

export function initAnalytics() {
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
    // Hash routes (#edit, #/websites/...) don't count as page changes to GA, so those are sent by hand.
    window.gtag('config', GA, { page_location: location.href })
    load(`https://www.googletagmanager.com/gtag/js?id=${GA}`)
    addEventListener('hashchange', () => {
      window.gtag!('set', { page_location: location.href })
      track('page_view', { page_location: location.href, page_title: document.title })
    })
  }
  if (CLARITY) {
    window.clarity = function () {
      ;((window.clarity as unknown as { q?: unknown[] }).q ||= []).push(arguments)
    }
    load(`https://www.clarity.ms/tag/${CLARITY}`)
  }
  if (GA || CLARITY) {
    addEventListener('error', (e) => track('exception', { description: `${e.message} @ ${e.filename}:${e.lineno}`.slice(0, 150), fatal: false }))
    addEventListener('unhandledrejection', (e) => track('exception', { description: String(e.reason).slice(0, 150), fatal: false }))
  }
}
