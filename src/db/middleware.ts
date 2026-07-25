import { createMiddleware } from '@tanstack/react-start';

// Load .env file in Node environment (local dev) if DATABASE_URL is not set
if (typeof process !== 'undefined' && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch {
    // Ignore error if .env file is missing
  }
}

export const dbMiddleware = createMiddleware()
  .server(async ({ next }) => {
    let connectionString = process.env.DATABASE_URL || import.meta.env?.DATABASE_URL || process.env.VITE_DATABASE_URL;

    if (!connectionString) {
      try {
        const cfWorkers = await import('cloudflare:workers');
        connectionString = (cfWorkers.env?.DATABASE_URL || cfWorkers.env?.VITE_DATABASE_URL) as string | undefined;
      } catch {
        // Fallback if not running inside Cloudflare Workers
      }
    }

    if (!connectionString) {
      connectionString = 'postgresql://postgres:postgres@localhost:5432/akadesi';
    }

    // Dynamically import server-only database modules to prevent bundling them on the client
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = (await import('postgres')).default;
    const schema = await import('./schema');

    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    const requestClient = postgres(connectionString, {
      prepare: false,
      ssl: isLocal ? false : 'require',
    });
    const requestDb = drizzle(requestClient, { schema });
    try {
      const result = await next({
        context: {
          db: requestDb
        }
      });
      return result;
    } finally {
      await requestClient.end();
    }
  });
