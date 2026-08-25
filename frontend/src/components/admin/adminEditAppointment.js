export function calculateAdminServiceSummary(services) {
  return services.reduce((summary, service) => ({
    durationMinutes: summary.durationMinutes + service.durationMinutes,
    totalPrice: summary.totalPrice + service.price,
  }), { durationMinutes: 0, totalPrice: 0 })
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder}min`
  if (!remainder) return `${hours}h`
  return `${hours}h ${remainder}min`
}

export function buildScheduledAt(date, time) {
  return `${date}T${time}:00-03:00`
}
