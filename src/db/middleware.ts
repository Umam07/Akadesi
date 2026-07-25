import { createMiddleware } from '@tanstack/react-start';

export const dbMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const connectionString = process.env.DATABASE_URL || import.meta.env?.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/akadesi';

    // Dynamically import server-only database modules to prevent bundling them on the client
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = (await import('postgres')).default;
    const schema = await import('./schema');

    const requestClient = postgres(connectionString, { prepare: false });
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
