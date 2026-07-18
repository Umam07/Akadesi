import { createFileRoute, useRouter, redirect, isRedirect } from '@tanstack/react-router'
import { loginFn } from '../server/functions/loginFn'
import { getAuthSession } from '../server/functions/authFn'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const session = await getAuthSession()
    if (session) {
      throw redirect({
        to: '/mahasiswa/dashboard',
      })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [nim, setNim] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'bsi' | 'mandiri' | 'bni'>('bsi')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await loginFn({ data: { nim, password } })
      router.invalidate()
    } catch (err: any) {
      if (isRedirect(err)) {
        await router.navigate(err.options)
        await router.invalidate()
        return
      }
      setError(err.message || 'Terjadi kesalahan saat login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start rise-in">
          
          {/* Left Column: Form Login */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-center lg:text-left space-y-3 px-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--sea-ink-soft)] border border-[var(--line)]">
                <svg className="h-3 w-3 text-[var(--lagoon-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Sistem Akademik
              </div>
              <h2 className="text-3xl font-extrabold text-[var(--sea-ink)] tracking-tight display-title">
                Masuk ke Akadesi
              </h2>
              <p className="text-sm text-[var(--sea-ink-soft)] font-medium">
                Portal Mahasiswa Modern Universitas YARSI
              </p>
            </div>

            <div className="bg-[var(--surface-strong)] py-8 px-6 border border-[var(--line)] rounded-2xl shadow-xl backdrop-blur-sm transition-colors duration-200">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="border border-red-500/20 bg-red-500/5 px-4 py-3 rounded-lg text-xs text-red-600 font-semibold flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                <div>
                  <label htmlFor="nim" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] mb-1.5">
                    NIM (Nomor Induk Mahasiswa)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--sea-ink-soft)]/50">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="nim"
                      name="nim"
                      type="text"
                      required
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-3.5 py-2.5 border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)]/30 rounded-lg focus:outline-none focus:border-[var(--sea-ink)] transition-colors text-sm font-sans"
                      placeholder="Masukkan NIM Anda"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--sea-ink-soft)]/50">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-9 pr-10 py-2.5 border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)]/30 rounded-lg focus:outline-none focus:border-[var(--sea-ink)] transition-colors text-sm font-sans"
                      placeholder="Masukkan Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.824 7.824L21 21m-2.78-.614a10.485 10.485 0 01-6.22 1.114M12 12A3 3 0 009.78 7.22M12 12a3 3 0 014.22 4.22" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.25">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-bold text-[var(--sand)] bg-[var(--sea-ink)] hover:bg-[var(--sea-ink-soft)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[var(--sand)]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Memproses...
                      </span>
                    ) : 'Masuk ke Portal'}
                  </button>
                </div>
                
                <div className="pt-4 border-t border-[var(--line)] mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] text-center mb-3">
                    Gunakan Kredensial Demo
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNim('123456789')
                        setPassword('dummy-hash-1')
                      }}
                      className="text-left p-3 rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] hover:border-[var(--sea-ink)] transition-all duration-200 group cursor-pointer active:scale-[0.97]"
                    >
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] group-hover:text-[var(--sea-ink)] transition-colors">
                        Mahasiswa 1
                      </span>
                      <span className="block text-xs font-mono font-semibold text-[var(--sea-ink)] mt-0.5">
                        123456789
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNim('987654321')
                        setPassword('dummy-hash-2')
                      }}
                      className="text-left p-3 rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] hover:border-[var(--sea-ink)] transition-all duration-200 group cursor-pointer active:scale-[0.97]"
                    >
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] group-hover:text-[var(--sea-ink)] transition-colors">
                        Mahasiswa 2
                      </span>
                      <span className="block text-xs font-mono font-semibold text-[var(--sea-ink)] mt-0.5">
                        987654321
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Payment Information Panel */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SPP Installment Confirmation Card */}
            <div className="bg-[var(--surface-strong)] border border-[var(--line)] border-l-4 border-l-[var(--lagoon)] rounded-2xl shadow-lg p-5 lg:p-6 backdrop-blur-sm transition-all hover:shadow-xl duration-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--sand)] rounded-xl text-[var(--sea-ink)] shrink-0">
                  <svg className="h-6 w-6 text-[var(--lagoon-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="12" y1="10" x2="12" y2="18" />
                    <line x1="8" y1="14" x2="16" y2="14" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-500/20">
                    Konfirmasi Cicilan
                  </span>
                  <h3 className="text-base font-bold text-[var(--sea-ink)]">
                    Konfirmasi Pembayaran Cicilan SPP
                  </h3>
                  <p className="text-xs text-[var(--sea-ink-soft)] leading-relaxed">
                    Bagi mahasiswa yang mengambil program cicilan SPP semester ini, harap mengirimkan bukti transfer cicilan agar KRS Anda dapat diproses dan disetujui secara manual oleh Bagian Keuangan.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://forms.gle/demo-cicilan-spp-yarsi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lagoon-deep)] hover:text-[var(--sea-ink)] hover:underline transition-colors"
                    >
                      <span>Formulir Konfirmasi Pembayaran Cicilan</span>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Virtual Account Payment Instructions Card */}
            <div className="bg-[var(--surface-strong)] border border-[var(--line)] rounded-2xl shadow-lg p-6 lg:p-8 backdrop-blur-sm transition-all hover:shadow-xl duration-200">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[var(--sand)] rounded-lg text-[var(--sea-ink)]">
                    <svg className="h-5 w-5 text-[var(--sea-ink)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--sea-ink)]">
                      Tata Cara Pembayaran Biaya Kuliah
                    </h3>
                    <p className="text-xs text-[var(--sea-ink-soft)]">
                      Gunakan Virtual Account (VA) resmi institusi untuk kelancaran transaksi.
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 border-b border-[var(--line)] pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bsi')}
                    className={`py-2 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'bsi'
                        ? 'bg-[var(--sea-ink)] text-[var(--sand)] border-[var(--sea-ink)] shadow-sm'
                        : 'border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    BSI (Utama)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mandiri')}
                    className={`py-2 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'mandiri'
                        ? 'bg-[var(--sea-ink)] text-[var(--sand)] border-[var(--sea-ink)] shadow-sm'
                        : 'border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    Mandiri
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bni')}
                    className={`py-2 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'bni'
                        ? 'bg-[var(--sea-ink)] text-[var(--sand)] border-[var(--sea-ink)] shadow-sm'
                        : 'border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    BNI
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="pt-2 animate-slide-down">
                  {activeTab === 'bsi' && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          1
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Buka aplikasi <strong>BSI Mobile</strong>, lalu pilih menu <strong>Pembayaran</strong> &gt; <strong>Akademik</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          2
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Masukkan Nama Institusi: <strong>Universitas YARSI</strong> atau ketik Kode Akademik <strong>8023</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          3
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Masukkan Nomor Virtual Account Anda (misal: <strong>8023 + NIM Anda</strong>).
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          4
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Masukkan PIN Anda. Layar konfirmasi akan menampilkan Nama Mahasiswa dan Nominal Tagihan. Pastikan sesuai sebelum melanjutkan transaksi.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'mandiri' && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          1
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Buka aplikasi <strong>Livin' by Mandiri</strong>, pilih menu <strong>Bayar</strong> &gt; <strong>Buat Pembayaran Baru</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          2
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Cari Penyedia Jasa / Institusi: Ketik <strong>Universitas YARSI</strong> atau Kode <strong>10023</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          3
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Masukkan nomor Virtual Account Mandiri YARSI Anda.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          4
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Layar konfirmasi akan menampilkan rincian pembayaran. Periksa data, klik konfirmasi, dan masukkan <strong>MPIN Mandiri</strong> Anda.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'bni' && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          1
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Akses <strong>BNI Mobile Banking</strong>, lalu pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account Billing</strong>.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          2
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Pilih rekening debet asal transfer Anda.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          3
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Masukkan Nomor Virtual Account BNI YARSI Anda pada kolom input VA.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--sea-ink)] text-[var(--sand)] text-[10px] font-bold shrink-0 mt-0.5">
                          4
                        </div>
                        <p className="text-xs text-[var(--sea-ink)] leading-relaxed">
                          Lakukan pengecekan detail nama mahasiswa dan jumlah transfer. Jika sesuai, masukkan <strong>Password Transaksi BNI</strong> Anda.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-[var(--sand)]/50 border border-[var(--line)] rounded-xl">
                  <p className="text-[10px] text-[var(--sea-ink-soft)] leading-normal flex items-start gap-1.5">
                    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--sea-ink-soft)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Layanan Virtual Account aktif 24 jam. Jika status akademik Anda belum ter-update dalam 15 menit setelah pembayaran, silakan hubungi BAAK melalui WhatsApp Support YARSI.</span>
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
