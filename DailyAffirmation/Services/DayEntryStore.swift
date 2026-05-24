import Foundation
import SwiftData

@MainActor
enum DayEntryStore {
    static func entry(for date: Date, in context: ModelContext) throws -> DayEntry? {
        let day = date.startOfCalendarDay
        let descriptor = FetchDescriptor<DayEntry>(
            predicate: #Predicate { $0.date == day }
        )
        return try context.fetch(descriptor).first
    }

    static func fetchOrCreateToday(in context: ModelContext) throws -> DayEntry {
        let today = Date().startOfCalendarDay
        if let existing = try entry(for: today, in: context) {
            return existing
        }
        let entry = DayEntry(date: today)
        context.insert(entry)
        try context.save()
        return entry
    }

    static func save(entry: DayEntry, in context: ModelContext) throws {
        entry.updatedAt = Date()
        try context.save()
    }

    static func allEntriesSorted(in context: ModelContext) throws -> [DayEntry] {
        var descriptor = FetchDescriptor<DayEntry>(
            sortBy: [SortDescriptor(\.date, order: .reverse)]
        )
        return try context.fetch(descriptor)
    }
}
