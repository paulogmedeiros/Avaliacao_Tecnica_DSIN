import { useMemo, useState } from 'react'
import { calculateBookingSummary, canContinueBooking, formatBookingDate } from './bookingFlow.js'
import { useAvailability, useAppointmentMutations, useServices } from '../../hooks/useAppointments'
import { getApiError } from '../../lib/apiError'
import { toSalonStartAt } from '../../lib/apiMappers.js'

type NewAppointmentDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

type ServiceOption = {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: number
}

const stepLabels = ['Serviços', 'Data', 'Horário', 'Revisão']

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes}min`
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}min`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function NewAppointmentDrawer({ isOpen, onClose }: NewAppointmentDrawerProps) {
  const servicesQuery = useServices()
  const services: ServiceOption[] = useMemo(() => (servicesQuery.data ?? []).map((service) => ({ ...service, description: service.description ?? '' })), [servicesQuery.data])
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [requestError, setRequestError] = useState('')
  const availability = useAvailability(selectedDate, selectedServices)
  const { create } = useAppointmentMutations()
  const availableTimes = (availability.data?.slots ?? []).map((slot) => new Date(slot.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }))

  const selectedServiceOptions = useMemo(
    () => services.filter((service) => selectedServices.includes(service.id)),
    [selectedServices, services],
  )
  const summary = calculateBookingSummary(selectedServiceOptions)
  const formattedDate = selectedDate ? formatBookingDate(selectedDate) : null
  const canContinue = canContinueBooking(step, {
    services: selectedServices,
    date: selectedDate,
    time: selectedTime,
  })

  function toggleService(serviceId: string) {
    setSelectedServices((current) => (
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    ))
  }

  function resetAndClose() {
    setStep(1)
    setSelectedServices([])
    setSelectedDate('')
    setSelectedTime('')
    setIsComplete(false)
    setRequestError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="booking-overlay" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) resetAndClose()
    }}>
      <aside className="booking-drawer" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <header className="booking-drawer__header">
          <div>
            <span className="booking-drawer__eyebrow">Novo agendamento</span>
            <h2 id="booking-title">{isComplete ? 'Tudo certo!' : stepLabels[step - 1]}</h2>
          </div>
          <button className="booking-close" type="button" onClick={resetAndClose} aria-label="Fechar">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        {!isComplete ? (
          <>
            <ol className="booking-progress" aria-label={`Etapa ${step} de 4`}>
              {stepLabels.map((label, index) => (
                <li key={label} className={index + 1 <= step ? 'is-active' : ''}>
                  <span>{index + 1}</span>
                  <small>{label}</small>
                </li>
              ))}
            </ol>

            <div className="booking-drawer__body">
              {step === 1 ? (
                <section className="booking-step">
                  <div className="booking-step__heading">
                    <h3>Escolha seus serviços</h3>
                    <p>Você pode selecionar mais de uma opção.</p>
                  </div>
                  {servicesQuery.isLoading ? <p>Carregando serviços...</p> : null}
                  {servicesQuery.isError ? <p className="form-error">Não foi possível carregar os serviços.</p> : null}
                  <div className="service-options">
                    {services.map((service) => {
                      const isSelected = selectedServices.includes(service.id)
                      return (
                        <button
                          className={`service-option${isSelected ? ' is-selected' : ''}`}
                          type="button"
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          aria-pressed={isSelected}
                        >
                          <span className="service-option__check" aria-hidden="true">
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="service-option__content">
                            <strong>{service.name}</strong>
                            <small>{service.description}</small>
                            <span>{formatDuration(service.durationMinutes)} · {formatCurrency(service.price)}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section className="booking-step">
                  <div className="booking-step__heading">
                    <h3>Escolha a data</h3>
                    <p>Atendemos de segunda a sábado.</p>
                  </div>
                  {availability.data?.suggestion ? <button className="date-suggestion" type="button" onClick={() => setSelectedDate(availability.data!.suggestion!.date)}>
                    <span className="date-suggestion__icon" aria-hidden="true">✦</span>
                    <span>
                      <strong>Você já vem ao salão nesta semana</strong>
                      <small>{availability.data.suggestion.message}</small>
                    </span>
                    <span className="date-suggestion__action">Usar data</span>
                  </button> : null}
                  <label className="booking-date-field">
                    <span>Data do agendamento</span>
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={selectedDate} onChange={(event) => {
                      setSelectedDate(event.target.value)
                      setSelectedTime('')
                    }} />
                  </label>
                  <div className="business-note">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                    <p>Segunda a sexta, das 8h às 18h. Sábado, das 8h às 15h. Pausa diária das 12h às 13h.</p>
                  </div>
                </section>
              ) : null}

              {step === 3 ? (
                <section className="booking-step">
                  <div className="booking-step__heading">
                    <h3>Escolha o horário</h3>
                    <p>Horários disponíveis para a data selecionada.</p>
                  </div>
                  <div className="time-period">
                    <span>Manhã</span>
                    <div className="time-options">
                      {availableTimes.filter((time) => time < '12:00').map((time) => (
                        <button className={selectedTime === time ? 'is-selected' : ''} type="button" key={time} onClick={() => setSelectedTime(time)}>{time}</button>
                      ))}
                    </div>
                  </div>
                  <div className="time-period">
                    <span>Tarde</span>
                    <div className="time-options">
                      {availableTimes.filter((time) => time >= '13:00').map((time) => (
                        <button className={selectedTime === time ? 'is-selected' : ''} type="button" key={time} onClick={() => setSelectedTime(time)}>{time}</button>
                      ))}
                    </div>
                  </div>
                  {availability.isLoading ? <p className="time-note">Consultando horários...</p> : <p className="time-note">{availableTimes.length ? 'O horário considera a duração total dos serviços selecionados.' : 'Nenhum horário disponível nesta data.'}</p>}
                </section>
              ) : null}

              {step === 4 ? (
                <section className="booking-step">
                  <div className="booking-step__heading">
                    <h3>Revise seu agendamento</h3>
                    <p>Confira as informações antes de confirmar.</p>
                  </div>
                  <div className="booking-review">
                    <div className="booking-review__date">
                      <span className="booking-review__calendar">{formattedDate?.day}</span>
                      <span><small>{formattedDate?.weekday}</small><strong>{formattedDate?.monthYear}, às {selectedTime}</strong></span>
                    </div>
                    <div className="booking-review__services">
                      <span>Serviços</span>
                      {selectedServiceOptions.map((service) => (
                        <div key={service.id}><strong>{service.name}</strong><span>{formatCurrency(service.price)}</span></div>
                      ))}
                    </div>
                    <div className="booking-review__total">
                      <span>Duração estimada <strong>{formatDuration(summary.durationMinutes)}</strong></span>
                      <span>Total <strong>{formatCurrency(summary.price)}</strong></span>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            <footer className="booking-drawer__footer">
              {step > 1 ? <button className="booking-back" type="button" onClick={() => setStep((current) => current - 1)}>Voltar</button> : <span />}
              <div className="booking-footer__summary">
                {selectedServices.length > 0 ? <span>{selectedServices.length} serviço(s) · <strong>{formatCurrency(summary.price)}</strong></span> : null}
                {requestError ? <p className="form-error" role="alert">{requestError}</p> : null}<button
                  className="booking-next"
                  type="button"
                  disabled={!canContinue}
                  onClick={async () => {
                    if (step !== 4) { setStep((current) => current + 1); return }
                    setRequestError('')
                    try { await create.mutateAsync({ startAt: toSalonStartAt(selectedDate, selectedTime), serviceIds: selectedServices }); setIsComplete(true) }
                    catch (error) { setRequestError(getApiError(error)) }
                  }}
                >
                  {step === 4 ? (create.isPending ? 'Confirmando...' : 'Confirmar agendamento') : 'Continuar'}
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M14 7l5 5-5 5" /></svg>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="booking-success">
            <span className="booking-success__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" /></svg>
            </span>
            <h3>Agendamento confirmado</h3>
            <p>Seu horário foi reservado para {formattedDate?.weekday.toLowerCase()}, {formattedDate?.day} de {formattedDate?.monthYear.toLowerCase()}, às {selectedTime}.</p>
            <div className="booking-success__card">
              <span>{selectedServices.length} serviço(s)</span>
              <strong>{formatDuration(summary.durationMinutes)} · {formatCurrency(summary.price)}</strong>
            </div>
            <button className="booking-next booking-next--full" type="button" onClick={resetAndClose}>Voltar aos agendamentos</button>
          </div>
        )}
      </aside>
    </div>
  )
}
