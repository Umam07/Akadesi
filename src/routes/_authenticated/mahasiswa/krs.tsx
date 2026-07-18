import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getKrsData, submitKrs } from '../../../server/functions/academicFn'
import { useState, useMemo } from 'react'
import { BookOpen, CheckCircle, AlertTriangle, AlertCircle, Save, Info } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/krs')({
  loader: async () => {
    return await getKrsData()
  },
  component: KrsPage,
})

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

  // Detect conflicts dynamically
  const conflicts = useMemo(() => {
    const list: Array<{
      course1: string
      course2: string
      day: string
      time1: string
      time2: string
    }> = []

    // Get all schedule slots of selected courses
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

    // Compare all pairs of schedule slots
    for (let i = 0; i < activeSchedules.length; i++) {
      for (let j = i + 1; j < activeSchedules.length; j++) {
        const s1 = activeSchedules[i]
        const s2 = activeSchedules[j]

        // Skip same course
        if (s1.courseId === s2.courseId) continue

        // Check if day matches
        if (s1.hari.toLowerCase() === s2.hari.toLowerCase()) {
          const m1_start = toMinutes(s1.jamMulai)
          const m1_end = toMinutes(s1.jamSelesai)
          const m2_start = toMinutes(s2.jamMulai)
          const m2_end = toMinutes(s2.jamSelesai)

          // Check overlap
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

  const handleToggle = (courseId: string) => {
    setErrorMsg('')
    setSuccessMsg('')
    setSelectedIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (totalSks > maxSks) {
      setErrorMsg(`Batas SKS Anda (${maxSks} SKS) terlampaui. Total terpilih: ${totalSks} SKS.`)
      return
    }

    if (conflicts.length > 0) {
      setErrorMsg('Terdapat jadwal bentrok. Silakan perbaiki pilihan Anda.')
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
      {/* Page Header */}
      <div>
        <h2 className="demo-title display-title text-2xl md:text-3xl font-bold">
          Rencana Studi Mahasiswa (KRS)
        </h2>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium">
          Pilih mata kuliah yang ingin Anda ambil untuk Semester Genap 2025/2026.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Course Selection Menu */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h3 className="display-title text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--lagoon-deep)]" />
            Daftar Mata Kuliah Tersedia
          </h3>

          <div className="flex flex-col gap-4">
            {availableCourses.map((course) => {
              const isChecked = selectedIds.includes(course.id)
              
              return (
                <div
                  key={course.id}
                  onClick={() => handleToggle(course.id)}
                  className={`demo-card border p-5 cursor-pointer transition-all flex items-start gap-4 ${
                    isChecked
                      ? 'border-[var(--lagoon-deep)] bg-emerald-50/10 shadow-[0_4px_12px_rgba(79,184,178,0.06)]'
                      : 'border-[var(--line)] bg-[var(--surface-strong)] hover:border-[var(--sea-ink-soft)]'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by div onClick
                      className="h-4.5 w-4.5 text-[var(--lagoon-deep)] border-[var(--line)] rounded focus:ring-[var(--lagoon)] cursor-pointer"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wide text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                        {course.kodeMk}
                      </span>
                      <span className="text-xs font-semibold text-[var(--sea-ink-soft)]">
                        Semester {course.semester}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[var(--sea-ink)] mt-2 leading-snug">
                      {course.namaMk}
                    </h4>

                    {/* Schedules inside card */}
                    <div className="mt-3.5 flex flex-col gap-2 pt-3 border-t border-[var(--line)]/50">
                      {course.schedules.map((s: any) => (
                        <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--sea-ink-soft)] font-medium">
                          <span className="bg-white px-2 py-0.5 rounded border border-[var(--line)] font-bold text-[var(--sea-ink)]">
                            {s.hari}, {s.jamMulai.substring(0, 5)} - {s.jamSelesai.substring(0, 5)}
                          </span>
                          <span>Dosen: {s.namaDosen}</span>
                          <span>Ruang: {s.ruangan}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-[var(--sea-ink)]">{course.sks}</span>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">SKS</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: KRS Summary & Submission Panel */}
        <div className="flex flex-col gap-6 sticky top-[90px]">
          <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-5">
            <h3 className="display-title text-base font-bold flex items-center gap-2 pb-3 border-b border-[var(--line)]">
              <Info className="h-4.5 w-4.5 text-[var(--lagoon-deep)]" />
              Ringkasan KRS Anda
            </h3>

            {/* GPA details */}
            <div className="flex justify-between items-center text-xs font-medium text-[var(--sea-ink-soft)]">
              <span>IPK Terakhir Anda</span>
              <span className="font-bold text-[var(--sea-ink)]">{student.ipk.toFixed(2)}</span>
            </div>

            {/* SKS Limit Indicator */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-xs font-semibold text-[var(--sea-ink)]">
                <span>Batas SKS</span>
                <span>{totalSks} / {maxSks} SKS</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-[var(--sand)] rounded-full overflow-hidden border border-[var(--line)]">
                <div
                  style={{ width: `${Math.min((totalSks / maxSks) * 100, 100)}%` }}
                  className={`h-full transition-all duration-300 ${
                    totalSks > maxSks ? 'bg-red-500' : 'bg-[var(--lagoon-deep)]'
                  }`}
                />
              </div>
            </div>

            {/* Warn if empty */}
            {selectedIds.length === 0 && (
              <div className="border border-[var(--line)] bg-[var(--chip-bg)] px-3.5 py-3 rounded-lg text-xs text-[var(--sea-ink-soft)] font-medium flex gap-2">
                <Info className="h-4.5 w-4.5 text-[var(--sea-ink-soft)] flex-shrink-0" />
                <span>Belum ada mata kuliah yang Anda pilih. Centang kartu kuliah di samping.</span>
              </div>
            )}

            {/* Overload SKS Warning */}
            {totalSks > maxSks && (
              <div className="border border-red-500/20 bg-red-500/5 px-3.5 py-3 rounded-lg text-xs text-red-600 font-semibold flex gap-2 rise-in">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                <span>Total SKS terpilih melebihi batas maksimal {maxSks} SKS. Kurangi pilihan mata kuliah.</span>
              </div>
            )}

            {/* Conflict list */}
            {conflicts.length > 0 && (
              <div className="flex flex-col gap-3 border border-amber-500/20 bg-amber-500/5 px-3.5 py-3 rounded-lg text-xs text-amber-800 font-medium rise-in">
                <div className="flex gap-2 font-bold text-amber-950">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
                  <span>Jadwal Bentrok Terdeteksi!</span>
                </div>
                <div className="flex flex-col gap-2 pl-6.5 font-medium leading-relaxed">
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
              <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 rounded-lg text-xs text-red-600 font-semibold flex gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 rounded-lg text-xs text-emerald-700 font-bold flex gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || totalSks > maxSks || conflicts.length > 0}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-[var(--sand)] bg-[var(--sea-ink)] hover:bg-[var(--sea-ink-soft)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                'Menyimpan...'
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
