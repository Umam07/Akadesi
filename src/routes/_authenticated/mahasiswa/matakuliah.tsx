import { createFileRoute } from '@tanstack/react-router'
import { getMataKuliahData } from '../../../server/functions/academicFn'
import { useState, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  Award,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  GraduationCap,
  BookmarkCheck,
  Building2,
  X,
  FileText,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/matakuliah')({
  loader: async () => {
    return await getMataKuliahData()
  },
  component: MataKuliahPage,
})

interface CourseItem {
  id: string
  kodeMk: string
  namaMk: string
  sks: number
  semester: number
  jurusan: string | null
  isWajib: boolean
}

function MataKuliahPage() {
  const { student, jurusan, stats, coursesBySemester } = Route.useLoaderData()

  // State filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'WAJIB' | 'PILIHAN'>('ALL')
  const [expandedSemesters, setExpandedSemesters] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
  })

  // Selected course for modal detail
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)

  // Toggle accordion per semester
  const toggleSemester = (sem: number) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [sem]: !prev[sem],
    }))
  }

  const expandAll = () => {
    const next: Record<number, boolean> = {}
    for (let s = 1; s <= 8; s++) next[s] = true
    setExpandedSemesters(next)
  }

  const collapseAll = () => {
    const next: Record<number, boolean> = {}
    for (let s = 1; s <= 8; s++) next[s] = false
    setExpandedSemesters(next)
  }

  // Filtered courses grouped by semester
  const filteredData = useMemo(() => {
    return coursesBySemester
      .map((semGroup) => {
        // Filter by semester if specific tab chosen
        if (selectedSemester !== 'ALL' && semGroup.semester !== selectedSemester) {
          return null
        }

        // Filter courses inside group
        const matchedCourses = semGroup.courses.filter((course) => {
          // Status filter
          if (selectedStatus === 'WAJIB' && !course.isWajib) return false
          if (selectedStatus === 'PILIHAN' && course.isWajib) return false

          // Search query filter
          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim()
            const matchKode = course.kodeMk.toLowerCase().includes(q)
            const matchNama = course.namaMk.toLowerCase().includes(q)
            if (!matchKode && !matchNama) return false
          }

          return true
        })

        if (matchedCourses.length === 0) return null

        const totalSks = matchedCourses.reduce((sum, c) => sum + c.sks, 0)
        const wajibCount = matchedCourses.filter((c) => c.isWajib).length
        const pilihanCount = matchedCourses.filter((c) => !c.isWajib).length

        return {
          semester: semGroup.semester,
          courses: matchedCourses,
          totalSks,
          wajibCount,
          pilihanCount,
        }
      })
      .filter((g): g is NonNullable<typeof g> => g !== null)
  }, [coursesBySemester, selectedSemester, selectedStatus, searchQuery])

  // Total SKS of current filtered view
  const currentFilteredSks = useMemo(() => {
    return filteredData.reduce((acc, g) => acc + g.totalSks, 0)
  }, [filteredData])

  const currentFilteredCount = useMemo(() => {
    return filteredData.reduce((acc, g) => acc + g.courses.length, 0)
  }, [filteredData])

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--sea-ink)] pb-16">
      <div className="page-wrap space-y-6 pt-6">

        {/* Hero Header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #173a40 0%, #0d2529 100%)',
            color: 'var(--sand)',
            boxShadow: '0 10px 30px rgba(23,58,64,0.18)',
          }}
        >
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <Building2 size={13} />
                <span>{student.fakultas || 'Fakultas Teknologi Informasi'}</span>
                <span className="opacity-40">•</span>
                <GraduationCap size={13} />
                <span>{jurusan}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Kurikulum & Mata Kuliah
              </h1>
              <p className="text-sm text-[var(--sand-muted)] leading-relaxed">
                Daftar lengkap seluruh mata kuliah pada Program Studi <span className="font-semibold text-white">{jurusan}</span> dari Semester 1 hingga 8. Pantau beban SKS dan status wajib/pilihan kelulusan Anda.
              </p>
            </div>

            {/* Quick Badge info */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md self-start md:self-auto">
              <div className="flex items-center gap-2.5 pr-4 border-r border-white/10">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <BookmarkCheck size={20} />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--sand-muted)] uppercase tracking-wider font-semibold">Semester Aktif</div>
                  <div className="text-base font-bold text-white">Semester {student.semesterAktif}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 pl-1 sm:pl-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--sand-muted)] uppercase tracking-wider font-semibold">Target Kelulusan</div>
                  <div className="text-base font-bold text-white">144 SKS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Stat 1: Total SKS Kurikulum */}
          <div className="bg-[var(--surface-strong)] p-5 rounded-2xl border border-[var(--line)] shadow-xs hover:border-[var(--sea-ink-soft)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Total Kurikulum</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Layers size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{stats.totalSksKurikulum}</span>
              <span className="text-xs font-bold text-[var(--sea-ink-soft)]">SKS</span>
            </div>
            <p className="text-[11px] text-[var(--sea-ink-soft)] mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span>{stats.totalMatkul} Mata Kuliah Tersedia</span>
            </p>
          </div>

          {/* Stat 2: SKS Wajib */}
          <div className="bg-[var(--surface-strong)] p-5 rounded-2xl border border-[var(--line)] shadow-xs hover:border-[var(--sea-ink-soft)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Mata Kuliah Wajib</span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-sky-700 tracking-tight">{stats.totalSksWajib}</span>
              <span className="text-xs font-bold text-[var(--sea-ink-soft)]">SKS</span>
            </div>
            <p className="text-[11px] text-[var(--sea-ink-soft)] mt-1.5">
              <span className="font-semibold text-sky-700">{stats.countWajib} Matkul</span> wajib lulus
            </p>
          </div>

          {/* Stat 3: SKS Pilihan */}
          <div className="bg-[var(--surface-strong)] p-5 rounded-2xl border border-[var(--line)] shadow-xs hover:border-[var(--sea-ink-soft)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Mata Kuliah Pilihan</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">{stats.totalSksPilihan}</span>
              <span className="text-xs font-bold text-[var(--sea-ink-soft)]">SKS</span>
            </div>
            <p className="text-[11px] text-[var(--sea-ink-soft)] mt-1.5">
              <span className="font-semibold text-amber-700">{stats.countPilihan} Matkul</span> pilihan peminatan
            </p>
          </div>

          {/* Stat 4: Rasio SKS Wajib vs Pilihan */}
          <div className="bg-[var(--surface-strong)] p-5 rounded-2xl border border-[var(--line)] shadow-xs hover:border-[var(--sea-ink-soft)] transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Komposisi SKS</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {Math.round((stats.totalSksWajib / stats.totalSksKurikulum) * 100)}%
              </span>
              <span className="text-xs font-bold text-[var(--sea-ink-soft)]">Wajib</span>
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-[var(--line)] h-2 rounded-full mt-2.5 overflow-hidden flex">
              <div
                className="bg-sky-600 h-full rounded-l-full"
                style={{ width: `${(stats.totalSksWajib / stats.totalSksKurikulum) * 100}%` }}
                title={`Wajib: ${stats.totalSksWajib} SKS`}
              />
              <div
                className="bg-amber-500 h-full rounded-r-full"
                style={{ width: `${(stats.totalSksPilihan / stats.totalSksKurikulum) * 100}%` }}
                title={`Pilihan: ${stats.totalSksPilihan} SKS`}
              />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[var(--surface-strong)] p-4 sm:p-5 rounded-2xl border border-[var(--line)] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">

            {/* Real-time Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]" />
              <input
                type="text"
                placeholder="Cari berdasarkan kode (misal IF101) atau nama mata kuliah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--sea-ink)] focus:ring-1 focus:ring-[var(--sea-ink)] transition-all placeholder:text-[var(--sea-ink-soft)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sifat Filter Pills (Wajib / Pilihan) */}
            <div className="flex items-center gap-1.5 p-1 bg-[var(--surface)] rounded-xl border border-[var(--line)] self-start md:self-auto">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'ALL'
                    ? 'bg-[var(--sea-ink)] text-[var(--sand)] shadow-xs'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
                }`}
              >
                Semua Sifat
              </button>
              <button
                onClick={() => setSelectedStatus('WAJIB')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === 'WAJIB'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-[var(--sea-ink-soft)] hover:text-sky-700'
                }`}
              >
                <CheckCircle2 size={13} />
                Wajib
              </button>
              <button
                onClick={() => setSelectedStatus('PILIHAN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === 'PILIHAN'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-[var(--sea-ink-soft)] hover:text-amber-700'
                }`}
              >
                <Sparkles size={13} />
                Pilihan
              </button>
            </div>

            {/* Expand / Collapse Controls */}
            <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-[var(--line)] justify-end">
              <button
                onClick={expandAll}
                className="text-xs font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] px-2 py-1 rounded-md hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                Buka Semua
              </button>
              <span className="text-[var(--line)]">|</span>
              <button
                onClick={collapseAll}
                className="text-xs font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] px-2 py-1 rounded-md hover:bg-[var(--surface)] transition-all cursor-pointer"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          {/* Semester Tabs Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[var(--line)]">
            <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-1 mr-1 flex-shrink-0">
              <Filter size={13} /> Semester:
            </span>
            <button
              onClick={() => setSelectedSemester('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                selectedSemester === 'ALL'
                  ? 'bg-[var(--sea-ink)] text-[var(--sand)] shadow-xs'
                  : 'bg-[var(--surface)] text-[var(--sea-ink-soft)] border border-[var(--line)] hover:border-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
              }`}
            >
              Semua Semester
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  selectedSemester === sem
                    ? 'bg-[var(--sea-ink)] text-[var(--sand)] shadow-xs'
                    : 'bg-[var(--surface)] text-[var(--sea-ink-soft)] border border-[var(--line)] hover:border-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Summary Header if filtered */}
        {(searchQuery || selectedSemester !== 'ALL' || selectedStatus !== 'ALL') && (
          <div className="flex items-center justify-between px-2 py-1 text-xs text-[var(--sea-ink-soft)]">
            <div>
              Menampilkan <span className="font-bold text-[var(--sea-ink)]">{currentFilteredCount} mata kuliah</span> ({currentFilteredSks} SKS) dari hasil filter.
            </div>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedSemester('ALL')
                setSelectedStatus('ALL')
              }}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Main Content: Courses grouped by Semester */}
        {filteredData.length === 0 ? (
          <div className="bg-[var(--surface-strong)] rounded-3xl p-12 text-center border border-[var(--line)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Info size={24} />
            </div>
            <h3 className="text-base font-bold text-[var(--sea-ink)]">Mata Kuliah Tidak Ditemukan</h3>
            <p className="text-xs text-[var(--sea-ink-soft)] max-w-md mx-auto">
              Tidak ada mata kuliah yang cocok dengan kata kunci "{searchQuery}" atau filter sifat/semester yang Anda pilih.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedSemester('ALL')
                setSelectedStatus('ALL')
              }}
              className="px-4 py-2 bg-[var(--sea-ink)] text-[var(--sand)] text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              Tampilkan Semua Mata Kuliah
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredData.map((semGroup) => {
              const isExpanded = expandedSemesters[semGroup.semester] ?? true

              return (
                <div
                  key={semGroup.semester}
                  className="bg-[var(--surface-strong)] rounded-3xl border border-[var(--line)] overflow-hidden shadow-xs transition-all duration-200"
                >
                  {/* Semester Accordion Header */}
                  <div
                    onClick={() => toggleSemester(semGroup.semester)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-[var(--surface)] transition-all select-none border-b border-[var(--line)]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--sea-ink)] text-[var(--sand)] flex items-center justify-center font-black text-base shadow-xs flex-shrink-0">
                        {semGroup.semester}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-[var(--sea-ink)]">
                            Semester {semGroup.semester}
                          </h2>
                          {student.semesterAktif === semGroup.semester && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                              Semester Anda Saat Ini
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5 flex items-center gap-2">
                          <span>{semGroup.courses.length} Mata Kuliah</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">{semGroup.totalSks} Total SKS</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Subtotal Pill Badges */}
                      <div className="hidden sm:flex items-center gap-2">
                        {semGroup.wajibCount > 0 && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            {semGroup.wajibCount} Wajib
                          </span>
                        )}
                        {semGroup.pilihanCount > 0 && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Sparkles size={12} />
                            {semGroup.pilihanCount} Pilihan
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-xl text-[var(--sea-ink-soft)] hover:bg-[var(--surface-strong)] transition-all">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Semester Courses List */}
                  {isExpanded && (
                    <div className="divide-y divide-[var(--line)] bg-[var(--surface-strong)]">
                      {semGroup.courses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => setSelectedCourse(course)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface)] transition-all cursor-pointer group"
                        >
                          {/* Left: Code, Name, Badges */}
                          <div className="flex items-start sm:items-center gap-3.5">
                            {/* Kode MK Badge */}
                            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-black font-mono tracking-wider text-[var(--sea-ink)] group-hover:border-[var(--sea-ink)] group-hover:bg-[var(--sea-ink)] group-hover:text-[var(--sand)] transition-all flex-shrink-0">
                              {course.kodeMk}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-[var(--sea-ink)] group-hover:text-emerald-700 transition-colors">
                                  {course.namaMk}
                                </h3>

                                {/* Status Wajib / Pilihan Badge */}
                                {course.isWajib ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 shadow-xs">
                                    <CheckCircle2 size={11} className="text-sky-600" />
                                    Wajib
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                                    <Sparkles size={11} className="text-amber-600" />
                                    Pilihan
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[var(--sea-ink-soft)] flex items-center gap-2">
                                <span>{course.jurusan || 'Mata Kuliah Umum (MKU)'}</span>
                                <span>•</span>
                                <span>Semester {course.semester}</span>
                              </p>
                            </div>
                          </div>

                          {/* Right: SKS Badge & Detail CTA */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--line)]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--sea-ink-soft)] font-medium">Beban Kredit:</span>
                              <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 font-mono">
                                {course.sks} SKS
                              </span>
                            </div>

                            <span className="text-xs font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              Detail <FileText size={14} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs rise-in"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-[var(--surface-strong)] border border-[var(--line)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-[var(--sea-ink)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--sea-ink)] text-[var(--sand)] text-xs font-mono font-bold">
                    {selectedCourse.kodeMk}
                  </span>
                  {selectedCourse.isWajib ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                      Mata Kuliah Wajib
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      Mata Kuliah Pilihan
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-[var(--sea-ink)] leading-snug">
                  {selectedCourse.namaMk}
                </h3>
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 rounded-xl text-[var(--sea-ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--sea-ink)] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[var(--surface)] rounded-2xl border border-[var(--line)]">
                <span className="text-[var(--sea-ink-soft)] font-medium block mb-1">Bobot SKS</span>
                <span className="text-base font-black text-emerald-700">{selectedCourse.sks} SKS</span>
              </div>

              <div className="p-3.5 bg-[var(--surface)] rounded-2xl border border-[var(--line)]">
                <span className="text-[var(--sea-ink-soft)] font-medium block mb-1">Semester Paket</span>
                <span className="text-base font-black text-[var(--sea-ink)]">Semester {selectedCourse.semester}</span>
              </div>

              <div className="p-3.5 bg-[var(--surface)] rounded-2xl border border-[var(--line)] col-span-2">
                <span className="text-[var(--sea-ink-soft)] font-medium block mb-1">Program Studi / Pengampu</span>
                <span className="text-xs font-bold text-[var(--sea-ink)]">
                  {selectedCourse.jurusan ? `Prodi ${selectedCourse.jurusan}` : 'Mata Kuliah Umum (MKU) Universitas'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-1 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Catatan Syarat Kelulusan
              </div>
              <p className="text-emerald-800 leading-relaxed">
                {selectedCourse.isWajib
                  ? 'Mata kuliah ini bernilai WAJIB dan harus lulus dengan nilai minimal C untuk memenuhi kriteria kelulusan program studi.'
                  : 'Mata kuliah ini bernilai PILIHAN. Anda dapat mengambilnya untuk melengkapi kuota SKS kelulusan atau pendalaman peminatan.'}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedCourse(null)}
                className="w-full py-2.5 bg-[var(--sea-ink)] text-[var(--sand)] text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
