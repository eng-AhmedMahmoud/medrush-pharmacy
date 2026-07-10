interface Props {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'warn' | 'good'
  icon?: string
}

/** Dashboard KPI card. */
export function StatCard({ label, value, hint, tone = 'default', icon }: Props): JSX.Element {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      </div>
      <div className="stat-card__value">{value}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  )
}
