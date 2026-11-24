import { useEffect, useState } from 'react'
import { api } from './api'
import { LOOKS, lookById, toDesign, type Content } from './designs'
import { useTitle } from './shared'
import { Site } from './WeddingSite'

// A couple's published wedding website (/w/<slug>, loaded from the sites API), or the editor's live preview
// (/websites/preview, fed by postMessage from SiteEditor.tsx inside its iframe).

export type SiteData = { look: string; content: Content }
const draw = (s: SiteData) => toDesign(lookById(s.look) ?? LOOKS[0], s.content)

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="velvet grid min-h-svh place-items-center px-6 text-center text-rose">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-rose/75">{children}</p>
      </div>
    </main>
  )
}

function Preview() {
  const [data, setData] = useState<SiteData | null>(null)
  const [run, setRun] = useState(0) // "Replay the opening" in the editor starts the site again from its gate
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== location.origin) return
      if (e.data === 'preview-replay') (scrollTo(0, 0), setRun((n) => n + 1))
      else if (e.data?.content) setData(e.data)
    }
    addEventListener('message', on)
    parent.postMessage('preview-ready', location.origin)
    return () => removeEventListener('message', on)
  }, [])
  return data ? <Site key={run} d={draw(data)} mode="preview" /> : <div className="min-h-svh bg-[#0e0a0c]" />
}

function Hosted({ slug }: { slug: string }) {
  const [data, setData] = useState<SiteData | null>(null)
  const [error, setError] = useState<{ message: string; status?: number } | null>(null)
  const [tries, setTries] = useState(0)
  useEffect(() => {
    setError(null)
    api<SiteData>(`sites/${slug}`).then(setData, (e: Error & { status?: number }) => setError({ message: e.message, status: e.status }))
  }, [slug, tries])
  useTitle(data ? `${data.content.couple.join(' & ')}: our wedding` : 'Wedding website')
  if (error)
    return (
      <Message title="Wedding website">
        {error.message}{' '}
        {/* No such site (404) or taken down (410) won't change on a retry; a lost connection or server hiccup may. */}
        {error.status === 404 || error.status === 410 ? (
          <>
            <a href="/websites/" className="text-zari underline underline-offset-4">
              Make your own, free
            </a>
            .
          </>
        ) : (
          <button type="button" onClick={() => setTries((n) => n + 1)} className="text-zari underline underline-offset-4">
            Try again
          </button>
        )}
      </Message>
    )
  if (!data)
    return (
      <div className="grid min-h-svh place-items-center bg-[#0e0a0c] text-[#e9d9b8]/70" aria-busy="true">
        <p className="animate-pulse tracking-wide">Opening the invitation…</p>
      </div>
    )
  return <Site d={draw(data)} mode="hosted" slug={slug} />
}

export default function HostedSite() {
  if (location.pathname.startsWith('/websites/preview')) return <Preview />
  return <Hosted slug={location.pathname.split('/')[2]} />
}
