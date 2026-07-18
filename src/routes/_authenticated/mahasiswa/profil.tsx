import { createFileRoute } from '@tanstack/react-router'
import { getProfileData } from '../../../server/functions/academicFn'
import { AvatarInitial } from '../../../components/Header'
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Hash,
  BookOpen
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/profil')({
  loader: async () => {
    return await getProfileData()
  },
  component: ProfilPage,
})

function ProfilPage() {
  const { student } = Route.useLoaderData()

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-8 w-full rise-in">
      {/* Page Header */}
      <div>
        <h2 className="demo-title display-title text-2xl md:text-3xl font-bold">
          Profil Mahasiswa
        </h2>
        <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-1">
          Detail data pribadi dan informasi akademik Anda di sistem SIAKAD.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="demo-panel flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
        <div className="flex-shrink-0" style={{ transform: 'scale(1.5)', margin: '16px' }}>
          <AvatarInitial name={student.nama} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
            <h3 className="text-xl md:text-2xl font-extrabold text-[var(--sea-ink)]">
              {student.nama}
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50/60 text-emerald-700 border border-emerald-600/20 self-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Mahasiswa Aktif
            </span>
          </div>
          <p className="text-sm font-mono font-bold text-[var(--sea-ink-soft)] mt-1.5">
            NIM: {student.nim}
          </p>
          <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-1">
            Program Studi {student.jurusan || 'Teknik Informatika'} — {student.fakultas || 'Teknologi Informasi'}
          </p>

          {/* Academic Stats */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
            <div className="border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 rounded-xl min-w-[100px]">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Semester</span>
              <span className="text-lg font-extrabold text-[var(--sea-ink)]">{student.semesterAktif}</span>
            </div>
            <div className="border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 rounded-xl min-w-[100px]">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">IPK Kumulatif</span>
              <span className="text-lg font-extrabold text-[var(--sea-ink)]">{student.ipk.toFixed(2)}</span>
            </div>
            <div className="border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 rounded-xl min-w-[100px]">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">SKS Lulus</span>
              <span className="text-lg font-extrabold text-[var(--sea-ink)]">{student.totalSksLulus} SKS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Academic Details Card */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-5">
          <div>
            <h4 className="display-title text-lg font-bold flex items-center gap-2 text-[var(--sea-ink)] border-b border-[var(--line)] pb-3">
              <GraduationCap className="h-5 w-5 text-[var(--lagoon-deep)]" />
              Data Akademik
            </h4>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start py-2 border-b border-[var(--line)]/50">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-1.5">
                <Hash size={14} className="text-[var(--sea-ink-soft)]" />
                Nomor Induk Mahasiswa (NIM)
              </span>
              <span className="text-sm font-mono font-bold text-[var(--sea-ink)]">
                {student.nim}
              </span>
            </div>

            <div className="flex justify-between items-start py-2 border-b border-[var(--line)]/50">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-1.5">
                <Building size={14} className="text-[var(--sea-ink-soft)]" />
                Fakultas
              </span>
              <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                {student.fakultas || 'Teknologi Informasi'}
              </span>
            </div>

            <div className="flex justify-between items-start py-2 border-b border-[var(--line)]/50">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-1.5">
                <BookOpen size={14} className="text-[var(--sea-ink-soft)]" />
                Program Studi / Jurusan
              </span>
              <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                {student.jurusan || 'Teknik Informatika'}
              </span>
            </div>
          </div>
        </div>

        {/* Personal & Contact Details Card */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 flex flex-col gap-5">
          <div>
            <h4 className="display-title text-lg font-bold flex items-center gap-2 text-[var(--sea-ink)] border-b border-[var(--line)] pb-3">
              <User className="h-5 w-5 text-[var(--lagoon-deep)]" />
              Data Diri & Kontak
            </h4>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start py-2 border-b border-[var(--line)]/50">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-1.5">
                <User size={14} className="text-[var(--sea-ink-soft)]" />
                Nama Lengkap
              </span>
              <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                {student.nama}
              </span>
            </div>

            <div className="flex justify-between items-start py-2 border-b border-[var(--line)]/50">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-1.5">
                <Mail size={14} className="text-[var(--sea-ink-soft)]" />
                Alamat Email
              </span>
              <span className="text-sm font-bold text-[var(--sea-ink)] text-right break-all">
                {student.email || '-'}
              </span>
            </div>

            <div className="flex justify-between items-start py-2">
              <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-1.5">
                <Phone size={14} className="text-[var(--sea-ink-soft)]" />
                No. Telepon
              </span>
              <span className="text-sm font-mono font-bold text-[var(--sea-ink)]">
                {student.noTelepon || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
