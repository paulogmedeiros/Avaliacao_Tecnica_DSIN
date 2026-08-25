export type AdminNavigationItem = {
  label: string
  href: string
  icon: 'dashboard' | 'calendar'
  isActive: boolean
}

export function getAdminNavigation(pathname: string): AdminNavigationItem[]
