import { db } from './index';
import { mahasiswa, mataKuliah, dosen, jadwal } from './schema';

async function seed() {
  console.log('Seeding database...');
  
  // Create dummy students
  await db.insert(mahasiswa).values([
    {
      nim: '123456789',
      nama: 'Budi Santoso',
      passwordHash: 'dummy-hash-1', // In a real app, use bcrypt hash
      ipk: 3.5,
      totalSksLulus: 60,
      semesterAktif: 4,
    },
    {
      nim: '987654321',
      nama: 'Siti Aminah',
      passwordHash: 'dummy-hash-2',
      ipk: 2.8,
      totalSksLulus: 40,
      semesterAktif: 3,
    }
  ]).returning();

  // Create dummy mata kuliah
  const insertedMataKuliah = await db.insert(mataKuliah).values([
    {
      kodeMk: 'IF101',
      namaMk: 'Algoritma dan Pemrograman',
      sks: 3,
      semester: 1,
    },
    {
      kodeMk: 'IF201',
      namaMk: 'Struktur Data',
      sks: 3,
      semester: 2,
    },
    {
      kodeMk: 'IF301',
      namaMk: 'Basis Data',
      sks: 3,
      semester: 3,
    },
    {
      kodeMk: 'IF401',
      namaMk: 'Rekayasa Perangkat Lunak',
      sks: 3,
      semester: 4,
    }
  ]).returning();

  // Create dummy dosen
  const insertedDosen = await db.insert(dosen).values([
    {
      nama: 'Dr. Joko Purwanto',
      nip: 'D001',
    },
    {
      nama: 'Prof. Sri Wahyuni',
      nip: 'D002',
    }
  ]).returning();

  // Create dummy jadwal
  await db.insert(jadwal).values([
    {
      mataKuliahId: insertedMataKuliah[0].id,
      dosenId: insertedDosen[0].id,
      hari: 'Senin',
      jamMulai: '08:00:00',
      jamSelesai: '10:30:00',
      ruangan: 'A-101',
    },
    {
      mataKuliahId: insertedMataKuliah[1].id,
      dosenId: insertedDosen[1].id,
      hari: 'Selasa',
      jamMulai: '10:00:00',
      jamSelesai: '12:30:00',
      ruangan: 'B-201',
    }
  ]);

  console.log('Seeding completed successfully!');
}

seed().catch(console.error).finally(() => process.exit(0));
