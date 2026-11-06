import { isAuthenticated } from '../_auth.js'
import { getCurrentEvent, redis } from '../_lib.js'

const MAX_EVENTS = 30

// Evento aperto e conteggi degli ultimi 30 eventi, dal più recente
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Non autorizzato' })

  const [current, codes] = await Promise.all([getCurrentEvent(), redis.smembers('events:all')])
  // YY-MM-DD in ordine alfabetico è già in ordine cronologico
  const sorted = codes.map(String).sort().reverse().slice(0, MAX_EVENTS)

  const p = redis.pipeline()
  for (const c of sorted) {
    p.get(`event:${c}:total`)
    p.hgetall(`event:${c}:days`)
  }
  const results = sorted.length ? await p.exec() : []

  const events = sorted.map((code, i) => ({
    code,
    open: code === current,
    total: Number(results[i * 2] ?? 0),
    days: results[i * 2 + 1] ?? {},
  }))

  return res.status(200).json({ current: current ?? null, events })
}
