import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchUsers } from './user.api'

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
}

export const usersQueryOptions = queryOptions({
  queryKey: userKeys.list(),
  queryFn: fetchUsers,
})

export function useUsers() {
  return useQuery(usersQueryOptions)
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'админ',
  instructor: 'багш',
}

/** Falls back to the raw role so a new backend role is visible, not blank. */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role
}

const dateFormatter = new Intl.DateTimeFormat('mn-MN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}
