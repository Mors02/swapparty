// Foto delle edizioni, trovate in automatico: src/assets/photos/<nome volantino>/<foto>.
// Basta aggiungere o togliere file nelle cartelle, nessun elenco da aggiornare.
// Ogni foto viene ridimensionata e convertita in webp al build (vite-imagetools), in due misure:
// thumb per polaroid e anteprime, full per la visione a schermo intero (mai ingrandita oltre l'originale).
const thumbs = import.meta.glob('../assets/photos/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
  query: '?w=800&format=webp',
})
const fulls = import.meta.glob('../assets/photos/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
  query: '?w=1800&format=webp',
})

const byFolder = {}
for (const [path, thumb] of Object.entries(thumbs)) {
  const [folder, name] = path.split('/').slice(-2)
  ;(byFolder[folder] ??= []).push({ name, thumb, full: fulls[path] })
}

// Ordine per nome file, con i numeri in ordine naturale (foto2 prima di foto10)
for (const list of Object.values(byFolder)) {
  list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

export const photosFor = (folder) => (byFolder[folder] ?? []).map(({ thumb, full }) => ({ thumb, full }))
