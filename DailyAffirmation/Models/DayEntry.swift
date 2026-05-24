import Foundation
import SwiftData

@Model
final class DayEntry: Identifiable {
    var id: UUID
    var date: Date
    var thought: String
    var affirmation: String?
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        date: Date,
        thought: String = "",
        affirmation: String? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.date = date.startOfCalendarDay
        self.thought = thought
        self.affirmation = affirmation
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
