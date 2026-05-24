import { useState } from 'react'
import {
  getApiKey,
  getProvider,
  providerLabels,
  setApiKey,
  setProvider,
  validateKeyForProvider,
  type AIProvider,
} from '../storage/settings'
import './SettingsView.css'

export function SettingsView() {
  const [provider, setProviderState] = useState<AIProvider>(() => getProvider())
  const [apiKey, setApiKeyState] = useState(() => getApiKey())
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [keyWarning, setKeyWarning] = useState<string | null>(null)

  const handleProviderChange = (value: AIProvider) => {
    setProviderState(value)
    setProvider(value)
    setKeyWarning(validateKeyForProvider(apiKey, value))
  }

  const handleSave = () => {
    const warning = validateKeyForProvider(apiKey, provider)
    setKeyWarning(warning)
    setProvider(provider)
    setApiKey(apiKey)
    if (warning) {
      setSaveMessage('Key saved, but it may not match the selected provider.')
    } else {
      setSaveMessage(apiKey.trim() ? 'API key saved in this browser.' : 'API key removed.')
    }
    window.setTimeout(() => setSaveMessage(null), 4000)
  }

  return (
    <div className="settings-view">
      <h1 className="settings-view__title">Settings</h1>

      <section className="settings-section">
        <h2 className="settings-section__heading">AI provider</h2>
        <label className="settings-field">
          Provider
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
          >
            {(Object.keys(providerLabels) as AIProvider[]).map((p) => (
              <option key={p} value={p}>
                {providerLabels[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-field">
          API key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKeyState(e.target.value)
              setKeyWarning(validateKeyForProvider(e.target.value, provider))
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        {keyWarning && <p className="settings-view__warning">{keyWarning}</p>}

        <button type="button" className="settings-view__save" onClick={handleSave}>
          Save API key
        </button>

        {saveMessage && <p className="settings-view__toast">{saveMessage}</p>}

        <p className="settings-privacy settings-privacy--origin">
          Keys are saved for <strong>{window.location.origin}</strong> only. Testing on your phone
          (e.g. <code>192.168.x.x:5173</code>) is separate from <code>localhost</code> — paste and
          save the key again on each device.
        </p>
      </section>

      <section className="settings-section settings-section--privacy">
        <h2 className="settings-section__heading">Privacy</h2>
        <p className="settings-privacy">
          Your thoughts are stored only in this browser (localStorage). When you generate an
          affirmation, your thought is sent to the AI provider you choose using the API key you
          provide. The key is stored in this browser&apos;s localStorage — not on any server we
          operate.
        </p>
        <p className="settings-privacy settings-privacy--cors">
          <strong>Browser API access:</strong> OpenAI and Anthropic may block direct browser
          requests (CORS). If generation fails with a network error, run the app locally with{' '}
          <code>npm run dev</code> or use a small proxy — see <code>web/README.md</code>.
        </p>
      </section>
    </div>
  )
}
