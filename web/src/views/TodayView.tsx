import { useEffect, useRef } from 'react'
import { TypewriterCompose } from '../components/TypewriterCompose'
import { useToday } from '../hooks/useToday'
import './TodayView.css'

export function TodayView() {
  const {
    thought,
    setThought,
    affirmation,
    isShuffling,
    hasAffirmation,
    errorMessage,
    submitThought,
  } = useToday()
  const wasShufflingRef = useRef(false)

  useEffect(() => {
    const finishedSubmission = wasShufflingRef.current && !isShuffling && hasAffirmation
    if (finishedSubmission && 'vibrate' in navigator) {
      navigator.vibrate(35)
    }
    wasShufflingRef.current = isShuffling
  }, [hasAffirmation, isShuffling])

  return (
    <div className="today-view">
      <div className="today-view__content">
        <TypewriterCompose
          thought={thought}
          onThoughtChange={setThought}
          affirmation={affirmation}
          isSubmitting={isShuffling}
          onSubmit={() => void submitThought()}
        />

        <footer className="today-view__footer">
          {errorMessage ? (
            <div className="today-view__error">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => void submitThought()}>
                Retry
              </button>
            </div>
          ) : hasAffirmation && !isShuffling ? (
            <p className="today-view__hint">Your affirmation is printed on the sheet.</p>
          ) : isShuffling ? (
            <p className="today-view__hint">Finding your words...</p>
          ) : null}
        </footer>
      </div>
    </div>
  )
}
