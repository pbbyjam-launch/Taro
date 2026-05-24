import SwiftUI
import SwiftData

struct TodayView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = TodayViewModel()

    var body: some View {
        ZStack {
            OptimisticBackground()
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer()

                AffirmationFlipCard(
                    thought: $viewModel.thought,
                    affirmation: viewModel.affirmation,
                    cardPhase: viewModel.cardPhase,
                    isFlipped: viewModel.isFlipped,
                    canFlip: viewModel.canFlip,
                    isShuffling: viewModel.isShuffling,
                    onSubmit: {
                        Task { await viewModel.submitThought() }
                    },
                    onToggleFlip: {
                        viewModel.toggleFlip()
                    }
                )

                footerSection

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .onAppear {
            viewModel.configure(context: modelContext)
        }
    }

    @ViewBuilder
    private var footerSection: some View {
        VStack(spacing: 8) {
            if let error = viewModel.errorMessage {
                HStack(spacing: 8) {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.orange)
                        .multilineTextAlignment(.center)

                    Button("Retry") {
                        Task { await viewModel.submitThought() }
                    }
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(AppTheme.teal)
                }
                .accessibilityElement(children: .combine)
            } else if viewModel.hasAffirmation && !viewModel.isFlipped && !viewModel.isShuffling {
                Text("Tap card to read today's affirmation")
                    .font(.caption)
                    .foregroundStyle(AppTheme.textSecondary)
            } else if viewModel.isShuffling {
                Text("Finding your words…")
                    .font(.caption)
                    .foregroundStyle(AppTheme.textSecondary)
                    .accessibilityLabel("Shuffling, finding your affirmation")
            }
        }
        .frame(minHeight: 20)
    }
}
