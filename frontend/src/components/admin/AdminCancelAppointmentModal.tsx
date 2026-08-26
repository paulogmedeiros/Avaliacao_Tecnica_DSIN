import { useState } from 'react'
import type { AdminAppointment } from './adminAppointmentsData'

export function AdminCancelAppointmentModal({ appointment, onClose, onCancel }: {
  appointment: AdminAppointment | null
  onClose: () => void
  onCancel: (appointment: AdminAppointment) => Promise<unknown>
}) {
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState('')

  if (!appointment) return null
  const activeAppointment = appointment

  async function cancel() {
    setError('')
    try { await onCancel(activeAppointment); setIsCancelled(true) } catch { setError('Não foi possível cancelar o agendamento.') }
  }

  return (
    <div className="admin-modal-overlay admin-cancel-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="admin-cancel-appointment" role="dialog" aria-modal="true" aria-labelledby="admin-cancel-title">
        <button className="admin-confirm-modal__close" type="button" onClick={onClose} aria-label="Fechar cancelamento"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
        {!isCancelled ? <>
          <span className="admin-cancel-appointment__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 17h.01" /><path d="M10.3 4.6 3.1 17a2 2 0 0 0 1.7 3h14.4a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" /></svg></span>
          <span className="admin-cancel-appointment__eyebrow">Cancelamento administrativo</span>
          <h2 id="admin-cancel-title">Cancelar este agendamento?</h2>
          <p>O agendamento e todos os serviços associados serão marcados como cancelados e permanecerão no histórico.</p>
          <div className="admin-cancel-appointment__summary"><div><small>Cliente</small><strong>{appointment.customer.name}</strong></div><div><small>Data e horário</small><strong>{appointment.date}, às {appointment.time}</strong></div><div><small>Serviços afetados</small><strong>{appointment.services.length}</strong></div></div>
          <div className="admin-cancel-appointment__actions"><button type="button" onClick={onClose}>Manter agendamento</button><button type="button" onClick={cancel}>Sim, cancelar tudo</button></div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </> : <div className="admin-cancel-appointment__success"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg></span><h2 id="admin-cancel-title">Agendamento cancelado</h2><p>A agenda e seus {appointment.services.length} serviço(s) foram atualizados.</p><button type="button" onClick={onClose}>Voltar aos agendamentos</button></div>}
      </section>
    </div>
  )
}
