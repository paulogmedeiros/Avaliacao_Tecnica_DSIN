import { useMemo, useState } from 'react'
import type { Appointment } from './appointmentsData'

const editableServices = [
  { name: 'Corte feminino', durationMinutes: 45, price: 65 },
  { name: 'Hidratação', durationMinutes: 60, price: 90 },
  { name: 'Coloração', durationMinutes: 120, price: 180 },
  { name: 'Escova', durationMinutes: 45, price: 55 },
  { name: 'Manicure', durationMinutes: 45, price: 40 },
]

const availableTimes = ['08:00', '08:30', '09:30', '10:00', '10:30', '13:00', '13:30', '14:30', '15:00']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder}min`
  if (!remainder) return `${hours}h`
  return `${hours}h ${remainder}min`
}

export function EditAppointmentDrawer({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const [selectedServices, setSelectedServices] = useState(() => appointment?.services.map((service) => service.name) ?? [])
  const [date, setDate] = useState(() => appointment?.scheduledAt.slice(0, 10) ?? '')
  const [time, setTime] = useState(() => appointment?.time ?? '')
  const [isSaved, setIsSaved] = useState(false)

  const summary = useMemo(() => editableServices.reduce(
    (total, service) => selectedServices.includes(service.name)
      ? { duration: total.duration + service.durationMinutes, price: total.price + service.price }
      : total,
    { duration: 0, price: 0 },
  ), [selectedServices])

  if (!appointment) return null

  function toggleService(serviceName: string) {
    setSelectedServices((current) => current.includes(serviceName)
      ? current.filter((name) => name !== serviceName)
      : [...current, serviceName])
  }

  return (
    <div className="booking-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose()
    }}>
      <aside className="edit-drawer" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <header className="booking-drawer__header">
          <div>
            <span className="booking-drawer__eyebrow">{appointment.id}</span>
            <h2 id="edit-title">{isSaved ? 'Alteração concluída' : 'Editar agendamento'}</h2>
          </div>
          <button className="booking-close" type="button" onClick={onClose} aria-label="Fechar edição">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        {!isSaved ? (
          <>
            <div className="edit-drawer__body">
              <div className="edit-rule-banner">
                <span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m7 12 3 3 7-7" /><circle cx="12" cy="12" r="9" /></svg></span>
                <div><strong>Alteração online disponível</strong><p>Este agendamento possui mais de 48 horas de antecedência.</p></div>
              </div>

              <section className="edit-section">
                <div className="edit-section__heading"><span>1</span><div><h3>Serviços</h3><p>Adicione ou remova serviços do agendamento.</p></div></div>
                <div className="edit-service-grid">
                  {editableServices.map((service) => {
                    const selected = selectedServices.includes(service.name)
                    return (
                      <button className={selected ? 'is-selected' : ''} type="button" key={service.name} onClick={() => toggleService(service.name)} aria-pressed={selected}>
                        <span className="edit-service-check" aria-hidden="true">{selected ? '✓' : ''}</span>
                        <span><strong>{service.name}</strong><small>{formatDuration(service.durationMinutes)} · {formatCurrency(service.price)}</small></span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="edit-section">
                <div className="edit-section__heading"><span>2</span><div><h3>Nova data</h3><p>Escolha outro dia de atendimento.</p></div></div>
                <label className="booking-date-field"><span>Data do agendamento</span><input type="date" min="2026-08-27" value={date} onChange={(event) => setDate(event.target.value)} /></label>
              </section>

              <section className="edit-section">
                <div className="edit-section__heading"><span>3</span><div><h3>Novo horário</h3><p>Opções demonstrativas para a data selecionada.</p></div></div>
                <div className="time-options edit-time-options">
                  {availableTimes.map((option) => <button className={time === option ? 'is-selected' : ''} type="button" key={option} onClick={() => setTime(option)}>{option}</button>)}
                </div>
              </section>
            </div>

            <footer className="edit-drawer__footer">
              <div className="edit-summary"><span>{selectedServices.length} serviço(s)</span><strong>{formatDuration(summary.duration)} · {formatCurrency(summary.price)}</strong></div>
              <button className="booking-next" type="button" disabled={!selectedServices.length || !date || !time} onClick={() => setIsSaved(true)}>Salvar alterações</button>
            </footer>
          </>
        ) : (
          <div className="booking-success edit-success">
            <span className="booking-success__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg></span>
            <h3>Agendamento atualizado</h3>
            <p>As novas informações foram salvas na demonstração da interface.</p>
            <div className="booking-success__card"><span>{date} · {time}</span><strong>{formatCurrency(summary.price)}</strong></div>
            <button className="booking-next booking-next--full" type="button" onClick={onClose}>Voltar aos agendamentos</button>
          </div>
        )}
      </aside>
    </div>
  )
}
