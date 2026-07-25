import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isTest = typeof process !== 'undefined' && !!process.env.VITEST

export default defineConfig(({ command }) => {
  // Aktifkan Cloudflare plugin HANYA saat build (production), bukan saat dev
  // Alasan: Cloudflare plugin membuat SSR berjalan di workerd (Workers runtime simulator)
  // yang tidak mendukung TCP connections dari library `postgres`.
  // Di dev, biarkan SSR berjalan di Node.js agar koneksi database berfungsi normal.
  const isCloudflare = !isTest && command === 'build'

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      isCloudflare && cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ].filter(Boolean),
  }
})
