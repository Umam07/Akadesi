import { createFileRoute, Link } from '@tanstack/react-router'
import { getDashboardData } from '../../../server/functions/academicFn'
import { BookOpen, Calendar, Clock, Bell, CheckCircle, TrendingUp } from 'lucide-react'
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

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">

      {/* Welcome & Profile Summary */}
      <div className="demo-panel flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="demo-title display-title text-2xl md:text-3xl font-bold">
              Selamat datang, {student.nama}!
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50/60 text-emerald-700 border border-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Mahasiswa Aktif
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium">
            Program Studi Teknik Informatika — NIM {student.nim}
          </p>
        </div>

        {/* Academics Stats Mini Cards */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Semester</span>
            <span className="text-xl font-extrabold text-[var(--sea-ink)]">{student.semesterAktif}</span>
          </div>
          <div className="flex-1 md:flex-none border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">IPK Kumulatif</span>
            <span className="text-xl font-extrabold text-[var(--sea-ink)]">{student.ipk.toFixed(2)}</span>
          </div>
          <div className="flex-1 md:flex-none border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 rounded-xl text-center min-w-[100px]">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">SKS Lulus</span>
            <span className="text-xl font-extrabold text-[var(--sea-ink)]">{student.totalSksLulus} SKS</span>
          </div>
        </div>
      </div>

      {/* IPS Trend Mini Chart */}
      {ipsTrend.length > 0 && (
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="display-title text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--lagoon-deep)]" />
                Tren IPS Akademik
              </h3>
              <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
                Perkembangan indeks prestasi semester Anda dari waktu ke waktu.
              </p>
            </div>
            <Link
              to="/mahasiswa/khs"
              className="text-xs font-bold text-[var(--lagoon-deep)] hover:underline flex items-center gap-1"
            >
              Lihat KHS Lengkap →
            </Link>
          </div>
          <IpsChart data={ipsTrend} />
        </div>
      )}

      {/* Main Grid: Schedule + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Today's Schedule (2 cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="display-title text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--lagoon-deep)]" />
              Jadwal Kuliah Hari Ini ({todayDayName})
            </h3>
            <Link
              to="/mahasiswa/jadwal"
              className="text-xs font-bold text-[var(--lagoon-deep)] hover:underline flex items-center gap-1"
            >
              Lihat Jadwal Mingguan &rarr;
            </Link>
          </div>

          {todaySchedule.length > 0 ? (
            <div className="flex flex-col gap-4">
              {todaySchedule.map((classItem) => (
                <div
                  key={classItem.id}
                  className="demo-card border border-[var(--line)] hover:border-[var(--lagoon-deep)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-[var(--sand)] rounded-xl p-3 text-[var(--sea-ink)] flex items-center justify-center">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wide text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                          {classItem.kodeMk}
                        </span>
                        <span className="text-xs font-semibold text-[var(--sea-ink-soft)]">
                          {classItem.sks} SKS
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[var(--sea-ink)] mt-1.5 leading-snug">
                        {classItem.namaMk}
                      </h4>
                      <p className="text-xs font-medium text-[var(--sea-ink-soft)] mt-1">
                        Dosen: {classItem.namaDosen}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--line)]">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--sea-ink)]">
                      <Clock className="h-4 w-4 text-[var(--lagoon-deep)]" />
                      <span>{classItem.jamMulai.substring(0, 5)} - {classItem.jamSelesai.substring(0, 5)}</span>
                    </div>
                    <span className="text-xs font-bold text-[var(--sea-ink-soft)] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      Ruang: {classItem.ruangan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/30 rounded-xl text-center py-12 px-6 bg-white/40">
              <Calendar className="h-10 w-10 text-[var(--sea-ink-soft)]/40 mx-auto mb-3" />
              <h4 className="font-bold text-[var(--sea-ink)] text-base">Tidak ada jadwal kuliah hari ini</h4>
              <p className="text-xs text-[var(--sea-ink-soft)] mt-1 max-w-sm mx-auto leading-relaxed">
                Hari ini Anda bebas dari jadwal perkuliahan kelas. Nikmati waktu istirahat Anda atau pelajari materi perkuliahan secara mandiri!
              </p>
            </div>
          )}
        </div>

        {/* Announcements (1 col wide) */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="display-title text-xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-[var(--lagoon-deep)]" />
              Pengumuman Baru
            </h3>
            <Link
              to="/mahasiswa/pengumuman"
              className="text-xs font-bold text-[var(--lagoon-deep)] hover:underline"
            >
              Semua &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="demo-card border border-[var(--line)] bg-[var(--surface-strong)] flex flex-col justify-between gap-3.5 p-5 relative"
                >
                  {/* Unread dot */}
                  {!ann.read && (
                    <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  )}

                  <div>
                    <span className="block text-[10px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wide">
                      {formatDate(ann.diterbitkanPada)}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--sea-ink)] mt-1.5 leading-snug line-clamp-2">
                      {ann.judul}
                    </h4>
                    <p className="text-xs text-[var(--sea-ink-soft)] mt-2 leading-relaxed line-clamp-3">
                      {ann.isi}
                    </p>
                  </div>

                  <div className="border-t border-[var(--line)] pt-3 flex justify-end">
                    <Link
                      to="/mahasiswa/pengumuman"
                      className="text-xs font-bold text-[var(--lagoon-deep)] hover:underline flex items-center gap-1"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/30 rounded-xl text-center py-8 px-4 bg-white/40">
                <Bell className="h-8 w-8 text-[var(--sea-ink-soft)]/40 mx-auto mb-2.5" />
                <h5 className="font-bold text-[var(--sea-ink)] text-sm">Tidak ada pengumuman baru</h5>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
