import { getCookie, setCookie } from '@tanstack/react-start/server'

const SESSION_COOKIE_NAME = 'akadesi_session'

export type UserSession = {
  id: string
  nim: string
  nama: string
}

export function getSession(): UserSession | null {
  const sessionData = getCookie(SESSION_COOKIE_NAME)
  if (!sessionData) return null
  
  try {
    return JSON.parse(sessionData) as UserSession
  } catch {
    return null
  }
}

export function setSession(data: UserSession) {
  setCookie(SESSION_COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
}

export function clearSession() {
  setCookie(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
}
