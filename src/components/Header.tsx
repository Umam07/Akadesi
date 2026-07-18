import { Link, useRouter, isRedirect } from '@tanstack/react-router'
import type { UserSession } from '../lib/auth'
import { logoutFn } from '../server/functions/logoutFn'
import { useState, useRef, useEffect } from 'react'
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
  ShieldCheck,
  User,
} from 'lucide-react'

interface HeaderProps {
  session: UserSession | null
}

const NAV_LINKS = [
  { to: '/mahasiswa/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/mahasiswa/jadwal',   label: 'Jadwal',    icon: CalendarDays },
  { to: '/mahasiswa/krs',      label: 'KRS',       icon: ClipboardList },
  { to: '/mahasiswa/khs',      label: 'KHS',       icon: GraduationCap },
  { to: '/mahasiswa/pengumuman', label: 'Pengumuman', icon: Megaphone },
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
        fontFamily: 'Manrope, sans-serif',
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
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    setIsProfileOpen(false)
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
      <nav className="page-wrap flex items-center justify-between py-0" style={{ height: 60 }}>

        {/* Left: Brand + Nav Links */}
        <div className="flex items-center gap-12 md:gap-16">

          {/* Brand Logo */}
          <Link
            to="/"
            className="group inline-flex items-center gap-2 no-underline"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'var(--sea-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 180ms ease',
              }}
              className="group-hover:scale-95"
            >
              <ShieldCheck size={17} strokeWidth={2.5} color="var(--sand)" />
            </div>
            <span
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontWeight: 700,
                fontSize: 17,
                color: 'var(--sea-ink)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Akadesi
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {session && (
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="nav-pill"
                  activeProps={{ className: 'nav-pill nav-pill-active' }}
                >
                  <Icon size={14} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Profile + Mobile Toggle */}
        <div className="flex items-center gap-2">

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

              {/* Dropdown Panel */}
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
          <div style={{ padding: '8px 8px' }}>
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileOpen(false)}
                className="mobile-nav-link"
                activeProps={{ className: 'mobile-nav-link mobile-nav-link-active' }}
              >
                <Icon size={16} strokeWidth={2.2} />
                {label}
              </Link>
            ))}
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
