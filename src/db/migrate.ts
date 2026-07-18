import { db } from './index';
import { sql } from 'drizzle-orm';

async function run() {
  console.log('Running manual migration to add profile columns...');
  try {
    await db.execute(sql`
      ALTER TABLE mahasiswa 
      ADD COLUMN IF NOT EXISTS email varchar(255),
      ADD COLUMN IF NOT EXISTS fakultas varchar(255),
      ADD COLUMN IF NOT EXISTS jurusan varchar(255),
      ADD COLUMN IF NOT EXISTS no_telepon varchar(50),
      ADD COLUMN IF NOT EXISTS alamat_jalan varchar(255);
    `);
    console.log('Manual migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

run();
