import { createServerFn } from '@tanstack/react-start'
import { getSession } from '../../lib/auth'

export const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  return getSession()
})
