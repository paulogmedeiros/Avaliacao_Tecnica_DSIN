import assert from 'node:assert/strict'
import test from 'node:test'
import { filterAdminAppointments } from './adminAppointmentFilter.js'

const appointments = [
  { id: '#AG-1', customer: { name: 'Mariana Souza' }, scheduledAt: '2026-08-25T09:00:00-03:00', status: 'Pendente' },
  { id: '#AG-2', customer: { name: 'Ana Lima' }, scheduledAt: '2026-08-29T10:00:00-03:00', status: 'Confirmado' },
  { id: '#AG-3', customer: { name: 'Carla Mendes' }, scheduledAt: '2026-09-01T13:00:00-03:00', status: 'Concluído' },
]

test('filtra pelo nome do cliente ignorando maiúsculas e acentos', () => {
  assert.deepEqual(filterAdminAppointments(appointments, { search: 'máriana', startDate: '', endDate: '', status: '' }), [appointments[0]])
})

test('combina período inclusivo e status', () => {
  assert.deepEqual(filterAdminAppointments(appointments, { search: '', startDate: '2026-08-25', endDate: '2026-08-29', status: 'Confirmado' }), [appointments[1]])
})

test('também permite buscar pelo código do agendamento', () => {
  assert.deepEqual(filterAdminAppointments(appointments, { search: 'AG-3', startDate: '', endDate: '', status: '' }), [appointments[2]])
})
