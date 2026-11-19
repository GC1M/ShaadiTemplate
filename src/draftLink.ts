import type { Invite } from './types'

// A card draft as a link, so a family can start on one device and finish on another: the invite without its photos,
// deflated into the address's fragment (#draft=...), which browsers never send to a server. Photos stay behind; they
// would make the link far too long to send. "z" marks deflated text, "j" plain JSON from a browser without
// CompressionStream.
const b64 = (bytes: Uint8Array) => {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
const pipe = async (bytes: Uint8Array, t: CompressionStream | DecompressionStream) => new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(t)).arrayBuffer())

export async function draftLink(invite: Invite) {
  const { photos: _photos, ...rest } = invite
  const json = new TextEncoder().encode(JSON.stringify(rest))
  const z = typeof CompressionStream === 'function'
  return `${location.origin}/#draft=${z ? 'z' : 'j'}${b64(z ? await pipe(json, new CompressionStream('deflate-raw')) : json)}`
}

let pending = ''
// Takes the draft off the address. land() calls it before analytics starts, so no report ever carries a family's names.
export function catchDraft() {
  if (!location.hash.startsWith('#draft=')) return
  pending = location.hash.slice(7)
  history.replaceState(null, '', location.pathname + location.search)
}

// The draft from the link this page was opened with, once; null if there was none or it is damaged (cut short in a
// message, say).
export async function takeDraft(): Promise<Invite | null> {
  const code = pending
  pending = ''
  if (!code) return null
  try {
    let bytes = unb64(code.slice(1))
    if (code[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'))
    const inv = JSON.parse(new TextDecoder().decode(bytes))
    const ok = inv?.version === 2 && typeof inv.templateId === 'string' && Array.isArray(inv.pages) && inv.pages.length > 0 && inv.pages.every((p: { kind?: string }) => p?.kind === 'cover' || p?.kind === 'sections')
    return ok ? inv : null
  } catch {
    return null
  }
}
