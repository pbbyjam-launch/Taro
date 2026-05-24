import { calendarDayKey } from '../utils/dates'

export interface DayEntry {
  id: string
  dateKey: string
  thought: string
  affirmation: string | null
  createdAt: string
  updatedAt: string
}

export function createDayEntry(date: Date, thought = ''): DayEntry {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    dateKey: calendarDayKey(date),
    thought,
    affirmation: null,
    createdAt: now,
    updatedAt: now,
  }
}
