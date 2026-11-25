import { useEffect, useMemo, useRef, useState } from 'react'
import { H, W, buildShots, detectBeat, drawFrame, duration, fill, loadFonts, makeLook, synthBeat, type Look, type Media, type Words } from './engine'
import { FORMATS, type Format } from './formats'
import { SAMPLES, loadSample, sampleLink, sampleSrc } from './samples'
import { clock, useClipPlayer, youTubeClip } from '../site/music'

// Reel maker: pick a format that's going viral on Instagram, drop in wedding photos and clips, get a graded, beat-cut
// 9:16 MP4. Rendered on the phone
// (canvas + MediaRecorder, clocked by the audio), so it takes as long as the reel itself and nothing is uploaded.

interface Item {
  url: string
  src: Media
  kind: 'image' | 'video'
  name: string
}
interface Song {
  buf: AudioBuffer
  name: string
  bpm: number
  offset: number
}

let ac: AudioContext | undefined
const audio = () => (ac ??= new AudioContext())

const isVideo = (f: File) => f.type.startsWith('video/') || /\.(mp4|mov|m4v|webm|3gp)$/i.test(f.name)

async function load(f: File): Promise<Item> {
  const url = URL.createObjectURL(f)
  try {
    if (isVideo(f)) {
      const v = Object.assign(document.createElement('video'), { src: url, muted: true, playsInline: true, preload: 'auto' })
      v.style.cssText = 'position:fixed;left:-10px;top:0;width:1px;height:1px;opacity:0;pointer-events:none'
      document.body.append(v) // iOS decodes off-DOM video as black
      await new Promise((ok, fail) => {
        v.onloadeddata = ok
        v.onerror = fail
        setTimeout(() => fail(new Error('timeout')), 10_000)
        v.currentTime = 0.01 // iOS ignores preload until asked for a frame
      })
      return { url, src: v, kind: 'video', name: f.name }
    }
    // Photos: one gentle grade baked in at load (free per frame), capped at 1600 px so 15 photos fit in a phone's memory.
    const raw = await createImageBitmap(f)
    const k = Math.min(1, 1600 / Math.max(raw.width, raw.height))
    const c = Object.assign(document.createElement('canvas'), { width: Math.round(raw.width * k), height: Math.round(raw.height * k) })
    const x = c.getContext('2d')!
    x.filter = 'contrast(1.06) saturate(1.12)'
    x.drawImage(raw, 0, 0, c.width, c.height)
    raw.close()
    return { url, src: await createImageBitmap(c), kind: 'image', name: f.name }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
}

function drop(i: Item) {
  URL.revokeObjectURL(i.url)
  if (i.src instanceof HTMLVideoElement) i.src.remove()
  else i.src.close()
}

type Player = ReturnType<typeof useClipPlayer>

// Any song on YouTube, played in YouTube's own visible player (YouTube licenses the music; we host none). Its audio
// can't be recorded into the reel, so the export is silent and timed to the song, which the family adds in Instagram.
function YouTubeSong({ id, start, holder, playing }: { id: string; start: number; holder: { current?: Player }; playing: { current: boolean } }) {
  const box = useRef<HTMLDivElement>(null)
  holder.current = useClipPlayer(box, id, start, undefined, { width: 240, height: 200, onState: (s) => (playing.current = s === 1) })
  return <div ref={box} className="h-[200px] w-[240px] overflow-hidden rounded-xl bg-black" />
}

const pickMime = () =>
  ['video/mp4;codecs="avc1.42E01E,mp4a.40.2"', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m))

export default function Reel() {
  const [format, setFormat] = useState<Format>(FORMATS[0])
  const [items, setItems] = useState<Item[]>([])
  const [words, setWords] = useState<Words>({ names: 'Riya & Arjun', date: '12.02.2027', caption: FORMATS[0].caption ?? '' })
  const [music, setMusic] = useState<'beat' | 'song' | 'yt' | 'none'>('beat')
  const [song, setSong] = useState<Song>()
  const [bpmText, setBpmText] = useState('')
  const [ytLink, setYtLink] = useState('')
  const [ytBpm, setYtBpm] = useState<number>()
  const [taps, setTaps] = useState<number[]>([])
  const ytPlayer = useRef<Player>(undefined)
  const ytPlaying = useRef(false)
  const [beat, setBeat] = useState<{ id: string; buf: AudioBuffer }>()
  const [samples, setSamples] = useState<{ id: string; media: (Media | undefined)[] }>()
  const [sampleReady, setSampleReady] = useState<string>()
  const [state, setState] = useState<'idle' | 'playing' | 'recording'>('idle')
  const [progress, setProgress] = useState(0)
  const [scrub, setScrub] = useState(1.2)
  const [fonts, setFonts] = useState(0)
  const [msg, setMsg] = useState('')
  const [out, setOut] = useState<{ url: string; file: File }>()
  const canvas = useRef<HTMLCanvasElement>(null)
  const replaceAt = useRef(0)
  const replaceInput = useRef<HTMLInputElement>(null)
  const stop = useRef<(why?: string) => void>(undefined)
  const look = useRef<{ grade: string; look: Look }>(undefined)
  const live = useRef({ items, out })
  live.current = { items, out }

  const clip = useMemo(() => youTubeClip(ytLink), [ytLink])
  const yt = music === 'yt' && clip
  const bpm = music === 'song' && song ? song.bpm : yt ? (ytBpm ?? format.bpm) : format.bpm
  const keys = format.samples ?? []
  const sample = !items.length // nothing added yet: the format plays with its sample photos
  const sampleMedia = samples?.id === format.id ? samples.media : []
  const shots = useMemo(() => buildShots(format, bpm, sample ? sampleMedia : items.map((i) => i.src)), [format, bpm, items, sample, sampleMedia])
  const beatBuf = beat?.id === format.id ? beat.buf : undefined
  const autoplay = useRef<string>(undefined)
  const total = duration(shots)
  const slots = format.slots
  const busy = state !== 'idle'

  // Hide the home page's static sections, which sit outside the app root.
  useEffect(() => {
    document.documentElement.dataset.view = 'editor'
    return () => {
      live.current.items.forEach(drop)
      if (live.current.out) URL.revokeObjectURL(live.current.out.url)
    }
  }, [])


  useEffect(() => {
    let on = true
    loadFonts(words).then(() => on && setFonts((n) => n + 1))
    return () => void (on = false)
  }, [words])

  // The built-in track, made for this format's tempo and length.
  useEffect(() => {
    if (!total) return
    let on = true
    synthBeat(format.bpm, total + 1, format.beat).then((buf) => on && setBeat({ id: format.id, buf }))
    return () => void (on = false)
  }, [format, total])

  // The format's sample photos and clips, shown as they arrive; one that fails stays a numbered card.
  useEffect(() => {
    let on = true
    const media: (Media | undefined)[] = keys.map(() => undefined)
    setSamples({ id: format.id, media: [...media] })
    let left = keys.length
    keys.forEach((k, i) =>
      loadSample(k)
        .then((m) => (media[i] = m), () => {})
        .finally(() => {
          left--
          if (on) setSamples({ id: format.id, media: [...media] })
          if (on && !left) setSampleReady(format.id)
        })
    )
    return () => void (on = false)
  }, [format]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tapping a format plays its sample once everything it needs has loaded.
  useEffect(() => {
    if (autoplay.current !== format.id || !beatBuf || state !== 'idle' || (sample && keys.length && sampleReady !== format.id)) return
    autoplay.current = undefined
    play(false)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const getLook = () => {
    const ctx = canvas.current!.getContext('2d')!
    if (look.current?.grade !== format.grade) look.current = { grade: format.grade, look: makeLook(ctx, format.grade) }
    return look.current.look
  }

  // Still frame (and the scrubber) when not playing.
  useEffect(() => {
    if (busy) return
    const ctx = canvas.current!.getContext('2d')!
    const t = Math.min(scrub, total - 0.01)
    drawFrame(ctx, format, shots, getLook(), words, t)
  }, [format, shots, scrub, words, fonts, busy]) // eslint-disable-line react-hooks/exhaustive-deps

  async function add(files: FileList | null, at?: number) {
    const res = await Promise.allSettled(Array.from(files ?? []).map(load))
    const ok = res.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
    const bad = Array.from(files ?? []).filter((_, i) => res[i].status === 'rejected')
    setMsg(bad.length ? `Could not open ${bad.map((f) => f.name).join(', ')}. Use JPG, PNG or MP4.` : '')
    setItems((cur) => {
      if (at === undefined || at >= cur.length) return [...cur, ...ok]
      const next = [...cur]
      drop(next[at])
      next[at] = ok[0] ?? next[at]
      return next
    })
  }

  function play(record: boolean) {
    // Everything up to the first await runs inside the tap, which iOS needs before it will play sound.
    const a = audio()
    a.resume()
    const buf = music === 'song' ? song?.buf : music === 'beat' ? beatBuf : undefined
    const ctx = canvas.current!.getContext('2d')!
    const lk = getLook()
    const dest = record ? a.createMediaStreamDestination() : undefined
    const node = buf && a.createBufferSource()
    if (node) {
      node.buffer = buf
      const g = a.createGain()
      node.connect(g)
      g.connect(a.destination)
      if (dest) g.connect(dest)
    }
    const startAt = a.currentTime + 0.2
    const p0 = performance.now()
    node?.start(startAt, music === 'song' ? song!.offset : 0)
    // A YouTube song starts in the same tap and sets the clock once it's actually playing.
    const player = yt ? ytPlayer.current?.current : undefined
    if (yt && !player) return setMsg('The YouTube player is still loading. Try again in a moment.')
    ytPlaying.current = false
    const ytStart = clip?.start ?? 0
    player?.seekTo(ytStart, true)
    player?.playVideo()
    let anchor = 0
    let ytAt = -1

    const videos = [...new Set(shots.flatMap((s) => (s.src instanceof HTMLVideoElement ? [s.src] : [])))]
    videos.forEach((v) => {
      v.pause()
      v.currentTime = 0
    })

    let rec: MediaRecorder | undefined
    let track: CanvasCaptureMediaStreamTrack | undefined
    if (record) {
      const stream = canvas.current!.captureStream(0) // a frame only when we draw one
      track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack
      dest?.stream.getAudioTracks().forEach((t) => node && stream.addTrack(t))
      rec = new MediaRecorder(stream, { mimeType: pickMime(), videoBitsPerSecond: 8_000_000 })
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      rec.onstop = () => {
        if (!chunks.length) return
        const type = rec!.mimeType.split(';')[0]
        const file = new File(chunks, `${format.id}-reel.${type.includes('mp4') ? 'mp4' : 'webm'}`, { type })
        setOut((o) => {
          if (o) URL.revokeObjectURL(o.url)
          return { url: URL.createObjectURL(file), file }
        })
      }
    }
    let lock: WakeLockSentinel | undefined
    navigator.wakeLock?.request('screen').then((l) => (lock = l), () => {})

    setMsg('')
    setState(record ? 'recording' : 'playing')
    let shown = -1
    let raf = 0
    let shownAt = 0
    let drawnAt = -1
    let aborted = false
    const onHide = () => document.hidden && record && end('Keep this screen open while your reel is made. Tap Make my reel again.')
    document.addEventListener('visibilitychange', onHide)
    function end(why?: string) {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onHide)
      try {
        node?.stop()
      } catch {
        /* not started */
      }
      videos.forEach((v) => v.pause())
      player?.pauseVideo()
      lock?.release()
      aborted = !!why
      if (rec?.state === 'recording') {
        if (aborted) rec.ondataavailable = null
        rec.stop()
      }
      setMsg(why ?? '')
      setProgress(0)
      setState('idle')
    }
    stop.current = end
    const tick = () => {
      // The audio clock keeps cuts on the beat; if the browser keeps audio suspended, fall back to wall time.
      let t = a.state === 'running' ? a.currentTime - startAt : (performance.now() - p0) / 1000 - 0.2
      if (player) {
        // YouTube reports its time in coarse steps: run on wall time, nudged by each new value. A big jump (the song
        // looping back, or a seek) is ignored, so the reel never rewinds.
        const now = performance.now()
        const cur = ytPlaying.current ? player.getCurrentTime() : -1
        const at = now - (cur - ytStart) * 1000
        if (cur >= 0 && cur !== ytAt && (ytAt < 0 || Math.abs(at - anchor) < 2000)) (ytAt = cur), (anchor = at)
        t = ytAt < 0 ? -1 : (now - anchor) / 1000
      }
      let i = 0
      while (i < shots.length - 1 && t >= shots[i + 1].start) i++
      if (t >= 0 && i !== shown) {
        // Start this shot's clip and cue the next one to its first frame, so cuts never wait on a seek.
        const cur = shots[i].src
        const prev = shots[shown]?.src
        if (prev instanceof HTMLVideoElement && prev !== cur) prev.pause()
        if (cur instanceof HTMLVideoElement) {
          const speed = shots[i].slot.speed ?? 1
          if (speed) {
            cur.playbackRate = speed
            cur.play().catch(() => {})
          } else cur.pause()
        }
        const next = shots[i + 1]?.src
        if (next instanceof HTMLVideoElement && next !== cur) next.currentTime = 0
        shown = i
      }
      // 30 fps: what Instagram plays, and half the work for the phone. Recording starts on the first real frame, so
      // the reel opens on its hook instead of a black lead-in.
      if (t >= 0 && t - drawnAt >= 1 / 31) {
        drawnAt = t
        drawFrame(ctx, format, shots, lk, words, t)
        if (rec?.state === 'inactive') rec.start()
        track?.requestFrame()
      }
      if (player && t < 0 && performance.now() - p0 > 8000) return end('The YouTube song did not start. Tap play on the YouTube player once, then try again.')
      if (t - shownAt > 0.25) setProgress(Math.max(0, t / total)), (shownAt = t)
      if (t >= total + 0.1) return end()
      raf = requestAnimationFrame(tick)
    }
    tick()
  }

  async function addSong(f?: File) {
    if (!f) return
    setMsg('Finding the beat…')
    try {
      const buf = await audio().decodeAudioData(await f.arrayBuffer())
      const { bpm, offset } = await detectBeat(buf)
      setSong({ buf, name: f.name, bpm, offset })
      setBpmText(String(bpm))
      setMusic('song')
      setMsg('')
    } catch {
      setMsg('Could not read that song. Try an MP3 or M4A.')
    }
  }

  // Tap along to the song: beats a minute from the median gap of the last 8 taps.
  function tap() {
    const now = performance.now()
    const t = now - (taps.at(-1) ?? 0) > 2000 ? [now] : [...taps, now].slice(-8) // a long pause starts over
    setTaps(t)
    if (t.length < 4) return
    const gaps = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b)
    let b = 60000 / gaps[gaps.length >> 1]
    while (b > 180) b /= 2
    while (b < 60) b *= 2
    setYtBpm(Math.round(b))
  }

  const field = 'w-full rounded-lg border border-ink/15 bg-white px-3 py-2 disabled:opacity-60'
  const step = 'font-display text-xl text-wine'
  const share = out && navigator.canShare?.({ files: [out.file] })

  return (
    <div className="min-h-svh bg-rose">
      <header className="bg-wine px-4 py-3 text-ivory">
        <a href="/" className="font-display text-lg">ShaadiTemplate</a> <span className="text-zari">· Reel maker</span>
      </header>
      <main className="mx-auto grid max-w-6xl gap-8 p-4 md:grid-cols-[1fr_380px]">
        <aside className="order-first md:order-none md:sticky md:top-4 md:col-start-2 md:row-start-1 md:self-start">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[380px] overflow-hidden rounded-2xl bg-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
            <canvas ref={canvas} width={W} height={H} className="size-full" />
            {sample && keys.length > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">Sample · add your photos to make it yours</span>
            )}
            {busy && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                <div className="h-full bg-zari" style={{ width: `${progress * 100}%` }} />
              </div>
            )}
          </div>
          <input
            type="range"
            aria-label="Scrub through the reel"
            min={0}
            max={total || 1}
            step={0.05}
            value={Math.min(scrub, total)}
            disabled={busy}
            onChange={(e) => setScrub(+e.target.value)}
            className="mx-auto mt-3 block w-full max-w-[380px] accent-wine"
          />
          <div className="mx-auto mt-3 flex max-w-[380px] flex-wrap justify-center gap-3">
            <button type="button" disabled={state === 'recording'} onClick={() => (busy ? stop.current?.() : play(false))} className="rounded-full border border-wine px-5 py-3 text-wine disabled:opacity-40">
              {state === 'playing' ? 'Stop' : 'Preview'}
            </button>
            <button type="button" disabled={state === 'playing' || (music === 'beat' && !beatBuf)} onClick={() => (busy ? stop.current?.('Stopped.') : play(true))} className="rounded-full bg-wine px-5 py-3 text-ivory disabled:opacity-40">
              {state === 'recording' ? `Making… ${Math.round(progress * 100)}%` : `Make my reel · ${Math.round(total)}s`}
            </button>
          </div>
          {msg && <p className="mx-auto mt-3 max-w-[380px] text-center text-sm text-maroon" role="status">{msg}</p>}
          {sample && keys.length > 0 && (
            <details className="mx-auto mt-3 max-w-[380px] text-xs text-ink/50">
              <summary className="cursor-pointer">Sample photos from Wikimedia Commons</summary>
              <ul className="mt-1 space-y-0.5">
                {[...new Set(keys)].map((k) => SAMPLES[k] && (
                  <li key={k}>
                    <a href={sampleLink(SAMPLES[k])} target="_blank" rel="noreferrer" className="underline underline-offset-2">{SAMPLES[k].alt}</a>, {SAMPLES[k].by}, {SAMPLES[k].licence}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {out && (
            <div className="mx-auto mt-4 max-w-[380px] space-y-3 rounded-2xl bg-paper p-3">
              <video src={out.url} controls playsInline className="w-full rounded-xl" />
              <div className="flex justify-center gap-3">
                <a href={out.url} download={out.file.name} className="rounded-full bg-zari px-5 py-3 text-wine-deep">
                  Download {out.file.name.split('.').pop()?.toUpperCase()}
                </a>
                {share && (
                  <button type="button" onClick={() => navigator.share({ files: [out.file] }).catch(() => {})} className="rounded-full border border-wine px-5 py-3 text-wine">
                    Share
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>

        <section className="space-y-8 md:col-start-1 md:row-start-1">
          <div>
            <h1 className="font-display text-3xl text-wine md:text-4xl">Make a viral wedding reel</h1>
            <p className="mt-1 text-ink/70">Pick a reel that's trending on Instagram, add your wedding photos and clips, and get it cut to the beat, graded and captioned. No editing needed.</p>
          </div>

          <div className="space-y-3">
            <h2 className={step}>1. Pick a format</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FORMATS.map((f) => {
                const n = f.slots.length
                const secs = (f.slots.reduce((s, x) => s + x.beats, 0) * 60) / f.bpm
                const thumb = f.samples?.map((k) => SAMPLES[k]).find((x) => x?.kind === 'image')
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={busy}
                    aria-pressed={f.id === format.id}
                    onClick={() => {
                      audio().resume() // inside the tap, so the sample can play with sound
                      autoplay.current = f.id
                      setFormat(f)
                      setWords((w) => ({ ...w, caption: f.caption ?? '' }))
                    }}
                    className={`flex gap-3 rounded-xl border p-3 text-left transition ${f.id === format.id ? 'border-wine bg-white shadow-md ring-1 ring-wine' : 'border-ink/10 bg-white/60 hover:bg-white'}`}
                  >
                    {thumb && <img src={sampleSrc(thumb, 330)} alt="" loading="lazy" className="aspect-[9/16] w-14 shrink-0 rounded-md object-cover" />}
                    <span>
                      <span className="text-xs uppercase tracking-wider text-gold">{f.event}</span>
                      <span className="block font-display text-lg text-wine">{f.name}</span>
                      <span className="block text-sm text-ink/70">{f.hook}</span>
                      <span className="mt-1 block text-xs text-ink/50">{n} photos or clips · {Math.round(secs)}s</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className={step}>2. Your photos and clips</h2>
            <label className={`flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-wine/40 bg-white/60 p-5 text-wine hover:bg-white ${busy ? 'pointer-events-none opacity-50' : ''}`}>
              <input type="file" multiple accept="image/*,video/*" className="sr-only" disabled={busy} onChange={(e) => add(e.target.files).then(() => (e.target.value = ''))} />
              + Add {slots.length} photos or clips, in the order below
            </label>
            <ol className="grid gap-2 sm:grid-cols-2">
              {slots.map((s, k) => {
                const it = items.length ? items[k % items.length] : undefined
                const reused = !!it && k >= items.length
                const ex = !it && keys[k] ? SAMPLES[keys[k]] : undefined
                return (
                  <li key={k}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        replaceAt.current = k
                        replaceInput.current?.click()
                      }}
                      className="flex w-full items-center gap-3 rounded-xl bg-white/70 p-2 text-left hover:bg-white"
                    >
                      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink/5 text-xs text-ink/40">
                        {it ? (
                          it.kind === 'video' ? <video src={it.url} muted playsInline className={`size-full object-cover ${reused ? 'opacity-40' : ''}`} /> : <img src={it.url} alt="" className={`size-full object-cover ${reused ? 'opacity-40' : ''}`} />
                        ) : ex ? (
                          ex.kind === 'video' ? <video src={ex.url} muted playsInline preload="metadata" className="size-full object-cover opacity-60" /> : <img src={sampleSrc(ex, 330)} alt="" loading="lazy" className="size-full object-cover opacity-60" />
                        ) : (
                          k + 1
                        )}
                      </span>
                      <span className="text-sm">
                        <span className="text-ink/80">{s.hint}</span>
                        {s.speed === 0.5 && <span className="block text-xs text-gold">Slow motion if it's a clip</span>}
                        {reused && <span className="block text-xs text-ink/50">Reusing an earlier photo. Tap to add one.</span>}
                        {ex && <span className="block text-xs text-ink/50">Sample shown. Tap to add yours.</span>}
                        {s.text && <span className="block text-xs text-ink/50">Text: {fill(s.text, words)}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <input ref={replaceInput} type="file" accept="image/*,video/*" className="sr-only" onChange={(e) => add(e.target.files, replaceAt.current).then(() => (e.target.value = ''))} />
            {items.length > 0 && (
              <button type="button" disabled={busy} onClick={() => setItems((cur) => (cur.forEach(drop), []))} className="text-sm text-ink/60 underline">
                Remove all photos
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h2 className={step}>3. Your words</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['names', 'date'] as const).map((k) => (
                <label key={k} className="space-y-1">
                  <span className="text-sm capitalize text-ink/70">{k}</span>
                  <input className={field} value={words[k]} disabled={busy} onChange={(e) => setWords({ ...words, [k]: e.target.value })} />
                </label>
              ))}
            </div>
            {format.caption !== undefined && (
              <div className="space-y-2">
                <label className="block space-y-1">
                  <span className="text-sm text-ink/70">Caption on the reel</span>
                  <input className={field} value={words.caption} disabled={busy} onChange={(e) => setWords({ ...words, caption: e.target.value })} />
                </label>
                <div className="flex flex-wrap gap-2">
                  {format.examples?.map((x) => (
                    <button key={x} type="button" disabled={busy} onClick={() => setWords({ ...words, caption: x })} className={`rounded-full border px-3 py-1 text-xs ${words.caption === x ? 'border-wine bg-wine text-ivory' : 'border-ink/15 bg-white/70 text-ink/70 hover:bg-white'}`}>
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className={step}>4. Music</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ['beat', 'Built-in beat', `${format.beat === 'dhol' ? 'Dhol groove' : 'Soft and warm'}, made for this format`],
                  ['yt', 'Any song on YouTube', clip ? `Starts at ${clock(clip.start)}, ${bpm} beats a minute` : 'Paste a link; cuts land on its beat'],
                  ['song', 'My song', song ? `${song.name}, ${song.bpm} beats a minute` : 'Upload an MP3; we find the beat'],
                  ['none', 'No music', 'Add the trending sound in Instagram'],
                ] as const
              ).map(([id, label, sub]) => (
                <label key={id} className={`cursor-pointer rounded-xl border p-3 ${music === id ? 'border-wine bg-white ring-1 ring-wine' : 'border-ink/10 bg-white/60'}`}>
                  <input type="radio" name="music" className="sr-only" checked={music === id} disabled={busy} onChange={() => setMusic(id)} />
                  <span className="block font-medium text-wine">{label}</span>
                  <span className="block text-xs text-ink/60">{sub}</span>
                </label>
              ))}
            </div>
            {format.sounds && <p className="text-xs text-ink/60">Usually posted with: {format.sounds.join(', ')}. Add it in Instagram, or upload your own copy as My song.</p>}
            {music === 'yt' && (
              <div className="space-y-3 rounded-xl bg-white/60 p-3">
                <input
                  type="url"
                  inputMode="url"
                  placeholder="Paste a YouTube link, e.g. youtu.be/…?t=45"
                  className={field}
                  disabled={busy}
                  value={ytLink}
                  onChange={(e) => setYtLink(e.target.value)}
                />
                {ytLink && !clip && <p className="text-xs text-maroon">That doesn't look like a YouTube link.</p>}
                {clip && (
                  <div className="flex flex-wrap items-start gap-3">
                    <YouTubeSong key={`${clip.id}-${clip.start}`} id={clip.id} start={clip.start} holder={ytPlayer} playing={ytPlaying} />
                    <div className="min-w-0 flex-1 space-y-2 text-sm">
                      <p className="text-xs text-ink/60">The reel starts where the link starts. To start at the hook, use YouTube's Share, Start at.</p>
                      <button type="button" onClick={tap} className="w-full rounded-full border border-wine px-4 py-3 text-wine active:bg-wine active:text-ivory">
                        Tap with the beat {taps.length > 0 && taps.length < 4 ? `(${4 - taps.length} more)` : ''}
                      </button>
                      <p className="text-xs text-ink/60">{ytBpm ? `${ytBpm} beats a minute. Keep tapping to adjust.` : `Play the song and tap along. Until then cuts use ${format.bpm} beats a minute.`}</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-ink/60">YouTube doesn't let its songs be downloaded, so the reel you save is silent and cut to this song. In Instagram, tap Add audio, pick the same song and set it to start at {clock(clip?.start ?? 0)}.</p>
              </div>
            )}
            {music === 'song' && (
              <div className="grid grid-cols-[1fr_130px] gap-3">
                <input type="file" accept="audio/*" className={field} disabled={busy} onChange={(e) => addSong(e.target.files?.[0])} />
                <input
                  type="number"
                  aria-label="Beats a minute"
                  className={field}
                  disabled={busy || !song}
                  value={bpmText}
                  onChange={(e) => setBpmText(e.target.value)}
                  onBlur={() => {
                    const b = Math.min(180, Math.max(60, Math.round(+bpmText) || song?.bpm || 100))
                    setBpmText(String(b))
                    if (song) setSong({ ...song, bpm: b })
                  }}
                />
              </div>
            )}
          </div>
        </section>
      </main>

    </div>
  )
}
