export type AIProvider = 'openai' | 'anthropic'

const KEYS = {
  provider: 'dailyAffirmation.provider',
  apiKey: 'dailyAffirmation.apiKey',
} as const

export function getProvider(): AIProvider {
  const raw = localStorage.getItem(KEYS.provider)
  return raw === 'anthropic' ? 'anthropic' : 'openai'
}

export function setProvider(provider: AIProvider): void {
  localStorage.setItem(KEYS.provider, provider)
}

export function getApiKey(): string {
  return localStorage.getItem(KEYS.apiKey) ?? ''
}

export function setApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(KEYS.apiKey, key.trim())
  } else {
    localStorage.removeItem(KEYS.apiKey)
  }
}

export const providerLabels: Record<AIProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
}

/** Keys are stored per browser + URL (localhost vs phone IP are separate). */
export function looksLikeOpenAIKey(key: string): boolean {
  const k = key.trim()
  return k.startsWith('sk-') && !k.startsWith('sk-ant-')
}

export function looksLikeAnthropicKey(key: string): boolean {
  return key.trim().startsWith('sk-ant-')
}

export function validateKeyForProvider(key: string, provider: AIProvider): string | null {
  const trimmed = key.trim()
  if (!trimmed) return null
  if (provider === 'anthropic' && looksLikeOpenAIKey(trimmed)) {
    return 'This looks like an OpenAI key. Switch provider to OpenAI, or paste an Anthropic key (starts with sk-ant-).'
  }
  if (provider === 'openai' && looksLikeAnthropicKey(trimmed)) {
    return 'This looks like an Anthropic key. Switch provider to Anthropic, or paste an OpenAI key.'
  }
  if (provider === 'anthropic' && !looksLikeAnthropicKey(trimmed)) {
    return 'Anthropic keys usually start with sk-ant-. Double-check you copied the full key.'
  }
  return null
}
