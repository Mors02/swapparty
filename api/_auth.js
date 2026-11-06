import { createHmac, timingSafeEqual } from 'node:crypto'

const MAX_AGE = 7 * 24 * 60 * 60 // 7 giorni in secondi
const COOKIE_ATTRS = 'HttpOnly; Secure; SameSite=Strict; Path=/api'

const sign = (v) => createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(v).digest('hex')

// Senza queste variabili la console resta chiusa: con ADMIN_PASSWORD mancante il confronto
// avverrebbe con la stringa "undefined", che diventerebbe una password valida.
// L'errore finisce nei log di Vercel (scheda Logs del progetto).
export function adminEnvMissing() {
  const missing = ['ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'].filter((k) => !process.env[k])
  if (missing.length) console.error(`[bookings] Variabili d'ambiente mancanti: ${missing.join(', ')}`)
  return missing.length > 0
}

// Confronto a tempo costante (evita attacchi basati sui tempi di risposta)
export function safeEqual(a, b) {
  return timingSafeEqual(Buffer.from(sign(String(a))), Buffer.from(sign(String(b))))
}

export function sessionCookie() {
  const exp = String(Date.now() + MAX_AGE * 1000)
  return `admin_session=${exp}.${sign(exp)}; ${COOKIE_ATTRS}; Max-Age=${MAX_AGE}`
}

export const clearCookie = `admin_session=; ${COOKIE_ATTRS}; Max-Age=0`

export function isAuthenticated(req) {
  if (adminEnvMissing()) return false
  const m = (req.headers.cookie ?? '').match(/(?:^|;\s*)admin_session=([^;]+)/)
  if (!m) return false
  const [exp, sig] = m[1].split('.')
  if (!exp || !sig || Number(exp) < Date.now()) return false
  return safeEqual(sig, sign(exp))
}
