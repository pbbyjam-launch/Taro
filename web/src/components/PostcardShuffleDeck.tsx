import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { colors, layout } from '../theme/colors'
import './PostcardShuffleDeck.css'

interface PostcardShuffleDeckProps {
  isShuffling: boolean
  isFlipped: boolean
  children: ReactNode
}

export function PostcardShuffleDeck({ isShuffling, isFlipped, children }: PostcardShuffleDeckProps) {
  const shouldShuffle = isShuffling && !isFlipped
  const [shuffleStep, setShuffleStep] = useState(0)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!shouldShuffle) return

    const interval = window.setInterval(
      () => setShuffleStep((s) => s + 1),
      reduceMotion ? 700 : 380,
    )
    return () => clearInterval(interval)
  }, [shouldShuffle, reduceMotion])

  const step = shouldShuffle ? shuffleStep % 4 : 0
  const offsets = [
    { x: 0, y: 0, rot: 0 },
    { x: 34, y: -8, rot: 9 },
    { x: -30, y: 6, rot: -7 },
    { x: 6, y: 0, rot: 2 },
  ]
  const current = offsets[step]!

  return (
    <div className="shuffle-deck">
      {shouldShuffle && !reduceMotion && (
        <div className="shuffle-deck__ghosts" aria-hidden>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="shuffle-deck__ghost"
              style={{
                ...ghostStyle(index, step),
                zIndex: index,
              }}
            />
          ))}
        </div>
      )}
      <div
        className={`shuffle-deck__main ${shouldShuffle ? 'shuffle-deck__main--shuffling' : ''}`}
        style={
          shouldShuffle && !reduceMotion
            ? {
                transform: `translate(${current.x}px, ${current.y}px) rotate(${current.rot}deg)`,
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

function ghostStyle(index: number, step: number): CSSProperties {
  const depth = (index + 1) * 5
  const spread = (index - 1) * 6
  const rotations = [0, -4, 5, 1]
  const offsets = [
    { x: spread, y: depth },
    { x: spread - 14, y: depth + 2 },
    { x: spread + 12, y: depth - 1 },
    { x: spread + 4, y: depth },
  ]
  const off = offsets[step % 4]!
  const baseRot = (index - 1) * 3.5 + rotations[step % 4]!
  return {
    transform: `translate(${off.x}px, ${off.y}px) rotate(${baseRot}deg) scale(${1 - (index + 1) * 0.018})`,
    width: layout.cardWidth,
    height: layout.cardHeight,
    borderRadius: layout.cardCornerRadius,
    background: `linear-gradient(135deg, ${colors.cardBase} 0%, rgba(255, 199, 158, 0.3) 50%, rgba(250, 148, 173, 0.2) 100%)`,
    boxShadow: `0 6px 12px ${colors.cardShadow}`,
    border: `1px solid rgba(255, 199, 158, 0.3)`,
  }
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
