export type BookingServiceSummary = {
  id: string
  durationMinutes: number
  price: number
}

export type BookingSelection = {
  services: string[]
  date: string
  time: string
}

export function calculateBookingSummary(services: BookingServiceSummary[]): {
  durationMinutes: number
  price: number
}

export function canContinueBooking(step: number, booking: BookingSelection): boolean

export function formatBookingDate(dateValue: string): {
  day: string
  weekday: string
  monthYear: string
}
