import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { dbMiddleware } from '../../db/middleware'
import { mahasiswa, krsItem, jadwal, mataKuliah, dosen, pengumuman, pengumumanDibaca, khs } from '../../db/schema'
import { eq, and, desc, inArray, or, isNull } from 'drizzle-orm'
import { getSession } from '../../lib/auth'

// Helper to check auth and get student ID
async function requireAuth() {
  const session = getSession()
  if (!session) {
    throw new Error('Unauthorized. Silakan login terlebih dahulu.')
  }
  return session
}

// Helper to get Indonesian day name
function getTodayIndo() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[new Date().getDay()]
}

// 1. Dashboard Data Function
export const getDashboardData = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id
    const todayIndo = getTodayIndo()

    // Fetch student info
    const studentInfo = await db.query.mahasiswa.findFirst({
      where: eq(mahasiswa.id, studentId)
    })

    if (!studentInfo) {
      throw new Error('Data mahasiswa tidak ditemukan')
    }

    // Fetch today's schedule
    const todaySchedule = await db
      .select({
        id: jadwal.id,
        hari: jadwal.hari,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        ruangan: jadwal.ruangan,
        kodeMk: mataKuliah.kodeMk,
        namaMk: mataKuliah.namaMk,
        sks: mataKuliah.sks,
        namaDosen: dosen.nama,
      })
      .from(krsItem)
      .innerJoin(mataKuliah, eq(krsItem.mataKuliahId, mataKuliah.id))
      .innerJoin(jadwal, eq(jadwal.mataKuliahId, mataKuliah.id))
      .innerJoin(dosen, eq(jadwal.dosenId, dosen.id))
      .where(
        and(
          eq(krsItem.mahasiswaId, studentId),
          eq(krsItem.semesterAjaran, '2025/2026 Genap'),
          eq(jadwal.hari, todayIndo)
        )
      )

    // Fetch latest 3 announcements
    const latestAnnouncements = await db
      .select({
        id: pengumuman.id,
        judul: pengumuman.judul,
        isi: pengumuman.isi,
        diterbitkanPada: pengumuman.diterbitkanPada,
      })
      .from(pengumuman)
      .orderBy(desc(pengumuman.diterbitkanPada))
      .limit(3)

    // Check which ones are read
    const readList = await db
      .select({
        pengumumanId: pengumumanDibaca.pengumumanId
      })
      .from(pengumumanDibaca)
      .where(eq(pengumumanDibaca.mahasiswaId, studentId))

    const readIds = new Set(readList.map(r => r.pengumumanId))

    const announcements = latestAnnouncements.map(ann => ({
      ...ann,
      read: readIds.has(ann.id)
    }))

    // Fetch IPS trend for mini chart on dashboard
    const allKhsForTrend = await db
      .select({
        semesterAjaran: khs.semesterAjaran,
        bobot: khs.bobot,
        sks: mataKuliah.sks,
      })
      .from(khs)
      .innerJoin(mataKuliah, eq(khs.mataKuliahId, mataKuliah.id))
      .where(eq(khs.mahasiswaId, studentId))

    // Compute IPS per semester
    const semMap = new Map<string, { totalQP: number; totalSks: number }>()
    for (const r of allKhsForTrend) {
      if (!semMap.has(r.semesterAjaran)) {
        semMap.set(r.semesterAjaran, { totalQP: 0, totalSks: 0 })
      }
      const s = semMap.get(r.semesterAjaran)!
      s.totalQP += r.bobot * r.sks
      s.totalSks += r.sks
    }

    const semOrder = (semName: string) => {
      const parts = semName.split(' ')
      const years = parts[0].split('/')
      const semType = parts[1] === 'Ganjil' ? 1 : 2
      return parseInt(years[0], 10) * 10 + semType
    }

    const ipsTrend = Array.from(semMap.entries())
      .map(([semesterAjaran, { totalQP, totalSks }]) => ({
        semesterAjaran,
        ips: totalSks > 0 ? parseFloat((totalQP / totalSks).toFixed(2)) : 0,
        totalSks,
      }))
      .sort((a, b) => semOrder(a.semesterAjaran) - semOrder(b.semesterAjaran))

    return {
      student: studentInfo,
      todaySchedule,
      announcements,
      todayDayName: todayIndo,
      ipsTrend,
    }
  })

// 2. Weekly Schedule Function
export interface ExamScheduleItem {
  id: string
  kodeMk: string
  namaMk: string
  sks: number
  namaDosen: string
  tanggal: string
  jamMulai: string
  jamSelesai: string
  ruangan: string
  nomorKursi: string
  sifatUjian: 'Tutup Buku' | 'Buka Buku' | 'Praktikum' | 'Take Home'
  status: 'selesai' | 'hari_ini' | 'mendatang'
  pengawas: string
  catatan?: string
}

export interface AcademicMilestone {
  id: string
  judul: string
  kategori: 'perkuliahan' | 'edom' | 'ujian' | 'administrasi'
  tanggalMulai: string
  tanggalSelesai: string
  rentangTanggal: string
  deskripsi: string
  status: 'selesai' | 'berlangsung' | 'mendatang'
  urgensi?: 'normal' | 'penting' | 'kritis'
  catatan?: string
}

// 2. Weekly Schedule & Exam Schedule Function
export const getJadwalData = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id

    const weeklySchedule = await db
      .select({
        id: jadwal.id,
        hari: jadwal.hari,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        ruangan: jadwal.ruangan,
        kodeMk: mataKuliah.kodeMk,
        namaMk: mataKuliah.namaMk,
        sks: mataKuliah.sks,
        namaDosen: dosen.nama,
      })
      .from(krsItem)
      .innerJoin(mataKuliah, eq(krsItem.mataKuliahId, mataKuliah.id))
      .innerJoin(jadwal, eq(jadwal.mataKuliahId, mataKuliah.id))
      .innerJoin(dosen, eq(jadwal.dosenId, dosen.id))
      .where(
        and(
          eq(krsItem.mahasiswaId, studentId),
          eq(krsItem.semesterAjaran, '2025/2026 Genap')
        )
      )

    // Generate UTS Schedule derived from student's active courses
    const utsDates = [
      { hari: 'Senin', tgl: '13 April 2026', time: '08:00', endTime: '09:40' },
      { hari: 'Selasa', tgl: '14 April 2026', time: '10:00', endTime: '11:40' },
      { hari: 'Rabu', tgl: '15 April 2026', time: '13:00', endTime: '14:40' },
      { hari: 'Kamis', tgl: '16 April 2026', time: '08:00', endTime: '09:40' },
      { hari: 'Jumat', tgl: '17 April 2026', time: '09:00', endTime: '10:40' },
    ]

    const sifatList: ('Tutup Buku' | 'Buka Buku' | 'Praktikum' | 'Take Home')[] = [
      'Tutup Buku',
      'Buka Buku',
      'Praktikum',
      'Take Home'
    ]

    const utsSchedule: ExamScheduleItem[] = weeklySchedule.map((item, index) => {
      const dateInfo = utsDates[index % utsDates.length]
      const sifat = item.namaMk.toLowerCase().includes('praktikum') || item.namaMk.toLowerCase().includes('lab')
        ? 'Praktikum'
        : sifatList[index % sifatList.length]
      
      const seatNum = `${String.fromCharCode(65 + (index % 4))}-${String(12 + index * 3).padStart(2, '0')}`

      return {
        id: `uts-${item.id}`,
        kodeMk: item.kodeMk,
        namaMk: item.namaMk,
        sks: item.sks,
        namaDosen: item.namaDosen,
        tanggal: `${dateInfo.hari}, ${dateInfo.tgl}`,
        jamMulai: dateInfo.time,
        jamSelesai: dateInfo.endTime,
        ruangan: item.ruangan,
        nomorKursi: seatNum,
        sifatUjian: sifat,
        status: 'selesai' as const,
        pengawas: `${item.namaDosen} & Tim Pengawas FST`,
        catatan: sifat === 'Praktikum' ? 'Bawa Laptop / Flashdisk' : 'Hadir 15 menit sebelum ujian'
      }
    })

    // Generate UAS Schedule derived from student's active courses
    const uasDates = [
      { hari: 'Senin', tgl: '22 Juni 2026', time: '08:00', endTime: '10:00' },
      { hari: 'Selasa', tgl: '23 Juni 2026', time: '10:15', endTime: '12:15' },
      { hari: 'Rabu', tgl: '24 Juni 2026', time: '13:00', endTime: '15:00' },
      { hari: 'Kamis', tgl: '25 Juni 2026', time: '08:00', endTime: '10:00' },
      { hari: 'Jumat', tgl: '26 Juni 2026', time: '09:00', endTime: '11:00' },
    ]

    const uasSchedule: ExamScheduleItem[] = weeklySchedule.map((item, index) => {
      const dateInfo = uasDates[index % uasDates.length]
      const sifat = item.namaMk.toLowerCase().includes('praktikum') || item.namaMk.toLowerCase().includes('lab')
        ? 'Praktikum'
        : sifatList[(index + 1) % sifatList.length]
      
      const seatNum = `${String.fromCharCode(65 + ((index + 1) % 4))}-${String(15 + index * 2).padStart(2, '0')}`

      return {
        id: `uas-${item.id}`,
        kodeMk: item.kodeMk,
        namaMk: item.namaMk,
        sks: item.sks,
        namaDosen: item.namaDosen,
        tanggal: `${dateInfo.hari}, ${dateInfo.tgl}`,
        jamMulai: dateInfo.time,
        jamSelesai: dateInfo.endTime,
        ruangan: item.ruangan,
        nomorKursi: seatNum,
        sifatUjian: sifat,
        status: (index === 0 ? 'hari_ini' : 'mendatang') as 'hari_ini' | 'mendatang',
        pengawas: `${item.namaDosen} & Pengawas Ruang`,
        catatan: 'Wajib membawa Kartu Peserta Ujian fisik / digital'
      }
    })

    // Comprehensive Academic Calendar Milestones
    const kalenderAkademik: AcademicMilestone[] = [
      {
        id: 'cal-1',
        judul: 'Perkuliahan Pra UTS',
        kategori: 'perkuliahan',
        tanggalMulai: '2026-02-23',
        tanggalSelesai: '2026-04-10',
        rentangTanggal: '23 Feb – 10 Apr 2026',
        deskripsi: 'Masa tatap muka perkuliahan babak pertama (Pertemuan 1 s.d. 7).',
        status: 'selesai',
        urgensi: 'normal'
      },
      {
        id: 'cal-2',
        judul: 'EDoM Pra UTS',
        kategori: 'edom',
        tanggalMulai: '2026-03-30',
        tanggalSelesai: '2026-04-10',
        rentangTanggal: '30 Mar – 10 Apr 2026',
        deskripsi: 'Pengisian Evaluasi Dosen oleh Mahasiswa periode awal sebagai syarat cetak Kartu UTS.',
        status: 'selesai',
        urgensi: 'penting'
      },
      {
        id: 'cal-3',
        judul: 'Ujian Tengah Semester (UTS)',
        kategori: 'ujian',
        tanggalMulai: '2026-04-13',
        tanggalSelesai: '2026-04-17',
        rentangTanggal: '13 Apr – 17 Apr 2026',
        deskripsi: 'Pelaksanaan ujian tengah semester untuk seluruh mata kuliah aktif.',
        status: 'selesai',
        urgensi: 'kritis'
      },
      {
        id: 'cal-4',
        judul: 'Perkuliahan Pasca UTS',
        kategori: 'perkuliahan',
        tanggalMulai: '2026-04-20',
        tanggalSelesai: '2026-06-12',
        rentangTanggal: '20 Apr – 12 Jun 2026',
        deskripsi: 'Masa tatap muka perkuliahan babak kedua (Pertemuan 8 s.d. 14).',
        status: 'berlangsung',
        urgensi: 'normal',
        catatan: 'Minggu ke-12 perkuliahan aktif'
      },
      {
        id: 'cal-5',
        judul: 'EDoM Pra UAS',
        kategori: 'edom',
        tanggalMulai: '2026-06-01',
        tanggalSelesai: '2026-06-19',
        rentangTanggal: '01 Jun – 19 Jun 2026',
        deskripsi: 'Pengisian Evaluasi Dosen oleh Mahasiswa periode akhir sebagai syarat cetak Kartu UAS.',
        status: 'berlangsung',
        urgensi: 'penting',
        catatan: 'Batas akhir pengisian 19 Juni'
      },
      {
        id: 'cal-6',
        judul: 'Ujian Akhir Semester (UAS)',
        kategori: 'ujian',
        tanggalMulai: '2026-06-22',
        tanggalSelesai: '2026-06-26',
        rentangTanggal: '22 Jun – 26 Jun 2026',
        deskripsi: 'Pelaksanaan ujian akhir semester evaluasi capaian pembelajaran.',
        status: 'mendatang',
        urgensi: 'kritis'
      },
      {
        id: 'cal-7',
        judul: 'Ujian Perbaikan (Remedial)',
        kategori: 'ujian',
        tanggalMulai: '2026-06-29',
        tanggalSelesai: '2026-07-03',
        rentangTanggal: '29 Jun – 03 Jul 2026',
        deskripsi: 'Periode ujian susulan dan perbaikan bagi mahasiswa yang terdaftar.',
        status: 'mendatang',
        urgensi: 'penting'
      },
      {
        id: 'cal-8',
        judul: 'Pengisian Nilai oleh KPS',
        kategori: 'administrasi',
        tanggalMulai: '2026-07-06',
        tanggalSelesai: '2026-07-10',
        rentangTanggal: '06 Jul – 10 Jul 2026',
        deskripsi: 'Finalisasi & verifikasi entri nilai semester oleh Ketua Program Studi & Dosen.',
        status: 'mendatang',
        urgensi: 'normal'
      },
      {
        id: 'cal-9',
        judul: 'Pengumuman KHS',
        kategori: 'administrasi',
        tanggalMulai: '2026-07-13',
        tanggalSelesai: '2026-07-13',
        rentangTanggal: '13 Juli 2026',
        deskripsi: 'Penerbitan resmi Kartu Hasil Studi (KHS) Semester Genap 2025/2026.',
        status: 'mendatang',
        urgensi: 'kritis'
      }
    ]

    return {
      schedule: weeklySchedule,
      utsSchedule,
      uasSchedule,
      kalenderAkademik,
      examPeriodInfo: {
        utsPeriod: '13 - 17 April 2026',
        uasPeriod: '22 - 26 Juni 2026',
        isExamCardReady: true,
        attendancePercentage: 94,
        paymentStatus: 'Lunas'
      }
    }
  })

// 3. KRS Data Function
export const getKrsData = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id

    // Fetch student info (to get IPK and SKS limit)
    const studentInfo = await db.query.mahasiswa.findFirst({
      where: eq(mahasiswa.id, studentId)
    })

    if (!studentInfo) {
      throw new Error('Data mahasiswa tidak ditemukan')
    }

    // Get all available courses with their schedules and lecturers
    const allAvailable = await db
      .select({
        courseId: mataKuliah.id,
        kodeMk: mataKuliah.kodeMk,
        namaMk: mataKuliah.namaMk,
        sks: mataKuliah.sks,
        semester: mataKuliah.semester,
        jadwalId: jadwal.id,
        hari: jadwal.hari,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        ruangan: jadwal.ruangan,
        namaDosen: dosen.nama,
      })
      .from(mataKuliah)
      .innerJoin(jadwal, eq(jadwal.mataKuliahId, mataKuliah.id))
      .innerJoin(dosen, eq(jadwal.dosenId, dosen.id))

    // Group schedules by course
    const courseMap = new Map<string, any>()
    for (const item of allAvailable) {
      if (!courseMap.has(item.courseId)) {
        courseMap.set(item.courseId, {
          id: item.courseId,
          kodeMk: item.kodeMk,
          namaMk: item.namaMk,
          sks: item.sks,
          semester: item.semester,
          schedules: []
        })
      }
      courseMap.get(item.courseId).schedules.push({
        id: item.jadwalId,
        hari: item.hari,
        jamMulai: item.jamMulai,
        jamSelesai: item.jamSelesai,
        ruangan: item.ruangan,
        namaDosen: item.namaDosen
      })
    }

    const availableCourses = Array.from(courseMap.values())

    // Fetch currently registered KRS items
    const registeredKrsItems = await db
      .select({
        courseId: krsItem.mataKuliahId,
        status: krsItem.status
      })
      .from(krsItem)
      .where(
        and(
          eq(krsItem.mahasiswaId, studentId),
          eq(krsItem.semesterAjaran, '2025/2026 Genap')
        )
      )

    return {
      student: studentInfo,
      availableCourses,
      registeredKrs: registeredKrsItems
    }
  })

// Helper function to check if two time ranges overlap
function checkOverlap(
  day1: string, start1: string, end1: string,
  day2: string, start2: string, end2: string
) {
  if (day1 !== day2) return false
  
  // Convert "HH:MM:SS" or "HH:MM" to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const parts = timeStr.split(':')
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
  }

  const s1 = toMinutes(start1)
  const e1 = toMinutes(end1)
  const s2 = toMinutes(start2)
  const e2 = toMinutes(end2)

  // Ranges overlap if start1 < end2 and start2 < end1
  return s1 < e2 && s2 < e1
}

// 4. Submit KRS Function
const submitKrsSchema = z.object({
  courseIds: z.array(z.string())
})

export const submitKrs = createServerFn({ method: 'POST' })
  .middleware([dbMiddleware])
  .validator((data: unknown) => submitKrsSchema.parse(data))
  .handler(async ({ data, context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id
    const { courseIds } = data

    // 1. Fetch student to check SKS limit
    const studentInfo = await db.query.mahasiswa.findFirst({
      where: eq(mahasiswa.id, studentId)
    })

    if (!studentInfo) {
      throw new Error('Data mahasiswa tidak ditemukan')
    }

    // Determine SKS limit
    let maxSks = 18
    if (studentInfo.ipk >= 3.00) maxSks = 24
    else if (studentInfo.ipk >= 2.50) maxSks = 21

    if (courseIds.length === 0) {
      // If choosing to clear all KRS, just delete and return
      await db.delete(krsItem).where(
        and(
          eq(krsItem.mahasiswaId, studentId),
          eq(krsItem.semesterAjaran, '2025/2026 Genap')
        )
      )
      return { success: true, message: 'KRS berhasil dikosongkan' }
    }

    // 2. Fetch selected courses & schedules
    const selectedCoursesAndSchedules = await db
      .select({
        courseId: mataKuliah.id,
        kodeMk: mataKuliah.kodeMk,
        namaMk: mataKuliah.namaMk,
        sks: mataKuliah.sks,
        hari: jadwal.hari,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
      })
      .from(mataKuliah)
      .innerJoin(jadwal, eq(jadwal.mataKuliahId, mataKuliah.id))
      .where(inArray(mataKuliah.id, courseIds))

    if (selectedCoursesAndSchedules.length === 0) {
      throw new Error('Mata kuliah yang dipilih tidak valid')
    }

    // Sum unique course credits (since a course could have multiple schedules, group by courseId)
    const uniqueCourses = new Map<string, { namaMk: string; sks: number }>()
    for (const item of selectedCoursesAndSchedules) {
      uniqueCourses.set(item.courseId, { namaMk: item.namaMk, sks: item.sks })
    }

    let totalSks = 0
    uniqueCourses.forEach(c => {
      totalSks += c.sks
    })

    if (totalSks > maxSks) {
      throw new Error(`Total SKS (${totalSks} SKS) melebihi batas maksimal Anda (${maxSks} SKS).`)
    }

    // 3. Check for schedule conflicts
    // We compare every schedule slot with every other schedule slot
    for (let i = 0; i < selectedCoursesAndSchedules.length; i++) {
      for (let j = i + 1; j < selectedCoursesAndSchedules.length; j++) {
        const c1 = selectedCoursesAndSchedules[i]
        const c2 = selectedCoursesAndSchedules[j]

        // Skip comparing schedules of the same course (some courses could have multiple sessions, but usually they are distinct)
        if (c1.courseId === c2.courseId) continue

        if (checkOverlap(c1.hari, c1.jamMulai, c1.jamSelesai, c2.hari, c2.jamMulai, c2.jamSelesai)) {
          throw new Error(
            `Jadwal bentrok pada hari ${c1.hari} antara:\n` +
            `- ${c1.namaMk} (${c1.jamMulai.substring(0, 5)} - ${c1.jamSelesai.substring(0, 5)})\n` +
            `- ${c2.namaMk} (${c2.jamMulai.substring(0, 5)} - ${c2.jamSelesai.substring(0, 5)})`
          )
        }
      }
    }

    // 4. Save KRS
    // Delete old KRS items for the current semester
    await db.delete(krsItem).where(
      and(
        eq(krsItem.mahasiswaId, studentId),
        eq(krsItem.semesterAjaran, '2025/2026 Genap')
      )
    )

    // Insert new KRS items
    const krsValues = Array.from(uniqueCourses.keys()).map(id => ({
      mahasiswaId: studentId,
      mataKuliahId: id,
      semesterAjaran: '2025/2026 Genap',
      status: 'disetujui'
    }))

    await db.insert(krsItem).values(krsValues)

    return {
      success: true,
      message: 'KRS berhasil disimpan'
    }
  })

// 5. KHS and Transcript Data Function
export const getKhsData = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id

    // Fetch all KHS records
    const allKhs = await db
      .select({
        id: khs.id,
        semesterAjaran: khs.semesterAjaran,
        nilaiHuruf: khs.nilaiHuruf,
        bobot: khs.bobot,
        kodeMk: mataKuliah.kodeMk,
        namaMk: mataKuliah.namaMk,
        sks: mataKuliah.sks,
        semester: mataKuliah.semester,
      })
      .from(khs)
      .innerJoin(mataKuliah, eq(khs.mataKuliahId, mataKuliah.id))
      .where(eq(khs.mahasiswaId, studentId))

    // Group grades by semester
    const semestersMap = new Map<string, any[]>()
    for (const record of allKhs) {
      if (!semestersMap.has(record.semesterAjaran)) {
        semestersMap.set(record.semesterAjaran, [])
      }
      semestersMap.get(record.semesterAjaran)!.push(record)
    }

    // Calculate details for each semester
    const khsBySemester = Array.from(semestersMap.entries()).map(([sem, records]) => {
      let totalSks = 0
      let totalQualityPoints = 0
      
      for (const r of records) {
        totalSks += r.sks
        totalQualityPoints += r.bobot * r.sks
      }

      const ips = totalSks > 0 ? (totalQualityPoints / totalSks) : 0

      return {
        semesterAjaran: sem,
        courses: records,
        totalSks,
        ips: parseFloat(ips.toFixed(2))
      }
    })

    // Sort semesters: let's sort them chronological (e.g. 2023/2024 Ganjil, then Genap, etc.)
    const semOrder = (semName: string) => {
      const parts = semName.split(' ')
      const years = parts[0].split('/')
      const semType = parts[1] === 'Ganjil' ? 1 : 2
      return parseInt(years[0], 10) * 10 + semType
    }

    khsBySemester.sort((a, b) => semOrder(a.semesterAjaran) - semOrder(b.semesterAjaran))

    // Calculate cumulative statistics
    let totalSksLulus = 0
    let totalQualityPoints = 0

    for (const record of allKhs) {
      // Only count passed courses (e.g. D or above, bobot > 0)
      if (record.bobot > 0) {
        totalSksLulus += record.sks
      }
      totalQualityPoints += record.bobot * record.sks
    }

    const ipk = totalSksLulus > 0 ? (totalQualityPoints / totalSksLulus) : 0

    return {
      khsBySemester,
      cumulativeStats: {
        totalSksLulus,
        ipk: parseFloat(ipk.toFixed(2))
      }
    }
  })

// 6. Announcements Feed Function
export const getPengumumanData = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id

    // Fetch all announcements
    const list = await db
      .select({
        id: pengumuman.id,
        judul: pengumuman.judul,
        isi: pengumuman.isi,
        diterbitkanPada: pengumuman.diterbitkanPada,
      })
      .from(pengumuman)
      .orderBy(desc(pengumuman.diterbitkanPada))

    // Fetch read list
    const readList = await db
      .select({
        pengumumanId: pengumumanDibaca.pengumumanId
      })
      .from(pengumumanDibaca)
      .where(eq(pengumumanDibaca.mahasiswaId, studentId))

    const readIds = new Set(readList.map(r => r.pengumumanId))

    const data = list.map(ann => ({
      ...ann,
      read: readIds.has(ann.id)
    }))

    return {
      announcements: data
    }
  })

// 7. Mark Announcement Read Function
const markReadSchema = z.object({
  pengumumanId: z.string()
})

export const markPengumumanRead = createServerFn({ method: 'POST' })
  .middleware([dbMiddleware])
  .validator((data: unknown) => markReadSchema.parse(data))
  .handler(async ({ data, context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id
    const { pengumumanId } = data

    // Check if already read
    const existing = await db.query.pengumumanDibaca.findFirst({
      where: and(
        eq(pengumumanDibaca.mahasiswaId, studentId),
        eq(pengumumanDibaca.pengumumanId, pengumumanId)
      )
    })

    if (!existing) {
      await db.insert(pengumumanDibaca).values({
        mahasiswaId: studentId,
        pengumumanId: pengumumanId,
        dibacaPada: new Date()
      })
    }

    return { success: true }
  })

// 8. Get Student Profile Data Function
export const getProfileData = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id

    const studentInfo = await db.query.mahasiswa.findFirst({
      where: eq(mahasiswa.id, studentId)
    })

    if (!studentInfo) {
      throw new Error('Data mahasiswa tidak ditemukan')
    }

    return {
      student: studentInfo
    }
  })

// 9. Get Mata Kuliah (Curriculum) Data Function
export const getMataKuliahData = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const db = context.db
    const session = await requireAuth()
    const studentId = session.id

    const studentInfo = await db.query.mahasiswa.findFirst({
      where: eq(mahasiswa.id, studentId)
    })

    if (!studentInfo) {
      throw new Error('Data mahasiswa tidak ditemukan')
    }

    const studentJurusan = studentInfo.jurusan || 'Teknik Informatika'

    // Fetch courses matching student's major OR general courses (jurusan is null)
    const coursesList = await db
      .select({
        id: mataKuliah.id,
        kodeMk: mataKuliah.kodeMk,
        namaMk: mataKuliah.namaMk,
        sks: mataKuliah.sks,
        semester: mataKuliah.semester,
        jurusan: mataKuliah.jurusan,
        isWajib: mataKuliah.isWajib,
      })
      .from(mataKuliah)
      .where(
        or(
          eq(mataKuliah.jurusan, studentJurusan),
          isNull(mataKuliah.jurusan)
        )
      )

    // Calculate summary statistics
    const totalMatkul = coursesList.length
    let totalSksKurikulum = 0
    let totalSksWajib = 0
    let totalSksPilihan = 0
    let countWajib = 0
    let countPilihan = 0

    // Group by semester
    const semMap = new Map<number, typeof coursesList>()
    for (let s = 1; s <= 8; s++) {
      semMap.set(s, [])
    }

    for (const item of coursesList) {
      totalSksKurikulum += item.sks
      if (item.isWajib) {
        totalSksWajib += item.sks
        countWajib++
      } else {
        totalSksPilihan += item.sks
        countPilihan++
      }

      const list = semMap.get(item.semester) || []
      list.push(item)
      semMap.set(item.semester, list)
    }

    // Sort items inside each semester by kodeMk
    const coursesBySemester = Array.from(semMap.entries())
      .map(([semester, courses]) => {
        courses.sort((a, b) => a.kodeMk.localeCompare(b.kodeMk))
        const totalSksSem = courses.reduce((acc, c) => acc + c.sks, 0)
        return {
          semester,
          courses,
          totalSks: totalSksSem,
          wajibCount: courses.filter(c => c.isWajib).length,
          pilihanCount: courses.filter(c => !c.isWajib).length,
        }
      })
      .filter(sem => sem.courses.length > 0)

    return {
      student: studentInfo,
      jurusan: studentJurusan,
      stats: {
        totalMatkul,
        totalSksKurikulum,
        totalSksWajib,
        totalSksPilihan,
        countWajib,
        countPilihan,
      },
      coursesBySemester,
      allCourses: coursesList,
    }
  })

