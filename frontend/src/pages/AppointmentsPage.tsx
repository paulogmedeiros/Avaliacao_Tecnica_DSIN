import { useState } from 'react'
import { AppointmentDetailsModal } from '../components/client/AppointmentDetailsModal'
import { AppointmentTable } from '../components/client/AppointmentTable'
import { getAppointmentById } from '../components/client/appointmentDetails.js'
import { appointments, prototypeNow } from '../components/client/appointmentsData'
import { ClientHeader } from '../components/client/ClientHeader'
import { EditAppointmentDrawer } from '../components/client/EditAppointmentDrawer'
import { EditRestrictionModal } from '../components/client/EditRestrictionModal'
import { getEditAvailability } from '../components/client/editRules.js'
import { NewAppointmentDrawer } from '../components/client/NewAppointmentDrawer'

export function AppointmentsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [restrictedAppointmentId, setRestrictedAppointmentId] = useState<string | null>(null)
  const selectedAppointment = selectedAppointmentId
    ? getAppointmentById(appointments, selectedAppointmentId)
    : null
  const editingAppointment = editingAppointmentId ? getAppointmentById(appointments, editingAppointmentId) : null
  const restrictedAppointment = restrictedAppointmentId ? getAppointmentById(appointments, restrictedAppointmentId) : null

  function requestAppointmentEdit(appointmentId: string) {
    const appointment = getAppointmentById(appointments, appointmentId)
    if (!appointment) return

    const availability = getEditAvailability(appointment.scheduledAt, prototypeNow, appointment.status)
    setSelectedAppointmentId(null)

    if (availability.allowed) {
      setEditingAppointmentId(appointmentId)
      return
    }

    if (availability.reason === 'short_notice') setRestrictedAppointmentId(appointmentId)
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
              <p>5 agendamentos encontrados</p>
            </div>

            <form className="date-filters">
              <label>
                <span>Data inicial</span>
                <input type="date" defaultValue="2026-07-01" />
              </label>
              <span className="date-filters__separator" aria-hidden="true">até</span>
              <label>
                <span>Data final</span>
                <input type="date" defaultValue="2026-08-31" />
              </label>
              <button className="filter-button" type="button">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="M4 5h16l-6.5 7.2V19l-3 1v-7.8L4 5Z" />
                </svg>
                Filtrar
              </button>
            </form>
          </div>

          <AppointmentTable onViewDetails={setSelectedAppointmentId} onEditAppointment={requestAppointmentEdit} />

          <footer className="appointments-footer">
            <span>Mostrando 1–5 de 5</span>
            <div className="pagination" aria-label="Paginação">
              <button type="button" disabled aria-label="Página anterior">‹</button>
              <button type="button" className="pagination__current" aria-current="page">1</button>
              <button type="button" disabled aria-label="Próxima página">›</button>
            </div>
          </footer>
        </section>
      </main>

      <NewAppointmentDrawer isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <AppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointmentId(null)} onEdit={requestAppointmentEdit} />
      <EditAppointmentDrawer key={editingAppointmentId ?? 'no-edit'} appointment={editingAppointment} onClose={() => setEditingAppointmentId(null)} />
      <EditRestrictionModal appointment={restrictedAppointment} onClose={() => setRestrictedAppointmentId(null)} />
    </div>
  )
}
