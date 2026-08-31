import { useRef } from 'react'
import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'

const PALETTE_ROLES = ['Primary', 'Accent', 'Light', 'Surface', 'Ground']

export function WizStep5_Visual() {
  const {
    generatedPalette, generatedFontPairs, selectedFontIndex,
    setField,
  } = useWizardStore()

  const colorInputRefs = useRef<Array<HTMLInputElement | null>>([])

  function handleSwatchClick(i: number) {
    colorInputRefs.current[i]?.click()
  }

  function handleColorChange(i: number, hex: string) {
    const next = [...generatedPalette]
    next[i] = hex
    setField('generatedPalette', next)
  }

  const hasPalette = generatedPalette.length > 0
  const hasFonts = generatedFontPairs.length > 0

  return (
    <div className="biz-step">
      <div>
        <h1 className="biz-step-title">Refine your palette & typography</h1>
        <p className="biz-step-sub">Fine-tune the colours and font pairing generated from your logo.</p>
      </div>

      {hasPalette ? (
        <div>
          <div className="biz-field-label">Colour roles — tap any swatch to swap</div>
          <div className="biz-palette-row">
            {generatedPalette.slice(0, 5).map((hex, i) => (
              <div key={i} className="biz-palette-swatch-item" style={{ position: 'relative' }}>
                <div
                  className="biz-palette-swatch-block"
                  style={{ background: hex }}
                  onClick={() => handleSwatchClick(i)}
                  title={`Change ${PALETTE_ROLES[i]}`}
                />
                <input
                  ref={(el) => { colorInputRefs.current[i] = el }}
                  type="color"
                  value={hex}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                  onChange={(e) => handleColorChange(i, e.target.value)}
                />
                <div className="biz-palette-swatch-role">{PALETTE_ROLES[i] ?? ''}</div>
                <div className="biz-palette-swatch-hex">{hex.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 0', color: 'var(--t3)', fontSize: 13, fontStyle: 'italic' }}>
          Complete the logo step first — your palette will appear here.
        </div>
      )}

      {hasFonts ? (
        <div>
          <div className="biz-field-label">Typography pairing</div>
          <div className="biz-font-options">
            {generatedFontPairs.map((pair, i) => (
              <button
                key={i}
                className={`biz-font-option${selectedFontIndex === i ? ' selected' : ''}`}
                onClick={() => setField('selectedFontIndex', i)}
              >
                <div className="biz-font-specimen">
                  <div className="biz-font-display" style={{ fontFamily: pair.display }}>
                    {pair.display}
                  </div>
                  <div className="biz-font-body-sample" style={{ fontFamily: pair.body }}>
                    {pair.body} · Body text
                  </div>
                </div>
                <div className="biz-font-names">
                  {pair.display}<br /><span style={{ opacity: 0.4 }}>+</span><br />{pair.body}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        hasPalette && (
          <div style={{ color: 'var(--t3)', fontSize: 13, fontStyle: 'italic' }}>
            Font options will appear once logo generation is complete.
          </div>
        )
      )}
    </div>
  )
}

export function WizStep5_Nav({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { generatedPalette } = useWizardStore()
  return (
    <div className="biz-nav">
      <button className="biz-nav-back-link" onClick={onBack}>← Back</button>
      <button className="btn primary" onClick={onNext} disabled={generatedPalette.length === 0}>Continue →</button>
    </div>
  )
}
