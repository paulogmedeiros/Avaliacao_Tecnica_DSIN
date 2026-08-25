export function calculateBookingSummary(services) {
  return services.reduce(
    (summary, service) => ({
      durationMinutes: summary.durationMinutes + service.durationMinutes,
      price: summary.price + service.price,
    }),
    { durationMinutes: 0, price: 0 },
  )
}

export function canContinueBooking(step, booking) {
  if (step === 1) return booking.services.length > 0
  if (step === 2) return booking.date.length > 0
  if (step === 3) return booking.time.length > 0
  return true
}

export function formatBookingDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`)
  const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

  return {
    day: String(date.getDate()).padStart(2, '0'),
    weekday: capitalize(new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date)),
    monthYear: capitalize(new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)),
  }
}
