import { useState } from 'react'
import type { AdminAppointment } from './adminAppointmentsData'

export function AdminConfirmAppointmentModal({ appointment, onClose, onConfirm }: {
  appointment: AdminAppointment | null
  onClose: () => void
  onConfirm: (appointment: AdminAppointment) => Promise<unknown>
}) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState('')

  if (!appointment) return null
  const activeAppointment = appointment

  async function confirm() {
    setError('')
    try { await onConfirm(activeAppointment); setIsConfirmed(true) } catch { setError('Não foi possível confirmar o agendamento.') }
  }

  return (
    <div className="admin-modal-overlay admin-confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="admin-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
        <button className="admin-confirm-modal__close" type="button" onClick={onClose} aria-label="Fechar confirmação"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg></button>

        {!isConfirmed ? <>
          <span className="admin-confirm-modal__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /><circle cx="12" cy="12" r="9" /></svg></span>
          <span className="admin-confirm-modal__eyebrow">Confirmar agendamento</span>
          <h2 id="admin-confirm-title">O horário está correto?</h2>
          <p>Ao confirmar, o horário da cliente será marcado como confirmado.</p>

          <div className="admin-confirm-summary">
            <div className="admin-confirm-customer"><span aria-hidden="true">{appointment.customer.initials}</span><div><small>Cliente</small><strong>{appointment.customer.name}</strong></div></div>
            <dl><div><dt>Data</dt><dd>{appointment.date}</dd></div><div><dt>Horário</dt><dd>{appointment.time}</dd></div><div><dt>Serviços</dt><dd>{appointment.services.length}</dd></div></dl>
            <ul>{appointment.services.map((service) => <li key={service.id}><span>{service.name}</span><small>{service.duration}</small></li>)}</ul>
          </div>

          <div className="admin-confirm-modal__actions"><button type="button" onClick={onClose}>Voltar</button><button type="button" onClick={confirm}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg>Confirmar horário</button></div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </> : <div className="admin-confirm-success">
          <span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg></span>
          <span className="admin-confirm-modal__eyebrow">Confirmação concluída</span>
          <h2 id="admin-confirm-title">Agendamento confirmado</h2>
          <p>O horário de {appointment.customer.name} foi atualizado.</p>
          <button type="button" onClick={onClose}>Voltar aos agendamentos</button>
        </div>}
      </section>
    </div>
  )
}
