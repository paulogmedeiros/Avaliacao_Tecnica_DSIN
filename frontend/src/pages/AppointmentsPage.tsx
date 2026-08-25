import { useState } from 'react'
import { AppointmentDetailsModal } from '../components/client/AppointmentDetailsModal'
import { AppointmentTable } from '../components/client/AppointmentTable'
import { getAppointmentById } from '../components/client/appointmentDetails.js'
import { appointments } from '../components/client/appointmentsData'
import { ClientHeader } from '../components/client/ClientHeader'
import { NewAppointmentDrawer } from '../components/client/NewAppointmentDrawer'

export function AppointmentsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const selectedAppointment = selectedAppointmentId
    ? getAppointmentById(appointments, selectedAppointmentId)
    : null

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
              <p>4 agendamentos encontrados</p>
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

          <AppointmentTable onViewDetails={setSelectedAppointmentId} />

          <footer className="appointments-footer">
            <span>Mostrando 1–4 de 4</span>
            <div className="pagination" aria-label="Paginação">
              <button type="button" disabled aria-label="Página anterior">‹</button>
              <button type="button" className="pagination__current" aria-current="page">1</button>
              <button type="button" disabled aria-label="Próxima página">›</button>
            </div>
          </footer>
        </section>
      </main>

      <NewAppointmentDrawer isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <AppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointmentId(null)} />
    </div>
  )
}
