import { useRef } from 'react'
import { PiDownloadSimpleBold } from 'react-icons/pi'
import { formatDate } from '../data/editions.js'

// Inclinazione massima in gradi: gli angoli del volantino seguono il puntatore
const MAX_TILT = 8

function LatestFlyer({ edition, onSelect }) {
  const cardRef = useRef(null)
  // Come per le edizioni passate: il volantino apre le foto solo se ce ne sono
  const hasPhotos = edition.gallery.length > 0

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const el = cardRef.current
    const { left, top, width, height } = el.getBoundingClientRect()
    const px = (e.clientX - left) / width - 0.5
    const py = (e.clientY - top) / height - 0.5
    el.style.setProperty('--ry', `${px * MAX_TILT * 2}deg`)
    el.style.setProperty('--rx', `${-py * MAX_TILT * 2}deg`)
    el.style.setProperty('--gx', `${(px + 0.5) * 100}%`)
    el.style.setProperty('--gy', `${(py + 0.5) * 100}%`)
  }

  const onPointerLeave = () => {
    const el = cardRef.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const ext = edition.flyer.split('.').pop()

  return (
    <section
      id="prossima"
      className="flex min-h-svh scroll-mt-16 items-center bg-pistachio-50 px-4 py-24 sm:px-10 lg:px-20"
    >
      <div className="grid w-full items-center gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="[perspective:1200px]" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
          <div
            ref={cardRef}
            {...(hasPhotos && {
              role: 'button',
              tabIndex: 0,
              'aria-label': `Guarda le foto dell'edizione del ${formatDate(edition.date)}`,
              onClick: () => onSelect(edition),
              onKeyDown: (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                onSelect(edition)
              },
            })}
            className={`flyer-tilt relative mx-auto w-full max-w-[min(36rem,56svh)] overflow-hidden rounded-lg shadow-2xl shadow-pistachio-900/25 ${
              hasPhotos ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-pistachio-700' : ''
            }`}
          >
            <img
              src={edition.flyer}
              alt={`Volantino Swap Carpi del ${formatDate(edition.date)}`}
              width="1131"
              height="1600"
              className="block h-auto w-full"
            />
            <div aria-hidden="true" className="flyer-glare pointer-events-none absolute inset-0" />
          </div>
        </div>

        <div className="w-fit max-w-full justify-self-end text-right">
          <h2 className="font-display text-[2rem] md:text-[clamp(1.75rem,3.4vw,3.75rem)] leading-[1.08] font-extrabold tracking-tight text-pistachio-900">
            Porta i vestiti che non usi <br className="hidden sm:inline" />e trasformali nel <br className="hidden sm:inline" />
            tuo <mark className="highlight">prossimo outfit</mark>
          </h2>
          <div className="mt-8 flex justify-end">
            <a
              href={edition.flyer}
              download={`swapcarpi-${edition.date}.${ext}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-pistachio-900 shadow-sm transition hover:bg-pistachio-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pistachio-700"
            >
              <PiDownloadSimpleBold className="text-xl" />
              Clicca qui per scaricare il volantino
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LatestFlyer
