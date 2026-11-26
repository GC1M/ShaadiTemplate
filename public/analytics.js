// GA4 and Clarity for the static pages (guides, design pages, hubs), so visitors who land on them from search are
// measured. Same IDs and consent defaults as src/analytics.ts, which covers the app. Only runs on the live domain.
;(function () {
  // Not inside a frame (a themed website's page inside the site): the site around it counts the visit.
  if (location.hostname !== 'shaaditemplate.com' || window.parent !== window) return
  // First-touch source, same key and rule as rememberSource() in src/analytics.ts.
  try {
    if (!localStorage.getItem('source')) {
      var ref = document.referrer ? new URL(document.referrer).hostname.replace(/^(www|l|lm|m|out)\./, '') : ''
      var from = new URLSearchParams(location.search).get('utm_source') || (ref && ref !== 'shaaditemplate.com' ? ref : 'direct')
      localStorage.setItem('source', from.slice(0, 60))
    }
  } catch (e) {}
  // ?notrack turns analytics off in this browser, ?track turns it back on (same flag as src/analytics.ts).
  try {
    var q = new URLSearchParams(location.search)
    if (q.has('notrack')) localStorage.setItem('notrack', '1')
    if (q.has('track')) localStorage.removeItem('notrack')
    if (localStorage.getItem('notrack') === '1') return
  } catch (e) {}
  var GA = 'G-H76T6YKFL2'
  var CLARITY = 'zfac15p6dl'
  var load = function (src) {
    var s = document.createElement('script')
    s.async = true
    s.src = src
    document.head.appendChild(s)
  }
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  var denied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }
  denied.region = 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH'.split(' ')
  window.gtag('consent', 'default', denied)
  window.gtag('js', new Date())
  window.gtag('config', GA)
  load('https://www.googletagmanager.com/gtag/js?id=' + GA)
  window.clarity = function () {
    ;(window.clarity.q = window.clarity.q || []).push(arguments)
  }
  load('https://www.clarity.ms/tag/' + CLARITY)
})()
