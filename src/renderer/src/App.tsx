import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { Dashboard } from './pages/Dashboard'
import { Inventory } from './pages/Inventory'
import { Orders } from './pages/Orders'
import { OrderDetail } from './pages/OrderDetail'
import { Invoice } from './pages/Invoice'
import { mockApi } from './api/mockApi'
import type { Route, TopLevel } from './routes'

const TITLES: Record<TopLevel, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: "Today's pharmacy operations at a glance" },
  inventory: { title: 'Inventory', subtitle: 'Stock levels, batches, and expiry tracking' },
  orders: { title: 'Orders', subtitle: 'Process incoming pharmacy orders' }
}

function App(): JSX.Element {
  const [route, setRoute] = useState<Route>({ name: 'dashboard' })
  const [failureMode, setFailureMode] = useState(false)

  function goTop(name: TopLevel): void {
    // name is one of the zero-payload routes, so this maps 1:1 to a Route.
    setRoute({ name } as Extract<Route, { name: TopLevel }>)
  }

  function toggleFailure(on: boolean): void {
    mockApi.setFailureMode(on)
    setFailureMode(on)
  }

  const topLevel: TopLevel =
    route.name === 'order' || route.name === 'invoice' ? 'orders' : route.name
  const header =
    route.name === 'order'
      ? { title: 'Order detail', subtitle: 'Review items and advance the order' }
      : route.name === 'invoice'
        ? { title: 'Invoice', subtitle: 'Receipt preview' }
        : TITLES[topLevel]

  return (
    <div className="app">
      <Sidebar
        current={route}
        onNavigate={goTop}
        failureMode={failureMode}
        onToggleFailure={toggleFailure}
      />
      <div className="app__main">
        <TopBar title={header.title} subtitle={header.subtitle} />
        <main className="content">
          {route.name === 'dashboard' && (
            <Dashboard onOpenOrder={(id) => setRoute({ name: 'order', id })} />
          )}
          {route.name === 'inventory' && <Inventory />}
          {route.name === 'orders' && (
            <Orders onOpenOrder={(id) => setRoute({ name: 'order', id })} />
          )}
          {route.name === 'order' && (
            <OrderDetail
              orderId={route.id}
              onBack={() => setRoute({ name: 'orders' })}
              onViewInvoice={(orderId) => setRoute({ name: 'invoice', orderId })}
            />
          )}
          {route.name === 'invoice' && (
            <Invoice orderId={route.orderId} onBack={() => setRoute({ name: 'orders' })} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
