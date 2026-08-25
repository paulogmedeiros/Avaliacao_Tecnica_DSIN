import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getEditAvailability } from './editRules.js'

describe('client appointment edit rule', () => {
  const now = '2026-08-25T09:30:00-03:00'

  it('allows changing an appointment with exactly 48 hours of notice', () => {
    assert.deepEqual(getEditAvailability('2026-08-27T09:30:00-03:00', now, 'Confirmado'), {
      allowed: true,
      reason: null,
      hoursRemaining: 48,
    })
  })

  it('blocks changing an appointment with less than 48 hours of notice', () => {
    assert.deepEqual(getEditAvailability('2026-08-27T09:29:00-03:00', now, 'Pendente'), {
      allowed: false,
      reason: 'short_notice',
      hoursRemaining: 47,
    })
  })

  it('blocks terminal appointments regardless of their date', () => {
    assert.deepEqual(getEditAvailability('2026-09-10T10:00:00-03:00', now, 'Concluído'), {
      allowed: false,
      reason: 'terminal_status',
      hoursRemaining: 384,
    })
  })
})
