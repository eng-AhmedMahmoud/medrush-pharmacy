import { useEffect, useState } from 'react'
import { getAppInfo, isElectron } from '../api/desktop'
import type { AppInfo } from '../../../preload'

interface Props {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

/** Desktop top bar: page title on the left, actions + runtime badge on the right. */
export function TopBar({ title, subtitle, actions }: Props): JSX.Element {
  const [info, setInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    let active = true
    getAppInfo().then((i) => active && setInfo(i))
    return () => {
      active = false
    }
  }, [])

  return (
    <header className="topbar">
      <div className="topbar__titles">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar__right">
        {actions}
        <span
          className={`runtime-badge ${isElectron ? 'is-desktop' : 'is-web'}`}
          title={info ? `Electron ${info.electron} · Node ${info.node}` : ''}
        >
          {isElectron ? `⬤ Desktop · v${info?.version ?? '…'}` : '○ Web preview'}
        </span>
      </div>
    </header>
  )
}
