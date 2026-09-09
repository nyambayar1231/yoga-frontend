import { apiFetch } from '@/lib/api'

export const USER_ROLES = ['admin', 'instructor'] as const

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
