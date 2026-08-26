import axios from 'axios'
export function getApiError(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Não foi possível concluir a operação.'
  const message = error.response?.data?.message
  return Array.isArray(message) ? message.join(' ') : message || 'Não foi possível conectar ao servidor.'
}
