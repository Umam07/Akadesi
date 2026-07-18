import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// In a real app, you would use environment variables for the connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/akadesi';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
