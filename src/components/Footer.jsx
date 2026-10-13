import { PiInstagramLogoBold } from 'react-icons/pi'
import articles from 'virtual:articles'

const SECTIONS = [
  { href: '#top', label: 'Home' },
  { href: '#prossima', label: 'Prossima edizione' },
  { href: '#edizioni', label: 'Edizioni passate' },
  articles.length > 0 && { href: '#articoli', label: 'Articoli su di noi' },
].filter(Boolean)

const AUTHORS = [
  { name: 'Emma Bassoli', phone: '+39 331 849 1047', email: 'emmabassoli@gmail.com' },
  { name: 'Emma Bellodi', phone: '+39 331 771 3844' },
]

const YEAR = new Date().getFullYear()

// Nome utente Instagram senza @ (es. 'swapcarpi'): finché è vuoto il link non viene mostrato
const INSTAGRAM = ''

const linkClass = 'text-cream transition hover:text-pistachio-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pistachio-300'

function Column({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-[0.18em] text-pistachio-300 uppercase">{title}</h2>
      <div className="mt-6 text-lg">{children}</div>
    </div>
  )
}

function Footer() {
  return (
    <footer id="contatti" className="scroll-mt-16 bg-pistachio-950 px-4 pt-20 pb-10 text-cream sm:px-10 lg:px-20">
      <div className="grid gap-14 md:grid-cols-3">
        <Column title="Swap Carpi">
          <ul className="space-y-3">
            {SECTIONS.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={linkClass}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Column>

        <Column title="Autrici">
          <ul className="space-y-6">
            {AUTHORS.map(({ name, phone, email }) => (
              <li key={name} className="space-y-1">
                <p className="font-semibold">{name}</p>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className={`block ${linkClass}`}>
                  {phone}
                </a>
                {email && (
                  <a href={`mailto:${email}`} className={`block break-all ${linkClass}`}>
                    {email}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Column>

        <Column title="Social">
          {INSTAGRAM ? (
            <a
              href={`https://www.instagram.com/${INSTAGRAM}/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 ${linkClass}`}
            >
              <PiInstagramLogoBold className="text-xl" />@{INSTAGRAM}
            </a>
          ) : (
            <p className="inline-flex items-center gap-2 text-cream/60">
              <PiInstagramLogoBold className="text-xl" />
              Instagram in arrivo
            </p>
          )}
        </Column>
      </div>

      <p className="mt-20 border-t border-cream/10 pt-6 text-sm text-cream/50">{YEAR} Swap Carpi</p>
    </footer>
  )
}

export default Footer
