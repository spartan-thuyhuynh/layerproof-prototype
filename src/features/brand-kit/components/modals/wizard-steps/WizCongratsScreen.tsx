import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'

const PALETTE_ROLES = ['Primary', 'Accent', 'Light', 'Surface', 'Ground']

interface Props {
  onCreateTheme: () => void
  onDone: () => void
}

export function WizCongratsScreen({ onCreateTheme, onDone }: Props) {
  const {
    name, tagline, industry, values, differentiator,
    audienceAgeMin, audienceAgeMax, audienceGender, audienceLocations,
    brandImages,
    generatedPalette, generatedFontPairs, selectedFontIndex,
    generatedLogos, selectedLogoId, useCases,
  } = useWizardStore()

  const selectedLogo = generatedLogos.find((l) => l.id === selectedLogoId) ?? generatedLogos[0]
  const fontPair = generatedFontPairs[selectedFontIndex] ?? generatedFontPairs[0]
  const brandName = name || 'Your Brand'
  const primaryColor = generatedPalette[0] ?? '#333'

  return (
    <div className="biz-done">
      <button className="biz-done-close" onClick={onDone} aria-label="Close">✕</button>

      <div className="biz-done-header">
        <span className="biz-done-icon">✦</span>
        <h2 className="biz-done-title">Your brand is ready!</h2>
        <p className="biz-done-sub"><strong>{brandName}</strong> is now live in your Brand Studio.</p>
      </div>

      <div className="biz-done-body">
        <div className="biz-done-summary">

          {/* Identity */}
          <div className="biz-done-block">
            <div className="biz-done-block-label">Identity</div>
            <div className="biz-done-identity">
              {selectedLogo ? (
                <div
                  className="biz-done-logo-tile"
                  style={{ background: generatedPalette[0] ?? 'var(--card)' }}
                >
                  <div className="biz-done-logo-svg" dangerouslySetInnerHTML={{ __html: selectedLogo.svg }} />
                </div>
              ) : (
                <div className="biz-done-logo-initials">{brandName.slice(0, 2).toUpperCase()}</div>
              )}
              <div>
                <div className="biz-done-brand-name">{brandName}</div>
                {tagline && <div className="biz-done-tagline">"{tagline}"</div>}
                {industry && <div className="biz-done-industry">{industry}</div>}
              </div>
            </div>
          </div>

          {/* Logo variants */}
          {useCases.length > 0 && (
            <div className="biz-done-block">
              <div className="biz-done-block-label">Logo variants</div>
              <div className="biz-done-variants">
                {useCases.map((uc) => (
                  <div
                    key={uc.id}
                    className="biz-done-variant"
                    style={{
                      background: uc.background === 'dark' ? '#0A0A0A'
                        : uc.background === 'light' ? '#FFFFFF'
                        : primaryColor,
                    }}
                  >
                    <div className="biz-done-variant-svg" dangerouslySetInnerHTML={{ __html: uc.svg }} />
                    <div
                      className="biz-done-variant-label"
                      style={{ color: uc.background === 'light' ? '#666' : 'rgba(255,255,255,0.6)' }}
                    >
                      {uc.background === 'dark' ? 'Dark' : uc.background === 'light' ? 'Light' : 'Brand'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audience */}
          <div className="biz-done-block">
            <div className="biz-done-block-label">Audience</div>
            <div className="biz-done-audience">
              <div className="biz-done-audience-row">
                <span className="biz-done-audience-key">Age</span>
                <span className="biz-done-audience-val">{audienceAgeMin}–{audienceAgeMax}</span>
              </div>
              <div className="biz-done-audience-row">
                <span className="biz-done-audience-key">Gender</span>
                <span className="biz-done-audience-val">{audienceGender}</span>
              </div>
              {audienceLocations.length > 0 && (
                <div className="biz-done-audience-row">
                  <span className="biz-done-audience-key">Geography</span>
                  <span className="biz-done-audience-val">{audienceLocations.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Brand values */}
          {values.length > 0 && (
            <div className="biz-done-block">
              <div className="biz-done-block-label">Brand values</div>
              <div className="biz-done-tags">
                {values.map((v) => <span key={v} className="biz-done-tag">{v}</span>)}
              </div>
              {differentiator && (
                <div className="biz-done-differentiator">"{differentiator}"</div>
              )}
            </div>
          )}

          {/* Color palette */}
          {generatedPalette.length > 0 && (
            <div className="biz-done-block">
              <div className="biz-done-block-label">Color palette</div>
              <div className="biz-done-swatches">
                {generatedPalette.slice(0, 5).map((hex, i) => (
                  <div key={i} className="biz-done-swatch" style={{ background: hex }} title={hex}>
                    <span className="biz-done-swatch-hex">{hex.toUpperCase()}</span>
                    <span className="biz-done-swatch-role">{PALETTE_ROLES[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typography */}
          {fontPair && (
            <div className="biz-done-block">
              <div className="biz-done-block-label">Typography</div>
              <div className="biz-done-type">
                <div className="biz-done-type-display" style={{ fontFamily: fontPair.display }}>
                  {fontPair.display}
                </div>
                <div className="biz-done-type-body" style={{ fontFamily: fontPair.body }}>
                  {fontPair.body} · Body
                </div>
              </div>
            </div>
          )}

          {/* Brand images */}
          {brandImages.length > 0 && (
            <div className="biz-done-block">
              <div className="biz-done-block-label">Brand images</div>
              <div className="biz-done-images">
                {brandImages.slice(0, 6).map((img) => (
                  <div key={img.id} className="biz-done-img-thumb">
                    <img src={img.dataUrl} alt={img.name} />
                    <span className="biz-done-img-cat">{img.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Next steps */}
        <div className="biz-done-next">
          <div className="biz-done-actions">
            <button className="btn ghost sm" onClick={onDone}>
              Explore my brand kit
            </button>
            <button className="btn primary" onClick={onCreateTheme}>
              Create brand theme →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
