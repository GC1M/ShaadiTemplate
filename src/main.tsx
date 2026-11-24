import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
// Latin faces
import '@fontsource/cinzel/500.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/300-italic.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/great-vibes/400.css'
import '@fontsource/pinyon-script/400.css'
import '@fontsource/marcellus/400.css'
import '@fontsource/bodoni-moda/400.css'
import '@fontsource/bodoni-moda/400-italic.css'
import '@fontsource/bodoni-moda/700.css'
import '@fontsource/jost/400.css'
import '@fontsource/jost/500.css'
import '@fontsource/mulish/400.css'
import '@fontsource/mulish/600.css'
// One body + one display face per Indian script; unicode-range keeps unused subsets from loading.
import '@fontsource/tiro-devanagari-hindi/400.css'
import '@fontsource/tiro-devanagari-marathi/400.css'
import '@fontsource/amita/400.css'
import '@fontsource/amita/700.css'
import '@fontsource/noto-serif-gujarati/400.css'
import '@fontsource/noto-serif-gujarati/700.css'
import '@fontsource/farsan/400.css'
import '@fontsource/tiro-gurmukhi/400.css'
import '@fontsource/baloo-paaji-2/600.css'
import '@fontsource/tiro-tamil/400.css'
import '@fontsource/arima/600.css'
import '@fontsource/amiri/400.css'
// Display faces for the luxury set (designs-h).
import '@fontsource/rozha-one/400.css'
import '@fontsource/noto-serif-gurmukhi/700.css'
import '@fontsource/noto-serif-tamil/400.css'
import '@fontsource/noto-serif-tamil/700.css'
import '@fontsource/gloock/400.css'
import './index.css'
import { initAnalytics } from './analytics'
import { land, sitePath } from './siteRoutes'

land()
initAnalytics()

// After a deploy, a page opened earlier asks for code files that no longer exist. Reload once to get the new ones
// (the flag stops a loop if the file is really missing); vite:preloadError covers files Vite fetches ahead.
const reloadOnce = () => {
  try {
    if (sessionStorage.getItem('reloaded')) return false
    sessionStorage.setItem('reloaded', '1')
  } catch {
    return false
  }
  location.reload()
  return true
}
const staleCode = (e: unknown) => /dynamically imported module|module script failed|Importing a module|error loading dynamically/i.test(String(e))
addEventListener('vite:preloadError', (e) => reloadOnce() && e.preventDefault())

// Anything that still breaks the page shows a way back instead of a blank screen. The editor's draft is in
// localStorage, so a reload loses nothing.
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(e: unknown) {
    if (staleCode(e)) reloadOnce()
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="grid min-h-svh place-items-center bg-[#fbf7f1] p-6 text-center text-[#2a1a1f]">
        <div className="space-y-4">
          <p className="text-lg">Something went wrong while opening this page.</p>
          <button type="button" onClick={() => location.reload()} className="rounded-full bg-[#4a0e1c] px-6 py-3 text-white">
            Try again
          </button>
        </div>
      </div>
    )
  }
}

// A wedding website page loads only the website code, not the card gallery and editor. The page's static content
// stays in #root until the app is ready, so nothing shifts while the chunk loads.
const { default: App } = await (sitePath(location.pathname) ? import('./SiteApp') : import('./App')).catch((e) => {
  if (!reloadOnce()) throw e
  return new Promise<never>(() => {}) // reloading
})
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </StrictMode>,
)
// A page that loaded fine may reload again after a later deploy.
setTimeout(() => {
  try {
    sessionStorage.removeItem('reloaded')
  } catch {
    /* storage blocked */
  }
}, 10_000)
