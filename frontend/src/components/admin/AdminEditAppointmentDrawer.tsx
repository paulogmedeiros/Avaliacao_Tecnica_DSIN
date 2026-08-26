import { useState } from 'react'
import type { AdminAppointment } from './adminAppointmentsData'
import { useAvailability, useAppointmentMutations, useServices } from '../../hooks/useAppointments'
import { formatDuration, toSalonStartAt } from '../../lib/apiMappers.js'
import { getApiError } from '../../lib/apiError'

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
export function AdminEditAppointmentDrawer({ appointment, onClose }: { appointment: AdminAppointment | null; onClose: () => void }) {
  const services = useServices()
  const [serviceIds, setServiceIds] = useState(() => appointment?.services.map((item) => item.serviceId).filter(Boolean) as string[] ?? [])
  const [date, setDate] = useState(() => appointment?.scheduledAt.slice(0, 10) ?? '')
  const [time, setTime] = useState(() => appointment?.time ?? '')
  const [saved, setSaved] = useState(false); const [error, setError] = useState('')
  const availability = useAvailability(date, serviceIds); const { updateAdmin } = useAppointmentMutations()
  if (!appointment) return null
  const selected = (services.data ?? []).filter((item) => serviceIds.includes(item.id))
  const minutes = selected.reduce((sum, item) => sum + item.durationMinutes, 0); const price = selected.reduce((sum, item) => sum + Number(item.price), 0)
  const times = (availability.data?.slots ?? []).map((slot) => new Date(slot.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }))
  const toggle = (id: string) => setServiceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  async function save() { setError(''); try { await updateAdmin.mutateAsync({ id: appointment!.id, startAt: toSalonStartAt(date, time), serviceIds }); setSaved(true) } catch (requestError) { setError(getApiError(requestError)) } }
  return <div className="admin-edit-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><aside className="admin-edit-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-edit-title">
    <header className="admin-edit-drawer__header"><div><span>{appointment.id} · Administração</span><h2 id="admin-edit-title">{saved ? 'Agendamento atualizado' : 'Editar agendamento'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar edição">×</button></header>
    {!saved ? <><div className="admin-edit-drawer__body"><div className="admin-edit-permission"><div><strong>Alteração administrativa liberada</strong><p>Não há restrição de 48 horas.</p></div></div>
      <section className="admin-edit-section"><div className="admin-edit-section__title"><span>01</span><div><h3>Serviços</h3><p>Adicione ou remova serviços.</p></div></div><div className="admin-edit-services">{(services.data ?? []).map((service) => <button className={serviceIds.includes(service.id) ? 'is-selected' : ''} type="button" key={service.id} onClick={() => toggle(service.id)} aria-pressed={serviceIds.includes(service.id)}><span className="admin-edit-check">{serviceIds.includes(service.id) ? '✓' : ''}</span><span><strong>{service.name}</strong><small>{formatDuration(service.durationMinutes)} · {money(Number(service.price))}</small></span></button>)}</div></section>
      <section className="admin-edit-section admin-edit-section--schedule"><div className="admin-edit-section__title"><span>02</span><div><h3>Data e horário</h3><p>Escolha o novo momento.</p></div></div><label className="admin-edit-date"><span>Data do agendamento</span><input type="date" value={date} onChange={(event) => { setDate(event.target.value); setTime('') }} /></label><div className="admin-edit-times" aria-label="Horários disponíveis">{times.map((option) => <button className={time === option ? 'is-selected' : ''} type="button" key={option} onClick={() => setTime(option)}>{option}</button>)}</div></section>{error ? <p className="form-error">{error}</p> : null}
    </div><footer className="admin-edit-drawer__footer"><div><span>{serviceIds.length} serviço(s) · {formatDuration(minutes)}</span><strong>{money(price)}</strong></div><button type="button" disabled={!serviceIds.length || !date || !time || updateAdmin.isPending} onClick={save}>{updateAdmin.isPending ? 'Salvando...' : 'Salvar alterações'}</button></footer></> : <div className="admin-edit-success"><h3>Alterações salvas</h3><p>A agenda foi atualizada no servidor.</p><button type="button" onClick={onClose}>Voltar aos agendamentos</button></div>}
  </aside></div>
}
