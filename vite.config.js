import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'
import articlesMetadata from './plugins/articles-metadata.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    imagetools({
      // come il default, ma accetta anche estensioni maiuscole (es. .JPG delle fotocamere)
      include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/i,
    }),
    articlesMetadata(),
  ],
})
