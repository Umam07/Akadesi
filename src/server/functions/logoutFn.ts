import { createServerFn } from '@tanstack/react-start'
import { clearSession } from '../../lib/auth'
import { redirect } from '@tanstack/react-router'

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  clearSession()
  throw redirect({
    to: '/login',
  })
})
