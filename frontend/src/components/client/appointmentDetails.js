export function getAppointmentById(appointments, appointmentId) {
  return appointments.find((appointment) => appointment.id === appointmentId) ?? null
}

export function formatAppointmentCount(count) {
  return `${count} ${count === 1 ? 'agendamento encontrado' : 'agendamentos encontrados'}`
}
