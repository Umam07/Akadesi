import { createFileRoute } from '@tanstack/react-router'
import { getKeuanganData } from '../../../server/functions/academicFn'
import { useState, useMemo } from 'react'
import {
  Wallet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Printer,
  X,
  Sparkles,
  Receipt,
  FileCheck2,
  Award,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/mahasiswa/keuangan')({
  loader: async () => {
    return await getKeuanganData()
  },
  component: KeuanganPage,
})

// Helper format Rupiah
function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function KeuanganPage() {
  const { student, jurusan, nominalUktPerSem, semesterAktif, regulerProfile, kipProfile } = Route.useLoaderData()

  // Profile view mode: 'REGULER' | 'KIP'
  const [profileMode, setProfileMode] = useState<'REGULER' | 'KIP'>('REGULER')

  // Selected semester tab (default to current active semester)
  const [selectedSemesterNum, setSelectedSemesterNum] = useState<number>(semesterAktif)

  // Local state for dynamic live simulation of payments
  const [paidCicilanKeys, setPaidCicilanKeys] = useState<Record<string, boolean>>({})

  // Modals state
  const [activeVaModal, setActiveVaModal] = useState<{
    cicilanKe: number
    judul: string
    nominal: number
    dueDate: string
    nomorVa: string
    semesterAjaran: string
    semNum: number
  } | null>(null)

  const [activeReceiptModal, setActiveReceiptModal] = useState<{
    cicilanKe: number
    judul: string
    nominal: number
    paidDate: string
    nomorVa: string
    metode: string
    semesterAjaran: string
    isKip?: boolean
  } | null>(null)

  const [copiedVa, setCopiedVa] = useState(false)
  const [simulatedPaymentSuccess, setSimulatedPaymentSuccess] = useState(false)
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'MANDIRI' | 'BNI' | 'QRIS'>('BCA')

  // Active profile object based on toggle
  const currentProfile = useMemo(() => {
    if (profileMode === 'KIP') {
      return kipProfile
    }
    return regulerProfile
  }, [profileMode, regulerProfile, kipProfile])

  // Get active semester data
  const currentSemesterData = useMemo(() => {
    const semObj = currentProfile.semesters.find((s) => s.semester === selectedSemesterNum)
    if (!semObj) return currentProfile.semesters[0]

    // Apply live paid override if simulated in UI
    const updatedCicilan = semObj.cicilan.map((c) => {
      const key = `${selectedSemesterNum}-${c.cicilanKe}`
      if (paidCicilanKeys[key] && c.status !== 'LUNAS') {
        return {
          ...c,
          status: 'LUNAS',
          paidDate: 'Hari Ini (Simulasi)',
          metodePembayaran: `${selectedBank} Virtual Account`,
        }
      }
      return c
    })

    const totalPaid = updatedCicilan.reduce((sum, c) => sum + (c.status === 'LUNAS' ? c.nominal : 0), 0)
    const sisaTagihan = semObj.nominalUkt - totalPaid
    const isLunas = profileMode === 'KIP' || totalPaid >= semObj.nominalUkt

    return {
      ...semObj,
      cicilan: updatedCicilan,
      totalPaid,
      sisaTagihan,
      status: isLunas ? (profileMode === 'KIP' ? 'BEBAS_KIP' : 'LUNAS') : 'MENCICIL',
      progressPercent: semObj.nominalUkt > 0 ? Math.round((totalPaid / semObj.nominalUkt) * 100) : 100,
    }
  }, [currentProfile, selectedSemesterNum, paidCicilanKeys, profileMode, selectedBank])

  // Copy VA helper
  const handleCopyVa = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedVa(true)
    setTimeout(() => setCopiedVa(false), 2000)
  }

  // Handle simulated payment
  const handleSimulatePayment = () => {
    if (!activeVaModal) return
    const key = `${activeVaModal.semNum}-${activeVaModal.cicilanKe}`
    setPaidCicilanKeys((prev) => ({ ...prev, [key]: true }))
    setSimulatedPaymentSuccess(true)
    setTimeout(() => {
      setSimulatedPaymentSuccess(false)
      setActiveVaModal(null)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--sea-ink)] pb-16">
      <div className="page-wrap space-y-6 pt-6">
        
        {/* Top Hero Banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #173a40 0%, #0d2529 100%)',
            color: 'var(--sand)',
            boxShadow: '0 10px 30px rgba(23,58,64,0.18)',
          }}
        >
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Wallet className="w-3.5 h-3.5" />
                <span>Portal Keuangan & Billing UKT</span>
              </div>
              <h1 className="display-title text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Status Keuangan Mahasiswa
              </h1>
              <p className="text-sm opacity-90 leading-relaxed text-slate-200">
                Lihat rincian pembayaran UKT per semester, skema cicilan 3x, dan status pembebasan biaya KIP Kuliah.
              </p>
            </div>

            {/* Interactive Profile Switcher Toggle */}
            <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/80 flex items-center gap-1 self-start md:self-auto shadow-inner backdrop-blur-md">
              <button
                onClick={() => setProfileMode('REGULER')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  profileMode === 'REGULER'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Mahasiswa Reguler</span>
              </button>
              <button
                onClick={() => setProfileMode('KIP')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  profileMode === 'KIP'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Beasiswa KIP Kuliah</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              {student.nama.charAt(0)}
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base">{student.nama}</div>
              <div className="text-slate-500 text-xs font-mono">NIM: {student.nim} • {jurusan}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/80 w-full sm:w-auto">
            <div>
              <span className="text-slate-400 block text-[11px]">Fakultas</span>
              <span className="font-bold text-slate-800">{student.fakultas || 'Teknologi Informasi'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Semester Aktif</span>
              <span className="font-bold text-teal-700">Semester {semesterAktif} (2025/2026 Genap)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Kategori UKT</span>
              <span className="font-bold text-slate-800">
                {profileMode === 'KIP' ? 'Bebas UKT (KIP Kuliah)' : `${formatRupiah(nominalUktPerSem)} / Sem`}
              </span>
            </div>
          </div>
        </div>

        {/* KIP Kuliah Banner if in KIP Mode */}
        {profileMode === 'KIP' && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 border border-amber-300/80 p-6 sm:p-8 shadow-sm">
            <div className="absolute -right-8 -bottom-8 opacity-10 text-amber-600 pointer-events-none">
              <Award className="w-64 h-64" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Program Beasiswa Pemerintah Republik Indonesia</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
                <span>Penerima Beasiswa KIP Kuliah (Kartu Indonesia Pintar)</span>
              </h2>
              <p className="text-slate-700 text-sm max-w-3xl leading-relaxed">
                Selamat! Berdasarkan verifikasi Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi, Anda terdaftar sebagai mahasiswa penerima beasiswa KIP Kuliah. Seluruh pembiayaan UKT Anda <strong className="text-amber-900 font-bold">dibebaskan 100% selama 8 semester (sampai lulus)</strong>.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <div className="bg-white border border-amber-300/80 px-4 py-3 rounded-2xl shadow-sm">
                  <span className="text-xs text-slate-500 block">Total Subsidi UKT 8 Semester</span>
                  <span className="text-lg font-black text-amber-700">
                    {formatRupiah(kipProfile.totalSubsidiKip)} (Bebas 100%)
                  </span>
                </div>
                <div className="bg-white border border-emerald-300/80 px-4 py-3 rounded-2xl shadow-sm">
                  <span className="text-xs text-slate-500 block">Status Verifikasi</span>
                  <span className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Terverifikasi Aktif s/d Lulus
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary Cards Grid (for Reguler Mode) */}
        {profileMode === 'REGULER' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: UKT Nominal Semester Ini */}
            <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Biaya UKT / Semester</span>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200/60">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatRupiah(nominalUktPerSem)}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Jurusan <strong className="text-slate-800">{jurusan}</strong> • Skema Cicilan 3x per Semester
              </p>
            </div>

            {/* Card 2: Sudah Dibayar */}
            <div className="demo-panel border border-emerald-200/80 bg-[var(--surface-strong)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Sudah Dibayar</span>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200/60">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {formatRupiah(currentSemesterData.totalPaid)}
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-200/60">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${currentSemesterData.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 flex justify-between font-medium">
                <span>Progress: {currentSemesterData.progressPercent}%</span>
                <span>
                  {currentSemesterData.cicilan.filter((c) => c.status === 'LUNAS').length} dari 3 cicilan lunas
                </span>
              </p>
            </div>

            {/* Card 3: Sisa Tagihan */}
            <div className="demo-panel border border-amber-200/80 bg-[var(--surface-strong)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sisa Tagihan Semester Ini</span>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200/60">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600">
                {formatRupiah(currentSemesterData.sisaTagihan)}
              </div>
              <p className="text-slate-500 text-xs mt-2 font-medium">
                {currentSemesterData.sisaTagihan === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selamat! Pembayaran semester ini telah Lunas.
                  </span>
                ) : (
                  <span>Segera lunasi sebelum periode UAS berakhir.</span>
                )}
              </p>
            </div>

          </div>
        )}

        {/* Semester Tabs Navigation */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <h3 className="display-title text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-700" />
                Riwayat & Skema Pembayaran per Semester
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Pilih semester di bawah ini untuk melihat rincian cicilan 1, 2, dan 3.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200/80 self-start sm:self-auto">
              Skema: <strong className="text-slate-900">Cicilan 1 (40%)</strong> • <strong className="text-slate-900">Cicilan 2 (30%)</strong> • <strong className="text-slate-900">Cicilan 3 (30%)</strong>
            </div>
          </div>

          {/* Tabs bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
            {currentProfile.semesters.map((sem) => {
              const isActive = sem.semester === selectedSemesterNum
              const isCurrentSem = sem.semester === semesterAktif

              return (
                <button
                  key={sem.semester}
                  onClick={() => setSelectedSemesterNum(sem.semester)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-teal-700 text-white border-teal-600 shadow-md shadow-teal-900/10 scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>Semester {sem.semester}</span>
                  {isCurrentSem && (
                    <span className={`px-1.5 py-0.5 text-[10px] rounded font-black uppercase tracking-wider ${
                      isActive ? 'bg-white text-teal-900' : 'bg-teal-100 text-teal-800 border border-teal-300'
                    }`}>
                      Aktif
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Semester Detail View */}
        <div className="demo-panel border border-[var(--line)] bg-[var(--surface-strong)] p-6 rounded-2xl shadow-sm space-y-6">
          
          {/* Header of selected semester */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-xs text-teal-700 font-extrabold uppercase tracking-wider">
                {currentSemesterData.semesterAjaran}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Rincian Pembayaran Semester {currentSemesterData.semester}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {profileMode === 'KIP' ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> BEBAS UKT (KIP KULIAH 100%)
                </span>
              ) : currentSemesterData.status === 'LUNAS' ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> STATUS: LUNAS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black">
                  <Clock className="w-4 h-4 text-amber-600" /> STATUS: MENCICIL ({currentSemesterData.cicilan.filter((c) => c.status === 'LUNAS').length}/3)
                </span>
              )}

              {profileMode === 'REGULER' && (
                <div className="text-right border-l border-slate-300/80 pl-4 hidden sm:block">
                  <span className="text-xs text-slate-500 block">Nominal Semester</span>
                  <span className="text-sm font-black text-slate-900">{formatRupiah(currentSemesterData.nominalUkt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3 Installment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentSemesterData.cicilan.map((item) => {
              const isPaid = item.status === 'LUNAS'
              const isKipItem = item.status === 'BEBAS_KIP'

              return (
                <div
                  key={item.cicilanKe}
                  className={`relative flex flex-col justify-between rounded-2xl p-5 border transition-all duration-200 ${
                    isKipItem
                      ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-300 shadow-sm'
                      : isPaid
                      ? 'bg-white border-emerald-300/80 shadow-sm hover:shadow-md'
                      : 'bg-white border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  {/* Top Card Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200">
                        {item.judul}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {item.persentase}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-1">
                      {isKipItem ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Dibebaskan (KIP Kuliah)</span>
                        </div>
                      ) : isPaid ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>LUNAS</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>MENUNGGU PEMBAYARAN</span>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <span className="text-xs text-slate-500 block font-medium">Nominal Tagihan</span>
                      <span className={`text-xl font-black ${isKipItem ? 'text-amber-700' : isPaid ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {isKipItem ? 'Rp 0 (Bebas)' : formatRupiah(item.nominal)}
                      </span>
                    </div>

                    {/* Date Details */}
                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200/80">
                      <div className="flex justify-between text-slate-500">
                        <span>Jatuh Tempo:</span>
                        <span className="font-extrabold text-slate-800">{item.dueDate}</span>
                      </div>
                      {item.paidDate && (
                        <div className="flex justify-between text-slate-500">
                          <span>Tanggal Bayar:</span>
                          <span className="font-extrabold text-emerald-700">{item.paidDate}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500 pt-1.5 border-t border-slate-200/80">
                        <span>Metode:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]" title={item.metodePembayaran}>
                          {item.metodePembayaran}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-200/80">
                    {isKipItem ? (
                      <button
                        onClick={() =>
                          setActiveReceiptModal({
                            cicilanKe: item.cicilanKe,
                            judul: item.judul,
                            nominal: item.nominalOriginal || nominalUktPerSem * 0.3,
                            paidDate: item.paidDate || '10 September 2025',
                            nomorVa: item.nomorVa,
                            metode: item.metodePembayaran,
                            semesterAjaran: currentSemesterData.semesterAjaran,
                            isKip: true,
                          })
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <FileCheck2 className="w-4 h-4 text-amber-700" />
                        <span>Lihat Sertifikat Bebas UKT</span>
                      </button>
                    ) : isPaid ? (
                      <button
                        onClick={() =>
                          setActiveReceiptModal({
                            cicilanKe: item.cicilanKe,
                            judul: item.judul,
                            nominal: item.nominal,
                            paidDate: item.paidDate || 'Lunas',
                            nomorVa: item.nomorVa,
                            metode: item.metodePembayaran,
                            semesterAjaran: currentSemesterData.semesterAjaran,
                            isKip: false,
                          })
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4 text-emerald-600" />
                        <span>Cetak Bukti Pembayaran</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setActiveVaModal({
                            cicilanKe: item.cicilanKe,
                            judul: item.judul,
                            nominal: item.nominal,
                            dueDate: item.dueDate,
                            nomorVa: item.nomorVa,
                            semesterAjaran: currentSemesterData.semesterAjaran,
                            semNum: currentSemesterData.semester,
                          })
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md text-xs font-extrabold transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Bayar Sekarang / Detail VA</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Payment Info Note */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-slate-900">Catatan Pembayaran & Virtual Account:</span>
              <p>
                Pembayaran UKT dapat dilakukan melalui Virtual Account BCA, Mandiri, BNI, atau QRIS dari aplikasi m-Banking mana saja. Setelah pembayaran berhasil, status cicilan akan berubah menjadi <span className="text-emerald-700 font-extrabold">LUNAS</span> secara otomatis dalam 1-3 menit.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: Payment Instruction & Virtual Account */}
      {activeVaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative text-slate-800">
            <button
              onClick={() => setActiveVaModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-slate-200 pb-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Instruksi Pembayaran UKT</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeVaModal.judul} • {activeVaModal.semesterAjaran}
                </p>
              </div>
            </div>

            {/* Bank Choice selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Pilih Metode Pembayaran:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['BCA', 'MANDIRI', 'BNI', 'QRIS'] as const).map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                      selectedBank === bank
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            {/* Nominal */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Total Pembayaran</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatRupiah(activeVaModal.nominal)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block font-medium">Jatuh Tempo</span>
                <span className="text-xs font-extrabold text-amber-700">{activeVaModal.dueDate}</span>
              </div>
            </div>

            {/* VA Box */}
            {selectedBank === 'QRIS' ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
                <span className="text-xs text-slate-600 font-bold block">Scan Kode QRIS di Bawah Ini:</span>
                <div className="w-36 h-36 bg-white mx-auto rounded-2xl p-2 flex items-center justify-center border border-slate-200 shadow-inner">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <p className="text-[11px] text-slate-500">Dapat di-scan dengan GoPay, OVO, ShopeePay, BCA mobile, dll.</p>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs text-slate-600 font-bold block">
                  Nomor Virtual Account {selectedBank}:
                </span>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-mono text-lg font-black text-slate-900 tracking-wider">
                    {selectedBank === 'BCA' ? '88270' : selectedBank === 'MANDIRI' ? '89270' : '88390'}
                    {student.nim}0{activeVaModal.cicilanKe}
                  </span>
                  <button
                    onClick={() =>
                      handleCopyVa(
                        `${selectedBank === 'BCA' ? '88270' : selectedBank === 'MANDIRI' ? '89270' : '88390'}${student.nim}0${activeVaModal.cicilanKe}`
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200"
                  >
                    {copiedVa ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedVa ? 'Tersalin!' : 'Salin VA'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Simulation button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSimulatePayment}
                disabled={simulatedPaymentSuccess}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {simulatedPaymentSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Pembayaran Berhasil Diverifikasi!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simulasi Pembayaran Instan (Lunas)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                *Tombol ini merupakan simulasi pengujian sistem pembayaran lokal secara real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Official Payment Receipt / Bukti Pembayaran */}
      {activeReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-800">
            <button
              onClick={() => setActiveReceiptModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-2 border-b border-slate-200 pb-5">
              <div className="inline-flex p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl mb-1 border border-emerald-200">
                {activeReceiptModal.isKip ? <ShieldCheck className="w-8 h-8 text-amber-600" /> : <Receipt className="w-8 h-8" />}
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
                {activeReceiptModal.isKip ? 'SURAT KETERANGAN BEBAS BIAYA UKT' : 'KUITANSI BUKTI PEMBAYARAN RESMI'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                UNIVERSITAS AKADESI • NO. REG: TRX-{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>

            {/* Receipt Table */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Nama Mahasiswa:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{student.nama}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">NIM:</span>
                  <span className="font-mono font-extrabold text-slate-800">{student.nim}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Program Studi / Jurusan:</span>
                  <span className="font-bold text-slate-800">{jurusan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Semester Ajaran:</span>
                  <span className="font-extrabold text-teal-700">{activeReceiptModal.semesterAjaran}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Rincian Pembayaran:</span>
                  <span className="font-bold text-slate-800">{activeReceiptModal.judul}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Metode Transaksi:</span>
                  <span className="font-bold text-slate-800">{activeReceiptModal.metode}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tanggal Pembayaran:</span>
                  <span className="font-bold text-slate-800">{activeReceiptModal.paidDate}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-extrabold text-slate-700">Total Yang Dibayarkan:</span>
                <span className={`text-xl font-black ${activeReceiptModal.isKip ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {activeReceiptModal.isKip ? 'Rp 0 (BEBAS KIP)' : formatRupiah(activeReceiptModal.nominal)}
                </span>
              </div>
            </div>

            {/* Official Stamp */}
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Dokumen ini disahkan secara digital oleh Biro Keuangan Akadesi.</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-300"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF / Print</span>
              </button>
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="flex-1 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center gap-2"
              >
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="12 16v-4" />
      <path d="12 8h.01" />
    </svg>
  )
}
