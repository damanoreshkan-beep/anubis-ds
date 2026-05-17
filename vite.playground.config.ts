import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { resolve } from 'node:path'

// Playground app — Vite builds the HTML at examples/index.html into
// dist/playground/. The page imports straight from `src/` so we
// always demo the latest TSX, not whatever was last bundled into
// dist/react/.
export default defineConfig({
    root: 'examples',
    base: './',
    plugins: [react()],
    css: {
        postcss: {
            // @ts-ignore — tailwindcss v3 accepts a config object/path
            plugins: [tailwindcss({ config: resolve(__dirname, 'tailwind.playground.config.cjs') }), autoprefixer()],
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: resolve(__dirname, 'dist/playground'),
        emptyOutDir: true,
        sourcemap: true,
    },
})
