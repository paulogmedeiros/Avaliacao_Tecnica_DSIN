export function getAppointmentById(appointments, appointmentId) {
  return appointments.find((appointment) => appointment.id === appointmentId) ?? null
}
