import type { SalonService } from '../../api/services.api'

export type AdminServiceFilters = { search: string; status: '' | 'active' | 'inactive' }
export type ServiceCreationInput = { name: string; description: string; price: string; durationMinutes: string }
export type ServiceCreationErrors = Partial<Record<keyof ServiceCreationInput, string>>

export function filterAdminServices(services: SalonService[], filters: AdminServiceFilters): SalonService[]
export function validateServiceCreation(input: ServiceCreationInput): ServiceCreationErrors
export function toCreateServicePayload(input: ServiceCreationInput): { name: string; description: string; price: number; durationMinutes: number }
