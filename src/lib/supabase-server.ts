import { createClient } from '@supabase/supabase-js'

/**
 * Membuat Supabase client untuk server-side (per-request).
 *
 * Menggunakan HTTPS di bawah kap, sehingga kompatibel dengan:
 * - Node.js (local dev)
 * - Cloudflare Workers runtime (tidak butuh TCP socket)
 *
 * PENTING: Panggil fungsi ini di dalam handler, bukan di module level,
 * karena di Cloudflare Workers env vars baru tersedia per-request.
 */
export function getSupabaseServerClient() {
  // Load .env untuk local dev (tidak ada efek di Cloudflare Workers)
  if (typeof process !== 'undefined' && typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile('.env') } catch { /* ignore */ }
  }

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL

  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_KEY

  if (!url || !key) {
    throw new Error(
      '[supabase-server] SUPABASE_URL dan SUPABASE_ANON_KEY harus dikonfigurasi. ' +
      'Tambahkan ke .dev.vars (lokal) dan wrangler.jsonc vars (Cloudflare).'
    )
  }

  return createClient(url, key, {
    auth: {
      // Nonaktifkan auto-refresh token di server (tidak diperlukan)
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
