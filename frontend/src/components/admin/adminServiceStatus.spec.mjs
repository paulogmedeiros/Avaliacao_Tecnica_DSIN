import assert from 'node:assert/strict'
import test from 'node:test'
import { cancelAdminAppointment, updateAdminServiceStatus } from './adminServiceStatus.js'

const appointment = {
  id: '#AG-1',
  status: 'Confirmado',
  services: [
    { id: 'AS-1', status: 'Confirmado' },
    { id: 'AS-2', status: 'Confirmado' },
  ],
}

test('atualiza apenas o serviço selecionado', () => {
  const updated = updateAdminServiceStatus(appointment, 'AS-1', 'Concluído')

  assert.deepEqual(updated.services.map((service) => service.status), ['Concluído', 'Confirmado'])
  assert.equal(updated.status, 'Confirmado')
})

test('conclui a agenda somente quando todos os serviços estão concluídos', () => {
  const oneCompleted = updateAdminServiceStatus(appointment, 'AS-1', 'Concluído')
  const allCompleted = updateAdminServiceStatus(oneCompleted, 'AS-2', 'Concluído')

  assert.equal(oneCompleted.status, 'Confirmado')
  assert.equal(allCompleted.status, 'Concluído')
})

test('cancelar a agenda cancela todos os serviços', () => {
  const cancelled = cancelAdminAppointment(appointment)

  assert.equal(cancelled.status, 'Cancelado')
  assert.deepEqual(cancelled.services.map((service) => service.status), ['Cancelado', 'Cancelado'])
})
