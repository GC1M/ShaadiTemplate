import { StrictMode } from 'react'
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

// A wedding website page loads only the website code, not the card gallery and editor. The page's static content
// stays in #root until the app is ready, so nothing shifts while the chunk loads.
const { default: App } = await (sitePath(location.pathname) ? import('./SiteApp') : import('./App'))
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
