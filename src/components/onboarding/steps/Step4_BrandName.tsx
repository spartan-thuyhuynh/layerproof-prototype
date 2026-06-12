import { useState } from 'react'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { ArrowRight } from '@/icons'

const PRODUCT_LABELS: Record<string, string> = {
  matte:  'Matte',
  chromo: 'Chromo',
  vellum: 'Vellum',
  kraft:  'Kraft',
}

const GRADIENTS = [
  'linear-gradient(135deg,#ec4899,#ffde42)',
  'linear-gradient(135deg,#8b5cf6,#3b82f6)',
  'linear-gradient(135deg,#14b8a6,#22d3ee)',
  'linear-gradient(135deg,#f97316,#fbbf24)',
]

function brandGradient(name: string) {
  const idx = name.charCodeAt(0) % GRADIENTS.length
  return GRADIENTS[isNaN(idx) ? 0 : idx]
}

export function Step4_BrandName() {
  const { setBrandName, setTagline, nextStep, selectedProduct } = useOnboardingStore()
  const [localName, setLocalName] = useState('')
  const [localTagline, setLocalTagline] = useState('')

  const canContinue = localName.trim().length > 0
  const letter = localName.trim()[0]?.toUpperCase() ?? '?'
  const gradient = brandGradient(localName)
  const productLabel = selectedProduct ? PRODUCT_LABELS[selectedProduct] : 'LayerProof'

  function handleContinue() {
    if (!canContinue) return
    setBrandName(localName.trim())
    setTagline(localTagline.trim())
    nextStep()
  }

  return (
    <div className="onb-step fade-in">
      <div className="h-eyebrow" style={{ marginBottom: 10 }}>Your brand</div>
      <h1 className="onb-step-title">What's your brand called?</h1>
      <p className="onb-step-sub">
        Your brand kit powers every{' '}
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{productLabel}</span>{' '}
        output — colors, fonts, and voice, applied automatically.
      </p>

      {/* Live avatar preview */}
      <div className="onb-avatar-preview">
        <div className="onb-avatar" style={{ background: gradient }}>
          {letter}
        </div>
        <div className="onb-avatar-meta">
          <div className="onb-avatar-name">{localName || 'Your Brand'}</div>
          {localTagline && (
            <div className="onb-avatar-tagline">{localTagline}</div>
          )}
        </div>
      </div>

      <div className="onb-field">
        <label className="onb-label">Brand name <span style={{ color: 'var(--c-red)' }}>*</span></label>
        <input
          className="onb-input"
          type="text"
          placeholder="e.g. Acme Studio"
          value={localName}
          autoFocus
          onChange={(e) => setLocalName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />
      </div>

      <div className="onb-field">
        <label className="onb-label">Tagline <span className="tiny" style={{ marginLeft: 4 }}>optional</span></label>
        <input
          className="onb-input"
          type="text"
          placeholder="e.g. Modern furniture for small spaces"
          value={localTagline}
          onChange={(e) => setLocalTagline(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />
      </div>

      <button
        className="btn primary onb-cta"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continue <ArrowRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  )
}
