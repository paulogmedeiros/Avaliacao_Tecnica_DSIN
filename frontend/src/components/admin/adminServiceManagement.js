const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function filterAdminServices(services, filters) {
  const search = normalize(filters.search.trim())

  return services.filter((service) => {
    const matchesSearch = !search || normalize(`${service.name} ${service.description ?? ''}`).includes(search)
    const matchesStatus = filters.status === 'active'
      ? service.isActive
      : filters.status === 'inactive'
        ? !service.isActive
        : true

    return matchesSearch && matchesStatus
  })
}

const toNumber = (value) => Number(String(value).replace(',', '.'))

export function validateServiceCreation(input) {
  const errors = {}
  const price = toNumber(input.price)
  const duration = Number(input.durationMinutes)

  if (input.name.trim().length < 2) errors.name = 'Informe um nome com pelo menos 2 caracteres.'
  if (String(input.price).trim() === '' || !Number.isFinite(price) || price < 0) errors.price = 'Informe um preço válido.'
  if (String(input.durationMinutes).trim() === '' || !Number.isInteger(duration) || duration < 1) errors.durationMinutes = 'Informe uma duração válida em minutos.'

  return errors
}

export function toCreateServicePayload(input) {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    price: toNumber(input.price),
    durationMinutes: Number(input.durationMinutes),
  }
}
