import { useMemo, useState } from 'react'
import type { Appointment } from './appointmentsData'
import { useAvailability, useAppointmentMutations, useServices } from '../../hooks/useAppointments'
import { getApiError } from '../../lib/apiError'
import { formatDuration, toSalonStartAt } from '../../lib/apiMappers.js'

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export function EditAppointmentDrawer({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const servicesQuery = useServices()
  const [serviceIds, setServiceIds] = useState(() => appointment?.services.map((item) => item.serviceId).filter(Boolean) as string[] ?? [])
  const [date, setDate] = useState(() => appointment?.scheduledAt.slice(0, 10) ?? '')
  const [time, setTime] = useState(() => appointment?.time ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const availability = useAvailability(date, serviceIds)
  const { updateClient } = useAppointmentMutations()
  const selected = useMemo(() => (servicesQuery.data ?? []).filter((item) => serviceIds.includes(item.id)), [servicesQuery.data, serviceIds])
  const totalMinutes = selected.reduce((sum, item) => sum + item.durationMinutes, 0)
  const totalPrice = selected.reduce((sum, item) => sum + Number(item.price), 0)
  const times = (availability.data?.slots ?? []).map((slot) => new Date(slot.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }))
  if (!appointment) return null
  const toggle = (id: string) => setServiceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  async function save() { setError(''); try { await updateClient.mutateAsync({ id: appointment!.id, startAt: toSalonStartAt(date, time), serviceIds }); setSaved(true) } catch (requestError) { setError(getApiError(requestError)) } }
  return <div className="booking-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
    <aside className="edit-drawer" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <header className="booking-drawer__header"><div><span className="booking-drawer__eyebrow">{appointment.id}</span><h2 id="edit-title">{saved ? 'Alteração concluída' : 'Editar agendamento'}</h2></div><button className="booking-close" type="button" onClick={onClose} aria-label="Fechar edição">×</button></header>
      {!saved ? <><div className="edit-drawer__body">
        <div className="edit-rule-banner"><div><strong>Alteração online disponível</strong><p>O backend validará a antecedência mínima de 48 horas.</p></div></div>
        <section className="edit-section"><div className="edit-section__heading"><span>1</span><div><h3>Serviços</h3><p>Adicione ou remova serviços.</p></div></div><div className="edit-service-grid">{(servicesQuery.data ?? []).map((service) => <button className={serviceIds.includes(service.id) ? 'is-selected' : ''} type="button" key={service.id} onClick={() => toggle(service.id)} aria-pressed={serviceIds.includes(service.id)}><span className="edit-service-check">{serviceIds.includes(service.id) ? '✓' : ''}</span><span><strong>{service.name}</strong><small>{formatDuration(service.durationMinutes)} · {money(Number(service.price))}</small></span></button>)}</div></section>
        <section className="edit-section"><div className="edit-section__heading"><span>2</span><div><h3>Nova data</h3><p>Escolha outro dia.</p></div></div><label className="booking-date-field"><span>Data do agendamento</span><input type="date" value={date} onChange={(event) => { setDate(event.target.value); setTime('') }} /></label></section>
        <section className="edit-section"><div className="edit-section__heading"><span>3</span><div><h3>Novo horário</h3><p>{availability.isLoading ? 'Consultando horários...' : 'Selecione um horário disponível.'}</p></div></div><div className="time-options edit-time-options">{times.map((option) => <button className={time === option ? 'is-selected' : ''} type="button" key={option} onClick={() => setTime(option)}>{option}</button>)}</div></section>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div><footer className="edit-drawer__footer"><div className="edit-summary"><span>{serviceIds.length} serviço(s)</span><strong>{formatDuration(totalMinutes)} · {money(totalPrice)}</strong></div><button className="booking-next" type="button" disabled={!serviceIds.length || !date || !time || updateClient.isPending} onClick={save}>{updateClient.isPending ? 'Salvando...' : 'Salvar alterações'}</button></footer></> : <div className="booking-success edit-success"><h3>Agendamento atualizado</h3><p>As novas informações foram salvas.</p><button className="booking-next booking-next--full" type="button" onClick={onClose}>Voltar aos agendamentos</button></div>}
    </aside>
  </div>
}
