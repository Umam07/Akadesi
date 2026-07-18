import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getAuthSession } from '../../server/functions/authFn'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getAuthSession()
    if (!session) {
      throw redirect({
        to: '/login',
      })
    }
    return { session }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Outlet />
    </div>
  )
}
