import { Link, useRouter } from '@tanstack/react-router'
import type { UserSession } from '../lib/auth'
import { logoutFn } from '../server/functions/logoutFn'
import { useState } from 'react'

interface HeaderProps {
  session: UserSession | null
}

export default function Header({ session }: HeaderProps) {
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutFn()
      router.invalidate()
    } catch (err) {
      console.error('Gagal logout:', err)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center justify-between py-3.5">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline transition-all duration-200 hover:border-[var(--sea-ink-soft)]"
          >
            <svg
              className="h-4.5 w-4.5 text-[var(--sea-ink)] transition-transform duration-200 group-hover:scale-95"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-bold tracking-tight">Akadesi</span>
          </Link>

          {/* Desktop Navigation Links */}
          {session && (
            <div className="hidden md:flex items-center gap-5 text-sm font-semibold">
              <Link
                to="/mahasiswa/dashboard"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                Dashboard
              </Link>
              <Link
                to="/mahasiswa/jadwal"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                Jadwal
              </Link>
              <Link
                to="/mahasiswa/krs"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                KRS
              </Link>
              <Link
                to="/mahasiswa/khs"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                KHS
              </Link>
              <Link
                to="/mahasiswa/pengumuman"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                Pengumuman
              </Link>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <span className="block text-xs font-bold text-[var(--sea-ink)] leading-none">{session.nama}</span>
                <span className="text-[10px] font-mono text-[var(--sea-ink-soft)] font-medium">NIM: {session.nim}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-600 cursor-pointer transition-all active:scale-95"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center py-1.5 px-4 rounded-lg text-xs font-bold text-[var(--sand)] bg-[var(--sea-ink)] hover:bg-[var(--sea-ink-soft)] transition-all cursor-pointer"
              >
                Masuk Portal
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          {session && (
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] md:hidden hover:border-[var(--sea-ink-soft)] transition-all cursor-pointer"
            >
              {isMobileOpen ? (
                <svg className="h-5 w-5 text-[var(--sea-ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-[var(--sea-ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {session && isMobileOpen && (
        <div className="md:hidden border-t border-[var(--line)] py-3 px-1 flex flex-col gap-3 rise-in">
          <div className="flex flex-col gap-2 font-semibold text-sm">
            <Link
              to="/mahasiswa/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[var(--surface-strong)] hover:text-[var(--sea-ink)] transition-colors text-[var(--sea-ink-soft)]"
              activeProps={{ className: 'px-3 py-2 rounded-lg bg-[var(--surface-strong)] text-[var(--sea-ink)]' }}
            >
              Dashboard
            </Link>
            <Link
              to="/mahasiswa/jadwal"
              onClick={() => setIsMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[var(--surface-strong)] hover:text-[var(--sea-ink)] transition-colors text-[var(--sea-ink-soft)]"
              activeProps={{ className: 'px-3 py-2 rounded-lg bg-[var(--surface-strong)] text-[var(--sea-ink)]' }}
            >
              Jadwal
            </Link>
            <Link
              to="/mahasiswa/krs"
              onClick={() => setIsMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[var(--surface-strong)] hover:text-[var(--sea-ink)] transition-colors text-[var(--sea-ink-soft)]"
              activeProps={{ className: 'px-3 py-2 rounded-lg bg-[var(--surface-strong)] text-[var(--sea-ink)]' }}
            >
              KRS
            </Link>
            <Link
              to="/mahasiswa/khs"
              onClick={() => setIsMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[var(--surface-strong)] hover:text-[var(--sea-ink)] transition-colors text-[var(--sea-ink-soft)]"
              activeProps={{ className: 'px-3 py-2 rounded-lg bg-[var(--surface-strong)] text-[var(--sea-ink)]' }}
            >
              KHS
            </Link>
            <Link
              to="/mahasiswa/pengumuman"
              onClick={() => setIsMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[var(--surface-strong)] hover:text-[var(--sea-ink)] transition-colors text-[var(--sea-ink-soft)]"
              activeProps={{ className: 'px-3 py-2 rounded-lg bg-[var(--surface-strong)] text-[var(--sea-ink)]' }}
            >
              Pengumuman
            </Link>
          </div>

          <div className="border-t border-[var(--line)] pt-3 pb-1 flex items-center justify-between px-3">
            <div>
              <span className="block text-xs font-bold text-[var(--sea-ink)]">{session.nama}</span>
              <span className="text-[10px] font-mono text-[var(--sea-ink-soft)]">NIM: {session.nim}</span>
            </div>
            <button
              onClick={() => {
                setIsMobileOpen(false)
                handleLogout()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-bold text-red-600 cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
