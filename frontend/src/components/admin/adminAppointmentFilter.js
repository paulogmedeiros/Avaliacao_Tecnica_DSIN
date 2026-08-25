function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function filterAdminAppointments(appointments, filters) {
  const search = normalize(filters.search)

  return appointments.filter((appointment) => {
    const date = appointment.scheduledAt.slice(0, 10)
    const matchesSearch = !search || normalize(`${appointment.id} ${appointment.customer.name}`).includes(search)
    const matchesStart = !filters.startDate || date >= filters.startDate
    const matchesEnd = !filters.endDate || date <= filters.endDate
    const matchesStatus = !filters.status || appointment.status === filters.status
    return matchesSearch && matchesStart && matchesEnd && matchesStatus
  })
}
