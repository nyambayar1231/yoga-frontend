import { GraduationCap, House, School, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/features/auth/auth.api'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Roles allowed to open the page. Omitted means everyone signed in. */
  roles?: readonly UserRole[]
}

/** Single source of truth for the sidebar and the layout's title bar. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Нүүр', icon: House },
  // Reads /api/teachers — any signed-in user may look teachers up.
  { to: '/teachers', label: 'Багш нар', icon: UsersRound },
  // Reads /api/students, which is staff-only (admin or teacher).
  { to: '/students', label: 'Сурагчид', icon: GraduationCap, roles: ['admin', 'teacher'] },
  // Reads /api/classes — any signed-in user may look classes up.
  { to: '/classes', label: 'Ангиуд', icon: School },
]

/**
 * The pages this role can actually open. The backend is still the enforcement
 * point — this only avoids showing doors that answer 403.
 */
export function navItemsFor(role: UserRole | undefined): NavItem[] {
  if (role === undefined) return []
  return NAV_ITEMS.filter((item) => item.roles === undefined || item.roles.includes(role))
}
