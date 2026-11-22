import { SiteHeader } from '../Hero'
import { DESIGNS, designPath, type Design } from './designs'
import { useTitle } from './shared'
import { themeVars } from './WeddingSite'
import './organza.css'
import './site.css'

// The wedding website designs, each shown as a phone with its opening screen and a link to the live sample.

const FEATURES = ['Countdown to the day', 'Your story', 'Every function, with add to calendar', 'Venue and map', 'Photo gallery', 'RSVP', 'Guest blessings']

function Phone({ d }: { d: Design }) {
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
  return (
    <div className="ov relative mx-auto aspect-[9/18] w-full max-w-[250px] overflow-hidden rounded-[2rem] border-[6px] border-[#120b0e] shadow-2xl" style={themeVars(d)}>
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
    </div>
  )
}

export default function Websites() {
  useTitle('Wedding website designs | ShaadiTemplate')
  return (
    <div className="velvet min-h-svh text-rose">
      <SiteHeader swap={['Invitation cards', '#templates']} />
      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h1 className="mt-10 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05]">Wedding website designs</h1>
        <p className="mt-5 max-w-[58ch] text-lg text-rose/80">One link for every guest: your story, every function, the venue, RSVPs and blessings, on any phone. Open a design to try the live sample.</p>
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
                <span className="mt-4 inline-flex min-h-11 items-center rounded-full border border-zari px-5 text-sm text-zari group-hover:bg-zari group-hover:text-wine-deep">Live preview →</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-20 text-rose/70">
          Wedding websites are coming soon. For now,{' '}
          <a href="#templates" className="text-zari underline underline-offset-4">
            make your invitation card
          </a>
          .
        </p>
      </main>
    </div>
  )
}
