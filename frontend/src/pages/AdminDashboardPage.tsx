export function AdminDashboardPage() {
  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div><p>Olá, Leila</p><h1>Visão semanal</h1><span>Acompanhe o desempenho do salão em um só lugar.</span></div>
        <div className="admin-date"><small>Hoje</small><strong>25 de agosto de 2026</strong></div>
      </header>

      <section className="admin-stage-placeholder" aria-labelledby="dashboard-stage-title">
        <span className="admin-stage-placeholder__number">01</span>
        <div><h2 id="dashboard-stage-title">Dashboard preparado</h2><p>Na próxima etapa, este espaço receberá os indicadores semanais em blocos simples, sem gráficos.</p></div>
      </section>
    </div>
  )
}
