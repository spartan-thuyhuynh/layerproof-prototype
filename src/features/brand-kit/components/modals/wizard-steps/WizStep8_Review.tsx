import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { generateUseCases } from '@/features/brand-kit/lib/generateUseCases'
import { generateLogos } from '@/features/brand-kit/lib/generateIdentity'

const PALETTE_ROLES = ['Primary', 'Secondary', 'Accent', 'Neutral', 'Surface']
const BG_LABELS: Record<string, string> = { dark: 'Dark', light: 'Light', colored: 'Brand color' }

export function WizStep8_Review() {
  const {
    generatedLogos, selectedLogoId, useCases,
    generatedPalette, generatedFontPairs, selectedFontIndex,
    colorToneId, logoStyleId, name, regenerationCount,
    setField, setUseCases, setGenerated, incrementRegenCount,
  } = useWizardStore()

  const panelADone = !!selectedLogoId && useCases.length > 0
  const panelBDone = panelADone

  function selectLogo(id: string) {
    setField('selectedLogoId', id)
    const logo = generatedLogos.find((l) => l.id === id)
    if (logo && generatedPalette.length > 0) {
      setUseCases(generateUseCases(logo.svg, generatedPalette[0]))
    }
  }

  function regenerate() {
    incrementRegenCount()
    const newSeed = regenerationCount + 1
    const logos = generateLogos(logoStyleId, name || 'Brand', generatedPalette[0] ?? '#888', newSeed)
    setGenerated({
      palette: generatedPalette,
      fontPairs: generatedFontPairs,
      logos,
    })
    setUseCases([])
  }

  return (
    <div className="biz-review">
      <div style={{ marginBottom: 24 }}>
        <h1 className="biz-step-title" style={{ fontSize: 22 }}>Review your brand identity</h1>
        <p className="biz-step-sub">Select a logo, confirm your palette, and choose a font pairing.</p>
      </div>

      {/* Panel A — Logo */}
      <div className={`biz-review-panel active`}>
        <div className="biz-review-panel-header">
          <span className="biz-review-panel-num">1</span>
          <span className="biz-review-panel-title">Logo</span>
        </div>
        <div className="biz-review-panel-body">
          <div className="biz-logo-candidates">
            {generatedLogos.map((logo) => (
              <div
                key={logo.id}
                className={`biz-logo-candidate${selectedLogoId === logo.id ? ' selected' : ''}`}
                onClick={() => selectLogo(logo.id)}
              >
                <div
                  className="biz-logo-candidate-preview"
                  dangerouslySetInnerHTML={{ __html: logo.svg }}
                />
                <div className="biz-logo-candidate-label">{logo.variantLabel}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="biz-regen-link" onClick={regenerate}>
              Try different variants
            </button>
          </div>

          {useCases.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', marginBottom: 10 }}>
                LOGO IN CONTEXT
              </div>
              <div className="biz-use-cases">
                {useCases.map((uc) => (
                  <div key={uc.id} className="biz-use-case-card">
                    <div
                      className="biz-use-case-preview"
                      dangerouslySetInnerHTML={{ __html: uc.svg }}
                    />
                    <div className="biz-use-case-label">{BG_LABELS[uc.background]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel B — Palette */}
      <div className={`biz-review-panel${panelADone ? ' active' : ''}`}>
        <div className="biz-review-panel-header">
          <span className={`biz-review-panel-num${!panelADone ? ' locked' : ''}`}>2</span>
          <span className="biz-review-panel-title">Color Palette</span>
        </div>
        <div className={`biz-review-panel-body${!panelADone ? ' locked' : ''}`}>
          {generatedPalette.length > 0 && (
            <div className="biz-palette-row">
              {generatedPalette.map((hex, i) => (
                <div key={i} className="biz-palette-swatch-item">
                  <div
                    className="biz-palette-swatch-block"
                    style={{ background: hex }}
                    title={hex}
                  />
                  <div className="biz-palette-swatch-role">{PALETTE_ROLES[i] ?? `Color ${i + 1}`}</div>
                  <div className="biz-palette-swatch-hex">{hex}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>
            Derived from your {colorToneId} tone selection. You can fine-tune each color in the Colors section after applying.
          </div>
        </div>
      </div>

      {/* Panel C — Typography */}
      <div className={`biz-review-panel${panelBDone ? ' active' : ''}`}>
        <div className="biz-review-panel-header">
          <span className={`biz-review-panel-num${!panelBDone ? ' locked' : ''}`}>3</span>
          <span className="biz-review-panel-title">Typography</span>
        </div>
        <div className={`biz-review-panel-body${!panelBDone ? ' locked' : ''}`}>
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
                    Body text in {pair.body} — clear, readable, consistent.
                  </div>
                </div>
                <div className="biz-font-names">
                  {pair.display}<br />
                  <span style={{ opacity: 0.6 }}>{pair.body}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function WizStep8_Nav({ onApply, onBack }: { onApply: () => void; onBack: () => void }) {
  const { selectedLogoId, selectedFontIndex, generatedFontPairs } = useWizardStore()
  const canApply = !!selectedLogoId && generatedFontPairs.length > 0
  return (
    <div className="biz-nav">
      <button className="btn primary" disabled={!canApply} onClick={onApply}>
        Apply to brand kit
      </button>
    </div>
  )
}
