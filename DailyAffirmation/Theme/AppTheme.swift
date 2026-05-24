import SwiftUI

enum AppTheme {
    // Warm palette
    static let coral = Color(red: 1.0, green: 0.48, blue: 0.40)
    static let peach = Color(red: 1.0, green: 0.78, blue: 0.62)
    static let sunset = Color(red: 1.0, green: 0.65, blue: 0.38)
    static let softPink = Color(red: 0.98, green: 0.58, blue: 0.68)
    static let magenta = Color(red: 0.82, green: 0.38, blue: 0.58)

    // Cool accents
    static let skyBlue = Color(red: 0.52, green: 0.80, blue: 0.94)
    static let teal = Color(red: 0.20, green: 0.68, blue: 0.64)
    static let forestGreen = Color(red: 0.14, green: 0.32, blue: 0.26)

    // Neutrals
    static let background = Color(red: 0.99, green: 0.97, blue: 0.95)
    static let cardBase = Color(red: 1.0, green: 0.99, blue: 0.97)
    static let textPrimary = forestGreen
    static let textSecondary = Color(red: 0.42, green: 0.46, blue: 0.44)
    static let accent = coral

    static let cardShadow = coral.opacity(0.18)
    static let affirmationBackground = peach.opacity(0.25)
    static let cardCornerRadius: CGFloat = 20
    static let cardWidth: CGFloat = 320
    static let cardHeight: CGFloat = 420

    static var screenGradient: LinearGradient {
        LinearGradient(
            colors: [
                background,
                peach.opacity(0.35),
                skyBlue.opacity(0.18)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var cardFrontGradient: LinearGradient {
        LinearGradient(
            colors: [
                cardBase,
                peach.opacity(0.22),
                skyBlue.opacity(0.12)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var cardBackGradient: LinearGradient {
        LinearGradient(
            colors: [
                peach.opacity(0.45),
                softPink.opacity(0.35),
                sunset.opacity(0.28)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    static var auraGradient: RadialGradient {
        RadialGradient(
            colors: [
                skyBlue.opacity(0.55),
                peach.opacity(0.45),
                softPink.opacity(0.25),
                Color.clear
            ],
            center: .center,
            startRadius: 8,
            endRadius: 180
        )
    }

    static var shufflingGlow: RadialGradient {
        RadialGradient(
            colors: [
                magenta.opacity(0.35),
                coral.opacity(0.25),
                Color.clear
            ],
            center: .center,
            startRadius: 20,
            endRadius: 200
        )
    }
}

struct OptimisticBackground: View {
    var body: some View {
        ZStack {
            AppTheme.screenGradient

            Circle()
                .fill(AppTheme.peach.opacity(0.45))
                .frame(width: 280, height: 280)
                .blur(radius: 70)
                .offset(x: -90, y: -220)

            Circle()
                .fill(AppTheme.skyBlue.opacity(0.35))
                .frame(width: 240, height: 240)
                .blur(radius: 65)
                .offset(x: 110, y: -140)

            Circle()
                .fill(AppTheme.softPink.opacity(0.3))
                .frame(width: 300, height: 300)
                .blur(radius: 80)
                .offset(x: 40, y: 280)
        }
    }
}

struct CardAuraBackground: View {
    let isBack: Bool
    let isShuffling: Bool

    var body: some View {
        ZStack {
            if isBack {
                AppTheme.cardBackGradient
            } else {
                AppTheme.cardFrontGradient
            }

            AppTheme.auraGradient
                .opacity(isBack ? 0.7 : 0.5)
                .offset(y: isBack ? 0 : -40)

            if isShuffling {
                AppTheme.shufflingGlow
                    .opacity(0.85)
                    .scaleEffect(1.1)
            }
        }
    }
}
