import { getAdminAppointmentActions, type AdminAppointmentAction } from './adminAppointmentActions.js'
import type { AdminAppointment } from './adminAppointmentsData'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function statusClass(status: string) {
  return status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function AdminAppointmentDetailsModal({ appointment, onClose, onAction }: {
  appointment: AdminAppointment | null
  onClose: () => void
  onAction: (appointmentId: string, action: AdminAppointmentAction) => void
}) {
  if (!appointment) return null

  const actions = getAdminAppointmentActions(appointment.status)

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="admin-details-modal" role="dialog" aria-modal="true" aria-labelledby="admin-details-title">
        <header className="admin-details-modal__header">
          <div><span>{appointment.id}</span><h2 id="admin-details-title">Detalhes do agendamento</h2></div>
          <button type="button" onClick={onClose} aria-label="Fechar detalhes"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
        </header>

        <div className="admin-details-modal__body">
          <section className="admin-details-summary">
            <div className="admin-details-customer"><span aria-hidden="true">{appointment.customer.initials}</span><div><small>Cliente</small><h3>{appointment.customer.name}</h3><p>{appointment.customer.email} · {appointment.customer.phone}</p></div></div>
            <span className={`status-badge status-badge--${statusClass(appointment.status)}`}>{appointment.status}</span>
          </section>

          <section className="admin-details-facts" aria-label="Informações do agendamento">
            <div><span className="admin-details-facts__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M6 3v3M18 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /></svg></span><span><small>Data e horário</small><strong>{appointment.date}, às {appointment.time}</strong></span></div>
            <div><span className="admin-details-facts__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><span><small>Duração total</small><strong>{appointment.duration}</strong></span></div>
            <div><span className="admin-details-facts__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M8 12h.01M16 12h.01" /></svg></span><span><small>Valor total</small><strong>{formatCurrency(appointment.totalPrice)}</strong></span></div>
          </section>

          <section className="admin-details-services">
            <div className="admin-details-section-title"><div><h3>Serviços solicitados</h3><p>{appointment.services.length} {appointment.services.length === 1 ? 'serviço' : 'serviços'} neste agendamento</p></div></div>
            <div className="admin-details-service-list">
              {appointment.services.map((service, index) => (
                <article key={service.id}>
                  <span className="admin-service-number">{String(index + 1).padStart(2, '0')}</span>
                  <div><strong>{service.name}</strong><small>{service.id} · {service.duration}</small></div>
                  <strong className="admin-service-price">{formatCurrency(service.price)}</strong>
                  <span className={`service-status service-status--${statusClass(service.status)}`}>{service.status}</span>
                </article>
              ))}
            </div>
          </section>

          {appointment.notes ? <section className="admin-details-note"><span>Observação da cliente</span><p>{appointment.notes}</p></section> : null}
          <p className="admin-details-created">Criado em {appointment.createdAt}</p>
        </div>

        <footer className="admin-details-modal__footer">
          <button className="admin-details-close" type="button" onClick={onClose}>Fechar</button>
          <div>
            {actions.includes('cancel') ? <button className="admin-details-cancel" type="button" onClick={() => onAction(appointment.id, 'cancel')}>Cancelar</button> : null}
            {actions.includes('edit') ? <button className="admin-details-edit" type="button" onClick={() => onAction(appointment.id, 'edit')}>Editar</button> : null}
            {actions.includes('confirm') ? <button className="admin-details-confirm" type="button" onClick={() => onAction(appointment.id, 'confirm')}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg>Confirmar agendamento</button> : null}
          </div>
        </footer>
      </section>
    </div>
  )
}
