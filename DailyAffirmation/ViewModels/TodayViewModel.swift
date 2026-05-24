import Foundation
import SwiftData
import SwiftUI
import UIKit

enum CardPhase {
    case input
    case shuffling
    case result
}

@MainActor
@Observable
final class TodayViewModel {
    var thought: String = ""
    var affirmation: String?
    var cardPhase: CardPhase = .input
    var isFlipped: Bool = false
    var errorMessage: String?

    var characterCount: Int { thought.count }
    var hasAffirmation: Bool {
        guard let affirmation else { return false }
        return !affirmation.isEmpty
    }
    var canFlip: Bool { hasAffirmation && cardPhase != .shuffling }
    var isShuffling: Bool { cardPhase == .shuffling }

    private var entry: DayEntry?
    private var modelContext: ModelContext?

    private static let minimumShuffleDuration: Duration = .seconds(3)

    func configure(context: ModelContext) {
        guard modelContext == nil else { return }
        modelContext = context
        loadToday()
    }

    func loadToday() {
        guard let context = modelContext else { return }
        do {
            let todayEntry = try DayEntryStore.fetchOrCreateToday(in: context)
            entry = todayEntry
            thought = todayEntry.thought
            affirmation = todayEntry.affirmation
            cardPhase = .input
            isFlipped = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func saveThought() {
        guard let context = modelContext else { return }
        do {
            let todayEntry = try DayEntryStore.fetchOrCreateToday(in: context)
            entry = todayEntry
            todayEntry.thought = thought
            try DayEntryStore.save(entry: todayEntry, in: context)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func submitThought() async {
        errorMessage = nil

        do {
            try AffirmationService.validate(thought: thought)
        } catch {
            errorMessage = error.localizedDescription
            return
        }

        saveThought()
        cardPhase = .shuffling
        isFlipped = false
        await generateAffirmation()
    }

    func generateAffirmation() async {
        guard let context = modelContext else { return }

        let apiKey = KeychainService.readAPIKey() ?? ""

        do {
            async let resultTask = AffirmationService.generate(
                thought: thought,
                date: Date(),
                provider: AppSettings.provider,
                apiKey: apiKey
            )
            async let delayTask: Void = {
                try await Task.sleep(for: Self.minimumShuffleDuration)
            }()

            let result = try await resultTask
            _ = try await delayTask

            let todayEntry = try DayEntryStore.fetchOrCreateToday(in: context)
            entry = todayEntry
            todayEntry.affirmation = result
            affirmation = result
            try DayEntryStore.save(entry: todayEntry, in: context)

            // Stop shuffle before flipping to the back.
            cardPhase = .result
            try? await Task.sleep(for: .milliseconds(180))

            withAnimation(.spring(response: 0.55, dampingFraction: 0.82)) {
                isFlipped = true
            }

            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        } catch {
            cardPhase = .input
            isFlipped = false
            errorMessage = error.localizedDescription
        }
    }

    func toggleFlip() {
        guard canFlip else { return }
        withAnimation(.easeInOut(duration: 0.6)) {
            isFlipped.toggle()
        }
    }

    func flipToInput() {
        withAnimation(.easeInOut(duration: 0.6)) {
            isFlipped = false
        }
    }
}
