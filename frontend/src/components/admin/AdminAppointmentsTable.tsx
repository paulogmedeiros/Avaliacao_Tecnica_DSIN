import type { AdminAppointment } from './adminAppointmentsData'

function statusClass(status: string) {
  return status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function AdminAppointmentsTable({ appointments, onAction }: {
  appointments: AdminAppointment[]
  onAction: (appointmentId: string, action: 'view' | 'edit' | 'confirm') => void
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-appointments-table">
        <thead><tr><th>Cliente</th><th>Data e horário</th><th>Serviços</th><th>Valor</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td data-label="Cliente">
                <div className="admin-customer"><span aria-hidden="true">{appointment.customer.initials}</span><div><strong>{appointment.customer.name}</strong><small>{appointment.id}</small></div></div>
              </td>
              <td data-label="Data e horário"><strong className="admin-table-date">{appointment.date}</strong><small>{appointment.time} · {appointment.duration}</small></td>
              <td data-label="Serviços"><div className="admin-table-services">{appointment.services.map((service) => <span key={service.id}>{service.name}</span>)}</div></td>
              <td data-label="Valor"><strong className="admin-table-price">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appointment.totalPrice)}</strong></td>
              <td data-label="Status"><span className={`status-badge status-badge--${statusClass(appointment.status)}`}>{appointment.status}</span></td>
              <td className="admin-table-actions">
                <button type="button" onClick={() => onAction(appointment.id, 'view')} aria-label={`Ver detalhes de ${appointment.customer.name}`} title="Ver detalhes"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg></button>
                {(appointment.status === 'Pendente' || appointment.status === 'Confirmado') ? <button type="button" onClick={() => onAction(appointment.id, 'edit')} aria-label={`Editar agendamento de ${appointment.customer.name}`} title="Editar"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m14.5 5.5 4 4M4 20l4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" /></svg></button> : null}
                {appointment.status === 'Pendente' ? <button className="admin-action-confirm" type="button" onClick={() => onAction(appointment.id, 'confirm')} aria-label={`Confirmar agendamento de ${appointment.customer.name}`} title="Confirmar"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg></button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
