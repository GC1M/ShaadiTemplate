import { useEffect, useRef, useState } from 'react'

// Background music for a couple's site: one of a few freely licensed instrumentals (from Wikimedia Commons,
// credited in the player), or a song of their choice from YouTube. YouTube songs play in YouTube's own player, so
// YouTube licenses the music and we host none of it. To keep the video off the page, the player sits
// out of sight behind a play/pause pill. ponytail: YouTube's terms want the player visible (200x200); if YouTube
// blocks playback for the site, show the player again. Content.music holds `track:<id>` or a YouTube link.

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
// Ready-picked parts of film songs, offered in the editor and played on the sample sites. Stored on a site as the
// plain YouTube link, so each plays like a song the couple pasted.
export const SONGS = [
  { id: 'lamhon-1', name: 'In Lamhon Ke Daaman Mein (Jodhaa Akbar), part 1', link: clipLink('ve4IQMlTMuY', 40, 112) },
  { id: 'lamhon-2', name: 'In Lamhon Ke Daaman Mein (Jodhaa Akbar), part 2', link: clipLink('ve4IQMlTMuY', 204, 275) },
  { id: 'kalank', name: 'Kalank title track (Kalank)', link: clipLink('5PoptCZnS6A', 227, 295) },
  { id: 'uchiyaan', name: 'Uchiyaan Dewaraan (Baari 2)', link: clipLink('-Z3Y3EcpJi4', 233, 285) },
]
export const song = (id: string) => SONGS.find((s) => s.id === id)!.link
// 65 -> "1:05", and back.
export const clock = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`
export const unclock = (v: string) => {
  const m = v.trim().match(/^(\d+)(?::(\d{1,2}))?$/)
  return m ? (m[2] === undefined ? Number(m[1]) : Number(m[1]) * 60 + Number(m[2])) : undefined
}

// YouTube's player script, loaded once, for looping just the chosen part (its own loop goes back to 0:00).
type YTPlayer = { getCurrentTime(): number; seekTo(s: number, ahead: boolean): void; playVideo(): void; pauseVideo(): void; isMuted(): boolean; unMute(): void; getPlayerState(): number; loadVideoById(o: { videoId: string; startSeconds?: number; endSeconds?: number }): void; destroy(): void }
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
export function useClipPlayer(box: React.RefObject<HTMLDivElement | null>, id: string, start: number, end: number | undefined, opts: { autoplay?: boolean; width?: number; height?: number; onState?: (state: number) => void } = {}) {
  const player = useRef<YTPlayer | null>(null)
  const clip = useRef({ start, end })
  clip.current = { start, end }
  useEffect(() => {
    let gone = false
    let made: YTPlayer | null = null
    loadYT().then((YT) => {
      if (gone || !box.current) return
      const el = document.createElement('div')
      box.current.replaceChildren(el)
      // The player has none of its methods (playVideo, pauseVideo...) until YouTube says it is ready, so it is
      // handed out only then; until then callers see no player.
      made = new YT.Player(el, {
        videoId: id,
        host: 'https://www.youtube-nocookie.com',
        width: opts.width ?? 240,
        height: opts.height ?? 200,
        playerVars: { autoplay: opts.autoplay ? 1 : 0, start: clip.current.start, ...(clip.current.end && { end: clip.current.end }), playsinline: 1, rel: 0 },
        events: {
          onReady: () => void (player.current = made),
          onStateChange: (e: { data: number }) => {
            opts.onState?.(e.data)
            const { start, end } = clip.current
            if (e.data === YT.PlayerState.ENDED) player.current?.loadVideoById({ videoId: id, startSeconds: start, endSeconds: end })
          },
        },
      })
    })
    return () => {
      gone = true
      made?.destroy()
      player.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  return player
}

// What starts the music: a tap, a key, or starting to scroll. Browsers count only taps and keys as leave to play
// sound, so a scroll starts it only where the browser allows (in the editor's preview after any tap in the editor,
// or a site the guest has played before); elsewhere the first tap still does. Scroll doesn't bubble, so listen in
// the capture phase to hear scrolling inside any box too. Returns the cleanup.
const onStart = (f: (e: Event) => void) => {
  const KEYS = ['pointerup', 'keydown', 'wheel', 'touchmove', 'scroll']
  KEYS.forEach((k) => addEventListener(k, f, { capture: true, passive: true }))
  return () => KEYS.forEach((k) => removeEventListener(k, f, { capture: true }))
}
// In the editor's preview the site's song and the editor's own song samples take turns: each tells the other when
// it starts, and the other pauses.
const PLAYING = 'preview-music-playing'
export const PAUSE = 'preview-music-pause'
const playing = () => parent !== window && parent.postMessage(PLAYING, location.origin)
const onPause = (f: () => void) => {
  const on = (e: MessageEvent) => e.origin === location.origin && e.data === PAUSE && f()
  addEventListener('message', on)
  return () => removeEventListener('message', on)
}
export const onPreviewPlaying = (f: () => void) => {
  const on = (e: MessageEvent) => e.origin === location.origin && e.data === PLAYING && f()
  addEventListener('message', on)
  return () => removeEventListener('message', on)
}

export function Music({ music }: { music?: string }) {
  const track = TRACKS.find((t) => `track:${t.id}` === music)
  const clip = music && !track ? youTubeClip(music) : undefined
  return track ? <TrackPlayer key={track.id} t={track} /> : clip ? <ClipPill key={music} {...clip} /> : null
}

const pill = 'fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full bg-black/75 py-2 pl-3 pr-4 text-[13px] text-white shadow-lg backdrop-blur pointer-coarse:min-h-11'

function TrackPlayer({ t }: { t: Track }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    // The music tries to start as the site loads. Browsers usually allow sound only after a tap, so then it
    // starts with the guest's first tap (usually the opening screen). On a phone only the end of a touch counts
    // as that tap (pointerup), not its start. Until the music actually plays, every tap tries again; a tap on
    // the music button itself is left to the button.
    const start = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[data-music]')) return stop()
      audio.current?.play().then(stop, () => {})
    }
    const stop = onStart(start)
    // Not in the editor's preview, where the couple is typing: there it waits for a tap, a scroll or the button.
    if (!location.pathname.startsWith('/websites/preview')) audio.current?.play().then(stop, () => {})
    // A guest who switches to WhatsApp shouldn't keep hearing it.
    const hide = () => document.hidden && audio.current?.pause()
    document.addEventListener('visibilitychange', hide)
    const unpause = onPause(() => audio.current?.pause())
    return () => {
      stop()
      unpause()
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
      <audio ref={audio} src={t.src} loop preload="none" onPlay={() => (setOn(true), playing())} onPause={() => setOn(false)} />
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

// The YouTube player sits out of sight behind the page; the pill plays and pauses it.
// Like the tracks, the song tries to start as the site opens; not in the editor's preview, where the couple is typing:
// there it waits for a tap, a scroll or the button. The player is made up front either way, so the first tap or
// scroll can start it at once (Safari lets sound start only inside the tap itself, not after a player loads).
function ClipPill({ id, start, end }: { id: string; start: number; end?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const [played, setPlayed] = useState(false)
  const player = useClipPlayer(box, id, start, end, {
    autoplay: !location.pathname.startsWith('/websites/preview'),
    width: 200,
    height: 200,
    // Where the browser blocks sound, YouTube may start the song muted instead, so playing only counts once it is heard.
    onState: (st) => {
      const heard = st === 1 && !player.current?.isMuted()
      setOn(heard)
      if (heard) (setPlayed(true), playing())
    },
  })
  // Before YouTube's player is ready it has none of these, and the next tap tries again.
  const play = () => {
    const p = player.current
    // A scroll sends dozens of events: once the song is starting (playing or loading, with sound), leave it be.
    // Calling playVideo again while it loads sends it back to the start and it never gets going.
    if ([1, 3].includes(p?.getPlayerState?.() ?? -1) && !p?.isMuted?.()) return
    // The editor's song sample must be gone before this one starts: a YouTube player closed while another is
    // starting leaves that one stuck loading at its first second.
    playing()
    p?.unMute?.()
    p?.playVideo?.()
    // Unmuting a song that was already playing muted brings no new state from YouTube.
    if (player.current?.getPlayerState?.() === 1) {
      setOn(true)
      setPlayed(true)
    }
  }
  useEffect(() => {
    // Browsers usually block sound until a tap, so until the song has been heard every tap tries again (and unmutes
    // it); a tap on the music button itself is left to the button.
    if (played) return
    return onStart((e) => !(e.target as Element | null)?.closest?.('[data-music]') && play())
  }, [played, player])
  useEffect(() => {
    // A guest who switches to WhatsApp shouldn't keep hearing it.
    const hide = () => document.hidden && player.current?.pauseVideo()
    document.addEventListener('visibilitychange', hide)
    // Paused for the editor's song sample, it starts again with the next tap or scroll in the preview.
    const unpause = onPause(() => (player.current?.pauseVideo(), setPlayed(false)))
    return () => {
      unpause()
      document.removeEventListener('visibilitychange', hide)
    }
  }, [player])
  return (
    <>
      <div ref={box} aria-hidden className="pointer-events-none fixed bottom-0 left-0 -z-10 size-[200px] opacity-0" />
      <button type="button" data-music onClick={() => (on ? player.current?.pauseVideo() : play())} aria-pressed={on} className={pill}>
        <span aria-hidden>{on ? '❚❚' : '♪'}</span> {on ? 'Pause our song' : 'Play our song'}
      </button>
    </>
  )
}
