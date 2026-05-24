import SwiftUI
import SwiftData

struct EntryDetailView: View {
    @Bindable var entry: DayEntry
    @Environment(\.modelContext) private var modelContext
    @State private var isGenerating = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(entry.date.formatted(date: .complete, time: .omitted))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Thought")
                        .font(.headline)
                    TextEditor(text: $entry.thought)
                        .frame(minHeight: 120)
                        .padding(8)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button {
                    Task { await regenerate() }
                } label: {
                    HStack {
                        if isGenerating { ProgressView().tint(.white) }
                        Text(isGenerating ? "Generating…" : "Regenerate affirmation")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                }
                .buttonStyle(.borderedProminent)
                .tint(AppTheme.accent)
                .disabled(isGenerating || entry.thought.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                if let errorMessage {
                    Text(errorMessage)
                        .font(.subheadline)
                        .foregroundStyle(.orange)
                }

                if let affirmation = entry.affirmation {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Affirmation")
                            .font(.headline)
                            .foregroundStyle(AppTheme.accent)
                        Text(affirmation)
                            .font(.title3.weight(.medium))
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.affirmationBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
            }
            .padding()
        }
        .navigationTitle(entry.date.formattedDay)
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: entry.thought) { _, _ in
            saveEntry()
        }
    }

    private func saveEntry() {
        entry.updatedAt = Date()
        try? modelContext.save()
    }

    private func regenerate() async {
        errorMessage = nil
        isGenerating = true
        defer { isGenerating = false }

        saveEntry()
        let apiKey = KeychainService.readAPIKey() ?? ""
        do {
            let result = try await AffirmationService.generate(
                thought: entry.thought,
                date: entry.date,
                provider: AppSettings.provider,
                apiKey: apiKey
            )
            entry.affirmation = result
            entry.updatedAt = Date()
            try modelContext.save()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
