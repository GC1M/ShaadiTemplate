import { SiteHeader } from '../Hero'
import { DESIGNS, WEBSITES_TITLE, designPath, type Design } from './designs'
import { API } from './api'
import { useTitle } from './shared'
import { useState } from 'react'
import { Gate, themeVars } from './WeddingSite'
import './organza.css'
import './site.css'

// The wedding website designs, each shown as a phone closed on its opening screen (the carved doors and seal, or
// the tri-fold card); pointing at one opens it onto the cover photo and names, as a guest's tap does on the site.

const FEATURES = ['Countdown to the day', 'Your story', 'Every function, with add to calendar', 'Venue and map', 'Photo gallery', 'RSVP', 'Guest blessings']

// The site's own opening screen, drawn at a phone's size and scaled to the frame (a transformed box also holds
// the gate's fixed position). Not for clicking here: the whole card is a link.
const GATE_W = 300
function Cover({ d, open }: { d: Design; open: boolean }) {
  return (
    <div className="st st-cover absolute left-0 top-0 origin-top-left" style={{ width: GATE_W, height: (GATE_W * 488) / 238, transform: `scale(${238 / GATE_W})` }} inert aria-hidden>
      <Gate d={d} open={open} onOpen={() => {}} />
    </div>
  )
}

function Phone({ d }: { d: Design }) {
  const [open, setOpen] = useState(false)
  const photo = <img src={d.hero.small} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" style={{ objectPosition: d.hero.pos }} />
  const names = (
    <div className="text-center">
      <p className="ov-meta text-[0.5rem] uppercase text-(--ov-gulab)">We are getting married</p>
      <p className="ov-display mt-2 text-[1.9rem] leading-[0.95]">
        {d.couple[0]}
        <span className="st-amp">&amp;</span>
        <br />
        {d.couple[1]}
      </p>
      <p className="ov-meta mt-3 text-[0.5rem] uppercase">{d.city}</p>
    </div>
  )
  const frame = 'ov relative mx-auto h-[500px] w-[250px] overflow-hidden rounded-[2rem] border-[6px] border-[#120b0e] shadow-2xl'
  // A design with its own painted opening shows a still of it.
  if (d.cover)
    return (
      <div className={frame}>
        <img src={d.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    )
  return (
    <div className={frame} style={themeVars(d)} onPointerEnter={() => setOpen(true)} onPointerLeave={() => setOpen(false)}>
      {d.layout === 'veil' && (
        <>
          {photo}
          <div className="absolute inset-0 bg-linear-to-b from-black/0 from-35% via-black/35 to-black/85" />
          <div className="absolute inset-x-0 bottom-0 px-3 pb-12 text-white [--ov-gulab:#f3d9a8]">{names}</div>
        </>
      )}
      {d.layout === 'split' && (
        <div className="flex h-full flex-col">
          <div className="relative flex-[1.1]">{photo}</div>
          <div className="grid flex-1 place-items-center px-3">{names}</div>
        </div>
      )}
      {d.layout === 'arch' && (
        <div className="flex h-full flex-col items-center justify-center gap-5 px-6">
          <div className="st-arch relative h-[48%] w-[72%]">
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]">{photo}</div>
          </div>
          {names}
        </div>
      )}
      <Cover d={d} open={open} />
    </div>
  )
}

export default function Websites() {
  useTitle(WEBSITES_TITLE)
  return (
    <div className="velvet min-h-svh text-rose">
      <SiteHeader swap={['Invitation cards', '/#templates']} />
      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h1 className="mt-10 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05]">Wedding website designs</h1>
        <p className="mt-5 max-w-[58ch] text-lg text-rose/80">One link for every guest: your story, every function, the venue, RSVPs and blessings, on any phone. Open a design to try the live sample{API && ', then make it yours for free'}.</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Every design includes">
          {FEATURES.map((f) => (
            <li key={f} className="rounded-full border border-zari/40 px-3 py-1 text-sm text-rose/85">
              {f}
            </li>
          ))}
        </ul>
        <ul className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {DESIGNS.map((d) => (
            <li key={d.id}>
              <a href={designPath(d)} className="group block">
                <div className="transition-transform duration-500 group-hover:-translate-y-1.5">
                  <Phone d={d} />
                </div>
                <h2 className="mt-6 font-display text-2xl">{d.name}</h2>
                <p className="mt-1 text-sm uppercase tracking-[0.14em] text-zari">{d.tradition}</p>
                <p className="mt-2 text-rose/75">{d.blurb}</p>
              </a>
              <div className="mt-4 flex flex-wrap gap-3">
                {API && (
                  <a href={`${designPath(d)}edit/`} className="zari-button inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-wine-deep">
                    Make yours free
                  </a>
                )}
                <a href={designPath(d)} className="inline-flex min-h-11 items-center rounded-full border border-zari px-5 text-sm text-zari hover:bg-zari hover:text-wine-deep">
                  Live preview →
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-20 max-w-[60ch] text-rose/70">
          {API ? (
            'Your website is free and lives at shaaditemplate.com/w/your-names. Fill in your details, add your photos and publish; you get a private link to come back and edit it, and see who has replied. It stays up until 30 days after your last function, then it is deleted with its photos and replies.'
          ) : (
            <>
              Free wedding websites are opening soon. For now,{' '}
              <a href="/#templates" className="text-zari underline underline-offset-4">
                make your invitation card
              </a>
              .
            </>
          )}
        </p>
      </main>
    </div>
  )
}
