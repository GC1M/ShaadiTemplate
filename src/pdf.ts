import { getFontEmbedCSS, toJpeg, toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import type { Format } from './types'

// story: 2x -> 1080 x 1920 (WhatsApp / status). print: 4x -> 1800 x 2520 (~360 DPI at 5x7 in).
const RATIO: Record<Format, number> = { story: 2, print: 4 }
const PAGE_MM: Record<Format, [number, number]> = { story: [90, 160], print: [127, 177.8] }

const webkit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Android/.test(navigator.userAgent)

// Each direct child of `container` is one full-size card page.
async function capture(container: HTMLElement, format: Format, kind: 'png' | 'jpeg') {
  await document.fonts.ready
  // Embed fonts once and reuse for every page instead of re-fetching per capture.
  const fontEmbedCSS = await getFontEmbedCSS(container)
  const pages = Array.from(container.children) as HTMLElement[]
  // Low-memory phones get a lighter print export.
  const pixelRatio = format === 'print' && matchMedia('(pointer: coarse)').matches ? 3 : RATIO[format]
  const out: string[] = []
  for (const el of pages) {
    // Safari (every iOS browser) draws a page's first capture before its fonts and painted artwork
    // are decoded at that size, so the page came out black. A throwaway pass at the same size fixes it.
    if (webkit) await toJpeg(el, { pixelRatio, fontEmbedCSS })
    out.push(kind === 'png' ? await toPng(el, { pixelRatio, fontEmbedCSS }) : await toJpeg(el, { pixelRatio, quality: 0.92, fontEmbedCSS }))
  }
  return out
}

const toFile = async (url: string, name: string, type: string) => new File([await (await fetch(url)).blob()], name, { type })

// Who made the design, written into each download where image viewers and file properties show it. The card stays
// free of any visible mark. Plain ASCII: PNG tEXt is Latin-1.
const NOTICE = 'Card design copyright ShaadiTemplate (shaaditemplate.com). Made free at https://shaaditemplate.com'

// A PNG tEXt chunk with the notice, placed right after the header chunk (IHDR, always 33 bytes in).
async function markPng(file: File) {
  const png = new Uint8Array(await file.arrayBuffer())
  const body = new TextEncoder().encode(`Copyright\0${NOTICE}`)
  const chunk = new Uint8Array(12 + body.length)
  const view = new DataView(chunk.buffer)
  view.setUint32(0, body.length)
  chunk.set(new TextEncoder().encode('tEXt'), 4)
  chunk.set(body, 8)
  let crc = ~0
  for (const b of chunk.subarray(4, 8 + body.length)) {
    crc ^= b
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  view.setUint32(8 + body.length, ~crc >>> 0)
  return new File([png.subarray(0, 33), chunk, png.subarray(33)], file.name, { type: file.type })
}

export async function buildPngs(container: HTMLElement, format: Format, baseName: string) {
  const urls = await capture(container, format, 'png')
  return Promise.all(urls.map(async (u, i) => markPng(await toFile(u, urls.length > 1 ? `${baseName}-${i + 1}.png` : `${baseName}.png`, 'image/png'))))
}

export async function buildPdf(container: HTMLElement, format: Format, baseName: string) {
  const urls = await capture(container, format, 'jpeg')
  const [w, h] = PAGE_MM[format]
  const pdf = new jsPDF({ unit: 'mm', format: [w, h], compress: true })
  pdf.setProperties({ title: baseName, subject: NOTICE, author: 'ShaadiTemplate', creator: 'shaaditemplate.com', keywords: 'ShaadiTemplate, shaaditemplate.com' })
  urls.forEach((u, i) => {
    if (i) pdf.addPage([w, h])
    pdf.addImage(u, 'JPEG', 0, 0, w, h)
  })
  return new File([pdf.output('blob')], `${baseName}.pdf`, { type: 'application/pdf' })
}
