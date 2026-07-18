import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthSession } from '../server/functions/authFn'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getAuthSession()
    if (session) {
      throw redirect({
        to: '/mahasiswa/dashboard',
      })
    } else {
      throw redirect({
        to: '/login',
      })
    }
  },
})

