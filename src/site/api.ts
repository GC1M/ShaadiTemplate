// Client for the wedding website API (worker/). Local dev talks to `npm --prefix worker run dev` on :8787;
// production reads the Worker's address from VITE_SITES_API in .env.production. While that is unset, API is empty and the
// "Make yours free" links stay hidden, so the designs can ship before the backend is live.
export const API: string = import.meta.env.VITE_SITES_API ?? (import.meta.env.DEV ? 'http://localhost:8787' : '')

export async function api<T>(path: string, opts: { method?: string; body?: unknown; key?: string } = {}): Promise<T> {
  if (!API) throw new Error('Wedding websites are not switched on yet. Please try again soon.')
  const res = await fetch(`${API}/api/${path}`, {
    method: opts.method ?? 'GET',
    headers: { ...(opts.body !== undefined && { 'Content-Type': 'application/json' }), ...(opts.key && { Authorization: `Bearer ${opts.key}` }) },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body, lean),
  }).catch(() => {
    throw new Error('Could not reach the server. Check your connection and try again.')
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error ?? 'Something went wrong. Please try again.'), { status: res.status })
  return data as T
}

// A photo just picked is held as one data URL, and its `small` repeats it: left out of anything sent or saved (the
// server and startDraft put it back), which halves the size.
export const lean = (k: string, v: unknown) => (k === 'small' && typeof v === 'string' && v.startsWith('data:') ? undefined : v)

// The secret edit key comes off the address as soon as the app loads (analytics reports addresses), and is kept
// for this tab so a reload still opens the editor.
const keys: Record<string, string> = {}
export function keepKey(slug: string, key: string) {
  keys[slug] = key
  try {
    sessionStorage.setItem(`sitekey:${slug}`, key)
  } catch {
    /* kept in memory until the tab reloads */
  }
}
export function editKey(slug: string) {
  try {
    return keys[slug] ?? sessionStorage.getItem(`sitekey:${slug}`) ?? ''
  } catch {
    return keys[slug] ?? ''
  }
}

// Public links. /w/<slug> is served by public/404.html, which hands it to the app (App.tsx). The edit key
// rides in the fragment so it never reaches a server log; App.tsx takes it off the address with keepKey().
export const liveLink = (slug: string) => `${location.origin}/w/${slug}`
export const editLink = (slug: string, key: string) => `${location.origin}/w/${slug}/edit#${key}`
