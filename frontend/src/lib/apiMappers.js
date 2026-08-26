const labels = { PENDING: 'Pendente', CONFIRMED: 'Confirmado', COMPLETED: 'Concluído', CANCELED: 'Cancelado' }
export const mapStatus = (status) => labels[status] ?? status
export const toApiStatus = (status) => Object.entries(labels).find(([, label]) => label === status)?.[0] ?? status
export const toSalonStartAt = (date, time) => `${date}T${time}:00-03:00`
export const cleanHistoryFilters = (filters) => Object.fromEntries(
  Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined),
)
export function formatDuration(minutes) { const h = Math.floor(minutes / 60); const m = minutes % 60; return h ? (m ? `${h}h ${m}min` : `${h}h`) : `${m}min` }
const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
export function mapAppointment(data) {
  const start = new Date(data.startAt); const end = new Date(data.endAt)
  const services = (data.services ?? []).map((item) => ({ id: item.id, serviceId: item.serviceId ?? item.service?.id, name: item.serviceNameSnapshot ?? item.service?.name, duration: formatDuration(item.serviceDurationSnapshot ?? item.service?.durationMinutes ?? 0), durationMinutes: item.serviceDurationSnapshot ?? item.service?.durationMinutes ?? 0, price: Number(item.servicePriceSnapshot ?? item.service?.price ?? 0), status: mapStatus(item.status) }))
  const name = data.client?.name ?? ''
  return { id: data.id, date: formatter.format(start).replace('.', ''), time: start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }), scheduledAt: data.startAt, services, duration: formatDuration(Math.round((end - start) / 60000)), totalPrice: services.reduce((sum, item) => sum + item.price, 0), status: mapStatus(data.status), createdAt: data.createdAt ? dateTimeFormatter.format(new Date(data.createdAt)).replace('.', '').replace(',', ', às') : '', customer: data.client ? { name, email: data.client.email, phone: data.client.phone, initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() } : undefined }
}
