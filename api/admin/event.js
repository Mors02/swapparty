import { isAuthenticated } from '../_auth.js'
import { isValidCode, redis } from '../_lib.js'

// POST apre un evento (e chiude quello precedente: ne può essere aperto uno solo), DELETE lo chiude.
// Riaprire un codice già usato riprende il conteggio da dove era rimasto.
export default async function handler(req, res) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Non autorizzato' })

  if (req.method === 'POST') {
    const code = String(req.body?.code ?? '').trim()
    if (!isValidCode(code)) {
      return res.status(400).json({ error: 'Codice non valido, usa il formato YY-MM-DD' })
    }
    await redis.multi().set('event:current', code).sadd('events:all', code).exec()
    return res.status(200).json({ current: code })
  }

  if (req.method === 'DELETE') {
    await redis.del('event:current')
    return res.status(200).json({ current: null })
  }

  return res.status(405).end()
}
