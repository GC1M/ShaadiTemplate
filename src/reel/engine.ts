import type { Format, Grade, Motion, Slot, TextStyle } from './formats'

// Renders a reel frame for any time t on a 1080x1920 canvas, and makes its music. Pure functions of t, so the
// preview and the export draw the same frames and the cuts follow the audio clock exactly.
export const W = 1080
export const H = 1920
const FRAME = 1 / 30

export interface Placeholder {
  n: number
  hint: string
}
export type Media = ImageBitmap | HTMLVideoElement
export type Source = Media | Placeholder
export interface Shot {
  src: Source
  slot: Slot
  start: number // seconds
  len: number
  index: number
}
export interface Words {
  names: string
  date: string
  caption: string
}

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const outCubic = (t: number) => 1 - (1 - t) ** 3
const isPh = (s: Source): s is Placeholder => 'hint' in s

// media: the family's photos in slot order, or the format's samples (one per slot, undefined while loading).
export function buildShots(f: Format, bpm: number, media: (Media | undefined)[]): Shot[] {
  const beat = 60 / bpm
  let t = 0
  return f.slots.map((slot, k) => {
    // Too few photos: earlier ones come round again. Nothing to show: a numbered card says what goes there.
    const src: Source = (media.length && media[k % media.length]) || { n: k + 1, hint: slot.hint }
    const shot = { src, slot, start: t, len: slot.beats * beat, index: k }
    t += shot.len
    return shot
  })
}

export const duration = (shots: Shot[]) => (shots.length ? shots[shots.length - 1].start + shots[shots.length - 1].len : 0)

// Grades are composited, not filtered, so they cost the same on every phone: a warm soft-light wash, lifted blacks,
// a little less saturation, a light vignette. One grade for the whole reel.
const GRADES: Record<Grade, { tint?: [string, number]; lift?: string; desat: number; vig: number; grain: number; flash?: number; stamp?: true }> = {
  warm: { tint: ['#ffb27a', 0.1], lift: '#140c0a', desat: 0.1, vig: 0.12, grain: 0 },
  desi: { tint: ['#ff9a6a', 0.14], desat: 0, vig: 0.12, grain: 0 },
  pastel: { tint: ['#ffd6dc', 0.1], lift: '#1e1616', desat: 0.2, vig: 0.08, grain: 0 },
  bw: { lift: '#161616', desat: 1, vig: 0.15, grain: 0.03 },
  digicam: { desat: 0.05, vig: 0.1, grain: 0.05, flash: 0.05, stamp: true },
}

export interface Look {
  grade: (typeof GRADES)[Grade]
  vignette: HTMLCanvasElement
  grain: CanvasPattern
}

export function makeLook(ctx: CanvasRenderingContext2D, g: Grade): Look {
  const grade = GRADES[g]
  const vignette = Object.assign(document.createElement('canvas'), { width: W, height: H })
  const v = vignette.getContext('2d')!
  const r = v.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.72)
  r.addColorStop(0, 'rgba(0,0,0,0)')
  r.addColorStop(1, `rgba(0,0,0,${grade.vig})`)
  v.fillStyle = r
  v.fillRect(0, 0, W, H)
  const noise = Object.assign(document.createElement('canvas'), { width: 256, height: 256 })
  const n = noise.getContext('2d')!
  const img = n.createImageData(256, 256)
  for (let i = 0; i < img.data.length; i += 4) {
    const c = Math.random() * 255
    img.data.set([c, c, c, 255], i)
  }
  n.putImageData(img, 0, 0)
  return { grade, vignette, grain: ctx.createPattern(noise, 'repeat')! }
}

const size = (s: Media) => (s instanceof HTMLVideoElement ? [s.videoWidth, s.videoHeight] : [s.width, s.height])
const ready = (s: Source) => !(s instanceof HTMLVideoElement) || s.readyState >= 2

const SANS = 'Jost, "Noto Serif Gujarati", "Tiro Devanagari Hindi", "Tiro Gurmukhi", "Tiro Tamil", sans-serif'
const SERIF = '"Cormorant Garamond", "Noto Serif Gujarati", "Tiro Devanagari Hindi", "Tiro Gurmukhi", "Tiro Tamil", serif'
const DISPLAY = '"Bodoni Moda", "Noto Serif Gujarati", "Tiro Devanagari Hindi", "Tiro Gurmukhi", "Tiro Tamil", serif'
const TYPE = '"Courier New", Courier, "Noto Serif Gujarati", "Tiro Devanagari Hindi", monospace'

function placeholder(ctx: CanvasRenderingContext2D, p: Placeholder) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#3a1d22')
  g.addColorStop(1, '#140a0c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.font = `400 300px ${DISPLAY}`
  ctx.fillText(String(p.n), W / 2, H * 0.4)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `400 46px ${SANS}`
  wrap(ctx, p.hint, 820).forEach((l, i) => ctx.fillText(l, W / 2, H * 0.55 + i * 64))
}

// Cover-fit, zoomed about the centre. Tall photos sit a little high so faces are not cut (top-third bias).
function cover(ctx: CanvasRenderingContext2D, s: Source, zoom: number, dx = 0) {
  if (isPh(s)) return placeholder(ctx, s)
  const [w, h] = size(s)
  if (!w || !h) return
  const k = Math.max(W / w, H / h) * zoom
  const fy = h * k > H * 1.15 ? 0.3 : 0.5
  ctx.drawImage(s, (W - w * k) / 2 + dx, (H - h * k) * fy, w * k, h * k)
}

// Stills move a little (4% push or pull, or a slow drift) and about a third stay still; never the same move twice
// in a row. Clips are already moving, so they don't.
const VARY: Motion[] = ['in', 'still', 'out', 'drift', 'still', 'in', 'out']
function drawShot(ctx: CanvasRenderingContext2D, sh: Shot, u: number, zoom = 1, dx = 0) {
  const p = clamp(u / sh.len)
  const m = sh.src instanceof HTMLVideoElement ? 'still' : (sh.slot.motion ?? VARY[sh.index % VARY.length])
  const z = m === 'in' ? 1 + 0.04 * p : m === 'out' ? 1.04 - 0.04 * p : m === 'drift' ? 1.03 : 1
  cover(ctx, sh.src, z * zoom, dx + (m === 'drift' ? (sh.index % 2 ? 1 : -1) * 16 * (p - 0.5) : 0))
}

function wrap(ctx: CanvasRenderingContext2D, s: string, max: number) {
  const lines: string[] = []
  let line = ''
  for (const w of s.split(/\s+/)) {
    const next = line ? `${line} ${w}` : w
    if (line && ctx.measureText(next).width > max) lines.push(line), (line = w)
    else line = next
  }
  return line ? [...lines, line] : lines
}

// Instagram-native type: the Classic white box, Typewriter, small tracked serif caps, a plain lowercase label.
// Kept inside the Reels safe zone (clear of the top bar, the caption and the buttons on the right).
const Y = { top: 330, mid: 900, low: 1180 }
function caption(ctx: CanvasRenderingContext2D, s: string, style: TextStyle, y: number, alpha: number) {
  if (!s || alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (style === 'box') {
    ctx.font = `500 46px ${SANS}`
    const lines = wrap(ctx, s, 800)
    lines.forEach((l, i) => {
      const w = ctx.measureText(l).width + 52
      const ly = y + i * 70
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.roundRect(W / 2 - w / 2, ly - 35, w, 70, 14)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.fillText(l, W / 2, ly + 2)
    })
  } else {
    // A soft, wide shadow: invisible on dark shots, keeps white type readable on a bright lehenga or sky.
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 28
    ctx.fillStyle = '#fff'
    ctx.font = style === 'type' ? `700 44px ${TYPE}` : style === 'serif' ? `600 46px ${SERIF}` : `500 60px ${SANS}`
    if (style === 'serif') ctx.letterSpacing = '10px'
    const text = style === 'serif' ? s.toUpperCase() : s
    wrap(ctx, text, 820).forEach((l, i) => ctx.fillText(l, W / 2, y + i * 62))
  }
  ctx.restore()
}

export const fill = (s: string | undefined, w: Words) => (s ?? '').replace(/\{(names|date|caption)\}/g, (_, k: keyof Words) => w[k]).trim()

// Every family drawn on the canvas, with the actual words, so the right script subset is fetched before frame one.
export const loadFonts = (w: Words) => {
  const text = `${w.names}${w.date}${w.caption}Aa`
  const faces = ['500 46px Jost', '400 46px Jost', '500 40px "Cormorant Garamond"', '400 72px "Bodoni Moda"', '400 72px "Noto Serif Gujarati"', '400 72px "Tiro Devanagari Hindi"', '400 72px "Tiro Gurmukhi"', '400 72px "Tiro Tamil"']
  return Promise.all(faces.map((f) => document.fonts.load(f, text).catch(() => [])))
}

// Draws time t. Returns false (and leaves the last frame up) while a clip is still seeking.
export function drawFrame(ctx: CanvasRenderingContext2D, f: Format, shots: Shot[], look: Look, w: Words, t: number) {
  const total = duration(shots)
  t = Math.min(Math.max(0, t), total - 0.001)
  // Cuts land one frame early: the eye lags, so they read as exactly on the beat.
  const tc = Math.min(t + FRAME, total - 0.001)
  let i = 0
  while (i < shots.length - 1 && tc >= shots[i + 1].start) i++
  const sh = shots[i]
  const prev = shots[i - 1]
  const u = tc - sh.start
  const trans = i === 0 ? 'cut' : (sh.slot.trans ?? 'cut')
  const d = { cut: 0, punch: 4, flash: 3, whip: 7, dip: 8, fade: 15 }[trans] * FRAME
  const q = d ? u / d : 1
  const blend = q < 1 && (trans === 'fade' || trans === 'whip')
  if (!ready(sh.src) || (blend && !ready(prev.src))) return false

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  if (q < 1 && trans === 'whip') {
    // Outgoing shot leaves left, incoming enters from the right, smeared for motion blur.
    const x = W * outCubic(q)
    for (let k = 0; k < 4; k++) {
      ctx.globalAlpha = 1 / (k + 1)
      drawShot(ctx, prev, prev.len, 1, -x + k * 40)
      drawShot(ctx, sh, u, 1, W - x + k * 40)
    }
    ctx.globalAlpha = 1
  } else if (blend) {
    drawShot(ctx, prev, prev.len + u)
    ctx.globalAlpha = q
    drawShot(ctx, sh, u)
    ctx.globalAlpha = 1
  } else drawShot(ctx, sh, u, q < 1 && trans === 'punch' ? 1 + 0.15 * (1 - outCubic(q)) : 1)

  // Grade (skipped on the numbered cards).
  const g = look.grade
  if (!isPh(sh.src)) {
    if (g.lift) {
      ctx.globalCompositeOperation = 'lighten'
      ctx.fillStyle = g.lift
      ctx.fillRect(0, 0, W, H)
    }
    if (g.tint) {
      ctx.globalCompositeOperation = 'soft-light'
      ctx.globalAlpha = g.tint[1]
      ctx.fillStyle = g.tint[0]
      ctx.fillRect(0, 0, W, H)
    }
    if (g.desat) {
      ctx.globalCompositeOperation = 'saturation'
      ctx.globalAlpha = g.desat
      ctx.fillStyle = '#808080'
      ctx.fillRect(0, 0, W, H)
    }
    if (g.flash) {
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = g.flash
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, W, H)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(look.vignette, 0, 0)
    if (g.grain) {
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = g.grain
      const ox = (Math.random() * 256) | 0
      const oy = (Math.random() * 256) | 0
      ctx.translate(-ox, -oy)
      ctx.fillStyle = look.grain
      ctx.fillRect(ox, oy, W, H)
      ctx.restore()
    }
    if (g.stamp && w.date) {
      // The orange date stamp of a point-and-shoot camera.
      ctx.save()
      ctx.font = `700 40px ${TYPE}`
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ff9a3c'
      ctx.shadowColor = 'rgba(255,120,30,0.6)'
      ctx.shadowBlur = 10
      ctx.fillText(w.date, W - 150, H - 400)
      ctx.restore()
    }
  }
  if (q < 1 && trans === 'flash') {
    ctx.fillStyle = `rgba(255,255,255,${1 - q})`
    ctx.fillRect(0, 0, W, H)
  }
  if (q < 1 && trans === 'dip') {
    ctx.fillStyle = `rgba(0,0,0,${1 - q})`
    ctx.fillRect(0, 0, W, H)
  }

  // Text: the held header from frame one, the shot's own line (fades in over 10 frames, out over 8), and the names
  // and date over the last shot.
  if (f.header) caption(ctx, w.caption, f.header, Y.top, 1)
  const last = i === shots.length - 1
  const line = fill(sh.slot.text, w)
  if (line) caption(ctx, line, sh.slot.style ?? 'label', Y[sh.slot.pos ?? 'low'], Math.min(clamp(u / (10 * FRAME)), last ? 1 : clamp((sh.len - u) / (8 * FRAME))))
  if (f.end && last && w.names) {
    const a = outCubic(clamp((u - 0.4) / 0.9))
    ctx.save()
    ctx.globalAlpha = a
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 28
    ctx.fillStyle = '#fff'
    ctx.font = `400 76px ${DISPLAY}`
    const nw = ctx.measureText(w.names).width
    if (nw > 860) ctx.font = `400 ${Math.floor((76 * 860) / nw)}px ${DISPLAY}`
    ctx.fillText(w.names, W / 2, 900 + 12 * (1 - a))
    if (w.date) {
      ctx.globalAlpha = outCubic(clamp((u - 0.8) / 0.9))
      ctx.font = `500 34px ${SERIF}`
      ctx.letterSpacing = '9px'
      ctx.fillText(w.date.toUpperCase(), W / 2, 990)
    }
    ctx.restore()
  }
  return true
}

// Built-in music, synthesised so there is nothing to license: a dhol groove, a soft pulse, or (for the vidaai) a
// slow pad with no drums. Every cut lands on its beats because both share the format's tempo.
export async function synthBeat(bpm: number, seconds: number, style: Format['beat']) {
  const sr = 44100
  const ac = new OfflineAudioContext(2, Math.ceil(sr * seconds), sr)
  const beat = 60 / bpm
  const master = ac.createGain()
  master.gain.value = 0.8
  master.connect(ac.destination)
  const noise = ac.createBuffer(1, sr, sr)
  noise.getChannelData(0).forEach((_, i, a) => (a[i] = Math.random() * 2 - 1))
  const env = (g: GainNode, t: number, peak: number, decay: number, attack = 0.005) => {
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
  }
  const kick = (t: number, peak: number) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.frequency.setValueAtTime(style === 'dhol' ? 150 : 110, t)
    o.frequency.exponentialRampToValueAtTime(45, t + 0.14)
    env(g, t, peak, 0.4)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.45)
  }
  const hit = (t: number, freq: number, peak: number, decay: number, type: BiquadFilterType = 'bandpass') => {
    const s = ac.createBufferSource()
    const f = ac.createBiquadFilter()
    const g = ac.createGain()
    s.buffer = noise
    f.type = type
    f.frequency.value = freq
    env(g, t, peak, decay)
    s.connect(f).connect(g).connect(master)
    s.start(t, Math.random() * 0.5)
    s.stop(t + decay + 0.05)
  }
  const tone = (t: number, freq: number, len: number, peak: number, type: OscillatorType = 'sine') => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    const f = ac.createBiquadFilter()
    o.type = type
    o.frequency.value = freq
    f.type = 'lowpass'
    f.frequency.value = 1200
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.4, len / 3))
    g.gain.setValueAtTime(peak, t + len * 0.7)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len)
    o.connect(f).connect(g).connect(master)
    o.start(t)
    o.stop(t + len + 0.05)
  }
  const roots = [220, 174.6, 196, 164.8] // A, F, G, E: a warm, filmi progression
  const beats = Math.floor(seconds / beat)
  for (let b = 0; b < beats; b++) {
    const t = b * beat
    if (b % 4 === 0) {
      const r = roots[(b / 4) % roots.length]
      const pad = style === 'dhol' ? 0.05 : style === 'slow' ? 0.11 : 0.08
      for (const [k, type] of [[1, 'triangle'], [1.5, 'sine'], [2, 'sine']] as const) tone(t, r * k, beat * 4, pad, type)
      tone(t, r * 4, beat * 0.9, 0.04) // bell on the bar
    }
    if (style === 'dhol') {
      kick(t, b % 4 === 0 ? 1 : 0.8)
      if (b % 2 === 1) hit(t, 1600, 0.5, 0.18) // slap on 2 and 4
      hit(t + beat / 2, 7000, 0.18, 0.05, 'highpass')
      if (b % 8 === 7) hit(t + beat * 0.75, 1200, 0.35, 0.12)
    } else if (style === 'soft') {
      if (b % 2 === 0) kick(t, 0.55)
      hit(t + beat / 2, 8000, 0.07, 0.04, 'highpass')
    }
  }
  return ac.startRendering()
}

// Tempo and first beat of a song from its low-frequency onsets (first 60 s). Good on dhol, Bollywood and pop; may
// read half or double time on slow songs, so the tempo stays editable.
export async function detectBeat(buf: AudioBuffer) {
  const sr = 22050
  const secs = Math.min(60, buf.duration)
  const off = new OfflineAudioContext(1, Math.ceil(sr * secs), sr)
  const s = off.createBufferSource()
  const lp = off.createBiquadFilter()
  s.buffer = buf
  lp.type = 'lowpass'
  lp.frequency.value = 150
  s.connect(lp).connect(off.destination)
  s.start(0)
  const x = (await off.startRendering()).getChannelData(0)
  const hop = 512
  const n = (x.length / hop) | 0
  const fps = sr / hop
  const env = new Float32Array(n)
  for (let i = 0, prev = 0; i < n; i++) {
    let e = 0
    for (let j = i * hop; j < (i + 1) * hop; j++) e += x[j] * x[j]
    e = Math.log1p(100 * e)
    env[i] = Math.max(0, e - prev)
    prev = e
  }
  let bpm = 120
  let best = -1
  for (let b = 70; b <= 180; b += 0.5) {
    const L = (fps * 60) / b
    let sc = 0
    for (let i = 0; i + L < n; i++) sc += env[i] * env[Math.round(i + L)]
    sc *= Math.exp(-0.5 * (Math.log2(b / 120) / 0.9) ** 2) // prior around 120 cuts octave errors
    if (sc > best) [best, bpm] = [sc, b]
  }
  const L = (fps * 60) / bpm
  let o = 0
  best = -1
  for (let k = 0; k < L; k++) {
    let sc = 0
    for (let i = k; i < n; i += L) sc += env[Math.round(i)]
    if (sc > best) [best, o] = [sc, k]
  }
  return { bpm: Math.round(bpm), offset: o / fps }
}
