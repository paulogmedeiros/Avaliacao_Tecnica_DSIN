import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateBookingSummary, canContinueBooking, formatBookingDate } from './bookingFlow.js'

const services = [
  { id: 'cut', durationMinutes: 45, price: 65 },
  { id: 'hydration', durationMinutes: 60, price: 90 },
]

describe('booking flow helpers', () => {
  it('sums duration and price from every selected service', () => {
    assert.deepEqual(calculateBookingSummary(services), {
      durationMinutes: 105,
      price: 155,
    })
  })

  it('only allows advancing when the current step has its required choice', () => {
    assert.equal(canContinueBooking(1, { services: [], date: '', time: '' }), false)
    assert.equal(canContinueBooking(1, { services: ['cut'], date: '', time: '' }), true)
    assert.equal(canContinueBooking(2, { services: ['cut'], date: '', time: '' }), false)
    assert.equal(canContinueBooking(2, { services: ['cut'], date: '2026-08-29', time: '' }), true)
    assert.equal(canContinueBooking(3, { services: ['cut'], date: '2026-08-29', time: '' }), false)
    assert.equal(canContinueBooking(3, { services: ['cut'], date: '2026-08-29', time: '09:30' }), true)
  })

  it('formats the date selected by the client for the review', () => {
    assert.deepEqual(formatBookingDate('2026-09-03'), {
      day: '03',
      weekday: 'Quinta-feira',
      monthYear: 'Setembro de 2026',
    })
  })
})
