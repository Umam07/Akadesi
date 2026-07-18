import { createFileRoute } from '@tanstack/react-router'
import { getJadwalData } from '../../../server/functions/academicFn'
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
  CalendarDays
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/jadwal')({
  loader: async () => {
    return await getJadwalData()
  },
  component: JadwalPage,
})

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

// Helper to determine time slot theme
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
  const { schedule } = Route.useLoaderData()
  const [activeDay, setActiveDay] = useState(() => {
    // Default to today if today is a weekday, otherwise Senin
    const todayIndex = new Date().getDay()
    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const todayDayName = indonesianDays[todayIndex]
    return DAYS.includes(todayDayName) ? todayDayName : 'Senin'
  })
  
  const [viewMode, setViewMode] = useState<'harian' | 'mingguan'>('harian')

  // Calculate general stats
  const stats = useMemo(() => {
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

  const renderClassCard = (classItem: typeof schedule[0], showDayBadge = false) => {
    const timeDetails = getTimeSlotDetails(classItem.jamMulai)
    const TimeIcon = timeDetails.icon
    const avatarColor = getAvatarColor(classItem.namaDosen)
    const isOngoing = isClassOngoing(classItem.hari, classItem.jamMulai, classItem.jamSelesai)
    
    // Lecturer initial
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

        {/* Card Footer: Time Slot & Quick Actions */}
        <div className="border-t border-[var(--line)]/40 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Time Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${timeDetails.colorClass}`}>
              <TimeIcon className="h-3.5 w-3.5" />
              {timeDetails.type}
            </span>
            <span className="text-sm font-black text-[var(--sea-ink)]">
              {classItem.jamMulai.substring(0, 5)} - {classItem.jamSelesai.substring(0, 5)}
            </span>
          </div>

          {/* Quick Mock Actions */}
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

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      
      {/* 1. Header & Quick Stats Box */}
      <div className="demo-panel relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 md:p-8">
        {/* Background visual highlight */}
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

        {/* Stats Section */}
        <div className="relative z-10 flex flex-wrap gap-4 w-full lg:w-auto shrink-0">
          <div className="flex-1 lg:flex-none bg-white/60 border border-[var(--line)] px-5 py-3 rounded-2xl shadow-sm text-center min-w-[110px]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">Total Beban</span>
            <span className="text-xl font-black text-[var(--sea-ink)] mt-1 block">
              {stats.totalSks} <span className="text-xs font-bold text-[var(--sea-ink-soft)]">SKS</span>
            </span>
          </div>

          <div className="flex-1 lg:flex-none bg-white/60 border border-[var(--line)] px-5 py-3 rounded-2xl shadow-sm text-center min-w-[110px]">
            <span className="block text-[9px] font-black uppercase tracking-widest text-[var(--sea-ink-soft)]">Mata Kuliah</span>
            <span className="text-xl font-black text-[var(--sea-ink)] mt-1 block">
              {stats.totalCourses} <span className="text-xs font-bold text-[var(--sea-ink-soft)]">Kelas</span>
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

      {/* 2. Control Row: View Mode Toggle & Quick Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Toggle Switch view mode */}
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

        {/* Tip text */}
        <div className="text-[11px] font-medium text-[var(--sea-ink-soft)] flex items-center gap-2 bg-[var(--chip-bg)] border border-[var(--chip-line)] px-3 py-1.5 rounded-xl shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Tips: Kartu dengan badge berkedip menandakan kuliah sedang berjalan sekarang.</span>
        </div>
      </div>

      {/* 3. Main Schedule Display Area */}
      {viewMode === 'harian' ? (
        <div className="flex flex-col gap-6">
          
          {/* Days Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-[var(--line)]/50">
            {DAYS.map((day) => {
              const isActive = day === activeDay
              const classCount = classesCountByDay[day]
              const hasClasses = classCount > 0
              
              // Get current day indicator
              const todayIndex = new Date().getDay()
              const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
              const isToday = indonesianDays[todayIndex] === day

              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-5 py-3 rounded-2xl transition-all cursor-pointer border flex flex-col items-center gap-1 min-w-[96px] text-center select-none ${
                    isActive
                      ? 'border-[var(--lagoon-deep)] bg-white text-[var(--sea-ink)] shadow-md shadow-[var(--lagoon-deep)]/5 font-extrabold transform scale-[1.03]'
                      : 'border-[var(--line)]/20 bg-white/40 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-white/80'
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

          {/* Daily list */}
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
        /* Weekly View Grid */
        <div className="flex flex-col gap-8 transition-all duration-300">
          {DAYS.map(day => {
            const daySchedule = groupedWeeklySchedule[day]
            const hasClasses = daySchedule.length > 0
            
            // Get current day indicator
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
                {/* Day Header */}
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

                {/* Day Classes */}
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
  )
}
