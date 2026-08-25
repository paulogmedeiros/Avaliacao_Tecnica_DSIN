import type { Appointment } from './appointmentsData'

export function EditRestrictionModal({
  appointment,
  action,
  onClose,
}: {
  appointment: Appointment | null
  action: 'edit' | 'cancel'
  onClose: () => void
}) {
  if (!appointment) return null

  return (
    <div className="details-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose()
    }}>
      <section className="restriction-modal" role="dialog" aria-modal="true" aria-labelledby="restriction-title">
        <button className="booking-close restriction-modal__close" type="button" onClick={onClose} aria-label="Fechar orientação">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <span className="restriction-modal__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </span>
        <span className="restriction-modal__eyebrow">{action === 'cancel' ? 'Cancelamento restrito' : 'Alteração restrita'}</span>
        <h2 id="restriction-title">Este horário está próximo</h2>
        <p>{action === 'cancel' ? 'Cancelamentos' : 'Alterações'} online precisam ser solicitados com pelo menos <strong>48 horas de antecedência</strong>.</p>
        <div className="restriction-appointment">
          <span><small>Agendamento</small><strong>{appointment.date}, às {appointment.time}</strong></span>
          <span className="status-badge status-badge--pendente">{appointment.status}</span>
        </div>
        <div className="restriction-phone">
          <span>Para {action === 'cancel' ? 'cancelar' : 'alterar'}, entre em contato com o salão:</span>
          <strong>(11) 99999-9999</strong>
        </div>
        <button className="details-primary restriction-modal__button" type="button" onClick={onClose}>Entendi</button>
      </section>
    </div>
  )
}
