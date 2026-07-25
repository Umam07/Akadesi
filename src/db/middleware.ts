import { createMiddleware } from '@tanstack/react-start';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/akadesi';

export const dbMiddleware = createMiddleware()
  .server(async ({ next }) => {
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
