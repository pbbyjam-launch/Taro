import { useState } from 'react'
import { TodayView } from './views/TodayView'
import { HistoryView } from './views/HistoryView'
import { SettingsView } from './views/SettingsView'
import './App.css'

type Tab = 'today' | 'history' | 'settings'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'history', label: 'History', icon: '📖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="app">
      <main className="app__main">
        {tab === 'today' && <TodayView />}
        {tab === 'history' && <HistoryView />}
        {tab === 'settings' && <SettingsView />}
      </main>

      <nav className="app__tab-bar" aria-label="Main">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`app__tab ${tab === t.id ? 'app__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="app__tab-icon" aria-hidden>
              {t.icon}
            </span>
            <span className="app__tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
