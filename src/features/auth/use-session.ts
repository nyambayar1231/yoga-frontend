import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import { fetchCurrentUser, logout, type AuthUser } from './auth.api'

export const authKeys = {
  session: ['auth', 'session'] as const,
}

/**
 * The signed-in user, or null when there is no valid cookie. A 401 is the
 * expected answer for a guest, so it resolves to null instead of throwing.
 */
export const sessionQueryOptions = queryOptions({
  queryKey: authKeys.session,
  queryFn: async (): Promise<AuthUser | null> => {
    try {
      const { user } = await fetchCurrentUser()
      return user
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  },
  retry: false,
  staleTime: 5 * 60 * 1000,
})

export function useSession() {
  return useQuery(sessionQueryOptions)
}

/**
 * Whether the signed-in user may perform admin-only writes. The backend is
 * still the enforcement point — this only avoids offering a button that would
 * come back 403.
 */
export function useIsAdmin(): boolean {
  const { data: user } = useSession()
  return user?.role === 'admin'
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Drop every cached query: none of it belongs to the next user.
      queryClient.clear()
      queryClient.setQueryData(authKeys.session, null)
    },
  })
}
