import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setSession } from '../../lib/auth'
import { redirect } from '@tanstack/react-router'
import { getSupabaseServerClient } from '../../lib/supabase-server'

const loginSchema = z.object({
  nim: z.string().min(1, 'NIM tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
})

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { nim, password } = data

    // Gunakan Supabase JS (HTTP-based) agar bekerja di Cloudflare Workers maupun Node.js
    const supabase = getSupabaseServerClient()

    const { data: mhs, error } = await supabase
      .from('mahasiswa')
      .select('id, nim, nama, password_hash')
      .eq('nim', nim)
      .single()

    if (error || !mhs) {
      throw new Error('NIM atau Password salah')
    }

    // Cek password (plain text untuk MVP ini)
    if (mhs.password_hash !== password) {
      throw new Error('NIM atau Password salah')
    }

    // Set session di httpOnly cookie
    setSession({
      id: mhs.id,
      nim: mhs.nim,
      nama: mhs.nama,
    })

    // Berhasil login, redirect ke dashboard
    throw redirect({
      to: '/mahasiswa/dashboard',
    })
  })
