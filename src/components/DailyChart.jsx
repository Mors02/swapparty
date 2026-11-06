const DAY_MS = 24 * 60 * 60 * 1000
const CHART_DAYS = 14

const dayFormat = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const formatDay = (iso) => dayFormat.format(new Date(`${iso}T12:00:00Z`))

// Stesso calcolo del server: i giorni sono contati nel fuso orario italiano
const todayInRome = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

// Gli ultimi 14 giorni (YYYY-MM-DD) che finiscono in `end`, dal più vecchio
function lastDays(end) {
  const endMs = Date.parse(`${end}T12:00:00Z`)
  return Array.from({ length: CHART_DAYS }, (_, i) =>
    new Date(endMs - (CHART_DAYS - 1 - i) * DAY_MS).toISOString().slice(0, 10),
  )
}

// Prenotazioni al giorno nelle 2 settimane prima dell'evento (o fino a oggi, se l'evento deve ancora arrivare).
// days: { "2026-11-06": 3, ... } come arriva da /api/admin/stats
function DailyChart({ code, days }) {
  const eventDate = `20${code}`
  const today = todayInRome()
  const series = lastDays(eventDate < today ? eventDate : today).map((day) => ({ day, n: Number(days[day] ?? 0) }))
  const max = Math.max(1, ...series.map((d) => d.n))
  const peak = series.reduce((a, b) => (b.n > a.n ? b : a))
  const sum = series.reduce((s, d) => s + d.n, 0)

  return (
    <figure className="mt-5">
      <figcaption className="text-sm text-ink-muted">
        Prenotazioni al giorno, ultimi {CHART_DAYS} giorni ({sum} in totale)
      </figcaption>

      <div
        role="img"
        aria-label={series.map((d) => `${formatDay(d.day)}: ${d.n}`).join(', ')}
        className="mt-6 flex h-40 items-end gap-0.5 border-b border-border"
      >
        {series.map(({ day, n }) => {
          const pct = (n / max) * 100
          return (
            // Tutta la colonna fa da area di hover, non solo la barra
            <div key={day} tabIndex={0} className="group relative flex h-full flex-1 items-end outline-none">
              <div
                className="w-full rounded-t-[4px] bg-pistachio-600 transition-colors group-hover:bg-pistachio-700 group-focus:bg-pistachio-700"
                style={{ height: `${pct}%` }}
              />
              {/* Unica etichetta fissa: il giorno con più prenotazioni */}
              {day === peak.day && n > 0 && (
                <span
                  className="absolute inset-x-0 mb-1 text-center text-xs font-semibold tabular-nums text-ink group-hover:invisible group-focus:invisible"
                  style={{ bottom: `${pct}%` }}
                >
                  {n}
                </span>
              )}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-xs whitespace-nowrap text-cream shadow group-hover:block group-focus:block">
                {formatDay(day)}: <span className="font-semibold tabular-nums">{n}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div aria-hidden="true" className="mt-1 flex gap-0.5">
        {series.map(({ day }) => (
          <span key={day} className="flex-1 text-center text-[0.625rem] tabular-nums text-ink-muted">
            {Number(day.slice(8))}
          </span>
        ))}
      </div>
    </figure>
  )
}

export default DailyChart
