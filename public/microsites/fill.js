/* Fills a themed wedding website (public/microsites/<id>/index.html) with a couple's own words.

   Opened on its own, the page shows its sample couple and this script does nothing. Inside a couple's published
   site or the editor's preview it runs in an iframe (src/site/bespoke/Themed.tsx): it says "microsite-ready" to the
   parent, which answers with the couple's content, and the page fills in again each time new content arrives.

   Markup it understands:
     data-f="couple.0"        text from that path (".name" inside a list item reads the item; "." is the item itself)
     data-f-href="map"        href from that path; data-f-src="photo" src from that path
     data-f-opt               hidden when its data-f, data-f-href or data-f-src value is empty
     data-f-if="note"         hidden when that path is empty (or an empty list); "!path" hides when it is not
     data-f-each="events"     a list: its first [data-f-item] child is the template, repeated once per item;
                              each copy gets data-main="true" on the wedding itself
     data-f-sample            sample-only detail (phone contacts, siblings): hidden once a couple's content is in
     data-f-hide="rsvp"       hidden when the couple turned that section off
     data-act="rsvp"|"bless"  opens the site's RSVP form or blessings book; on the page opened on its own (the
                              sample) it opens a simple sample form here instead, which sends nothing
     data-f-framed-hide       hidden whenever the page is shown by the app ("Opens your email app")
   After filling it fires "microsite:content" on document with the content as detail, for the page's own code
   (countdowns, canvas text). msDate("20270220T190000") turns an event start into a Date.

   Derived fields on the content and on each event, from its start: day ("20"), mon ("Feb"), month ("February"),
   year ("2027"), weekday ("Saturday"), dmy ("20.02.27"), clock ("7 PM"). */
(function () {
  // Opened on its own: the RSVP and blessings buttons open a simple sample form, and nothing else runs.
  if (window.parent === window) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-act]')
      if (!a) return
      e.preventDefault()
      sample(a.getAttribute('data-act') === 'bless')
    }, true)
    return
  }
  // A couple's own site (?own, set by Themed.tsx): keep the page hidden until their words are in, so the sample
  // couple's names and initials never flash first. Loaded without defer in <head> so this runs before first paint.
  var root = document.documentElement
  var reveal = function () { root.style.removeProperty('visibility') }
  if (/[?&]own\b/.test(location.search)) { root.style.visibility = 'hidden'; setTimeout(reveal, 4000) }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  var DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var pad = function (n) { return (n < 10 ? '0' : '') + n }
  window.msDate = function (s) {
    var m = /^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)/.exec(s || '')
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null
  }
  function derive(o) {
    var d = window.msDate(o.start)
    if (!d) return o
    var h = d.getHours(), mi = d.getMinutes()
    o.day = String(d.getDate()); o.mon = MON[d.getMonth()]; o.month = MONTH[d.getMonth()]; o.year = String(d.getFullYear())
    o.weekday = DAY[d.getDay()]; o.dmy = pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2)
    o.clock = (h % 12 || 12) + (mi ? ':' + pad(mi) : '') + (h < 12 ? ' AM' : ' PM')
    return o
  }
  function get(path, data, item) {
    if (path === '.') return item
    var v = path.charAt(0) === '.' ? item : data
    var parts = path.replace(/^\./, '').split('.')
    for (var i = 0; i < parts.length && v != null; i++) v = v[parts[i]]
    return v
  }
  var empty = function (v) { return v == null || v === '' || v === false || (Array.isArray(v) && !v.length) }
  // Hides el, or shows it again with whatever inline display it had before.
  var shown = new WeakMap()
  var hide = function (el, h) {
    if (!shown.has(el)) shown.set(el, [el.style.getPropertyValue('display'), el.style.getPropertyPriority('display')])
    el.hidden = !!h
    var was = shown.get(el)
    if (h) el.style.setProperty('display', 'none', 'important')
    else if (was[0]) el.style.setProperty('display', was[0], was[1])
    else el.style.removeProperty('display')
  }
  // The fields under el that belong to el itself, not to a list nested inside it.
  function own(root, sel) {
    return [root].concat([].slice.call(root.querySelectorAll(sel))).filter(function (x) {
      var list = x.matches(sel) && x.parentElement && x.parentElement.closest('[data-f-each]')
      return x.matches(sel) && !(list && root.contains(list) && list !== root)
    })
  }
  function apply(root, data, item) {
    own(root, '[data-f]').forEach(function (el) {
      var v = get(el.getAttribute('data-f'), data, item)
      el.textContent = v == null ? '' : String(v)
      if (el.hasAttribute('data-f-opt')) hide(el, empty(v))
    })
    own(root, '[data-f-href]').forEach(function (el) {
      var v = get(el.getAttribute('data-f-href'), data, item)
      if (v) el.setAttribute('href', v); else el.removeAttribute('href')
      if (el.hasAttribute('data-f-opt')) hide(el, empty(v))
    })
    own(root, '[data-f-src]').forEach(function (el) {
      var v = get(el.getAttribute('data-f-src'), data, item)
      if (v) el.setAttribute('src', v)
      if (el.hasAttribute('data-f-opt')) hide(el, empty(v))
    })
    own(root, '[data-f-if]').forEach(function (el) {
      var p = el.getAttribute('data-f-if'), not = p.charAt(0) === '!'
      var v = empty(get(p.replace(/^!/, ''), data, item))
      hide(el, not ? !v : v)
    })
  }
  var templates = new WeakMap()
  function fill(data) {
    derive(data.main || {})
    ;(data.events || []).forEach(derive)
    document.querySelectorAll('[data-f-sample]').forEach(function (el) { hide(el, true) })
    document.querySelectorAll('[data-f-hide]').forEach(function (el) { hide(el, (data.hide || []).indexOf(el.getAttribute('data-f-hide')) >= 0) })
    document.querySelectorAll('[data-f-each]').forEach(function (list) {
      if (!templates.has(list)) {
        var t = list.querySelector('[data-f-item]')
        if (!t) return
        templates.set(list, t.cloneNode(true))
      }
      var tpl = templates.get(list)
      list.querySelectorAll(':scope > [data-f-item]').forEach(function (x) { x.remove() })
      var items = get(list.getAttribute('data-f-each'), data) || []
      var anchor = list.querySelector(':scope > [data-f-end]')
      items.forEach(function (it) {
        var c = tpl.cloneNode(true)
        if (it && it.main) c.setAttribute('data-main', 'true'); else c.removeAttribute('data-main')
        apply(c, data, it)
        list.insertBefore(c, anchor || null)
      })
    })
    apply(document.body, data)
    if (data.couple) document.title = data.couple.join(' & ')
    document.dispatchEvent(new CustomEvent('microsite:content', { detail: data }))
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-act]')
    if (!a) return
    e.preventDefault()
    parent.postMessage({ type: 'microsite-act', act: a.getAttribute('data-act') }, location.origin)
  }, true)
  // Taps land in this frame, not on the site around it, so pass them up: the site starts a chosen song on a tap.
  ;['pointerup', 'keydown'].forEach(function (k) {
    addEventListener(k, function () { parent.postMessage({ type: 'microsite-tap' }, location.origin) }, true)
  })
  addEventListener('message', function (e) {
    if (e.origin !== location.origin || e.source !== parent || !e.data || e.data.type !== 'microsite-content') return
    var data = e.data.data
    var go = function () { fill(data); reveal() }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go()
  })
  document.addEventListener('DOMContentLoaded', function () { document.querySelectorAll('[data-f-framed-hide]').forEach(function (el) { hide(el, true) }) })
  parent.postMessage({ type: 'microsite-ready' }, location.origin)

  // The sample page's RSVP or blessings form: a plain dialog that thanks the guest and sends nothing.
  function sample(bless) {
    var d = document.createElement('dialog')
    d.setAttribute('aria-label', bless ? 'Blessings' : 'RSVP')
    d.style.cssText = 'max-width:min(92vw,380px);width:100%;border:0;border-radius:16px;padding:24px;background:#141414;color:#f4f4f4;font:16px/1.5 system-ui,sans-serif'
    var field = 'display:block;width:100%;box-sizing:border-box;margin:6px 0 14px;padding:10px 12px;border-radius:10px;border:1px solid #555;background:#222;color:inherit;font:inherit'
    var btn = 'min-height:44px;padding:0 20px;border-radius:999px;border:0;font:inherit;cursor:pointer'
    d.innerHTML = '<form method="dialog">' +
      '<h2 style="margin:0 0 16px;font-size:22px">' + (bless ? 'Send your blessings' : 'Will you join us?') + '</h2>' +
      '<label>Your name<input name="n" required maxlength="80" style="' + field + '"></label>' +
      (bless
        ? '<label>Your blessing<textarea name="m" required maxlength="400" rows="4" style="' + field + '"></textarea></label>'
        : '<fieldset style="border:0;padding:0;margin:0 0 14px"><legend>Coming?</legend>' +
          '<label style="margin-right:16px"><input type="radio" name="c" value="y" required> Yes</label><label><input type="radio" name="c" value="n"> No</label></fieldset>' +
          '<label>How many of you<input name="g" type="number" min="1" max="20" value="1" style="' + field + '"></label>') +
      '<div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" value="x" style="' + btn + ';background:#333;color:inherit">Close</button>' +
      '<button style="' + btn + ';background:#f4f4f4;color:#141414">Send</button></div></form>'
    document.body.appendChild(d)
    d.querySelector('[value=x]').onclick = function () { d.close() }
    d.querySelector('form').onsubmit = function (e) {
      e.preventDefault()
      d.innerHTML = '<p style="margin:0 0 16px">Thank you. This is a sample site, so nothing was sent.</p><button style="' + btn + ';background:#f4f4f4;color:#141414">Close</button>'
      d.querySelector('button').onclick = function () { d.close() }
    }
    d.addEventListener('close', function () { d.remove() })
    d.showModal()
    d.querySelector('input').focus()
  }
})()
