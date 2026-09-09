import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/features/auth/use-session'
import RouteFallback from './RouteFallback'

/** Guards everything behind a valid session cookie. */
function RequireAuth() {
  const { data: user, isPending } = useSession()
  const location = useLocation()

  if (isPending) return <RouteFallback />

  if (!user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default RequireAuth
