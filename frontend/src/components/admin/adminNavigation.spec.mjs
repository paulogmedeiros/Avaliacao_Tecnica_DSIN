import assert from 'node:assert/strict'
import test from 'node:test'
import { getAdminNavigation } from './adminNavigation.js'

test('identifica o dashboard como item ativo', () => {
  const items = getAdminNavigation('/admin/dashboard')

  assert.equal(items.find((item) => item.href === '/admin/dashboard')?.isActive, true)
  assert.equal(items.find((item) => item.href === '/admin/agendamentos')?.isActive, false)
})

test('identifica agendamentos como item ativo em rotas internas', () => {
  const items = getAdminNavigation('/admin/agendamentos/AG-1052')

  assert.equal(items.find((item) => item.href === '/admin/agendamentos')?.isActive, true)
})
