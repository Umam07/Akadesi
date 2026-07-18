import { createFileRoute, Link } from '@tanstack/react-router'
import { getDashboardData } from '../../../server/functions/academicFn'
import { BookOpen, Calendar, Clock, Bell, TrendingUp, ChevronRight } from 'lucide-react'
import { IpsChart } from '../../../components/charts/IpsChart'

export const Route = createFileRoute('/_authenticated/mahasiswa/dashboard')({
  loader: async () => {
    return await getDashboardData()
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { student, todaySchedule, announcements, todayDayName, ipsTrend } = Route.useLoaderData()

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">

      {/* Welcome & Profile Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[#173a40] to-[#25525a] p-6 md:p-8 text-white shadow-lg animate-fade-in">
        {/* Decorative background glow blurs */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#4fb8b2]/20 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[#2f6a4a]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Monogram Avatar */}
            <div className="flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4fb8b2] to-[#328f97] text-xl md:text-2xl font-extrabold text-white shadow-inner border border-white/20 select-none">
              {getInitials(student.nama)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mahasiswa Aktif
                </span>
                <span className="text-xs text-white/70 font-semibold tracking-wide bg-white/10 px-2 py-0.5 rounded">
                  NIM {student.nim}
                </span>
              </div>

              <h2 className="display-title mt-2.5 text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                Selamat datang kembali, {student.nama.split(' ')[0]}!
              </h2>

              <p className="mt-1 text-sm text-[#b8dbdf] font-medium">
                {student.jurusan} • {student.fakultas}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid inside Hero */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 w-full xl:w-auto">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-3 py-3 sm:px-6 sm:py-4 text-center transition-all hover:bg-white/10 hover:scale-[1.02] shadow-sm">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#aed3d8]">Semester</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">{student.semesterAktif}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-3 py-3 sm:px-6 sm:py-4 text-center transition-all hover:bg-white/10 hover:scale-[1.02] shadow-sm">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#aed3d8]">IPK Kumulatif</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">{student.ipk.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 px-3 py-3 sm:px-6 sm:py-4 text-center transition-all hover:bg-white/10 hover:scale-[1.02] shadow-sm">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[#aed3d8]">SKS Lulus</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">{student.totalSksLulus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* IPS Trend Chart Panel */}
      {ipsTrend.length > 0 && (
        <div className="demo-panel border border-[var(--line)] bg-gradient-to-b from-[var(--surface-strong)] to-[var(--surface)] p-6 flex flex-col gap-5 transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--sand)] text-[var(--lagoon-deep)]">
                  <TrendingUp className="h-4.5 w-4.5" />
                </span>
                <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
                  Indeks Prestasi Semester (IPS)
                </h3>
              </div>
              <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-1 ml-10">
                Visualisasi grafik pencapaian IPS akademik Anda per semester aktif.
              </p>
            </div>
            <Link
              to="/mahasiswa/khs"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-[var(--lagoon-deep)] hover:bg-[var(--sand)] border border-transparent hover:border-[var(--line)] transition-all ml-10 sm:ml-0"
            >
              Lihat KHS Lengkap
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-[var(--line)]/50">
            <IpsChart data={ipsTrend} />
          </div>
        </div>
      )}

      {/* Main Grid: Schedule + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Today's Schedule (2 cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--sand)] text-[var(--lagoon-deep)]">
                <Calendar className="h-4.5 w-4.5" />
              </span>
              <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
                Jadwal Hari Ini ({todayDayName})
              </h3>
            </div>
            <Link
              to="/mahasiswa/jadwal"
              className="text-xs font-bold text-[var(--lagoon-deep)] hover:underline flex items-center gap-1"
            >
              Lihat Jadwal Mingguan
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {todaySchedule.length > 0 ? (
            <div className="flex flex-col gap-4">
              {todaySchedule.map((classItem) => (
                <div
                  key={classItem.id}
                  className="demo-card border-l-4 border-l-[var(--lagoon-deep)] border-y border-r border-[var(--line)] hover:border-r-[var(--lagoon-deep)] hover:border-y-[var(--lagoon-deep)] bg-gradient-to-r from-white/90 to-white/70 hover:from-white hover:to-white transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-[var(--sand)] rounded-xl p-3 text-[var(--lagoon-deep)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <BookOpen className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lagoon-deep)] bg-[var(--sand)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                          {classItem.kodeMk}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--sea-ink-soft)] bg-slate-100/80 px-2 py-0.5 rounded">
                          {classItem.sks} SKS
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[var(--sea-ink)] mt-2.5 leading-snug group-hover:text-[var(--lagoon-deep)] transition-colors duration-200">
                        {classItem.namaMk}
                      </h4>
                      <p className="text-xs font-medium text-[var(--sea-ink-soft)] mt-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--sea-ink-soft)]/40" />
                        Dosen: {classItem.namaDosen}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--line)]/50">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--sea-ink)]">
                      <Clock className="h-4 w-4 text-[var(--lagoon-deep)]" />
                      <span>{classItem.jamMulai.substring(0, 5)} - {classItem.jamSelesai.substring(0, 5)}</span>
                    </div>
                    <span className="text-xs font-extrabold text-[var(--palm)] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Ruang: {classItem.ruangan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/20 rounded-2xl text-center py-12 px-6 bg-white/30 backdrop-blur-sm">
              <div className="h-14 w-14 rounded-full bg-[var(--sand)] text-[var(--sea-ink-soft)]/60 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-[var(--sea-ink)] text-base">Tidak ada jadwal kuliah hari ini</h4>
              <p className="text-xs text-[var(--sea-ink-soft)] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Hari ini Anda bebas dari jadwal kelas perkuliahan. Nikmati waktu istirahat atau manfaatkan waktu untuk belajar mandiri!
              </p>
            </div>
          )}
        </div>

        {/* Announcements (1 col wide) */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--sand)] text-[var(--lagoon-deep)]">
                <Bell className="h-4.5 w-4.5" />
              </span>
              <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
                Pengumuman Baru
              </h3>
            </div>
            <Link
              to="/mahasiswa/pengumuman"
              className="text-xs font-bold text-[var(--lagoon-deep)] hover:underline flex items-center gap-1"
            >
              Semua
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`demo-card border transition-all duration-200 flex flex-col justify-between gap-3.5 p-5 relative shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                    !ann.read
                      ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent'
                      : 'border-[var(--line)] bg-[var(--surface-strong)]'
                  }`}
                >
                  {/* Unread badge/dot */}
                  {!ann.read && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                        Baru
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="block text-[10px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wide">
                      {formatDate(ann.diterbitkanPada)}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--sea-ink)] mt-2 leading-snug line-clamp-2 pr-12">
                      {ann.judul}
                    </h4>
                    <p className="text-xs text-[var(--sea-ink-soft)] mt-2 leading-relaxed line-clamp-3">
                      {ann.isi}
                    </p>
                  </div>

                  <div className="border-t border-[var(--line)]/50 pt-3.5 flex justify-end">
                    <Link
                      to="/mahasiswa/pengumuman"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lagoon-deep)] hover:text-[#246f76] transition-colors"
                    >
                      Baca Selengkapnya
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/20 rounded-2xl text-center py-8 px-4 bg-white/20">
                <Bell className="h-7 w-7 text-[var(--sea-ink-soft)]/30 mx-auto mb-2" />
                <h5 className="font-bold text-[var(--sea-ink)] text-xs">Tidak ada pengumuman baru</h5>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
