import { useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { Wand, Download, Plus, ArrowRight } from '@/shared/icons'

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17, flexShrink: 0, color: 'var(--t3)' }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

export function Step5_Import() {
  const { setImportPath, setImportUrl, nextStep, brandName, tagline, setNewKitId } = useOnboardingStore()
  const { createKit, updateKit } = useBrandStore()
  const [url, setUrl] = useState('')

  function handleUrl() {
    if (!url.trim()) return
    setImportPath('url')
    setImportUrl(url.trim())
    nextStep()
  }

  function handlePdf() {
    setImportPath('pdf')
    nextStep()
  }

  function handleBlank() {
    setImportPath('blank')
    // Create the kit immediately (no processing step) so Step7_Review has a kit
    const id = createKit()
    updateKit(id, (k) => ({
      ...k,
      name:      brandName || 'Untitled Brand',
      tagline:   tagline,
      logoText:  (brandName || 'U')[0].toUpperCase(),
      onboarding: true,
    }))
    setNewKitId(id)
    // wizard will render step 7 (skips step 6) via displayStep logic
    nextStep()
  }

  return (
    <div className="onb-step fade-in">
      <div className="h-eyebrow" style={{ marginBottom: 10 }}>Brand setup</div>
      <h1 className="onb-step-title">Set up <span style={{ color: 'var(--accent)' }}>{brandName || 'your brand'}</span></h1>
      <p className="onb-step-sub">Import your existing guidelines or start fresh — you can always add more later.</p>

      {/* URL hero card */}
      <div className="onb-import-hero">
        <div className="onb-import-hero-label">
          <Wand style={{ width: 18, height: 18, color: 'var(--accent)' }} />
          <span>Import from URL</span>
          <span className="chip solid" style={{ fontSize: 11, padding: '2px 8px' }}>Recommended</span>
        </div>
        <p className="onb-import-hero-sub">
          Paste your website or brand guidelines URL — we'll extract colors, fonts, and tone automatically.
        </p>
        <div className="ob-url-input-wrap" style={{ marginTop: 14 }}>
          <LinkIcon />
          <input
            className="ob-url-input"
            type="url"
            placeholder="https://your-brand-guidelines.com"
            value={url}
            autoFocus
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUrl() }}
          />
          <button
            className="ob-url-btn"
            onClick={handleUrl}
            disabled={!url.trim()}
          >
            Import <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Secondary options */}
      <div className="onb-import-secondary">
        <button className="onb-import-alt card hover" onClick={handlePdf}>
          <div className="onb-import-alt-icon">
            <Download style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div className="onb-import-alt-title">Upload brand PDF</div>
            <div className="onb-import-alt-sub">Style guide, brand manual, guidelines doc</div>
          </div>
        </button>

        <button className="onb-import-alt card hover" onClick={handleBlank}>
          <div className="onb-import-alt-icon">
            <Plus style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div className="onb-import-alt-title">Start blank</div>
            <div className="onb-import-alt-sub">Configure each section manually</div>
          </div>
        </button>
      </div>
    </div>
  )
}
