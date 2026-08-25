import assert from 'node:assert/strict'
import test from 'node:test'
import { getAdminAppointmentActions } from './adminAppointmentActions.js'

test('oferece confirmação, edição e cancelamento para agenda pendente', () => {
  assert.deepEqual(getAdminAppointmentActions('Pendente'), ['confirm', 'edit', 'cancel'])
})

test('oferece edição e cancelamento para agenda confirmada', () => {
  assert.deepEqual(getAdminAppointmentActions('Confirmado'), ['edit', 'cancel'])
})

test('não oferece alteração para agenda concluída ou cancelada', () => {
  assert.deepEqual(getAdminAppointmentActions('Concluído'), [])
  assert.deepEqual(getAdminAppointmentActions('Cancelado'), [])
})
