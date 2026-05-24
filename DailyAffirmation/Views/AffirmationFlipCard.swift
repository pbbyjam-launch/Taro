import SwiftUI

struct AffirmationFlipCard: View {
    @Binding var thought: String
    let affirmation: String?
    let cardPhase: CardPhase
    let isFlipped: Bool
    let canFlip: Bool
    let isShuffling: Bool
    let onSubmit: () -> Void
    let onToggleFlip: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @FocusState private var isThoughtFocused: Bool

    private var trimmedThought: String {
        thought.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var canSubmit: Bool {
        !trimmedThought.isEmpty &&
        thought.count <= AffirmationService.maxThoughtLength &&
        !isShuffling
    }

    var body: some View {
        Group {
            if reduceMotion {
                reducedMotionCard
            } else {
                flipCard
            }
        }
        .frame(width: AppTheme.cardWidth, height: AppTheme.cardHeight)
        .postcardShuffle(isShuffling: isShuffling, isFlipped: isFlipped)
        .onTapGesture {
            guard canFlip, !isShuffling else { return }
            isThoughtFocused = false
            onToggleFlip()
        }
        .accessibilityElement(children: .contain)
    }

    private var flipCard: some View {
        ZStack {
            cardFace(isBack: false) { frontContent }
                .rotation3DEffect(
                    .degrees(isFlipped ? 180 : 0),
                    axis: (x: 0, y: 1, z: 0),
                    perspective: 0.4
                )
                .opacity(isFlipped ? 0 : 1)

            cardFace(isBack: true) { backContent }
                .rotation3DEffect(
                    .degrees(isFlipped ? 0 : -180),
                    axis: (x: 0, y: 1, z: 0),
                    perspective: 0.4
                )
                .opacity(isFlipped ? 1 : 0)
        }
        .animation(.easeInOut(duration: 0.6), value: isFlipped)
    }

    private var reducedMotionCard: some View {
        ZStack {
            if isFlipped {
                cardFace(isBack: true) { backContent }
                    .transition(.opacity)
            } else {
                cardFace(isBack: false) { frontContent }
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.35), value: isFlipped)
    }

    private func cardFace<Content: View>(isBack: Bool, @ViewBuilder content: () -> Content) -> some View {
        content()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background {
                CardAuraBackground(isBack: isBack, isShuffling: isShuffling && !isBack)
            }
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cardCornerRadius))
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cardCornerRadius)
                    .stroke(
                        isBack ? AppTheme.softPink.opacity(0.35) : AppTheme.peach.opacity(0.25),
                        lineWidth: 1
                    )
            )
            .shadow(color: AppTheme.cardShadow, radius: 20, x: 0, y: 10)
            .accessibilityHidden(isBack ? !isFlipped : isFlipped)
    }

    private var frontContent: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 24)

            ZStack(alignment: .topLeading) {
                if trimmedThought.isEmpty {
                    Text("What's on your mind?")
                        .font(.body)
                        .foregroundStyle(AppTheme.textSecondary)
                        .padding(.horizontal, 4)
                        .padding(.top, 8)
                        .allowsHitTesting(false)
                }

                TextEditor(text: $thought)
                    .font(.body)
                    .foregroundStyle(AppTheme.textPrimary)
                    .scrollContentBackground(.hidden)
                    .background(Color.clear)
                    .focused($isThoughtFocused)
                    .disabled(isShuffling)
                    .accessibilityLabel("Thought input")
            }
            .frame(maxHeight: .infinity)
            .padding(.horizontal, 24)

            Spacer(minLength: 16)

            Button(action: onSubmit) {
                Text(isShuffling ? "Shuffling…" : "Submit")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(canSubmit ? .white : AppTheme.textSecondary)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background {
                        Capsule()
                            .fill(
                                canSubmit
                                    ? LinearGradient(
                                        colors: [AppTheme.coral, AppTheme.sunset],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                    : LinearGradient(
                                        colors: [AppTheme.peach.opacity(0.4), AppTheme.peach.opacity(0.3)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                            )
                    }
            }
            .disabled(!canSubmit)
            .padding(.bottom, 28)
            .accessibilityHint("Submit your thought to generate an affirmation")
        }
    }

    @ViewBuilder
    private var backContent: some View {
        VStack(spacing: 16) {
            Spacer(minLength: 32)

            if let affirmation, !affirmation.isEmpty {
                Text(affirmation)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.forestGreen)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 28)
                    .accessibilityLabel("Affirmation: \(affirmation)")
            }

            Spacer()

            if !trimmedThought.isEmpty {
                Text(trimmedThought)
                    .font(.caption)
                    .foregroundStyle(AppTheme.textSecondary)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 28)
                    .padding(.bottom, 28)
            }
        }
    }
}
