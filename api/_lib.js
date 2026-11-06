import { Redis } from '@upstash/redis'

// Il progetto Vercel è collegato a Upstash con il prefisso "UPSTASH_DB"; gli altri nomi restano
// come riserva se il database viene ricollegato senza prefisso
export const redis = new Redis({
  url: process.env.UPSTASH_DB_KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL,
  token:
    process.env.UPSTASH_DB_KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN,
})

// Data di oggi in Italia, formato YYYY-MM-DD
export const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

// Codice evento valido: YY-MM-DD
export const isValidCode = (c) => /^\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(c ?? '')

// "26-11-21" -> "2026-11-21", confrontabile con today()
export const codeToDate = (c) => `20${c}`

export const getCurrentEvent = () => redis.get('event:current')
