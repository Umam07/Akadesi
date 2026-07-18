import { db } from './index';
import { mahasiswa, mataKuliah, dosen, jadwal, khs, krsItem, pengumuman, pengumumanDibaca } from './schema';

async function seed() {
  console.log('Seeding database with enriched Akadesi data...');

  try {
    // Clear existing data in reverse order of dependency
    console.log('Cleaning up old records...');
    await db.delete(pengumumanDibaca);
    await db.delete(pengumuman);
    await db.delete(khs);
    await db.delete(krsItem);
    await db.delete(jadwal);
    await db.delete(mahasiswa);
    await db.delete(dosen);
    await db.delete(mataKuliah);

    console.log('Inserting new seed data...');

    // 1. Create Dosen
    const insertedDosen = await db.insert(dosen).values([
      { nama: 'Dr. Joko Purwanto, M.T.', nip: '197503122002121001' },
      { nama: 'Prof. Sri Wahyuni, Ph.D.', nip: '196808241994032002' },
      { nama: 'Ahmad Dahlan, S.Kom., M.Cs.', nip: '198810052015041003' },
      { nama: 'Rina Wijayanti, M.Sc.', nip: '199104182018082004' },
      { nama: 'Fajar Nugroho, M.T.', nip: '198205302010121002' },
    ]).returning();

    console.log(`Seeded ${insertedDosen.length} lecturers.`);

    // 2. Create Students (Mahasiswa)
    // Budi Santoso (Sem 4, IPK 3.50, SKS Lulus 60)
    // Siti Aminah (Sem 3, IPK 2.80, SKS Lulus 36)
    const insertedStudents = await db.insert(mahasiswa).values([
      {
        nim: '123456789',
        nama: 'Budi Santoso',
        passwordHash: 'dummy-hash-1',
        ipk: 3.50,
        totalSksLulus: 60,
        semesterAktif: 4,
        email: 'budi.santoso@yarsi.ac.id',
        fakultas: 'Teknologi Informasi',
        jurusan: 'Teknik Informatika',
        noTelepon: '081234567890',
        alamatJalan: 'Jl. Letjen Suprapto No. 1, Cempaka Putih, Jakarta Pusat',
      },
      {
        nim: '987654321',
        nama: 'Siti Aminah',
        passwordHash: 'dummy-hash-2',
        ipk: 2.80,
        totalSksLulus: 36,
        semesterAktif: 3,
        email: 'siti.aminah@yarsi.ac.id',
        fakultas: 'Teknologi Informasi',
        jurusan: 'Teknik Informatika',
        noTelepon: '089876543210',
        alamatJalan: 'Jl. Salemba Raya No. 2, Senen, Jakarta Pusat',
      }
    ]).returning();

    const budi = insertedStudents.find(s => s.nim === '123456789')!;
    const siti = insertedStudents.find(s => s.nim === '987654321')!;
    console.log(`Seeded ${insertedStudents.length} students.`);

    // 3. Create Courses (Mata Kuliah)
    const courses = [
      // Semester 1
      { kodeMk: 'IF101', namaMk: 'Algoritma dan Pemrograman', sks: 3, semester: 1 },
      { kodeMk: 'IF102', namaMk: 'Matematika Diskrit', sks: 3, semester: 1 },
      { kodeMk: 'IF103', namaMk: 'Pengantar Teknologi Informasi', sks: 2, semester: 1 },
      { kodeMk: 'IF104', namaMk: 'Pancasila dan Kewarganegaraan', sks: 2, semester: 1 },
      { kodeMk: 'IF105', namaMk: 'Bahasa Inggris Akademik', sks: 2, semester: 1 },
      
      // Semester 2
      { kodeMk: 'IF201', namaMk: 'Struktur Data', sks: 3, semester: 2 },
      { kodeMk: 'IF202', namaMk: 'Aljabar Linear dan Matriks', sks: 3, semester: 2 },
      { kodeMk: 'IF203', namaMk: 'Organisasi & Arsitektur Komputer', sks: 3, semester: 2 },
      { kodeMk: 'IF204', namaMk: 'Sistem Digital', sks: 3, semester: 2 },
      { kodeMk: 'IF205', namaMk: 'Bahasa Indonesia', sks: 2, semester: 2 },
      
      // Semester 3
      { kodeMk: 'IF301', namaMk: 'Sistem Basis Data', sks: 3, semester: 3 },
      { kodeMk: 'IF302', namaMk: 'Sistem Operasi', sks: 3, semester: 3 },
      { kodeMk: 'IF303', namaMk: 'Jaringan Komputer', sks: 3, semester: 3 },
      { kodeMk: 'IF304', namaMk: 'Pemrograman Berorientasi Objek', sks: 4, semester: 3 },
      { kodeMk: 'IF305', namaMk: 'Statistika dan Probabilitas', sks: 3, semester: 3 },
      
      // Semester 4
      { kodeMk: 'IF401', namaMk: 'Rekayasa Perangkat Lunak', sks: 3, semester: 4 },
      { kodeMk: 'IF402', namaMk: 'Kecerdasan Buatan', sks: 3, semester: 4 },
      { kodeMk: 'IF403', namaMk: 'Analisis & Desain Algoritma', sks: 3, semester: 4 },
      { kodeMk: 'IF404', namaMk: 'Pemrograman Web', sks: 4, semester: 4 },
      { kodeMk: 'IF405', namaMk: 'Interaksi Manusia dan Komputer', sks: 3, semester: 4 },
      { kodeMk: 'IF406', namaMk: 'Grafika Komputer', sks: 3, semester: 4 },
    ];

    const insertedCourses = await db.insert(mataKuliah).values(courses).returning();
    console.log(`Seeded ${insertedCourses.length} courses.`);

    // Map courses by code for easy reference
    const mkMap = new Map(insertedCourses.map(c => [c.kodeMk, c]));

    // 4. Create Schedules (Jadwal) for Current / Available Courses
    // Let's seed schedules for Semester 3 and 4 courses
    await db.insert(jadwal).values([
      // Semester 3 Jadwal
      {
        mataKuliahId: mkMap.get('IF301')!.id,
        dosenId: insertedDosen[0].id, // Joko Purwanto
        hari: 'Senin',
        jamMulai: '08:00:00',
        jamSelesai: '10:30:00',
        ruangan: 'Lab Basis Data',
      },
      {
        mataKuliahId: mkMap.get('IF302')!.id,
        dosenId: insertedDosen[2].id, // Ahmad Dahlan
        hari: 'Selasa',
        jamMulai: '08:00:00',
        jamSelesai: '10:30:00',
        ruangan: 'R-301',
      },
      {
        mataKuliahId: mkMap.get('IF303')!.id,
        dosenId: insertedDosen[3].id, // Rina Wijayanti
        hari: 'Rabu',
        jamMulai: '10:00:00',
        jamSelesai: '12:30:00',
        ruangan: 'Lab Jaringan',
      },
      {
        mataKuliahId: mkMap.get('IF304')!.id,
        dosenId: insertedDosen[1].id, // Sri Wahyuni
        hari: 'Kamis',
        jamMulai: '13:00:00',
        jamSelesai: '16:20:00',
        ruangan: 'Lab Komputasi',
      },
      {
        mataKuliahId: mkMap.get('IF305')!.id,
        dosenId: insertedDosen[4].id, // Fajar Nugroho
        hari: 'Jumat',
        jamMulai: '08:00:00',
        jamSelesai: '10:30:00',
        ruangan: 'R-202',
      },

      // Semester 4 Jadwal
      {
        mataKuliahId: mkMap.get('IF401')!.id,
        dosenId: insertedDosen[0].id,
        hari: 'Senin',
        jamMulai: '10:45:00',
        jamSelesai: '13:15:00',
        ruangan: 'R-401',
      },
      {
        mataKuliahId: mkMap.get('IF402')!.id,
        dosenId: insertedDosen[1].id,
        hari: 'Selasa',
        jamMulai: '13:00:00',
        jamSelesai: '15:30:00',
        ruangan: 'Lab AI',
      },
      {
        mataKuliahId: mkMap.get('IF403')!.id,
        dosenId: insertedDosen[2].id,
        hari: 'Rabu',
        jamMulai: '08:00:00',
        jamSelesai: '10:30:00',
        ruangan: 'R-402',
      },
      {
        mataKuliahId: mkMap.get('IF404')!.id,
        dosenId: insertedDosen[3].id,
        hari: 'Kamis',
        jamMulai: '08:00:00',
        jamSelesai: '11:20:00',
        ruangan: 'Lab Web',
      },
      // Conflict Simulation Course: Let's schedule IF405 to overlap with IF404 on Kamis morning!
      {
        mataKuliahId: mkMap.get('IF405')!.id,
        dosenId: insertedDosen[4].id,
        hari: 'Kamis',
        jamMulai: '09:00:00',
        jamSelesai: '11:30:00',
        ruangan: 'R-403',
      },
      // Conflict Simulation Course 2: Let's schedule IF406 to overlap with IF402 on Selasa afternoon!
      {
        mataKuliahId: mkMap.get('IF406')!.id,
        dosenId: insertedDosen[4].id,
        hari: 'Selasa',
        jamMulai: '14:00:00',
        jamSelesai: '16:30:00',
        ruangan: 'R-405',
      },
    ]);

    console.log('Seeded schedules (including test conflict slots).');

    // 5. Create KHS (Kartu Hasil Studi) history
    // Budi Santoso: Sem 1, 2, 3 completed. (Total 12 + 14 + 16 SKS = 42 SKS? Wait, PRD says Budi has 60 SKS)
    // Let's seed historical grades for Budi:
    // Semester 1 (12 SKS): IF101 (A), IF102 (A), IF103 (A), IF104 (B), IF105 (B)
    // Semester 2 (14 SKS): IF201 (A), IF202 (B), IF203 (A), IF204 (A), IF205 (A)
    // Semester 3 (16 SKS): IF301 (A), IF302 (B), IF303 (A), IF304 (A), IF305 (B)
    // Let's make sure it matches!
    await db.insert(khs).values([
      // Budi - Semester 1
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF101')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF102')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF103')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF104')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF105')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },

      // Budi - Semester 2
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF201')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF202')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF203')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF204')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF205')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },

      // Budi - Semester 3
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF301')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF302')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF303')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF304')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF305')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },

      // Siti - Semester 1
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF101')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF102')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'C', bobot: 2.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF103')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF104')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF105')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },

      // Siti - Semester 2
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF201')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF202')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'C', bobot: 2.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF203')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF204')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF205')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'A', bobot: 4.0 },
    ]);

    console.log('Seeded grade records (KHS).');

    // 6. Seed some active KRS items for students in Semester 3 & 4
    // Budi Santoso (Semester 4 - 2025/2026 Genap) -> Pre-register Rekayasa Perangkat Lunak and Pemrograman Web
    await db.insert(krsItem).values([
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF401')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
      { mahasiswaId: budi.id, mataKuliahId: mkMap.get('IF404')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
      
      // Siti Aminah (Semester 3 - 2025/2026 Genap) -> Pre-register Sistem Basis Data
      { mahasiswaId: siti.id, mataKuliahId: mkMap.get('IF301')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
    ]);

    console.log('Seeded pre-registered KRS items.');

    // 7. Seed announcements (Pengumuman)
    const announcements = await db.insert(pengumuman).values([
      {
        judul: 'Pendaftaran KRS Semester Genap 2025/2026',
        isi: 'Diberitahukan kepada seluruh mahasiswa Fakultas Teknologi Informasi bahwa pengisian KRS untuk Semester Genap 2025/2026 dibuka mulai tanggal 20 Juli hingga 30 Juli 2026. Harap melakukan konsultasi dengan Dosen Pembimbing Akademik masing-masing sebelum memilih mata kuliah untuk menghindari kesalahan kelas.',
        diterbitkanPada: new Date('2026-07-15T09:00:00Z'),
      },
      {
        judul: 'Pelaksanaan Ujian Tengah Semester (UTS)',
        isi: 'Jadwal UTS akan segera dirilis pada awal minggu depan. Pastikan Anda telah melunasi pembayaran uang kuliah semester genap dan mencetak kartu ujian di portal masing-masing. Mahasiswa tanpa kartu ujian fisik/digital tidak diizinkan mengikuti ujian.',
        diterbitkanPada: new Date('2026-07-10T14:30:00Z'),
      },
      {
        judul: 'Workshop Pembangunan Web Modern dengan TanStack',
        isi: 'Fakultas bekerjasama dengan komunitas developer menyelenggarakan Workshop Hands-on TanStack Start dan Supabase pada hari Sabtu, 25 Juli 2026. Acara bertempat di Lab Komputasi pukul 09:00 - 15:00 WIB. Kuota terbatas 40 peserta, segera daftar melalui tautan registrasi di grup prodi.',
        diterbitkanPada: new Date('2026-07-08T10:00:00Z'),
      },
      {
        judul: 'Maintenance Portal SIAKAD Kampus',
        isi: 'Akan dilakukan pemeliharaan sistem SIAKAD pada hari Minggu, 19 Juli 2026 pukul 01:00 hingga 05:00 WIB. Selama durasi tersebut, portal tidak dapat diakses sementara. Mohon maaf atas ketidaknyamanan ini.',
        diterbitkanPada: new Date('2026-07-17T17:00:00Z'),
      }
    ]).returning();

    console.log(`Seeded ${announcements.length} announcements.`);

    // 8. Mark some announcements as read for Budi
    await db.insert(pengumumanDibaca).values([
      { mahasiswaId: budi.id, pengumumanId: announcements[1].id, dibacaPada: new Date() },
      { mahasiswaId: budi.id, pengumumanId: announcements[3].id, dibacaPada: new Date() },
    ]);

    console.log('Seeded announcement read flags.');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed().catch(console.error).finally(() => process.exit(0));
