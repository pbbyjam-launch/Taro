import { useCallback, useEffect, useState } from 'react'
import { generateAffirmation, AffirmationError } from '../services/affirmationService'
import { getApiKey, getProvider } from '../storage/settings'
import { getEntryById, saveEntry } from '../storage/dayEntryStore'
import { formattedCompleteDate, parseCalendarDayKey } from '../utils/dates'
import './EntryDetailView.css'

interface EntryDetailViewProps {
  entryId: string
  onBack: () => void
}

export function EntryDetailView({ entryId, onBack }: EntryDetailViewProps) {
  const stored = getEntryById(entryId)
  const [thought, setThought] = useState(stored?.thought ?? '')
  const [affirmation, setAffirmation] = useState(stored?.affirmation ?? null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const entry = stored

  const persist = useCallback(
    (updates: { thought?: string; affirmation?: string | null }) => {
      if (!entry) return
      const updated = {
        ...entry,
        thought: updates.thought ?? thought,
        affirmation: updates.affirmation !== undefined ? updates.affirmation : affirmation,
      }
      saveEntry(updated)
    },
    [entry, thought, affirmation],
  )

  useEffect(() => {
    if (!entry) return
    const timer = window.setTimeout(() => {
      persist({ thought })
    }, 400)
    return () => clearTimeout(timer)
  }, [thought, entry, persist])

  if (!entry) {
    return (
      <div className="entry-detail">
        <button type="button" className="entry-detail__back" onClick={onBack}>
          ← History
        </button>
        <p>Entry not found.</p>
      </div>
    )
  }

  const date = parseCalendarDayKey(entry.dateKey)

  const regenerate = async () => {
    setErrorMessage(null)
    setIsGenerating(true)
    persist({ thought })
    try {
      const result = await generateAffirmation(thought, date, getProvider(), getApiKey())
      setAffirmation(result)
      saveEntry({ ...entry, thought, affirmation: result })
    } catch (err) {
      setErrorMessage(err instanceof AffirmationError ? err.message : String(err))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="entry-detail">
      <button type="button" className="entry-detail__back" onClick={onBack}>
        ← History
      </button>

      <p className="entry-detail__date">{formattedCompleteDate(date)}</p>

      <label className="entry-detail__label">
        Thought
        <textarea
          className="entry-detail__textarea"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          rows={6}
        />
      </label>

      <button
        type="button"
        className="entry-detail__regenerate"
        disabled={isGenerating || !thought.trim()}
        onClick={() => void regenerate()}
      >
        {isGenerating ? 'Generating…' : 'Regenerate affirmation'}
      </button>

      {errorMessage && <p className="entry-detail__error">{errorMessage}</p>}

      {affirmation && (
        <div className="entry-detail__affirmation-box">
          <h2 className="entry-detail__affirmation-label">Affirmation</h2>
          <p className="entry-detail__affirmation-text">{affirmation}</p>
        </div>
      )}
    </div>
  )
}
