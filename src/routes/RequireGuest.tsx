import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/features/auth/use-session'
import RouteFallback from './RouteFallback'

/** Keeps a signed-in user out of the login page. */
function RequireGuest() {
  const { data: user, isPending } = useSession()
  const location = useLocation()

  if (isPending) return <RouteFallback />

  if (user) {
    // Return them to whatever RequireAuth bounced them away from.
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }

  return <Outlet />
}

export default RequireGuest
