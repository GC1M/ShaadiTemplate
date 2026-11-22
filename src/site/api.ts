// Client for the wedding website API (worker/). Local dev talks to `npm --prefix worker run dev` on :8787;
// production reads the Worker's address from VITE_SITES_API in .env.production.
export const API: string = import.meta.env.VITE_SITES_API ?? (import.meta.env.DEV ? 'http://localhost:8787' : '')

export async function api<T>(path: string, opts: { method?: string; body?: unknown; key?: string } = {}): Promise<T> {
  if (!API) throw new Error('Wedding websites are not switched on yet. Please try again soon.')
  const res = await fetch(`${API}/api/${path}`, {
    method: opts.method ?? 'GET',
    headers: { ...(opts.body !== undefined && { 'Content-Type': 'application/json' }), ...(opts.key && { Authorization: `Bearer ${opts.key}` }) },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  }).catch(() => {
    throw new Error('Could not reach the server. Check your connection and try again.')
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.')
  return data as T
}

// Public links. /w/<slug> is served by public/404.html, which hands it to the app as #/w/<slug>. The edit key
// rides in the fragment so it never reaches a server log.
export const liveLink = (slug: string) => `${location.origin}/w/${slug}`
export const editLink = (slug: string, key: string) => `${location.origin}/w/${slug}/edit#${key}`
