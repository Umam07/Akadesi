import { createFileRoute } from '@tanstack/react-router'
import { getJadwalData, type ExamScheduleItem, type AcademicMilestone } from '../../../server/functions/academicFn'
import { useState, useMemo } from 'react'
import { 
  MapPin, 
  Sunrise, 
  Sun, 
  Sunset, 
  Sparkles, 
  LayoutGrid, 
  List, 
  ExternalLink,
  BookOpenCheck,
  CalendarDays,
  FileText,
  GraduationCap,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Armchair,
  FileCheck2,
  BadgeInfo,
  CalendarRange,
  Milestone,
  Check,
  Flame,
  Download,
  CalendarCheck2
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/jadwal')({
  loader: async () => {
    return await getJadwalData()
  },
  component: JadwalPage,
})

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

// Helper to determine time slot theme for daily routine schedule
function getTimeSlotDetails(startTimeStr: string) {
  if (!startTimeStr) return { type: 'Pagi', icon: Sunrise, colorClass: 'text-amber-500 border-amber-200/50 bg-amber-50', cardClass: 'border-l-4 border-l-amber-500 bg-gradient-to-br from-white/80 to-amber-50/10' }
  
  const hour = parseInt(startTimeStr.split(':')[0])
  if (hour < 11) {
    return {
      type: 'Pagi',
      icon: Sunrise,
      colorClass: 'text-amber-600 border-amber-200/50 bg-amber-50/70',
      cardClass: 'border-l-4 border-l-amber-500 bg-gradient-to-br from-white/95 to-amber-50/10'
    }
  } else if (hour < 15) {
    return {
      type: 'Siang',
      icon: Sun,
      colorClass: 'text-[var(--lagoon-deep)] border-[var(--chip-line)] bg-[var(--foam)]',
      cardClass: 'border-l-4 border-l-[var(--lagoon-deep)] bg-gradient-to-br from-white/95 to-[var(--foam)]/30'
    }
  } else {
    return {
      type: 'Sore',
      icon: Sunset,
      colorClass: 'text-indigo-600 border-indigo-200/50 bg-indigo-50/70',
      cardClass: 'border-l-4 border-l-indigo-500 bg-gradient-to-br from-white/95 to-indigo-50/10'
    }
  }
}

// Helper to generate deterministic lecturer avatar color
function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % 5
  const colors = [
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-sky-100 text-sky-800 border-sky-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-violet-100 text-violet-800 border-violet-200',
    'bg-rose-100 text-rose-800 border-rose-200'
  ]
  return colors[index]
}

function JadwalPage() {
  const loaderData = Route.useLoaderData()
  const { schedule, utsSchedule = [], uasSchedule = [], kalenderAkademik = [], examPeriodInfo } = loaderData

  // Category switch: 'rutin' | 'uts' | 'uas' | 'kalender'
  const [scheduleType, setScheduleType] = useState<'rutin' | 'uts' | 'uas' | 'kalender'>('rutin')

  // Search & Filter for UTS/UAS
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'semua' | 'hari_ini' | 'mendatang' | 'selesai'>('semua')
  
  // Filter for Kalender Akademik
  const [calendarCategory, setCalendarCategory] = useState<'semua' | 'perkuliahan' | 'edom' | 'ujian' | 'administrasi'>('semua')

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Routine schedule state
  const [activeDay, setActiveDay] = useState(() => {
    const todayIndex = new Date().getDay()
    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const todayDayName = indonesianDays[todayIndex]
    return DAYS.includes(todayDayName) ? todayDayName : 'Senin'
  })
  
  const [viewMode, setViewMode] = useState<'harian' | 'mingguan'>('harian')

  // Handle toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Calculate general stats for routine schedule
  const routineStats = useMemo(() => {
    const totalSks = schedule.reduce((sum, item) => sum + item.sks, 0)
    const totalCourses = new Set(schedule.map(item => item.kodeMk)).size
    return { totalSks, totalCourses }
  }, [schedule])

  // Helper to check if a class is currently active (ongoing)
  const isClassOngoing = (day: string, startTimeStr: string, endTimeStr: string) => {
    const todayIndex = new Date().getDay()
    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const todayIndo = indonesianDays[todayIndex]
    
    if (todayIndo.toLowerCase() !== day.toLowerCase()) return false

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const startParts = startTimeStr.split(':')
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1])

    const endParts = endTimeStr.split(':')
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1])

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  }

  // Filter and sort schedule for Daily view
  const sortedDailySchedule = useMemo(() => {
    const filtered = schedule.filter(
      (item) => item.hari.toLowerCase() === activeDay.toLowerCase()
    )
    return [...filtered].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai))
  }, [schedule, activeDay])

  // Group schedule by day for Weekly view
  const groupedWeeklySchedule = useMemo(() => {
    const grouped: Record<string, typeof schedule> = {}
    DAYS.forEach(day => {
      grouped[day] = schedule
        .filter(item => item.hari.toLowerCase() === day.toLowerCase())
        .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai))
    })
    return grouped
  }, [schedule])

  // Count classes for each day
  const classesCountByDay = useMemo(() => {
    const counts: Record<string, number> = {}
    DAYS.forEach(day => {
      counts[day] = schedule.filter(item => item.hari.toLowerCase() === day.toLowerCase()).length
    })
    return counts
  }, [schedule])

  // Filter UTS / UAS schedule based on search and status
  const currentExamSchedule = useMemo(() => {
    const target = scheduleType === 'uts' ? utsSchedule : uasSchedule
    return target.filter(item => {
      const matchSearch = 
        item.namaMk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kodeMk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ruangan.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchStatus = statusFilter === 'semua' || item.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [scheduleType, utsSchedule, uasSchedule, searchQuery, statusFilter])

  // Filtered Academic Calendar
  const filteredKalender = useMemo(() => {
    if (calendarCategory === 'semua') return kalenderAkademik
    return kalenderAkademik.filter(m => m.kategori === calendarCategory)
  }, [kalenderAkademik, calendarCategory])

  // RenderRoutineCard Component
  const renderClassCard = (classItem: typeof schedule[0], showDayBadge = false) => {
    const timeDetails = getTimeSlotDetails(classItem.jamMulai)
    const TimeIcon = timeDetails.icon
    const avatarColor = getAvatarColor(classItem.namaDosen)
    const isOngoing = isClassOngoing(classItem.hari, classItem.jamMulai, classItem.jamSelesai)
    
    const lecturerInitials = classItem.namaDosen
      .split(' ')
      .filter(w => !w.includes('.') && w.length > 0)
      .slice(0, 2)
      .map(w => w[0])
      .join('') || 'DS'

    return (
      <div
        key={classItem.id}
        className={`demo-card relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between gap-4 p-5 border border-[var(--line)]/60 ${timeDetails.cardClass} ${
          isOngoing ? 'ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-[var(--bg-base)]' : ''
        }`}
      >
        {isOngoing && (
          <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wider flex items-center gap-1.5 uppercase border border-emerald-400 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            Sedang Berlangsung
          </div>
        )}

        <div>
          {/* Top meta tags */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wide text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                {classItem.kodeMk}
              </span>
              {showDayBadge && (
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--sea-ink)] bg-[var(--sand)] px-2 py-0.5 rounded border border-[var(--line)]">
                  {classItem.hari}
                </span>
              )}
            </div>
            
            <span className="text-xs font-bold text-[var(--sea-ink)] bg-white/70 px-2 py-1 rounded border border-[var(--line)]/50">
              {classItem.sks} SKS
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-extrabold text-[var(--sea-ink)] mt-3 leading-snug tracking-tight">
            {classItem.namaMk}
          </h3>

          {/* Details (Dosen & Ruang) */}
          <div className="mt-4 flex flex-col gap-3">
            {/* Lecturer row */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${avatarColor}`}>
                {lecturerInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Dosen Pengampu</span>
                <span className="text-xs font-semibold text-[var(--sea-ink)] truncate">{classItem.namaDosen}</span>
              </div>
            </div>

            {/* Room row */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[var(--sea-ink-soft)] shrink-0">
                <MapPin className="h-4 w-4 text-[var(--lagoon-deep)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Lokasi / Ruang</span>
                <span className="text-xs font-semibold text-[var(--sea-ink)]">{classItem.ruangan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="border-t border-[var(--line)]/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${timeDetails.colorClass}`}>
              <TimeIcon className="h-3.5 w-3.5" />
              {timeDetails.type}
            </span>
            <span className="text-sm font-black text-[var(--sea-ink)]">
              {classItem.jamMulai.substring(0, 5)} - {classItem.jamSelesai.substring(0, 5)}
            </span>
          </div>

          <div className="flex items-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--line)]/20 justify-end">
            <button 
              title="Bahan Kuliah"
              className="p-2 text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)] hover:bg-[var(--sand)]/50 rounded-lg transition-colors cursor-pointer"
            >
              <BookOpenCheck className="h-4 w-4" />
            </button>
            <button 
              title="Akses Kelas Online"
              className="p-2 text-[var(--sea-ink-soft)] hover:text-[var(--lagoon-deep)] hover:bg-[var(--sand)]/50 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render Exam Card (UTS / UAS)
  const renderExamCard = (exam: ExamScheduleItem) => {
    let sifatStyle = 'bg-slate-100 text-slate-700 border-slate-200'
    if (exam.sifatUjian === 'Tutup Buku') {
      sifatStyle = 'bg-rose-50 text-rose-700 border-rose-200'
    } else if (exam.sifatUjian === 'Buka Buku') {
      sifatStyle = 'bg-sky-50 text-sky-700 border-sky-200'
    } else if (exam.sifatUjian === 'Praktikum') {
      sifatStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200'
    } else if (exam.sifatUjian === 'Take Home') {
      sifatStyle = 'bg-amber-50 text-amber-700 border-amber-200'
    }

    let statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
        <Clock className="h-3 w-3 text-sky-500" />
        Mendatang
      </span>
    )

    if (exam.status === 'selesai') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Selesai
        </span>
      )
    } else if (exam.status === 'hari_ini') {
      statusBadge = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          Hari Ini
        </span>
      )
    }

    return (
      <div 
        key={exam.id}
        className="demo-card flex flex-col justify-between p-5 rounded-2xl border border-[var(--line)]/60 bg-gradient-to-br from-white via-white to-[var(--sand)]/20 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 gap-4"
      >
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--line)]/40">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--sea-ink)]">
              <CalendarDays className="h-4 w-4 text-[var(--lagoon-deep)]" />
              <span>{exam.tanggal}</span>
            </div>
            {statusBadge}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                {exam.kodeMk}
              </span>
              <span className="text-[11px] font-bold text-[var(--sea-ink-soft)]">
                {exam.sks} SKS
              </span>
            </div>

            <h3 className="text-base font-extrabold text-[var(--sea-ink)] mt-2 leading-snug">
              {exam.namaMk}
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Waktu Ujian</span>
              <span className="text-xs font-black text-[var(--sea-ink)] mt-0.5">
                {exam.jamMulai} - {exam.jamSelesai} WIB
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Ruang Ujian</span>
              <span className="text-xs font-black text-[var(--sea-ink)] mt-0.5 truncate flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[var(--lagoon-deep)] shrink-0" />
                {exam.ruangan}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 p-2.5 bg-[var(--foam)]/50 border border-[var(--chip-line)] rounded-xl">
            <div className="flex items-center gap-2">
              <Armchair className="h-4 w-4 text-[var(--sea-ink)]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Nomor Kursi</span>
                <span className="text-xs font-black font-mono text-[var(--sea-ink)]">{exam.nomorKursi}</span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${sifatStyle}`}>
              {exam.sifatUjian}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--line)]/40 text-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-[var(--sea-ink-soft)]">
            <span className="font-semibold">Pengawas:</span>
            <span className="font-medium text-[var(--sea-ink)] truncate max-w-[180px]">{exam.pengawas}</span>
          </div>

          {exam.catatan && (
            <div className="text-[10px] font-medium text-amber-700 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <BadgeInfo className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span className="truncate">{exam.catatan}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Academic Milestone Card
  const renderMilestoneCard = (milestone: AcademicMilestone, index: number) => {
    let categoryBadge = 'bg-slate-100 text-slate-700 border-slate-200'
    if (milestone.kategori === 'perkuliahan') {
      categoryBadge = 'bg-sky-50 text-sky-800 border-sky-200'
    } else if (milestone.kategori === 'edom') {
      categoryBadge = 'bg-purple-50 text-purple-800 border-purple-200'
    } else if (milestone.kategori === 'ujian') {
      categoryBadge = 'bg-amber-50 text-amber-800 border-amber-200'
    } else if (milestone.kategori === 'administrasi') {
      categoryBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }

    let statusPill = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <Clock className="h-3 w-3 text-slate-400" />
        Mendatang
      </span>
    )

    if (milestone.status === 'selesai') {
      statusPill = (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="h-3 w-3 text-emerald-600" />
          Selesai
        </span>
      )
    } else if (milestone.status === 'berlangsung') {
      statusPill = (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
          Sedang Berlangsung
        </span>
      )
    }

    return (
      <div 
        key={milestone.id}
        className={`demo-card relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
          milestone.status === 'berlangsung'
            ? 'bg-gradient-to-br from-white via-amber-50/10 to-amber-50/20 border-amber-300 shadow-md ring-2 ring-amber-400/30'
            : 'bg-white/80 border-[var(--line)]/60 hover:shadow-md'
        }`}
      >
        <div>
          {/* Top Badge & Index */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--sea-ink)] text-white text-[10px] font-black flex items-center justify-center font-mono">
                {index + 1}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${categoryBadge}`}>
                {milestone.kategori}
              </span>
            </div>
            {statusPill}
          </div>

          {/* Date range header */}
          <div className="mt-3.5 flex items-center gap-1.5 text-xs font-black text-[var(--lagoon-deep)] bg-[var(--foam)]/70 px-3 py-1.5 rounded-xl border border-[var(--chip-line)] w-fit">
            <CalendarCheck2 className="h-3.5 w-3.5" />
            <span>{milestone.rentangTanggal}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-extrabold text-[var(--sea-ink)] mt-2.5 leading-snug">
            {milestone.judul}
          </h3>

          <p className="text-xs text-[var(--sea-ink-soft)] mt-1.5 leading-relaxed font-medium">
            {milestone.deskripsi}
          </p>
        </div>

        {/* Card Footer: Urgensi & Notes */}
        {milestone.catatan && (
          <div className="pt-3 border-t border-[var(--line)]/40 flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50/60 px-2.5 py-1 rounded-lg">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{milestone.catatan}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      
      {/* Toast alert popup if any */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[var(--sea-ink)] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 transition-all animate-bounce">
          <FileCheck2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Primary Category Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--line)]/60 pb-4">
        {/* Category Tabs (Rutinitas vs UTS vs UAS vs Kalender Akademik) */}
        <div className="inline-flex p-1.5 bg-white/70 border border-[var(--line)]/60 rounded-2xl shadow-sm gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setScheduleType('rutin')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              scheduleType === 'rutin'
                ? 'bg-gradient-to-r from-[var(--sea-ink)] to-[#1b434a] text-white shadow-md'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/60'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Kuliah Rutin
          </button>

          <button
            onClick={() => setScheduleType('uts')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              scheduleType === 'uts'
                ? 'bg-gradient-to-r from-[var(--sea-ink)] to-[#1b434a] text-white shadow-md'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/60'
            }`}
          >
            <FileText className="h-4 w-4 text-amber-400" />
            Jadwal UTS
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              scheduleType === 'uts' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {utsSchedule.length}
            </span>
          </button>

          <button
            onClick={() => setScheduleType('uas')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              scheduleType === 'uas'
                ? 'bg-gradient-to-r from-[var(--sea-ink)] to-[#1b434a] text-white shadow-md'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/60'
            }`}
          >
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            Jadwal UAS
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              scheduleType === 'uas' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {uasSchedule.length}
            </span>
          </button>

          <button
            onClick={() => setScheduleType('kalender')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              scheduleType === 'kalender'
                ? 'bg-gradient-to-r from-[var(--sea-ink)] to-[#1b434a] text-white shadow-md'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/60'
            }`}
          >
            <CalendarRange className="h-4 w-4 text-violet-400" />
            Kalender Akademik
          </button>
        </div>

        {/* Additional Badge indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[var(--sea-ink-soft)] bg-white/60 border border-[var(--line)] px-3 py-1.5 rounded-xl">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Semester Genap 2025/2026</span>
        </div>
      </div>

      {/* 2. Page Header Banner based on selected Category */}
      {scheduleType === 'rutin' ? (
        <div className="demo-panel relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 md:p-8">
          <div className="absolute right-0 top-0 w-64 h-64 bg-radial-gradient from-[var(--lagoon)]/15 to-transparent pointer-events-none transform translate-x-20 -translate-y-20 rounded-full" />
          
          <div className="relative z-10 flex gap-4 items-start">
            <div className="bg-[var(--sand)] text-[var(--sea-ink)] rounded-2xl p-4 shrink-0 shadow-sm border border-[var(--chip-line)] flex items-center justify-center">
              <CalendarDays className="h-8 w-8 text-[var(--lagoon-deep)]" />
            </div>
            <div>
              <h2 className="demo-title display-title text-2xl md:text-3xl font-extrabold text-[var(--sea-ink)]">
                Jadwal Kuliah Mingguan
              </h2>
              <p className="mt-1.5 text-sm text-[var(--sea-ink-soft)] font-medium max-w-xl leading-relaxed">
                Pantau jadwal belajar, koordinasi ruang kelas, dan persiapkan kehadiran Anda di perkuliahan Semester Genap 2025/2026.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 w-full lg:w-auto shrink-0">
            <div className="flex-1 lg:flex-none bg-white/60 border border-[var(--line)] px-5 py-3 rounded-2xl shadow-sm text-center min-w-[110px]">
              <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">Total Beban</span>
              <span className="text-xl font-black text-[var(--sea-ink)] mt-1 block">
                {routineStats.totalSks} <span className="text-xs font-bold text-[var(--sea-ink-soft)]">SKS</span>
              </span>
            </div>

            <div className="flex-1 lg:flex-none bg-white/60 border border-[var(--line)] px-5 py-3 rounded-2xl shadow-sm text-center min-w-[110px]">
              <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">Mata Kuliah</span>
              <span className="text-xl font-black text-[var(--sea-ink)] mt-1 block">
                {routineStats.totalCourses} <span className="text-xs font-bold text-[var(--sea-ink-soft)]">Kelas</span>
              </span>
            </div>

            <div className="flex-1 lg:flex-none bg-gradient-to-br from-[var(--sea-ink)] to-[#154147] border border-white/10 px-5 py-3 rounded-2xl shadow-sm text-center text-white min-w-[120px]">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-[var(--sand)]/80">Semester</span>
              <span className="text-xl font-black mt-1 block tracking-wide">
                VI <span className="text-xs font-medium text-[var(--sand)]/70">Genap</span>
              </span>
            </div>
          </div>
        </div>
      ) : scheduleType === 'kalender' ? (
        /* KALENDER AKADEMIK HEADER BANNER */
        <div className="demo-panel relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 md:p-8">
          <div className="relative z-10 flex gap-4 items-start">
            <div className="bg-violet-50 text-violet-700 rounded-2xl p-4 shrink-0 shadow-sm border border-violet-200 flex items-center justify-center">
              <CalendarRange className="h-8 w-8 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-violet-100 text-violet-800 border-violet-200">
                  Kalender Resmi
                </span>
                <span className="text-xs font-medium text-[var(--sea-ink-soft)]">
                  Tahun Akademik <strong className="text-[var(--sea-ink)]">2025/2026 Genap</strong>
                </span>
              </div>

              <h2 className="demo-title display-title text-2xl md:text-3xl font-extrabold text-[var(--sea-ink)] mt-2">
                Kalender Akademik Semester
              </h2>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium max-w-xl leading-relaxed">
                Pantau seluruh tanggal penting dari perkuliahan Pra UTS, pengisian EDoM, jadwal ujian, perbaikan nilai, pengisian nilai KPS, hingga pengumuman KHS.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-[var(--line)]/40">
            <div className="flex items-center gap-3 bg-white/70 border border-[var(--line)] px-4 py-2.5 rounded-2xl">
              <Flame className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Tahap Aktif</span>
                <span className="text-xs font-black text-amber-800">Pasca UTS & EDoM Pra UAS</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Kalender Akademik 2025/2026 PDF berhasil diunduh!')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-2xl bg-gradient-to-r from-[var(--sea-ink)] to-[#154147] text-white hover:shadow-lg transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Unduh Kalender PDF
            </button>
          </div>
        </div>
      ) : (
        /* Exam Header Banner (UTS / UAS) */
        <div className="demo-panel relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 md:p-8">
          <div className="relative z-10 flex gap-4 items-start">
            <div className={`rounded-2xl p-4 shrink-0 shadow-sm border border-[var(--chip-line)] flex items-center justify-center ${
              scheduleType === 'uts' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {scheduleType === 'uts' ? (
                <FileText className="h-8 w-8 text-amber-600" />
              ) : (
                <GraduationCap className="h-8 w-8 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  scheduleType === 'uts' 
                    ? 'bg-amber-100/70 text-amber-800 border-amber-200' 
                    : 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                }`}>
                  {scheduleType === 'uts' ? 'Ujian Tengah Semester' : 'Ujian Akhir Semester'}
                </span>
                <span className="text-xs font-medium text-[var(--sea-ink-soft)]">
                  Periode: <strong className="text-[var(--sea-ink)]">{scheduleType === 'uts' ? examPeriodInfo.utsPeriod : examPeriodInfo.uasPeriod}</strong>
                </span>
              </div>

              <h2 className="demo-title display-title text-2xl md:text-3xl font-extrabold text-[var(--sea-ink)] mt-2">
                Jadwal {scheduleType === 'uts' ? 'UTS' : 'UAS'} Semester Genap
              </h2>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium max-w-xl leading-relaxed">
                Periksa lokasi ruang, alokasi nomor kursi, serta pastikan Anda telah memenuhi syarat presensi minimal (≥75%) dan administrasi keuangan.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-[var(--line)]/40">
            <div className="flex items-center gap-3 bg-white/70 border border-[var(--line)] px-4 py-2.5 rounded-2xl">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">Status Kelayakan</span>
                <span className="text-xs font-black text-emerald-700">Layak Ujian (Presensi {examPeriodInfo.attendancePercentage}%)</span>
              </div>
            </div>

            <button
              onClick={() => showToast(`Kartu Peserta Ujian ${scheduleType.toUpperCase()} berhasil disiapkan!`)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-2xl bg-gradient-to-r from-[var(--sea-ink)] to-[#154147] text-white hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Cetak Kartu Ujian ({scheduleType.toUpperCase()})
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Content Display Area */}
      {scheduleType === 'rutin' ? (
        /* ROUTINE SCHEDULE DISPLAY */
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex p-1 bg-white/60 border border-[var(--line)]/50 rounded-2xl shadow-inner w-fit">
              <button
                onClick={() => setViewMode('harian')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  viewMode === 'harian'
                    ? 'bg-gradient-to-r from-[var(--sea-ink)] to-[#1b434a] text-white shadow-sm'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/40'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Tampilan Harian
              </button>
              <button
                onClick={() => setViewMode('mingguan')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  viewMode === 'mingguan'
                    ? 'bg-gradient-to-r from-[var(--sea-ink)] to-[#1b434a] text-white shadow-sm'
                    : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/40'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Tampilan Mingguan
              </button>
            </div>

            <div className="text-[11px] font-medium text-[var(--sea-ink-soft)] flex items-center gap-2 bg-[var(--chip-bg)] border border-[var(--chip-line)] px-3 py-1.5 rounded-xl shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Tips: Kartu dengan badge berkedip menandakan kuliah sedang berjalan sekarang.</span>
            </div>
          </div>

          {viewMode === 'harian' ? (
            <div className="flex flex-col gap-6">
              <div className="flex overflow-x-auto gap-2 py-2.5 px-1 scrollbar-none border-b border-[var(--line)]/50">
                {DAYS.map((day) => {
                  const isActive = day === activeDay
                  const classCount = classesCountByDay[day]
                  const hasClasses = classCount > 0
                  
                  const todayIndex = new Date().getDay()
                  const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
                  const isToday = indonesianDays[todayIndex] === day

                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`px-5 py-3 rounded-2xl transition-all cursor-pointer border flex flex-col items-center gap-1 min-w-[96px] text-center select-none ${
                        isActive
                          ? 'border-[var(--lagoon-deep)] bg-white text-[var(--sea-ink)] shadow-md shadow-[var(--lagoon-deep)]/10 font-extrabold scale-[1.02] ring-2 ring-[var(--lagoon-deep)]/20'
                          : 'border-[var(--line)]/20 bg-white/40 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/80 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold">{day}</span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Hari Ini" />
                        )}
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-[var(--sand)] text-[var(--sea-ink)]' 
                          : hasClasses 
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-transparent text-slate-400'
                      }`}>
                        {hasClasses ? `${classCount} Kelas` : 'Libur'}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="min-h-[250px] transition-all duration-300">
                {sortedDailySchedule.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedDailySchedule.map((classItem) => renderClassCard(classItem))}
                  </div>
                ) : (
                  <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/20 rounded-2xl text-center py-20 px-6 bg-white/20 max-w-xl mx-auto flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[var(--sea-ink)] text-lg">Hari Bebas Kuliah!</h4>
                      <p className="text-xs text-[var(--sea-ink-soft)] mt-1.5 leading-relaxed max-w-sm mx-auto">
                        Anda tidak memiliki jadwal kelas yang terdaftar pada hari {activeDay}. Gunakan waktu senggang Anda untuk belajar mandiri atau beristirahat.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 transition-all duration-300">
              {DAYS.map(day => {
                const daySchedule = groupedWeeklySchedule[day]
                const hasClasses = daySchedule.length > 0
                
                const todayIndex = new Date().getDay()
                const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
                const isToday = indonesianDays[todayIndex] === day

                return (
                  <div 
                    key={day} 
                    className={`demo-panel p-5 rounded-2xl border transition-all ${
                      isToday 
                        ? 'border-[var(--lagoon-deep)] bg-gradient-to-r from-white to-[var(--foam)]/30 shadow-md shadow-[var(--lagoon-deep)]/5' 
                        : 'border-[var(--line)]/50 bg-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--line)]/20">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-[var(--sea-ink)] text-base tracking-tight">{day}</h4>
                        {isToday && (
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white bg-emerald-600 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Hari Ini
                          </span>
                        )}
                      </div>
                      
                      <span className="text-xs font-bold text-[var(--sea-ink-soft)] bg-white/60 border border-[var(--line)] px-2.5 py-1 rounded-xl">
                        {hasClasses ? `${daySchedule.length} Mata Kuliah` : 'Libur Kuliah'}
                      </span>
                    </div>

                    {hasClasses ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {daySchedule.map((classItem) => renderClassCard(classItem, false))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-[var(--sea-ink-soft)] font-medium italic">
                        Tidak ada jadwal kuliah kelas pada hari {day}.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : scheduleType === 'kalender' ? (
        /* KALENDER AKADEMIK DISPLAY AREA */
        <div className="flex flex-col gap-8">
          
          {/* Progress Bar Timeline Overview */}
          <div className="demo-panel p-6 rounded-2xl border border-[var(--line)]/60 bg-gradient-to-br from-white to-[var(--sand)]/20 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Milestone className="h-5 w-5 text-[var(--lagoon-deep)]" />
                <h3 className="text-base font-extrabold text-[var(--sea-ink)]">
                  Progress Semester Genap 2025/2026
                </h3>
              </div>
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] bg-white px-3 py-1 rounded-xl border border-[var(--line)] shadow-sm">
                Minggu ke-12 / 16 Minggu
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/80 relative">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-[var(--lagoon-deep)] to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: '75%' }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-[var(--sea-ink-soft)] gap-2">
              <span className="flex items-center gap-1 text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Pra UTS & UTS Selesai
              </span>
              <span className="flex items-center gap-1 text-amber-800">
                <Flame className="h-3.5 w-3.5" /> Pasca UTS & EDoM Berlangsung
              </span>
              <span className="flex items-center gap-1 text-sky-700">
                <Clock className="h-3.5 w-3.5" /> UAS & KHS Mendatang
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'semua', label: 'Semua Agenda' },
              { id: 'perkuliahan', label: 'Perkuliahan' },
              { id: 'edom', label: 'EDoM (Evaluasi Dosen)' },
              { id: 'ujian', label: 'Ujian (UTS & UAS)' },
              { id: 'administrasi', label: 'Nilai & KHS' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCalendarCategory(cat.id as any)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  calendarCategory === cat.id
                    ? 'bg-[var(--sea-ink)] text-white shadow-sm'
                    : 'bg-white/80 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] border border-[var(--line)]/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Milestone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKalender.map((item, idx) => renderMilestoneCard(item, idx))}
          </div>

        </div>
      ) : (
        /* EXAM SCHEDULE DISPLAY (UTS & UAS) */
        <div className="flex flex-col gap-8">
          
          {/* Controls Bar: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/50 border border-[var(--line)]/50 p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sea-ink-soft)]" />
              <input
                type="text"
                placeholder="Cari mata kuliah, kode, atau ruang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-white rounded-xl border border-[var(--line)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon-deep)] text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)]/60"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider mr-1 hidden md:inline">
                Status:
              </span>
              {[
                { id: 'semua', label: 'Semua Status' },
                { id: 'hari_ini', label: 'Hari Ini' },
                { id: 'mendatang', label: 'Mendatang' },
                { id: 'selesai', label: 'Selesai' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[var(--sea-ink)] text-white shadow-sm'
                      : 'bg-white/80 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] border border-[var(--line)]/40'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Cards Grid */}
          {currentExamSchedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentExamSchedule.map(renderExamCard)}
            </div>
          ) : (
            <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/20 rounded-2xl text-center py-16 px-6 bg-white/20 max-w-md mx-auto flex flex-col items-center justify-center gap-3">
              <AlertCircle className="h-10 w-10 text-[var(--sea-ink-soft)]/50" />
              <h4 className="font-extrabold text-[var(--sea-ink)] text-base">Tidak ada jadwal ditemukan</h4>
              <p className="text-xs text-[var(--sea-ink-soft)]">
                Tidak ada ujian yang cocok dengan kata kunci pencarian atau filter status yang dipilih.
              </p>
            </div>
          )}

          {/* Rules & Guidelines Section for Exams */}
          <div className="demo-panel p-6 rounded-2xl border border-[var(--line)]/60 bg-gradient-to-br from-white via-white to-[var(--sand)]/30 flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-2 border-b border-[var(--line)]/40 pb-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <h3 className="text-base font-extrabold text-[var(--sea-ink)]">
                Tata Tertib Pelaksanaan Ujian ({scheduleType.toUpperCase()})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/80 border border-[var(--line)]/50 flex flex-col gap-1.5">
                <span className="font-extrabold text-[var(--sea-ink)] flex items-center gap-1.5">
                  1. Kartu Ujian & KTM
                </span>
                <span className="text-[var(--sea-ink-soft)] leading-relaxed">
                  Peserta wajib membawa Kartu Tanda Mahasiswa (KTM) dan Kartu Peserta Ujian tercetak/digital.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 border border-[var(--line)]/50 flex flex-col gap-1.5">
                <span className="font-extrabold text-[var(--sea-ink)] flex items-center gap-1.5">
                  2. Ketepatan Waktu
                </span>
                <span className="text-[var(--sea-ink-soft)] leading-relaxed">
                  Hadir paling lambat 15 menit sebelum ujian dimulai. Toleransi keterlambatan maksimal 15 menit.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 border border-[var(--line)]/50 flex flex-col gap-1.5">
                <span className="font-extrabold text-[var(--sea-ink)] flex items-center gap-1.5">
                  3. Pakaian & Atribut
                </span>
                <span className="text-[var(--sea-ink-soft)] leading-relaxed">
                  Wajib mengenakan kemeja putih, celana/rok gelap, serta sepatu tertutup sesuai etika kampus.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 border border-[var(--line)]/50 flex flex-col gap-1.5">
                <span className="font-extrabold text-[var(--sea-ink)] flex items-center gap-1.5">
                  4. Kejujuran Akademik
                </span>
                <span className="text-[var(--sea-ink-soft)] leading-relaxed">
                  Kecurangan dalam bentuk apapun akan dikenakan sanksi pembatalan nilai seluruh mata kuliah semester ini.
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
