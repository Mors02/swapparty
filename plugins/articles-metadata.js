import { fileURLToPath, pathToFileURL } from 'node:url'

// Modulo virtuale "virtual:articles": legge i link da src/data/articles.js, scarica i metadati
// Open Graph di ogni pagina e li espone all'app come array già pronto.
// I link che falliscono vengono scartati (con un avviso in console), così la card non compare.

const VIRTUAL_ID = 'virtual:articles'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const LINKS_FILE = fileURLToPath(new URL('../src/data/articles.js', import.meta.url))
const TIMEOUT_MS = 10_000

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

// Alcuni siti codificano due volte (es. "&amp;amp;nbsp;"): si decodifica finché il testo cambia
const decode = (text) => {
  let prev
  do {
    prev = text
    text = text
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
  } while (text !== prev)
  return text.replace(/\s+/g, ' ').trim()
}

const readMeta = (html) => {
  const meta = {}
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()
    const value = tag.match(/\bcontent\s*=\s*"([^"]*)"/i)?.[1] ?? tag.match(/\bcontent\s*=\s*'([^']*)'/i)?.[1]
    if (key && value && !(key in meta)) meta[key] = decode(value)
  }
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]
  if (title) meta['html:title'] = decode(title)
  return meta
}

// "Titolo - Nome Testata" → { title: "Titolo", source: "Nome Testata" }
const splitTitle = (fullTitle, siteName) => {
  if (siteName && fullTitle.endsWith(siteName)) {
    return { title: fullTitle.slice(0, -siteName.length).replace(/\s*[-|–·]\s*$/, ''), source: siteName }
  }
  const match = fullTitle.match(/^(.+?)\s+[-|–]\s+([^-|–]+)$/)
  return match ? { title: match[1], source: match[2] } : { title: fullTitle, source: null }
}

async function fetchArticle(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; SwapCarpiBot/1.0; +link preview)' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const meta = readMeta(await res.text())

  const fullTitle = meta['og:title'] ?? meta['twitter:title'] ?? meta['html:title']
  if (!fullTitle) throw new Error('titolo mancante')

  const { title, source } = splitTitle(fullTitle, meta['og:site_name'])
  const image = meta['og:image'] ?? meta['twitter:image']
  return {
    url: meta['og:url'] ?? url,
    title,
    source: source ?? new URL(url).hostname.replace(/^www\./, ''),
    excerpt: meta['og:description'] ?? meta['twitter:description'] ?? meta.description ?? null,
    image: image ? new URL(image, url).href : null,
    date: meta['article:published_time'] ?? null,
  }
}

export default function articlesMetadata() {
  // In dev evita di riscaricare gli stessi link a ogni modifica del file
  const cache = new Map()

  return {
    name: 'articles-metadata',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    async load(id) {
      if (id !== RESOLVED_ID) return
      this.addWatchFile(LINKS_FILE)

      const { default: links } = await import(`${pathToFileURL(LINKS_FILE).href}?t=${Date.now()}`)
      const results = await Promise.all(
        [...new Set(links)].map(async (url) => {
          if (!cache.has(url)) cache.set(url, fetchArticle(url))
          try {
            return await cache.get(url)
          } catch (err) {
            cache.delete(url)
            this.warn(`articolo scartato (${url}): ${err.message}`)
            return null
          }
        }),
      )

      const articles = results.filter(Boolean)
      return `export default ${JSON.stringify(articles)}`
    },
  }
}
