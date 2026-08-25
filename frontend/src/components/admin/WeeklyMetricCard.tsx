type MetricIcon = 'calendar' | 'clock' | 'check' | 'complete' | 'cancel' | 'services' | 'money' | 'rate'

const icons: Record<MetricIcon, React.ReactNode> = {
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  complete: <><path d="M5 4h14v16H5z" /><path d="m8 12 2.5 2.5L16 9" /></>,
  cancel: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  services: <><path d="M7 4h10v4H7zM5 8h14v12H5z" /><path d="M9 12h6M9 16h4" /></>,
  money: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 12h.01M17 12h.01M12 9.5v5M10.5 10.5c0-.6.7-1 1.5-1s1.5.4 1.5 1-.7 1-1.5 1-1.5.4-1.5 1 .7 1 1.5 1 1.5-.4 1.5-1" /></>,
  rate: <><path d="M6 18 18 6M7.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM19.5 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></>,
}

export function WeeklyMetricCard({ label, value, note, icon, tone = 'neutral' }: {
  label: string
  value: string | number
  note: string
  icon: MetricIcon
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
}) {
  return (
    <article className={`weekly-metric weekly-metric--${tone}`}>
      <span className="weekly-metric__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none">{icons[icon]}</svg></span>
      <div><span className="weekly-metric__label">{label}</span><strong>{value}</strong><small>{note}</small></div>
    </article>
  )
}
