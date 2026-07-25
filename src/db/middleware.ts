import { createMiddleware } from '@tanstack/react-start';

/**
 * Mendapatkan DATABASE_URL per-request (bukan module level).
 *
 * Pada Cloudflare Workers dengan nodejs_compat, vars dari wrangler.jsonc dan
 * .dev.vars tersedia via process.env HANYA di dalam handler (per-request).
 *
 * Di Node.js lokal (vite dev tanpa Cloudflare plugin), .env di-load manual
 * dan process.env bekerja normal.
 */
function getDbUrl(): string {
  // Load .env di Node environment (hanya di lokal dev, tidak ada efek di Workers)
  if (typeof process !== 'undefined' && typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile('.env'); } catch { /* ignore */ }
  }

  const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  if (url) return url;

  console.warn('[dbMiddleware] DATABASE_URL tidak ditemukan. Menggunakan fallback localhost.');
  return 'postgresql://postgres:postgres@localhost:5432/akadesi';
}

export const dbMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const connectionString = getDbUrl();

    // Import server-only modules secara dinamis agar tidak di-bundle ke client
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = (await import('postgres')).default;
    const schema = await import('./schema');

    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    let requestClient: ReturnType<typeof postgres> | undefined;
    try {
      requestClient = postgres(connectionString, {
        prepare: false,
        // Untuk Supabase: gunakan ssl dengan rejectUnauthorized: false
        // karena Supabase pooler menggunakan self-signed cert atau cert chain berbeda
        ssl: isLocal ? false : { rejectUnauthorized: false },
        connect_timeout: 15,
        idle_timeout: 20,
        max_lifetime: 60 * 5,
      });

      const requestDb = drizzle(requestClient, { schema });
      const result = await next({
        context: { db: requestDb }
      });
      return result;
    } finally {
      if (requestClient) {
        // Tutup koneksi setelah request selesai
        await requestClient.end({ timeout: 5 }).catch(() => { /* ignore cleanup errors */ });
      }
    }
  });
