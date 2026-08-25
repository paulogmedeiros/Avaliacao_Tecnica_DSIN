import { appointments, type Appointment } from '../client/appointmentsData'

export type AdminAppointment = Appointment & {
  customer: { name: string; email: string; phone: string; initials: string }
}

const customers = [
  { name: 'Mariana Souza', email: 'mariana@email.com', phone: '(11) 98821-4520', initials: 'MS' },
  { name: 'Ana Lima', email: 'ana.lima@email.com', phone: '(11) 97734-1902', initials: 'AL' },
  { name: 'Carla Mendes', email: 'carla@email.com', phone: '(11) 99662-3188', initials: 'CM' },
  { name: 'Beatriz Alves', email: 'bia.alves@email.com', phone: '(11) 98155-7401', initials: 'BA' },
  { name: 'Juliana Rocha', email: 'juliana@email.com', phone: '(11) 97204-6183', initials: 'JR' },
]

export const adminAppointments: AdminAppointment[] = appointments.map((appointment, index) => ({
  ...appointment,
  customer: customers[index],
}))
