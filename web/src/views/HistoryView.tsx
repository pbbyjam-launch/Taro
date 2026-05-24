import { useMemo, useState } from 'react'
import { entriesGroupedByMonth } from '../storage/dayEntryStore'
import { formattedDay, parseCalendarDayKey } from '../utils/dates'
import { EntryDetailView } from './EntryDetailView'
import './HistoryView.css'

export function HistoryView() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const groups = useMemo(() => {
    void refreshKey
    return entriesGroupedByMonth()
  }, [refreshKey])

  if (selectedId) {
    return (
      <EntryDetailView
        entryId={selectedId}
        onBack={() => {
          setSelectedId(null)
          setRefreshKey((k) => k + 1)
        }}
      />
    )
  }

  const allEmpty = groups.length === 0

  return (
    <div className="history-view">
      <h1 className="history-view__title">History</h1>
      {allEmpty ? (
        <div className="history-view__empty">
          <p className="history-view__empty-title">No entries yet</p>
          <p className="history-view__empty-desc">
            Your daily thoughts and affirmations will appear here.
          </p>
        </div>
      ) : (
        <div className="history-view__list">
          {groups.map(({ month, entries }) => (
            <section key={month} className="history-section">
              <h2 className="history-section__month">{month}</h2>
              <ul className="history-section__entries">
                {entries.map((entry) => {
                  const date = parseCalendarDayKey(entry.dateKey)
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="history-row"
                        onClick={() => setSelectedId(entry.id)}
                      >
                        <span className="history-row__day">{formattedDay(date)}</span>
                        <span className="history-row__thought">
                          {entry.thought.trim() || 'No thought recorded'}
                        </span>
                        {entry.affirmation && (
                          <span className="history-row__affirmation">{entry.affirmation}</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
