import { createFileRoute } from '@tanstack/react-router'
import { getJadwalData } from '../../../server/functions/academicFn'
import { useState } from 'react'
import { Calendar, Clock, MapPin, User } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/jadwal')({
  loader: async () => {
    return await getJadwalData()
  },
  component: JadwalPage,
})

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

function JadwalPage() {
  const { schedule } = Route.useLoaderData()
  const [activeDay, setActiveDay] = useState('Senin')

  // Filter schedule for the selected day
  const filteredSchedule = schedule.filter(
    (item) => item.hari.toLowerCase() === activeDay.toLowerCase()
  )

  // Sort schedule by start time
  const sortedSchedule = [...filteredSchedule].sort((a, b) => 
    a.jamMulai.localeCompare(b.jamMulai)
  )

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      {/* Page Header */}
      <div>
        <h2 className="demo-title display-title text-2xl md:text-3xl font-bold">
          Jadwal Kuliah Mingguan
        </h2>
        <p className="mt-1 text-sm text-[var(--sea-ink-soft)] font-medium">
          Daftar mata kuliah yang Anda ambil di Semester Genap 2025/2026.
        </p>
      </div>

      {/* Days Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none border-b border-[var(--line)]">
        {DAYS.map((day) => {
          const isActive = day === activeDay
          const hasClasses = schedule.some(item => item.hari.toLowerCase() === day.toLowerCase())

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer border-t border-x relative -mb-[1px] whitespace-nowrap ${
                isActive
                  ? 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink)] shadow-[0_-2px_6px_rgba(23,58,64,0.02)]'
                  : 'border-transparent bg-transparent text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--surface-strong)]/40'
              }`}
            >
              {day}
              {hasClasses && (
                <span className={`ml-2 inline-block w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[var(--lagoon-deep)]' : 'bg-[var(--sea-ink-soft)]/50'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Schedule Detail Area */}
      <div className="min-h-[300px]">
        {sortedSchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sortedSchedule.map((classItem) => (
              <div
                key={classItem.id}
                className="demo-card border border-[var(--line)] bg-[var(--surface-strong)] p-5 hover:border-[var(--lagoon-deep)] transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wide text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2 py-0.5 rounded border border-[var(--chip-line)]">
                      {classItem.kodeMk}
                    </span>
                    <span className="text-xs font-bold text-[var(--lagoon-deep)] bg-[var(--sand)] px-2.5 py-1 rounded-md border border-[var(--chip-line)]">
                      {classItem.sks} SKS
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--sea-ink)] mt-3 leading-snug">
                    {classItem.namaMk}
                  </h3>

                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--sea-ink-soft)]">
                      <User className="h-4 w-4 text-[var(--lagoon-deep)]" />
                      <span>Dosen: {classItem.namaDosen}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--sea-ink-soft)]">
                      <MapPin className="h-4 w-4 text-[var(--lagoon-deep)]" />
                      <span>Ruangan: {classItem.ruangan}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--line)] pt-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--sea-ink)]">
                    <Clock className="h-4.5 w-4.5 text-[var(--lagoon-deep)]" />
                    <span>{classItem.jamMulai.substring(0, 5)} - {classItem.jamSelesai.substring(0, 5)}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] bg-[var(--chip-bg)] px-2.5 py-1 rounded-md border border-[var(--line)]">
                    Semester Genap
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="demo-panel border border-dashed border-[var(--sea-ink-soft)]/30 rounded-xl text-center py-20 px-6 bg-white/40 max-w-lg mx-auto">
            <Calendar className="h-12 w-12 text-[var(--sea-ink-soft)]/30 mx-auto mb-4" />
            <h4 className="font-bold text-[var(--sea-ink)] text-lg">Tidak ada jadwal kuliah hari {activeDay}</h4>
            <p className="text-xs text-[var(--sea-ink-soft)] mt-1.5 leading-relaxed">
              Anda tidak memiliki jadwal kelas yang terdaftar pada hari ini. Silakan periksa hari lainnya atau gunakan tab menu di atas untuk navigasi.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
