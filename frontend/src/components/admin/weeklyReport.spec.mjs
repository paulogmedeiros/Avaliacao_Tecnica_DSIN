import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateWeeklyReport, getWeekRange, moveWeek } from './weeklyReport.js'

const appointments = [
  { scheduledAt: '2026-08-24T09:00:00-03:00', status: 'Pendente', services: [{ price: 65 }] },
  { scheduledAt: '2026-08-25T10:00:00-03:00', status: 'Confirmado', services: [{ price: 90 }, { price: 40 }] },
  { scheduledAt: '2026-08-26T13:00:00-03:00', status: 'Concluído', services: [{ price: 180 }] },
  { scheduledAt: '2026-09-01T08:00:00-03:00', status: 'Cancelado', services: [{ price: 55 }] },
]

test('resume somente os agendamentos da semana selecionada', () => {
  const report = calculateWeeklyReport(appointments, '2026-08-24')

  assert.deepEqual(report, {
    totalAppointments: 3,
    pending: 1,
    confirmed: 1,
    completed: 1,
    cancelled: 0,
    totalServices: 4,
    estimatedRevenue: 375,
    completionRate: 33,
  })
})

test('calcula a semana de segunda a sábado', () => {
  assert.deepEqual(getWeekRange('2026-08-26'), { start: '2026-08-24', end: '2026-08-29' })
})

test('navega entre semanas mantendo a segunda-feira como referência', () => {
  assert.equal(moveWeek('2026-08-24', -1), '2026-08-17')
  assert.equal(moveWeek('2026-08-24', 1), '2026-08-31')
})
