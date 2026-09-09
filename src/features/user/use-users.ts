import { queryOptions, useQuery } from '@tanstack/react-query'
import type { UserRole } from '@/features/auth/auth.api'
import { fetchUsers, type UsersFilter } from './user.api'

export const userKeys = {
  all: ['users'] as const,
  list: (filter: UsersFilter = {}) => [...userKeys.all, 'list', filter] as const,
}

export function usersQueryOptions(filter: UsersFilter = {}) {
  return queryOptions({
    queryKey: userKeys.list(filter),
    queryFn: () => fetchUsers(filter),
    // The table only needs the rows; the envelope's paging fields are the
    // backend's, and nothing renders them yet.
    select: (page) => page.data,
  })
}

export function useUsers(filter: UsersFilter = {}) {
  return useQuery(usersQueryOptions(filter))
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'админ',
  instructor: 'багш',
  member: 'гишүүн',
}

/** Falls back to the raw role so a new backend role is visible, not blank. */
export function roleLabel(role: UserRole | string): string {
  return ROLE_LABELS[role] ?? role
}
