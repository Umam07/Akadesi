import { Link, useRouter, useLocation, isRedirect } from '@tanstack/react-router'
import type { UserSession } from '../lib/auth'
import { logoutFn } from '../server/functions/logoutFn'
import { useState, useRef, useEffect } from 'react'
import AkadesiLogo from './AkadesiLogo'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Megaphone,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  BookOpen,
  Wallet,
} from 'lucide-react'

interface HeaderProps {
  session: UserSession | null
}

const AKADEMIK_LINKS = [
  {
    to: '/mahasiswa/matakuliah',
    label: 'Mata Kuliah',
    desc: 'Daftar kurikulum & SKS',
    icon: BookOpen,
  },
  {
    to: '/mahasiswa/jadwal',
    label: 'Jadwal Perkuliahan',
    desc: 'Jadwal harian & ujian UTS/UAS',
    icon: CalendarDays,
  },
  {
    to: '/mahasiswa/krs',
    label: 'Kartu Rencana Studi',
    desc: 'Pengisian KRS & rencana studi',
    icon: ClipboardList,
  },
  {
    to: '/mahasiswa/khs',
    label: 'Kartu Hasil Studi',
    desc: 'Nilai semester, IPS & IPK',
    icon: GraduationCap,
  },
] as const

// Generate a consistent hue from a name string
function nameToHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

export function AvatarInitial({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  const hue = nameToHue(name)

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: `hsl(${hue}, 45%, 88%)`,
        border: `2px solid hsl(${hue}, 38%, 78%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fontWeight: 800,
        color: `hsl(${hue}, 40%, 28%)`,
        letterSpacing: '0.03em',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  )
}

export default function Header({ session }: HeaderProps) {
  const router = useRouter()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAkademikOpen, setIsAkademikOpen] = useState(false)
  
  const profileRef = useRef<HTMLDivElement>(null)
  const akademikRef = useRef<HTMLDivElement>(null)

  const isAkademikActive = AKADEMIK_LINKS.some((item) =>
    location.pathname.startsWith(item.to)
  )

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
      if (akademikRef.current && !akademikRef.current.contains(e.target as Node)) {
        setIsAkademikOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    setIsProfileOpen(false)
    setIsAkademikOpen(false)
    setIsMobileOpen(false)
    try {
      await logoutFn()
      await router.invalidate()
    } catch (err) {
      if (isRedirect(err)) {
        await router.navigate(err.options)
        await router.invalidate()
        return
      }
      console.error('Gagal logout:', err)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-lg">
      <nav className="page-wrap relative flex items-center justify-between py-0" style={{ height: 60 }}>

        {/* Brand Logo */}
        <Link
          to="/"
          className="z-10 no-underline"
          style={{ textDecoration: 'none' }}
        >
          <AkadesiLogo size={34} variant="full" showSubtitle={true} />
        </Link>

        {/* Desktop Nav Links (Grouped, Centered) */}
        {session && (
          <div className="hidden md:flex items-center gap-1 md:absolute md:left-1/2 md:-translate-x-1/2">
            {/* 1. Dashboard */}
            <Link
              to="/mahasiswa/dashboard"
              className="nav-pill"
              activeProps={{ className: 'nav-pill nav-pill-active' }}
            >
              <LayoutDashboard size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              Dashboard
            </Link>

            {/* 2. Akademik Dropdown */}
            <div className="relative" ref={akademikRef}>
              <button
                type="button"
                onClick={() => setIsAkademikOpen((v) => !v)}
                className={`nav-pill cursor-pointer border-none bg-transparent ${
                  isAkademikActive ? 'nav-pill-active' : ''
                }`}
                style={{ outline: 'none' }}
              >
                <GraduationCap size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span>Akademik</span>
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  style={{
                    transition: 'transform 180ms ease',
                    transform: isAkademikOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    opacity: 0.75,
                  }}
                />
              </button>

              {/* Akademik Dropdown Panel */}
              {isAkademikOpen && (
                <div
                  className="rise-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    left: 0,
                    width: 285,
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid var(--line)',
                    borderRadius: 16,
                    boxShadow: '0 16px 40px rgba(23,58,64,0.15), 0 2px 10px rgba(23,58,64,0.08)',
                    padding: '8px',
                    backdropFilter: 'blur(12px)',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: '6px 10px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'var(--sea-ink-soft)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      borderBottom: '1px solid var(--line)',
                      marginBottom: 6,
                    }}
                  >
                    Layanan Akademik
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {AKADEMIK_LINKS.map(({ to, label, desc, icon: Icon }) => {
                      const isActive = location.pathname.startsWith(to)
                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setIsAkademikOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 10px',
                            borderRadius: 12,
                            textDecoration: 'none',
                            transition: 'all 140ms ease',
                            background: isActive
                              ? 'color-mix(in oklab, var(--lagoon) 16%, var(--surface-strong))'
                              : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'var(--surface-strong)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent'
                            }
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
                              background: isActive
                                ? 'var(--sea-ink)'
                                : 'color-mix(in oklab, var(--sand) 70%, white)',
                              color: isActive ? 'var(--sand)' : 'var(--sea-ink)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'all 140ms ease',
                            }}
                          >
                            <Icon size={16} strokeWidth={2.2} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: isActive ? 800 : 700,
                                color: 'var(--sea-ink)',
                                lineHeight: 1.2,
                              }}
                            >
                              {label}
                            </span>
                            <span
                              style={{
                                display: 'block',
                                fontSize: 10.5,
                                fontWeight: 500,
                                color: 'var(--sea-ink-soft)',
                                lineHeight: 1.2,
                                marginTop: 2,
                              }}
                            >
                              {desc}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Keuangan */}
            <Link
              to="/mahasiswa/keuangan"
              className="nav-pill"
              activeProps={{ className: 'nav-pill nav-pill-active' }}
            >
              <Wallet size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              Keuangan
            </Link>

            {/* 4. Pengumuman */}
            <Link
              to="/mahasiswa/pengumuman"
              className="nav-pill"
              activeProps={{ className: 'nav-pill nav-pill-active' }}
            >
              <Megaphone size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              Pengumuman
            </Link>
          </div>
        )}

        {/* Right: Profile + Mobile Toggle */}
        <div className="flex items-center gap-2 z-10">

          {/* Desktop Profile Dropdown */}
          {session && (
            <div className="hidden md:block relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-transparent hover:border-[var(--line)] hover:bg-[var(--surface-strong)] transition-all duration-150 cursor-pointer"
                style={{ outline: 'none' }}
              >
                <AvatarInitial name={session.nama} />
                <div className="text-left">
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--sea-ink)',
                      lineHeight: 1.2,
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {session.nama.split(' ')[0]}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--sea-ink-soft)',
                      fontFamily: 'monospace',
                      lineHeight: 1.2,
                    }}
                  >
                    {session.nim}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  style={{
                    color: 'var(--sea-ink-soft)',
                    transition: 'transform 180ms ease',
                    transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Profile Dropdown Panel */}
              {isProfileOpen && (
                <div
                  className="rise-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 240,
                    background: 'rgba(255,255,255,0.97)',
                    border: '1px solid var(--line)',
                    borderRadius: 16,
                    boxShadow: '0 12px 40px rgba(23,58,64,0.14), 0 2px 8px rgba(23,58,64,0.08)',
                    overflow: 'hidden',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                  }}
                >
                  {/* Profile header inside dropdown */}
                  <div
                    style={{
                      padding: '16px 16px 12px',
                      background: 'linear-gradient(135deg, var(--sand) 0%, var(--foam) 100%)',
                      borderBottom: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <AvatarInitial name={session.nama} />
                    <div style={{ minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 13,
                          fontWeight: 800,
                          color: 'var(--sea-ink)',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {session.nama}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 11,
                          color: 'var(--sea-ink-soft)',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        NIM: {session.nim}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 6,
                          fontSize: 9,
                          fontWeight: 800,
                          color: '#047857',
                          background: '#f0fdf4',
                          border: '1px solid rgba(4,120,87,0.15)',
                          borderRadius: 6,
                          padding: '2px 6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                        Mahasiswa Aktif
                      </span>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <div style={{ padding: '8px 8px 0px 8px', borderBottom: '1px solid var(--line)' }}>
                    <Link
                      to="/mahasiswa/profil"
                      onClick={() => setIsProfileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '9px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--sea-ink)',
                        fontFamily: 'Manrope, sans-serif',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-strong)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <User size={15} strokeWidth={2.5} style={{ color: 'var(--sea-ink-soft)' }} />
                      Detail Profil Saya
                    </Link>
                  </div>

                  {/* Logout */}
                  <div style={{ padding: '8px 8px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '9px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#dc2626',
                        fontFamily: 'Manrope, sans-serif',
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220,38,38,0.07)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={15} strokeWidth={2.5} />
                      Keluar dari Akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger */}
          {session && (
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] md:hidden hover:border-[var(--sea-ink-soft)] transition-all cursor-pointer"
            >
              {isMobileOpen
                ? <X size={18} strokeWidth={2.5} style={{ color: 'var(--sea-ink)' }} />
                : <Menu size={18} strokeWidth={2.5} style={{ color: 'var(--sea-ink)' }} />
              }
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {session && isMobileOpen && (
        <div className="md:hidden border-t border-[var(--line)] rise-in">
          {/* Profile card at top of mobile drawer */}
          <Link
            to="/mahasiswa/profil"
            onClick={() => setIsMobileOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: 'linear-gradient(135deg, var(--sand) 0%, var(--foam) 100%)',
              borderBottom: '1px solid var(--line)',
              textDecoration: 'none',
            }}
            className="hover:opacity-90 active:scale-[0.99] transition-all"
          >
            <AvatarInitial name={session.nama} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--sea-ink)', lineHeight: 1.3 }}>
                {session.nama}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--sea-ink-soft)', fontFamily: 'monospace', fontWeight: 600 }}>
                NIM: {session.nim}
              </span>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 9,
                fontWeight: 800,
                color: '#047857',
                background: '#f0fdf4',
                border: '1px solid rgba(4,120,87,0.15)',
                borderRadius: 6,
                padding: '2px 6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              <span style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
              Aktif
            </span>
          </Link>

          {/* Mobile nav links */}
          <div style={{ padding: '8px' }}>
            {/* Dashboard */}
            <Link
              to="/mahasiswa/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="mobile-nav-link"
              activeProps={{ className: 'mobile-nav-link mobile-nav-link-active' }}
            >
              <LayoutDashboard size={16} strokeWidth={2.2} />
              Dashboard
            </Link>

            {/* Akademik Group */}
            <div style={{ margin: '6px 0', padding: '4px 0', borderTop: '1px dashed var(--line)', borderBottom: '1px dashed var(--line)' }}>
              <div
                style={{
                  padding: '4px 12px 6px',
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--sea-ink-soft)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Akademik
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {AKADEMIK_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMobileOpen(false)}
                    className="mobile-nav-link"
                    activeProps={{ className: 'mobile-nav-link mobile-nav-link-active' }}
                    style={{ paddingLeft: 16 }}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Keuangan */}
            <Link
              to="/mahasiswa/keuangan"
              onClick={() => setIsMobileOpen(false)}
              className="mobile-nav-link"
              activeProps={{ className: 'mobile-nav-link mobile-nav-link-active' }}
            >
              <Wallet size={16} strokeWidth={2.2} />
              Keuangan
            </Link>

            {/* Pengumuman */}
            <Link
              to="/mahasiswa/pengumuman"
              onClick={() => setIsMobileOpen(false)}
              className="mobile-nav-link"
              activeProps={{ className: 'mobile-nav-link mobile-nav-link-active' }}
            >
              <Megaphone size={16} strokeWidth={2.2} />
              Pengumuman
            </Link>
          </div>

          {/* Mobile logout */}
          <div
            style={{
              padding: '8px 8px 12px',
              borderTop: '1px solid var(--line)',
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid rgba(220,38,38,0.2)',
                background: 'rgba(220,38,38,0.05)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: '#dc2626',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              <LogOut size={15} strokeWidth={2.5} />
              Keluar dari Akun
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

