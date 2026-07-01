import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'
import { type ThemeOption, SYSTEM_THEMES, STANDALONE_THEMES, makeBrandKitThemes } from '../themes'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { Portal } from '@/shared/lib/Portal'

const AI_MODELS = [
  { id: 'auto',   label: 'Auto',            desc: 'Best model selected automatically' },
  { id: 'sonnet', label: 'Claude Sonnet',   desc: 'Fast & balanced' },
  { id: 'opus',   label: 'Claude Opus',     desc: 'Most capable' },
  { id: 'haiku',  label: 'Claude Haiku',    desc: 'Fastest & lightweight' },
]

function ModelSelector({ onOpen }: { onOpen?: () => void }) {
  const [open, setOpen]   = useState(false)
  const [model, setModel] = useState(AI_MODELS[0])
  const ref               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="cp-model-btn"
        onClick={() => { setOpen(v => !v); if (!open) onOpen?.() }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        AI Model · {model.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="cp-model-dropdown">
          {AI_MODELS.map(m => (
            <button
              key={m.id}
              className={`cp-model-option${m.id === model.id ? ' active' : ''}`}
              onClick={() => { setModel(m); setOpen(false) }}
            >
              <div className="cp-model-option-label">{m.label}</div>
              <div className="cp-model-option-desc">{m.desc}</div>
              {m.id === model.id && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const THEME_SLUGS = new Set(['social-post', 'presentation'])

/* Gradient banks (same as ThemeDetailModal) */
const G0 = ['linear-gradient(160deg,#ec4899,#ffde42)', 'linear-gradient(160deg,#3b82f6,#8b5cf6)', 'linear-gradient(160deg,#14b8a6,#22d3ee)', 'linear-gradient(160deg,#f97316,#ec4899)', 'linear-gradient(160deg,#22c55e,#14b8a6)']
const G1 = ['linear-gradient(135deg,#ffde42 0%,#0a0a0a 65%)', 'linear-gradient(135deg,#8b5cf6 0%,#0b1220 65%)', 'linear-gradient(135deg,#22d3ee 0%,#0b1220 65%)', 'linear-gradient(135deg,#ec4899 0%,#1a0010 65%)', 'linear-gradient(135deg,#22c55e 0%,#0a1a0a 65%)']
const G2 = ['linear-gradient(135deg,#0a0a0a 35%,#ec4899)', 'linear-gradient(135deg,#0b1220 35%,#3b82f6)', 'linear-gradient(135deg,#0b1220 35%,#14b8a6)', 'linear-gradient(135deg,#1a0010 35%,#f97316)', 'linear-gradient(135deg,#0a1a0a 35%,#22c55e)']
function pickG(id: string, bank: string[]) {
  return bank[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % bank.length]
}

function ThemePreview({ colors }: { colors: string[] }) {
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

/* Preview modal — mirrors ThemeDetailModal layout */
function ThemePreviewModal({ theme, onClose, onSelect }: { theme: ThemeOption; onClose: () => void; onSelect: () => void }) {
  const g0 = pickG(theme.id, G0)
  const g1 = pickG(theme.id + '1', G1)
  const g2 = pickG(theme.id + '2', G2)
  const previews = [{ g: g0, label: 'Preview' }, { g: g1, label: 'Social' }, { g: g2, label: 'Campaign' }]
  return (
    <Portal>
      <div className="scrim" onClick={onClose}>
        <div className="modal wide" style={{ width: 'min(90vw,1000px)', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'row', height: 'clamp(460px,70vh,640px)', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
          {/* Left: gradient previews */}
          <div style={{ width: '38%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, padding: 10, background: '#0a0a0a' }}>
            {previews.map((p, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 10, overflow: 'hidden', position: 'relative', background: p.g }}>
                <div style={{ position: 'absolute', bottom: 7, left: 9, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{p.label}</div>
                <div style={{ position: 'absolute', bottom: 7, right: 9, background: 'rgba(0,0,0,.4)', borderRadius: 3, padding: '1px 5px', fontSize: 8, color: 'rgba(255,255,255,.4)' }}>{i + 1}</div>
              </div>
            ))}
          </div>
          {/* Right: info + prompt */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--card)', minWidth: 0 }}>
            <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="h-eyebrow" style={{ marginBottom: 4 }}>{theme.section === 'brand' ? 'Brand Theme' : 'System Theme'}</div>
                <h2 className="h2" style={{ margin: 0, fontSize: 20 }}>{theme.name}</h2>
              </div>
              <button className="x" onClick={onClose} style={{ marginLeft: 12, flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ flex: 1, padding: '16px 22px 0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--t3)', marginBottom: 10 }}>Theme Prompt</div>
              <div style={{ flex: 1, overflowY: 'auto', background: '#0d0d0d', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: 1.7, color: 'var(--t2)', whiteSpace: 'pre-wrap' }}>
                {theme.prompt || 'A curated theme with carefully selected colors and typography.'}
              </div>
            </div>
            <div style={{ padding: '14px 22px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn primary" onClick={() => { onSelect(); onClose() }}>Select this theme</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

/* Voice spectrum — self-contained, 4 dimensions */
const SPECTRUM_AXES = [
  { key: 'formality',  left: 'Formal',        right: 'Casual',       stops: [
    { label: 'Formal',          desc: 'Structured and professional.' },
    { label: 'Slightly formal', desc: 'Polished but approachable.' },
    { label: 'Neutral',         desc: 'Balanced, neither stiff nor loose.' },
    { label: 'Slightly casual', desc: 'Relaxed and conversational.' },
    { label: 'Casual',          desc: 'Informal and easy-going.' },
  ]},
  { key: 'humor',      left: 'Serious',        right: 'Funny',        stops: [
    { label: 'Serious',        desc: 'Straightforward, no jokes.' },
    { label: 'Mostly serious', desc: 'Focused with occasional warmth.' },
    { label: 'Balanced',       desc: 'Mix of purpose and personality.' },
    { label: 'Light-hearted',  desc: 'Friendly and a little playful.' },
    { label: 'Funny',          desc: 'Humor-forward and entertaining.' },
  ]},
  { key: 'respect',    left: 'Respectful',     right: 'Irreverent',   stops: [
    { label: 'Respectful',  desc: 'Deferential and polite.' },
    { label: 'Polite',      desc: 'Courteous and considerate.' },
    { label: 'Neutral',     desc: 'Neither reverent nor provocative.' },
    { label: 'Edgy',        desc: 'Bold and a little provocative.' },
    { label: 'Irreverent',  desc: 'Challenges norms and expectations.' },
  ]},
  { key: 'enthusiasm', left: 'Matter-of-fact', right: 'Enthusiastic', stops: [
    { label: 'Direct',       desc: 'Clear and no-frills.' },
    { label: 'Measured',     desc: 'Composed and deliberate.' },
    { label: 'Balanced',     desc: 'Even energy, neither flat nor hyped.' },
    { label: 'Energetic',    desc: 'Upbeat and motivating.' },
    { label: 'Enthusiastic', desc: 'Excited and expressive.' },
  ]},
]

function VoiceSpectrumPanel({ values, onChange }: { values: Record<string, number>; onChange: (key: string, v: number) => void }) {
  return (
    <div className="cp-spectrum">
      <div className="cp-themes-label" style={{ marginBottom: 14 }}>Voice spectrum</div>
      {SPECTRUM_AXES.map(ax => {
        const val = values[ax.key] ?? 2
        const active = ax.stops[val] ?? ax.stops[2]
        const pct = (val / (ax.stops.length - 1)) * 100
        return (
          <div key={ax.key} className="cp-spectrum-axis">
            <div className="cp-spectrum-row">
              <span className="cp-spectrum-pole">{ax.left}</span>
              <div className="cp-spectrum-track-wrap">
                <div className="cp-spectrum-track" />
                <div className="cp-spectrum-fill" style={{ width: `${pct}%` }} />
                {ax.stops.map((_, i) => (
                  <button
                    key={i}
                    className={`cp-spectrum-anchor${i === val ? ' active' : ''}`}
                    style={{ left: `${(i / (ax.stops.length - 1)) * 100}%` }}
                    onClick={() => onChange(ax.key, i)}
                  />
                ))}
                <input
                  type="range"
                  className="cp-spectrum-range"
                  min={0}
                  max={ax.stops.length - 1}
                  step={1}
                  value={val}
                  onChange={e => onChange(ax.key, Number(e.target.value))}
                />
              </div>
              <span className="cp-spectrum-pole cp-spectrum-pole--right">{ax.right}</span>
            </div>
            <div className="cp-spectrum-active-desc">
              <span className="cp-spectrum-active-label">{active.label}</span>
              <span className="cp-spectrum-active-dot">·</span>
              <span>{active.desc}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}


function ThemeCardInner({ t, onPreview }: { t: ThemeOption; onPreview?: (e: React.MouseEvent) => void }) {
  return (
    <>
      <div className="cp-theme-preview-wrap">
        <ThemePreview colors={t.colors} />
        {onPreview && (
          <div className="cp-theme-preview-btn" role="button" tabIndex={0} onClick={onPreview} onKeyDown={e => e.key === 'Enter' && onPreview(e as any)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Preview
          </div>
        )}
      </div>
      <div className="cp-theme-card-name">{t.name}</div>
      {t.sub && <div className="cp-theme-card-sub">{t.sub}</div>}
    </>
  )
}

const TEXT_AMOUNT_OPTIONS = [
  {
    id: 'minimal', label: 'Minimal', desc: 'Focus on visuals over text.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><line x1="14" y1="6" x2="21" y2="6"/><line x1="14" y1="9" x2="18" y2="9"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="17" x2="21" y2="17"/><line x1="14" y1="20" x2="18" y2="20"/>
      </svg>
    ),
  },
  {
    id: 'concise', label: 'Concise', desc: 'Combine visuals with text.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    ),
  },
  {
    id: 'detailed', label: 'Detailed', desc: 'Use concise paragraph to explain.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="5" x2="21" y2="5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="13" x2="21" y2="13"/><line x1="3" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
]

function ToneConfigExtras({
  textAmount, onTextAmountChange,
  brandPersonality, onBrandPersonalityChange,
  wordsToAvoid, onWordsToAvoidChange,
  customInstruction, onCustomInstructionChange,
  autofillKitName, onDismissAutofill,
}: {
  textAmount: string
  onTextAmountChange: (v: string) => void
  brandPersonality: string[]
  onBrandPersonalityChange: (v: string[]) => void
  wordsToAvoid: string[]
  onWordsToAvoidChange: (v: string[]) => void
  customInstruction: string
  onCustomInstructionChange: (v: string) => void
  autofillKitName: string | null
  onDismissAutofill: () => void
}) {
  return (
    <div className="cp-tone-extras">

      {/* Brand tone autofill banner */}
      {autofillKitName && (
        <div className="cp-autofill-banner">
          <div className="cp-autofill-banner-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span>Settings pre-filled from <strong>{autofillKitName}</strong> brand tone preset</span>
          </div>
          <button className="cp-autofill-dismiss" onClick={onDismissAutofill}>✕</button>
        </div>
      )}

      {/* Amount of text */}
      <div className="cp-tone-section">
        <div className="cp-tone-section-title">Amount of text</div>
        <div className="cp-tone-section-sub">Adjust the level of detail in the generated content</div>
        <div className="cp-text-amount-grid">
          {TEXT_AMOUNT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`cp-text-amount-card${textAmount === opt.id ? ' active' : ''}`}
              onClick={() => onTextAmountChange(opt.id)}
            >
              <div className="cp-text-amount-icon">{opt.icon}</div>
              <div className="cp-text-amount-label">{opt.label}</div>
              <div className="cp-text-amount-desc">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Brand personality */}
      <div className="cp-tone-section">
        <div className="cp-tone-section-title">Brand personality</div>
        <div className="cp-personality-wrap">
          {brandPersonality.map((trait, i) => (
            <span key={i} className="cp-personality-chip">
              {trait}
              <button
                className="cp-personality-remove"
                onClick={() => onBrandPersonalityChange(brandPersonality.filter((_, j) => j !== i))}
              >✕</button>
            </span>
          ))}
          <input
            className="cp-personality-input"
            placeholder="Add trait…"
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                e.preventDefault()
                const val = e.currentTarget.value.trim()
                if (!brandPersonality.includes(val)) onBrandPersonalityChange([...brandPersonality, val])
                e.currentTarget.value = ''
              }
            }}
          />
        </div>
      </div>

      {/* Words to avoid */}
      <div className="cp-tone-section">
        <div className="cp-tone-section-title">Words to avoid</div>
        <div className="cp-personality-wrap">
          {wordsToAvoid.map((word, i) => (
            <span key={i} className="cp-personality-chip">
              {word}
              <button
                className="cp-personality-remove"
                onClick={() => onWordsToAvoidChange(wordsToAvoid.filter((_, j) => j !== i))}
              >✕</button>
            </span>
          ))}
          <input
            className="cp-personality-input"
            placeholder="Add word…"
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                e.preventDefault()
                const val = e.currentTarget.value.trim()
                if (!wordsToAvoid.includes(val)) onWordsToAvoidChange([...wordsToAvoid, val])
                e.currentTarget.value = ''
              }
            }}
          />
        </div>
      </div>

      {/* Custom instruction */}
      <div className="cp-tone-section">
        <div className="cp-tone-section-title">Custom instruction</div>
        <div className="cp-tone-section-sub">Free-form description of the desired tone, personality, or style.</div>
        <textarea
          className="cp-tone-textarea"
          placeholder="Describe your desired tone…"
          value={customInstruction}
          onChange={e => onCustomInstructionChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}

function getKitForTheme(theme: ThemeOption, kits: BrandKit[]) {
  if (theme.section !== 'brand') return null
  const match = theme.id.match(/^brand-(.+)-(?:primary|dark|minimal|light)$/)
  if (!match) return null
  return kits.find(k => k.id === match[1]) ?? null
}

function synthesizeToneFromKit(kit: BrandKit) {
  const tone = kit.tone
  const textAmount = tone?.textDensity ?? 'concise'
  const wordsToAvoid = tone?.avoid?.slice(0, 8) ?? []

  let customInstruction = ''
  if (tone?.customInstruction) {
    customInstruction = tone.customInstruction
  } else {
    const parts: string[] = []
    if (tone?.on) parts.push(tone.on)
    if (tone?.use?.length) parts.push(`Use language that feels ${tone.use.slice(0, 3).join(', ')}.`)
    if (tone?.off) parts.push(`Avoid a ${tone.off} tone.`)
    if (tone?.attrs?.length) {
      const notable = tone.attrs.filter(a => a.v >= 0.7 || a.v <= 0.3)
      if (notable.length) {
        parts.push(notable.map(a => a.v >= 0.5 ? `Be ${a.t.toLowerCase()}` : `Avoid being ${a.t.toLowerCase()}`).join('. ') + '.')
      }
    }
    customInstruction = parts.join(' ')
  }

  const brandPersonality = tone?.attrs?.map(a => a.t).filter(Boolean) ?? []
  return { textAmount, brandPersonality, wordsToAvoid, customInstruction }
}

function ThemePickerSection({
  slug, selected, onSelect, spectrumValues, onSpectrumChange,
}: {
  slug: string
  selected: ThemeOption | null
  onSelect: (t: ThemeOption | null) => void
  spectrumValues: Record<string, number>
  onSpectrumChange: (key: string, v: number) => void
}) {
  const { kits, appliedId, setAppliedId } = useBrandStore()
  const { newKitId, brandSkipped } = useOnboardingStore()
  const [previewTheme, setPreviewTheme] = useState<ThemeOption | null>(null)
  const [kitMenuOpen, setKitMenuOpen] = useState(false)
  const kitMenuRef = useRef<HTMLDivElement>(null)
  const [themeSearch, setThemeSearch] = useState('')
  const [themeCategory, setThemeCategory] = useState('General')
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const [themeTab, setThemeTab] = useState<'brand' | 'library'>(() => appliedId ? 'brand' : 'library')
  const [themeModalOpen, setThemeModalOpen] = useState(false)
  const [modalSearch, setModalSearch] = useState('')
  const [modalTab, setModalTab] = useState<'brand' | 'library'>('library')

  // Tone config state — lifted here so brand theme autofill can drive them
  const [textAmount, setTextAmount] = useState('concise')
  const [brandPersonality, setBrandPersonality] = useState<string[]>([])
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([])
  const [customInstruction, setCustomInstruction] = useState('')
  const [autofillKitName, setAutofillKitName] = useState<string | null>(null)

  // Autofill when a brand kit theme is selected
  useEffect(() => {
    if (!selected) { setAutofillKitName(null); return }
    const kit = getKitForTheme(selected, kits)
    if (!kit) { setAutofillKitName(null); return }
    const synth = synthesizeToneFromKit(kit)
    setTextAmount(synth.textAmount)
    if (synth.brandPersonality.length) setBrandPersonality(synth.brandPersonality)
    if (synth.wordsToAvoid.length) setWordsToAvoid(synth.wordsToAvoid)
    if (synth.customInstruction) setCustomInstruction(synth.customInstruction)
    setAutofillKitName(kit.name)
  }, [selected?.id])

  useEffect(() => {
    if (!kitMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (kitMenuRef.current && !kitMenuRef.current.contains(e.target as Node)) setKitMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [kitMenuOpen])

  if (!THEME_SLUGS.has(slug)) return null

  // Onboarding kits get a single auto-generated theme; fully configured kits get all variants.
  const activeKitId = appliedId || newKitId || (kits[0]?.id ?? '')
  const appliedKit = kits.find(k => k.id === activeKitId) ?? null
  const allBrandKitThemes: ThemeOption[] = appliedKit
    ? makeBrandKitThemes(appliedKit)
    : (() => {
        const onboardingKit = newKitId ? kits.find(k => k.id === newKitId) : null
        return (!brandSkipped && onboardingKit) ? makeBrandKitThemes(onboardingKit) : []
      })()
  // Inline grid shows 2 for onboarding kits, all for fully configured kits
  const brandThemes: ThemeOption[] = appliedKit
    ? (appliedKit.onboarding ? allBrandKitThemes.slice(0, 2) : allBrandKitThemes)
    : allBrandKitThemes.slice(0, 1)

  /* ── Selected state ── */
  if (selected) {
    return (
      <div className="cp-themes">
        {previewTheme && (
          <ThemePreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} onSelect={() => { onSelect(previewTheme); setPreviewTheme(null) }} />
        )}
        <div className="cp-style-group">
          <div className="cp-selected-theme-box cp-selected-theme-box--active">
            <div className="cp-selected-theme-summary">
              <button className="cp-selected-change" onClick={() => onSelect(null)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Change theme
              </button>
              <div className="cp-selected-theme-row">
                <div className="cp-selected-theme-thumb-sm" onClick={() => setPreviewTheme(selected)}>
                  <ThemePreview colors={selected.colors} />
                  <div className="cp-selected-thumb-preview-btn">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Preview
                  </div>
                </div>
                <div className="cp-selected-theme-info-row">
                  <div className="cp-selected-theme-label">Selected theme</div>
                  <div className="cp-selected-theme-name">{selected.name}</div>
                  {selected.section === 'brand' && (() => {
                    const kitId = selected.id.replace(/^brand-/, '').replace(/-(?:primary|dark|minimal|light|accent)$/, '')
                    const kitName = kits.find(k => k.id === kitId)?.name
                    return kitName ? <div className="cp-selected-theme-kit">{kitName}</div> : null
                  })()}
                </div>
              </div>
            </div>

            <div className="cp-selected-divider" />
            <ToneConfigExtras
              textAmount={textAmount}
              onTextAmountChange={setTextAmount}
              brandPersonality={brandPersonality}
              onBrandPersonalityChange={setBrandPersonality}
              wordsToAvoid={wordsToAvoid}
              onWordsToAvoidChange={setWordsToAvoid}
              customInstruction={customInstruction}
              onCustomInstructionChange={setCustomInstruction}
              autofillKitName={autofillKitName}
              onDismissAutofill={() => setAutofillKitName(null)}
            />
          </div>
        </div>
      </div>
    )
  }

  /* ── Default state ── */
  return (
    <div className="cp-themes">
      {previewTheme && (
        <ThemePreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} onSelect={() => { onSelect(previewTheme); setPreviewTheme(null) }} />
      )}

      <div className="cp-style-group">
        <div className="cp-style-group-header">
          <div className="cp-style-group-label">Choose a theme</div>
          <button className="cp-theme-view-more cp-theme-view-more--header" onClick={() => { setModalTab(brandThemes.length > 0 ? 'brand' : 'library'); setThemeModalOpen(true) }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            View more
          </button>
        </div>

        <div className="cp-theme-tabs-wrap">
          {/* Brand kit themes */}
          {brandThemes.length > 0 && (
            <div className="cp-brand-highlight-card">
              <div className="cp-brand-highlight-header">
                <div ref={kitMenuRef} style={{ position: 'relative' }}>
                  <button className="cp-brand-highlight-title cp-brand-highlight-title--btn" onClick={() => setKitMenuOpen(o => !o)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                    Brand kit · {appliedKit?.name ?? 'Select kit'}
                    <svg viewBox="0 0 12 12" style={{ width: 10, height: 10, flexShrink: 0 }}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </button>
                  {kitMenuOpen && (
                    <div className="cp-kit-switch-menu">
                      {kits.map(k => (
                        <button
                          key={k.id}
                          className={`cp-kit-switch-item${k.id === activeKitId ? ' active' : ''}`}
                          onClick={() => { setAppliedId(k.id); setKitMenuOpen(false) }}
                        >
                          {k.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="cp-themes-grid">
                {brandThemes.map(t => (
                  <button key={t.id} className="cp-theme-card" onClick={() => onSelect(t)}>
                    <ThemeCardInner t={t} onPreview={(e) => { e.stopPropagation(); setPreviewTheme(t) }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Library themes with category filter */}
          {(() => {
            const THEME_CATEGORIES: Record<string, string[]> = {
              General:   SYSTEM_THEMES.map(t => t.id),
              Academic:  ['clean-light','slate','minimal-dark','ocean'],
              Business:  ['slate','clean-light','minimal-dark','ocean'],
              Marketing: ['bold-gradient','rose-gold','neon-accent','warm-terra'],
              Strategy:  ['slate','minimal-dark','ocean','clean-light'],
              Work:      ['clean-light','slate','minimal-dark','ocean'],
              Education: ['clean-light','forest','ocean','slate'],
            }
            const cats = Object.keys(THEME_CATEGORIES)
            const filtered = SYSTEM_THEMES.filter(t => {
              const inCat = THEME_CATEGORIES[themeCategory]?.includes(t.id) ?? true
              const inSearch = !themeSearch.trim() || t.name.toLowerCase().includes(themeSearch.toLowerCase())
              return inCat && inSearch
            })
            const visible = libraryExpanded ? filtered : filtered.slice(0, 4)
            return (
              <div className="cp-theme-library">
                <div className="cp-your-themes-group-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Theme Library
                </div>
                <div className="cp-themes-grid">
                  {visible.map(t => (
                    <button key={t.id} className="cp-theme-card" onClick={() => onSelect(t)}>
                      <ThemeCardInner t={t} onPreview={(e) => { e.stopPropagation(); setPreviewTheme(t) }} />
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="cp-theme-empty">No themes match "{themeSearch}"</div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Theme picker modal */}
        {themeModalOpen && (() => {
          const THEME_CATEGORIES: Record<string, string[]> = {
            General:   SYSTEM_THEMES.map(t => t.id),
            Academic:  ['clean-light','slate','minimal-dark','ocean'],
            Business:  ['slate','clean-light','minimal-dark','ocean'],
            Marketing: ['bold-gradient','rose-gold','neon-accent','warm-terra'],
            Strategy:  ['slate','minimal-dark','ocean','clean-light'],
            Work:      ['clean-light','slate','minimal-dark','ocean'],
            Education: ['clean-light','forest','ocean','slate'],
          }
          const cats = Object.keys(THEME_CATEGORIES)
          const sq = modalSearch.toLowerCase().trim()
          const libraryFiltered = SYSTEM_THEMES.filter(t => !sq || t.name.toLowerCase().includes(sq))
          const kitGroups = kits.map(k => ({
            kit: k,
            themes: makeBrandKitThemes(k).filter(t => !sq || t.name.toLowerCase().includes(sq)),
          })).filter(g => g.themes.length > 0)
          const standaloneFiltered = STANDALONE_THEMES.filter(t => !sq || t.name.toLowerCase().includes(sq))
          const hasYourThemes = kitGroups.length > 0 || standaloneFiltered.length > 0

          const renderThemeBtn = (t: ThemeOption) => (
            <button key={t.id} className={`cp-theme-card${selected?.id === t.id ? ' selected' : ''}`} onClick={() => { onSelect(t); setThemeModalOpen(false) }}>
              <ThemeCardInner t={t} onPreview={(e) => { e.stopPropagation(); setPreviewTheme(t) }} />
            </button>
          )

          return (
            <Portal>
              <div className="cp-theme-modal-overlay" onClick={() => setThemeModalOpen(false)}>
                <div className="cp-theme-modal" onClick={e => e.stopPropagation()}>
                  <div className="cp-theme-modal-header">
                    <div className="cp-theme-modal-search">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="cp-theme-modal-search-icon">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                      </svg>
                      <input
                        className="cp-theme-modal-search-input"
                        placeholder="Search themes…"
                        value={modalSearch}
                        onChange={e => setModalSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="cp-theme-modal-tabs">
                      {hasYourThemes && (
                        <button className={`cp-theme-modal-tab${modalTab === 'brand' ? ' active' : ''}`} onClick={() => setModalTab('brand')}>Your Themes</button>
                      )}
                      <button className={`cp-theme-modal-tab${modalTab === 'library' ? ' active' : ''}`} onClick={() => setModalTab('library')}>Theme Library</button>
                    </div>
                    <button className="cp-theme-modal-close" onClick={() => setThemeModalOpen(false)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  {modalTab === 'library' && (
                    <div className="cp-theme-modal-cats">
                      {cats.map(c => (
                        <button key={c} className={`cp-theme-cat${themeCategory === c ? ' active' : ''}`} onClick={() => setThemeCategory(c)}>{c}</button>
                      ))}
                    </div>
                  )}

                  <div className="cp-theme-modal-body">
                    {modalTab === 'library' ? (
                      <div className="cp-themes-grid cp-themes-grid--modal">
                        {libraryFiltered.map(renderThemeBtn)}
                        {libraryFiltered.length === 0 && <div className="cp-theme-empty">No themes match "{modalSearch}"</div>}
                      </div>
                    ) : (
                      <div className="cp-theme-modal-groups">
                        {kitGroups.map(g => (
                          <div key={g.kit.id} className="cp-theme-modal-group">
                            <div className="cp-theme-modal-group-label">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                              </svg>
                              {g.kit.name}
                            </div>
                            <div className="cp-themes-grid cp-themes-grid--modal">{g.themes.map(renderThemeBtn)}</div>
                          </div>
                        ))}
                        {standaloneFiltered.length > 0 && (
                          <div className="cp-theme-modal-group">
                            <div className="cp-theme-modal-group-label">Custom Themes</div>
                            <div className="cp-themes-grid cp-themes-grid--modal">{standaloneFiltered.map(renderThemeBtn)}</div>
                          </div>
                        )}
                        {kitGroups.length === 0 && standaloneFiltered.length === 0 && (
                          <div className="cp-theme-empty">No themes match "{modalSearch}"</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Portal>
          )
        })()}
      </div>
    </div>
  )
}

interface AttachmentChipsProps { files: File[]; onRemove: (i: number) => void }

function AttachmentChips({ files, onRemove }: AttachmentChipsProps) {
  if (files.length === 0) return null
  return (
    <div className="cp-attach-chips">
      {files.map((file, i) => {
        const isImage = file.type.startsWith('image/')
        const previewUrl = isImage ? URL.createObjectURL(file) : null
        return (
          <div key={i} className="cp-attach-chip">
            {isImage && previewUrl ? (
              <img
                className="cp-attach-chip-thumb"
                src={previewUrl}
                alt={file.name}
                onLoad={() => URL.revokeObjectURL(previewUrl!)}
              />
            ) : (
              <div className="cp-attach-chip-icon">
                <span>{file.name.split('.').pop()?.toUpperCase().slice(0, 4) ?? 'FILE'}</span>
              </div>
            )}
            <span className="cp-attach-chip-name" title={file.name}>
              {file.name.length > 20 ? file.name.slice(0, 17) + '…' : file.name}
            </span>
            <button className="cp-attach-chip-remove" type="button" onClick={() => onRemove(i)}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

interface Props {
  config: ProductConfig
  onSubmit: (prompt: string, theme: ThemeOption | null, tone: string | null, files: File[]) => void
}

const SUGGESTIONS: Record<string, string[]> = {
  'social-post':  ['Product launch for summer collection', 'Behind-the-scenes team spotlight', 'Weekly tips carousel', 'Customer success story', 'Seasonal giveaway campaign', 'New feature announcement'],
  'docs':         ['Q3 performance report', 'Product roadmap 2025', 'Onboarding guide for new hires', 'Competitive analysis brief', 'Engineering RFC template', 'Sprint retrospective notes'],
  'space':        ['Minimalist product on white background', 'Lifestyle shot for summer campaign', 'Abstract brand pattern in brand colors', 'Team headshot series', 'Event banner hero image', 'Social ad creative set'],
  'presentation': ['Investor pitch deck — Series A', 'Product demo for enterprise sales', 'Team all-hands update', 'Quarterly business review', 'Design thinking workshop', 'Go-to-market strategy'],
  'design':       ['Instagram ad set — 3 sizes', 'Brand logo refresh', 'Event banner 1920×1080', 'Email header template', 'Icon set for mobile app', 'Packaging mockup'],
  'app':          ['SaaS landing page with CTA', 'Portfolio site with case studies', 'Product waitlist page', 'Pricing comparison page', 'App onboarding flow', 'Interactive product demo'],
}

function getSuggestions(slug: string): string[] {
  return SUGGESTIONS[slug] ?? []
}

function pickFour(all: string[], offset: number): string[] {
  const len = all.length
  return [all[offset % len], all[(offset + 1) % len], all[(offset + 2) % len], all[(offset + 3) % len]]
}

export function PromptScreen({ config, onSubmit }: Props) {
  const navigate = useNavigate()
  const { kits } = useBrandStore()
  const [prompt, setPrompt] = useState('')
  const [shuffleIdx, setShuffleIdx] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null)
  const [spectrumValues, setSpectrumValues] = useState<Record<string, number>>({})
  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  const inputFootRef   = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const styleRef       = useRef<HTMLDivElement>(null)
  const generateRef    = useRef<HTMLButtonElement>(null)
  const attachBtnRef   = useRef<HTMLButtonElement>(null)
  const modelBtnRef    = useRef<HTMLDivElement>(null)
  const fileInputRef   = useRef<HTMLInputElement>(null)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  const Icon = I.Icons[config.icon]

  const allSuggestions = getSuggestions(config.slug)
  const visibleSuggestions = pickFour(allSuggestions, shuffleIdx)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleThemeSelect(t: ThemeOption | null) {
    setSelectedTheme(t)
    if (!t) setSpectrumValues({})
  }

  function handleSpectrumChange(key: string, v: number) {
    setSpectrumValues(prev => ({ ...prev, [key]: v }))
  }

  function handleSubmit() {
    if (!prompt.trim()) return
    onSubmit(prompt.trim(), selectedTheme, null, attachedFiles)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  function handleShuffle() {
    setShuffleIdx(i => (i + 3) % allSuggestions.length)
  }

  return (
    <div className="cp-screen">
      <div className="cp-orb cp-orb-left" />
      <div className="cp-orb cp-orb-right" />

      <button className="cp-back" onClick={() => navigate('/onboarding', { state: { resumeFromCreate: true } })}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <div className="cp-center">
        <div className="cp-chip" style={{ color: config.color, borderColor: `${config.color}40`, background: `${config.color}14` }}>
          {Icon && <Icon style={{ width: 14, height: 14 }} />}
          {config.label}
        </div>

        <h1 className="cp-heading">{renderTitle(config.promptTitle)}</h1>
        <p className="cp-sub">{config.promptSub}</p>

        <div className="cp-input-shell">
        <div className="cp-input-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.txt,.doc,.docx"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const newFiles = Array.from(e.target.files ?? [])
              if (newFiles.length) setAttachedFiles(prev => [...prev, ...newFiles])
              e.target.value = ''
            }}
          />
          <textarea
            ref={textareaRef}
            className="cp-textarea"
            placeholder={config.promptPlaceholder}
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value)
              const el = e.target
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 186) + 'px'
            }}
            onKeyDown={handleKey}
            rows={2}
          />
          <div className="cp-input-foot" ref={inputFootRef}>
            <div className="cp-input-actions">
              <button
                ref={attachBtnRef}
                className={`cp-action-btn${attachedFiles.length > 0 ? ' cp-action-btn--has-files' : ''}`}
                title="Attach file"
                data-count={attachedFiles.length > 0 ? String(attachedFiles.length) : undefined}
                onClick={() => { fileInputRef.current?.click() }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              {selectedTheme && (() => {
                const kitId = selectedTheme.section === 'brand'
                  ? selectedTheme.id.replace(/^brand-/, '').replace(/-(?:primary|dark|minimal|accent)$/, '')
                  : null
                const kitName = kitId ? (kits.find(k => k.id === kitId)?.name ?? null) : null
                return (
                  <div className="cp-theme-pill">
                    <div className="cp-theme-pill-thumb">
                      <ThemePreview colors={selectedTheme.colors} />
                    </div>
                    <div className="cp-theme-pill-info">
                      <span className="cp-theme-pill-name">{selectedTheme.name}</span>
                      {kitName && <span className="cp-theme-pill-kit">{kitName}</span>}
                    </div>
                    <button
                      className="cp-theme-pill-remove"
                      type="button"
                      title="Remove theme"
                      onClick={() => handleThemeSelect(null)}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )
              })()}
              <AttachmentChips
                files={attachedFiles}
                onRemove={(i) => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
              />
            </div>
          </div>
        </div>
        </div>

        <div className="cp-suggestions" ref={suggestionsRef}>
          <div className="cp-suggestions-header">
            <span className="cp-suggestions-label">Sample prompts</span>
          </div>
          <div className="cp-suggestions-chips">
            {visibleSuggestions.map(s => (
              <button key={s} className="cp-suggestion-chip" onClick={() => { setPrompt(s) }}>
                <span className="cp-suggestion-chip-text">{s}</span>
                <svg className="cp-suggestion-chip-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div ref={styleRef} style={{ width: '100%' }}>
          <ThemePickerSection
            slug={config.slug}
            selected={selectedTheme}
            onSelect={handleThemeSelect}
            spectrumValues={spectrumValues}
            onSpectrumChange={handleSpectrumChange}
          />
        </div>
      </div>

      {/* Fixed footer */}
      <div className="cp-fixed-footer">
        <div className="cp-fixed-footer-inner">
          <div className="cp-footer-tip">
            <span className="cp-footer-tip-label">Tips</span>
            Apply your brand kit to keep colors, fonts, and style consistent across every output
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedTheme && (
            <div className="cp-theme-pill">
              <div className="cp-theme-pill-thumb">
                <ThemePreview colors={selectedTheme.colors} />
              </div>
              <div className="cp-theme-pill-info">
                <span className="cp-theme-pill-name">{selectedTheme.name}</span>
              </div>
              <button className="cp-theme-pill-remove" type="button" onClick={() => handleThemeSelect(null)}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}
          <div className={`cp-generate-wrap${!prompt.trim() ? ' cp-generate-wrap--hint' : ''}`} data-hint={!prompt.trim() ? 'Add a prompt to get started' : ''}>
            <button
              ref={generateRef}
              className="cp-generate-btn cp-generate-btn--inline"
              disabled={!prompt.trim()}
              onClick={handleSubmit}
              style={{ background: config.color, color: '#000' }}
            >
              Generate
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderTitle(title: string) {
  const parts = title.split(/\{([^}]+)\}/)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: '#ec4899' }}>{part}</span>
      : part
  )
}
