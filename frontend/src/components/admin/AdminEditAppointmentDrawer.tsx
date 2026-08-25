import { useState } from 'react'
import type { AppointmentService } from '../client/appointmentsData'
import { buildScheduledAt, calculateAdminServiceSummary, formatDuration } from './adminEditAppointment.js'
import type { AdminAppointment } from './adminAppointmentsData'

const serviceOptions = [
  { id: 'cut', name: 'Corte feminino', durationMinutes: 45, price: 65 },
  { id: 'hydration', name: 'Hidratação', durationMinutes: 60, price: 90 },
  { id: 'color', name: 'Coloração', durationMinutes: 120, price: 180 },
  { id: 'brush', name: 'Escova', durationMinutes: 45, price: 55 },
  { id: 'manicure', name: 'Manicure', durationMinutes: 45, price: 40 },
]

const availableTimes = ['08:00', '08:30', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:30', '15:00', '16:00']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatAdminDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`)).replace('.', '')
}

export function AdminEditAppointmentDrawer({ appointment, onClose, onSave }: {
  appointment: AdminAppointment | null
  onClose: () => void
  onSave: (appointment: AdminAppointment) => void
}) {
  const [selectedServices, setSelectedServices] = useState(() => appointment?.services.map((service) => service.name) ?? [])
  const [date, setDate] = useState(() => appointment?.scheduledAt.slice(0, 10) ?? '')
  const [time, setTime] = useState(() => appointment?.time ?? '')
  const [isSaved, setIsSaved] = useState(false)

  if (!appointment) return null
  const activeAppointment = appointment

  const selectedOptions = serviceOptions.filter((service) => selectedServices.includes(service.name))
  const summary = calculateAdminServiceSummary(selectedOptions)

  function toggleService(name: string) {
    setSelectedServices((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  function saveChanges() {
    const services: AppointmentService[] = selectedOptions.map((option) => {
      const currentService = activeAppointment.services.find((service) => service.name === option.name)
      return {
        id: currentService?.id ?? `AS-DEMO-${option.id}`,
        name: option.name,
        duration: formatDuration(option.durationMinutes),
        price: option.price,
        status: currentService?.status ?? (activeAppointment.status === 'Confirmado' ? 'Confirmado' : 'Pendente'),
      }
    })

    onSave({
      ...activeAppointment,
      date: formatAdminDate(date),
      time,
      scheduledAt: buildScheduledAt(date, time),
      services,
      duration: formatDuration(summary.durationMinutes),
      totalPrice: summary.totalPrice,
    })
    setIsSaved(true)
  }

  return (
    <div className="admin-edit-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <aside className="admin-edit-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-edit-title">
        <header className="admin-edit-drawer__header">
          <div><span>{appointment.id} · Administração</span><h2 id="admin-edit-title">{isSaved ? 'Agendamento atualizado' : 'Editar agendamento'}</h2></div>
          <button type="button" onClick={onClose} aria-label="Fechar edição"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
        </header>

        {!isSaved ? <>
          <div className="admin-edit-drawer__body">
            <div className="admin-edit-permission"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m7 12 3 3 7-7" /><circle cx="12" cy="12" r="9" /></svg></span><div><strong>Alteração administrativa liberada</strong><p>Não há restrição de 48 horas para atendimentos solicitados por telefone.</p></div></div>

            <section className="admin-edit-section">
              <div className="admin-edit-section__title"><span>01</span><div><h3>Serviços</h3><p>Adicione ou remova serviços deste agendamento.</p></div></div>
              <div className="admin-edit-services">
                {serviceOptions.map((service) => {
                  const selected = selectedServices.includes(service.name)
                  return <button className={selected ? 'is-selected' : ''} type="button" key={service.id} onClick={() => toggleService(service.name)} aria-pressed={selected}><span className="admin-edit-check" aria-hidden="true">{selected ? '✓' : ''}</span><span><strong>{service.name}</strong><small>{formatDuration(service.durationMinutes)} · {formatCurrency(service.price)}</small></span></button>
                })}
              </div>
            </section>

            <section className="admin-edit-section admin-edit-section--schedule">
              <div className="admin-edit-section__title"><span>02</span><div><h3>Data e horário</h3><p>Escolha o novo momento do atendimento.</p></div></div>
              <label className="admin-edit-date"><span>Data do agendamento</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
              <div className="admin-edit-times" aria-label="Horários disponíveis">{availableTimes.map((option) => <button className={time === option ? 'is-selected' : ''} type="button" key={option} onClick={() => setTime(option)}>{option}</button>)}</div>
            </section>
          </div>

          <footer className="admin-edit-drawer__footer"><div><span>{selectedServices.length} serviço(s) · {formatDuration(summary.durationMinutes)}</span><strong>{formatCurrency(summary.totalPrice)}</strong></div><button type="button" disabled={!selectedServices.length || !date || !time} onClick={saveChanges}>Salvar alterações</button></footer>
        </> : <div className="admin-edit-success"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg></span><h3>Alterações salvas</h3><p>A tabela e o detalhamento já mostram as novas informações nesta demonstração.</p><div><small>Novo horário</small><strong>{formatAdminDate(date)}, às {time}</strong></div><button type="button" onClick={onClose}>Voltar aos agendamentos</button></div>}
      </aside>
    </div>
  )
}
