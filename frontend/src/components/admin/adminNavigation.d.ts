export type AdminNavigationItem = {
  label: string
  href: string
  icon: 'dashboard' | 'calendar' | 'services'
  isActive: boolean
}

export function getAdminNavigation(pathname: string): AdminNavigationItem[]
