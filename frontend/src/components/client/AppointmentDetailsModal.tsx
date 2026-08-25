import type { Appointment } from './appointmentsData'

type AppointmentDetailsModalProps = {
  appointment: Appointment | null
  onClose: () => void
  onEdit: (appointmentId: string) => void
  onCancel: (appointmentId: string) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function statusClass(status: string) {
  return status.toLowerCase().replace('í', 'i')
}

export function AppointmentDetailsModal({ appointment, onClose, onEdit, onCancel }: AppointmentDetailsModalProps) {
  if (!appointment) return null

  const canChange = appointment.status === 'Pendente' || appointment.status === 'Confirmado'

  return (
    <div className="details-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose()
    }}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <header className="details-modal__header">
          <div>
            <span className="details-modal__eyebrow">{appointment.id}</span>
            <h2 id="details-title">Detalhes do agendamento</h2>
          </div>
          <button className="booking-close" type="button" onClick={onClose} aria-label="Fechar detalhes">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div className="details-modal__body">
          <section className="details-hero">
            <div className="details-hero__date">
              <span>{appointment.date.split(' ')[0]}</span>
              <div><small>{appointment.date.replace(`${appointment.date.split(' ')[0]} `, '')}</small><strong>{appointment.time}</strong></div>
            </div>
            <span className={`status-badge status-badge--${statusClass(appointment.status)}`}>{appointment.status}</span>
          </section>

          <section className="details-section">
            <div className="details-section__heading">
              <div>
                <span>Serviços agendados</span>
                <small>{appointment.services.length} serviço(s)</small>
              </div>
            </div>
            <div className="details-services">
              {appointment.services.map((service) => (
                <article className="details-service" key={service.id}>
                  <span className="details-service__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" /></svg>
                  </span>
                  <div>
                    <strong>{service.name}</strong>
                    <small>{service.id} · {service.duration}</small>
                  </div>
                  <div className="details-service__meta">
                    <strong>{formatCurrency(service.price)}</strong>
                    <span className={`service-status service-status--${statusClass(service.status)}`}>{service.status}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="details-grid">
            <div className="details-info-card">
              <span className="details-info-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              </span>
              <span><small>Duração estimada</small><strong>{appointment.duration}</strong></span>
            </div>
            <div className="details-info-card">
              <span className="details-info-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14v10H5zM8 10h8M8 14h4" /></svg>
              </span>
              <span><small>Valor total</small><strong>{formatCurrency(appointment.totalPrice)}</strong></span>
            </div>
          </section>

          {appointment.notes ? (
            <section className="details-note">
              <span>Observação</span>
              <p>{appointment.notes}</p>
            </section>
          ) : null}

          <p className="details-created">Agendamento criado em {appointment.createdAt}</p>
        </div>

        <footer className="details-modal__footer">
          <button className="details-secondary" type="button" onClick={onClose}>Fechar</button>
          {canChange ? (
            <>
              <button className="details-cancel" type="button" onClick={() => onCancel(appointment.id)}>Cancelar</button>
              <button className="details-primary" type="button" onClick={() => onEdit(appointment.id)}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m14.5 5.5 4 4M4 20l4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" /></svg>
                Editar agendamento
              </button>
            </>
          ) : null}
        </footer>
      </section>
    </div>
  )
}
