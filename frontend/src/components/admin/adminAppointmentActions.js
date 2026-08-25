export function getAdminAppointmentActions(status) {
  if (status === 'Pendente') return ['confirm', 'edit', 'cancel']
  if (status === 'Confirmado') return ['edit', 'cancel']
  return []
}
