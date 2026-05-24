import { AffirmationFlipCard } from '../components/AffirmationFlipCard'
import { OptimisticBackground } from '../components/OptimisticBackground'
import { useToday } from '../hooks/useToday'
import './TodayView.css'

export function TodayView() {
  const {
    thought,
    setThought,
    affirmation,
    cardPhase,
    isFlipped,
    canFlip,
    isShuffling,
    hasAffirmation,
    errorMessage,
    submitThought,
    toggleFlip,
  } = useToday()

  return (
    <div className="today-view">
      <OptimisticBackground />
      <div className="today-view__content">
        <AffirmationFlipCard
          thought={thought}
          onThoughtChange={setThought}
          affirmation={affirmation}
          cardPhase={cardPhase}
          isFlipped={isFlipped}
          canFlip={canFlip}
          isShuffling={isShuffling}
          onSubmit={() => void submitThought()}
          onToggleFlip={toggleFlip}
        />

        <footer className="today-view__footer">
          {errorMessage ? (
            <div className="today-view__error">
              <span>{errorMessage}</span>
              <button type="button" onClick={() => void submitThought()}>
                Retry
              </button>
            </div>
          ) : hasAffirmation && !isFlipped && !isShuffling ? (
            <p className="today-view__hint">Tap card to read today&apos;s affirmation</p>
          ) : isShuffling ? (
            <p className="today-view__hint">Finding your words…</p>
          ) : null}
        </footer>
      </div>
    </div>
  )
}
