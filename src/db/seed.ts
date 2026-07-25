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
    const insertedStudents = await db.insert(mahasiswa).values([
      {
        nim: '120100001',
        nama: 'Farhan Ramadhan',
        passwordHash: 'password1',
        ipk: 3.85,
        totalSksLulus: 80,
        semesterAktif: 5,
        email: 'farhan.ramadhan@yarsi.ac.id',
        fakultas: 'Teknologi Informasi',
        jurusan: 'Teknik Informatika',
        noTelepon: '081234567891',
        alamatJalan: 'Jl. Cempaka Putih Tengah No. 12, Cempaka Putih, Jakarta Pusat',
      },
      {
        nim: '120100002',
        nama: 'Larasati Putri',
        passwordHash: 'password2',
        ipk: 3.42,
        totalSksLulus: 44,
        semesterAktif: 3,
        email: 'larasati.putri@yarsi.ac.id',
        fakultas: 'Teknologi Informasi',
        jurusan: 'Sistem Informasi',
        noTelepon: '081234567892',
        alamatJalan: 'Jl. Rawamangun Muka No. 4, Pulo Gadung, Jakarta Timur',
      },
      {
        nim: '120200003',
        nama: 'Rian Hidayat',
        passwordHash: 'password3',
        ipk: 2.95,
        totalSksLulus: 108,
        semesterAktif: 7,
        email: 'rian.hidayat@yarsi.ac.id',
        fakultas: 'Ekonomi dan Bisnis',
        jurusan: 'Akuntansi',
        noTelepon: '081234567893',
        alamatJalan: 'Jl. Salemba Tengah No. 15, Senen, Jakarta Pusat',
      },
      {
        nim: '120200004',
        nama: 'Nadia Utami',
        passwordHash: 'password4',
        ipk: 3.68,
        totalSksLulus: 42,
        semesterAktif: 3,
        email: 'nadia.utami@yarsi.ac.id',
        fakultas: 'Kedokteran',
        jurusan: 'Kedokteran Umum',
        noTelepon: '081234567894',
        alamatJalan: 'Jl. Johar Baru No. 8, Johar Baru, Jakarta Pusat',
      },
      {
        nim: '120200005',
        nama: 'Daffa Saputra',
        passwordHash: 'password5',
        ipk: 3.15,
        totalSksLulus: 20,
        semesterAktif: 2,
        email: 'daffa.saputra@yarsi.ac.id',
        fakultas: 'Hukum',
        jurusan: 'Ilmu Hukum',
        noTelepon: '081234567895',
        alamatJalan: 'Jl. Utan Kayu No. 25, Matraman, Jakarta Timur',
      }
    ]).returning();

    console.log(`Seeded ${insertedStudents.length} students.`);

    const farhan = insertedStudents.find(s => s.nim === '120100001')!;
    const larasati = insertedStudents.find(s => s.nim === '120100002')!;
    const rian = insertedStudents.find(s => s.nim === '120200003')!;
    const nadia = insertedStudents.find(s => s.nim === '120200004')!;
    const daffa = insertedStudents.find(s => s.nim === '120200005')!;

    // 3. Create Courses (Mata Kuliah)
    const courses = [
      // FTI - Teknik Informatika (Semester 1 - 8)
      { kodeMk: 'IF101', namaMk: 'Algoritma dan Pemrograman', sks: 3, semester: 1, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF102', namaMk: 'Matematika Diskrit', sks: 3, semester: 1, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF103', namaMk: 'Pengantar Teknologi Informasi', sks: 2, semester: 1, jurusan: 'Teknik Informatika', isWajib: true },
      
      { kodeMk: 'IF201', namaMk: 'Struktur Data', sks: 3, semester: 2, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF202', namaMk: 'Sistem Operasi', sks: 3, semester: 2, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF203', namaMk: 'Aljabar Linier & Matriks', sks: 3, semester: 2, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF204', namaMk: 'Arsitektur Komputer', sks: 3, semester: 2, jurusan: 'Teknik Informatika', isWajib: true },

      { kodeMk: 'IF301', namaMk: 'Sistem Basis Data', sks: 3, semester: 3, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF302', namaMk: 'Jaringan Komputer', sks: 3, semester: 3, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF303', namaMk: 'Pemrograman Berorientasi Objek', sks: 4, semester: 3, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF304', namaMk: 'Statistika & Probabilitas', sks: 3, semester: 3, jurusan: 'Teknik Informatika', isWajib: true },

      { kodeMk: 'IF401', namaMk: 'Rekayasa Perangkat Lunak', sks: 3, semester: 4, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF402', namaMk: 'Pemrograman Web', sks: 4, semester: 4, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF403', namaMk: 'Analisis & Perancangan Algoritma', sks: 3, semester: 4, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF404', namaMk: 'Grafika Komputer', sks: 3, semester: 4, jurusan: 'Teknik Informatika', isWajib: false },

      { kodeMk: 'IF501', namaMk: 'Kecerdasan Buatan', sks: 3, semester: 5, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF502', namaMk: 'Keamanan Informasi', sks: 3, semester: 5, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF503', namaMk: 'Pemrograman Mobile', sks: 3, semester: 5, jurusan: 'Teknik Informatika', isWajib: false },
      { kodeMk: 'IF504', namaMk: 'Pengolahan Citra Digital', sks: 3, semester: 5, jurusan: 'Teknik Informatika', isWajib: false },

      { kodeMk: 'IF601', namaMk: 'Cloud Computing', sks: 3, semester: 6, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF602', namaMk: 'Machine Learning & Data Mining', sks: 3, semester: 6, jurusan: 'Teknik Informatika', isWajib: false },
      { kodeMk: 'IF603', namaMk: 'Interaksi Manusia & Komputer', sks: 3, semester: 6, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF604', namaMk: 'Internet of Things (IoT)', sks: 3, semester: 6, jurusan: 'Teknik Informatika', isWajib: false },

      { kodeMk: 'IF701', namaMk: 'Metodologi Penelitian', sks: 2, semester: 7, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF702', namaMk: 'Kerja Praktek / Magang', sks: 4, semester: 7, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF703', namaMk: 'Etika Profesi & Technopreneurship', sks: 2, semester: 7, jurusan: 'Teknik Informatika', isWajib: true },
      { kodeMk: 'IF704', namaMk: 'Kapita Selekta Informatika', sks: 3, semester: 7, jurusan: 'Teknik Informatika', isWajib: false },

      { kodeMk: 'IF801', namaMk: 'Skripsi / Tugas Akhir', sks: 6, semester: 8, jurusan: 'Teknik Informatika', isWajib: true },

      // FTI - Sistem Informasi
      { kodeMk: 'SI101', namaMk: 'Dasar-Dasar Sistem Informasi', sks: 3, semester: 1, jurusan: 'Sistem Informasi', isWajib: true },
      { kodeMk: 'SI201', namaMk: 'Analisis dan Perancangan Sistem', sks: 3, semester: 2, jurusan: 'Sistem Informasi', isWajib: true },
      { kodeMk: 'SI301', namaMk: 'Manajemen Basis Data', sks: 3, semester: 3, jurusan: 'Sistem Informasi', isWajib: true },
      { kodeMk: 'SI302', namaMk: 'Desain Pengalaman Pengguna (UX)', sks: 3, semester: 3, jurusan: 'Sistem Informasi', isWajib: true },
      { kodeMk: 'SI401', namaMk: 'E-Business', sks: 3, semester: 4, jurusan: 'Sistem Informasi', isWajib: true },
      { kodeMk: 'SI501', namaMk: 'Manajemen Proyek TI', sks: 3, semester: 5, jurusan: 'Sistem Informasi', isWajib: true },
      { kodeMk: 'SI601', namaMk: 'Audit Sistem Informasi', sks: 3, semester: 6, jurusan: 'Sistem Informasi', isWajib: false },
      { kodeMk: 'SI701', namaMk: 'Tata Kelola TI', sks: 3, semester: 7, jurusan: 'Sistem Informasi', isWajib: true },

      // FEB - Akuntansi
      { kodeMk: 'AK101', namaMk: 'Pengantar Akuntansi I', sks: 3, semester: 1, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK102', namaMk: 'Pengantar Bisnis', sks: 2, semester: 1, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK201', namaMk: 'Pengantar Akuntansi II', sks: 3, semester: 2, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK301', namaMk: 'Akuntansi Keuangan Menengah I', sks: 3, semester: 3, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK401', namaMk: 'Akuntansi Keuangan Menengah II', sks: 3, semester: 4, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK501', namaMk: 'Akuntansi Biaya', sks: 3, semester: 5, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK601', namaMk: 'Perpajakan', sks: 3, semester: 6, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK701', namaMk: 'Auditing I', sks: 3, semester: 7, jurusan: 'Akuntansi', isWajib: true },
      { kodeMk: 'AK702', namaMk: 'Akuntansi Sektor Publik', sks: 3, semester: 7, jurusan: 'Akuntansi', isWajib: false },

      // FK - Kedokteran Umum
      { kodeMk: 'KU101', namaMk: 'Biologi Sel dan Genetika', sks: 4, semester: 1, jurusan: 'Kedokteran Umum', isWajib: true },
      { kodeMk: 'KU102', namaMk: 'Anatomi Dasar', sks: 4, semester: 1, jurusan: 'Kedokteran Umum', isWajib: true },
      { kodeMk: 'KU201', namaMk: 'Fisiologi Manusia', sks: 4, semester: 2, jurusan: 'Kedokteran Umum', isWajib: true },
      { kodeMk: 'KU202', namaMk: 'Biokimia Kedokteran', sks: 3, semester: 2, jurusan: 'Kedokteran Umum', isWajib: true },
      { kodeMk: 'KU301', namaMk: 'Farmakologi Dasar', sks: 4, semester: 3, jurusan: 'Kedokteran Umum', isWajib: true },
      { kodeMk: 'KU302', namaMk: 'Patologi Anatomi', sks: 3, semester: 3, jurusan: 'Kedokteran Umum', isWajib: true },
      { kodeMk: 'KU401', namaMk: 'Mikrobiologi Kedokteran', sks: 4, semester: 4, jurusan: 'Kedokteran Umum', isWajib: true },

      // FH - Ilmu Hukum
      { kodeMk: 'HK101', namaMk: 'Pengantar Ilmu Hukum', sks: 3, semester: 1, jurusan: 'Ilmu Hukum', isWajib: true },
      { kodeMk: 'HK102', namaMk: 'Pengantar Hukum Indonesia', sks: 3, semester: 1, jurusan: 'Ilmu Hukum', isWajib: true },
      { kodeMk: 'HK201', namaMk: 'Hukum Perdata', sks: 3, semester: 2, jurusan: 'Ilmu Hukum', isWajib: true },
      { kodeMk: 'HK202', namaMk: 'Hukum Pidana', sks: 3, semester: 2, jurusan: 'Ilmu Hukum', isWajib: true },
      { kodeMk: 'HK301', namaMk: 'Hukum Tata Negara', sks: 3, semester: 3, jurusan: 'Ilmu Hukum', isWajib: true },
      { kodeMk: 'HK401', namaMk: 'Hukum Administrasi Negara', sks: 3, semester: 4, jurusan: 'Ilmu Hukum', isWajib: true },

      // Mata Kuliah Umum (Untuk Semua Jurusan)
      { kodeMk: 'UM101', namaMk: 'Pancasila dan Kewarganegaraan', sks: 2, semester: 1, jurusan: null, isWajib: true },
      { kodeMk: 'UM102', namaMk: 'Bahasa Indonesia', sks: 2, semester: 1, jurusan: null, isWajib: true },
      { kodeMk: 'UM103', namaMk: 'Bahasa Inggris Akademik', sks: 2, semester: 1, jurusan: null, isWajib: true },
      { kodeMk: 'UM104', namaMk: 'Pendidikan Agama & Etika', sks: 2, semester: 2, jurusan: null, isWajib: true },
    ];

    const insertedCourses = await db.insert(mataKuliah).values(courses).returning();
    console.log(`Seeded ${insertedCourses.length} courses.`);

    // Map courses by code for easy reference
    const mkMap = new Map(insertedCourses.map(c => [c.kodeMk, c]));

    // 4. Create Schedules (Jadwal)
    await db.insert(jadwal).values([
      // FTI - Informatika
      { mataKuliahId: mkMap.get('IF301')!.id, dosenId: insertedDosen[0].id, hari: 'Senin', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'Lab Basis Data' },
      { mataKuliahId: mkMap.get('IF302')!.id, dosenId: insertedDosen[2].id, hari: 'Selasa', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-301' },
      { mataKuliahId: mkMap.get('IF303')!.id, dosenId: insertedDosen[1].id, hari: 'Kamis', jamMulai: '13:00:00', jamSelesai: '16:20:00', ruangan: 'Lab Komputasi' },
      { mataKuliahId: mkMap.get('IF401')!.id, dosenId: insertedDosen[0].id, hari: 'Senin', jamMulai: '10:45:00', jamSelesai: '13:15:00', ruangan: 'R-401' },
      { mataKuliahId: mkMap.get('IF402')!.id, dosenId: insertedDosen[3].id, hari: 'Kamis', jamMulai: '08:00:00', jamSelesai: '11:20:00', ruangan: 'Lab Web' },
      { mataKuliahId: mkMap.get('IF501')!.id, dosenId: insertedDosen[4].id, hari: 'Senin', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-501' },
      { mataKuliahId: mkMap.get('IF502')!.id, dosenId: insertedDosen[3].id, hari: 'Rabu', jamMulai: '10:00:00', jamSelesai: '12:30:00', ruangan: 'Lab Keamanan' },
      { mataKuliahId: mkMap.get('IF601')!.id, dosenId: insertedDosen[2].id, hari: 'Selasa', jamMulai: '13:00:00', jamSelesai: '15:30:00', ruangan: 'Lab Cloud' },
      { mataKuliahId: mkMap.get('IF701')!.id, dosenId: insertedDosen[1].id, hari: 'Jumat', jamMulai: '08:00:00', jamSelesai: '09:40:00', ruangan: 'R-701' },

      // FTI - Sistem Informasi
      { mataKuliahId: mkMap.get('SI101')!.id, dosenId: insertedDosen[2].id, hari: 'Senin', jamMulai: '13:30:00', jamSelesai: '16:00:00', ruangan: 'R-201' },
      { mataKuliahId: mkMap.get('SI201')!.id, dosenId: insertedDosen[0].id, hari: 'Rabu', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-202' },
      { mataKuliahId: mkMap.get('SI301')!.id, dosenId: insertedDosen[4].id, hari: 'Senin', jamMulai: '10:45:00', jamSelesai: '13:15:00', ruangan: 'Lab SI' },
      { mataKuliahId: mkMap.get('SI302')!.id, dosenId: insertedDosen[3].id, hari: 'Selasa', jamMulai: '13:00:00', jamSelesai: '15:30:00', ruangan: 'Lab Desain' },
      { mataKuliahId: mkMap.get('SI401')!.id, dosenId: insertedDosen[1].id, hari: 'Kamis', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-203' },

      // FEB - Akuntansi
      { mataKuliahId: mkMap.get('AK101')!.id, dosenId: insertedDosen[4].id, hari: 'Senin', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-FEB1' },
      { mataKuliahId: mkMap.get('AK201')!.id, dosenId: insertedDosen[3].id, hari: 'Selasa', jamMulai: '10:45:00', jamSelesai: '13:15:00', ruangan: 'R-FEB2' },
      { mataKuliahId: mkMap.get('AK301')!.id, dosenId: insertedDosen[0].id, hari: 'Rabu', jamMulai: '13:00:00', jamSelesai: '15:30:00', ruangan: 'R-FEB3' },
      { mataKuliahId: mkMap.get('AK401')!.id, dosenId: insertedDosen[1].id, hari: 'Kamis', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-FEB4' },
      { mataKuliahId: mkMap.get('AK501')!.id, dosenId: insertedDosen[2].id, hari: 'Senin', jamMulai: '13:00:00', jamSelesai: '15:30:00', ruangan: 'R-FEB5' },
      { mataKuliahId: mkMap.get('AK601')!.id, dosenId: insertedDosen[4].id, hari: 'Rabu', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-FEB6' },
      { mataKuliahId: mkMap.get('AK701')!.id, dosenId: insertedDosen[0].id, hari: 'Selasa', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-Auditorium' },
      { mataKuliahId: mkMap.get('AK702')!.id, dosenId: insertedDosen[1].id, hari: 'Kamis', jamMulai: '13:00:00', jamSelesai: '15:30:00', ruangan: 'R-FEB7' },

      // FK - Kedokteran
      { mataKuliahId: mkMap.get('KU101')!.id, dosenId: insertedDosen[1].id, hari: 'Senin', jamMulai: '08:00:00', jamSelesai: '11:20:00', ruangan: 'Lab FK1' },
      { mataKuliahId: mkMap.get('KU102')!.id, dosenId: insertedDosen[4].id, hari: 'Selasa', jamMulai: '08:00:00', jamSelesai: '11:20:00', ruangan: 'Lab Anatomi' },
      { mataKuliahId: mkMap.get('KU201')!.id, dosenId: insertedDosen[0].id, hari: 'Kamis', jamMulai: '08:00:00', jamSelesai: '11:20:00', ruangan: 'Lab Fisiologi' },
      { mataKuliahId: mkMap.get('KU202')!.id, dosenId: insertedDosen[3].id, hari: 'Jumat', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'Lab Biokimia' },
      { mataKuliahId: mkMap.get('KU301')!.id, dosenId: insertedDosen[1].id, hari: 'Rabu', jamMulai: '08:00:00', jamSelesai: '11:20:00', ruangan: 'Lab Farmako' },
      { mataKuliahId: mkMap.get('KU302')!.id, dosenId: insertedDosen[2].id, hari: 'Jumat', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-FK2' },
      { mataKuliahId: mkMap.get('KU401')!.id, dosenId: insertedDosen[0].id, hari: 'Senin', jamMulai: '13:00:00', jamSelesai: '16:20:00', ruangan: 'Lab Mikro' },

      // FH - Hukum
      { mataKuliahId: mkMap.get('HK101')!.id, dosenId: insertedDosen[2].id, hari: 'Senin', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-Hukum1' },
      { mataKuliahId: mkMap.get('HK102')!.id, dosenId: insertedDosen[4].id, hari: 'Rabu', jamMulai: '10:45:00', jamSelesai: '13:15:00', ruangan: 'R-Hukum2' },
      { mataKuliahId: mkMap.get('HK201')!.id, dosenId: insertedDosen[0].id, hari: 'Kamis', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-Hukum3' },
      { mataKuliahId: mkMap.get('HK202')!.id, dosenId: insertedDosen[1].id, hari: 'Jumat', jamMulai: '13:30:00', jamSelesai: '16:00:00', ruangan: 'R-Hukum4' },
      { mataKuliahId: mkMap.get('HK301')!.id, dosenId: insertedDosen[3].id, hari: 'Selasa', jamMulai: '08:00:00', jamSelesai: '10:30:00', ruangan: 'R-Hukum5' },
      { mataKuliahId: mkMap.get('HK401')!.id, dosenId: insertedDosen[2].id, hari: 'Kamis', jamMulai: '13:00:00', jamSelesai: '15:30:00', ruangan: 'R-Hukum6' },

      // MKU
      { mataKuliahId: mkMap.get('UM101')!.id, dosenId: insertedDosen[4].id, hari: 'Rabu', jamMulai: '13:30:00', jamSelesai: '15:10:00', ruangan: 'R-305' },
      { mataKuliahId: mkMap.get('UM102')!.id, dosenId: insertedDosen[3].id, hari: 'Kamis', jamMulai: '15:40:00', jamSelesai: '17:20:00', ruangan: 'R-306' },
      { mataKuliahId: mkMap.get('UM103')!.id, dosenId: insertedDosen[2].id, hari: 'Jumat', jamMulai: '10:00:00', jamSelesai: '11:40:00', ruangan: 'R-307' },
    ]);

    console.log('Seeded schedules.');

    // 5. Create KHS (Kartu Hasil Studi) history
    await db.insert(khs).values([
      // Farhan - Semester 1
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF101')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF102')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF103')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('UM101')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('UM102')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },

      // Farhan - Semester 2
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF201')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF202')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('UM103')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('SI201')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'A', bobot: 4.0 },

      // Farhan - Semester 3
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF301')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF302')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF303')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('SI301')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },

      // Farhan - Semester 4
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF401')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF402')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('SI401')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },

      // Larasati - Semester 1
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('SI101')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('UM101')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('UM102')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('UM103')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },

      // Larasati - Semester 2
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('SI201')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('IF201')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('IF202')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },

      // Rian - Semester 1
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK101')!.id, semesterAjaran: '2022/2023 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK102')!.id, semesterAjaran: '2022/2023 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('UM101')!.id, semesterAjaran: '2022/2023 Ganjil', nilaiHuruf: 'C', bobot: 2.0 },

      // Rian - Semester 2
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK201')!.id, semesterAjaran: '2022/2023 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('UM102')!.id, semesterAjaran: '2022/2023 Genap', nilaiHuruf: 'B', bobot: 3.0 },

      // Rian - Semester 3
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK301')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('UM103')!.id, semesterAjaran: '2023/2024 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },

      // Rian - Semester 4
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK401')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('SI401')!.id, semesterAjaran: '2023/2024 Genap', nilaiHuruf: 'C', bobot: 2.0 },

      // Rian - Semester 5
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK501')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('IF301')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },

      // Rian - Semester 6
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK601')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('IF601')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },

      // Nadia - Semester 1
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('KU101')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('KU102')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('UM101')!.id, semesterAjaran: '2024/2025 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },

      // Nadia - Semester 2
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('KU201')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('KU202')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('UM102')!.id, semesterAjaran: '2024/2025 Genap', nilaiHuruf: 'A', bobot: 4.0 },

      // Daffa - Semester 1
      { mahasiswaId: daffa.id, mataKuliahId: mkMap.get('HK101')!.id, semesterAjaran: '2025/2026 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: daffa.id, mataKuliahId: mkMap.get('HK102')!.id, semesterAjaran: '2025/2026 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
      { mahasiswaId: daffa.id, mataKuliahId: mkMap.get('UM101')!.id, semesterAjaran: '2025/2026 Ganjil', nilaiHuruf: 'A', bobot: 4.0 },
      { mahasiswaId: daffa.id, mataKuliahId: mkMap.get('UM102')!.id, semesterAjaran: '2025/2026 Ganjil', nilaiHuruf: 'B', bobot: 3.0 },
    ]);

    console.log('Seeded grade records (KHS).');

    // 6. Seed active KRS items for 2025/2026 Genap
    await db.insert(krsItem).values([
      // Farhan
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF501')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
      { mahasiswaId: farhan.id, mataKuliahId: mkMap.get('IF502')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },

      // Larasati
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('SI301')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
      { mahasiswaId: larasati.id, mataKuliahId: mkMap.get('SI302')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },

      // Rian
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK701')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
      { mahasiswaId: rian.id, mataKuliahId: mkMap.get('AK702')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },

      // Nadia
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('KU301')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
      { mahasiswaId: nadia.id, mataKuliahId: mkMap.get('KU302')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },

      // Daffa
      { mahasiswaId: daffa.id, mataKuliahId: mkMap.get('HK201')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
      { mahasiswaId: daffa.id, mataKuliahId: mkMap.get('HK202')!.id, semesterAjaran: '2025/2026 Genap', status: 'disetujui' },
    ]);

    console.log('Seeded active KRS items.');

    // 7. Seed announcements (Pengumuman)
    const announcements = await db.insert(pengumuman).values([
      {
        judul: 'Pendaftaran KRS Semester Genap 2025/2026',
        isi: 'Diberitahukan kepada seluruh mahasiswa Universitas YARSI bahwa pengisian KRS untuk Semester Genap 2025/2026 dibuka mulai tanggal 20 Juli hingga 30 Juli 2026. Harap melakukan konsultasi dengan Dosen Pembimbing Akademik masing-masing sebelum memilih mata kuliah untuk menghindari kesalahan kelas.',
        diterbitkanPada: new Date('2026-07-15T09:00:00Z'),
      },
      {
        judul: 'Pelaksanaan Ujian Tengah Semester (UTS)',
        isi: 'Jadwal UTS akan segera dirilis pada awal minggu depan. Pastikan Anda telah melunasi pembayaran uang kuliah semester genap dan mencetak kartu ujian di portal masing-masing. Mahasiswa tanpa kartu ujian fisik/digital tidak diizinkan mengikuti ujian.',
        diterbitkanPada: new Date('2026-07-10T14:30:00Z'),
      },
      {
        judul: 'Workshop Pembangunan Web Modern dengan TanStack',
        isi: 'Fakultas Teknologi Informasi bekerjasama dengan komunitas developer menyelenggarakan Workshop Hands-on TanStack Start dan Supabase pada hari Sabtu, 25 Juli 2026. Acara bertempat di Lab Komputasi pukul 09:00 - 15:00 WIB. Kuota terbatas 40 peserta, segera daftar melalui tautan registrasi di grup prodi.',
        diterbitkanPada: new Date('2026-07-08T10:00:00Z'),
      },
      {
        judul: 'Maintenance Portal SIAKAD Kampus',
        isi: 'Akan dilakukan pemeliharaan sistem SIAKAD pada hari Minggu, 19 Juli 2026 pukul 01:00 hingga 05:00 WIB. Selama durasi tersebut, portal tidak dapat diakses sementara. Mohon maaf atas ketidaknyamanan ini.',
        diterbitkanPada: new Date('2026-07-17T17:00:00Z'),
      }
    ]).returning();

    console.log(`Seeded ${announcements.length} announcements.`);

    // 8. Mark some announcements as read for Farhan
    await db.insert(pengumumanDibaca).values([
      { mahasiswaId: farhan.id, pengumumanId: announcements[1].id, dibacaPada: new Date() },
      { mahasiswaId: farhan.id, pengumumanId: announcements[3].id, dibacaPada: new Date() },
    ]);

    console.log('Seeded announcement read flags.');
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed().catch(console.error).finally(() => process.exit(0));
