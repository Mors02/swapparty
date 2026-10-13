import { useEffect, useRef, useState } from 'react'
import Articles from './components/Articles.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import LatestFlyer from './components/LatestFlyer.jsx'
import PastEditions from './components/PastEditions.jsx'
import PhotoWall from './components/PhotoWall.jsx'
import { editionsByDate } from './data/editions.js'

const [latest, ...past] = editionsByDate

function App() {
  const [headerVisible, setHeaderVisible] = useState(false)
  // Si salva solo la data: l'edizione viene riletta dai dati, così le foto nuove compaiono subito.
  // Nessuna edizione scelta = sezione Foto nascosta
  const [photoDate, setPhotoDate] = useState(null)
  const photoEdition = editionsByDate.find((e) => e.date === photoDate)
  const scrollToPhotos = useRef(false)

  const showPhotos = (edition) => {
    if (edition.date === photoDate) {
      document.getElementById('foto').scrollIntoView()
      return
    }
    scrollToPhotos.current = true
    setPhotoDate(edition.date)
  }

  // Scrolla alle foto solo dopo che la sezione è stata ripopolata
  useEffect(() => {
    if (!scrollToPhotos.current) return
    scrollToPhotos.current = false
    document.getElementById('foto').scrollIntoView()
  }, [photoDate])

  return (
    <div id="top">
      <Header visible={headerVisible} />
      <main>
        <Hero onTitleReachTop={setHeaderVisible} />
        <LatestFlyer edition={latest} />
        <PastEditions editions={past} onSelect={showPhotos} />
        {photoEdition && <PhotoWall edition={photoEdition} />}
        <Articles />
      </main>
      <Footer />
    </div>
  )
}

export default App
