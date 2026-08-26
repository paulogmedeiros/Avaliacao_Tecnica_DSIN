import { useState } from 'react'
import type { SalonService } from '../api/services.api'
import { AdminServiceFormDrawer } from '../components/admin/AdminServiceFormDrawer'
import { AdminServiceStatusModal } from '../components/admin/AdminServiceStatusModal'
import { filterAdminServices } from '../components/admin/adminServiceManagement.js'
import { useAdminServiceMutations, useAdminServices } from '../hooks/useAppointments'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const initialFilters = { search: '', status: '' as '' | 'active' | 'inactive' }

export function AdminServicesPage() {
  const servicesQuery = useAdminServices()
  const mutations = useAdminServiceMutations()
  const [filters, setFilters] = useState(initialFilters)
  const [drawer, setDrawer] = useState<{ mode: 'create' | 'edit'; service: SalonService | null } | null>(null)
  const [statusService, setStatusService] = useState<SalonService | null>(null)
  const services = servicesQuery.data ?? []
  const filtered = filterAdminServices(services, filters)

  return <div className="admin-page admin-services-page">
    <header className="admin-page__header service-page-header"><div><p>Catálogo do salão</p><h1>Serviços</h1><span>Organize os serviços disponíveis para os agendamentos.</span></div><button className="service-new-button" type="button" onClick={() => setDrawer({ mode: 'create', service: null })}><span>＋</span>Novo serviço</button></header>

    <section className="admin-services-panel" aria-labelledby="admin-services-title">
      <div className="admin-services-panel__heading"><div><h2 id="admin-services-title">Todos os serviços</h2><p>{filtered.length} {filtered.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}</p></div><button type="button" onClick={() => setFilters(initialFilters)} disabled={!filters.search && !filters.status}>Limpar filtros</button></div>
      <div className="admin-service-filters">
        <label><span>Buscar serviço</span><div><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg><input type="search" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Ex.: Hidratação" /></div></label>
        <label><span>Situação</span><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as typeof initialFilters.status }))}><option value="">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></label>
      </div>
      {servicesQuery.isLoading ? <p className="request-state">Carregando serviços...</p> : null}
      {servicesQuery.isError ? <p className="form-error" role="alert">Não foi possível carregar os serviços.</p> : null}
      {!servicesQuery.isLoading && !servicesQuery.isError && filtered.length ? <div className="admin-services-table-wrap"><table className="admin-services-table"><thead><tr><th>Serviço</th><th>Preço</th><th>Duração</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filtered.map((service) => <tr key={service.id}><td><div className="service-name-cell"><span>{service.name.charAt(0).toUpperCase()}</span><div><strong>{service.name}</strong><small>{service.description || 'Sem descrição'}</small></div></div></td><td><strong>{money.format(Number(service.price))}</strong></td><td>{service.durationMinutes} min</td><td><span className={service.isActive ? 'service-status is-active' : 'service-status is-inactive'}>{service.isActive ? 'Ativo' : 'Inativo'}</span></td><td><div className="service-row-actions"><button type="button" onClick={() => setDrawer({ mode: 'edit', service })} aria-label={`Editar ${service.name}`} title="Editar"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m14 7 3 3"/></svg></button><button type="button" className={service.isActive ? 'is-deactivate' : 'is-reactivate'} onClick={() => setStatusService(service)} aria-label={`${service.isActive ? 'Desativar' : 'Reativar'} ${service.name}`} title={service.isActive ? 'Desativar' : 'Reativar'}>{service.isActive ? '—' : '↻'}</button></div></td></tr>)}</tbody></table></div> : null}
      {!servicesQuery.isLoading && !servicesQuery.isError && !filtered.length ? <div className="admin-service-empty"><strong>Nenhum serviço encontrado</strong><p>Ajuste os filtros ou cadastre um novo serviço.</p></div> : null}
      {filtered.length ? <footer className="admin-table-footer"><span>Mostrando {filtered.length} de {services.length}</span><div><button type="button" disabled aria-label="Página anterior">‹</button><button type="button" className="is-current" aria-current="page">1</button><button type="button" disabled aria-label="Próxima página">›</button></div></footer> : null}
    </section>

    <AdminServiceFormDrawer mode={drawer?.mode ?? 'create'} service={drawer?.service ?? null} isOpen={Boolean(drawer)} isPending={mutations.create.isPending || mutations.update.isPending} onClose={() => setDrawer(null)} onCreate={async (input) => { await mutations.create.mutateAsync(input) }} onUpdate={async (input) => { await mutations.update.mutateAsync(input) }} />
    <AdminServiceStatusModal service={statusService} isPending={mutations.update.isPending} onClose={() => setStatusService(null)} onConfirm={async (service) => { await mutations.update.mutateAsync({ id: service.id, isActive: !service.isActive }) }} />
  </div>
}
