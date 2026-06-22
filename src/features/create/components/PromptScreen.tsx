import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'
import { type ThemeOption, SYSTEM_THEMES, STANDALONE_THEMES, makeBrandKitThemes } from '../themes'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
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

/* ── Tour tooltip (steps 2-4: suggestions, style, generate) ────────────── */

const TOUR_STEPS = [
  {
    key: 'suggestions',
    title: 'Not sure where to start?',
    body: 'Pick a suggestion to fill your prompt instantly, or shuffle for fresh ideas.',
    placement: 'top' as const,
  },
  {
    key: 'attach',
    title: 'Attach a file',
    body: 'Give the AI more context — briefs, images, or references.',
    placement: 'top' as const,
  },
  {
    key: 'model',
    title: 'Switch AI model',
    body: 'Match the model to your task — fast drafts or quality final copy.',
    placement: 'top' as const,
  },
  {
    key: 'style',
    title: 'Pick a style',
    body: 'Choose a visual theme and fine-tune your brand voice before generating.',
    placement: 'top' as const,
  },
  {
    key: 'generate',
    title: 'Ready? Hit Generate',
    body: 'Your content will be created using your prompt, theme, and voice settings.',
    placement: 'top' as const,
  },
]

type TourPlacement = 'top' | 'bottom'

interface TourRect { top: number; left: number; width: number; height: number }

function TourTooltip({
  step,
  total,
  title,
  body,
  placement,
  getTargetRect,
  onNext,
  onSkip,
}: {
  step: number
  total: number
  title: string
  body: string
  placement: TourPlacement
  getTargetRect: () => TourRect | null
  onNext: () => void
  onSkip: () => void
}) {
  const [targetRect, setTargetRect] = useState<TourRect | null>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setTargetRect(getTargetRect()))
    return () => cancelAnimationFrame(id)
  }, [getTargetRect])

  if (!targetRect) return null

  const PAD = 12
  const TIP_W = 280
  const scrollEl = document.querySelector('.cp-screen')
  const scrollTop = scrollEl?.scrollTop ?? 0

  const absTop = targetRect.top + scrollTop
  const centerX = targetRect.left + targetRect.width / 2

  const tipTop = placement === 'bottom'
    ? absTop + targetRect.height + PAD
    : absTop - PAD - 10

  const tipLeft = Math.max(16, Math.min(centerX - TIP_W / 2, window.innerWidth - TIP_W - 16))
  const arrowLeft = centerX - tipLeft

  const spotPad = 8
  const spotTop  = absTop - spotPad
  const spotLeft = targetRect.left - spotPad
  const spotW    = targetRect.width + spotPad * 2
  const spotH    = targetRect.height + spotPad * 2

  return (
    <Portal>
      <div className="cp-tour-overlay" onClick={onSkip}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <mask id="cp-tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect x={spotLeft} y={spotTop} width={spotW} height={spotH} rx={10} fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#cp-tour-mask)" />
        </svg>
        <div className="cp-tour-spot" style={{ top: spotTop, left: spotLeft, width: spotW, height: spotH }} />
      </div>

      <div
        className={`cp-tour-tip cp-tour-tip--${placement}`}
        style={{ top: tipTop, left: tipLeft, width: TIP_W }}
        onClick={e => e.stopPropagation()}
      >
        {placement === 'bottom' && (
          <div className="cp-tour-arrow cp-tour-arrow--up" style={{ left: arrowLeft }} />
        )}
        <div className="cp-tour-dots">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`cp-tour-dot${i === step ? ' active' : ''}`} />
          ))}
        </div>
        <div className="cp-tour-title">{title}</div>
        <div className="cp-tour-body">{body}</div>
        <div className="cp-tour-actions">
          <button className="cp-tour-skip" onClick={onSkip}>Skip tour</button>
          <button className="cp-tour-next" onClick={onNext}>
            {step === total - 1 ? 'Done' : 'Next'}
            {step < total - 1 && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
        {placement === 'top' && (
          <div className="cp-tour-arrow cp-tour-arrow--down" style={{ left: arrowLeft }} />
        )}
      </div>
    </Portal>
  )
}

/* ── Input tip (shown once after picking a suggestion) ─────────────────── */

function InputTip({
  attachRef,
  modelRef,
  onDismiss,
}: {
  attachRef: React.RefObject<HTMLElement | null>
  modelRef: React.RefObject<HTMLElement | null>
  onDismiss: () => void
}) {
  const [step, setStep]           = useState<0 | 1>(0)
  const [attachRect, setAttachRect] = useState<DOMRect | null>(null)
  const [modelRect, setModelRect]   = useState<DOMRect | null>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (attachRef.current) setAttachRect(attachRef.current.getBoundingClientRect())
      if (modelRef.current)  setModelRect(modelRef.current.getBoundingClientRect())
    })
    return () => cancelAnimationFrame(id)
  }, [attachRef, modelRef])

  if (!attachRect || !modelRect) return null

  const GAP = 10

  const attachW    = 210
  const attachTop  = attachRect.bottom + GAP
  const attachLeft = Math.max(8, attachRect.left + attachRect.width / 2 - attachW / 2)
  const attachArrow = attachRect.left + attachRect.width / 2 - attachLeft

  const modelW    = 210
  const modelTop  = modelRect.bottom + GAP
  const modelLeft = Math.max(8, Math.min(modelRect.left + modelRect.width / 2 - modelW / 2, window.innerWidth - modelW - 8))
  const modelArrow = modelRect.left + modelRect.width / 2 - modelLeft

  return (
    <Portal>
      {step === 0 && (
        <div className="cp-input-tip cp-input-tip--sm" style={{ top: attachTop, left: attachLeft, width: attachW }} onClick={e => e.stopPropagation()}>
          <div className="cp-input-tip-arrow" style={{ left: Math.max(10, attachArrow) }} />
          <div className="cp-input-tip-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            <span><strong>Attach a file</strong> to give the AI more context — briefs, images, or references.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>1 of 2</span>
            <button className="cp-input-tip-dismiss" onClick={() => setStep(1)}>Next →</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="cp-input-tip cp-input-tip--sm" style={{ top: modelTop, left: modelLeft, width: modelW }} onClick={e => e.stopPropagation()}>
          <div className="cp-input-tip-arrow" style={{ left: Math.max(10, modelArrow) }} />
          <div className="cp-input-tip-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span><strong>Switch AI model</strong> to match your task — fast drafts or quality final copy.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>2 of 2</span>
            <button className="cp-input-tip-dismiss" onClick={onDismiss}>Got it</button>
          </div>
        </div>
      )}
    </Portal>
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

function ToneConfigExtras() {
  const [textAmount, setTextAmount] = useState<string>('concise')
  const [wordsToAvoid, setWordsToAvoid] = useState('')
  const [customInstruction, setCustomInstruction] = useState('')

  return (
    <div className="cp-tone-extras">
      {/* Amount of text */}
      <div className="cp-tone-section">
        <div className="cp-tone-section-title">Amount of text</div>
        <div className="cp-tone-section-sub">Adjust the level of detail in the generated content</div>
        <div className="cp-text-amount-grid">
          {TEXT_AMOUNT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              className={`cp-text-amount-card${textAmount === opt.id ? ' active' : ''}`}
              onClick={() => setTextAmount(opt.id)}
            >
              <div className="cp-text-amount-icon">{opt.icon}</div>
              <div className="cp-text-amount-label">{opt.label}</div>
              <div className="cp-text-amount-desc">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Words to avoid */}
      <div className="cp-tone-section">
        <div className="cp-tone-section-title">Words to avoid</div>
        <input
          className="cp-tone-input"
          placeholder="Add word…"
          value={wordsToAvoid}
          onChange={e => setWordsToAvoid(e.target.value)}
        />
        <div className="cp-tone-section-hint">Avoid using these words when creating content</div>
      </div>

      {/* Custom instruction */}
      <div className="cp-tone-section">
        <div className="cp-tone-section-title">Custom instruction</div>
        <div className="cp-tone-section-sub">Free-form description of the desired tone, personality, or style.</div>
        <textarea
          className="cp-tone-textarea"
          placeholder="Describe your desired tone…"
          value={customInstruction}
          onChange={e => setCustomInstruction(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
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
  const [themeTab, setThemeTab] = useState<'brand' | 'library'>(() => appliedId ? 'brand' : 'library')

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
  const brandThemes: ThemeOption[] = appliedKit
    ? (appliedKit.onboarding ? makeBrandKitThemes(appliedKit).slice(0, 1) : makeBrandKitThemes(appliedKit))
    : (() => {
        const onboardingKit = newKitId ? kits.find(k => k.id === newKitId) : null
        const t = (!brandSkipped && onboardingKit) ? makeBrandKitThemes(onboardingKit)[0] ?? null : null
        return t ? [t] : []
      })()

  /* ── Selected state ── */
  if (selected) {
    return (
      <div className="cp-themes">
        {previewTheme && (
          <ThemePreviewModal theme={previewTheme} onClose={() => setPreviewTheme(null)} onSelect={() => { onSelect(previewTheme); setPreviewTheme(null) }} />
        )}
        <div className="cp-style-group">
          <div className="cp-style-group-header">
            <div className="cp-style-group-label">Look & Feel</div>
            <div className="cp-style-group-desc">Choose a theme to set the look and feel of your design.</div>
          </div>
          <button className="cp-selected-change" onClick={() => onSelect(null)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Choose another theme
          </button>
          <div className="cp-selected-theme-box cp-selected-theme-box--active">
            <div className="cp-selected-theme-header">
              <span className="cp-selected-chip">Selected</span>
              <div className="cp-selected-theme-name">{selected.name}</div>
            </div>
            <div className="cp-selected-cols">
              <button
                className="cp-theme-card cp-theme-card--focused"
                title="Click to change theme"
              >
                <ThemeCardInner t={selected} onPreview={(e) => { e.stopPropagation(); setPreviewTheme(selected) }} />
              </button>
              {selected.prompt && (
                <div className="cp-selected-theme-prompt">{selected.prompt}</div>
              )}
            </div>

            <div className="cp-selected-divider" />
            <ToneConfigExtras />
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
          <div className="cp-style-group-label">Look & Feel</div>
          <div className="cp-style-group-desc">Choose a theme to set the look and feel of your design.</div>
        </div>

        {/* Search — always visible below header */}
        <div className="cp-theme-search-bar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="cp-theme-search-icon cp-theme-search-icon--bar">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="cp-theme-library-search cp-theme-library-search--bar"
            placeholder="Search themes…"
            value={themeSearch}
            onChange={e => setThemeSearch(e.target.value)}
          />
        </div>

        {/* Top-level tabs: pill segmented control */}
        <div className="cp-theme-tabs-wrap">
          <div className="cp-theme-seg">
            {(kits.length > 0 || STANDALONE_THEMES.length > 0) && (
              <button className={`cp-theme-seg-btn${themeTab === 'brand' ? ' active' : ''}`} onClick={() => setThemeTab('brand')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Your Themes
              </button>
            )}
            <button className={`cp-theme-seg-btn${themeTab === 'library' ? ' active' : ''}`} onClick={() => setThemeTab('library')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Theme Library
            </button>
          </div>

          {/* Your Themes tab — brand kit themes (highlighted) + standalone themes */}
          {themeTab === 'brand' && (
            <div className="cp-brand-theme-section">
              {brandThemes.length > 0 && (
                <div className="cp-brand-highlight-card">
                  <div className="cp-brand-highlight-header">
                    <div className="cp-brand-highlight-title">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                      </svg>
                      From your brand kits
                    </div>
                    <div ref={kitMenuRef} style={{ position: 'relative' }}>
                      <button className="cp-kit-switch-btn" onClick={() => setKitMenuOpen(o => !o)}>
                        {appliedKit?.name ?? 'Select brand kit'}
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

              {STANDALONE_THEMES.length > 0 && (
                <div className="cp-your-themes-group">
                  <div className="cp-your-themes-group-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                    </svg>
                    Custom Themes
                  </div>
                  <div className="cp-themes-grid">
                    {STANDALONE_THEMES.map(t => (
                      <button key={t.id} className="cp-theme-card" onClick={() => onSelect(t)}>
                        <ThemeCardInner t={t} onPreview={(e) => { e.stopPropagation(); setPreviewTheme(t) }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {brandThemes.length === 0 && STANDALONE_THEMES.length === 0 && (
                <div className="cp-theme-empty">No themes yet. Create a brand kit or save a custom theme.</div>
              )}
            </div>
          )}

          {/* Library tab */}
          {themeTab === 'library' && (() => {
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
            return (
              <div className="cp-theme-library">
                <div className="cp-theme-cats">
                  {cats.map(c => (
                    <button
                      key={c}
                      className={`cp-theme-cat${themeCategory === c ? ' active' : ''}`}
                      onClick={() => setThemeCategory(c)}
                    >{c}</button>
                  ))}
                </div>
                <div className="cp-themes-grid">
                  {filtered.map(t => (
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
      </div>
    </div>
  )
}

interface Props {
  config: ProductConfig
  onSubmit: (prompt: string, theme: ThemeOption | null, tone: string | null) => void
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

function pickThree(all: string[], offset: number): string[] {
  const len = all.length
  return [all[offset % len], all[(offset + 1) % len], all[(offset + 2) % len]]
}

export function PromptScreen({ config, onSubmit }: Props) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [shuffleIdx, setShuffleIdx] = useState(0)
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null)
  const [spectrumValues, setSpectrumValues] = useState<Record<string, number>>({})
  const [tourStep, setTourStep] = useState<number | null>(0)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  const inputFootRef   = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const styleRef       = useRef<HTMLDivElement>(null)
  const generateRef    = useRef<HTMLButtonElement>(null)
  const attachBtnRef   = useRef<HTMLButtonElement>(null)
  const modelBtnRef    = useRef<HTMLDivElement>(null)

  const tourRefs: Record<string, React.RefObject<HTMLElement | null>> = {
    suggestions: suggestionsRef,
    style:       styleRef,
    generate:    generateRef,
    attach:      attachBtnRef,
    model:       modelBtnRef,
  }

  const getTourRect = useCallback((key: string): TourRect | null => {
    const el = tourRefs[key]?.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }, [])
  const Icon = I.Icons[config.icon]

  const allSuggestions = getSuggestions(config.slug)
  const visibleSuggestions = pickThree(allSuggestions, shuffleIdx)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function advanceTourIfOn(key: string) {
    const idx = TOUR_STEPS.findIndex(s => s.key === key)
    if (tourStep === idx) setTourStep(idx < TOUR_STEPS.length - 1 ? idx + 1 : null)
  }

  function handleThemeSelect(t: ThemeOption | null) {
    setSelectedTheme(t)
    if (!t) setSpectrumValues({})
    else advanceTourIfOn('style')
  }

  function handleSpectrumChange(key: string, v: number) {
    setSpectrumValues(prev => ({ ...prev, [key]: v }))
  }

  function handleSubmit() {
    if (!prompt.trim()) return
    onSubmit(prompt.trim(), selectedTheme, null)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  function handleShuffle() {
    setShuffleIdx(i => (i + 3) % allSuggestions.length)
  }

  const activeTourStep = tourStep !== null ? TOUR_STEPS[tourStep] : null

  return (
    <div className="cp-screen">
      {activeTourStep && (
        <TourTooltip
          step={tourStep!}
          total={TOUR_STEPS.length}
          title={activeTourStep.title}
          body={activeTourStep.body}
          placement={activeTourStep.placement}
          getTargetRect={() => getTourRect(activeTourStep.key)}
          onNext={() => setTourStep(s => (s !== null && s < TOUR_STEPS.length - 1 ? s + 1 : null))}
          onSkip={() => setTourStep(null)}
        />
      )}


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

        <div className="cp-input-wrap">
          <textarea
            ref={textareaRef}
            className="cp-textarea"
            placeholder={config.promptPlaceholder}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
          />
          <div className="cp-input-foot" ref={inputFootRef}>
            <div className="cp-input-actions">
              <button ref={attachBtnRef} className="cp-action-btn" title="Attach file" onClick={() => advanceTourIfOn('attach')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
            </div>
            <div className="cp-input-right">
              <div ref={modelBtnRef} style={{ display: 'inline-flex' }}><ModelSelector onOpen={() => advanceTourIfOn('model')} /></div>
            </div>
          </div>
        </div>

        {/* Fixed generate bar — rendered via Portal to escape overflow:hidden */}
        <Portal>
          <div className="cp-generate-bar">
            <div className="cp-generate-bar-tip">
              <span className="cp-generate-bar-tip-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
              </span>
              <span className="cp-generate-bar-tip-label">Tips</span>
              <span className="cp-generate-bar-tip-text">
                Use a Brand Theme to automatically apply your brand kit's visual direction!
              </span>
            </div>
            {(() => {
              const needsTheme = THEME_SLUGS.has(config.slug) && !selectedTheme
              const needsPrompt = !prompt.trim()
              const hint = needsPrompt && needsTheme
                ? 'Add a prompt and select a theme'
                : needsPrompt
                  ? 'Add a prompt to get started'
                  : needsTheme
                    ? 'Select a theme to continue'
                    : ''
              const isReady = !needsPrompt && !needsTheme
              return (
            <div className={`cp-generate-wrap${!isReady ? ' cp-generate-wrap--hint' : ''}`} data-hint={hint}>
              <button
                ref={generateRef}
                className="cp-generate-btn cp-generate-btn--bar"
                disabled={!isReady}
                onClick={handleSubmit}
                style={{ background: isReady ? config.color : undefined, color: isReady ? '#000' : undefined }}
              >
                Generate
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
              )
            })()}
          </div>
        </Portal>

        <div className="cp-suggestions" ref={suggestionsRef}>
          <div className="cp-suggestions-chips">
            {visibleSuggestions.map(s => (
              <button key={s} className="cp-suggestion-chip" onClick={() => { setPrompt(s); advanceTourIfOn('suggestions') }}>
                {s}
              </button>
            ))}
          </div>
          <button className="cp-shuffle-btn" onClick={handleShuffle} title="Shuffle suggestions">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
            Shuffle
          </button>
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
