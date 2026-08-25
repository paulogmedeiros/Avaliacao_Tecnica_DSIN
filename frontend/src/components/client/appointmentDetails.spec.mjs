import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getAppointmentById } from './appointmentDetails.js'

const appointments = [
  { id: '#AG-1001', status: 'Confirmado' },
  { id: '#AG-1002', status: 'Concluído' },
]

describe('appointment details helper', () => {
  it('returns the appointment selected by its identifier', () => {
    assert.deepEqual(getAppointmentById(appointments, '#AG-1002'), appointments[1])
  })

  it('returns null when the identifier is not in the history', () => {
    assert.equal(getAppointmentById(appointments, '#AG-9999'), null)
  })
})
