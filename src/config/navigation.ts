import { House, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

/** Single source of truth for the sidebar and the layout's title bar. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Нүүр', icon: House },
  { to: '/users', label: 'Хэрэглэгчид', icon: Users },
]
