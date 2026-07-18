import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getKrsData, submitKrs } from '../../../server/functions/academicFn'
import { useState, useMemo } from 'react'
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Save,
  Info,
  Search,
  Filter,
  Calendar,
  Trash2,
  Clock,
  MapPin,
  User,
  Sparkles,
  RefreshCw,
  Check,
  X,
  ChevronRight,
  HelpCircle
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/krs')({
  loader: async () => {
    return await getKrsData()
  },
  component: KrsPage,
})

// English day mapping to index for schedule visualizer
const DAYS_ENG_MAP: Record<string, number> = {
  'senin': 0,
  'selasa': 1,
  'rabu': 2,
  'kamis': 3,
  'jumat': 4,
}

// Function to generate premium colors for course blocks
const getCourseColorClass = (courseId: string, isConflict: boolean) => {
  if (isConflict) {
    return {
      bg: 'bg-red-50/95 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800/60 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]',
      accent: 'bg-red-500'
    }
  }

  // Consistent pleasant colors based on courseId hash
  const colors = [
    { bg: 'bg-sky-50/90 text-sky-700 border-sky-200/80 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.1)]', accent: 'bg-sky-500' },
    { bg: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.1)]', accent: 'bg-indigo-500' },
    { bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]', accent: 'bg-emerald-500' },
    { bg: 'bg-violet-50/90 text-violet-700 border-violet-200/80 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.1)]', accent: 'bg-violet-500' },
    { bg: 'bg-amber-50/90 text-amber-700 border-amber-200/80 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.1)]', accent: 'bg-amber-500' },
    { bg: 'bg-teal-50/90 text-teal-700 border-teal-200/80 shadow-[inset_0_0_0_1px_rgba(20,184,166,0.1)]', accent: 'bg-teal-500' },
    { bg: 'bg-rose-50/90 text-rose-700 border-rose-200/80 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.1)]', accent: 'bg-rose-500' },
  ]

  let hash = 0
  for (let i = 0; i < courseId.length; i++) {
    hash = courseId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

function KrsPage() {
  const { student, availableCourses, registeredKrs } = Route.useLoaderData()
  const router = useRouter()

  // Initialize selected course IDs from registered KRS
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    registeredKrs.map((r) => r.courseId)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Interactive filtering states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all')
  const [hideConflicts, setHideConflicts] = useState(false)
  const [showOnlySelected, setShowOnlySelected] = useState(false)

  // Determine SKS limit
  const maxSks = useMemo(() => {
    if (student.ipk >= 3.00) return 24
    if (student.ipk >= 2.50) return 21
    return 18
  }, [student.ipk])

  // Map of available courses for fast lookup
  const courseLookup = useMemo(() => {
    return new Map(availableCourses.map(c => [c.id, c]))
  }, [availableCourses])

  // Get selected courses list
  const selectedCourses = useMemo(() => {
    return selectedIds.map(id => courseLookup.get(id)).filter(Boolean) as typeof availableCourses
  }, [selectedIds, courseLookup])

  // Calculate current total SKS
  const totalSks = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + c.sks, 0)
  }, [selectedCourses])

  // Time conversion helper
  const toMinutes = (timeStr: string) => {
    const parts = timeStr.split(':')
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
  }

  // Detect conflicts among SELECTED courses dynamically
  const conflicts = useMemo(() => {
    const list: Array<{
      course1: string
      course2: string
      day: string
      time1: string
      time2: string
    }> = []

    const activeSchedules: Array<{
      courseId: string
      namaMk: string
      hari: string
      jamMulai: string
      jamSelesai: string
    }> = []

    for (const c of selectedCourses) {
      for (const s of c.schedules) {
        activeSchedules.push({
          courseId: c.id,
          namaMk: c.namaMk,
          hari: s.hari,
          jamMulai: s.jamMulai,
          jamSelesai: s.jamSelesai
        })
      }
    }

    for (let i = 0; i < activeSchedules.length; i++) {
      for (let j = i + 1; j < activeSchedules.length; j++) {
        const s1 = activeSchedules[i]
        const s2 = activeSchedules[j]

        if (s1.courseId === s2.courseId) continue

        if (s1.hari.toLowerCase() === s2.hari.toLowerCase()) {
          const m1_start = toMinutes(s1.jamMulai)
          const m1_end = toMinutes(s1.jamSelesai)
          const m2_start = toMinutes(s2.jamMulai)
          const m2_end = toMinutes(s2.jamSelesai)

          if (m1_start < m2_end && m2_start < m1_end) {
            list.push({
              course1: s1.namaMk,
              course2: s2.namaMk,
              day: s1.hari,
              time1: `${s1.jamMulai.substring(0, 5)} - ${s1.jamSelesai.substring(0, 5)}`,
              time2: `${s2.jamMulai.substring(0, 5)} - ${s2.jamSelesai.substring(0, 5)}`
            })
          }
        }
      }
    }

    return list
  }, [selectedCourses])

  // Pre-calculate which available courses conflict with the CURRENT selection
  const preCheckedConflictsMap = useMemo(() => {
    const map = new Map<string, Array<{
      selectedCourseName: string
      hari: string
      jamMulai: string
      jamSelesai: string
    }>>()

    for (const course of availableCourses) {
      const list: Array<{
        selectedCourseName: string
        hari: string
        jamMulai: string
        jamSelesai: string
      }> = []

      // Compare this course schedules to all SELECTED courses' schedules
      for (const selected of selectedCourses) {
        if (selected.id === course.id) continue
        for (const s1 of course.schedules) {
          for (const s2 of selected.schedules) {
            if (s1.hari.toLowerCase() === s2.hari.toLowerCase()) {
              const m1_start = toMinutes(s1.jamMulai)
              const m1_end = toMinutes(s1.jamSelesai)
              const m2_start = toMinutes(s2.jamMulai)
              const m2_end = toMinutes(s2.jamSelesai)

              if (m1_start < m2_end && m2_start < m1_end) {
                list.push({
                  selectedCourseName: selected.namaMk,
                  hari: s1.hari,
                  jamMulai: s1.jamMulai,
                  jamSelesai: s1.jamSelesai
                })
              }
            }
          }
        }
      }
      map.set(course.id, list)
    }

    return map
  }, [availableCourses, selectedCourses])

  // Get list of unique semesters for filtering tabs
  const semestersList = useMemo(() => {
    const s = new Set(availableCourses.map(c => c.semester))
    return Array.from(s).sort((a, b) => a - b)
  }, [availableCourses])

  // Filter courses based on user queries
  const filteredCourses = useMemo(() => {
    return availableCourses.filter((course) => {
      // 1. Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        const matchName = course.namaMk.toLowerCase().includes(query)
        const matchCode = course.kodeMk.toLowerCase().includes(query)
        if (!matchName && !matchCode) return false
      }

      // 2. Semester filter
      if (selectedSemester !== 'all' && course.semester !== selectedSemester) {
        return false
      }

      // 3. Selection filter
      const isChecked = selectedIds.includes(course.id)
      if (showOnlySelected && !isChecked) return false

      // 4. Hide Conflicts filter
      if (hideConflicts && !isChecked) {
        const hasConflict = (preCheckedConflictsMap.get(course.id)?.length ?? 0) > 0
        if (hasConflict) return false
      }

      return true
    })
  }, [availableCourses, searchTerm, selectedSemester, showOnlySelected, hideConflicts, selectedIds, preCheckedConflictsMap])

  // Toggle selection
  const handleToggle = (courseId: string) => {
    setErrorMsg('')
    setSuccessMsg('')
    setSelectedIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    )
  }

  // Restore originally saved KRS
  const handleResetToRegistered = () => {
    setSelectedIds(registeredKrs.map((r) => r.courseId))
    setErrorMsg('')
    setSuccessMsg('')
  }

  // Clear all selections
  const handleClearAll = () => {
    setSelectedIds([])
    setErrorMsg('')
    setSuccessMsg('')
  }

  // Submit study plan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (totalSks > maxSks) {
      setErrorMsg(`Batas SKS Anda (${maxSks} SKS) terlampaui. Total terpilih: ${totalSks} SKS.`)
      return
    }

    if (conflicts.length > 0) {
      setErrorMsg('Terdapat jadwal bentrok. Silakan perbaiki pilihan Anda sebelum menyimpan.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await submitKrs({ data: { courseIds: selectedIds } })
      setSuccessMsg(res.message || 'KRS berhasil disimpan!')
      router.invalidate()
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan KRS')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-[var(--sea-ink)] to-[#1b484f] text-[var(--sand)] p-6 md:p-8 rounded-3xl shadow-md border border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10 scale-150">
          <BookOpen className="h-64 w-64" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--lagoon)] tracking-widest uppercase mb-2 bg-[var(--sea-ink-soft)]/20 px-3 py-1 rounded-full border border-[var(--lagoon)]/20 w-fit">
            <Sparkles className="h-3 w-3" /> Semester Genap 2025/2026
          </div>
          <h2 className="display-title text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
            Rencana Studi Mahasiswa (KRS)
          </h2>
          <p className="mt-2 text-sm text-[var(--sand)]/80 font-medium max-w-xl">
            Atur dan pilih mata kuliah semester ini dengan mudah. Sistem akan secara otomatis mendeteksi bentrok jadwal secara langsung.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 self-stretch md:self-auto md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
          <div className="text-left md:text-right">
            <span className="block text-[10px] font-bold text-[var(--sand)]/60 uppercase tracking-widest">Nama Mahasiswa</span>
            <span className="text-sm font-bold text-white block mt-0.5">{student.nama}</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold text-[var(--sand)]/60 uppercase tracking-widest">Batas Maksimal</span>
            <span className="text-base font-extrabold text-[var(--lagoon)] block mt-0.5">{maxSks} SKS</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Course Selection Menu (8 Columns) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          
          {/* Filters & Control Panel */}
          <div className="border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            
            {/* Search Input & Tab Container */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sea-ink-soft)]" />
                <input
                  type="text"
                  placeholder="Cari mata kuliah atau kode MK..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-[var(--line)] rounded-xl text-sm font-medium text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              
              {/* Reset Control Group */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetToRegistered}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 border border-[var(--line)] bg-[var(--chip-bg)] hover:bg-white text-xs font-bold text-[var(--sea-ink)] rounded-xl transition-all hover:border-[var(--sea-ink-soft)] cursor-pointer"
                  title="Kembalikan ke KRS awal yang sudah tersimpan"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Revert
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-bold text-red-700 rounded-xl transition-all cursor-pointer"
                  title="Kosongkan semua pilihan saat ini"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>

            {/* Semester Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-[var(--line)]/50 pb-3">
              <button
                onClick={() => setSelectedSemester('all')}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer border ${
                  selectedSemester === 'all'
                    ? 'bg-[var(--sea-ink)] text-[var(--sand)] border-[var(--sea-ink)]'
                    : 'bg-white/40 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] border-[var(--line)]'
                }`}
              >
                Semua Semester
              </button>
              {semestersList.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer border ${
                    selectedSemester === sem
                      ? 'bg-[var(--sea-ink)] text-[var(--sand)] border-[var(--sea-ink)]'
                      : 'bg-white/40 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] border-[var(--line)]'
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>

            {/* Advanced Filters (Switches) */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideConflicts}
                  onChange={(e) => setHideConflicts(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-[var(--line)] text-[var(--lagoon-deep)] focus:ring-[var(--lagoon)] cursor-pointer"
                />
                <span>Sembunyikan Bentrok</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnlySelected}
                  onChange={(e) => setShowOnlySelected(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-[var(--line)] text-[var(--lagoon-deep)] focus:ring-[var(--lagoon)] cursor-pointer"
                />
                <span>Hanya Terpilih ({selectedIds.length})</span>
              </label>
            </div>

          </div>

          {/* Available Courses Header */}
          <div className="flex justify-between items-center px-1">
            <h3 className="display-title text-base font-bold flex items-center gap-2 text-[var(--sea-ink)]">
              <BookOpen className="h-5 w-5 text-[var(--lagoon-deep)]" />
              Mata Kuliah Tersedia ({filteredCourses.length})
            </h3>
            <span className="text-xs font-bold text-[var(--sea-ink-soft)]">
              Menampilkan {filteredCourses.length} dari {availableCourses.length} MK
            </span>
          </div>

          {/* Course Selection Cards */}
          <div className="flex flex-col gap-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const isChecked = selectedIds.includes(course.id)
                const preConflicts = preCheckedConflictsMap.get(course.id) || []
                const hasPreConflicts = preConflicts.length > 0 && !isChecked

                return (
                  <div
                    key={course.id}
                    onClick={() => handleToggle(course.id)}
                    className={`border p-5 rounded-2xl cursor-pointer transition-all flex flex-col md:flex-row gap-5 items-start md:items-center relative overflow-hidden group ${
                      isChecked
                        ? 'border-[var(--lagoon-deep)] bg-emerald-50/10 shadow-[0_6px_20px_rgba(79,184,178,0.08)]'
                        : hasPreConflicts
                        ? 'border-amber-200 bg-amber-50/20 hover:border-amber-400'
                        : 'border-[var(--line)] bg-[var(--surface-strong)] hover:border-[var(--sea-ink-soft)] hover:shadow-sm'
                    }`}
                  >
                    
                    {/* Left Checkbox Container */}
                    <div className="flex items-center gap-3 self-stretch md:self-auto border-b md:border-b-0 pb-3 md:pb-0 border-[var(--line)]/55">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all ${
                        isChecked 
                          ? 'bg-[var(--lagoon-deep)] border-[var(--lagoon-deep)] text-white scale-105 shadow-sm' 
                          : hasPreConflicts
                          ? 'border-amber-300 bg-white text-amber-600'
                          : 'border-[var(--line)] bg-white group-hover:border-[var(--sea-ink-soft)]'
                      }`}>
                        {isChecked ? (
                          <Check className="h-4 w-4 stroke-[3]" />
                        ) : hasPreConflicts ? (
                          <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
                        ) : null}
                      </div>
                      
                      <div className="md:hidden flex flex-1 justify-between items-center">
                        <span className="text-xs font-mono font-bold text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                          {course.kodeMk}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-[var(--sea-ink)]">{course.sks} SKS</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Info Details */}
                    <div className="flex-1 w-full">
                      <div className="hidden md:flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold uppercase tracking-wide text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                          {course.kodeMk}
                        </span>
                        <span className="text-xs font-bold text-[var(--sea-ink-soft)] bg-[var(--sand)] px-2.5 py-0.5 rounded border border-[var(--line)]/50">
                          Semester {course.semester}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-[var(--sea-ink)] leading-snug group-hover:text-[var(--lagoon-deep)] transition-colors">
                        {course.namaMk}
                      </h4>

                      {/* Display warning inline if choosing this causes conflict */}
                      {hasPreConflicts && (
                        <div className="mt-2.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-800 rounded-xl flex gap-1.5 items-center rise-in">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                          <span>
                            Bentrok dengan: {preConflicts.map(c => `${c.selectedCourseName} (${c.hari})`).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Active collision detail when selected */}
                      {isChecked && preConflicts.length > 0 && (
                        <div className="mt-2.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-red-800 rounded-xl flex gap-1.5 items-center rise-in">
                          <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                          <span>
                            Jadwal Bentrok Aktif dengan: {preConflicts.map(c => c.selectedCourseName).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Schedules list in card */}
                      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-[var(--line)]/50">
                        {course.schedules.map((s: any) => (
                          <div key={s.id} className="flex flex-col gap-1 bg-white/40 p-2.5 rounded-xl border border-[var(--line)]/30 text-xs font-medium text-[var(--sea-ink-soft)]">
                            <div className="flex items-center gap-1.5 text-[var(--sea-ink)] font-bold">
                              <Clock className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
                              <span>{s.hari}, {s.jamMulai.substring(0, 5)} - {s.jamSelesai.substring(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <User className="h-3 w-3 opacity-70" />
                              <span className="truncate">{s.namaDosen}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <MapPin className="h-3 w-3 opacity-70" />
                              <span>{s.ruangan}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right SKS Counter */}
                    <div className="hidden md:flex flex-col justify-center items-center text-center self-stretch bg-[var(--sand)]/50 border-l border-[var(--line)]/50 pl-5 pr-2 py-2">
                      <span className="text-xl font-black text-[var(--sea-ink)]">{course.sks}</span>
                      <span className="block text-[8px] font-black uppercase tracking-wider text-[var(--sea-ink-soft)]">SKS</span>
                    </div>

                  </div>
                )
              })
            ) : (
              <div className="border border-dashed border-[var(--sea-ink-soft)]/30 rounded-2xl text-center py-16 px-6 bg-white/40">
                <HelpCircle className="h-10 w-10 text-[var(--sea-ink-soft)]/40 mx-auto mb-3" />
                <h4 className="font-bold text-[var(--sea-ink)] text-base">Tidak Ada Mata Kuliah</h4>
                <p className="text-xs text-[var(--sea-ink-soft)] mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Tidak ada mata kuliah yang cocok dengan kata kunci pencarian atau filter yang Anda pilih. Coba bersihkan filter.
                </p>
                { (searchTerm || selectedSemester !== 'all' || hideConflicts || showOnlySelected) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedSemester('all')
                      setHideConflicts(false)
                      setShowOnlySelected(false)
                    }}
                    className="mt-4 px-4 py-2 bg-[var(--sea-ink)] text-[var(--sand)] text-xs font-bold rounded-lg hover:bg-[var(--sea-ink-soft)] transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Visual Preview & KRS Summary (4 Columns) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 sticky top-[90px]">
          
          {/* Weekly Schedule Visual Grid Widget */}
          <div className="border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
            <h3 className="display-title text-sm font-bold flex items-center gap-2 pb-2.5 border-b border-[var(--line)]/55">
              <Calendar className="h-4.5 w-4.5 text-[var(--lagoon-deep)]" />
              Visualisasi Jadwal Mingguan
            </h3>

            <div className="relative border border-[var(--line)] bg-white rounded-xl p-3 overflow-hidden select-none">
              
              {/* Day Headers */}
              <div className="grid grid-cols-11 gap-0.5 border-b border-[var(--line)] pb-2 mb-2 text-center text-[9px] font-extrabold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                <div className="col-span-1 text-left"></div>
                <div className="col-span-2">Sen</div>
                <div className="col-span-2">Sel</div>
                <div className="col-span-2">Rab</div>
                <div className="col-span-2">Kam</div>
                <div className="col-span-2">Jum</div>
              </div>

              {/* Grid timeline Area */}
              <div className="relative h-[240px] grid grid-cols-11 gap-0.5">
                
                {/* Left Column: Time Guides */}
                <div className="col-span-1 flex flex-col justify-between text-[8px] font-mono font-bold text-[var(--sea-ink-soft)]/80 py-0.5">
                  <span>07</span>
                  <span>09</span>
                  <span>11</span>
                  <span>13</span>
                  <span>15</span>
                  <span>17</span>
                  <span>18</span>
                </div>

                {/* Day Columns Container */}
                <div className="col-span-10 grid grid-cols-5 gap-0.5 relative h-full bg-[var(--sand)]/20 rounded-md overflow-hidden p-0.5">
                  {/* Vertical guides */}
                  {[0, 1, 2, 3, 4].map((d) => (
                    <div key={d} className="relative h-full border-r border-[var(--line)]/15 last:border-r-0" />
                  ))}

                  {/* Absolute blocks of selected classes */}
                  {selectedCourses.map((course) => {
                    return course.schedules.map((s: any) => {
                      const dayIndex = DAYS_ENG_MAP[s.hari.toLowerCase()]
                      if (dayIndex === undefined) return null

                      const startMin = toMinutes(s.jamMulai)
                      const endMin = toMinutes(s.jamSelesai)
                      const dayStartMin = 420 // 07:00
                      const dayEndMin = 1080 // 18:00
                      const totalMin = dayEndMin - dayStartMin

                      const top = ((startMin - dayStartMin) / totalMin) * 100
                      const height = ((endMin - startMin) / totalMin) * 100

                      // Check if schedule overlaps with another selected course
                      const isConflict = conflicts.some(
                        (c) =>
                          c.day.toLowerCase() === s.hari.toLowerCase() &&
                          ((c.course1 === course.namaMk && c.time1.includes(s.jamMulai.substring(0, 5))) ||
                            (c.course2 === course.namaMk && c.time2.includes(s.jamMulai.substring(0, 5))))
                      )

                      const colors = getCourseColorClass(course.id, isConflict)

                      return (
                        <div
                          key={s.id}
                          style={{
                            left: `calc(${dayIndex} * 20% + 2px)`,
                            width: `calc(20% - 4px)`,
                            top: `${top}%`,
                            height: `${height}%`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggle(course.id)
                          }}
                          className={`absolute rounded p-1 text-[7px] font-extrabold leading-3 overflow-hidden transition-all duration-200 border flex flex-col justify-between cursor-pointer hover:z-20 hover:scale-[1.04] ${colors.bg}`}
                          title={`${course.namaMk}\n${s.hari}, ${s.jamMulai.substring(0, 5)} - ${s.jamSelesai.substring(0, 5)}`}
                        >
                          <div className="flex items-start gap-0.5">
                            <span className={`w-1 h-1 rounded-full ${colors.accent} shrink-0 mt-0.5`} />
                            <span className="truncate leading-none">{course.namaMk}</span>
                          </div>
                          {isConflict && (
                            <span className="text-[6px] text-red-600 bg-red-100 rounded px-0.5 py-0 font-black tracking-tight text-center uppercase">
                              BENTROK
                            </span>
                          )}
                        </div>
                      )
                    })
                  })}
                </div>
              </div>
            </div>
            
            <div className="text-[10px] text-[var(--sea-ink-soft)] font-medium flex items-start gap-1">
              <Info className="h-3.5 w-3.5 shrink-0 opacity-70 mt-0.5" />
              <span>Kotak warna mewakili kelas pilihan. Klik kotak di atas untuk membatalkan pilihan.</span>
            </div>
          </div>

          {/* KRS Summary and Save Panel */}
          <div className="border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="display-title text-sm font-bold flex items-center gap-2 pb-2.5 border-b border-[var(--line)]/55">
              <Info className="h-4.5 w-4.5 text-[var(--lagoon-deep)]" />
              Ringkasan KRS Anda
            </h3>

            {/* GPA Details */}
            <div className="flex justify-between items-center text-xs font-semibold text-[var(--sea-ink-soft)]">
              <span>IPK Terakhir</span>
              <span className="font-bold text-[var(--sea-ink)] bg-[var(--sand)] px-2.5 py-1 rounded-lg border border-[var(--line)]/30">
                {student.ipk.toFixed(2)}
              </span>
            </div>

            {/* SKS Limit Indicator */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between text-xs font-bold text-[var(--sea-ink)]">
                <span>Rencana SKS Terpilih</span>
                <span className={totalSks > maxSks ? 'text-red-600' : 'text-[var(--lagoon-deep)]'}>
                  {totalSks} / {maxSks} SKS
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-[var(--sand)] rounded-full overflow-hidden border border-[var(--line)]/40 p-0.5">
                <div
                  style={{ width: `${Math.min((totalSks / maxSks) * 100, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalSks > maxSks
                      ? 'bg-gradient-to-r from-red-500 to-rose-600'
                      : totalSks === maxSks
                      ? 'bg-gradient-to-r from-emerald-500 to-[var(--lagoon-deep)]'
                      : 'bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)]'
                  }`}
                />
              </div>
            </div>

            {/* Selected Courses Mini List */}
            {selectedCourses.length > 0 ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--line)]/30 max-h-[160px] overflow-y-auto pr-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                  Mata Kuliah Terpilih ({selectedCourses.length})
                </span>
                <div className="flex flex-col gap-1.5">
                  {selectedCourses.map((c) => (
                    <div key={c.id} className="flex justify-between items-center gap-2 p-2 bg-white/60 hover:bg-white rounded-xl border border-[var(--line)]/30 text-xs transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[var(--sea-ink)] block truncate">{c.namaMk}</span>
                        <span className="text-[10px] text-[var(--sea-ink-soft)]">{c.sks} SKS • Sem {c.semester}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggle(c.id)
                        }}
                        className="text-[var(--sea-ink-soft)] hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus MK ini"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-[var(--line)] bg-[var(--chip-bg)] px-3.5 py-3 rounded-xl text-xs text-[var(--sea-ink-soft)] font-medium flex gap-2">
                <Info className="h-4.5 w-4.5 text-[var(--sea-ink-soft)] flex-shrink-0" />
                <span>Belum ada mata kuliah terpilih. Centang mata kuliah di sebelah kiri.</span>
              </div>
            )}

            {/* Overload SKS Warning */}
            {totalSks > maxSks && (
              <div className="border border-red-200 bg-red-50 px-3.5 py-3 rounded-xl text-xs text-red-700 font-bold flex gap-2 animate-pulse">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                <span>Total SKS terpilih melebihi batas maksimal {maxSks} SKS. Kurangi pilihan mata kuliah.</span>
              </div>
            )}

            {/* Conflict list */}
            {conflicts.length > 0 && (
              <div className="flex flex-col gap-3 border border-amber-200 bg-amber-50 px-3.5 py-3 rounded-xl text-xs text-amber-800 font-medium rise-in">
                <div className="flex gap-2 font-bold text-amber-950">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
                  <span>Jadwal Bentrok Terdeteksi!</span>
                </div>
                <div className="flex flex-col gap-2 pl-6 font-medium leading-relaxed">
                  {conflicts.map((c, idx) => (
                    <div key={idx} className="border-l-2 border-amber-300 pl-2">
                      <span className="block font-bold">Hari {c.day}:</span>
                      <span className="block text-[11px] text-amber-900">- {c.course1} ({c.time1})</span>
                      <span className="block text-[11px] text-amber-900">- {c.course2} ({c.time2})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit / Save Alerts */}
            {errorMsg && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 rounded-xl text-xs text-red-600 font-bold flex gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 rounded-xl text-xs text-emerald-700 font-bold flex gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || totalSks > maxSks || conflicts.length > 0}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-[var(--sand)] bg-[var(--sea-ink)] hover:bg-[var(--sea-ink-soft)] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  Simpan Rencana Studi
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
