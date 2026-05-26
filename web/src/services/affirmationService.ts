import type { AIProvider } from '../storage/settings'
import { affirmationSystemPrompt, affirmationUserMessage } from '../prompts/affirmationPrompt'
import { checkSuccess } from './httpHelpers'

export const MAX_THOUGHT_WORDS = 2000

export type AffirmationErrorCode =
  | 'emptyThought'
  | 'thoughtTooLong'
  | 'missingAPIKey'
  | 'invalidResponse'
  | 'httpError'
  | 'network'

export class AffirmationError extends Error {
  code: AffirmationErrorCode

  constructor(code: AffirmationErrorCode, message: string) {
    super(message)
    this.name = 'AffirmationError'
    this.code = code
  }
}

export function validateThought(thought: string): void {
  const trimmed = thought.trim()
  if (!trimmed) {
    throw new AffirmationError('emptyThought', 'Write a thought about your day first.')
  }
  if (countWords(trimmed) > MAX_THOUGHT_WORDS) {
    throw new AffirmationError(
      'thoughtTooLong',
      `Keep your thought under ${MAX_THOUGHT_WORDS} words.`,
    )
  }
}

export function countWords(value: string): number {
  return value.trim().match(/\S+/g)?.length ?? 0
}

export function clampToThoughtWordLimit(value: string): string {
  const matches = [...value.matchAll(/\S+/g)]
  if (matches.length <= MAX_THOUGHT_WORDS) return value

  const lastAllowedWord = matches[MAX_THOUGHT_WORDS - 1]
  return value.slice(0, (lastAllowedWord.index ?? 0) + lastAllowedWord[0].length)
}

const openAIUrl = import.meta.env.DEV
  ? '/api/openai/v1/chat/completions'
  : 'https://api.openai.com/v1/chat/completions'

const anthropicUrl = import.meta.env.DEV
  ? '/api/anthropic/v1/messages'
  : 'https://api.anthropic.com/v1/messages'

async function generateOpenAI(thought: string, date: Date, apiKey: string): Promise<string> {
  const response = await fetch(openAIUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: affirmationSystemPrompt },
        { role: 'user', content: affirmationUserMessage(thought, date) },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  })

  await checkSuccess(response)
  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = json.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new AffirmationError(
      'invalidResponse',
      'Could not read the affirmation from the response. Try again.',
    )
  }
  return content
}

async function generateAnthropic(thought: string, date: Date, apiKey: string): Promise<string> {
  const response = await fetch(anthropicUrl, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      temperature: 0.75,
      system: affirmationSystemPrompt,
      messages: [
        {
          role: 'user',
          content: affirmationUserMessage(thought, date),
        },
      ],
    }),
  })

  await checkSuccess(response)
  const json = (await response.json()) as {
    content?: { type?: string; text?: string }[]
  }
  const block = json.content?.find((b) => b.type === 'text')
  const text = block?.text?.trim()
  if (!text) {
    throw new AffirmationError(
      'invalidResponse',
      'Could not read the affirmation from the response. Try again.',
    )
  }
  return text
}

export async function generateAffirmation(
  thought: string,
  date: Date,
  provider: AIProvider,
  apiKey: string,
): Promise<string> {
  validateThought(thought)
  const trimmedKey = apiKey.trim()
  if (!trimmedKey) {
    throw new AffirmationError('missingAPIKey', 'Add your API key in Settings.')
  }

  const trimmedThought = thought.trim()

  try {
    if (provider === 'anthropic') {
      return await generateAnthropic(trimmedThought, date, trimmedKey)
    }
    return await generateOpenAI(trimmedThought, date, trimmedKey)
  } catch (err) {
    if (err instanceof AffirmationError) throw err
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new AffirmationError(
        'network',
        'Network error — check your connection or CORS settings (see README).',
      )
    }
    throw err
  }
}

export const MINIMUM_SHUFFLE_MS = 3000
