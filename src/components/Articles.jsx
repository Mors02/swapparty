import { useState } from 'react'
import { PiArrowUpRightBold } from 'react-icons/pi'
import articles from 'virtual:articles'
import { formatDate } from '../data/editions.js'

function ArticleCard({ article }) {
  // Immagine caricata dal sito della testata: se sparisce, la card resta senza
  const [imageOk, setImageOk] = useState(Boolean(article.image))

  return (
    <li>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pistachio-900/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pistachio-700"
      >
        {imageOk && (
          <img
            src={article.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageOk(false)}
            className="aspect-[4/3] w-full bg-pistachio-100 object-cover"
          />
        )}
        <div className="flex flex-1 flex-col p-6">
          <p className="text-sm font-semibold text-pistachio-700">
            {article.source}
            {article.date && <span className="font-normal text-ink-muted"> · {formatDate(article.date.slice(0, 10))}</span>}
          </p>
          <h3 className="mt-2 font-display text-2xl leading-tight font-bold text-pistachio-900">{article.title}</h3>
          {article.excerpt && <p className="mt-3 line-clamp-3 text-ink-muted">{article.excerpt}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-semibold text-pistachio-900">
            Leggi l'articolo
            <PiArrowUpRightBold className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </a>
    </li>
  )
}

function Articles() {
  if (articles.length === 0) return null

  return (
    <section id="articoli" className="scroll-mt-16 bg-linear-to-b from-pistachio-300 to-pistachio-500 px-4 py-24 sm:px-10 lg:px-20">
      <h2 className="font-display text-4xl font-bold text-pistachio-900 sm:text-5xl">Articoli su di noi</h2>
      <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.url} article={article} />
        ))}
      </ul>
    </section>
  )
}

export default Articles
