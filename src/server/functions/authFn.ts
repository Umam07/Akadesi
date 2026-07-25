import { createServerFn } from '@tanstack/react-start'
import { getSession, clearSession } from '../../lib/auth'
import { dbMiddleware } from '../../db/middleware'
import { mahasiswa } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const getAuthSession = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async () => {
    return getSession()
  })

export const verifyStudentSession = createServerFn({ method: 'GET' })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const session = getSession()
    if (!session) return null
    const db = context.db

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

