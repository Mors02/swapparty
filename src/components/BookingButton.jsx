import { useEffect, useRef, useState } from 'react'
import { formatCode } from '../data/editions.js'

// Codice dell'ultimo evento prenotato da questo browser: quando l'admin apre un evento nuovo il bottone torna attivo
const STORAGE_KEY = 'booked_event'

function readBooked() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function saveBooked(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // storage non disponibile (es. navigazione privata): la prenotazione è comunque registrata
  }
}

// Colori della palette del sito (index.css)
const CONFETTI_COLORS = ['#93c572', '#6fa34f', '#ffd9c4', '#f8cdd8', '#dcd2f4', '#fff0b8', '#cfe8f2']
const CONFETTI_COUNT = 40

// Coriandoli che partono dal centro del bottone, salgono a ventaglio e ricadono sfumando
function burstConfetti(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const { left, top, width, height } = el.getBoundingClientRect()
  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '50', overflow: 'hidden' })
  document.body.appendChild(layer)

  const animations = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const piece = document.createElement('span')
    const size = 6 + Math.random() * 5
    Object.assign(piece.style, {
      position: 'absolute',
      left: `${left + width / 2}px`,
      top: `${top + height / 2}px`,
      width: `${size}px`,
      height: `${size * (Math.random() < 0.5 ? 0.45 : 1)}px`,
      borderRadius: Math.random() < 0.3 ? '50%' : '1px',
      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })
    layer.appendChild(piece)

    // Angolo verso l'alto (±70° dalla verticale), poi la gravità li riporta giù
    const angle = (Math.random() - 0.5) * (Math.PI * 7) / 9
    const speed = 90 + Math.random() * 110
    const dx = Math.sin(angle) * speed
    const rise = Math.cos(angle) * speed
    const spin = (Math.random() - 0.5) * 720
    return piece.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% - ${rise}px)) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(calc(-50% + ${dx * 1.5}px), calc(-50% + ${rise * 0.6 + 80}px)) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' },
    )
  })

  Promise.all(animations.map((a) => a.finished)).finally(() => layer.remove())
}

function BookingButton() {
  const [eventCode, setEventCode] = useState(undefined) // undefined = caricamento
  const [booked, setBooked] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const buttonRef = useRef(null)

  useEffect(() => {
    fetch('/api/book')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(({ eventCode }) => {
        setEventCode(eventCode)
        setBooked(Boolean(eventCode) && readBooked() === eventCode)
      })
      .catch(() => setError('Impossibile caricare le prenotazioni'))
  }, [])

  async function book() {
    setSending(true)
    setError('')
    try {
      const r = await fetch('/api/book', { method: 'POST' })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error)
      saveBooked(data.eventCode)
      setBooked(true)
      burstConfetti(buttonRef.current)
    } catch (e) {
      setError(e.message || 'Errore, riprova')
    } finally {
      setSending(false)
    }
  }

  const note = (text) => <p className="text-sm text-ink-muted">{text}</p>

  if (eventCode === undefined) return error ? note(error) : null
  if (eventCode === null) return note('Al momento non ci sono eventi aperti alle prenotazioni.')

  // Durante l'invio il bottone è già verde: la risposta arriva in un attimo e così non c'è sfarfallio
  const confirmed = booked || sending

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Disabilitato durante l'invio: un doppio clic non crea due prenotazioni */}
      <button
        ref={buttonRef}
        type="button"
        onClick={book}
        disabled={confirmed}
        aria-label={confirmed ? `Ci sarò il ${formatCode(eventCode)}` : `Ci sarai il ${formatCode(eventCode)}? Prenota`}
        className={`group grid rounded-full border-2 px-8 py-3 font-semibold whitespace-nowrap shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pistachio-700 ${
          confirmed
            ? 'cursor-default border-primary-strong bg-primary-strong text-white'
            : 'border-ink bg-surface text-ink hover:border-primary-strong hover:bg-primary-strong hover:text-white'
        }`}
      >
        {/* Le due scritte stanno nella stessa cella: il bottone non cambia larghezza all'hover */}
        <span className={`col-start-1 row-start-1 ${confirmed ? 'invisible' : 'group-hover:invisible'}`}>Ci sarai?</span>
        <span className={`col-start-1 row-start-1 ${confirmed ? '' : 'invisible group-hover:visible'}`}>Ci sarò!</span>
      </button>
      {error && note(error)}
    </div>
  )
}

export default BookingButton
