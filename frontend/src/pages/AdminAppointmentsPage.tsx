import { useState } from 'react'
import { AdminAppointmentsTable } from '../components/admin/AdminAppointmentsTable'
import { filterAdminAppointments } from '../components/admin/adminAppointmentFilter.js'
import { adminAppointments } from '../components/admin/adminAppointmentsData'

const initialFilters = { search: '', startDate: '', endDate: '', status: '' }

export function AdminAppointmentsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [actionNotice, setActionNotice] = useState<string | null>(null)
  const filteredAppointments = filterAdminAppointments(adminAppointments, filters)

  function setFilter(name: keyof typeof initialFilters, value: string) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function showNextStepNotice(appointmentId: string, action: 'view' | 'edit' | 'confirm') {
    const labels = { view: 'Detalhamento', edit: 'Edição administrativa', confirm: 'Confirmação' }
    setActionNotice(`${labels[action]} do agendamento ${appointmentId} será disponibilizada na próxima etapa.`)
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div><p>Operação do salão</p><h1>Agendamentos</h1><span>Consulte e gerencie todos os atendimentos recebidos.</span></div>
      </header>

      <section className="admin-appointments-panel" aria-labelledby="admin-appointments-title">
        <div className="admin-appointments-panel__heading">
          <div><h2 id="admin-appointments-title">Todos os agendamentos</h2><p>{filteredAppointments.length} {filteredAppointments.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</p></div>
          <button className="admin-clear-filters" type="button" onClick={() => setFilters(initialFilters)} disabled={!Object.values(filters).some(Boolean)}>Limpar filtros</button>
        </div>

        <form className="admin-filters" onSubmit={(event) => event.preventDefault()}>
          <label className="admin-search-field"><span>Buscar cliente ou código</span><div><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg><input type="search" placeholder="Ex.: Mariana ou AG-1052" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} /></div></label>
          <label><span>Data inicial</span><input type="date" value={filters.startDate} onChange={(event) => setFilter('startDate', event.target.value)} /></label>
          <label><span>Data final</span><input type="date" value={filters.endDate} onChange={(event) => setFilter('endDate', event.target.value)} /></label>
          <label><span>Status</span><select value={filters.status} onChange={(event) => setFilter('status', event.target.value)}><option value="">Todos</option><option value="Pendente">Pendente</option><option value="Confirmado">Confirmado</option><option value="Concluído">Concluído</option><option value="Cancelado">Cancelado</option></select></label>
        </form>

        {actionNotice ? <div className="admin-action-notice" role="status"><span>{actionNotice}</span><button type="button" onClick={() => setActionNotice(null)} aria-label="Fechar aviso">×</button></div> : null}

        {filteredAppointments.length ? <AdminAppointmentsTable appointments={filteredAppointments} onAction={showNextStepNotice} /> : (
          <div className="admin-empty-results"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4M8.5 11h5" /></svg></span><h3>Nenhum agendamento encontrado</h3><p>Altere os filtros para consultar outro período.</p><button type="button" onClick={() => setFilters(initialFilters)}>Limpar filtros</button></div>
        )}

        {filteredAppointments.length ? <footer className="admin-table-footer"><span>Mostrando {filteredAppointments.length} de {adminAppointments.length}</span><div><button type="button" disabled aria-label="Página anterior">‹</button><button type="button" className="is-current" aria-current="page">1</button><button type="button" disabled aria-label="Próxima página">›</button></div></footer> : null}
      </section>
    </div>
  )
}
