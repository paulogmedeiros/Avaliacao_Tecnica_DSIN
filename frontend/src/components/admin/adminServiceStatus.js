export function updateAdminServiceStatus(appointment, serviceId, status) {
  if (appointment.status === 'Concluído' || appointment.status === 'Cancelado') return appointment
  if (!appointment.services.some((service) => service.id === serviceId)) return appointment

  const services = appointment.services.map((service) => service.id === serviceId ? { ...service, status } : service)
  const statuses = services.map((service) => service.status)
  let appointmentStatus = appointment.status

  if (statuses.every((serviceStatus) => serviceStatus === 'Concluído')) {
    appointmentStatus = 'Concluído'
  } else if (statuses.every((serviceStatus) => serviceStatus === 'Cancelado')) {
    appointmentStatus = 'Cancelado'
  } else if (statuses.every((serviceStatus) => ['Confirmado', 'Concluído', 'Cancelado'].includes(serviceStatus))) {
    appointmentStatus = 'Confirmado'
  }

  return { ...appointment, status: appointmentStatus, services }
}

export function cancelAdminAppointment(appointment) {
  if (appointment.status === 'Concluído' || appointment.status === 'Cancelado') return appointment
  return {
    ...appointment,
    status: 'Cancelado',
    services: appointment.services.map((service) => ({ ...service, status: 'Cancelado' })),
  }
}
