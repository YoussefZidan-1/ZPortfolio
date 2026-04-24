import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const pdfjsDistPath = dirname(require.resolve('pdfjs-dist/package.json'))
const cMapsDir = normalizePath(join(pdfjsDistPath, 'cmaps'))
const standardFontsDir = normalizePath(join(pdfjsDistPath, 'standard_fonts'))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: cMapsDir, dest: '' },
        { src: standardFontsDir, dest: '' }
      ],
    }),
  ],
  resolve: {
    alias: {
      '#components': resolve(__dirname, 'src/components'),
      '#constants': resolve(__dirname, 'src/constants'),
      '#store': resolve(__dirname, 'src/store'),
      '#hoc': resolve(__dirname, 'src/hoc'),
      '#windows': resolve(__dirname, 'src/windows'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand', 'immer'],
          gsap: ['gsap', '@gsap/react'],
          editor: ['@monaco-editor/react'],
          pdf: ['react-pdf']
        }
      }
    }
  }
})