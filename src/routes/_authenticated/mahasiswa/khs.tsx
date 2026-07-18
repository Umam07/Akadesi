import { createFileRoute } from '@tanstack/react-router'
import { getKhsData } from '../../../server/functions/academicFn'
import { useState, useMemo, useEffect } from 'react'
import { Award, BookOpen, ChevronDown, CheckCircle, TrendingUp } from 'lucide-react'
import { IpsChart } from '../../../components/charts/IpsChart'
import { GraduationRadialChart } from '../../../components/charts/GraduationRadialChart'

export const Route = createFileRoute('/_authenticated/mahasiswa/khs')({
  loader: async () => {
    return await getKhsData()
  },
  component: KhsPage,
})

const SKS_GRADUATION_TARGET = 144

// Grade badge config
const GRADE_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  A:  { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  'A-': { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  'B+': { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  B:  { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  'B-': { bg: '#e0f2fe', text: '#075985', border: '#bae6fd' },
  'C+': { bg: '#fef9c3', text: '#713f12', border: '#fef08a' },
  C:  { bg: '#fef9c3', text: '#713f12', border: '#fef08a' },
  'C-': { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
  D:  { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  E:  { bg: '#fce7f3', text: '#831843', border: '#fbcfe8' },
}

function GradeBadge({ grade, bobot }: { grade: string; bobot: number }) {
  const cfg = GRADE_CONFIG[grade] ?? {
    bg: bobot >= 3.0 ? '#dcfce7' : bobot >= 2.0 ? '#fef9c3' : '#fee2e2',
    text: bobot >= 3.0 ? '#166534' : bobot >= 2.0 ? '#713f12' : '#991b1b',
    border: bobot >= 3.0 ? '#bbf7d0' : bobot >= 2.0 ? '#fef08a' : '#fecaca',
  }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        letterSpacing: '0.04em',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {grade}
    </span>
  )
}

function KhsPage() {
  const { khsBySemester, cumulativeStats } = Route.useLoaderData()

  const [selectedSemester, setSelectedSemester] = useState('')

  useEffect(() => {
    if (khsBySemester.length > 0) {
      setSelectedSemester(khsBySemester[khsBySemester.length - 1].semesterAjaran)
    }
  }, [khsBySemester])

  const currentSemesterData = useMemo(() => {
    return khsBySemester.find((s) => s.semesterAjaran === selectedSemester)
  }, [selectedSemester, khsBySemester])

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      {/* Page Header */}
      <div>
        <h2 className="demo-title display-title text-2xl md:text-3xl font-bold">
          Hasil Studi &amp; Transkrip
        </h2>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium">
          Pantau riwayat nilai per semester dan progres SKS kumulatif Anda.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* IPK Card */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-5 flex items-center gap-4">
          <div className="bg-emerald-100/60 rounded-xl p-3 text-[var(--palm)] border border-emerald-200 flex-shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">IPK Kumulatif</span>
            <span className="text-3xl font-extrabold text-[var(--sea-ink)] leading-none mt-1 block">
              {cumulativeStats.ipk.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-[var(--palm)] mt-0.5 block">
              {cumulativeStats.ipk >= 3.5 ? 'Cumlaude' : cumulativeStats.ipk >= 3.0 ? 'Sangat Memuaskan' : cumulativeStats.ipk >= 2.75 ? 'Memuaskan' : 'Cukup'}
            </span>
          </div>
        </div>

        {/* SKS Lulus + total semesters */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-5 flex items-center gap-4">
          <div className="bg-[var(--sand)] rounded-xl p-3 text-[var(--sea-ink)] border border-[var(--line)] flex-shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">SKS Lulus</span>
            <span className="text-3xl font-extrabold text-[var(--sea-ink)] leading-none mt-1 block">
              {cumulativeStats.totalSksLulus}
            </span>
            <span className="text-xs font-semibold text-[var(--sea-ink-soft)] mt-0.5 block">
              dari {SKS_GRADUATION_TARGET} SKS target
            </span>
          </div>
        </div>

        {/* Total Semester */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-5 flex items-center gap-4">
          <div className="bg-[var(--sand)] rounded-xl p-3 text-[var(--sea-ink)] border border-[var(--line)] flex-shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Semester Ditempuh</span>
            <span className="text-3xl font-extrabold text-[var(--sea-ink)] leading-none mt-1 block">
              {khsBySemester.length}
            </span>
            <span className="text-xs font-semibold text-[var(--sea-ink-soft)] mt-0.5 block">
              semester akademik
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* IPS per Semester Chart (spans 2 cols) */}
        <div className="lg:col-span-2 demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-4">
          <div>
            <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
              Perkembangan IPS per Semester
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
              Bar = IPS semester · Garis = tren · Garis putus = batas predikat (3.5, 3.0, 2.0)
            </p>
          </div>
          {khsBySemester.length > 0 ? (
            <IpsChart data={khsBySemester} />
          ) : (
            <div className="flex items-center justify-center h-48 text-[var(--sea-ink-soft)] text-sm font-medium">
              Belum ada data KHS.
            </div>
          )}
        </div>

        {/* Graduation Radial Chart */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-2">
          <div>
            <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
              Progres Kelulusan
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
              SKS lulus / target kelulusan
            </p>
          </div>
          <GraduationRadialChart
            totalSksLulus={cumulativeStats.totalSksLulus}
            targetSks={SKS_GRADUATION_TARGET}
          />
        </div>
      </div>

      {/* Semester KHS Viewer */}
      <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-6">

        {/* Semester Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
              Kartu Hasil Studi (KHS)
            </h3>
            <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
              Pilih semester untuk melihat rincian nilai mata kuliah.
            </p>
          </div>

          <div className="relative min-w-[210px]">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="appearance-none block w-full px-4 py-2.5 pr-10 border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] rounded-xl focus:outline-none focus:border-[var(--sea-ink)] text-sm font-semibold cursor-pointer"
            >
              <option value="" disabled>Pilih Semester</option>
              {khsBySemester.map((sem) => (
                <option key={sem.semesterAjaran} value={sem.semesterAjaran}>
                  {sem.semesterAjaran}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--sea-ink-soft)]">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Grades Table */}
        {currentSemesterData ? (
          <div className="flex flex-col gap-5">
            {/* Semester summary pills */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--sand)] text-[var(--sea-ink)] border border-[var(--chip-line)]">
                IPS Semester: <strong>{currentSemesterData.ips.toFixed(2)}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--sand)] text-[var(--sea-ink)] border border-[var(--chip-line)]">
                Total SKS: <strong>{currentSemesterData.totalSks}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--sand)] text-[var(--sea-ink)] border border-[var(--chip-line)]">
                Mata Kuliah: <strong>{currentSemesterData.courses.length}</strong>
              </span>
            </div>

            {/* Table */}
            <div className="demo-table-shell">
              <table className="demo-table">
                <thead>
                  <tr>
                    <th className="w-10 text-center text-[10px] uppercase tracking-wider">No</th>
                    <th className="w-28 text-[10px] uppercase tracking-wider">Kode MK</th>
                    <th className="text-[10px] uppercase tracking-wider">Mata Kuliah</th>
                    <th className="w-16 text-center text-[10px] uppercase tracking-wider">SKS</th>
                    <th className="w-28 text-center text-[10px] uppercase tracking-wider">Nilai</th>
                    <th className="w-20 text-center text-[10px] uppercase tracking-wider">Bobot</th>
                    <th className="w-24 text-center text-[10px] uppercase tracking-wider">Mutu</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemesterData.courses.map((course, index) => (
                    <tr key={course.id} className={index % 2 === 0 ? 'bg-white/30' : ''}>
                      <td className="text-center text-xs font-mono text-[var(--sea-ink-soft)]">
                        {index + 1}
                      </td>
                      <td>
                        <span className="font-mono text-[11px] font-bold text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                          {course.kodeMk}
                        </span>
                      </td>
                      <td className="text-[var(--sea-ink)] font-bold text-sm">
                        {course.namaMk}
                      </td>
                      <td className="text-center font-bold text-sm">{course.sks}</td>
                      <td className="text-center">
                        <GradeBadge grade={course.nilaiHuruf} bobot={course.bobot} />
                      </td>
                      <td className="text-center font-mono text-xs font-bold text-[var(--sea-ink)]">
                        {course.bobot.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <span className="font-mono text-sm font-extrabold text-[var(--lagoon-deep)]">
                          {(course.sks * course.bobot).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Summary rows */}
                  <tr className="border-t-2 border-[var(--line)]" style={{ background: 'rgba(231,240,232,0.4)' }}>
                    <td colSpan={3} className="text-right text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] pr-3">
                      Jumlah SKS Diambil
                    </td>
                    <td className="text-center font-extrabold text-base text-[var(--sea-ink)]">
                      {currentSemesterData.totalSks}
                    </td>
                    <td colSpan={3} />
                  </tr>
                  <tr style={{ background: 'rgba(231,240,232,0.6)' }}>
                    <td colSpan={5} className="text-right text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] pr-3">
                      Indeks Prestasi Semester (IPS)
                    </td>
                    <td colSpan={2} className="text-center">
                      <span className="text-xl font-extrabold text-[var(--lagoon-deep)]">
                        {currentSemesterData.ips.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* IPS Advice */}
            <div className="border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 rounded-xl text-xs font-medium text-[var(--sea-ink-soft)] flex gap-2.5 items-start leading-relaxed">
              <CheckCircle className="h-4.5 w-4.5 text-[var(--palm)] flex-shrink-0 mt-0.5" />
              <span>
                Dengan IPS sebesar <strong className="text-[var(--sea-ink)]">{currentSemesterData.ips.toFixed(2)}</strong> pada semester ini, Anda berhak mengambil beban studi maksimal{' '}
                <strong className="text-[var(--sea-ink)]">
                  {currentSemesterData.ips >= 3.0 ? '24' : currentSemesterData.ips >= 2.5 ? '21' : '18'} SKS
                </strong>{' '}
                di semester berikutnya.
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
