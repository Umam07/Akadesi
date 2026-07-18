import { createServerFn } from '@tanstack/react-start'
import { getSession, clearSession } from '../../lib/auth'
import { db } from '../../db'
import { mahasiswa } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  return getSession()
})

export const verifyStudentSession = createServerFn({ method: 'GET' }).handler(async () => {
  const session = getSession()
  if (!session) return null

  // Verify student exists in current database
  const exists = await db.query.mahasiswa.findFirst({
    where: eq(mahasiswa.id, session.id),
    columns: { id: true }
  })

  if (!exists) {
    clearSession()
    return null
  }

  return session
})

