function parseDate(date) {
  return new Date(`${date}T12:00:00Z`)
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

export function getWeekRange(referenceDate) {
  const date = parseDate(referenceDate)
  const weekday = date.getUTCDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  date.setUTCDate(date.getUTCDate() - daysFromMonday)

  const end = new Date(date)
  end.setUTCDate(end.getUTCDate() + 5)

  return { start: formatDate(date), end: formatDate(end) }
}

export function moveWeek(referenceDate, direction) {
  const { start } = getWeekRange(referenceDate)
  const date = parseDate(start)
  date.setUTCDate(date.getUTCDate() + direction * 7)
  return formatDate(date)
}

export function calculateWeeklyReport(appointments, referenceDate) {
  const { start, end } = getWeekRange(referenceDate)
  const weeklyAppointments = appointments.filter((appointment) => {
    const scheduledDate = appointment.scheduledAt.slice(0, 10)
    return scheduledDate >= start && scheduledDate <= end
  })

  const activeAppointments = weeklyAppointments.filter((appointment) => appointment.status !== 'Cancelado')
  const countStatus = (status) => weeklyAppointments.filter((appointment) => appointment.status === status).length
  const completed = countStatus('Concluído')

  return {
    totalAppointments: weeklyAppointments.length,
    pending: countStatus('Pendente'),
    confirmed: countStatus('Confirmado'),
    completed,
    cancelled: countStatus('Cancelado'),
    totalServices: activeAppointments.reduce((total, appointment) => total + appointment.services.length, 0),
    estimatedRevenue: activeAppointments.reduce((total, appointment) => (
      total + appointment.services.reduce((serviceTotal, service) => serviceTotal + service.price, 0)
    ), 0),
    completionRate: weeklyAppointments.length ? Math.round((completed / weeklyAppointments.length) * 100) : 0,
  }
}
