import { useEffect, useState } from 'react'
import DailyChart from '../components/DailyChart.jsx'
import { formatCode } from '../data/editions.js'

// Console nascosta /bookings: il codice è pubblico, ma i dati arrivano solo con una sessione valida

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// fetch che non lancia mai: un 500 o una risposta non JSON diventano { ok: false }
async function api(path, options) {
  try {
    const r = await fetch(path, options)
    const data = await r.json().catch(() => ({}))
    return { ok: r.ok, status: r.status, data }
  } catch {
    return { ok: false, status: 0, data: {} }
  }
}

const errorText = (res) => res.data.error ?? 'Errore di connessione, riprova'

const BTN = 'rounded-full px-5 py-2 font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pistachio-700'
const BTN_PRIMARY = `${BTN} bg-primary text-pistachio-900 hover:bg-pistachio-400`
const BTN_SECONDARY = `${BTN} border border-border bg-surface text-ink hover:bg-pistachio-50`
const INPUT = 'rounded-lg border border-border bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-pistachio-700'

function Bookings() {
  const [stats, setStats] = useState(null)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [newDate, setNewDate] = useState('') // YYYY-MM-DD dal date picker
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Chiede ai motori di ricerca di non indicizzare la pagina
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    document.title = 'Prenotazioni · Swap Carpi'
    loadStats()
    return () => meta.remove()
  }, [])

  async function loadStats() {
    const res = await api('/api/admin/stats')
    if (res.status === 401) return setNeedsLogin(true)
    if (!res.ok) return setMessage('Impossibile caricare i dati, riprova')
    setStats(res.data)
    setNeedsLogin(false)
  }

  async function login(e) {
    e.preventDefault()
    setMessage('')
    const res = await api('/api/admin/login', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return setMessage(errorText(res))
    setPassword('')
    loadStats()
  }

  async function logout() {
    await api('/api/admin/login', { method: 'DELETE' })
    setStats(null)
    setMessage('')
    setNeedsLogin(true)
  }

  async function openEvent(e) {
    e.preventDefault()
    const code = newDate.slice(2) // "2026-11-21" -> "26-11-21"
    if (!code) return setMessage("Scegli la data dell'evento")
    if (
      stats.current &&
      stats.current !== code &&
      !window.confirm(`L'evento del ${formatCode(stats.current)} verrà chiuso. Continuare?`)
    )
      return

    const res = await api('/api/admin/event', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ code }),
    })
    if (res.status === 401) return setNeedsLogin(true)
    if (!res.ok) return setMessage(errorText(res))
    setNewDate('')
    setMessage(`Evento del ${formatCode(res.data.current)} aperto`)
    loadStats()
  }

  async function closeEvent() {
    if (!window.confirm(`Chiudere l'evento del ${formatCode(stats.current)}?`)) return
    const res = await api('/api/admin/event', { method: 'DELETE' })
    if (res.status === 401) return setNeedsLogin(true)
    if (!res.ok) return setMessage(errorText(res))
    setMessage('Evento chiuso')
    loadStats()
  }

  const feedback = message && (
    <p role="status" className="mt-3 text-sm text-ink-muted">
      {message}
    </p>
  )

  if (needsLogin) {
    return (
      <main className="mx-auto max-w-sm px-4 py-24">
        <h1 className="font-display text-3xl font-extrabold text-pistachio-900">Area riservata</h1>
        <form onSubmit={login} className="mt-6 flex gap-2">
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className={`${INPUT} min-w-0 flex-1`}
          />
          <button type="submit" className={BTN_PRIMARY}>
            Entra
          </button>
        </form>
        {feedback}
      </main>
    )
  }

  if (!stats) {
    return <main className="mx-auto max-w-3xl px-4 py-24 text-ink-muted">{message || 'Caricamento…'}</main>
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-pistachio-700 uppercase">Prenotazioni</p>
          <h1 className="font-display text-3xl font-extrabold text-pistachio-900">
            {stats.current ? `Evento aperto: ${formatCode(stats.current)}` : 'Nessun evento aperto'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadStats} className={BTN_SECONDARY}>
            Aggiorna
          </button>
          <button type="button" onClick={logout} className={BTN_SECONDARY}>
            Esci
          </button>
        </div>
      </div>

      <section className="mt-10 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl font-bold text-pistachio-900">Gestione eventi</h2>
        <form onSubmit={openEvent} className="mt-4 flex flex-wrap gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            aria-label="Data dell'evento"
            className={INPUT}
          />
          <button type="submit" className={BTN_PRIMARY}>
            Apri evento
          </button>
          {stats.current && (
            <button type="button" onClick={closeEvent} className={BTN_SECONDARY}>
              Chiudi evento in corso
            </button>
          )}
        </form>
        {feedback}
      </section>

      <h2 className="mt-12 font-display text-xl font-bold text-pistachio-900">Eventi</h2>
      {stats.events.length === 0 && <p className="mt-3 text-ink-muted">Nessun evento ancora.</p>}
      <div className="mt-4 flex flex-col gap-3">
        {stats.events.map((ev, i) => (
          // Aperti di default: l'evento in corso, o il più recente se nessuno è aperto
          <details
            key={ev.code}
            open={ev.open || (!stats.current && i === 0)}
            className="group rounded-xl border border-border bg-surface p-5"
          >
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
              <span className="font-semibold text-ink">
                {formatCode(ev.code)}
                {ev.open && (
                  <span className="ml-2 rounded-full bg-pistachio-100 px-2 py-0.5 text-xs font-semibold text-pistachio-800">
                    aperto
                  </span>
                )}
              </span>
              <span className="text-ink-muted">
                <span className="font-display text-2xl font-extrabold tabular-nums text-ink">{ev.total}</span>{' '}
                prenotazioni
              </span>
            </summary>
            <DailyChart code={ev.code} days={ev.days} />
          </details>
        ))}
      </div>
    </main>
  )
}

export default Bookings
