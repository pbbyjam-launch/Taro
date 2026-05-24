/** Optimistic palette — ported from AppTheme.swift */
export const colors = {
  coral: 'rgb(255, 122, 102)',
  peach: 'rgb(255, 199, 158)',
  sunset: 'rgb(255, 166, 97)',
  softPink: 'rgb(250, 148, 173)',
  magenta: 'rgb(209, 97, 148)',
  skyBlue: 'rgb(133, 204, 239)',
  teal: 'rgb(51, 173, 163)',
  forestGreen: 'rgb(36, 82, 66)',
  background: 'rgb(252, 247, 242)',
  cardBase: 'rgb(255, 252, 247)',
  textPrimary: 'rgb(36, 82, 66)',
  textSecondary: 'rgb(107, 117, 112)',
  accent: 'rgb(255, 122, 102)',
  cardShadow: 'rgba(255, 122, 102, 0.18)',
  affirmationBackground: 'rgba(255, 199, 158, 0.25)',
} as const

export const layout = {
  cardCornerRadius: 20,
  cardWidth: 320,
  cardHeight: 420,
} as const

export const gradients = {
  screen: `linear-gradient(135deg, ${colors.background} 0%, rgba(255, 199, 158, 0.35) 50%, rgba(133, 204, 239, 0.18) 100%)`,
  cardFront: `linear-gradient(135deg, ${colors.cardBase} 0%, rgba(255, 199, 158, 0.22) 50%, rgba(133, 204, 239, 0.12) 100%)`,
  cardBack: `linear-gradient(135deg, rgba(255, 199, 158, 0.45) 0%, rgba(250, 148, 173, 0.35) 50%, rgba(255, 166, 97, 0.28) 100%)`,
  submitActive: `linear-gradient(90deg, ${colors.coral}, ${colors.sunset})`,
  submitDisabled: `linear-gradient(90deg, rgba(255, 199, 158, 0.4), rgba(255, 199, 158, 0.3))`,
  ghostCard: `linear-gradient(135deg, ${colors.cardBase} 0%, rgba(255, 199, 158, 0.3) 50%, rgba(250, 148, 173, 0.2) 100%)`,
} as const
