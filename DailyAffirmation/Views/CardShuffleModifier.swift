import SwiftUI

/// Airbnb-style postcard deck shuffle: stacked paper cards riffle behind the main card.
struct PostcardShuffleDeck<Content: View>: View {
    let isShuffling: Bool
    let isFlipped: Bool
    @ViewBuilder let content: () -> Content

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var shuffleStep = 0
    @State private var shuffleTask: Task<Void, Never>?
    @State private var reducedMotionOpacity: Double = 1

    private var shouldShuffle: Bool { isShuffling && !isFlipped }

    var body: some View {
        ZStack {
            if shouldShuffle && !reduceMotion {
                ghostPostcards
            }

            content()
                .offset(shouldShuffle && !reduceMotion ? topCardOffset : .zero)
                .rotationEffect(.degrees(shouldShuffle && !reduceMotion ? topCardRotation : 0))
                .opacity(shouldShuffle && reduceMotion ? reducedMotionOpacity : 1)
                .shadow(
                    color: shouldShuffle ? AppTheme.magenta.opacity(0.25) : AppTheme.cardShadow,
                    radius: shouldShuffle ? 24 : 20,
                    x: shouldShuffle ? shadowOffset.width : 0,
                    y: shouldShuffle ? shadowOffset.height : 10
                )
                .animation(shuffleAnimation, value: shuffleStep)
                .animation(.easeOut(duration: 0.25), value: shouldShuffle)
                .zIndex(10)
        }
        .onChange(of: shouldShuffle) { _, active in
            if active {
                startShuffleLoop()
            } else {
                stopShuffleLoop()
            }
        }
        .onAppear {
            if shouldShuffle { startShuffleLoop() }
        }
        .onDisappear {
            stopShuffleLoop()
        }
    }

    private var ghostPostcards: some View {
        ForEach(0..<3, id: \.self) { index in
            postcardShell
                .offset(ghostOffset(for: index))
                .rotationEffect(.degrees(ghostRotation(for: index)))
                .scaleEffect(ghostScale(for: index))
                .zIndex(Double(index))
                .animation(shuffleAnimation, value: shuffleStep)
        }
    }

    private var postcardShell: some View {
        RoundedRectangle(cornerRadius: AppTheme.cardCornerRadius)
            .fill(
                LinearGradient(
                    colors: [
                        AppTheme.cardBase,
                        AppTheme.peach.opacity(0.3),
                        AppTheme.softPink.opacity(0.2)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cardCornerRadius)
                    .stroke(AppTheme.peach.opacity(0.3), lineWidth: 1)
            )
            .shadow(color: AppTheme.cardShadow, radius: 12, x: 0, y: 6)
            .frame(width: AppTheme.cardWidth, height: AppTheme.cardHeight)
    }

    private var shuffleAnimation: Animation {
        .spring(response: 0.38, dampingFraction: 0.72)
    }

    private var topCardOffset: CGSize {
        switch shuffleStep % 4 {
        case 0: CGSize(width: 0, height: 0)
        case 1: CGSize(width: 34, height: -8)
        case 2: CGSize(width: -30, height: 6)
        default: CGSize(width: 6, height: 0)
        }
    }

    private var topCardRotation: Double {
        switch shuffleStep % 4 {
        case 0: 0
        case 1: 9
        case 2: -7
        default: 2
        }
    }

    private var shadowOffset: CGSize {
        switch shuffleStep % 4 {
        case 0: CGSize(width: 0, height: 6)
        case 1: CGSize(width: 12, height: 10)
        case 2: CGSize(width: -10, height: 8)
        default: CGSize(width: 2, height: 6)
        }
    }

    private func ghostOffset(for index: Int) -> CGSize {
        let depth = CGFloat(index + 1) * 5
        let spread = CGFloat(index - 1) * 6
        switch shuffleStep % 4 {
        case 0:
            return CGSize(width: spread, height: depth)
        case 1:
            return CGSize(width: spread - 14, height: depth + 2)
        case 2:
            return CGSize(width: spread + 12, height: depth - 1)
        default:
            return CGSize(width: spread + 4, height: depth)
        }
    }

    private func ghostRotation(for index: Int) -> Double {
        let base = Double(index - 1) * 3.5
        switch shuffleStep % 4 {
        case 0: return base
        case 1: return base - 4
        case 2: return base + 5
        default: return base + 1
        }
    }

    private func ghostScale(for index: Int) -> CGFloat {
        1 - CGFloat(index + 1) * 0.018
    }

    private func startShuffleLoop() {
        stopShuffleLoop()
        shuffleStep = 0

        shuffleTask = Task { @MainActor in
            while !Task.isCancelled && shouldShuffle {
                if reduceMotion {
                    withAnimation(.easeInOut(duration: 0.7)) {
                        reducedMotionOpacity = reducedMotionOpacity < 1 ? 1 : 0.5
                    }
                } else {
                    shuffleStep += 1
                }
                try? await Task.sleep(for: .milliseconds(reduceMotion ? 700 : 380))
                guard !Task.isCancelled, shouldShuffle else { break }
            }
        }
    }

    private func stopShuffleLoop() {
        shuffleTask?.cancel()
        shuffleTask = nil
        withAnimation(.easeOut(duration: 0.2)) {
            shuffleStep = 0
            reducedMotionOpacity = 1
        }
    }
}

extension View {
    func postcardShuffle(isShuffling: Bool, isFlipped: Bool) -> some View {
        PostcardShuffleDeck(isShuffling: isShuffling, isFlipped: isFlipped) {
            self
        }
    }
}
