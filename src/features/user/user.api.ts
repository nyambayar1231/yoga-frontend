import { apiFetch } from '@/lib/api'
import type { UserRole } from '@/features/auth/auth.api'

export interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  /** ISO 8601 timestamp. */
  createdAt: string
  /** ISO 8601 timestamp. */
  updatedAt: string
}

export interface UsersResponse {
  users: User[]
  /** Full match count, so a capped page is detectable. */
  total: number
  limit: number
  skip: number
}

/** GET /api/users — requires a valid auth cookie. */
export function fetchUsers(): Promise<UsersResponse> {
  return apiFetch<UsersResponse>('/users')
}
