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

/**
 * The login attached to a student profile, or null when they have none. Anything
 * addressed to a student — an email, a password reset — needs the account id,
 * and the profile does not carry it.
 */
export function useStudentAccount(studentId: string | null, enabled = true) {
  return useQuery({
    ...usersQueryOptions({ role: 'student', studentId: studentId ?? undefined, limit: 1 }),
    // One profile, one login: the list is a lookup, not a page to render.
    select: (page) => page.data[0] ?? null,
    enabled: enabled && studentId !== null,
  })
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'админ',
  teacher: 'багш',
  student: 'сурагч',
}

/** Falls back to the raw role so a new backend role is visible, not blank. */
export function roleLabel(role: UserRole | string): string {
  return ROLE_LABELS[role] ?? role
}
