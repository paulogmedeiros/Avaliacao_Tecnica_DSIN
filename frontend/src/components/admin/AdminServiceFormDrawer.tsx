import { useState } from 'react'
import type { SalonService } from '../../api/services.api'
import { getApiError } from '../../lib/apiError'
import { toCreateServicePayload, validateServiceCreation } from './adminServiceManagement.js'

type Props = {
  mode: 'create' | 'edit'
  service: SalonService | null
  isOpen: boolean
  isPending: boolean
  onClose: () => void
  onCreate: (input: { name: string; description?: string; price: number; durationMinutes: number }) => Promise<unknown>
  onUpdate: (input: { id: string; name: string; description: string | null; isActive: boolean }) => Promise<unknown>
}

const emptyForm = { name: '', description: '', price: '', durationMinutes: '', isActive: true }

export function AdminServiceFormDrawer({ mode, service, isOpen, isPending, onClose, onCreate, onUpdate }: Props) {
  if (!isOpen) return null

  return <AdminServiceForm
    key={`${mode}-${service?.id ?? 'new'}`}
    mode={mode}
    service={service}
    isPending={isPending}
    onClose={onClose}
    onCreate={onCreate}
    onUpdate={onUpdate}
  />
}

function AdminServiceForm({ mode, service, isPending, onClose, onCreate, onUpdate }: Omit<Props, 'isOpen'>) {
  const [form, setForm] = useState(() => service
    ? { name: service.name, description: service.description ?? '', price: String(service.price), durationMinutes: String(service.durationMinutes), isActive: service.isActive }
    : emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [requestError, setRequestError] = useState('')

  const setField = (name: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setRequestError('')
    if (mode === 'create') {
      const nextErrors = validateServiceCreation(form)
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) return
      try { await onCreate(toCreateServicePayload(form)); onClose() } catch (error) { setRequestError(getApiError(error)) }
      return
    }

    const nameError = form.name.trim().length < 2 ? 'Informe um nome com pelo menos 2 caracteres.' : ''
    setErrors(nameError ? { name: nameError } : {})
    if (nameError || !service) return
    try { await onUpdate({ id: service.id, name: form.name.trim(), description: form.description.trim() || null, isActive: form.isActive }); onClose() } catch (error) { setRequestError(getApiError(error)) }
  }

  return <div className="service-drawer-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
    <aside className="service-drawer" role="dialog" aria-modal="true" aria-labelledby="service-drawer-title">
      <header className="service-drawer__header"><div><span>Catálogo do salão</span><h2 id="service-drawer-title">{mode === 'create' ? 'Novo serviço' : 'Editar serviço'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar formulário">×</button></header>
      <form onSubmit={submit}>
        <div className="service-drawer__body">
          <div className="service-form-intro"><span>{mode === 'create' ? '01' : '✦'}</span><div><strong>{mode === 'create' ? 'Informações do serviço' : service?.name}</strong><p>{mode === 'create' ? 'Defina como este serviço aparecerá no catálogo.' : 'Preço e duração são preservados para manter o histórico.'}</p></div></div>
          <label className="service-form-field"><span>Nome</span><input value={form.name} maxLength={100} onChange={(event) => setField('name', event.target.value)} placeholder="Ex.: Corte feminino" />{errors.name ? <small>{errors.name}</small> : null}</label>
          <label className="service-form-field"><span>Descrição <em>opcional</em></span><textarea value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Descreva brevemente o serviço" rows={4} /></label>
          {mode === 'create' ? <div className="service-form-grid">
            <label className="service-form-field"><span>Preço</span><div className="service-input-prefix"><b>R$</b><input inputMode="decimal" value={form.price} onChange={(event) => setField('price', event.target.value)} placeholder="0,00" /></div>{errors.price ? <small>{errors.price}</small> : null}</label>
            <label className="service-form-field"><span>Duração</span><div className="service-input-suffix"><input type="number" min="1" value={form.durationMinutes} onChange={(event) => setField('durationMinutes', event.target.value)} placeholder="45" /><b>min</b></div>{errors.durationMinutes ? <small>{errors.durationMinutes}</small> : null}</label>
          </div> : <label className="service-active-toggle"><span><strong>Serviço ativo</strong><small>Disponível para novos agendamentos</small></span><input type="checkbox" checked={form.isActive} onChange={(event) => setField('isActive', event.target.checked)} /><i aria-hidden="true" /></label>}
          {requestError ? <p className="form-error" role="alert">{requestError}</p> : null}
        </div>
        <footer className="service-drawer__footer"><button type="button" onClick={onClose}>Cancelar</button><button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : mode === 'create' ? 'Criar serviço' : 'Salvar alterações'}</button></footer>
      </form>
    </aside>
  </div>
}
