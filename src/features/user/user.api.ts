import { apiFetch } from '@/lib/api'
import type { UserRole } from '@/features/auth/auth.api'

export interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
}

/**
 * GET /api/users
 *
 * Note: yoga-cms-backend has `listUsers()` in user.service.ts but does not
 * route it yet, so this 404s until a user controller is mounted.
 */
export function fetchUsers(): Promise<{ users: User[] }> {
  return apiFetch<{ users: User[] }>('/users')
}
