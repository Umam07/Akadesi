import { createFileRoute } from '@tanstack/react-router'
import { getProfileData } from '../../../server/functions/academicFn'
import { AvatarInitial } from '../../../components/Header'
import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Hash,
  BookOpen,
  Copy,
  Check,
  Printer,
  CreditCard,
  BadgeCheck,
  ShieldCheck,
  CalendarDays,
  Award,
  Sparkles,
  MapPin,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  X,
  FileText,
  CheckCircle2,
  Wallet,
  Download,
  UserCheck,
  HeartHandshake,
  QrCode,
  Laptop
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/profil')({
  loader: async () => {
    return await getProfileData()
  },
  component: ProfilPage,
})

function ProfilPage() {
  const { student } = Route.useLoaderData()
  const [activeTab, setActiveTab] = useState<'akademik' | 'biodata' | 'kemahasiswaan' | 'keamanan'>('akademik')
  const [copiedNim, setCopiedNim] = useState(false)
  const [showFullNik, setShowFullNik] = useState(false)
  const [isKtmOpen, setIsKtmOpen] = useState(false)

  // Copy NIM handler
  const handleCopyNim = () => {
    navigator.clipboard.writeText(student.nim)
    setCopiedNim(true)
    setTimeout(() => setCopiedNim(false), 2000)
  }

  // Print handle
  const handlePrint = () => {
    window.print()
  }

  // Calculate SKS completion percentage
  const totalTargetSks = 144
  const sksPercentage = Math.min(100, Math.round((student.totalSksLulus / totalTargetSks) * 100))
  
  // Calculate IPK percentage (target 4.00)
  const ipkPercentage = Math.min(100, Math.round((student.ipk / 4.0) * 100))

  return (
    <div className="demo-page demo-page-wide flex flex-col gap-6 md:gap-8 w-full rise-in pb-12">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--sea-ink-soft)] mb-1">
            <span>SIAKAD</span>
            <span>/</span>
            <span>Mahasiswa</span>
            <span>/</span>
            <span className="text-[var(--lagoon-deep)] font-bold">Profil Mahasiswa</span>
          </div>
          <h2 className="demo-title display-title text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--sea-ink)]">
            Profil Mahasiswa
          </h2>
          <p className="text-xs md:text-sm text-[var(--sea-ink-soft)] font-medium mt-1">
            Informasi lengkap data diri, progres akademik, status kemahasiswaan, dan identitas digital SIAKAD Akadesi.
          </p>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyNim}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--surface-strong)] text-[var(--sea-ink)] border border-[var(--line)] hover:bg-[var(--foam)] transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Salin Nomor Induk Mahasiswa"
          >
            {copiedNim ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600 font-extrabold">NIM Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-[var(--sea-ink-soft)]" />
                <span>Salin NIM</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsKtmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--lagoon-deep)] to-teal-700 text-white shadow-sm hover:opacity-95 transition-all active:scale-95 cursor-pointer"
          >
            <IdCard className="h-4 w-4" />
            <span>KTM Digital</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--surface-strong)] text-[var(--sea-ink-soft)] border border-[var(--line)] hover:text-[var(--sea-ink)] hover:bg-[var(--foam)] transition-all active:scale-95 cursor-pointer"
            title="Cetak Biodata Mahasiswa"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[var(--surface-strong)] via-white/80 to-[var(--foam)]/60 p-6 md:p-8 shadow-sm">
        {/* Background Subtle Accent Lights */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[var(--lagoon-deep)]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-[var(--lagoon-deep)] via-emerald-400 to-teal-300 shadow-md">
              <div className="p-1 rounded-full bg-white">
                <div style={{ transform: 'scale(2.2)', margin: '26px' }}>
                  <AvatarInitial name={student.nama} />
                </div>
              </div>
            </div>
            {/* Online Status Indicator */}
            <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200" title="Status Online SIAKAD" />
          </div>

          {/* Student Main Identity Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
              <h3 className="text-2xl md:text-3xl font-black text-[var(--sea-ink)] tracking-tight">
                {student.nama}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 self-center">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                Mahasiswa Aktif
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs md:text-sm text-[var(--sea-ink-soft)] font-medium">
              <span className="inline-flex items-center gap-1.5 font-mono font-bold bg-[var(--foam)]/80 text-[var(--sea-ink)] px-2.5 py-1 rounded-lg border border-[var(--line)]">
                <Hash className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
                NIM: {student.nim}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <GraduationCap className="h-4 w-4 text-[var(--lagoon-deep)]" />
                {student.jurusan || 'Teknik Informatika'}
              </span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Building className="h-4 w-4 text-[var(--sea-ink-soft)]" />
                {student.fakultas || 'Teknologi Informasi'}
              </span>
            </div>

            {/* Sub Meta Info Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-4">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/80 text-[var(--sea-ink)] border border-[var(--line)] shadow-2xs flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
                Angkatan {student.angkatan || '2024'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/80 text-[var(--sea-ink)] border border-[var(--line)] shadow-2xs flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                Dosen Wali: {student.dosenWali || 'Dr. Ir. Hendra Wijaya, M.T.'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-2xs flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                {student.beasiswa || 'Beasiswa KIP-K'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: IPK Kumulatif */}
        <div className="demo-panel p-5 border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">IPK Kumulatif</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
              <Award className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[var(--sea-ink)] tracking-tight">
                {student.ipk.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-[var(--sea-ink-soft)]">/ 4.00</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-[var(--foam)] h-2 rounded-full overflow-hidden mt-3 border border-[var(--line)]">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${ipkPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--sea-ink-soft)] mt-1.5">
              <span>Skala Maksimal 4.00</span>
              <span className="text-emerald-700 font-bold">Sangat Memuaskan</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total SKS Lulus */}
        <div className="demo-panel p-5 border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">SKS Lulus</span>
            <div className="p-2 rounded-xl bg-[var(--lagoon-deep)]/10 text-[var(--lagoon-deep)] group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[var(--sea-ink)] tracking-tight">
                {student.totalSksLulus}
              </span>
              <span className="text-xs font-bold text-[var(--sea-ink-soft)]">/ 144 SKS</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--foam)] h-2 rounded-full overflow-hidden mt-3 border border-[var(--line)]">
              <div
                className="bg-gradient-to-r from-[var(--lagoon-deep)] to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${sksPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--sea-ink-soft)] mt-1.5">
              <span>Target Kelulusan 144 SKS</span>
              <span className="text-[var(--lagoon-deep)] font-bold">{sksPercentage}% Tuntas</span>
            </div>
          </div>
        </div>

        {/* Card 3: Semester Aktif */}
        <div className="demo-panel p-5 border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Semester Aktif</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[var(--sea-ink)] tracking-tight">
                Semester {student.semesterAktif}
              </span>
            </div>
            <p className="text-xs font-semibold text-[var(--sea-ink-soft)] mt-1">
              Tahun Ajaran 2025/2026 Genap
            </p>

            <div className="mt-3 pt-2 border-t border-[var(--line)]/60 flex items-center justify-between text-[10px] font-bold text-indigo-700">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                Registrasi Ulang Tuntas
              </span>
              <span>Reguler A</span>
            </div>
          </div>
        </div>

        {/* Card 4: Status Financial / UKT */}
        <div className="demo-panel p-5 border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--sea-ink-soft)]">Status UKT / Biaya</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-emerald-700 tracking-tight">
                Bebas UKT (100%)
              </span>
            </div>
            <p className="text-xs font-medium text-[var(--sea-ink-soft)] mt-1 truncate" title={student.beasiswa}>
              {student.beasiswa || 'Beasiswa KIP-Kuliah'}
            </p>

            <div className="mt-3 pt-2 border-t border-[var(--line)]/60 flex items-center justify-between text-[10px] font-bold text-emerald-700">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Status Lunas 8 Semester
              </span>
              <span>Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Information Container */}
      <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('akademik')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'akademik'
                ? 'bg-[var(--lagoon-deep)] text-white shadow-sm'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--foam)]'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Data Akademik</span>
          </button>

          <button
            onClick={() => setActiveTab('biodata')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'biodata'
                ? 'bg-[var(--lagoon-deep)] text-white shadow-sm'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--foam)]'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Biodata Diri & Kontak</span>
          </button>

          <button
            onClick={() => setActiveTab('kemahasiswaan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'kemahasiswaan'
                ? 'bg-[var(--lagoon-deep)] text-white shadow-sm'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--foam)]'
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            <span>Kemahasiswaan & Wali</span>
          </button>

          <button
            onClick={() => setActiveTab('keamanan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'keamanan'
                ? 'bg-[var(--lagoon-deep)] text-white shadow-sm'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--foam)]'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Keamanan Akun</span>
          </button>
        </div>

        {/* Tab 1 Content: Data Akademik */}
        {activeTab === 'akademik' && (
          <div className="flex flex-col gap-6 rise-in">
            <div className="flex items-center justify-between border-b border-[var(--line)]/60 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-[var(--sea-ink)] flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[var(--lagoon-deep)]" />
                  Rincian Informasi Akademik
                </h4>
                <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
                  Data kurikulum, dosen pembimbing akademik, dan status kelulusan di program studi.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--foam)] text-[var(--sea-ink-soft)] border border-[var(--line)] hidden sm:inline-block">
                SIAKAD 2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <Hash className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Nomor Induk Mahasiswa (NIM)
                  </span>
                  <span className="text-sm font-mono font-extrabold text-[var(--sea-ink)] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {student.nim}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Program Studi / Jurusan
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.jurusan || 'Teknik Informatika'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <Building className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Fakultas
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.fakultas || 'Teknologi Informasi'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <Award className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Jenjang Pendidikan
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.jenjang || 'S1 (Sarjana)'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Kurikulum Operasional
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.kurikulum || 'Kurikulum 2024 (Revisi Utama)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Sistem Perkuliahan
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.sistemKuliah || 'Reguler A (Tatap Muka & Hybrid)'}
                  </span>
                </div>

                <div className="flex justify-between items-start py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2 mt-0.5">
                    <UserCheck className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Dosen Pembimbing Akademik
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[var(--sea-ink)] block">
                      {student.dosenWali || 'Dr. Ir. Hendra Wijaya, M.T.'}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--sea-ink-soft)]">
                      NIP: {student.dosenWaliNip || '198204152010121003'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Angkatan Masuk
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    Tahun {student.angkatan || '2024'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Biodata Diri & Kontak */}
        {activeTab === 'biodata' && (
          <div className="flex flex-col gap-6 rise-in">
            <div className="flex items-center justify-between border-b border-[var(--line)]/60 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-[var(--sea-ink)] flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--lagoon-deep)]" />
                  Data Kependudukan & Informasi Kontak
                </h4>
                <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
                  Informasi pribadi resmi sesuai dokumen kependudukan (KTP/KK) dan kontak aktif.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Nama Lengkap (Sesuai Ijazah)
                  </span>
                  <span className="text-sm font-extrabold text-[var(--sea-ink)] text-right">
                    {student.nama}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Nomor Induk Kependudukan (NIK)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[var(--sea-ink)]">
                      {showFullNik ? '3271042804020003' : student.nik || '32710428****0003'}
                    </span>
                    <button
                      onClick={() => setShowFullNik(!showFullNik)}
                      className="p-1 text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors cursor-pointer"
                      title={showFullNik ? 'Sembunyikan NIK' : 'Tampilkan NIK Utuh'}
                    >
                      {showFullNik ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Tempat, Tanggal Lahir
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.tempatTanggalLahir || 'Jakarta, 28 April 2004'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Jenis Kelamin & Agama
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.jenisKelamin || 'Laki-Laki'} ({student.agama || 'Islam'})
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Alamat Email Kampus
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right break-all">
                    {student.email || `${student.nim}@std.akadesi.ac.id`}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Nomor Telepon / WhatsApp
                  </span>
                  <span className="text-sm font-mono font-bold text-[var(--sea-ink)]">
                    {student.noTelepon || '+62 812-3456-7890'}
                  </span>
                </div>

                <div className="flex justify-between items-start py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2 mt-0.5">
                    <MapPin className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Alamat Domisili
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right max-w-[240px]">
                    {student.alamatJalan || 'Jl. Kampus Raya No. 45, Kebayoran, Jakarta Selatan'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Kewarganegaraan
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.kewarganegaraan || 'WNI (Warga Negara Indonesia)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3 Content: Kemahasiswaan & Orang Tua */}
        {activeTab === 'kemahasiswaan' && (
          <div className="flex flex-col gap-6 rise-in">
            <div className="flex items-center justify-between border-b border-[var(--line)]/60 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-[var(--sea-ink)] flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-[var(--lagoon-deep)]" />
                  Status Kemahasiswaan, Beasiswa & Orang Tua
                </h4>
                <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
                  Informasi registrasi awal, status penerimaan beasiswa, dan kontak keluarga.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Jalur Masuk Penerimaan
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.jalurMasuk || 'SNBT (Seleksi Nasional Berdasarkan Tes)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Program Beasiswa / UKT
                  </span>
                  <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {student.beasiswa || 'Beasiswa KIP-Kuliah (100%)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    Status Registrasi Ulang
                  </span>
                  <span className="text-sm font-bold text-teal-800 text-right">
                    {student.statusRegUlang || 'Terverifikasi / Aktif'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <User className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Nama Ibu Kandung
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.namaIbuKandung || 'Siti Rahmah'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Masa Berlaku KTM Digital
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    s/d {student.ktmExpiry || '31 Agustus 2028'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-[var(--line)]/50">
                  <span className="text-xs font-bold text-[var(--sea-ink-soft)] flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    Status Pernikahan
                  </span>
                  <span className="text-sm font-bold text-[var(--sea-ink)] text-right">
                    {student.statusPernikahan || 'Belum Menikah'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4 Content: Keamanan & Akun */}
        {activeTab === 'keamanan' && (
          <div className="flex flex-col gap-6 rise-in">
            <div className="flex items-center justify-between border-b border-[var(--line)]/60 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-[var(--sea-ink)] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--lagoon-deep)]" />
                  Keamanan Akun & Autentikasi SIAKAD
                </h4>
                <p className="text-xs text-[var(--sea-ink-soft)] font-medium mt-0.5">
                  Informasi sesi login, enkripsi kata sandi, dan perlindungan privasi akun mahasiswa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4 border border-[var(--line)] p-4 rounded-xl bg-[var(--foam)]/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[var(--sea-ink)]">Status Autentikasi SSO</h5>
                    <p className="text-xs text-[var(--sea-ink-soft)]">{student.ssoStatus || 'Aktif (SIAKAD SSO Integrated)'}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed">
                  Akun Anda terhubung langsung dengan sistem SSO Kampus dengan proteksi sesi terenkripsi cookie HttpOnly.
                </p>
              </div>

              <div className="flex flex-col gap-4 border border-[var(--line)] p-4 rounded-xl bg-[var(--foam)]/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--lagoon-deep)]/10 text-[var(--lagoon-deep)]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[var(--sea-ink)]">Terakhir Login Aktivitas</h5>
                    <p className="text-xs text-[var(--sea-ink-soft)]">{student.terakhirLogin || 'Hari ini, 08:30 WIB'}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed">
                  Semua transaksi KRS, KHS, dan biodata dicatat dalam log audit resmi SIAKAD Akadesi demi keamanan data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Preview KTM Digital */}
      {isKtmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs rise-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-[var(--lagoon-deep)]" />
                <h3 className="text-sm font-bold text-slate-800">Kartu Tanda Mahasiswa Digital</h3>
              </div>
              <button
                onClick={() => setIsKtmOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* KTM Card Mockup Container */}
            <div className="p-6">
              <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 shadow-xl border border-teal-500/20">
                {/* Background Pattern Decorative */}
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
                <div className="absolute left-1/4 -bottom-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

                {/* Card Campus Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center font-black text-teal-300 text-xs">
                      AKA
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-teal-300">UNIVERSITAS AKADESI</h4>
                      <p className="text-[9px] text-slate-300 font-medium">Sistem Informasi Akademik Terpadu</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
                    KTM DIGITAL
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex items-center gap-4 mt-5">
                  <div className="relative p-0.5 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-400 flex-shrink-0 shadow-md">
                    <div className="p-0.5 rounded-xl bg-slate-900">
                      <div style={{ transform: 'scale(1.4)', margin: '14px' }}>
                        <AvatarInitial name={student.nama} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-base font-extrabold text-white truncate">{student.nama}</h5>
                    <p className="text-xs font-mono font-bold text-teal-300 mt-0.5">NIM: {student.nim}</p>
                    <p className="text-[11px] text-slate-300 font-medium mt-1 truncate">
                      {student.jurusan || 'Teknik Informatika'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {student.fakultas || 'Teknologi Informasi'}
                    </p>
                  </div>
                </div>

                {/* Card Footer Barcode & QR */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-8 w-8 text-teal-300" />
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Masa Berlaku</span>
                      <span className="text-[10px] font-bold text-white">s/d {student.ktmExpiry || '31/08/2028'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-mono text-slate-400">VERIFIED DIGITAL ID</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">● ACTIVE STUDENT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsKtmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  alert('KTM Digital berhasil diunduh ke perangkat Anda.')
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--lagoon-deep)] text-white hover:opacity-95 transition-all shadow-xs cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh KTM</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
