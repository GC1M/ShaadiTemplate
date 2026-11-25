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

export function Music({ music }: { music?: string }) {
  const track = TRACKS.find((t) => `track:${t.id}` === music)
  const yt = music && !track ? youTubeId(music) : undefined
  return track ? <TrackPlayer key={track.id} t={track} /> : yt ? <YouTubeDock key={yt} id={yt} /> : null
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

function YouTubeDock({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className={pill}>
        <span aria-hidden>♪</span> Play our song
      </button>
    )
  return (
    <div className="fixed bottom-3 left-3 z-50 overflow-hidden rounded-lg bg-black shadow-xl">
      <button type="button" onClick={() => setOpen(false)} className="flex w-full items-center justify-between px-3 py-1.5 text-[12px] text-white/85 pointer-coarse:min-h-11">
        Our song <span aria-hidden>✕</span>
        <span className="sr-only">Stop and close</span>
      </button>
      <iframe
        width={240}
        height={200}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&playsinline=1&rel=0`}
        title="Our song on YouTube"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="block"
      />
    </div>
  )
}
