import SwiftUI
import SwiftData

struct HistoryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \DayEntry.date, order: .reverse) private var entries: [DayEntry]

    private var groupedEntries: [(String, [DayEntry])] {
        let grouped = Dictionary(grouping: entries) { $0.date.formattedMonthYear }
        return grouped.sorted { lhs, rhs in
            guard
                let lDate = lhs.value.first?.date,
                let rDate = rhs.value.first?.date
            else { return lhs.key > rhs.key }
            return lDate > rDate
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if entries.isEmpty {
                    emptyState
                } else {
                    List {
                        ForEach(groupedEntries, id: \.0) { month, monthEntries in
                            Section(month) {
                                ForEach(monthEntries) { entry in
                                    NavigationLink {
                                        EntryDetailView(entry: entry)
                                    } label: {
                                        HistoryRow(entry: entry)
                                    }
                                }
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("History")
        }
    }

    private var emptyState: some View {
        ContentUnavailableView {
            Label("No entries yet", systemImage: "book.closed")
        } description: {
            Text("Your daily thoughts and affirmations will appear here.")
        }
        .accessibilityElement(children: .combine)
    }
}

private struct HistoryRow: View {
    let entry: DayEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.date.formattedDay)
                .font(.headline)
            Text(entry.thought.isEmpty ? "No thought recorded" : entry.thought)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            if let affirmation = entry.affirmation {
                Text(affirmation)
                    .font(.caption)
                    .foregroundStyle(AppTheme.accent)
                    .lineLimit(1)
            }
        }
        .padding(.vertical, 2)
    }
}
