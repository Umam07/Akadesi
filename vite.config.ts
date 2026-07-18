import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isTest = typeof process !== 'undefined' && !!process.env.VITEST

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    !isTest && cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ].filter(Boolean),
})

export default config
