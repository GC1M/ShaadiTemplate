import { useEffect, useState, type FormEvent } from 'react'

// Anonymous star reviews, stored in Firestore through its REST API (no SDK). New reviews are saved with
// approved: true and show at once; the owner deletes spam (or sets approved to false) in the Firebase console. The
// rules are in firestore.rules. The key is public by design: the rules and the key's website restriction protect the data.
const KEY = 'AIzaSyBNaDeW4DgB_ynVWcgO1-n0Cv1_aKjybkc'
const DB = 'https://firestore.googleapis.com/v1/projects/shaaditemplate-reviews/databases/(default)/documents'
const SENT = 'review-sent'

type Review = { stars: number; name: string; text: string; created: string }
type Doc = { document?: { fields: { stars: { integerValue: string }; name: { stringValue: string }; text: { stringValue: string }; created: { timestampValue: string } } } }

async function loadReviews(): Promise<Review[]> {
  const res = await fetch(`${DB}:runQuery?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        where: { fieldFilter: { field: { fieldPath: 'approved' }, op: 'EQUAL', value: { booleanValue: true } } },
        limit: 200,
      },
    }),
  })
  if (!res.ok) throw new Error(String(res.status))
  const rows: Doc[] = await res.json()
  return rows
    .flatMap((r) => (r.document ? [r.document.fields] : []))
    .map((f) => ({ stars: Number(f.stars.integerValue), name: f.name.stringValue, text: f.text.stringValue, created: f.created.timestampValue }))
    // Best first: most stars, then ones with words, then newest. Sorted here to skip a composite index.
    .sort((a, b) => b.stars - a.stars || Number(!!b.text) - Number(!!a.text) || b.created.localeCompare(a.created))
}

// A small speech bubble above the control it points at, read out at once by screen readers.
const Tip = ({ children }: { children: string }) => (
  <p role="alert" className="absolute bottom-full left-0 z-10 mb-2 rounded bg-wine px-3 py-1.5 text-sm text-white shadow-lg">
    <span className="absolute -bottom-1 left-5 size-2 rotate-45 bg-wine" aria-hidden="true" />
    {children}
  </p>
)

const Stars = ({ n, size = 18 }: { n: number; size?: number }) => (
  <span className="inline-flex text-zari" aria-label={`${n} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 24 24" width={size} height={size} fill={i <= Math.round(n) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
      </svg>
    ))}
  </span>
)

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState('')
  const [anon, setAnon] = useState(false)
  const [text, setText] = useState('')
  const [start, setStart] = useState(0)
  const [paused, setPaused] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'nostar'>(() => {
    try {
      return localStorage.getItem(SENT) ? 'sent' : 'idle'
    } catch {
      return 'idle'
    }
  })

  useEffect(() => {
    loadReviews().then(setReviews, () => setReviews([]))
  }, [])

  const pool = reviews?.filter((r) => r.stars >= 4 && r.text).length ?? 0
  useEffect(() => {
    if (pool <= 3 || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setStart((s) => s + 1), 6000)
    return () => clearInterval(id)
  }, [pool, paused])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Bots fill every field; people never see this one.
    if (new FormData(e.currentTarget).get('website')) return setState('sent')
    if (!stars) return setState('nostar')
    setState('sending')
    const res = await fetch(`${DB}/reviews?key=${KEY}`, {
      method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          stars: { integerValue: String(stars) },
          name: { stringValue: (!anon && name.trim().slice(0, 40)) || 'Anonymous' },
          text: { stringValue: text.trim().slice(0, 500) },
          approved: { booleanValue: true },
          created: { timestampValue: new Date().toISOString() },
        },
      }),
    }).catch(() => null)
    if (!res?.ok) return setState('error')
    try {
      localStorage.setItem(SENT, '1')
    } catch {
      /* private mode: the review is still saved */
    }
    setState('sent')
    loadReviews().then(setReviews, () => {})
  }

  const total = reviews?.length ?? 0
  const avg = total ? reviews!.reduce((s, r) => s + r.stars, 0) / total : 0
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews?.filter((r) => r.stars === n).length ?? 0 }))
  const top = Math.max(1, ...counts.map((x) => x.c))
  // Examples: only good reviews that say something.
  const good = reviews?.filter((r) => r.stars >= 4 && r.text).slice(0, 12) ?? []
  // Three at a time; with more than three, rotate one step every 6s (paused on hover or focus, off for reduced motion).
  const shown = good.length > 3 ? [0, 1, 2].map((i) => good[(start + i) % good.length]) : good

  // Any edit dismisses a showing tooltip, so it never sits over what the person is fixing.
  const edited = () => {
    if (state === 'nostar' || state === 'error') setState('idle')
  }

  const form = (
    <form onSubmit={submit} className="h-fit rounded-lg border border-zari/40 bg-white/80 p-5">
      {state === 'sent' ? (
        <p className="text-ink/80">Thank you! Your review has been added.</p>
      ) : (
        <>
          <p className="font-medium text-ink">Rate ShaadiTemplate</p>
          <div className="relative mt-2 w-fit">
            <div className="flex gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" role="radio" aria-checked={stars === i} aria-label={`${i} star${i > 1 ? 's' : ''}`} onClick={() => {
                  setStars(i)
                  edited()
                }} onMouseEnter={() => setHover(i)} className="text-zari">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill={i <= (hover || stars) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
                  </svg>
                </button>
              ))}
            </div>
            {state === 'nostar' && <Tip>Tap a star to rate first.</Tip>}
          </div>
          {/* The whole row is the switch, so the words are a tap target too. */}
          <button type="button" role="switch" aria-checked={anon} onClick={() => setAnon(!anon)} className="mt-4 flex w-full items-center justify-between gap-3 text-left text-sm text-ink/70">
            Post anonymously
            <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${anon ? 'bg-wine' : 'bg-ink/20'}`}>
              <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${anon ? 'translate-x-5' : ''}`} />
            </span>
          </button>
          {!anon && (
            <label className="mt-3 block text-sm text-ink/70">
              Your name (optional)
              <input value={name} onChange={(e) => {
                setName(e.target.value)
                edited()
              }} maxLength={40} className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-ink" />
            </label>
          )}
          <label className="mt-3 block text-sm text-ink/70">
            Your review (optional)
            <textarea value={text} onChange={(e) => {
                setText(e.target.value)
                edited()
              }} maxLength={500} rows={4} className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2 text-ink" />
          </label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
          <div className="relative mt-4">
            <button type="submit" disabled={state === 'sending'} className="w-full rounded bg-wine px-4 py-2.5 font-medium text-white disabled:opacity-60">
              {state === 'sending' ? 'Sending…' : 'Send review'}
            </button>
            {state === 'error' && <Tip>Could not send. Check your connection or ad blocker, then try again.</Tip>}
          </div>
        </>
      )}
    </form>
  )

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="font-display text-3xl tracking-tight text-wine sm:text-4xl">What families say</h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" width="40" height="40" className="text-zari" fill="currentColor" aria-hidden="true">
              <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
            </svg>
            <p className="leading-tight">
              <span className="text-3xl font-semibold text-ink">{total ? avg.toFixed(1) : '–'}</span>
              <span className="text-lg text-ink/50">/5</span>
              <span className="block text-sm text-ink/55">
                {total} {total === 1 ? 'rating' : 'ratings'}
              </span>
            </p>
          </div>
          <dl className="mt-6 grid max-w-xl gap-2">
            {counts.map(({ n, c }) => (
              <div key={n} className="grid grid-cols-[3.5rem_1fr_6.5rem] items-center gap-3 text-sm">
                <dt className="font-medium text-ink">{n} star{n > 1 ? 's' : ''}</dt>
                <div className="h-3 rounded-full bg-ink/10">
                  <div className="h-3 rounded-full bg-zari" style={{ width: `${(c / top) * 100}%` }} />
                </div>
                <dd className="text-ink/60">
                  {total ? Math.round((c / total) * 100) : 0}% ({c})
                </dd>
              </div>
            ))}
          </dl>
          {reviews?.length === 0 && <p className="mt-6 text-ink/60">No reviews yet. Be the first to tell us how your card turned out.</p>}
        </div>

        {form}
      </div>

      {good.length > 0 && (
        <div className="mt-10 grid gap-4 md:grid-cols-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          {shown.map((r, i) => (
            <figure key={`${start}-${i}`} className="review-in rounded-lg border border-ink/10 bg-white/70 p-5" style={{ animationDelay: `${i * 90}ms` }}>
              <Stars n={r.stars} size={16} />
              {r.text && <blockquote className="mt-2 leading-relaxed text-ink/85">{r.text}</blockquote>}
              <figcaption className="mt-3 text-sm text-ink/55">
                {r.name} · {new Date(r.created).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
