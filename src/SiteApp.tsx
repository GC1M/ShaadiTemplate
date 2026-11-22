import { Suspense, useEffect, useState } from 'react'
import { land, sitePath, siteView } from './siteRoutes'

// The app for wedding website pages only (main.tsx picks it by address). Links between website pages change the
// page in place; anything else, the card gallery included, is an ordinary page load.
export default function SiteApp() {
  const [path, setPath] = useState(() => sitePath(location.pathname))
  useEffect(() => {
    const sync = () => {
      land()
      const p = sitePath(location.pathname)
      if (p) setPath(p)
      else location.reload() // back to the gallery: load the card app
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a')
      if (!(a instanceof HTMLAnchorElement) || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.origin !== location.origin) return
      if (!sitePath(a.pathname) || (a.pathname === location.pathname && a.hash)) return
      e.preventDefault()
      history.pushState(null, '', a.href)
      sync()
    }
    document.documentElement.dataset.view = 'site'
    addEventListener('popstate', sync)
    document.addEventListener('click', onClick)
    return () => {
      removeEventListener('popstate', sync)
      document.removeEventListener('click', onClick)
    }
  }, [])
  useEffect(() => {
    scrollTo(0, 0)
  }, [path])
  const Site = siteView(path)
  return (
    <Suspense fallback={<div className="min-h-svh bg-[#0e0a0c]" />}>
      <Site key={path} />
    </Suspense>
  )
}
