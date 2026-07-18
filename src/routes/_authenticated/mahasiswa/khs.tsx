import { createFileRoute } from '@tanstack/react-router'
import { getKhsData } from '../../../server/functions/academicFn'
import { useState, useMemo, useEffect } from 'react'
import { 
  Award, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  TrendingUp,
  Activity,
  User,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Info,
  Clock
} from 'lucide-react'
import { IpsChart } from '../../../components/charts/IpsChart'
import { GraduationRadialChart } from '../../../components/charts/GraduationRadialChart'

export const Route = createFileRoute('/_authenticated/mahasiswa/khs')({
  loader: async () => {
    return await getKhsData()
  },
  component: KhsPage,
})

const SKS_GRADUATION_TARGET = 144

// Grade badge styling based on letter grades
function GradeBadge({ grade }: { grade: string }) {
  let styleClasses = ""
  if (grade.startsWith('A')) {
    styleClasses = "bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-600/10"
  } else if (grade.startsWith('B')) {
    styleClasses = "bg-sky-600 text-white border-sky-700 shadow-sm shadow-sky-600/10"
  } else if (grade.startsWith('C')) {
    styleClasses = "bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/10"
  } else if (grade.startsWith('D')) {
    styleClasses = "bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/10"
  } else {
    styleClasses = "bg-rose-600 text-white border-rose-700 shadow-sm shadow-rose-600/10"
  }

  return (
    <span className={`inline-flex items-center justify-center min-w-[38px] h-7 px-2.5 rounded-lg text-xs font-black border tracking-wider font-mono shadow-sm ${styleClasses}`}>
      {grade}
    </span>
  )
}

interface GradeComponent {
  name: string
  weight: number
  score: number
}

interface GradeBreakdown {
  components: GradeComponent[]
  finalNumeric: number
  lecturerName: string
  comment: string
}

// Generate deterministic breakdown of grades based on course ID to ensure realistic details
const getGradeBreakdown = (courseId: string, grade: string): GradeBreakdown => {
  let seed = 0
  for (let i = 0; i < courseId.length; i++) {
    seed = courseId.charCodeAt(i) + ((seed << 5) - seed)
  }
  const pseudoRandom = (min: number, max: number, offset = 0) => {
    const value = Math.abs(Math.sin(seed + offset))
    return Math.floor(value * (max - min + 1)) + min
  }

  let minScore = 0
  let maxScore = 0
  let baseLecturerComments: string[] = []

  const letter = grade.trim().toUpperCase()
  if (letter.startsWith('A')) {
    minScore = 86
    maxScore = 98
    baseLecturerComments = [
      'Menunjukkan pemahaman konsep yang luar biasa dan sangat aktif berdiskusi di kelas.',
      'Sangat terampil dalam praktikum laboratorium dan ujian tulis. Kerja bagus!',
      'Hasil proyek akhir sangat inovatif dan memuaskan. Pertahankan prestasimu!',
      'Kemampuan analisis yang tajam, kritis, dan konsisten sepanjang perkuliahan.'
    ]
  } else if (letter.startsWith('B')) {
    minScore = 72
    maxScore = 85
    baseLecturerComments = [
      'Pemahaman konsep materi sudah baik. Tingkatkan lagi ketelitian saat UTS/UAS.',
      'Partisipasi aktif dalam kelompok kerja, pengerjaan laporan tugas cukup rapi.',
      'Proyek akhir selesai dengan baik, namun perlu analisis mendalam di bab evaluasi.',
      'Secara keseluruhan performa belajar bagus dan mandiri dalam pengerjaan tugas.'
    ]
  } else if (letter.startsWith('C')) {
    minScore = 56
    maxScore = 71
    baseLecturerComments = [
      'Cukup memahami konsep dasar materi. Usahakan lebih aktif bertanya di kelas.',
      'Tugas dikumpulkan tepat waktu tetapi penulisan kode/analisis perlu ditingkatkan.',
      'Kurangi absen kelas dan luangkan waktu lebih untuk latihan mandiri.',
      'Performa kuis kurang maksimal, fokus pada materi dasar mata kuliah ini.'
    ]
  } else if (letter.startsWith('D')) {
    minScore = 41
    maxScore = 55
    baseLecturerComments = [
      'Pemahaman materi sangat minim. Hubungi asisten atau dosen untuk bimbingan.',
      'Hasil ujian di bawah rata-rata kelas. Ubah cara belajar Anda di semester depan.',
      'Banyak tugas mandiri tidak diselesaikan. Perlu komitmen akademis lebih serius.',
      'Perlu perbaikan mendasar dalam persiapan ujian akhir.'
    ]
  } else {
    minScore = 10
    maxScore = 40
    baseLecturerComments = [
      'Tidak lulus kompetensi minimum. Silakan mengulang kelas ini di semester depan.',
      'Kehadiran tidak memenuhi kuota minimal, silakan konsultasi ke program studi.',
      'Tidak mengumpulkan tugas utama dan gagal dalam ujian tertulis.',
      'Wajib mengikuti perkuliahan remedial atau mengulang penuh semester depan.'
    ]
  }

  // Generate component scores (Attendance 10%, Homework 20%, Quiz 15%, UTS 25%, UAS 30%)
  const presence = letter.startsWith('A')
    ? pseudoRandom(95, 100, 1)
    : letter.startsWith('B')
    ? pseudoRandom(85, 95, 1)
    : letter.startsWith('C')
    ? pseudoRandom(75, 85, 1)
    : pseudoRandom(45, 75, 1)

  const quiz = letter.startsWith('A')
    ? pseudoRandom(85, 98, 2)
    : letter.startsWith('B')
    ? pseudoRandom(70, 85, 2)
    : letter.startsWith('C')
    ? pseudoRandom(55, 70, 2)
    : pseudoRandom(30, 55, 2)

  const homework = letter.startsWith('A')
    ? pseudoRandom(88, 98, 3)
    : letter.startsWith('B')
    ? pseudoRandom(74, 88, 3)
    : letter.startsWith('C')
    ? pseudoRandom(58, 74, 3)
    : pseudoRandom(35, 58, 3)

  const uts = letter.startsWith('A')
    ? pseudoRandom(82, 98, 4)
    : letter.startsWith('B')
    ? pseudoRandom(68, 84, 4)
    : letter.startsWith('C')
    ? pseudoRandom(52, 68, 4)
    : pseudoRandom(25, 52, 4)

  const currentSum = presence * 0.10 + homework * 0.20 + quiz * 0.15 + uts * 0.25
  const targetFinalScore = pseudoRandom(minScore, maxScore, 5)
  
  let uas = Math.round((targetFinalScore - currentSum) / 0.30)
  if (uas > 100) uas = 100
  if (uas < 0) uas = 0

  const finalNumeric = presence * 0.10 + homework * 0.20 + quiz * 0.15 + uts * 0.25 + uas * 0.30

  const components = [
    { name: 'Kehadiran Kuliah', weight: 10, score: presence },
    { name: 'Tugas & Tugas Kelompok', weight: 20, score: homework },
    { name: 'Kuis & Praktikum Mandiri', weight: 15, score: quiz },
    { name: 'Ujian Tengah Semester (UTS)', weight: 25, score: uts },
    { name: 'Ujian Akhir Semester (UAS)', weight: 30, score: uas },
  ]

  const lecturers = [
    'Dr. Eng. Rinaldi Munir, M.T.',
    'Prof. Dr. Ir. Suhono Harso Supangkat, M.Eng.',
    'Ayu Purwarianti, S.T., M.T., Ph.D.',
    'Yudistira Dwi Wardhana Asnar, S.T., Ph.D.',
    'Dr. Fazat Nur Azizah, S.T., M.Sc.',
    'Dr. Ir. Gusti Ayu Putri Saptawati, M.Comm.',
    'Dwi Hendranuryanto, S.T., M.T.'
  ]
  const lecturerName = lecturers[Math.abs(seed) % lecturers.length]
  const comment = baseLecturerComments[Math.abs(seed) % baseLecturerComments.length]

  return {
    components,
    finalNumeric: parseFloat(finalNumeric.toFixed(1)),
    lecturerName,
    comment
  }
}

function KhsPage() {
  const { khsBySemester, cumulativeStats } = Route.useLoaderData()

  const [selectedSemester, setSelectedSemester] = useState('')
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  useEffect(() => {
    if (khsBySemester.length > 0) {
      setSelectedSemester(khsBySemester[khsBySemester.length - 1].semesterAjaran)
    }
  }, [khsBySemester])

  const currentSemesterData = useMemo(() => {
    return khsBySemester.find((s) => s.semesterAjaran === selectedSemester)
  }, [selectedSemester, khsBySemester])

  // Reset expanded row whenever semester changes
  useEffect(() => {
    setExpandedRowId(null)
  }, [selectedSemester])

  const handleToggleRow = (courseId: string) => {
    setExpandedRowId((prev) => (prev === courseId ? null : courseId))
  }

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      
      {/* Page Header */}
      <div>
        <h2 className="demo-title display-title text-2xl md:text-3xl font-extrabold text-[var(--sea-ink)]">
          Hasil Studi &amp; Transkrip Akademik
        </h2>
        <p className="mt-1.5 text-sm text-[var(--sea-ink-soft)] font-medium">
          Pantau riwayat nilai per semester, akumulasi indeks prestasi, dan progres kelulusan SKS Anda.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* IPK Card */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--lagoon-deep)]/45">
          <div className="bg-emerald-50 text-[var(--palm)] border border-emerald-200/60 rounded-2xl p-4 shrink-0 shadow-sm flex items-center justify-center">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[var(--sea-ink-soft)]">IPK Kumulatif</span>
            <span className="text-3xl font-black text-[var(--sea-ink)] leading-none mt-1.5 block">
              {cumulativeStats.ipk.toFixed(2)}
            </span>
            <span className="text-xs font-extrabold text-[var(--palm)] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 mt-2 block w-fit">
              {cumulativeStats.ipk >= 3.5 ? '🏆 Cumlaude' : cumulativeStats.ipk >= 3.0 ? '✨ Sangat Memuaskan' : cumulativeStats.ipk >= 2.75 ? 'Memuaskan' : 'Cukup'}
            </span>
          </div>
        </div>

        {/* SKS Lulus */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--lagoon-deep)]/45">
          <div className="bg-sky-50 text-sky-700 border border-sky-200/60 rounded-2xl p-4 shrink-0 shadow-sm flex items-center justify-center">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[var(--sea-ink-soft)]">SKS Lulus</span>
            <span className="text-3xl font-black text-[var(--sea-ink)] leading-none mt-1.5 block">
              {cumulativeStats.totalSksLulus}
            </span>
            <span className="text-xs font-semibold text-[var(--sea-ink-soft)] mt-2 block">
              dari <strong className="text-[var(--sea-ink)] font-bold">{SKS_GRADUATION_TARGET} SKS</strong> target kelulusan
            </span>
          </div>
        </div>

        {/* Total Semester */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--lagoon-deep)]/45">
          <div className="bg-amber-50 text-amber-700 border border-amber-200/60 rounded-2xl p-4 shrink-0 shadow-sm flex items-center justify-center">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[var(--sea-ink-soft)]">Semester Ditempuh</span>
            <span className="text-3xl font-black text-[var(--sea-ink)] leading-none mt-1.5 block">
              {khsBySemester.length}
            </span>
            <span className="text-xs font-semibold text-[var(--sea-ink-soft)] mt-2 block font-medium">
              semester akademik terdaftar
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* IPS per Semester Chart (spans 2 cols) */}
        <div className="lg:col-span-2 demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="display-title text-base font-extrabold text-[var(--sea-ink)]">
              Tren Indeks Prestasi Semester (IPS)
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
              Grafik perkembangan prestasi Anda per semester akademik dari waktu ke waktu.
            </p>
          </div>
          {khsBySemester.length > 0 ? (
            <div className="w-full overflow-hidden">
              <IpsChart data={khsBySemester} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-[var(--sea-ink-soft)] text-sm font-medium">
              Belum ada data KHS.
            </div>
          )}
        </div>

        {/* Graduation Progress Radial Chart */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl flex flex-col gap-2 shadow-sm justify-between">
          <div>
            <h3 className="display-title text-base font-extrabold text-[var(--sea-ink)]">
              Progres Kelulusan SKS
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
              Rasio SKS kumulatif yang telah diselesaikan.
            </p>
          </div>
          <div className="py-2 flex items-center justify-center">
            <GraduationRadialChart
              totalSksLulus={cumulativeStats.totalSksLulus}
              targetSks={SKS_GRADUATION_TARGET}
            />
          </div>
        </div>
      </div>

      {/* Semester KHS Viewer */}
      <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl flex flex-col gap-6 shadow-sm">

        {/* Semester Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]/55">
          <div>
            <h3 className="display-title text-base font-extrabold text-[var(--sea-ink)]">
              Transkrip Kartu Hasil Studi (KHS)
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
              Pilih semester di dropdown sebelah kanan untuk melihat mata kuliah dan klik baris tabel untuk detail nilai.
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="appearance-none block w-full px-4 py-2.5 pr-10 border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:border-transparent text-sm font-bold cursor-pointer transition-all"
            >
              <option value="" disabled>Pilih Semester</option>
              {khsBySemester.map((sem) => (
                <option key={sem.semesterAjaran} value={sem.semesterAjaran}>
                  {sem.semesterAjaran}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--sea-ink-soft)]">
              <ChevronDown className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        {/* Grades Table */}
        {currentSemesterData ? (
          <div className="flex flex-col gap-6">
            
            {/* Semester statistics badge row */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[var(--sand)] text-[var(--sea-ink)] border border-[var(--chip-line)] shadow-sm">
                IPS Semester: <strong className="text-[var(--lagoon-deep)] font-black">{currentSemesterData.ips.toFixed(2)}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[var(--sand)] text-[var(--sea-ink)] border border-[var(--chip-line)] shadow-sm">
                Total SKS Diambil: <strong className="text-[var(--sea-ink)] font-black">{currentSemesterData.totalSks} SKS</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[var(--sand)] text-[var(--sea-ink)] border border-[var(--chip-line)] shadow-sm">
                Mata Kuliah: <strong className="text-[var(--sea-ink)] font-black">{currentSemesterData.courses.length}</strong>
              </span>
            </div>

            {/* Table */}
            <div className="demo-table-shell border border-[var(--line)]/50 rounded-2xl overflow-hidden bg-white/40">
              <table className="demo-table w-full">
                <thead>
                  <tr className="bg-[var(--sand)]/35 text-[var(--sea-ink)] border-b border-[var(--line)]/50">
                    <th className="w-16 text-center text-[10px] font-extrabold uppercase tracking-wider py-4">No</th>
                    <th className="w-28 text-left text-[10px] font-extrabold uppercase tracking-wider">Kode MK</th>
                    <th className="text-left text-[10px] font-extrabold uppercase tracking-wider">Mata Kuliah</th>
                    <th className="w-20 text-center text-[10px] font-extrabold uppercase tracking-wider">SKS</th>
                    <th className="w-28 text-center text-[10px] font-extrabold uppercase tracking-wider">Nilai Huruf</th>
                    <th className="w-24 text-center text-[10px] font-extrabold uppercase tracking-wider">Bobot SKS</th>
                    <th className="w-24 text-center text-[10px] font-extrabold uppercase tracking-wider">Bobot Mutu</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemesterData.courses.map((course, index) => {
                    const isExpanded = expandedRowId === course.id
                    const details = getGradeBreakdown(course.id, course.nilaiHuruf)

                    return (
                      <optgroup key={course.id} label="" className="contents">
                        {/* Course Main Row */}
                        <tr
                          onClick={() => handleToggleRow(course.id)}
                          className={`cursor-pointer transition-all border-b border-[var(--line)]/25 hover:bg-[var(--sand)]/20 ${
                            isExpanded 
                              ? 'bg-[var(--sand)]/15 border-l-4 border-l-[var(--lagoon-deep)]' 
                              : index % 2 === 0 
                              ? 'bg-white/20' 
                              : 'bg-transparent'
                          }`}
                        >
                          <td className="text-center py-3.5 text-xs font-mono text-[var(--sea-ink-soft)]">
                            <div className="flex items-center justify-center gap-1.5">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-[var(--lagoon-deep)]" />
                              ) : (
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              )}
                              <span>{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-mono text-[11px] font-bold text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                              {course.kodeMk}
                            </span>
                          </td>
                          <td className="py-3.5 text-[var(--sea-ink)] font-extrabold text-sm">
                            {course.namaMk}
                          </td>
                          <td className="py-3.5 text-center font-bold text-sm text-[var(--sea-ink)]">
                            {course.sks}
                          </td>
                          <td className="py-3.5 text-center">
                            <GradeBadge grade={course.nilaiHuruf} />
                          </td>
                          <td className="py-3.5 text-center font-mono text-xs font-bold text-[var(--sea-ink-soft)]">
                            {course.bobot.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-center font-mono text-sm font-extrabold text-[var(--lagoon-deep)]">
                            {(course.sks * course.bobot).toFixed(2)}
                          </td>
                        </tr>

                        {/* Collapsible Detailed Grade Breakdown Sub-row */}
                        {isExpanded && (
                          <tr className="bg-white/35 border-b border-[var(--line)]/30">
                            <td colSpan={7} className="p-0">
                              <div className="px-6 py-5 border-l-4 border-[var(--lagoon-deep)] flex flex-col gap-4 animate-slide-down">
                                
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                  
                                  {/* Left: Score components (8 columns) */}
                                  <div className="lg:col-span-8 flex flex-col gap-3">
                                    <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--sea-ink-soft)] flex items-center gap-1.5 mb-1">
                                      <Activity className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
                                      Rincian Rata-Rata Nilai Komponen
                                    </h5>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {details.components.map((comp) => (
                                        <div key={comp.name} className="bg-white/80 border border-[var(--line)]/35 rounded-xl p-3 shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                                          <div className="flex justify-between items-center text-xs font-bold text-[var(--sea-ink)] mb-1.5">
                                            <span className="truncate">{comp.name}</span>
                                            <span>{comp.score} <span className="text-[10px] font-semibold text-[var(--sea-ink-soft)]">({comp.weight}%)</span></span>
                                          </div>
                                          
                                          {/* Score Progress Bar */}
                                          <div className="w-full h-1.5 bg-[var(--sand)]/80 rounded-full overflow-hidden border border-[var(--line)]/15">
                                            <div
                                              style={{ width: `${comp.score}%` }}
                                              className={`h-full rounded-full transition-all duration-300 ${
                                                comp.score >= 85
                                                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                                  : comp.score >= 70
                                                  ? 'bg-gradient-to-r from-sky-400 to-[var(--lagoon-deep)]'
                                                  : comp.score >= 55
                                                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                                  : 'bg-gradient-to-r from-red-400 to-red-500'
                                              }`}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Right: Summary details & lecturer advice (4 columns) */}
                                  <div className="lg:col-span-4 flex flex-col gap-3.5">
                                    
                                    {/* Final Score Info Badge Card */}
                                    <div className="bg-gradient-to-br from-[var(--sea-ink)] to-[#154147] text-[var(--sand)] rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden border border-white/5 shadow-sm">
                                      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-3 translate-y-3">
                                        <GraduationCap className="h-28 w-28" />
                                      </div>
                                      <div className="relative z-10 flex justify-between items-center">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sand)]/70">Akumulasi Nilai Akhir</span>
                                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-white">
                                          Indeks {course.nilaiHuruf}
                                        </span>
                                      </div>
                                      <div className="relative z-10 flex items-baseline gap-1 mt-1">
                                        <span className="text-3xl font-black text-white">{details.finalNumeric.toFixed(1)}</span>
                                        <span className="text-[11px] font-semibold text-[var(--sand)]/70">/ 100</span>
                                      </div>
                                    </div>

                                    {/* Lecturer Card Details */}
                                    <div className="bg-white/80 border border-[var(--line)]/35 rounded-2xl p-4 flex flex-col gap-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                                      <div className="flex items-center gap-2 border-b border-[var(--line)]/25 pb-2">
                                        <User className="h-4 w-4 text-[var(--lagoon-deep)]" />
                                        <div className="flex flex-col min-w-0">
                                          <span className="text-[8px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Dosen Penguji</span>
                                          <span className="text-xs font-extrabold text-[var(--sea-ink)] truncate leading-tight">{details.lecturerName}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex gap-2 items-start text-xs font-medium text-[var(--sea-ink-soft)] leading-relaxed italic">
                                        <MessageSquare className="h-3.5 w-3.5 text-[var(--lagoon-deep)]/75 shrink-0 mt-0.5" />
                                        <p className="leading-snug text-[11px]">"{details.comment}"</p>
                                      </div>
                                    </div>

                                  </div>

                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </optgroup>
                    )
                  })}

                  {/* Summary Rows */}
                  <tr className="border-t-2 border-[var(--line)] bg-[var(--sand)]/20">
                    <td colSpan={3} className="text-right text-[10px] font-extrabold uppercase tracking-widest text-[var(--sea-ink-soft)] pr-4 py-4.5">
                      Jumlah Beban SKS Diambil
                    </td>
                    <td className="text-center font-black text-base text-[var(--sea-ink)]">
                      {currentSemesterData.totalSks} SKS
                    </td>
                    <td colSpan={3} />
                  </tr>
                  
                  <tr className="bg-[var(--sand)]/40 border-t border-[var(--line)]/50">
                    <td colSpan={5} className="text-right text-[10px] font-extrabold uppercase tracking-widest text-[var(--sea-ink-soft)] pr-4 py-4.5">
                      Indeks Prestasi Semester (IPS)
                    </td>
                    <td colSpan={2} className="text-center">
                      <span className="text-xl font-black text-[var(--lagoon-deep)]">
                        {currentSemesterData.ips.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* IPS Advice Card */}
            <div className="border border-[var(--line)] bg-[var(--chip-bg)] px-5 py-4.5 rounded-2xl text-xs font-medium text-[var(--sea-ink-soft)] flex gap-3.5 items-start leading-relaxed shadow-sm">
              <CheckCircle className="h-5 w-5 text-[var(--palm)] flex-shrink-0 mt-0.5" />
              <span>
                Dengan IPS sebesar <strong className="text-[var(--sea-ink)] font-bold">{currentSemesterData.ips.toFixed(2)}</strong> pada semester ini, beban studi maksimal yang disarankan untuk semester berikutnya adalah{' '}
                <strong className="text-[var(--lagoon-deep)] font-extrabold">
                  {currentSemesterData.ips >= 3.0 ? '24' : currentSemesterData.ips >= 2.5 ? '21' : '18'} SKS
                </strong>.
                Pastikan Anda mengonsultasikan rencana studi (KRS) Anda dengan dosen wali sebelum melakukan pengisian kelas.
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-[var(--sea-ink-soft)] font-medium">
            <BookOpen className="h-10 w-10 text-[var(--sea-ink-soft)]/30 mx-auto mb-3" />
            <span>Pilih semester di atas untuk memuat KHS Anda.</span>
          </div>
        )}
      </div>
    </div>
  )
}
