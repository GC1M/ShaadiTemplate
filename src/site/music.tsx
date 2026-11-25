import { useEffect, useRef, useState } from 'react'

// Background music for a couple's site: one of a few freely licensed instrumentals (from Wikimedia Commons,
// credited in the player), or a song of their choice from YouTube. YouTube songs play in YouTube's own visible
// player, so YouTube licenses the music and we host none of it; its rules want the player at least 200x200 and
// on screen while it plays, so closing it stops the song. Content.music holds `track:<id>` or a YouTube link.

export type Track = { id: string; name: string; src: string; by: string; licence: string; file: string }

const commons = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/transcoded/${path}/${path.split('/').pop()}.mp3`
export const TRACKS: Track[] = [
  { id: 'yaman', name: 'Sitar, Raag Yaman', src: commons('1/14/Sitar_sample_yaman.ogg'), by: 'Tito Dutta', licence: 'CC BY-SA 3.0', file: 'Sitar sample yaman.ogg' },
  { id: 'sri', name: 'Sitar and tabla, Raag Sri', src: commons('8/85/RagaSri_%2C_Ranjit_Makkuni.ogg'), by: 'Ranjit Makkuni', licence: 'CC BY-SA 3.0', file: 'RagaSri , Ranjit Makkuni.ogg' },
  { id: 'flute', name: 'Carnatic flute, Mayamalavagowla', src: commons('0/0f/Carnatic_flute.ogg'), by: 'Bansuri.arvind', licence: 'CC BY-SA 3.0', file: 'Carnatic flute.ogg' },
]

// The video id in any of the usual YouTube links (watch, youtu.be, shorts, embed, music.youtube.com).
export const youTubeId = (url: string) => url.trim().match(/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})(?:[?&#/]|$)/)?.[1]

// The part of the song that loops: `start` and `end` in seconds on the link (?start=65&end=150). YouTube's own
// "Share, Start at" adds ?t=65 (or 1m5s), which counts as the start.
const secs = (v: string | null) => {
  if (!v) return undefined
  const m = v.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/)
  const n = m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : NaN
  return Number.isFinite(n) && n > 0 ? n : undefined
}
export const youTubeClip = (url: string) => {
  const id = youTubeId(url)
  if (!id) return undefined
  const q = new URLSearchParams(url.split(/[?#]/).slice(1).join('&'))
  const start = secs(q.get('start')) ?? secs(q.get('t'))
  const end = secs(q.get('end'))
  return { id, start: start ?? 0, end: end && end > (start ?? 0) ? end : undefined }
}
export const clipLink = (id: string, start = 0, end?: number) => `https://youtu.be/${id}${start || end ? `?${new URLSearchParams({ ...(start && { start: String(start) }), ...(end && { end: String(end) }) })}` : ''}`
// 65 -> "1:05", and back.
export const clock = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`
export const unclock = (v: string) => {
  const m = v.trim().match(/^(\d+)(?::(\d{1,2}))?$/)
  return m ? (m[2] === undefined ? Number(m[1]) : Number(m[1]) * 60 + Number(m[2])) : undefined
}

// YouTube's player script, loaded once, for looping just the chosen part (its own loop goes back to 0:00).
type YTPlayer = { getCurrentTime(): number; seekTo(s: number, ahead: boolean): void; playVideo(): void; pauseVideo(): void; loadVideoById(o: { videoId: string; startSeconds?: number; endSeconds?: number }): void; destroy(): void }
type YTApi = { Player: new (el: HTMLElement, o: object) => YTPlayer; PlayerState: { ENDED: number } }
let api: Promise<YTApi> | undefined
const loadYT = () =>
  (api ??= new Promise<YTApi>((resolve) => {
    const w = window as unknown as { YT?: YTApi; onYouTubeIframeAPIReady?: () => void }
    if (w.YT?.Player) return resolve(w.YT)
    w.onYouTubeIframeAPIReady = () => resolve(w.YT!)
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  }))

// A YouTube player that plays [start, end) and goes back to start each time the part ends.
export function useClipPlayer(box: React.RefObject<HTMLDivElement | null>, id: string, start: number, end: number | undefined, opts: { autoplay?: boolean; width?: number; height?: number } = {}) {
  const player = useRef<YTPlayer | null>(null)
  const clip = useRef({ start, end })
  clip.current = { start, end }
  useEffect(() => {
    let gone = false
    loadYT().then((YT) => {
      if (gone || !box.current) return
      const el = document.createElement('div')
      box.current.replaceChildren(el)
      player.current = new YT.Player(el, {
        videoId: id,
        host: 'https://www.youtube-nocookie.com',
        width: opts.width ?? 240,
        height: opts.height ?? 200,
        playerVars: { autoplay: opts.autoplay ? 1 : 0, start: clip.current.start, ...(clip.current.end && { end: clip.current.end }), playsinline: 1, rel: 0 },
        events: {
          onStateChange: (e: { data: number }) => {
            const { start, end } = clip.current
            if (e.data === YT.PlayerState.ENDED) player.current?.loadVideoById({ videoId: id, startSeconds: start, endSeconds: end })
          },
        },
      })
    })
    return () => {
      gone = true
      player.current?.destroy()
      player.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  return player
}

export function Music({ music }: { music?: string }) {
  const track = TRACKS.find((t) => `track:${t.id}` === music)
  const clip = music && !track ? youTubeClip(music) : undefined
  return track ? <TrackPlayer key={track.id} t={track} /> : clip ? <YouTubeDock key={music} {...clip} /> : null
}

const pill = 'fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full bg-black/75 py-2 pl-3 pr-4 text-[13px] text-white shadow-lg backdrop-blur pointer-coarse:min-h-11'

function TrackPlayer({ t }: { t: Track }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    // Browsers allow sound only after a tap, so the music starts with the guest's first tap (usually the
    // opening screen). On a phone only the end of a touch counts as that tap (pointerup), not its start. Until
    // the music actually plays, every tap tries again; a tap on the music button itself is left to the button.
    const KEYS = ['pointerup', 'keydown']
    const start = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[data-music]')) return stop()
      audio.current?.play().then(stop, () => {})
    }
    const stop = () => KEYS.forEach((k) => removeEventListener(k, start))
    KEYS.forEach((k) => addEventListener(k, start))
    // A guest who switches to WhatsApp shouldn't keep hearing it.
    const hide = () => document.hidden && audio.current?.pause()
    document.addEventListener('visibilitychange', hide)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', hide)
    }
  }, [])
  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }
  return (
    <div data-music className={pill}>
      <audio ref={audio} src={t.src} loop preload="none" onPlay={() => setOn(true)} onPause={() => setOn(false)} />
      <button type="button" onClick={toggle} aria-pressed={on} aria-label={on ? 'Pause the music' : 'Play the music'} className="grid size-7 place-items-center rounded-full bg-white/15">
        {on ? '❚❚' : '♪'}
      </button>
      <span className="leading-tight">
        {t.name}
        <a href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(t.file)}`} target="_blank" rel="noreferrer" className="block text-[11px] text-white/70 underline underline-offset-2">
          {t.by}, {t.licence}
        </a>
      </span>
    </div>
  )
}

function YouTubeDock({ id, start, end }: { id: string; start: number; end?: number }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    // Like the tracks: the song opens with the guest's first tap (usually the opening screen), since browsers
    // allow sound only after one. A tap on the music button itself is left to the button.
    const KEYS = ['pointerup', 'keydown']
    const go = (e: Event) => {
      stop()
      if (!(e.target as Element | null)?.closest?.('[data-music]')) setOpen(true)
    }
    const stop = () => KEYS.forEach((k) => removeEventListener(k, go))
    KEYS.forEach((k) => addEventListener(k, go))
    return stop
  }, [])
  if (!open)
    return (
      <button type="button" data-music onClick={() => setOpen(true)} className={pill}>
        <span aria-hidden>♪</span> Play our song
      </button>
    )
  return (
    <div data-music className="fixed bottom-3 left-3 z-50 overflow-hidden rounded-lg bg-black shadow-xl">
      <button type="button" onClick={() => setOpen(false)} className="flex w-full items-center justify-between px-3 py-1.5 text-[12px] text-white/85 pointer-coarse:min-h-11">
        Our song <span aria-hidden>✕</span>
        <span className="sr-only">Stop and close</span>
      </button>
      <ClipFrame id={id} start={start} end={end} />
    </div>
  )
}

// Opened by the guest's tap, so it may start with sound.
function ClipFrame({ id, start, end }: { id: string; start: number; end?: number }) {
  const box = useRef<HTMLDivElement>(null)
  useClipPlayer(box, id, start, end, { autoplay: true })
  return <div ref={box} className="h-[200px] w-[240px]" title="Our song on YouTube" />
}
