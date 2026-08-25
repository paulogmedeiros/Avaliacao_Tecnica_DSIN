export function AdminAppointmentsPage() {
  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div><p>Operação do salão</p><h1>Agendamentos</h1><span>Consulte e gerencie todos os atendimentos recebidos.</span></div>
      </header>

      <section className="admin-stage-placeholder" aria-labelledby="appointments-stage-title">
        <span className="admin-stage-placeholder__number">02</span>
        <div><h2 id="appointments-stage-title">Área de agendamentos preparada</h2><p>A tabela, os filtros e as ações administrativas serão construídos nas próximas etapas.</p></div>
      </section>
    </div>
  )
}
