import { createServerFn } from '@tanstack/react-start'
import { getSession, clearSession } from '../../lib/auth'
import { getSupabaseServerClient } from '../../lib/supabase-server'

// getAuthSession: Hanya membaca cookie session, TIDAK butuh koneksi DB
export const getAuthSession = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getSession()
  })

export const verifyStudentSession = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = getSession()
    if (!session) return null

    // Gunakan Supabase JS (HTTP-based) agar bekerja di Cloudflare Workers
    const supabase = getSupabaseServerClient()

    const { data: exists, error } = await supabase
      .from('mahasiswa')
      .select('id')
      .eq('id', session.id)
      .single()

    if (error || !exists) {
      clearSession()
      return null
    }

    return session
  })
