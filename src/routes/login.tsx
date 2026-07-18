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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await loginFn({ data: { nim, password } })
      // router.invalidate() is handled automatically by TanStack Start on navigation, but we call it just in case
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
    <div className="min-h-screen bg-[var(--sand)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--chip-bg)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--sea-ink-soft)] border border-[var(--line)]">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Sistem Akademik
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold text-[var(--sea-ink)] tracking-tight display-title">
          Masuk ke Akadesi
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--sea-ink-soft)] font-medium">
          SIAKAD Modern Universitas YARSI
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--surface-strong)] py-8 px-4 border border-[var(--line)] sm:rounded-xl sm:px-10 transition-colors duration-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 rounded-lg text-xs text-red-600 font-semibold">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="nim" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] mb-1.5">
                NIM (Nomor Induk Mahasiswa)
              </label>
              <div>
                <input
                  id="nim"
                  name="nim"
                  type="text"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)]/30 rounded-lg focus:outline-none focus:border-[var(--sea-ink)] transition-colors text-sm font-sans"
                  placeholder="Masukkan NIM Anda"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-3.5 pr-10 py-2.5 border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)]/30 rounded-lg focus:outline-none focus:border-[var(--sea-ink)] transition-colors text-sm font-sans"
                  placeholder="••••••••"
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
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
            
            <div className="pt-5 border-t border-[var(--line)] mt-6">
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
                  className="text-left p-3.5 rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] hover:border-[var(--sea-ink)] transition-all duration-200 group cursor-pointer active:scale-[0.97]"
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
                  className="text-left p-3.5 rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] hover:border-[var(--sea-ink)] transition-all duration-200 group cursor-pointer active:scale-[0.97]"
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
    </div>
  )
}
