import { formatDate } from '../data/editions.js'

// Posizione finale delle foto che escono da dietro il volantino (stile cartella), verso destra:
// ventaglio stretto a sinistra e largo a destra
const PHOTO_FAN = [
  { x: '42%', y: '-26%', rot: '-14deg' },
  { x: '46%', y: '0%', rot: '0deg' },
  { x: '42%', y: '26%', rot: '14deg' },
]

function EditionCard({ edition, onSelect }) {
  const label = formatDate(edition.date)
  const hasPhotos = edition.gallery.length > 0

  const content = (
    <>
      <div className="relative isolate">
        {edition.previews.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            className="edition-photo absolute top-1/2 left-1/2 aspect-[4/3] w-[95%] rounded-md border-4 border-surface object-cover shadow-lg"
            style={{ '--x': PHOTO_FAN[i].x, '--y': PHOTO_FAN[i].y, '--rot': PHOTO_FAN[i].rot, zIndex: -1 - (2 - i) }}
          />
        ))}
        <img
          src={edition.flyer}
          alt={`Volantino Swap Carpi del ${label}`}
          loading="lazy"
          width="1131"
          height="1600"
          className="edition-flyer relative block h-auto w-full rounded-md shadow-xl shadow-pistachio-900/20"
        />
      </div>
      <p className="mt-5 font-display text-xl font-bold text-pistachio-900">{label}</p>
      <p className="text-sm text-ink-muted">{edition.place}</p>
    </>
  )

  return (
    <li className="relative hover:z-10 focus-within:z-10">
      {hasPhotos ? (
        <button
          type="button"
          onClick={() => onSelect(edition)}
          aria-label={`Guarda le foto dell'edizione del ${label}`}
          className="group mx-auto block w-3/5 cursor-pointer rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-pistachio-700"
        >
          {content}
        </button>
      ) : (
        // Senza foto: il volantino si muove comunque in hover, ma non c'è niente da aprire
        <div className="group mx-auto w-3/5">{content}</div>
      )}
    </li>
  )
}

function PastEditions({ editions, onSelect }) {
  return (
    <section id="edizioni" className="scroll-mt-16 overflow-x-clip bg-cream px-4 py-24 sm:px-10 lg:px-20">
      <h2 className="font-display text-4xl font-bold text-pistachio-900 sm:text-5xl">Edizioni passate</h2>
      <ul className="mt-16 grid gap-x-16 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
        {editions.map((edition) => (
          <EditionCard key={edition.date} edition={edition} onSelect={onSelect} />
        ))}
      </ul>
    </section>
  )
}

export default PastEditions
