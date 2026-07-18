import { createFileRoute } from '@tanstack/react-router'
import { getKhsData } from '../../../server/functions/academicFn'
import { useState, useMemo, useEffect } from 'react'
import { Award, BookOpen, ChevronDown, CheckCircle, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/khs')({
  loader: async () => {
    return await getKhsData()
  },
  component: KhsPage,
})

const SKS_GRADUATION_TARGET = 144

function KhsPage() {
  const { khsBySemester, cumulativeStats } = Route.useLoaderData()

  // Initialize selected semester to the latest available semester with grades
  const [selectedSemester, setSelectedSemester] = useState('')

  useEffect(() => {
    if (khsBySemester.length > 0) {
      setSelectedSemester(khsBySemester[khsBySemester.length - 1].semesterAjaran)
    }
  }, [khsBySemester])

  // Get current semester's KHS details
  const currentSemesterData = useMemo(() => {
    return khsBySemester.find((s) => s.semesterAjaran === selectedSemester)
  }, [selectedSemester, khsBySemester])

  // Calculate graduation percentage
  const graduationProgressPercent = useMemo(() => {
    return Math.min((cumulativeStats.totalSksLulus / SKS_GRADUATION_TARGET) * 100, 100)
  }, [cumulativeStats.totalSksLulus])

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      {/* Page Header */}
      <div>
        <h2 className="demo-title display-title text-2xl md:text-3xl font-bold">
          Hasil Studi & Transkrip
        </h2>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium">
          Pantau riwayat nilai per semester dan progres SKS kumulatif Anda.
        </p>
      </div>

      {/* Cumulative Stats Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cumulative GPA Card */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-5 flex items-center gap-4.5">
          <div className="bg-emerald-100/60 rounded-xl p-3 text-[var(--palm)] border border-emerald-200">
            <Award className="h-6.5 w-6.5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">IPK Kumulatif</span>
            <span className="text-2xl font-extrabold text-[var(--sea-ink)] leading-none mt-1 block">
              {cumulativeStats.ipk.toFixed(2)}
            </span>
          </div>
        </div>

        {/* SKS Graduation Progress Card */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-5 flex flex-col justify-between gap-3.5 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--sand)] rounded-xl p-2.5 text-[var(--sea-ink)] border border-[var(--line)]">
                <TrendingUp className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Progres Kelulusan</span>
                <span className="text-base font-extrabold text-[var(--sea-ink)] mt-0.5 block">
                  {cumulativeStats.totalSksLulus} / {SKS_GRADUATION_TARGET} SKS Lulus
                </span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-[var(--lagoon-deep)] bg-[var(--sand)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
              {graduationProgressPercent.toFixed(0)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-[var(--sand)] rounded-full overflow-hidden border border-[var(--line)]">
            <div
              style={{ width: `${graduationProgressPercent}%` }}
              className="h-full bg-[var(--lagoon-deep)] transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Semester KHS Viewer */}
      <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-6">
        
        {/* Semester Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
              Kartu Hasil Studi (KHS)
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
              Pilih semester untuk melihat rincian nilai mata kuliah.
            </p>
          </div>

          <div className="relative min-w-[200px]">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="appearance-none block w-full px-4 py-2.5 pr-10 border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] rounded-xl focus:outline-none focus:border-[var(--sea-ink)] text-sm font-semibold cursor-pointer"
            >
              <option value="" disabled>Pilih Semester</option>
              {khsBySemester.map((sem) => (
                <option key={sem.semesterAjaran} value={sem.semesterAjaran}>
                  Semester - {sem.semesterAjaran}
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
          <div className="flex flex-col gap-5">
            <div className="demo-table-shell">
              <table className="demo-table">
                <thead>
                  <tr>
                    <th className="w-12 text-center text-xs">No</th>
                    <th className="w-28 text-xs">Kode MK</th>
                    <th className="text-xs">Mata Kuliah</th>
                    <th className="w-20 text-center text-xs">SKS</th>
                    <th className="w-28 text-center text-xs">Nilai Huruf</th>
                    <th className="w-24 text-center text-xs">Bobot</th>
                    <th className="w-28 text-center text-xs">Nilai SKS</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {currentSemesterData.courses.map((course, index) => (
                    <tr key={course.id}>
                      <td className="text-center text-xs font-mono text-[var(--sea-ink-soft)]">{index + 1}</td>
                      <td className="font-mono text-xs text-[var(--sea-ink-soft)]">{course.kodeMk}</td>
                      <td className="text-[var(--sea-ink)] font-bold">{course.namaMk}</td>
                      <td className="text-center">{course.sks}</td>
                      <td className="text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          course.bobot >= 3.0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : course.bobot >= 2.0
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {course.nilaiHuruf}
                        </span>
                      </td>
                      <td className="text-center text-xs font-mono">{course.bobot.toFixed(2)}</td>
                      <td className="text-center text-xs font-mono font-bold">{(course.sks * course.bobot).toFixed(2)}</td>
                    </tr>
                  ))}
                  
                  {/* Summary Footer Rows */}
                  <tr className="bg-[var(--sand)]/30 font-bold border-t-2 border-[var(--line)]">
                    <td colSpan={3} className="text-right text-xs uppercase tracking-wider text-[var(--sea-ink-soft)] pr-4">
                      Jumlah SKS Diambil
                    </td>
                    <td className="text-center">{currentSemesterData.totalSks}</td>
                    <td colSpan={3}></td>
                  </tr>
                  <tr className="bg-[var(--sand)]/50 font-bold border-t border-[var(--line)]">
                    <td colSpan={3} className="text-right text-xs uppercase tracking-wider text-[var(--sea-ink-soft)] pr-4">
                      Indeks Prestasi Semester (IPS)
                    </td>
                    <td colSpan={3}></td>
                    <td className="text-center text-base font-extrabold text-[var(--sea-ink)]">
                      {currentSemesterData.ips.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* IPS Advice Alert */}
            <div className="border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 rounded-xl text-xs font-medium text-[var(--sea-ink-soft)] flex gap-2.5 items-center leading-relaxed">
              <CheckCircle className="h-5 w-5 text-[var(--palm)] flex-shrink-0" />
              <span>
                Dengan IPS sebesar <strong>{currentSemesterData.ips.toFixed(2)}</strong> pada semester ini, Anda berhak mengambil beban studi maksimal <strong>{currentSemesterData.ips >= 3.0 ? '24' : currentSemesterData.ips >= 2.5 ? '21' : '18'} SKS</strong> di semester berikutnya.
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
