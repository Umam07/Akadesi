import { createFileRoute, Link } from '@tanstack/react-router'
import { getDashboardData } from '../../../server/functions/academicFn'
import {
  BookOpen,
  Calendar,
  Clock,
  Bell,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  Award,
  FileText,
  CreditCard,
  MapPin,
  User,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Layers,
} from 'lucide-react'
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

  const getIpkPredicate = (ipk: number) => {
    if (ipk >= 3.5) return 'Cumlaude'
    if (ipk >= 3.0) return 'Sangat Memuaskan'
    if (ipk >= 2.75) return 'Memuaskan'
    if (ipk >= 2.0) return 'Cukup'
    return 'Kurang'
  }

  const sksTarget = 144
  const sksProgress = Math.min(100, Math.round((student.totalSksLulus / sksTarget) * 100))

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Quick Action Shortcuts
  const quickActions = [
    {
      title: 'KRS Online',
      subtitle: 'Rencana Studi Semester',
      icon: FileText,
      href: '/mahasiswa/krs',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      badge: 'Aktif',
    },
    {
      title: 'KHS & Transkrip',
      subtitle: 'Nilai & IPS Akademik',
      icon: Award,
      href: '/mahasiswa/khs',
      color: 'from-cyan-500/10 to-blue-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
      badge: 'Hasil',
    },
    {
      title: 'Jadwal Perkuliahan',
      subtitle: 'Jadwal Mingguan Kelas',
      icon: Calendar,
      href: '/mahasiswa/jadwal',
      color: 'from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      badge: todayDayName,
    },
    {
      title: 'Keuangan & UKT',
      subtitle: 'Status Pembayaran',
      icon: CreditCard,
      href: '/mahasiswa/keuangan',
      color: 'from-teal-500/10 to-emerald-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
      badge: 'UKT',
    },
  ]

  // Calculate highest IPS
  const maxIps = ipsTrend.length > 0 ? Math.max(...ipsTrend.map((t) => t.ips)) : 0
  const latestIps = ipsTrend.length > 0 ? ipsTrend[ipsTrend.length - 1].ips : student.ipk

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-6 md:gap-8 w-full rise-in pb-12">
      {/* Hero Welcome & Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[#14383e] via-[#1a444c] to-[#255760] p-6 sm:p-8 md:p-10 text-white shadow-xl">
        {/* Glowing Background Blur Details */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#4fb8b2]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-[#2f6a4a]/25 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          {/* Left Student Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Monogram Avatar with Ring Accent */}
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4fb8b2] via-[#328f97] to-[#1f6870] text-2xl sm:text-3xl font-extrabold text-white shadow-lg border border-white/20 select-none">
                {getInitials(student.nama)}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#14383e] text-white shadow-sm" title="Status Aktif">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            {/* Info Text */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Mahasiswa Aktif
                </span>
                <span className="text-xs font-mono font-semibold text-white/80 bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                  NIM {student.nim}
                </span>
                <span className="text-xs font-medium text-white/70 bg-black/20 px-2.5 py-1 rounded-md hidden sm:inline-block">
                  {todayFormatted}
                </span>
              </div>

              <div>
                <h2 className="display-title text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white">
                  Selamat Datang, {student.nama.split(' ')[0]}!
                </h2>
                <p className="mt-1 text-sm sm:text-base text-[#bde0e5] font-medium flex items-center gap-2 flex-wrap">
                  <GraduationCap className="h-4 w-4 shrink-0 text-[#4fb8b2]" />
                  <span>{student.jurusan}</span>
                  <span className="text-white/40">•</span>
                  <span>{student.fakultas}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards inside Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 shrink-0 w-full xl:w-auto">
            {/* Semester Aktif */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 transition-all hover:bg-white/15 hover:scale-[1.02] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#aed3d8]">Semester</span>
                <span className="p-1 rounded-lg bg-white/10 text-white">
                  <Layers className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{student.semesterAktif}</span>
                <span className="text-xs font-medium text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Genap
                </span>
              </div>
            </div>

            {/* IPK Kumulatif */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 transition-all hover:bg-white/15 hover:scale-[1.02] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#aed3d8]">IPK Kumulatif</span>
                <span className="p-1 rounded-lg bg-amber-400/20 text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{student.ipk.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded uppercase">
                    {getIpkPredicate(student.ipk)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total SKS Lulus & Progress */}
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 transition-all hover:bg-white/15 hover:scale-[1.02] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#aed3d8]">SKS Lulus</span>
                <span className="text-[11px] font-mono font-bold text-emerald-300">{sksProgress}%</span>
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{student.totalSksLulus}</span>
                  <span className="text-xs text-[#aed3d8]">/ {sksTarget} SKS</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-[#4fb8b2] h-full rounded-full transition-all duration-500"
                    style={{ width: `${sksProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {quickActions.map((action, idx) => {
          const IconComp = action.icon
          return (
            <Link
              key={idx}
              to={action.href}
              className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[var(--lagoon-deep)]/40 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                  <IconComp className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--sand)] text-[var(--sea-ink-soft)] px-2 py-0.5 rounded-md border border-[var(--chip-line)]">
                  {action.badge}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)] transition-colors flex items-center gap-1">
                  {action.title}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--lagoon-deep)]" />
                </h3>
                <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5 line-clamp-1 font-medium">
                  {action.subtitle}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* IPS Trend Performance Chart Panel */}
      {ipsTrend.length > 0 && (
        <div className="demo-panel rounded-2xl border border-[var(--line)] bg-gradient-to-b from-[var(--surface-strong)] to-[var(--surface)] p-5 sm:p-7 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)]/60 pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--sand)] to-[#d5e6d8] text-[var(--lagoon-deep)] shrink-0 border border-[var(--chip-line)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="display-title text-lg sm:text-xl font-bold text-[var(--sea-ink)]">
                  Tren Indeks Prestasi Semester (IPS)
                </h3>
                <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
                  Rekapitulasi pencapaian indeks prestasi akademik mahasiswa per semester.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="hidden md:flex items-center gap-4 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/60 border border-[var(--line)]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--sea-ink-soft)]">IPS Terakhir:</span>
                  <span className="font-bold text-[var(--sea-ink)]">{latestIps.toFixed(2)}</span>
                </div>
                <div className="h-3 w-px bg-[var(--line)]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--sea-ink-soft)]">Tertinggi:</span>
                  <span className="font-bold text-emerald-700">{maxIps.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/mahasiswa/khs"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[var(--lagoon-deep)] bg-[var(--sand)] hover:bg-[#d8e8dc] border border-[var(--chip-line)] transition-all shrink-0"
              >
                KHS Lengkap
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-[var(--line)]/60">
            <IpsChart data={ipsTrend} />
          </div>
        </div>
      )}

      {/* Main Grid: Today's Schedule (2 cols) & Announcements (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Today's Schedule (2 cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--sand)] text-[var(--lagoon-deep)] border border-[var(--chip-line)]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
                  Jadwal Kuliah Hari Ini ({todayDayName})
                </h3>
                <span className="text-xs text-[var(--sea-ink-soft)] font-medium">
                  {todaySchedule.length} perkuliahan terjadwal hari ini
                </span>
              </div>
            </div>

            <Link
              to="/mahasiswa/jadwal"
              className="text-xs font-bold text-[var(--lagoon-deep)] hover:text-[#21656b] inline-flex items-center gap-1 bg-[var(--sand)]/80 hover:bg-[var(--sand)] px-3 py-1.5 rounded-lg border border-[var(--chip-line)] transition-all"
            >
              Jadwal Mingguan
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {todaySchedule.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {todaySchedule.map((classItem) => (
                <div
                  key={classItem.id}
                  className="demo-card border-l-4 border-l-[var(--lagoon-deep)] border-y border-r border-[var(--line)] hover:border-r-[var(--lagoon-deep)] hover:border-y-[var(--lagoon-deep)] bg-gradient-to-r from-white/95 via-white/85 to-white/75 hover:from-white hover:to-white transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-2xl group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-[var(--sand)] to-[#d4e6d8] rounded-2xl p-3.5 text-[var(--lagoon-deep)] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border border-[var(--chip-line)]">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lagoon-deep)] bg-[var(--sand)] px-2.5 py-0.5 rounded-md border border-[var(--chip-line)]">
                          {classItem.kodeMk}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--sea-ink-soft)] bg-slate-100/90 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                          {classItem.sks} SKS
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[var(--sea-ink)] mt-2 leading-snug group-hover:text-[var(--lagoon-deep)] transition-colors duration-200">
                        {classItem.namaMk}
                      </h4>
                      <p className="text-xs font-medium text-[var(--sea-ink-soft)] mt-1.5 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[var(--sea-ink-soft)]/70 shrink-0" />
                        <span>Dosen: {classItem.namaDosen}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--line)]/50 shrink-0">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--sea-ink)] bg-[var(--foam)] px-3 py-1.5 rounded-xl border border-[var(--line)]">
                      <Clock className="h-4 w-4 text-[var(--lagoon-deep)] shrink-0" />
                      <span className="font-mono">
                        {classItem.jamMulai.substring(0, 5)} - {classItem.jamSelesai.substring(0, 5)}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-[var(--palm)] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      Ruang {classItem.ruangan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/25 rounded-2xl text-center py-12 px-6 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-2xl bg-[var(--sand)] text-[var(--lagoon-deep)] flex items-center justify-center mb-4 border border-[var(--chip-line)] shadow-inner">
                <Calendar className="h-8 w-8 opacity-80" />
              </div>
              <h4 className="font-bold text-[var(--sea-ink)] text-base sm:text-lg">
                Tidak ada perkuliahan hari {todayDayName}
              </h4>
              <p className="text-xs sm:text-sm text-[var(--sea-ink-soft)] mt-1.5 max-w-md mx-auto leading-relaxed">
                Hari ini Anda bebas dari jadwal kelas. Manfaatkan waktu ini untuk belajar mandiri, persiapan tugas, atau beristirahat!
              </p>
              <Link
                to="/mahasiswa/jadwal"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[var(--lagoon-deep)] bg-[var(--sand)] hover:bg-[#d8e8dc] border border-[var(--chip-line)] transition-all"
              >
                Lihat Jadwal Lengkap
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Latest Announcements (1 col wide) */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[var(--sand)] text-[var(--lagoon-deep)] border border-[var(--chip-line)]">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="display-title text-lg font-bold text-[var(--sea-ink)]">
                Pengumuman Kampus
              </h3>
            </div>
            <Link
              to="/mahasiswa/pengumuman"
              className="text-xs font-bold text-[var(--lagoon-deep)] hover:text-[#21656b] inline-flex items-center gap-1 bg-[var(--sand)]/80 hover:bg-[var(--sand)] px-3 py-1.5 rounded-lg border border-[var(--chip-line)] transition-all"
            >
              Semua
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3.5">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`demo-card border transition-all duration-200 flex flex-col justify-between gap-3.5 p-5 relative shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-2xl ${
                    !ann.read
                      ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent'
                      : 'border-[var(--line)] bg-[var(--surface-strong)]'
                  }`}
                >
                  {/* Unread Indicator Badge */}
                  {!ann.read && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/60">
                        Baru
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="block text-[10px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">
                      {formatDate(ann.diterbitkanPada)}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--sea-ink)] mt-2 leading-snug line-clamp-2 pr-12">
                      {ann.judul}
                    </h4>
                    <p className="text-xs text-[var(--sea-ink-soft)] mt-2 leading-relaxed line-clamp-3">
                      {ann.isi}
                    </p>
                  </div>

                  <div className="border-t border-[var(--line)]/50 pt-3 flex items-center justify-end">
                    <Link
                      to="/mahasiswa/pengumuman"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lagoon-deep)] hover:text-[#21656b] group"
                    >
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/25 rounded-2xl text-center py-10 px-4 bg-white/30 backdrop-blur-sm flex flex-col items-center">
                <Bell className="h-8 w-8 text-[var(--sea-ink-soft)]/40 mb-2" />
                <h5 className="font-bold text-[var(--sea-ink)] text-xs sm:text-sm">Tidak ada pengumuman baru</h5>
                <p className="text-[11px] text-[var(--sea-ink-soft)] mt-1">Pengumuman terbaru dari kampus akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
