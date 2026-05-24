import { AffirmationError } from './affirmationService'

export async function checkSuccess(response: Response): Promise<void> {
  if (response.ok) return
  const data = await response.text()
  let message = 'Unknown error'
  try {
    const json = JSON.parse(data) as Record<string, unknown>
    const error = json.error as { message?: string } | undefined
    if (error?.message) message = error.message
    else if (typeof json.message === 'string') message = json.message
    else message = data || message
  } catch {
    message = data || message
  }
  throw new AffirmationError('httpError', friendlyHttpError(response.status, message))
}

function friendlyHttpError(status: number, message: string): string {
  if (status === 401 && /x-api-key|api key|invalid.*key/i.test(message)) {
    return (
      `Request failed (401): ${message}. ` +
      'Check Settings: correct provider, full key pasted, and tap Save. ' +
      'On your phone, re-enter the key (it does not sync from your Mac). ' +
      'Create a new key at console.anthropic.com if this one was revoked.'
    )
  }
  if (status === 401) {
    return `Request failed (401): ${message}. Re-save your API key in Settings.`
  }
  return `Request failed (${status}): ${message}`
}
