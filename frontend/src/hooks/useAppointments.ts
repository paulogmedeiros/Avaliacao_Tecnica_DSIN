import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as appointmentsApi from '../api/appointments.api'
import { createAdminService, getAdminServices, getServices, updateAdminService } from '../api/services.api'
import { getWeeklyReport } from '../api/reports.api'

export const useServices = () => useQuery({ queryKey: ['services'], queryFn: getServices, staleTime: 5 * 60_000 })
export const useAdminServices = () => useQuery({ queryKey: ['services', 'admin'], queryFn: getAdminServices })
export const useHistory = (filters: appointmentsApi.HistoryFilters) => useQuery({ queryKey: ['appointments', 'history', filters], queryFn: () => appointmentsApi.getHistory(filters) })
export const useAdminAppointments = () => useQuery({ queryKey: ['appointments', 'admin'], queryFn: appointmentsApi.getAdminAppointments })
export const useAppointment = (id: string | null) => useQuery({ queryKey: ['appointments', 'detail', id], queryFn: () => appointmentsApi.getAppointment(id!), enabled: Boolean(id) })
export const useAvailability = (date: string, serviceIds: string[]) => useQuery({ queryKey: ['availability', date, serviceIds], queryFn: () => appointmentsApi.getAvailability(date, serviceIds), enabled: Boolean(date && serviceIds.length) })
export const useWeeklyReport = (date: string) => useQuery({ queryKey: ['reports', 'weekly', date], queryFn: () => getWeeklyReport(date) })

export function useAppointmentMutations() {
  const queryClient = useQueryClient()
  const refresh = async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ['appointments'] }), queryClient.invalidateQueries({ queryKey: ['availability'] }), queryClient.invalidateQueries({ queryKey: ['reports'] })]) }
  return {
    create: useMutation({ mutationFn: appointmentsApi.createAppointment, onSuccess: refresh }),
    updateClient: useMutation({ mutationFn: appointmentsApi.updateClientAppointment, onSuccess: refresh }),
    cancelClient: useMutation({ mutationFn: appointmentsApi.cancelClientAppointment, onSuccess: refresh }),
    updateAdmin: useMutation({ mutationFn: appointmentsApi.updateAdminAppointment, onSuccess: refresh }),
    updateStatus: useMutation({ mutationFn: appointmentsApi.updateAppointmentStatus, onSuccess: refresh }),
    updateServiceStatus: useMutation({ mutationFn: appointmentsApi.updateAppointmentServiceStatus, onSuccess: refresh }),
  }
}

export function useAdminServiceMutations() {
  const queryClient = useQueryClient()
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['services'] }) }
  return {
    create: useMutation({ mutationFn: createAdminService, onSuccess: refresh }),
    update: useMutation({ mutationFn: updateAdminService, onSuccess: refresh }),
  }
}
