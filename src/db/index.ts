import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || import.meta.env?.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/akadesi';

console.log('DB CONNECTION TARGET:', connectionString.includes('@') ? connectionString.split('@')[1] : 'localhost/default');

// Global singleton client for migrations, seeds, or non-request scripts
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

