import { PiCalendarStarBold, PiClockCounterClockwiseBold, PiEnvelopeSimpleBold, PiNewspaperBold } from 'react-icons/pi'
import { TbHanger } from 'react-icons/tb'
import articles from 'virtual:articles'

const LINKS = [
  { href: '#prossima', label: 'Prossimo evento', Icon: PiCalendarStarBold, featured: true },
  { href: '#edizioni', label: 'Edizioni passate', Icon: PiClockCounterClockwiseBold },
  // La sezione Articoli sparisce se nessun link è stato recuperato: in quel caso niente bottone
  articles.length > 0 && { href: '#articoli', label: 'Articoli', Icon: PiNewspaperBold },
  { href: '#contatti', label: 'Contatti', Icon: PiEnvelopeSimpleBold },
].filter(Boolean)

function Header({ visible }) {
  return (
    <header
      inert={!visible}
      className={`fixed inset-x-0 top-0 z-50 border-b border-border bg-cream/90 backdrop-blur transition duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-10 lg:px-20">
        <a href="#top" className="flex items-center gap-2 font-display text-2xl font-extrabold text-pistachio-900">
          <TbHanger className="text-pistachio-600" />
          SwapCarpi
        </a>

        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(({ href, label, Icon, featured }) => (
            <a
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-pistachio-900 transition hover:bg-pistachio-100 ${
                featured ? 'text-base' : 'text-sm'
              }`}
            >
              <Icon className={featured ? 'text-xl' : 'text-lg'} />
              <span className="sr-only lg:not-sr-only">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
