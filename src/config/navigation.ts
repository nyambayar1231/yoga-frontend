import { CalendarDays, House, Layers, UserRound, UsersRound } from 'lucide-react'
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
  { to: '/schedule', label: 'Хуваарь', icon: CalendarDays },
  { to: '/class-types', label: 'Хичээлийн төрөл', icon: Layers },
  // Reads /api/users, which is admin-only.
  { to: '/instructors', label: 'Багш нар', icon: UserRound, roles: ['admin'] },
  // Reads /api/members, which is staff-only.
  { to: '/members', label: 'Гишүүд', icon: UsersRound, roles: ['admin', 'instructor'] },
]

/**
 * The pages this role can actually open. The backend is still the enforcement
 * point — this only avoids showing doors that answer 403.
 */
export function navItemsFor(role: UserRole | undefined): NavItem[] {
  if (role === undefined) return []
  return NAV_ITEMS.filter((item) => item.roles === undefined || item.roles.includes(role))
}
