import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

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
