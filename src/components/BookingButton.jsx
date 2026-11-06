import { useEffect, useState } from 'react'
import { PiCheckBold } from 'react-icons/pi'
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

// "8 novembre 2026" -> "l'8 novembre 2026", "21 novembre 2026" -> "il 21 novembre 2026"
const withArticle = (date) => (/^(8|11) /.test(date) ? `l'${date}` : `il ${date}`)

function BookingButton() {
  const [eventCode, setEventCode] = useState(undefined) // undefined = caricamento
  const [booked, setBooked] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

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
    } catch (e) {
      setError(e.message || 'Errore, riprova')
    } finally {
      setSending(false)
    }
  }

  const note = (text) => <p className="text-sm text-ink-muted">{text}</p>

  if (eventCode === undefined) return error ? note(error) : null
  if (eventCode === null) return note('Al momento non ci sono eventi aperti alle prenotazioni.')

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Disabilitato durante l'invio: un doppio clic non crea due prenotazioni */}
      <button
        type="button"
        onClick={book}
        disabled={booked || sending}
        className="inline-flex items-center gap-2 rounded-full border-2 border-pistachio-700 bg-surface px-6 py-3 font-semibold text-pistachio-900 shadow-sm transition enabled:hover:bg-pistachio-100 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pistachio-700"
      >
        {booked && <PiCheckBold className="text-xl" />}
        {booked ? 'Prenotazione registrata' : sending ? 'Invio…' : `Prenota per ${withArticle(formatCode(eventCode))}`}
      </button>
      {error && note(error)}
    </div>
  )
}

export default BookingButton
