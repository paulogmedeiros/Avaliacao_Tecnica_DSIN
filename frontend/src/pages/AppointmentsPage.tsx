import { useState } from 'react'
import { AppointmentDetailsModal } from '../components/client/AppointmentDetailsModal'
import { AppointmentTable } from '../components/client/AppointmentTable'
import { formatAppointmentCount, getAppointmentById } from '../components/client/appointmentDetails.js'
import type { Appointment } from '../components/client/appointmentsData'
import { CancelAppointmentModal } from '../components/client/CancelAppointmentModal'
import { ClientHeader } from '../components/client/ClientHeader'
import { EditAppointmentDrawer } from '../components/client/EditAppointmentDrawer'
import { EditRestrictionModal } from '../components/client/EditRestrictionModal'
import { getCancellationAvailability, getEditAvailability } from '../components/client/editRules.js'
import { NewAppointmentDrawer } from '../components/client/NewAppointmentDrawer'
import { useHistory, useAppointment, useAppointmentMutations } from '../hooks/useAppointments'
import { mapAppointment } from '../lib/apiMappers.js'
import { getApiError } from '../lib/apiError'

export function AppointmentsPage() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '' })
  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '' })
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [restrictedAppointmentId, setRestrictedAppointmentId] = useState<string | null>(null)
  const [restrictionAction, setRestrictionAction] = useState<'edit' | 'cancel'>('edit')
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null)
  const history = useHistory(appliedFilters)
  const detailQuery = useAppointment(selectedAppointmentId)
  const mutations = useAppointmentMutations()
  const appointments = ((history.data ?? []) as unknown[]).map((item) => mapAppointment(item) as Appointment)
  const selectedAppointment = selectedAppointmentId
    ? (detailQuery.data ? mapAppointment(detailQuery.data) as Appointment : getAppointmentById(appointments, selectedAppointmentId))
    : null
  const editingAppointment = editingAppointmentId ? getAppointmentById(appointments, editingAppointmentId) : null
  const restrictedAppointment = restrictedAppointmentId ? getAppointmentById(appointments, restrictedAppointmentId) : null
  const cancellingAppointment = cancellingAppointmentId ? getAppointmentById(appointments, cancellingAppointmentId) : null

  function requestAppointmentEdit(appointmentId: string) {
    const appointment = getAppointmentById(appointments, appointmentId)
    if (!appointment) return

    const availability = getEditAvailability(appointment.scheduledAt, new Date().toISOString(), appointment.status)
    setSelectedAppointmentId(null)

    if (availability.allowed) {
      setEditingAppointmentId(appointmentId)
      return
    }

    if (availability.reason === 'short_notice') {
      setRestrictionAction('edit')
      setRestrictedAppointmentId(appointmentId)
    }
  }

  function requestAppointmentCancellation(appointmentId: string) {
    const appointment = getAppointmentById(appointments, appointmentId)
    if (!appointment) return

    const availability = getCancellationAvailability(appointment.scheduledAt, new Date().toISOString(), appointment.status)
    setSelectedAppointmentId(null)

    if (availability.allowed) {
      setCancellingAppointmentId(appointmentId)
      return
    }

    if (availability.reason === 'short_notice') {
      setRestrictionAction('cancel')
      setRestrictedAppointmentId(appointmentId)
    }
  }

  return (
    <div className="client-page">
      <ClientHeader />

      <main className="client-main">
        <section className="client-intro">
          <div>
            <span className="client-eyebrow">Área do cliente</span>
            <h1>Meus agendamentos</h1>
            <p>Acompanhe seus horários e consulte os serviços realizados.</p>
          </div>

          <button className="new-appointment-button" type="button" onClick={() => setIsBookingOpen(true)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo agendamento
          </button>
        </section>

        <section className="appointments-panel" aria-labelledby="appointments-title">
          <div className="appointments-toolbar">
            <div>
              <h2 id="appointments-title">Histórico</h2>
              <p>{formatAppointmentCount(appointments.length)}</p>
            </div>

            <form className="date-filters" onSubmit={(event) => { event.preventDefault(); setAppliedFilters(filters) }}>
              <label>
                <span>Data inicial</span>
                <input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} />
              </label>
              <span className="date-filters__separator" aria-hidden="true">até</span>
              <label>
                <span>Data final</span>
                <input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} />
              </label>
              <button className="filter-button" type="submit">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="M4 5h16l-6.5 7.2V19l-3 1v-7.8L4 5Z" />
                </svg>
                Filtrar
              </button>
            </form>
          </div>

          {history.isLoading ? <p className="request-state">Carregando agendamentos...</p> : null}
          {history.isError ? <p className="form-error" role="alert">{getApiError(history.error)}</p> : null}
          {!history.isLoading && !history.isError && !appointments.length ? <p className="request-state">Nenhum agendamento encontrado.</p> : null}
          {appointments.length ? <AppointmentTable appointments={appointments}
            onViewDetails={setSelectedAppointmentId}
            onEditAppointment={requestAppointmentEdit}
            onCancelAppointment={requestAppointmentCancellation}
          /> : null}

          <footer className="appointments-footer">
            <span>Mostrando {appointments.length} agendamento(s)</span>
            <div className="pagination" aria-label="Paginação">
              <button type="button" disabled aria-label="Página anterior">‹</button>
              <button type="button" className="pagination__current" aria-current="page">1</button>
              <button type="button" disabled aria-label="Próxima página">›</button>
            </div>
          </footer>
        </section>
      </main>

      <NewAppointmentDrawer isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointmentId(null)}
        onEdit={requestAppointmentEdit}
        onCancel={requestAppointmentCancellation}
      />
      <EditAppointmentDrawer key={editingAppointmentId ?? 'no-edit'} appointment={editingAppointment} onClose={() => setEditingAppointmentId(null)} />
      <EditRestrictionModal appointment={restrictedAppointment} action={restrictionAction} onClose={() => setRestrictedAppointmentId(null)} />
      <CancelAppointmentModal key={cancellingAppointmentId ?? 'no-cancel'} appointment={cancellingAppointment} onClose={() => setCancellingAppointmentId(null)} onConfirm={async (id) => { await mutations.cancelClient.mutateAsync(id) }} />
    </div>
  )
}
