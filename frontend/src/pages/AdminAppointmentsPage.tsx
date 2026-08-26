import { useState } from 'react'
import { AdminAppointmentsTable } from '../components/admin/AdminAppointmentsTable'
import { AdminAppointmentDetailsModal } from '../components/admin/AdminAppointmentDetailsModal'
import { AdminEditAppointmentDrawer } from '../components/admin/AdminEditAppointmentDrawer'
import { AdminConfirmAppointmentModal } from '../components/admin/AdminConfirmAppointmentModal'
import { AdminCancelAppointmentModal } from '../components/admin/AdminCancelAppointmentModal'
import type { AdminAppointmentAction } from '../components/admin/adminAppointmentActions.js'
import { filterAdminAppointments } from '../components/admin/adminAppointmentFilter.js'
import type { AdminAppointment } from '../components/admin/adminAppointmentsData'
import type { AppointmentStatus } from '../components/client/appointmentsData'
import { useAdminAppointments, useAppointment, useAppointmentMutations } from '../hooks/useAppointments'
import { mapAppointment, toApiStatus } from '../lib/apiMappers.js'

const initialFilters = { search: '', startDate: '', endDate: '', status: '' }

export function AdminAppointmentsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState<string | null>(null)
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null)
  const appointmentsQuery = useAdminAppointments()
  const mutations = useAppointmentMutations()
  const detailQuery = useAppointment(selectedAppointmentId)
  const appointmentsList = ((appointmentsQuery.data ?? []) as unknown[]).map((item) => mapAppointment(item) as AdminAppointment)
  const filteredAppointments = filterAdminAppointments(appointmentsList, filters)
  const selectedAppointment = selectedAppointmentId ? (detailQuery.data ? mapAppointment(detailQuery.data) as AdminAppointment : appointmentsList.find((appointment) => appointment.id === selectedAppointmentId) ?? null) : null
  const editingAppointment = appointmentsList.find((appointment) => appointment.id === editingAppointmentId) ?? null
  const confirmingAppointment = appointmentsList.find((appointment) => appointment.id === confirmingAppointmentId) ?? null
  const cancellingAppointment = appointmentsList.find((appointment) => appointment.id === cancellingAppointmentId) ?? null

  function setFilter(name: keyof typeof initialFilters, value: string) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleAppointmentAction(appointmentId: string, action: 'view' | AdminAppointmentAction) {
    if (action === 'view') {
      setSelectedAppointmentId(appointmentId)
      return
    }

    if (action === 'edit') {
      setSelectedAppointmentId(null)
      setEditingAppointmentId(appointmentId)
      return
    }
    if (action === 'confirm') {
      setSelectedAppointmentId(null)
      setConfirmingAppointmentId(appointmentId)
      return
    }

    setSelectedAppointmentId(null)
    setCancellingAppointmentId(appointmentId)
  }

  async function confirmAppointment(appointment: AdminAppointment) {
    await mutations.updateStatus.mutateAsync({ id: appointment.id, status: 'CONFIRMED' })
  }

  async function changeServiceStatus(appointmentId: string, serviceId: string, status: AppointmentStatus) {
    await mutations.updateServiceStatus.mutateAsync({ appointmentId, appointmentServiceId: serviceId, status: toApiStatus(status) })
  }

  async function cancelAppointment(appointment: AdminAppointment) {
    await mutations.updateStatus.mutateAsync({ id: appointment.id, status: 'CANCELED' })
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div><p>Operação do salão</p><h1>Agendamentos</h1><span>Consulte e gerencie todos os atendimentos recebidos.</span></div>
      </header>

      <section className="admin-appointments-panel" aria-labelledby="admin-appointments-title">
        <div className="admin-appointments-panel__heading">
          <div><h2 id="admin-appointments-title">Todos os agendamentos</h2><p>{filteredAppointments.length} {filteredAppointments.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</p></div>
          <button className="admin-clear-filters" type="button" onClick={() => setFilters(initialFilters)} disabled={!Object.values(filters).some(Boolean)}>Limpar filtros</button>
        </div>

        <form className="admin-filters" onSubmit={(event) => event.preventDefault()}>
          <label className="admin-search-field"><span>Buscar cliente ou código</span><div><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg><input type="search" placeholder="Ex.: Mariana ou AG-1052" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} /></div></label>
          <label><span>Data inicial</span><input type="date" value={filters.startDate} onChange={(event) => setFilter('startDate', event.target.value)} /></label>
          <label><span>Data final</span><input type="date" value={filters.endDate} onChange={(event) => setFilter('endDate', event.target.value)} /></label>
          <label><span>Status</span><select value={filters.status} onChange={(event) => setFilter('status', event.target.value)}><option value="">Todos</option><option value="Pendente">Pendente</option><option value="Confirmado">Confirmado</option><option value="Concluído">Concluído</option><option value="Cancelado">Cancelado</option></select></label>
        </form>

        {appointmentsQuery.isLoading ? <p className="request-state">Carregando agendamentos...</p> : null}
        {appointmentsQuery.isError ? <p className="form-error">Não foi possível carregar os agendamentos.</p> : null}
        {!appointmentsQuery.isLoading && !appointmentsQuery.isError && filteredAppointments.length ? <AdminAppointmentsTable appointments={filteredAppointments} onAction={handleAppointmentAction} /> : null}
        {!appointmentsQuery.isLoading && !appointmentsQuery.isError && !filteredAppointments.length ? (
          <div className="admin-empty-results"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4M8.5 11h5" /></svg></span><h3>Nenhum agendamento encontrado</h3><p>Altere os filtros para consultar outro período.</p><button type="button" onClick={() => setFilters(initialFilters)}>Limpar filtros</button></div>
        ) : null}

        {filteredAppointments.length ? <footer className="admin-table-footer"><span>Mostrando {filteredAppointments.length} de {appointmentsList.length}</span><div><button type="button" disabled aria-label="Página anterior">‹</button><button type="button" className="is-current" aria-current="page">1</button><button type="button" disabled aria-label="Próxima página">›</button></div></footer> : null}
      </section>

      <AdminAppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointmentId(null)} onAction={handleAppointmentAction} onServiceStatusChange={changeServiceStatus} />
      <AdminEditAppointmentDrawer key={editingAppointmentId ?? 'no-admin-edit'} appointment={editingAppointment} onClose={() => setEditingAppointmentId(null)} />
      <AdminConfirmAppointmentModal key={confirmingAppointmentId ?? 'no-admin-confirm'} appointment={confirmingAppointment} onClose={() => setConfirmingAppointmentId(null)} onConfirm={confirmAppointment} />
      <AdminCancelAppointmentModal key={cancellingAppointmentId ?? 'no-admin-cancel'} appointment={cancellingAppointment} onClose={() => setCancellingAppointmentId(null)} onCancel={cancelAppointment} />
    </div>
  )
}
