import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import {
  clampToThoughtWordLimit,
  countWords,
  MAX_THOUGHT_WORDS,
} from '../services/affirmationService'
import './TypewriterCompose.css'

interface TypewriterComposeProps {
  thought: string
  affirmation: string | null
  isSubmitting: boolean
  onThoughtChange: (value: string) => void
  onSubmit: () => void
}

const keyRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

export function TypewriterCompose({
  thought,
  affirmation,
  isSubmitting,
  onThoughtChange,
  onSubmit,
}: TypewriterComposeProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const printLayerRef = useRef<HTMLDivElement | null>(null)
  const activeKeyTimeoutRef = useRef<number | null>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const wordCount = countWords(thought)
  const canSubmit = thought.trim().length > 0 && wordCount <= MAX_THOUGHT_WORDS && !isSubmitting
  const paperAdvance = Math.min(44, Math.floor(thought.length / 80) * 5)
  const sceneStyle = { '--paper-advance': `${paperAdvance}px` } as CSSProperties

  const scrollPaperToEnd = useCallback(() => {
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current
      const printLayer = printLayerRef.current
      if (!textarea || !printLayer) return

      textarea.scrollTop = textarea.scrollHeight
      printLayer.scrollTop = textarea.scrollTop
    })
  }, [])

  useEffect(() => {
    scrollPaperToEnd()
  }, [thought, affirmation, scrollPaperToEnd])

  useEffect(() => {
    return () => {
      if (activeKeyTimeoutRef.current) {
        window.clearTimeout(activeKeyTimeoutRef.current)
      }
    }
  }, [])

  const animateKey = (key: string | null) => {
    if (!key) return
    setActiveKey(key)
    if (activeKeyTimeoutRef.current) {
      window.clearTimeout(activeKeyTimeoutRef.current)
    }
    activeKeyTimeoutRef.current = window.setTimeout(() => setActiveKey(null), 150)
  }

  const handleChange = (value: string) => {
    const clamped = clampToThoughtWordLimit(value)
    if (clamped.length > thought.length) {
      animateKey(normalizeTypedKey(clamped.at(-1) ?? ''))
    }
    onThoughtChange(clamped)
    scrollPaperToEnd()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    animateKey(normalizeKeyboardKey(event.key))
  }

  const syncScroll = () => {
    if (!textareaRef.current || !printLayerRef.current) return
    printLayerRef.current.scrollTop = textareaRef.current.scrollTop
  }

  return (
    <section className="typewriter-compose" aria-label="Typewriter thought composer">
      <div className="typewriter-compose__scene" style={sceneStyle}>
        <div
          className="typewriter-compose__paper-stack"
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="typewriter-compose__paper-shadow" aria-hidden />
          <div className="typewriter-compose__paper">
            <h1 className="typewriter-compose__brand">taro</h1>
            <div className="typewriter-compose__paper-window">
              <div ref={printLayerRef} className="typewriter-compose__print-layer" aria-hidden>
                {thought.trim() ? (
                  <p className="typewriter-compose__printed-text">
                    <PrintedText text={thought} />
                  </p>
                ) : (
                  <p className="typewriter-compose__placeholder">
                    anything that&apos;s on your mind
                  </p>
                )}

                {affirmation && (
                  <div className="typewriter-compose__affirmation">
                    <span>today&apos;s affirmation</span>
                    <p>{affirmation}</p>
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                className="typewriter-compose__textarea"
                value={thought}
                onChange={(event) => handleChange(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
                disabled={isSubmitting}
                aria-label="Type your thought"
                autoCapitalize="sentences"
                spellCheck
              />
            </div>
            <div className="typewriter-compose__word-count">
              {wordCount}/{MAX_THOUGHT_WORDS} words
            </div>
          </div>
        </div>

        <div className="typewriter-compose__typewriter">
          <div className="typewriter-compose__paper-slot" aria-hidden />
          <div className="typewriter-compose__platen" aria-hidden>
            <span />
          </div>
          <div className="typewriter-compose__carriage" aria-hidden>
            <span className="typewriter-compose__carriage-knob" />
            <span className="typewriter-compose__carriage-rail" />
            <span className="typewriter-compose__carriage-knob" />
          </div>
          <div className="typewriter-compose__type-bars" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className="typewriter-compose__body">
            <div className="typewriter-compose__keyboard" aria-hidden>
              {keyRows.map((row) => (
                <div className="typewriter-compose__key-row" key={row.join('')}>
                  {row.map((key) => (
                    <span
                      key={key}
                      className={`typewriter-compose__key ${
                        activeKey === key ? 'typewriter-compose__key--active' : ''
                      }`}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              ))}
              <div className="typewriter-compose__key-row typewriter-compose__key-row--controls">
                <span
                  className={`typewriter-compose__key typewriter-compose__key--wide ${
                    activeKey === 'SPACE' ? 'typewriter-compose__key--active' : ''
                  }`}
                >
                  space
                </span>
                <span
                  className={`typewriter-compose__key ${
                    activeKey === 'RETURN' ? 'typewriter-compose__key--active' : ''
                  }`}
                >
                  ↵
                </span>
              </div>
            </div>
            <button
              type="button"
              className="typewriter-compose__submit"
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              {isSubmitting ? 'typing...' : 'submit'}
            </button>
          </div>
          <div className="typewriter-compose__spacebar" aria-hidden />
        </div>
      </div>
    </section>
  )
}

function PrintedText({ text }: { text: string }) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text])

  return (
    <>
      {tokens.map((token, index) => {
        if (!token) return null
        if (/^\s+$/.test(token)) return token

        const bleed = shouldBleed(token, index)
        return (
          <span
            // The token text and index are stable enough for this local render-only layer.
            key={`${token}-${index}`}
            className={bleed ? 'typewriter-compose__printed-word--bleed' : undefined}
          >
            {token}
          </span>
        )
      })}
    </>
  )
}

function shouldBleed(token: string, index: number): boolean {
  const hash = token.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return (hash + index * 7) % 17 === 0 || (hash + index) % 29 === 0
}

function normalizeKeyboardKey(key: string): string | null {
  if (key === ' ') return 'SPACE'
  if (key === 'Enter') return 'RETURN'
  if (key.length === 1 && /[a-z0-9]/i.test(key)) return key.toUpperCase()
  return null
}

function normalizeTypedKey(value: string): string | null {
  if (value === ' ') return 'SPACE'
  if (value === '\n') return 'RETURN'
  if (/[a-z0-9]/i.test(value)) return value.toUpperCase()
  return null
}
