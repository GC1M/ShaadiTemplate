import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

// AdSense-ready slot. Renders nothing visible until a real ad is wired in, but keeps its height
// so the ad never shifts layout.
export function AdSlot({ slot, className = '' }: { slot: string; className?: string }) {
  return <div data-ad-slot={slot} aria-hidden className={`min-h-[100px] ${className}`} />
}

// Renders a fixed-size card scaled down to fit its container width (never up).
export function ScaledCard({ w, h, children, className = 'shadow-xl', max = 1 }: { w: number; h: number; children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setScale(Math.min(max, e.contentRect.width / w)))
    ro.observe(ref.current!)
    return () => ro.disconnect()
  }, [w, max])
  return (
    <div ref={ref} className="mx-auto w-full" style={{ maxWidth: w * max }}>
      <div style={{ height: h * scale }}>
        <div className={className} style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options, label, dark }: { value: T; onChange: (v: T) => void; options: { id: T; label: ReactNode }[]; label: string; dark?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex flex-wrap rounded-full p-1 ring-1 ${dark ? 'bg-black/20 ring-zari/25' : 'bg-wine/[0.06] ring-wine/10'}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3.5 py-1.5 text-sm transition pointer-coarse:min-h-11 pointer-coarse:min-w-11 ${o.id === value ? (dark ? 'bg-zari text-wine-deep' : 'bg-wine text-rose shadow-sm') : dark ? 'text-rose/75 hover:text-rose' : 'text-ink/70 hover:text-wine'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// The line between an editor's form and its preview. Drag it (or focus it and press the arrow keys) to give either
// side more room; a double-click puts it back. Wide screens only, where the two sit side by side. The preview's
// width goes into --pane, which the editor's grid reads, and is remembered per editor in this browser.
// `handle` goes inside the preview pane, which must be positioned and reach the right edge of the window.
export function useSplit(name: string) {
  const key = `split:${name}`
  const [pane, setPane] = useState<number | null>(() => {
    try {
      return Number(localStorage.getItem(key)) || null
    } catch {
      return null
    }
  })
  const set = (px: number | null) => {
    const v = px && Math.round(Math.max(320, Math.min(innerWidth - 420, px))) // both sides stay usable
    setPane(v || null)
    try {
      if (v) localStorage.setItem(key, String(v))
      else localStorage.removeItem(key)
    } catch {
      /* not remembered */
    }
  }
  const handle = (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the preview. Arrow keys move it, Home puts it back."
      title="Drag to resize. Double-click to put it back."
      tabIndex={0}
      className="group absolute inset-y-0 left-0 z-10 hidden w-4 -translate-x-1/2 cursor-col-resize touch-none outline-none lg:block"
      onPointerDown={(e) => (e.preventDefault(), e.currentTarget.focus(), e.currentTarget.setPointerCapture(e.pointerId))}
      onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && set(innerWidth - e.clientX)}
      onDoubleClick={() => set(null)}
      onKeyDown={(e) => {
        const step = e.key === 'ArrowLeft' ? 32 : e.key === 'ArrowRight' ? -32 : 0
        if (e.key === 'Home') set(null)
        if (!step) return
        e.preventDefault()
        set(e.currentTarget.parentElement!.getBoundingClientRect().width + step)
      }}
    >
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-zari/40 transition-[width,background-color] group-hover:w-[3px] group-hover:bg-zari group-focus-visible:w-[3px] group-focus-visible:bg-zari" />
      {/* The grip stays in the middle of the window however long the page is. */}
      <span className="sticky top-[50svh] mx-auto block h-12 w-1.5 -translate-y-1/2 rounded-full bg-zari shadow-[0_0_0_3px_rgb(0_0_0/0.25)]" />
    </div>
  )
  return { pane, set, handle, style: pane ? ({ '--pane': `${pane}px` } as CSSProperties) : undefined }
}

// A woven zari border, like the edge of a sari, between the velvet and ivory parts of a page.
export function ZariBorder() {
  const id = useId()
  return (
    <svg aria-hidden className="block h-10 w-full bg-wine-deep">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f0d595" />
          <stop offset="0.45" stopColor="#b48c45" />
          <stop offset="0.6" stopColor="#d9b569" />
          <stop offset="1" stopColor="#9c7535" />
        </linearGradient>
        <pattern id={`${id}p`} width="64" height="40" patternUnits="userSpaceOnUse">
          <g stroke={`url(#${id}g)`} fill="none">
            <path d="M0 3.5h64M0 36.5h64" strokeWidth="1.2" />
            <path d="M0 6.5h64M0 33.5h64" strokeWidth="0.5" opacity="0.6" />
          </g>
          {/* A buta (mango paisley) and its mirror, with a diamond between. */}
          {[0, 1].map((m) => (
            <g key={m} transform={m ? 'translate(64 0) scale(-1 1)' : undefined} fill={`url(#${id}g)`}>
              <path d="M14 29.5c-4.4 0-7.2-3.2-7.2-7.2 0-5.8 5-10.4 11.6-11.6-2.3 1.7-3 3.6-2.2 5.2 1.1 2.2 5.6 2.7 5.6 7.3 0 3.6-3.3 6.3-7.8 6.3z" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.1" />
              <path d="M13.8 26.5c-2.4 0-3.9-1.7-3.9-3.9 0-3 2.4-5.4 5.6-6.2-.8 1.2-.6 2.5.4 3.4 1.2 1.1 2.6 1.6 2.6 3.6 0 1.8-2 3.1-4.7 3.1z" />
              <circle cx="22.5" cy="11.5" r="1" />
            </g>
          ))}
          <path d="M32 15l4 5-4 5-4-5z" fill={`url(#${id}g)`} />
        </pattern>
      </defs>
      <rect width="100%" height="40" fill={`url(#${id}p)`} />
    </svg>
  )
}
