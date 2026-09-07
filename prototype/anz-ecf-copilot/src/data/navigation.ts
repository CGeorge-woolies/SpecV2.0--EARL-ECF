import type { NavItem } from '@/types'

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'order-summary',
    label: 'Order Summary',
    icon: 'dashboard',
    path: '/order-summary',
  },
  {
    id: 'dash',
    label: 'Real Time Performance',
    icon: 'dashboard',
    path: '/dash',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    path: '/settings',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'analytics',
    path: '/reports',
  },
  {
    id: 'search-orders',
    label: 'Search Orders',
    icon: 'search',
    path: '/search-orders',
  },
]

export function findNavLabel(pathname: string, items: NavItem[] = NAV_ITEMS): string | null {
  for (const item of items) {
    if (item.path && item.path === pathname) return item.label
    if (item.children) {
      const found = findNavLabel(pathname, item.children)
      if (found) return found
    }
  }
  return null
}
