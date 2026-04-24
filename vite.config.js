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
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@monaco-editor')) return 'editor';
              if (id.includes('react-pdf') || id.includes('pdfjs-dist')) return 'pdf';
              if (id.includes('gsap')) return 'gsap';
              if (id.includes('react') || id.includes('zustand') || id.includes('immer')) return 'vendor';
            }
          }
        }
      },
      modulePreload: {
        resolveDependencies: (filename, deps) => {
          return deps.filter(dep => !dep.includes('pdf') && !dep.includes('editor'));
        }
      }
  }
})