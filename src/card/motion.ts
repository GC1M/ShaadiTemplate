// Animated cards (copied from video invitations) play in the editor's live preview only: downloads and gallery
// thumbnails stay still. Each line of text types in letter by letter, one after another, while the page's final
// artwork fades or grows in over its base layer, as the source video does. It replays whenever the page scrolls back
// into view, and not at all for visitors who ask for reduced motion.

export type Motion = {
  base: string // the page before its animated parts appear (the couple, the plants)
  art: 'fade' | 'grow'
  iris?: boolean // the page opens out of a circle
  rows?: number[] // a lettered cut-out's line breaks in % of its height, so it types line by line too
}

const MS_PER_CHAR = 55

// Clip a box down to its first `x`% of row `r` and every row above it (rows: breaks in % of height).
const upTo = (rows: number[], r: number, x: number) => {
  const [a, b] = [rows[r], rows[r + 1]]
  return `polygon(0 0, 100% 0, 100% ${a}%, ${x}% ${a}%, ${x}% ${b}%, 0 ${b}%)`
}

function typeLine(el: HTMLElement, at: number, rows?: number[]) {
  const img = el.querySelector('img')
  if (img && rows) {
    const frames = rows.slice(0, -1).flatMap((_, r) => [upTo(rows, r, 0), upTo(rows, r, 100)])
    const ms = (rows.length - 1) * 14 * MS_PER_CHAR
    img.animate(frames.map((clipPath) => ({ clipPath })), { duration: ms, delay: at, easing: 'steps(40)', fill: 'backwards' })
    return at + ms
  }
  const text = el.textContent?.trim() ?? ''
  if (!text) return at
  // The words sit centred in a full-width line: type across their own extent, not the line's.
  const box = el.getBoundingClientRect()
  const range = document.createRange()
  range.selectNodeContents(el)
  const ink = range.getBoundingClientRect()
  if (!box.width || !ink.width) return at
  const left = Math.max(0, ((ink.left - box.left) / box.width) * 100)
  const right = Math.max(0, ((box.right - ink.right) / box.width) * 100)
  const ms = Math.max(300, text.length * MS_PER_CHAR)
  el.animate([{ clipPath: `inset(-30% ${100 - left}% -30% 0)` }, { clipPath: `inset(-30% ${right}% -30% 0)` }], {
    duration: ms,
    delay: at,
    easing: `steps(${text.length})`,
    fill: 'backwards',
  })
  return at + ms + 120
}

export function play(root: HTMLElement, m: Motion) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  root.getAnimations({ subtree: true }).forEach((a) => a.cancel())
  let at = 0
  if (m.iris) {
    root.animate([{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 900, easing: 'ease-in', fill: 'backwards' })
    at = 700
  }
  const art = root.querySelector<HTMLElement>('[data-art]')
  if (art && m.art === 'fade') art.animate([{ opacity: 0, transform: 'scale(1.03)' }, { opacity: 1, transform: 'none' }], { duration: 1400, delay: at + 300, easing: 'ease-out', fill: 'backwards' })
  // Plants grow up from the bottom edge behind a soft front.
  if (art && m.art === 'grow') {
    // A mask twice the page's height, black below a soft front, slid up so the black rises from the bottom edge.
    const mask = { maskImage: 'linear-gradient(to top, #000 44%, transparent 56%)', maskSize: '100% 200%', maskRepeat: 'no-repeat' }
    Object.assign(art.style, mask, { webkitMaskImage: mask.maskImage, webkitMaskSize: mask.maskSize, webkitMaskRepeat: 'no-repeat' })
    const grow = art.animate([{ maskPosition: '0 0%', webkitMaskPosition: '0 0%' }, { maskPosition: '0 100%', webkitMaskPosition: '0 100%' }], { duration: 3200, delay: at + 500, easing: 'ease-out', fill: 'both' })
    grow.onfinish = () => grow.cancel()
    grow.oncancel = () => {
      for (const k of ['mask-image', 'mask-size', 'mask-repeat', '-webkit-mask-image', '-webkit-mask-size', '-webkit-mask-repeat']) art.style.removeProperty(k)
    }
  }
  // Every line of every section, in reading order.
  const lines = root.querySelectorAll<HTMLElement>('[data-text] span[style*="display: block"]')
  for (const l of lines) at = typeLine(l, at, m.rows)
}
