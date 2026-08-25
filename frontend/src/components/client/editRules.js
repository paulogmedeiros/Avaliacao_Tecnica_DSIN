const terminalStatuses = new Set(['Concluído', 'Cancelado'])

export function getEditAvailability(scheduledAt, now, status) {
  const differenceInHours = (new Date(scheduledAt).getTime() - new Date(now).getTime()) / 3_600_000
  const hoursRemaining = Math.floor(differenceInHours)

  if (terminalStatuses.has(status)) {
    return { allowed: false, reason: 'terminal_status', hoursRemaining }
  }

  if (differenceInHours < 48) {
    return { allowed: false, reason: 'short_notice', hoursRemaining }
  }

  return { allowed: true, reason: null, hoursRemaining }
}

export function getCancellationAvailability(scheduledAt, now, status) {
  return getEditAvailability(scheduledAt, now, status)
}
