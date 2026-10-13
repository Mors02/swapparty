// Foto delle edizioni, trovate in automatico: src/assets/photos/<nome volantino>/<foto>.
// Basta aggiungere o togliere file nelle cartelle, nessun elenco da aggiornare.
// Ogni foto viene ridimensionata e convertita in webp al build (vite-imagetools).
const files = import.meta.glob('../assets/photos/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  import: 'default',
  query: '?w=800&format=webp',
})

const byFolder = {}
for (const [path, url] of Object.entries(files)) {
  const [folder, name] = path.split('/').slice(-2)
  ;(byFolder[folder] ??= []).push({ name, url })
}

// Ordine per nome file, con i numeri in ordine naturale (foto2 prima di foto10)
for (const list of Object.values(byFolder)) {
  list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

export const photosFor = (folder) => (byFolder[folder] ?? []).map((p) => p.url)
