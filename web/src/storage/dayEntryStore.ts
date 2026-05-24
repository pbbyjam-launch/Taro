import type { DayEntry } from '../models/dayEntry'
import { calendarDayKey, parseCalendarDayKey, startOfCalendarDay } from '../utils/dates'

const STORAGE_KEY = 'dailyAffirmation.entries'

function readAll(): DayEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DayEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(entries: DayEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function getEntryForDate(date: Date): DayEntry | undefined {
  const key = calendarDayKey(date)
  return readAll().find((e) => e.dateKey === key)
}

export function fetchOrCreateToday(): DayEntry {
  const today = startOfCalendarDay(new Date())
  const existing = getEntryForDate(today)
  if (existing) return { ...existing }

  const entry: DayEntry = {
    id: crypto.randomUUID(),
    dateKey: calendarDayKey(today),
    thought: '',
    affirmation: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const all = readAll()
  all.push(entry)
  writeAll(all)
  return entry
}

export function saveEntry(entry: DayEntry): void {
  const all = readAll()
  const idx = all.findIndex((e) => e.id === entry.id)
  const updated = { ...entry, updatedAt: new Date().toISOString() }
  if (idx >= 0) {
    all[idx] = updated
  } else {
    all.push(updated)
  }
  writeAll(all)
}

export function getEntryById(id: string): DayEntry | undefined {
  return readAll().find((e) => e.id === id)
}

export function allEntriesSorted(): DayEntry[] {
  return readAll().sort((a, b) => {
    const da = parseCalendarDayKey(a.dateKey).getTime()
    const db = parseCalendarDayKey(b.dateKey).getTime()
    return db - da
  })
}

export function entriesGroupedByMonth(): { month: string; entries: DayEntry[] }[] {
  const entries = allEntriesSorted()
  const grouped = new Map<string, DayEntry[]>()

  for (const entry of entries) {
    const date = parseCalendarDayKey(entry.dateKey)
    const month = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    const list = grouped.get(month) ?? []
    list.push(entry)
    grouped.set(month, list)
  }

  return [...grouped.entries()]
    .map(([month, monthEntries]) => ({ month, entries: monthEntries }))
    .sort((a, b) => {
      const aDate = parseCalendarDayKey(a.entries[0]!.dateKey).getTime()
      const bDate = parseCalendarDayKey(b.entries[0]!.dateKey).getTime()
      return bDate - aDate
    })
}
