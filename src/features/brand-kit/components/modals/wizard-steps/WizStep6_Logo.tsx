import { useState } from 'react'
import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { LOGO_STYLES } from '@/features/brand-kit/data/logo-styles'
import { COLOR_TONES } from '@/features/brand-kit/data/color-tones'
import { generatePalette, generateFontPairs, generateLogos } from '@/features/brand-kit/lib/generateIdentity'

export function WizStep6_Logo() {
  const {
    name, archetypes, logoStyleId, colorToneId, logoPrompt,
    generatedLogos, selectedLogoId, regenerationCount,
    setField, setGenerated, incrementRegenCount,
  } = useWizardStore()

  const [generating, setGenerating] = useState(false)
  const hasLogos = generatedLogos.length > 0

  function runGenerate() {
    setGenerating(true)
    setTimeout(() => {
      const palette = generatePalette(colorToneId, archetypes)
      const fontPairs = generateFontPairs(archetypes)
      const logos = generateLogos(logoStyleId, name || 'Brand', palette[0], regenerationCount)
      setGenerated({ palette, fontPairs, logos })
      setGenerating(false)
    }, 1200)
  }

  function handleRegenerate() {
    incrementRegenCount()
    setGenerating(true)
    setTimeout(() => {
      const palette = generatePalette(colorToneId, archetypes)
      const fontPairs = generateFontPairs(archetypes)
      const logos = generateLogos(logoStyleId, name || 'Brand', palette[0], regenerationCount + 1)
      setGenerated({ palette, fontPairs, logos })
      setGenerating(false)
    }, 1000)
  }

  return (
    <div className="biz-step">
      <div>
        <h1 className="biz-step-title">Design your logo</h1>
        <p className="biz-step-sub">Pick a style and color tone, then generate options to choose from.</p>
      </div>

      {/* Color tone */}
      <div>
        <div className="biz-field-label">Color tone</div>
        <div className="biz-tone-tiles">
          {COLOR_TONES.map((tone) => {
            // build 9-cell mosaic from 5 swatches
            const c = tone.swatchPreview
            const grid = [c[0],c[2],c[1], c[3],c[0],c[2], c[1],c[4],c[3]]
            return (
              <button
                key={tone.id}
                className={`biz-tone-tile${colorToneId === tone.id ? ' active' : ''}`}
                onClick={() => { setField('colorToneId', tone.id); setField('generatedLogos', []); setField('selectedLogoId', '') }}
              >
                <div className="biz-tone-mosaic">
                  {grid.map((hex, i) => (
                    <div key={i} className="biz-tone-mosaic-cell" style={{ background: hex }} />
                  ))}
                </div>
                <span className="biz-tone-tile-label">{tone.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom instructions */}
      <div className="onb-field">
        <label className="onb-label">
          Describe your logo <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          className="onb-input onb-textarea"
          style={{ minHeight: 60 }}
          maxLength={200}
          placeholder="e.g. A simple leaf icon with the brand name beside it"
          value={logoPrompt}
          onChange={(e) => setField('logoPrompt', e.target.value)}
        />
      </div>

      {/* Logo style grid */}
      <div>
        <div className="biz-field-label">Like any of these examples?</div>
        <div className="biz-logo-styles-grid">
          {LOGO_STYLES.map((style) => (
            <button
              key={style.id}
              className={`biz-logo-style-card${logoStyleId === style.id ? ' active' : ''}`}
              onClick={() => { setField('logoStyleId', style.id); setField('generatedLogos', []); setField('selectedLogoId', '') }}
            >
              <div className="biz-logo-style-preview" dangerouslySetInnerHTML={{ __html: style.exampleSvg }} />
              <div className="biz-logo-style-label">{style.label}</div>
              <div className="biz-logo-style-desc">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated logo options */}
      {(hasLogos || generating) && (
        <div className="biz-logo-results">
          <div className="biz-field-label">
            Pick a logo
            {!generating && (
              <button className="biz-regen-link" onClick={handleRegenerate}>↺ Regenerate</button>
            )}
          </div>

          {generating ? (
            <div className="biz-logo-generating">
              <div className="biz-logo-spinner" />
              <span>Generating logos…</span>
            </div>
          ) : (
            <div className="biz-logo-picks">
              {generatedLogos.map((logo) => (
                <button
                  key={logo.id}
                  className={`biz-logo-pick${selectedLogoId === logo.id ? ' active' : ''}`}
                  onClick={() => setField('selectedLogoId', logo.id)}
                >
                  <div
                    className="biz-logo-pick-svg"
                    dangerouslySetInnerHTML={{ __html: logo.svg }}
                  />
                  <div className="biz-logo-pick-label">{logo.variantLabel}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function WizStep6_Nav({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { logoStyleId, colorToneId, generatedLogos, selectedLogoId } = useWizardStore()
  const hasLogos = generatedLogos.length > 0

  // Inline generate trigger — rendered inside the nav area before generation
  const [generating, setGenerating] = useState(false)
  const { archetypes, name, regenerationCount, setGenerated } = useWizardStore()

  function runGenerate() {
    setGenerating(true)
    setTimeout(() => {
      const palette = generatePalette(colorToneId, archetypes)
      const fontPairs = generateFontPairs(archetypes)
      const logos = generateLogos(logoStyleId, name || 'Brand', palette[0], regenerationCount)
      setGenerated({ palette, fontPairs, logos })
      setGenerating(false)
    }, 1200)
  }

  if (!hasLogos) {
    return (
      <div className="biz-nav">
        <button
          className="btn primary"
          disabled={!logoStyleId || !colorToneId || generating}
          onClick={runGenerate}
        >
          {generating ? 'Generating…' : 'Generate logo options →'}
        </button>
      </div>
    )
  }

  return (
    <div className="biz-nav">
      <button className="btn primary" disabled={!selectedLogoId} onClick={onNext}>
        Continue →
      </button>
    </div>
  )
}
