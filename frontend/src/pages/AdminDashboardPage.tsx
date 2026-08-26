import { useState } from 'react'
import { WeeklyMetricCard } from '../components/admin/WeeklyMetricCard'
import { getWeekRange, moveWeek } from '../components/admin/weeklyReport.js'
import { useWeeklyReport } from '../hooks/useAppointments'
import { useAuthStore } from '../stores/auth.store'

const currentWeek = new Date().toISOString().slice(0, 10)

function formatWeek(start: string, end: string) {
  const startDate = new Date(`${start}T12:00:00Z`)
  const endDate = new Date(`${end}T12:00:00Z`)
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(endDate)
  return `${startDate.getUTCDate()} a ${endDate.getUTCDate()} de ${month} de ${endDate.getUTCFullYear()}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function AdminDashboardPage() {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const range = getWeekRange(selectedWeek)
  const reportQuery = useWeeklyReport(selectedWeek)
  const report = reportQuery.data
  const name = useAuthStore((state) => state.user?.name) ?? 'Administradora'

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div><p>Olá, {name}</p><h1>Visão semanal</h1><span>Acompanhe o desempenho do salão em um só lugar.</span></div>
        <div className="admin-date"><small>Hoje</small><strong>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}</strong></div>
      </header>

      <section className="weekly-report" aria-labelledby="weekly-report-title">
        <div className="weekly-report__toolbar">
          <div><h2 id="weekly-report-title">Resumo da semana</h2><p>{formatWeek(range.start, range.end)}</p></div>
          <div className="week-navigation">
            <button type="button" onClick={() => setSelectedWeek(moveWeek(selectedWeek, -1))} aria-label="Semana anterior">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m14 6-6 6 6 6" /></svg>
            </button>
            <span>{selectedWeek === currentWeek ? 'Semana atual' : 'Outra semana'}</span>
            <button type="button" onClick={() => setSelectedWeek(moveWeek(selectedWeek, 1))} aria-label="Próxima semana">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m10 6 6 6-6 6" /></svg>
            </button>
          </div>
        </div>

        {reportQuery.isLoading ? <p className="request-state">Carregando relatório...</p> : null}
        {reportQuery.isError ? <p className="form-error">Não foi possível carregar o relatório.</p> : null}
        {report ? <div className="weekly-metrics">
          <WeeklyMetricCard label="Agendamentos" value={report.appointments.total} note="recebidos na semana" icon="calendar" tone="accent" />
          <WeeklyMetricCard label="Receita estimada" value={formatCurrency(Number(report.revenue.expected))} note="serviços pendentes e confirmados" icon="money" tone="accent" />
          <WeeklyMetricCard label="Pendentes" value={report.appointments.pending} note="aguardando confirmação" icon="clock" />
          <WeeklyMetricCard label="Confirmados" value={report.appointments.confirmed} note="horários reservados" icon="check" />
          <WeeklyMetricCard label="Concluídos" value={report.appointments.completed} note="atendimentos finalizados" icon="complete" tone="success" />
          <WeeklyMetricCard label="Cancelados" value={report.appointments.canceled} note="mantidos no histórico" icon="cancel" tone="danger" />
          <WeeklyMetricCard label="Serviços previstos" value={report.services.total} note="serviços solicitados" icon="services" />
          <WeeklyMetricCard label="Taxa de ocupação" value={`${report.occupancy.occupancyRate}%`} note="sobre os horários disponíveis" icon="rate" />
        </div> : null}
      </section>
    </div>
  )
}
