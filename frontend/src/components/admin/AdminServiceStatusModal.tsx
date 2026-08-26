import type { SalonService } from '../../api/services.api'

type Props = { service: SalonService | null; isPending: boolean; onClose: () => void; onConfirm: (service: SalonService) => Promise<unknown> }

export function AdminServiceStatusModal({ service, isPending, onClose, onConfirm }: Props) {
  if (!service) return null
  const nextActive = !service.isActive
  return <div className="service-status-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><section className="service-status-modal" role="dialog" aria-modal="true" aria-labelledby="service-status-title">
    <button className="service-status-modal__close" type="button" onClick={onClose} aria-label="Fechar confirmação">×</button>
    <span className={nextActive ? 'is-reactivate' : ''} aria-hidden="true">{nextActive ? '↻' : '—'}</span>
    <small>{nextActive ? 'Reativar serviço' : 'Desativar serviço'}</small>
    <h2 id="service-status-title">{nextActive ? 'Disponibilizar novamente?' : 'Retirar do catálogo?'}</h2>
    <p>{nextActive ? `${service.name} voltará a aparecer para novos agendamentos.` : `${service.name} deixará de aparecer para clientes, mas continuará preservado no histórico.`}</p>
    <div><button type="button" onClick={onClose}>Voltar</button><button type="button" disabled={isPending} onClick={async () => { await onConfirm(service); onClose() }}>{isPending ? 'Salvando...' : nextActive ? 'Reativar serviço' : 'Desativar serviço'}</button></div>
  </section></div>
}
