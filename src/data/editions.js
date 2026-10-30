import { photosFor } from './photos.js'

// Edizioni di Swap Carpi. date = data stampata sul volantino (non sempre coincide col nome file).
// Le foto stanno in src/assets/photos/<nome del volantino senza estensione>/:
// le prime 3 escono anche da dietro il volantino, tutte finiscono nella parete di polaroid.

const EDITIONS = [
  { date: '2023-04-30', flyer: '/flyers/23-04-30.jpeg', place: "Parrocchia di Sant'Agata, Cibeno" },
  { date: '2023-10-15', flyer: '/flyers/23-10-15.jpeg', place: "Parrocchia di Sant'Agata, Cibeno" },
  { date: '2024-06-12', flyer: '/flyers/24-06-12.jpeg', place: 'Parrocchia di Quartirolo, Carpi' },
  { date: '2024-10-20', flyer: '/flyers/24-10-20.jpeg', place: "Parrocchia di Sant'Agata, Cibeno" },
  { date: '2024-11-17', flyer: '/flyers/24-11-17.jpeg', place: 'Società Agricola Terrevive, Carpi' },
  { date: '2025-05-18', flyer: '/flyers/25-05-18.jpg', place: 'Società Agricola Terrevive, Carpi' },
  { date: '2025-11-23', flyer: '/flyers/25-11-23.jpeg', place: 'Oratorio Eden, Carpi' },
  { date: '2026-05-23', flyer: '/flyers/26-05-23.jpeg', place: 'Società Agricola Terrevive, Carpi' },
  { date: '2026-06-14', flyer: '/flyers/26-06-14.jpeg', place: 'Indirizzo privato' },
  { date: '2026-11-08', flyer: '/flyers/26-11-08.jpg', place: "Parrocchia di Sant'Agata, Cibeno" },
].map((e) => {
  const photos = photosFor(e.flyer.split('/').pop().replace(/\.[^.]+$/, ''))
  return { ...e, previews: photos.slice(0, 3).map((p) => p.thumb), gallery: photos }
})

// Dalla più recente alla più vecchia
export const editionsByDate = [...EDITIONS].sort((a, b) => b.date.localeCompare(a.date))

const dateFormat = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
export const formatDate = (iso) => dateFormat.format(new Date(`${iso}T12:00:00`))
