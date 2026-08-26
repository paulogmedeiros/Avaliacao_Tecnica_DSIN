import { useState } from 'react'
import type { Appointment } from './appointmentsData'

export function CancelAppointmentModal({ appointment, onClose, onConfirm }: { appointment: Appointment | null; onClose: () => void; onConfirm: (id: string) => Promise<unknown> }) {
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState('')

  if (!appointment) return null

  return (
    <div className="details-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose()
    }}>
      <section className="cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
        <button className="booking-close cancel-modal__close" type="button" onClick={onClose} aria-label="Fechar cancelamento">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>

        {!isCancelled ? (
          <>
            <span className="cancel-modal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 17h.01" /><path d="M10.3 4.6 3.1 17a2 2 0 0 0 1.7 3h14.4a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" /></svg>
            </span>
            <span className="cancel-modal__eyebrow">Confirmar cancelamento</span>
            <h2 id="cancel-title">Deseja cancelar este agendamento?</h2>
            <p>Esta ação cancelará o agendamento e <strong>todos os serviços associados</strong>.</p>

            <div className="cancel-summary">
              <div><small>Data e horário</small><strong>{appointment.date}, às {appointment.time}</strong></div>
              <div><small>Serviços</small><strong>{appointment.services.length}</strong></div>
              <ul>
                {appointment.services.map((service) => <li key={service.id}><span>{service.name}</span><small>{service.duration}</small></li>)}
              </ul>
            </div>

            <div className="cancel-modal__actions">
              <button className="details-secondary" type="button" onClick={onClose}>Manter agendamento</button>
              <button className="cancel-confirm" type="button" onClick={async () => { try { await onConfirm(appointment.id); setIsCancelled(true) } catch { setError('Não foi possível cancelar o agendamento.') } }}>Sim, cancelar</button>
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
          </>
        ) : (
          <div className="cancel-success">
            <span className="cancel-success__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg></span>
            <span className="cancel-modal__eyebrow">Cancelamento concluído</span>
            <h2 id="cancel-title">Agendamento cancelado</h2>
            <p>O agendamento e seus {appointment.services.length} serviço(s) foram marcados como cancelados.</p>
            <button className="details-primary cancel-success__button" type="button" onClick={onClose}>Voltar ao histórico</button>
          </div>
        )}
      </section>
    </div>
  )
}
