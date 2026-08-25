export function confirmAdminAppointment(appointment) {
  if (appointment.status !== 'Pendente') return appointment

  return {
    ...appointment,
    status: 'Confirmado',
    services: appointment.services.map((service) => service.status === 'Pendente'
      ? { ...service, status: 'Confirmado' }
      : service),
  }
}
