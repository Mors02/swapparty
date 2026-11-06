import { codeToDate, getCurrentEvent, redis, today } from './_lib.js'

// Endpoint pubblico del bottone: GET dice se c'è un evento prenotabile, POST registra una prenotazione.
// Un evento la cui data è già passata non accetta più prenotazioni, anche se è rimasto aperto.
// Il limite di richieste per IP è una regola del Vercel Firewall, non sta nel codice.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const code = await getCurrentEvent()
  const isOpen = Boolean(code) && codeToDate(code) >= today()

  if (req.method === 'GET') {
    return res.status(200).json({ eventCode: isOpen ? code : null })
  }
  if (req.method !== 'POST') return res.status(405).end()
  if (!isOpen) {
    return res.status(409).json({ error: 'Nessun evento aperto alle prenotazioni' })
  }

  // Il giorno è quello in cui arriva la prenotazione, non quello dell'evento
  const tx = redis.multi()
  tx.incr(`event:${code}:total`)
  tx.hincrby(`event:${code}:days`, today(), 1)
  await tx.exec()

  return res.status(200).json({ eventCode: code })
}
