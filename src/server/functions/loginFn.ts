import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../../db'
import { mahasiswa } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { setSession } from '../../lib/auth'
import { redirect } from '@tanstack/react-router'

const loginSchema = z.object({
  nim: z.string().min(1, 'NIM tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
})

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { nim, password } = data

    // Cari mahasiswa berdasarkan NIM
    const mhs = await db.query.mahasiswa.findFirst({
      where: eq(mahasiswa.nim, nim),
    })

    if (!mhs) {
      throw new Error('NIM atau Password salah')
    }

    // Dummy password check: in a real app, use bcrypt.compare
    // For this MVP, we match plain text hash
    if (mhs.passwordHash !== password) {
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
