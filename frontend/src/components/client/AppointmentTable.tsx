type AppointmentStatus = 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado'

type Appointment = {
  id: string
  date: string
  time: string
  services: string[]
  duration: string
  status: AppointmentStatus
}

const appointments: Appointment[] = [
  {
    id: '#AG-1048',
    date: '29 ago. 2026',
    time: '09:30',
    services: ['Corte feminino', 'Hidratação'],
    duration: '1h 45min',
    status: 'Confirmado',
  },
  {
    id: '#AG-1012',
    date: '15 ago. 2026',
    time: '13:30',
    services: ['Coloração'],
    duration: '2h',
    status: 'Concluído',
  },
  {
    id: '#AG-0987',
    date: '01 ago. 2026',
    time: '10:00',
    services: ['Escova', 'Manicure'],
    duration: '1h 30min',
    status: 'Concluído',
  },
  {
    id: '#AG-0964',
    date: '18 jul. 2026',
    time: '08:30',
    services: ['Corte feminino'],
    duration: '45min',
    status: 'Cancelado',
  },
]

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`status-badge status-badge--${status.toLowerCase().replace('í', 'i')}`}>{status}</span>
}

function RowActions({ canChange }: { canChange: boolean }) {
  return (
    <div className="appointment-actions">
      <button className="icon-button" type="button" aria-label="Ver detalhes" title="Ver detalhes">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      </button>
      <button className="icon-button" type="button" aria-label="Editar agendamento" title="Editar" disabled={!canChange}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="m14.5 5.5 4 4M4 20l4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
        </svg>
      </button>
      <button className="icon-button icon-button--danger" type="button" aria-label="Cancelar agendamento" title="Cancelar" disabled={!canChange}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>
    </div>
  )
}

export function AppointmentTable() {
  return (
    <div className="appointments-table-wrap">
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Data e horário</th>
            <th>Serviços</th>
            <th>Duração</th>
            <th>Status</th>
            <th><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const canChange = appointment.status === 'Pendente' || appointment.status === 'Confirmado'

            return (
              <tr key={appointment.id}>
                <td data-label="Data e horário">
                  <strong className="appointment-date">{appointment.date}</strong>
                  <span className="appointment-time">{appointment.time} · {appointment.id}</span>
                </td>
                <td data-label="Serviços">
                  <div className="service-list">
                    {appointment.services.map((service) => <span key={service}>{service}</span>)}
                  </div>
                </td>
                <td data-label="Duração">{appointment.duration}</td>
                <td data-label="Status"><StatusBadge status={appointment.status} /></td>
                <td className="appointments-table__actions"><RowActions canChange={canChange} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
