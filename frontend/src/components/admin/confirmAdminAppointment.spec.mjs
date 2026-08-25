import assert from 'node:assert/strict'
import test from 'node:test'
import { confirmAdminAppointment } from './confirmAdminAppointment.js'

test('confirma a agenda e todos os serviços pendentes', () => {
  const appointment = {
    id: '#AG-1',
    status: 'Pendente',
    services: [
      { id: 'AS-1', status: 'Pendente' },
      { id: 'AS-2', status: 'Cancelado' },
    ],
  }

  assert.deepEqual(confirmAdminAppointment(appointment), {
    id: '#AG-1',
    status: 'Confirmado',
    services: [
      { id: 'AS-1', status: 'Confirmado' },
      { id: 'AS-2', status: 'Cancelado' },
    ],
  })
})

test('não altera uma agenda que não está pendente', () => {
  const appointment = { id: '#AG-2', status: 'Concluído', services: [{ id: 'AS-3', status: 'Concluído' }] }

  assert.equal(confirmAdminAppointment(appointment), appointment)
})
