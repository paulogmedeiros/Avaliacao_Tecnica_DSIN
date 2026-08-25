export type AppointmentStatus = 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado'

export type AppointmentService = {
  id: string
  name: string
  duration: string
  price: number
  status: AppointmentStatus
}

export type Appointment = {
  id: string
  date: string
  time: string
  scheduledAt: string
  services: AppointmentService[]
  duration: string
  totalPrice: number
  status: AppointmentStatus
  createdAt: string
  notes?: string
}

export const appointments: Appointment[] = [
  {
    id: '#AG-1052',
    date: '26 ago. 2026',
    time: '14:00',
    scheduledAt: '2026-08-26T14:00:00-03:00',
    services: [{ id: 'AS-207', name: 'Escova', duration: '45min', price: 55, status: 'Pendente' }],
    duration: '45min',
    totalPrice: 55,
    status: 'Pendente',
    createdAt: '25 ago. 2026, às 08:10',
  },
  {
    id: '#AG-1048',
    date: '29 ago. 2026',
    time: '09:30',
    scheduledAt: '2026-08-29T09:30:00-03:00',
    services: [
      { id: 'AS-201', name: 'Corte feminino', duration: '45min', price: 65, status: 'Confirmado' },
      { id: 'AS-202', name: 'Hidratação', duration: '1h', price: 90, status: 'Confirmado' },
    ],
    duration: '1h 45min',
    totalPrice: 155,
    status: 'Confirmado',
    createdAt: '24 ago. 2026, às 16:42',
    notes: 'Finalizar o corte com ondas leves.',
  },
  {
    id: '#AG-1012',
    date: '15 ago. 2026',
    time: '13:30',
    scheduledAt: '2026-08-15T13:30:00-03:00',
    services: [{ id: 'AS-187', name: 'Coloração', duration: '2h', price: 180, status: 'Concluído' }],
    duration: '2h',
    totalPrice: 180,
    status: 'Concluído',
    createdAt: '08 ago. 2026, às 11:18',
  },
  {
    id: '#AG-0987',
    date: '01 ago. 2026',
    time: '10:00',
    scheduledAt: '2026-08-01T10:00:00-03:00',
    services: [
      { id: 'AS-172', name: 'Escova', duration: '45min', price: 55, status: 'Concluído' },
      { id: 'AS-173', name: 'Manicure', duration: '45min', price: 40, status: 'Concluído' },
    ],
    duration: '1h 30min',
    totalPrice: 95,
    status: 'Concluído',
    createdAt: '26 jul. 2026, às 09:05',
  },
  {
    id: '#AG-0964',
    date: '18 jul. 2026',
    time: '08:30',
    scheduledAt: '2026-07-18T08:30:00-03:00',
    services: [{ id: 'AS-159', name: 'Corte feminino', duration: '45min', price: 65, status: 'Cancelado' }],
    duration: '45min',
    totalPrice: 65,
    status: 'Cancelado',
    createdAt: '12 jul. 2026, às 14:30',
  },
]

export const prototypeNow = '2026-08-25T09:30:00-03:00'
