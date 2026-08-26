import { api } from '../lib/axios'
export async function getWeeklyReport(date: string) { const { data } = await api.get('/report/weekly', { params: { date } }); return data }
