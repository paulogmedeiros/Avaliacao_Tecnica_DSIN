export type EditAvailability = {
  allowed: boolean
  reason: 'short_notice' | 'terminal_status' | null
  hoursRemaining: number
}

export function getEditAvailability(scheduledAt: string, now: string, status: string): EditAvailability
export function getCancellationAvailability(scheduledAt: string, now: string, status: string): EditAvailability
