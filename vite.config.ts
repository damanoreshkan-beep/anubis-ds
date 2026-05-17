import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

// Library build — emits `dist/react/index.js` + `index.d.ts`. React,
// React-DOM, and the Radix Primitives are externalised; consumers
// supply them.
export default defineConfig({
    plugins: [
        react(),
        dts({ outDir: 'dist/react', tsconfigPath: 'tsconfig.json', include: ['src'] }),
    ],
    build: {
        outDir: 'dist/react',
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: () => 'index.js',
        },
        rollupOptions: {
            external: [
                'react', 'react-dom', 'react/jsx-runtime',
                /^@radix-ui\//,
                'class-variance-authority',
                'clsx',
                'lucide-react',
                'sonner',
                'tailwind-merge',
            ],
        },
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
})
