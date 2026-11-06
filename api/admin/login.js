import { adminEnvMissing, clearCookie, safeEqual, sessionCookie } from '../_auth.js'
import { redis } from '../_lib.js'

const MAX_FAILS = 10
const LOCK_SECONDS = 15 * 60

// POST login, DELETE logout. Dopo 10 tentativi falliti il login si blocca per 15 minuti per tutti:
// il blocco è globale per non dover salvare gli IP.
export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearCookie)
    return res.status(200).json({ ok: true })
  }
  if (req.method !== 'POST') return res.status(405).end()

  if (adminEnvMissing()) {
    return res.status(500).json({ error: 'Console non configurata: controlla i log su Vercel' })
  }

  const fails = Number((await redis.get('admin:fails')) ?? 0)
  if (fails >= MAX_FAILS) {
    return res.status(429).json({ error: 'Troppi tentativi, riprova tra qualche minuto' })
  }

  if (!safeEqual(req.body?.password ?? '', process.env.ADMIN_PASSWORD)) {
    const tx = redis.multi()
    tx.incr('admin:fails')
    tx.expire('admin:fails', LOCK_SECONDS)
    await tx.exec()
    return res.status(401).json({ error: 'Password errata' })
  }

  await redis.del('admin:fails')
  res.setHeader('Set-Cookie', sessionCookie())
  return res.status(200).json({ ok: true })
}
