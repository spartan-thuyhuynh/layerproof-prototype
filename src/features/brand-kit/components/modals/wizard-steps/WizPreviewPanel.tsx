import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'

const PALETTE_ROLES = ['Primary', 'Accent', 'Light', 'Surface', 'Ground']

export function WizPreviewPanel() {
  const {
    name, industry, tagline, values, differentiator,
    audienceAgeMin, audienceAgeMax, audienceGender, audienceLocations,
    brandImages,
    generatedPalette, generatedFontPairs, selectedFontIndex,
    generatedLogos, selectedLogoId, useCases,
  } = useWizardStore()

  const hasName = !!name.trim()
  const hasIndustry = !!industry
  const hasTagline = !!tagline.trim()
  const hasValues = values.length > 0
  const hasPalette = generatedPalette.length > 0
  const hasFonts = generatedFontPairs.length > 0
  const fontPair = generatedFontPairs[selectedFontIndex] ?? generatedFontPairs[0]
  const selectedLogo = generatedLogos.find((l) => l.id === selectedLogoId) ?? generatedLogos[0]
  const hasLogo = !!selectedLogo
  const primaryColor = generatedPalette[0] ?? '#333'

  return (
    <div className="biz-preview">
      <div className="biz-preview-label">Preview</div>
      <div className="biz-pv-scroll">

        {/* Identity hero — name + industry (always shown) + tagline */}
        <div className="biz-pv-hero">
          <div className="biz-pv-hero-info">
            <div className={`biz-pv-hero-name${hasName ? '' : ' placeholder'}`}>
              {hasName ? name.trim() : 'Brand name'}
            </div>
            {hasIndustry && <div className="biz-pv-hero-industry">{industry}</div>}
            {hasTagline && <div className="biz-pv-hero-tagline">{tagline}</div>}
          </div>
        </div>

        {/* Group — Brand values */}
        <div className="biz-pv-group">
          <div className="biz-pv-group-title">Brand values</div>
          <div className="biz-pv-block">
            {hasValues ? (
              <>
                <div className="biz-pv-values">
                  {values.map((v) => (
                    <span key={v} className="biz-pv-value-tag">{v}</span>
                  ))}
                </div>
                {differentiator.trim() && (
                  <div className="biz-pv-differentiator">"{differentiator}"</div>
                )}
              </>
            ) : (
              <>
                <div className="biz-pv-ph-row">
                  <div className="biz-pv-ph biz-pv-ph--chip" />
                  <div className="biz-pv-ph biz-pv-ph--chip" style={{ width: 64 }} />
                  <div className="biz-pv-ph biz-pv-ph--chip" style={{ width: 72 }} />
                </div>
                <div className="biz-pv-ph-hint">Added in Brand Values step</div>
              </>
            )}
          </div>
        </div>

        {/* Group — Audience */}
        <div className="biz-pv-group">
          <div className="biz-pv-group-title">Audience</div>
          <div className="biz-pv-block">
            <div className="biz-pv-audience">
              <div className="biz-pv-audience-row">
                <span className="biz-pv-audience-key">Age</span>
                <span className="biz-pv-audience-val">{audienceAgeMin}–{audienceAgeMax}</span>
              </div>
              <div className="biz-pv-audience-row">
                <span className="biz-pv-audience-key">Gender</span>
                <span className="biz-pv-audience-val">{audienceGender}</span>
              </div>
              {audienceLocations.length > 0 && (
                <div className="biz-pv-audience-row">
                  <span className="biz-pv-audience-key">Geography</span>
                  <span className="biz-pv-audience-val">{audienceLocations.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Group — Brand images (only once uploaded) */}
        {brandImages.length > 0 && (
          <div className="biz-pv-group">
            <div className="biz-pv-group-title">Brand images</div>
            <div className="biz-pv-block">
              <div className="biz-pv-images">
                {brandImages.slice(0, 6).map((img) => (
                  <div key={img.id} className="biz-pv-img-thumb">
                    <img src={img.dataUrl} alt={img.name} />
                    <span className="biz-pv-img-cat">{img.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Group — Visual identity: logo, variants, palette, typography */}
        <div className="biz-pv-group">
          <div className="biz-pv-group-title">Visual identity</div>

          <div className="biz-pv-block">
            <div className="biz-pv-block-label">Logo</div>
            {hasLogo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="biz-pv-logo-primary"
                  style={{ background: hasPalette ? primaryColor : 'var(--card)' }}
                >
                  <div className="biz-pv-logo-primary-svg" dangerouslySetInnerHTML={{ __html: selectedLogo.svg }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{name || 'Brand'}</div>
                  {industry && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{industry}</div>}
                </div>
              </div>
            ) : (
              <div className="biz-pv-logo-ph">
                <div className="biz-pv-hero-initials">
                  {hasName ? name.trim().slice(0, 2).toUpperCase() : '✦'}
                </div>
                <div className="biz-pv-ph-hint">Generated after logo step</div>
              </div>
            )}
          </div>

          <div className="biz-pv-block">
            <div className="biz-pv-block-label">Logo variants</div>
            {useCases.length > 0 ? (
              <div className="biz-pv-variants">
                {useCases.map((uc) => (
                  <div
                    key={uc.id}
                    className="biz-pv-variant"
                    style={{
                      background: uc.background === 'dark' ? '#0A0A0A'
                        : uc.background === 'light' ? '#FFFFFF'
                        : primaryColor,
                    }}
                  >
                    <div className="biz-pv-variant-svg" dangerouslySetInnerHTML={{ __html: uc.svg }} />
                    <div
                      className="biz-pv-variant-label"
                      style={{ color: uc.background === 'light' ? '#555' : 'rgba(255,255,255,0.6)' }}
                    >
                      {uc.background === 'dark' ? 'Dark' : uc.background === 'light' ? 'Light' : 'Brand'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="biz-pv-variants">
                  {[{ label: 'Dark', bg: '#1a1a1a' }, { label: 'Light', bg: '#f0f0f0' }, { label: 'Brand', bg: hasPalette ? primaryColor : '#444' }].map(({ label, bg }) => (
                    <div key={label} className="biz-pv-variant" style={{ background: bg, opacity: 0.35 }}>
                      <div className="biz-pv-ph" style={{ width: 28, height: 28, borderRadius: 5, background: 'rgba(255,255,255,0.2)' }} />
                      <div className="biz-pv-variant-label" style={{ color: label === 'Light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div className="biz-pv-ph-hint">Generated after processing</div>
              </>
            )}
          </div>

          <div className="biz-pv-block">
            <div className="biz-pv-block-label">Color palette</div>
            {hasPalette ? (
              <div className="biz-pv-palette-grid">
                {generatedPalette.slice(0, 5).map((hex, i) => (
                  <div key={i} className="biz-pv-palette-cell">
                    <div className="biz-pv-palette-swatch" style={{ background: hex }} />
                    <div className="biz-pv-palette-role">{PALETTE_ROLES[i]}</div>
                    <div className="biz-pv-palette-hex">{hex.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="biz-pv-palette-grid">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="biz-pv-palette-cell">
                      <div className="biz-pv-palette-swatch biz-pv-ph" />
                      <div className="biz-pv-ph" style={{ height: 8, width: 36, borderRadius: 3, marginTop: 4 }} />
                    </div>
                  ))}
                </div>
                <div className="biz-pv-ph-hint">Generated after logo step</div>
              </>
            )}
          </div>

          <div className="biz-pv-block">
            <div className="biz-pv-block-label">Typography</div>
            {hasFonts ? (
              <div className="biz-pv-type-specimen">
                <div className="biz-pv-type-display" style={{ fontFamily: fontPair?.display }}>
                  Aa Bb Cc
                </div>
                <div className="biz-pv-type-sample" style={{ fontFamily: fontPair?.body }}>
                  The quick brown fox jumps over the lazy dog.
                </div>
                <div className="biz-pv-type-meta">
                  <span className="biz-pv-type-tag">{fontPair?.display}</span>
                  <span className="biz-pv-type-sep">+</span>
                  <span className="biz-pv-type-tag">{fontPair?.body}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="biz-pv-ph" style={{ height: 28, width: '60%', borderRadius: 4, marginBottom: 6 }} />
                <div className="biz-pv-ph" style={{ height: 10, width: '90%', borderRadius: 3, marginBottom: 4 }} />
                <div className="biz-pv-ph" style={{ height: 10, width: '70%', borderRadius: 3 }} />
                <div className="biz-pv-ph-hint" style={{ marginTop: 8 }}>Generated after logo step</div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
