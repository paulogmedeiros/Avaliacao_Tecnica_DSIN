import assert from 'node:assert/strict'
import test from 'node:test'
import { buildScheduledAt, calculateAdminServiceSummary, formatDuration } from './adminEditAppointment.js'

test('recalcula duração e preço dos serviços selecionados', () => {
  const summary = calculateAdminServiceSummary([
    { durationMinutes: 45, price: 65 },
    { durationMinutes: 60, price: 90 },
  ])

  assert.deepEqual(summary, { durationMinutes: 105, totalPrice: 155 })
  assert.equal(formatDuration(summary.durationMinutes), '1h 45min')
})

test('mantém o horário administrativo no fuso fixo do projeto', () => {
  assert.equal(buildScheduledAt('2026-08-29', '09:30'), '2026-08-29T09:30:00-03:00')
})
