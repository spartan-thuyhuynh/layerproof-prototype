import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, X } from 'lucide-react'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import {
  type ThemeOption,
  SYSTEM_THEMES,
  STANDALONE_THEMES,
  makeBrandKitThemes,
} from '../themes'

/* ── Constants ─────────────────────────────────────────────────── */
export const TEXT_AMOUNT_OPTIONS = [
  { id: 'minimal',  label: 'Minimal',  desc: 'Short captions, hooks only.' },
  { id: 'concise',  label: 'Concise',  desc: 'Balanced, punchy copy.' },
  { id: 'detailed', label: 'Detailed', desc: 'Paragraph-style detail.' },
]

const THEME_CATEGORIES: Record<string, string[]> = {
  General:   SYSTEM_THEMES.map(t => t.id),
  Academic:  ['clean-light', 'slate', 'minimal-dark', 'ocean'],
  Business:  ['slate', 'clean-light', 'minimal-dark', 'ocean'],
  Marketing: ['bold-gradient', 'rose-gold', 'neon-accent', 'warm-terra'],
  Strategy:  ['slate', 'minimal-dark', 'ocean', 'clean-light'],
  Work:      ['clean-light', 'slate', 'minimal-dark', 'ocean'],
  Education: ['clean-light', 'forest', 'ocean', 'slate'],
}

/* ── ThemePreview ───────────────────────────────────────────────── */
export function ThemePreview({ colors }: { colors: string[] }) {
  const [c0, c1, c2] = colors
  const bg  = c0 ?? '#0a0a0a'
  const txt = c1 ?? '#e4e4e7'
  const acc = c2 ?? c1 ?? '#fbbf24'

  return (
    <div className="ac2-theme-preview" style={{ background: bg }}>
      <div className="ac2-tp-top">
        <div className="ac2-tp-tag" style={{ background: acc, opacity: .9 }} />
        <div className="ac2-tp-tag" style={{ background: txt, opacity: .25, width: 24 }} />
      </div>
      <div className="ac2-tp-headline" style={{ background: acc }} />
      <div className="ac2-tp-headline" style={{ background: acc, width: '65%', opacity: .7, marginTop: 4 }} />
      <div className="ac2-tp-body-lines">
        <div className="ac2-tp-line" style={{ background: txt, opacity: .35 }} />
        <div className="ac2-tp-line" style={{ background: txt, opacity: .25, width: '80%' }} />
      </div>
      <div className="ac2-tp-cta" style={{ background: acc }} />
    </div>
  )
}

/* ── Props ──────────────────────────────────────────────────────── */
export interface LookAndFeelModalProps {
  selected: string
  onSelect: (theme: ThemeOption) => void
  onClose: () => void
  spectrumValues: Record<string, number>
  onSpectrumChange: (key: string, v: number) => void
  textAmount: string
  onTextAmountChange: (v: string) => void
  brandPersonality: string[]
  onBrandPersonalityChange: (v: string[]) => void
  wordsToAvoid: string[]
  onWordsToAvoidChange: (v: string[]) => void
  customInstruction: string
  onCustomInstructionChange: (v: string) => void
  onOpenBrandKit?: () => void
}

/* ── Component ──────────────────────────────────────────────────── */
export function LookAndFeelModal({
  selected, onSelect, onClose,
  spectrumValues, onSpectrumChange,
  textAmount, onTextAmountChange,
  brandPersonality, onBrandPersonalityChange,
  wordsToAvoid, onWordsToAvoidChange,
  customInstruction, onCustomInstructionChange,
  onOpenBrandKit,
}: LookAndFeelModalProps) {
  const { kits } = useBrandStore()
  const [tab, setTab] = useState<'system' | 'yours'>('yours')
  const [autofillKit, setAutofillKit] = useState<string | null>(null)
  const [kitExpanded, setKitExpanded] = useState(false)
  const [themeSearch, setThemeSearch] = useState('')
  const [themeCategory, setThemeCategory] = useState('General')
  const brandThemes: ThemeOption[] = kits.flatMap(kit => makeBrandKitThemes(kit))

  const themeCats = Object.keys(THEME_CATEGORIES)
  const sq = themeSearch.toLowerCase().trim()
  const catIds = THEME_CATEGORIES[themeCategory] ?? SYSTEM_THEMES.map(t => t.id)
  const filteredSystemThemes = SYSTEM_THEMES.filter(t => {
    const inCat = catIds.includes(t.id)
    const inSearch = !sq || t.name.toLowerCase().includes(sq)
    return inCat && inSearch
  })

  function getKitForTheme(theme: ThemeOption) {
    if (theme.section !== 'brand') return null
    const match = theme.id.match(/^brand-(.+)-(?:primary|dark|minimal|light)$/)
    if (!match) return null
    return kits.find(k => k.id === match[1]) ?? null
  }

  function handleThemeSelect(theme: ThemeOption) {
    onSelect(theme)
    const kit = getKitForTheme(theme)
    if (!kit) { setAutofillKit(null); return }
    const tone = kit.tone
    if (tone?.textDensity) onTextAmountChange(tone.textDensity)
    if (tone?.attrs?.length) onBrandPersonalityChange(tone.attrs.map(a => a.t).filter(Boolean))
    if (tone?.avoid?.length) onWordsToAvoidChange(tone.avoid.slice(0, 6))
    if (tone?.customInstruction) onCustomInstructionChange(tone.customInstruction)
    setAutofillKit(kit.name)
  }

  function ThemeCard({ theme }: { theme: ThemeOption }) {
    const isSelected = selected === theme.id
    return (
      <button
        className={`ac2-theme-card${isSelected ? ' selected' : ''}`}
        onClick={() => handleThemeSelect(theme)}
      >
        <div className="ac2-theme-card-preview-wrap">
          <ThemePreview colors={theme.colors} />
          {!isSelected && <span className="ac2-theme-preview-btn">Preview</span>}
        </div>
        <div className="ac2-theme-card-name">{theme.name}</div>
        {theme.sub && <div className="ac2-theme-card-sub">{theme.sub}</div>}
      </button>
    )
  }

  return (
    <div className="ac2-theme-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ac2-laf-modal">
        {/* Header */}
        <div className="ac2-theme-modal-header">
          <span className="ac2-theme-modal-title">Look &amp; Feel</span>
          <button className="ac2-theme-modal-close" onClick={onClose}><X size={13} /></button>
        </div>

        <div className="ac2-laf-body">
          {/* ── Left: Theme selection ── */}
          <div className="ac2-laf-left">
            <div className="ac2-laf-search-wrap">
              <svg className="ac2-laf-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="ac2-laf-search"
                placeholder="Search themes…"
                value={themeSearch}
                onChange={e => setThemeSearch(e.target.value)}
              />
              {themeSearch && (
                <button className="ac2-laf-search-clear" onClick={() => setThemeSearch('')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <div className="ac2-theme-tabs" style={{ padding: '0 0 4px', background: 'none', border: 'none' }}>
              <button className={`ac2-theme-tab${tab === 'yours' ? ' active' : ''}`} onClick={() => setTab('yours')}>Your themes</button>
              <button className={`ac2-theme-tab${tab === 'system' ? ' active' : ''}`} onClick={() => setTab('system')}>System</button>
            </div>

            <div className="ac2-laf-theme-scroll">
              {tab === 'system' && (
                <>
                  {!themeSearch && (
                    <div className="ac2-laf-cats">
                      {themeCats.map(c => (
                        <button
                          key={c}
                          className={`ac2-laf-cat${themeCategory === c ? ' active' : ''}`}
                          onClick={() => setThemeCategory(c)}
                        >{c}</button>
                      ))}
                    </div>
                  )}
                  {filteredSystemThemes.length > 0 ? (
                    <div className="ac2-theme-grid">
                      {filteredSystemThemes.map(t => <ThemeCard key={t.id} theme={t} />)}
                    </div>
                  ) : (
                    <div className="ac2-laf-empty">No themes match "{themeSearch}"</div>
                  )}
                </>
              )}
              {tab === 'yours' && (
                <>
                  {kits.map(kit => {
                    const themes = makeBrandKitThemes(kit)
                    if (!themes.length) return null
                    return (
                      <div key={kit.id} className="ac2-theme-subsection">
                        <div className="ac2-theme-subsection-label">
                          <div className="ac2-theme-kit-logo" style={kit.symbolSrc ? { background: 'rgba(255,255,255,.08)' } : (kit.logoStyle as React.CSSProperties)}>
                            {kit.symbolSrc
                              ? <img src={kit.symbolSrc} alt={kit.name} style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
                              : kit.logoText}
                          </div>
                          {kit.name}
                        </div>
                        <div className="ac2-theme-grid">
                          {themes.map(t => <ThemeCard key={t.id} theme={t} />)}
                        </div>
                      </div>
                    )
                  })}
                  <div className="ac2-theme-subsection">
                    <div className="ac2-theme-subsection-label ac2-theme-subsection-label--custom">Custom themes</div>
                    <div className="ac2-theme-grid">
                      {STANDALONE_THEMES.map(t => <ThemeCard key={t.id} theme={t} />)}
                    </div>
                  </div>
                  {kits.length === 0 && (
                    <p style={{ fontSize: 13, color: 'var(--t3)' }}>No brand kits yet.</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Right: Voice & Writing ── */}
          <div className="ac2-laf-right">
            {/* Selected theme preview */}
            {(() => {
              const allThemes = [...SYSTEM_THEMES, ...STANDALONE_THEMES, ...brandThemes]
              const t = allThemes.find(th => th.id === selected)
              if (!t) return null
              const kit = getKitForTheme(t)

              const swatches: string[] = kit
                ? kit.colors.palettes.flatMap(p => p.colors.map(c => c.hex)).slice(0, 8)
                : []
              const displayFont = kit?.type?.display?.family ?? null
              const bodyFont = kit?.type?.body?.family ?? null
              const traits = kit?.tone?.attrs?.slice(0, 4).map(a => a.t).filter(Boolean) ?? []

              if (kit) {
                return (
                  <div className="ac2-laf-selected-theme">
                    <div className="ac2-laf-brand-connected">
                      <div className="ac2-laf-selected-top">
                        <div className="ac2-laf-selected-preview">
                          <ThemePreview colors={t.colors} />
                        </div>
                        <div className="ac2-laf-selected-info">
                          <div className="ac2-laf-selected-label">Selected theme</div>
                          <div className="ac2-laf-selected-name">{t.name}</div>
                        </div>
                      </div>

                      <div className="ac2-laf-brand-kit-wrap">
                        <button className="ac2-laf-brand-kit-card" onClick={() => setKitExpanded(v => !v)}>
                          <div className="ac2-laf-brand-kit-card-logo" style={kit.symbolSrc ? { background: 'rgba(255,255,255,.06)' } : kit.logoStyle}>
                            {kit.symbolSrc
                              ? <img src={kit.symbolSrc} alt={kit.name} style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
                              : kit.logoText}
                          </div>
                          <div className="ac2-laf-brand-kit-card-left">
                            <div className="ac2-laf-brand-kit-card-label">Brand Kit</div>
                            <div className="ac2-laf-brand-kit-card-name">{kit.name}</div>
                          </div>
                          <ChevronDown size={14} strokeWidth={2} className={`ac2-laf-kit-chevron${kitExpanded ? ' open' : ''}`} />
                        </button>

                        {kitExpanded && (
                          <div className="ac2-laf-kit-details">
                            {swatches.length > 0 && (
                              <div className="ac2-laf-kit-detail-row">
                                <span className="ac2-laf-kit-detail-label">Colors</span>
                                <div className="ac2-laf-brand-swatches">
                                  {swatches.map((hex, i) => (
                                    <span key={i} className="ac2-laf-brand-swatch" style={{ background: hex }} title={hex} />
                                  ))}
                                </div>
                              </div>
                            )}
                            {(displayFont || bodyFont) && (
                              <div className="ac2-laf-kit-detail-row">
                                <span className="ac2-laf-kit-detail-label">Fonts</span>
                                <span className="ac2-laf-kit-detail-value">{[displayFont, bodyFont].filter(Boolean).join(' · ')}</span>
                              </div>
                            )}
                            {traits.length > 0 && (
                              <div className="ac2-laf-kit-detail-row">
                                <span className="ac2-laf-kit-detail-label">Tone</span>
                                <span className="ac2-laf-kit-detail-value">{traits.join(', ')}</span>
                              </div>
                            )}
                            {kit.imagery?.assets && kit.imagery.assets.length > 0 && (
                              <div className="ac2-laf-kit-detail-row ac2-laf-kit-detail-row--assets">
                                <span className="ac2-laf-kit-detail-label">Images</span>
                                <div className="ac2-laf-kit-grid">
                                  {kit.imagery.assets.slice(0, 4).map((asset, i) => (
                                    <div key={i} className="ac2-laf-kit-sq" style={{ background: asset.preview ?? 'rgba(255,255,255,.08)' }} title={asset.name} />
                                  ))}
                                  {kit.imagery.assets.length > 4 && (
                                    <div className="ac2-laf-kit-sq ac2-laf-kit-sq--more">+{kit.imagery.assets.length - 4}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div className="ac2-laf-selected-theme">
                  <div className="ac2-laf-selected-top">
                    <div className="ac2-laf-selected-preview">
                      <ThemePreview colors={t.colors} />
                    </div>
                    <div className="ac2-laf-selected-info">
                      <div className="ac2-laf-selected-label">Selected theme</div>
                      <div className="ac2-laf-selected-name">{t.name}</div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Brand tone autofill banner */}
            {autofillKit && (
              <div className="ac2-laf-autofill-banner">
                <div className="ac2-laf-autofill-banner-left">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  <span>Settings pre-filled from <strong>{autofillKit}</strong> brand tone</span>
                </div>
                <button className="ac2-laf-autofill-dismiss" onClick={() => setAutofillKit(null)}>✕</button>
              </div>
            )}

            {/* Amount of text */}
            <div className="ac2-laf-section-title">Amount of text</div>
            <div className="ac2-laf-text-grid">
              {TEXT_AMOUNT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`ac2-laf-text-card${textAmount === opt.id ? ' active' : ''}`}
                  onClick={() => onTextAmountChange(opt.id)}
                >
                  <div className="ac2-laf-text-label">{opt.label}</div>
                  <div className="ac2-laf-text-desc">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="ac2-laf-divider" />

            {/* Brand personality */}
            <div className="ac2-laf-section-title">Personalities</div>
            <div className="ac2-laf-personality-wrap">
              {brandPersonality.map((trait, i) => (
                <span key={i} className="ac2-laf-trait-chip">
                  {trait}
                  <button
                    className="ac2-laf-trait-remove"
                    onClick={() => onBrandPersonalityChange(brandPersonality.filter((_, j) => j !== i))}
                  >✕</button>
                </span>
              ))}
              <input
                className="ac2-laf-trait-input"
                placeholder="Add trait…"
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                    e.preventDefault()
                    const val = e.currentTarget.value.trim()
                    if (!brandPersonality.includes(val)) onBrandPersonalityChange([...brandPersonality, val])
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>

            <div className="ac2-laf-divider" />

            {/* Words to avoid */}
            <div className="ac2-laf-section-title">Words to avoid</div>
            <div className="ac2-laf-personality-wrap">
              {wordsToAvoid.map((word, i) => (
                <span key={i} className="ac2-laf-trait-chip">
                  {word}
                  <button className="ac2-laf-trait-remove" onClick={() => onWordsToAvoidChange(wordsToAvoid.filter((_, j) => j !== i))}>×</button>
                </span>
              ))}
              <input
                className="ac2-laf-trait-input"
                placeholder={wordsToAvoid.length === 0 ? 'e.g. leveraging, synergy…' : 'Add word…'}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    const val = e.currentTarget.value.trim().replace(/,$/, '')
                    if (val) { onWordsToAvoidChange([...wordsToAvoid, val]); e.currentTarget.value = '' }
                  }
                }}
              />
            </div>

            {/* Custom instruction */}
            <div className="ac2-laf-section-title" style={{ marginTop: 14 }}>Custom instruction</div>
            <textarea
              className="ac2-laf-input ac2-laf-textarea"
              placeholder="Describe the desired tone, personality, or style…"
              rows={3}
              value={customInstruction}
              onChange={e => onCustomInstructionChange(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="ac2-laf-footer">
          <button className="ac2-laf-apply" onClick={onClose}>Apply changes</button>
        </div>
      </div>
    </div>
  )
}
