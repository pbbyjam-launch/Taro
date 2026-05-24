import Foundation

extension Date {
    var startOfCalendarDay: Date {
        Calendar.current.startOfDay(for: self)
    }

    var formattedDay: String {
        formatted(date: .abbreviated, time: .omitted)
    }

    var formattedMonthYear: String {
        formatted(.dateTime.month(.wide).year())
    }
}
