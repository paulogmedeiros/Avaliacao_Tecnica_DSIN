const navigation = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Agendamentos', href: '/admin/agendamentos', icon: 'calendar' },
]

export function getAdminNavigation(pathname) {
  return navigation.map((item) => ({
    ...item,
    isActive: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }))
}
