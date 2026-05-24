import type { ReactNode } from 'react'
import { MAX_THOUGHT_LENGTH } from '../services/affirmationService'
import type { CardPhase } from '../hooks/useToday'
import { colors, gradients, layout } from '../theme/colors'
import { PostcardShuffleDeck } from './PostcardShuffleDeck'
import './AffirmationFlipCard.css'

interface AffirmationFlipCardProps {
  thought: string
  onThoughtChange: (value: string) => void
  affirmation: string | null
  cardPhase: CardPhase
  isFlipped: boolean
  canFlip: boolean
  isShuffling: boolean
  onSubmit: () => void
  onToggleFlip: () => void
}

export function AffirmationFlipCard({
  thought,
  onThoughtChange,
  affirmation,
  isFlipped,
  canFlip,
  isShuffling,
  onSubmit,
  onToggleFlip,
}: AffirmationFlipCardProps) {
  const trimmedThought = thought.trim()
  const canSubmit =
    trimmedThought.length > 0 && thought.length <= MAX_THOUGHT_LENGTH && !isShuffling

  const handleCardClick = () => {
    if (!canFlip || isShuffling) return
    onToggleFlip()
  }

  return (
    <PostcardShuffleDeck isShuffling={isShuffling} isFlipped={isFlipped}>
      <div
        className="flip-card-scene"
        style={{ width: layout.cardWidth, height: layout.cardHeight }}
        onClick={handleCardClick}
        role={canFlip ? 'button' : undefined}
        tabIndex={canFlip ? 0 : undefined}
        onKeyDown={(e) => {
          if (canFlip && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onToggleFlip()
          }
        }}
        aria-label={canFlip ? 'Flip card to view affirmation' : undefined}
      >
        <div className={`flip-card ${isFlipped ? 'flip-card--flipped' : ''}`}>
          <div className="flip-card__face flip-card__face--front">
            <CardFace isBack={false} isShuffling={isShuffling}>
              <div className="flip-card__front-inner">
                <div className="flip-card__input-wrap">
                  {!trimmedThought && (
                    <span className="flip-card__placeholder" aria-hidden>
                      What&apos;s on your mind?
                    </span>
                  )}
                  <textarea
                    className="flip-card__textarea"
                    value={thought}
                    onChange={(e) => onThoughtChange(e.target.value)}
                    disabled={isShuffling}
                    aria-label="Thought input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <button
                  type="button"
                  className={`flip-card__submit ${canSubmit ? 'flip-card__submit--active' : ''}`}
                  disabled={!canSubmit}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSubmit()
                  }}
                >
                  {isShuffling ? 'Shuffling…' : 'Submit'}
                </button>
              </div>
            </CardFace>
          </div>

          <div className="flip-card__face flip-card__face--back">
            <CardFace isBack isShuffling={false}>
              <div className="flip-card__back-inner">
                {affirmation && (
                  <p className="flip-card__affirmation" aria-label={`Affirmation: ${affirmation}`}>
                    {affirmation}
                  </p>
                )}
                {trimmedThought && (
                  <p className="flip-card__thought-preview">{trimmedThought}</p>
                )}
              </div>
            </CardFace>
          </div>
        </div>
      </div>
    </PostcardShuffleDeck>
  )
}

function CardFace({
  isBack,
  isShuffling,
  children,
}: {
  isBack?: boolean
  isShuffling: boolean
  children: ReactNode
}) {
  return (
    <div
      className={`card-face ${isBack ? 'card-face--back' : 'card-face--front'} ${isShuffling ? 'card-face--shuffling' : ''}`}
      style={{
        borderRadius: layout.cardCornerRadius,
        background: isBack ? gradients.cardBack : gradients.cardFront,
        border: `1px solid ${isBack ? 'rgba(250, 148, 173, 0.35)' : 'rgba(255, 199, 158, 0.25)'}`,
        boxShadow: `0 10px 20px ${colors.cardShadow}`,
      }}
    >
      <div className="card-face__aura" data-back={isBack} data-shuffle={isShuffling} />
      {children}
    </div>
  )
}
