import { NAV_ITEMS, type Route, type TopLevel } from '../routes'

interface Props {
  current: Route
  onNavigate: (name: TopLevel) => void
  failureMode: boolean
  onToggleFailure: (on: boolean) => void
}

function activeTop(route: Route): TopLevel {
  if (route.name === 'order' || route.name === 'invoice') return 'orders'
  return route.name
}

export function Sidebar({ current, onNavigate, failureMode, onToggleFailure }: Props): JSX.Element {
  const active = activeTop(current)
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">Rx</div>
        <div className="brand__text">
          <strong>MedRush</strong>
          <span>Pharmacy Ops</span>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav__item ${active === item.key ? 'is-active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__foot">
        {/* Dev aid: force the mock API to fail so error states are demoable. */}
        <label className="switch">
          <input
            type="checkbox"
            checked={failureMode}
            onChange={(e) => onToggleFailure(e.target.checked)}
          />
          <span>Simulate API failure</span>
        </label>
        <p className="sidebar__note">Trial build · mock data only</p>
      </div>
    </aside>
  )
}
