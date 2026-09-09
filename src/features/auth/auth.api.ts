import { apiFetch } from '@/lib/api'

export const USER_ROLES = ['admin', 'instructor', 'member'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  /** Cookie lifetime in seconds. */
  expiresIn: number
}

/** POST /api/auth/login — sets the httpOnly `yoga_cms_token` cookie on success. */
export function login(input: LoginInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/** GET /api/auth/me — re-reads the user so role changes take effect. */
export function fetchCurrentUser(): Promise<{ user: AuthUser }> {
  return apiFetch<{ user: AuthUser }>('/auth/me')
}

/** POST /api/auth/logout — clears the auth cookie. */
export function logout(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' })
}
