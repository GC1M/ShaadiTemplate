import { useEffect, useState } from 'react'
import { api } from './api'
import { LOOKS, lookById, toDesign, type Content } from './designs'
import { useTitle } from './shared'
import { Site } from './WeddingSite'

// A couple's published wedding website (#/w/<slug>, loaded from the sites API), or the editor's live preview
// (#/websites/preview, fed by postMessage from SiteEditor.tsx inside its iframe).

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
  useEffect(() => {
    const on = (e: MessageEvent) => e.origin === location.origin && e.data?.content && setData(e.data)
    addEventListener('message', on)
    parent.postMessage('preview-ready', location.origin)
    return () => removeEventListener('message', on)
  }, [])
  return data ? <Site d={draw(data)} mode="preview" /> : <div className="min-h-svh bg-[#0e0a0c]" />
}

function Hosted({ slug }: { slug: string }) {
  const [data, setData] = useState<SiteData | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api<SiteData>(`sites/${slug}`).then(setData, (e: Error) => setError(e.message))
  }, [slug])
  useTitle(data ? `${data.content.couple.join(' & ')}: our wedding` : 'Wedding website')
  if (error)
    return (
      <Message title="Wedding website">
        {error}{' '}
        <a href="/#/websites" className="text-zari underline underline-offset-4">
          Make your own, free
        </a>
        .
      </Message>
    )
  if (!data) return <div className="min-h-svh bg-[#0e0a0c]" aria-busy="true" />
  return <Site d={draw(data)} mode="hosted" slug={slug} />
}

export default function HostedSite() {
  if (location.hash === '#/websites/preview') return <Preview />
  return <Hosted slug={location.hash.slice(4).split(/[/?]/)[0]} />
}
