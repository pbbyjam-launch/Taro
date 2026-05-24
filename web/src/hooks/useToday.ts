import { useCallback, useEffect, useState } from 'react'
import * as dayEntryStore from '../storage/dayEntryStore'
import { getApiKey, getProvider } from '../storage/settings'
import {
  generateAffirmation,
  MINIMUM_SHUFFLE_MS,
  validateThought,
  AffirmationError,
} from '../services/affirmationService'
import { parseCalendarDayKey } from '../utils/dates'

export type CardPhase = 'input' | 'shuffling' | 'result'

export function useToday() {
  const [thought, setThought] = useState('')
  const [affirmation, setAffirmation] = useState<string | null>(null)
  const [cardPhase, setCardPhase] = useState<CardPhase>('input')
  const [isFlipped, setIsFlipped] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadToday = useCallback(() => {
    const todayEntry = dayEntryStore.fetchOrCreateToday()
    setThought(todayEntry.thought)
    setAffirmation(todayEntry.affirmation)
    setCardPhase('input')
    setIsFlipped(false)
    setErrorMessage(null)
  }, [])

  useEffect(() => {
    loadToday()
  }, [loadToday])

  const saveThought = useCallback(
    (value: string) => {
      const todayEntry = dayEntryStore.fetchOrCreateToday()
      const updated = { ...todayEntry, thought: value }
      dayEntryStore.saveEntry(updated)
    },
    [],
  )

  const hasAffirmation = Boolean(affirmation?.trim())
  const isShuffling = cardPhase === 'shuffling'
  const canFlip = hasAffirmation && cardPhase !== 'shuffling'

  const submitThought = useCallback(async () => {
    setErrorMessage(null)
    try {
      validateThought(thought)
    } catch (err) {
      setErrorMessage(err instanceof AffirmationError ? err.message : String(err))
      return
    }

    saveThought(thought)
    setCardPhase('shuffling')
    setIsFlipped(false)

    const apiKey = getApiKey()
    const provider = getProvider()
    const date = parseCalendarDayKey(dayEntryStore.fetchOrCreateToday().dateKey)

    const shuffleStart = Date.now()

    try {
      const result = await generateAffirmation(thought, date, provider, apiKey)
      const elapsed = Date.now() - shuffleStart
      if (elapsed < MINIMUM_SHUFFLE_MS) {
        await new Promise((r) => setTimeout(r, MINIMUM_SHUFFLE_MS - elapsed))
      }

      const todayEntry = dayEntryStore.fetchOrCreateToday()
      const updated = { ...todayEntry, thought, affirmation: result }
      dayEntryStore.saveEntry(updated)
      setAffirmation(result)
      setCardPhase('result')

      await new Promise((r) => setTimeout(r, 180))
      setIsFlipped(true)
    } catch (err) {
      setCardPhase('input')
      setIsFlipped(false)
      setErrorMessage(err instanceof AffirmationError ? err.message : String(err))
    }
  }, [thought, saveThought])

  const toggleFlip = useCallback(() => {
    if (!canFlip || isShuffling) return
    setIsFlipped((f) => !f)
  }, [canFlip, isShuffling])

  const handleThoughtChange = useCallback(
    (value: string) => {
      setThought(value)
      saveThought(value)
    },
    [saveThought],
  )

  return {
    thought,
    affirmation,
    cardPhase,
    isFlipped,
    isShuffling,
    canFlip,
    hasAffirmation,
    errorMessage,
    setThought: handleThoughtChange,
    submitThought,
    toggleFlip,
    reload: loadToday,
  }
}
