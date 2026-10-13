import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../data/editions.js'

const MAGNETS = ['bg-peach', 'bg-blush', 'bg-lavender', 'bg-butter', 'bg-sky', 'bg-pistachio-300']

// Numero pseudo-casuale stabile in [-1, 1]: stessa foto = stessa posa a ogni render
const jitter = (seed) => {
  const n = Math.sin(seed * 12.9898) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)

// Foto a schermo intero: si apre col click su una polaroid, si chiude con un altro click (o Esc)
function Lightbox({ photo, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (photo && !dialog.open) dialog.showModal()
    if (!photo && dialog.open) dialog.close()
  }, [photo])

  return (
    <dialog
      ref={dialogRef}
      onClick={onClose}
      onClose={onClose}
      className="lightbox m-0 h-dvh max-h-none w-dvw max-w-none cursor-pointer items-center justify-center bg-transparent p-4 backdrop:bg-cream/90 backdrop:backdrop-blur-sm open:flex sm:p-10"
    >
      {photo && (
        <img
          src={photo.full}
          alt={photo.alt}
          className="max-h-full max-w-full rounded-sm border-8 border-b-[2.5rem] border-surface object-contain shadow-2xl shadow-pistachio-900/30 ring-1 ring-border"
        />
      )}
    </dialog>
  )
}

function PhotoWall({ edition }) {
  const label = formatDate(edition.date)
  const base = Math.abs(hash(edition.date))
  const [openPhoto, setOpenPhoto] = useState(null)

  return (
    <section id="foto" className="min-h-[70svh] scroll-mt-16 overflow-x-clip bg-pistachio-100 px-4 py-24 sm:px-10 lg:px-20">
      <h2 className="font-display text-4xl font-bold text-pistachio-900 sm:text-5xl">Foto</h2>
      <p className="mt-3 text-lg text-ink-muted">
        Edizione del {label} · {edition.place}
      </p>

      <ul key={edition.date} className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-4">
        {edition.gallery.map((photo, i) => {
          const seed = base + i * 7
          const pose = {
            '--rot': `${jitter(seed) * 5}deg`,
            '--dx': `${jitter(seed + 1) * 14}px`,
            '--dy': `${jitter(seed + 2) * 14}px`,
            '--delay': `${i * 45}ms`,
          }
          const alt = `Foto ${i + 1} dell'edizione del ${label}`
          return (
            <li key={photo.thumb} className="polaroid relative" style={pose}>
              <button
                type="button"
                onClick={() => setOpenPhoto({ ...photo, alt })}
                aria-label={`Ingrandisci la foto ${i + 1}`}
                className="block w-full cursor-pointer bg-surface p-2.5 pb-10 shadow-lg shadow-pistachio-900/15 transition hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pistachio-700 sm:p-3 sm:pb-12"
              >
                <span
                  aria-hidden="true"
                  className={`absolute -top-2.5 left-1/2 size-5 -translate-x-1/2 rounded-full shadow-md ring-1 ring-pistachio-900/15 ${MAGNETS[(base + i) % MAGNETS.length]}`}
                />
                <img src={photo.thumb} alt={alt} loading="lazy" className="block aspect-square w-full bg-pistachio-100 object-cover" />
              </button>
            </li>
          )
        })}
      </ul>

      <Lightbox photo={openPhoto} onClose={() => setOpenPhoto(null)} />
    </section>
  )
}

export default PhotoWall
