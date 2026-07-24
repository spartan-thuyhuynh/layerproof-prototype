import { useEffect, useRef, useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { ArrowRight, Upload } from '@/shared/icons'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PALETTE = ['#ec4899']

const HEADING_FONTS = [
  { family: 'Archivo',          weight: '800', label: 'Archivo'          },
  { family: 'Anton',            weight: '400', label: 'Anton'            },
  { family: 'Playfair Display', weight: '800', label: 'Playfair Display' },
  { family: 'Space Grotesk',    weight: '700', label: 'Space Grotesk'    },
  { family: 'Fraunces',         weight: '800', label: 'Fraunces'         },
  { family: 'Georgia',          weight: '700', label: 'Georgia'          },
]

const BODY_FONTS = [
  { family: 'Archivo',   weight: '400', label: 'Archivo'   },
  { family: 'DM Sans',   weight: '400', label: 'DM Sans'   },
  { family: 'Inter',     weight: '400', label: 'Inter'     },
  { family: 'Georgia',   weight: '400', label: 'Georgia'   },
  { family: 'system-ui', weight: '400', label: 'System UI' },
]

const GENERATING_STEPS: { label: string; sub: string }[] = [
  { label: 'Saving your colour palette',    sub: 'Your brand kit now owns these colours — they\'re your identity foundation.' },
  { label: 'Registering your typefaces',    sub: 'Display and body fonts locked in as part of your brand kit.' },
  { label: 'Capturing your brand tone',     sub: 'Voice and communication style stored in your kit for consistent copy.' },
  { label: 'Finalising your brand kit',     sub: 'All your identity rules are saved in one place — colours, fonts, tone, logo.' },
  { label: 'Generating your first brand theme', sub: 'A brand theme applies your kit\'s rules to a specific output format — your first one is ready.' },
]

type Phase = 'hook' | 'import' | 'setup' | 'generating' | 'done'

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17, flexShrink: 0, color: 'var(--t3)' }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

// ─── Generating animation ─────────────────────────────────────────────────────

function GeneratingPhase({ brandName, color }: { brandName: string; color: string }) {
  const [idx, setIdx] = useState(0)
  const total = GENERATING_STEPS.length

  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, total - 1)), 900)
    return () => clearInterval(t)
  }, [])

  const current = GENERATING_STEPS[idx]

  return (
    <div className="onb-step fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, gap: 0, width: '100%', maxWidth: 480, margin: '0 auto' }}>

      {/* Spinner */}
      <div style={{ position: 'relative', width: 52, height: 52, marginBottom: 24 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
        </svg>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0, animation: 'spin 1s linear infinite' }}>
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3"
            strokeDasharray="44 94" strokeLinecap="round" />
        </svg>
      </div>

      {/* Heading */}
      <div className="h-eyebrow" style={{ marginBottom: 10 }}>Setting up your brand</div>
      <h2 style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 34, letterSpacing: '.01em', textTransform: 'uppercase', color: 'var(--t1)', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.05 }}>
        From Brand Kit to Theme
      </h2>

      {/* Concept cards */}
      <div style={{ display: 'flex', gap: 0, width: '100%', alignItems: 'stretch', marginBottom: 24 }}>
        <div style={{ flex: 1, background: '#131316', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px 0 0 12px', padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 8 }}>Brand Kit</div>
          <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>Your identity — colours, fonts, logo, and tone stored in one place.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#0e0e10', border: '1px solid rgba(255,255,255,.08)', borderLeft: 'none', borderRight: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
        <div style={{ flex: 1, background: '#131316', border: '1px solid rgba(255,255,255,.08)', borderRadius: '0 12px 12px 0', padding: '16px 20px', borderLeft: 'none' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 8 }}>Brand Theme</div>
          <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>Rules for applying your kit to a specific output format, auto-generated.</div>
        </div>
      </div>

      {/* Current step callout */}
      <div style={{
        width: '100%', marginBottom: 20,
        padding: '14px 18px', borderRadius: 12,
        background: 'rgba(255,222,66,.06)',
        border: '1px solid rgba(255,222,66,.14)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{current.label}</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.55 }}>{current.sub}</div>
      </div>

      {/* Step list */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {GENERATING_STEPS.map(({ label }, i) => {
          const done   = i < idx
          const active = i === idx
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i > idx ? 0.28 : 1, transition: 'opacity .4s' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: done ? 'var(--accent)' : 'transparent',
                border: done ? '2px solid var(--accent)' : active ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .35s',
              }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? 'var(--t1)' : done ? 'var(--t2)' : 'var(--t3)', transition: 'color .3s' }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Done / Congratulations phase ────────────────────────────────────────────

function KitCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  )
}

function DonePhase({ brandName, color, fontPair, palette, logoPreview, tone, onContinue }: {
  brandName: string
  color: string
  fontPair: { display: string; body: string }
  palette: string[]
  logoPreview: string | null
  tone: string | null
  onContinue: () => void
}) {
  const activePalette = palette.length > 0 ? palette : [color]
  const toneData = TONES.find(t => t.id === tone)

  return (
    <div className="onb-step onb-step--wide fade-in" style={{ maxWidth: 600 }}>
      {/* Header — left-aligned */}
      <div style={{ marginBottom: 28 }}>
        <div className="h-eyebrow" style={{ marginBottom: 10 }}>Theme Generated</div>
        <h1 style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 40, letterSpacing: '.01em', textTransform: 'uppercase', color: 'var(--t1)', margin: '0 0 12px', lineHeight: 1.0 }}>
          Your brand kit is ready.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.65, maxWidth: 480 }}>
          We've auto-generated your first brand theme from your kit. This is a ruleset for how your identity applies to outputs.
        </p>
      </div>

      {/* Brand theme card — horizontal */}
      <div className="onb-done-theme-card" style={{
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.08)',
        marginBottom: 20,
        display: 'flex',
        background: '#111113',
      }}>
        {/* Left: gradient thumbnail */}
        <div className="onb-done-theme-thumb" style={{
          flex: '0 0 160px',
          position: 'relative',
          background: `linear-gradient(160deg, ${color} 0%, ${activePalette[1] ?? color}bb 60%, ${activePalette[2] ?? '#111'}88 100%)`,
          overflow: 'hidden',
          minHeight: 140,
        }}>
          <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', border: '28px solid rgba(255,255,255,.07)', top: -50, right: -50 }} />
          <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '16px solid rgba(255,255,255,.05)', bottom: -20, left: -20 }} />
          {/* Logo mark */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {logoPreview
              ? <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontFamily: 'Anton', fontSize: 15, color: '#fff', lineHeight: 1 }}>{brandName[0]?.toUpperCase() ?? 'B'}</span>
            }
          </div>
          {/* Palette bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', height: 4 }}>
            {activePalette.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
          </div>
        </div>

        {/* Right: metadata */}
        <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Brand Theme</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: 'rgba(255,222,66,.12)', color: 'var(--accent)', borderRadius: 5, padding: '2px 8px', border: '1px solid rgba(255,222,66,.18)' }}>Auto-Generated</span>
          </div>
          <div style={{ fontFamily: fontPair.display, fontWeight: 800, fontSize: 19, color: 'var(--t1)', lineHeight: 1.1 }}>
            Brand Core Theme
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco l…
          </div>
        </div>
      </div>

      {/* Brand kit grid */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', marginBottom: 24 }}>

        {/* Row 1: Logo | Typography | Tone */}
        <div className="onb-done-kit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#111113', borderBottom: '1px solid rgba(255,255,255,.07)' }}>

          {/* Logo */}
          <div style={{ padding: '16px 18px', borderRight: '1px solid rgba(255,255,255,.07)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Logo</div>
            <div style={{
              width: 48, height: 48, borderRadius: 12, marginBottom: 10,
              background: logoPreview ? '#1a1a1a' : color,
              border: '1px solid rgba(255,255,255,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              boxShadow: `0 4px 14px ${color}44`,
            }}>
              {logoPreview
                ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ fontFamily: 'Anton', fontSize: 22, color: '#fff', lineHeight: 1 }}>{brandName[0]?.toUpperCase() ?? 'B'}</span>
              }
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', lineHeight: 1.2, marginBottom: 2 }}>{brandName}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{logoPreview ? 'Custom logo' : 'Lettermark'}</div>
          </div>

          {/* Typography */}
          <div style={{ padding: '16px 18px', borderRight: '1px solid rgba(255,255,255,.07)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Typography</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: fontPair.display, fontWeight: 800, fontSize: 28, color: 'var(--t1)', lineHeight: 1 }}>{fontPair.display}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>Display</div>
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 10 }} />
            <div>
              <div style={{ fontFamily: fontPair.body, fontWeight: 400, fontSize: 20, color: 'rgba(255,255,255,.4)', lineHeight: 1 }}>{fontPair.body}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>Body</div>
            </div>
          </div>

          {/* Brand Voice */}
          <div style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Brand Voice</div>
            {toneData ? (
              <>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,222,66,.12)', border: '1px solid rgba(255,222,66,.2)',
                  borderRadius: 20, padding: '6px 12px', marginBottom: 8,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{toneData.label}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{toneData.desc}</div>
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--t3)' }}>Not configured</span>
            )}
          </div>
        </div>

        {/* Row 2: Colours — full width */}
        <div style={{ background: '#111113', padding: '16px 18px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Colors</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            {activePalette.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, background: c,
                  border: '1px solid rgba(255,255,255,.08)',
                  boxShadow: i === 0 ? `0 4px 12px ${c}55` : 'none',
                }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>{c.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn primary onb-cta" onClick={onContinue} style={{ width: '100%' }}>
        Generate your first project <ArrowRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── ColorPaletteBuilder ──────────────────────────────────────────────────────

function isValidHex(h: string) { return /^#[0-9a-fA-F]{6}$/.test(h) }

function ColorChip({ color, index, total, onChange, onRemove }: {
  color: string; index: number; total: number
  onChange: (hex: string) => void; onRemove: () => void
}) {
  const [open, setOpen]       = useState(false)
  const [draft, setDraft]     = useState(color)
  const chipRef               = useRef<HTMLDivElement>(null)
  const colorInputRef         = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(color) }, [color])

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (chipRef.current && !chipRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [open])

  function commitDraft(val: string) {
    const hex = val.startsWith('#') ? val : '#' + val
    if (isValidHex(hex)) onChange(hex)
    else setDraft(color)
  }

  const isPrimary = index === 0

  return (
    <div ref={chipRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Primary label — in flow, reserves space for all chips */}
      <div style={{ height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        {isPrimary && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
            color: 'var(--t3)', whiteSpace: 'nowrap',
          }}>Primary</span>
        )}
      </div>

      {/* Swatch button */}
      <button
        onClick={() => setOpen(v => !v)}
        title={color}
        style={{
          width: 44, height: 44, borderRadius: 12, background: color,
          border: open ? '2px solid var(--t1)' : isPrimary ? '2px solid rgba(255,255,255,.35)' : '2px solid transparent',
          cursor: 'pointer', display: 'block', transition: 'border .15s',
          boxShadow: color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff'
            ? 'inset 0 0 0 1px rgba(0,0,0,.15)' : 'none',
        }}
      />

      {/* Hex label */}
      <div className="tiny" style={{ textAlign: 'center', marginTop: 4, color: 'var(--t3)', letterSpacing: '.02em' }}>
        {color.toUpperCase()}
      </div>

      {/* Editor popover */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
          zIndex: 30, background: '#111', border: '1px solid #2a2a2a',
          borderRadius: 12, padding: 12, boxShadow: '0 12px 40px rgba(0,0,0,.8)',
          display: 'flex', flexDirection: 'column', gap: 8, width: 170,
        }}>
          {/* Native color wheel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8, background: color,
                border: '1px solid #333', cursor: 'pointer', flexShrink: 0,
                boxShadow: color.toLowerCase() === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,.15)' : 'none',
              }}
              onClick={() => colorInputRef.current?.click()}
            />
            <input
              ref={colorInputRef}
              type="color"
              value={color}
              onChange={e => { onChange(e.target.value); setDraft(e.target.value) }}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            />
            <span className="tiny" style={{ color: 'var(--t3)' }}>Click to pick</span>
          </div>

          {/* Hex input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#1a1a1a', borderRadius: 8, padding: '6px 10px',
            border: '1px solid #2a2a2a',
          }}>
            <span style={{ color: '#555', fontSize: 13, fontFamily: 'monospace' }}>#</span>
            <input
              value={draft.replace(/^#/, '')}
              maxLength={6}
              onChange={e => setDraft('#' + e.target.value)}
              onBlur={e => commitDraft('#' + e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitDraft(draft) }}
              style={{
                background: 'none', border: 'none', outline: 'none', flex: 1,
                color: '#e0e0e0', fontSize: 13, fontFamily: 'monospace', minWidth: 0,
              }}
            />
          </div>

          {/* Remove */}
          {total > 1 && (
            <button
              onClick={() => { onRemove(); setOpen(false) }}
              style={{
                background: 'none', border: '1px solid #2a2a2a', borderRadius: 8,
                color: '#666', fontSize: 12, padding: '5px 0', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'color .12s, border-color .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#2a2a2a' }}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ColorPaletteBuilder({ palette, onChange }: {
  palette: string[]
  onChange: (p: string[]) => void
}) {
  function update(idx: number, hex: string) {
    const next = [...palette]; next[idx] = hex; onChange(next)
  }
  function remove(idx: number) {
    onChange(palette.filter((_, i) => i !== idx))
  }
  function add() {
    onChange([...palette, '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')])
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start', paddingTop: 10 }}>
        {palette.map((hex, i) => (
          <ColorChip
            key={i}
            color={hex}
            index={i}
            total={palette.length}
            onChange={h => update(i, h)}
            onRemove={() => remove(i)}
          />
        ))}

        {/* Add button */}
        {palette.length < 8 && (
          <div style={{ flexShrink: 0 }}>
            {/* Spacer matching the Primary label row in ColorChip */}
            <div style={{ height: 14, marginBottom: 4 }} />
            <button
              onClick={add}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--card)', border: '1.5px dashed var(--line-2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--t3)', transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t2)'; e.currentTarget.style.color = 'var(--t2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--t3)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <div className="tiny" style={{ textAlign: 'center', marginTop: 4, color: 'var(--t3)' }}>Add</div>
          </div>
        )}
      </div>
      <p className="tiny" style={{ color: 'var(--t3)', marginTop: 10 }}>
        Click any swatch to edit its color or hex code. The first color is your primary.
      </p>
    </div>
  )
}

// ─── FontDropdown ─────────────────────────────────────────────────────────────

interface FontOption { family: string; weight: string; label: string }

function FontDropdown({ label, options, value, onChange, accentColor }: {
  label: string
  options: FontOption[]
  value: FontOption
  onChange: (f: FontOption) => void
  accentColor: string
}) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const rootRef               = useRef<HTMLDivElement>(null)
  const searchRef             = useRef<HTMLInputElement>(null)

  const filtered = options.filter(f =>
    f.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
    else setQuery('')
  }, [open])

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [open])

  return (
    <div ref={rootRef} style={{ flex: 1, position: 'relative' }}>
      <div className="tiny" style={{ marginBottom: 5, color: 'var(--t3)' }}>{label}</div>

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '10px 12px',
          borderRadius: 10, cursor: 'pointer', background: 'var(--card)',
          border: open ? `1.5px solid ${accentColor}` : '1.5px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          transition: 'border-color .15s',
        }}
      >
        <span style={{ fontFamily: value.family, fontWeight: +value.weight, fontSize: 15, color: 'var(--t1)' }}>
          {value.label}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
          background: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,.8)',
          overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #222' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#1a1a1a', borderRadius: 8, padding: '6px 10px',
              border: '1px solid #2a2a2a',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search fonts…"
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: '#e0e0e0', fontSize: 13, fontFamily: 'inherit', flex: 1, minWidth: 0,
                }}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, lineHeight: 1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="tiny" style={{ padding: '12px 14px', color: '#555' }}>No fonts match "{query}"</div>
            ) : filtered.map(f => {
              const active = value.family === f.family
              return (
                <button
                  key={f.family}
                  onClick={() => { onChange(f); setOpen(false) }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: active ? accentColor + '22' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#1e1e1e' }}
                  onMouseLeave={e => { e.currentTarget.style.background = active ? accentColor + '22' : 'transparent' }}
                >
                  <span style={{ fontFamily: f.family, fontWeight: +f.weight, fontSize: 14, color: '#e0e0e0' }}>{f.label}</span>
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── BackButton ───────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="onb-panel-back" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back
    </button>
  )
}

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Polished & credible' },
  { id: 'friendly',     label: 'Friendly',     desc: 'Warm & approachable' },
  { id: 'bold',         label: 'Bold',         desc: 'Confident & direct' },
]

export function Step4_BrandName() {
  const { setBrandName, setTagline, nextStep, prevStep, setStep, setNewKitId, setBrandSkipped } = useOnboardingStore()
  const { createKit, updateKit, setAppliedId } = useBrandStore()

  const [phase, setPhase]             = useState<Phase>('hook')
  const [localName, setLocalName]     = useState('')
  const [palette,       setPalette]     = useState<string[]>(DEFAULT_PALETTE)
  const [headingFont,   setHeadingFont] = useState(HEADING_FONTS[0])
  const [bodyFont,      setBodyFont]    = useState(BODY_FONTS[0])
  const [selectedTone,  setSelectedTone] = useState<string | null>(TONES[0].id)

  const primaryColor = palette[0] ?? '#ec4899'
  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [importUrl, setImportUrl]           = useState('')
  const [importSource, setImportSource]     = useState<'url' | 'pdf' | 'setup'>('url')
  const pdfRef = useRef<HTMLInputElement>(null)

  const canSetup = localName.trim().length > 0

  function handleBack() {
    prevStep()
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  function handleGenerate() {
    if (!canSetup) return
    setPhase('generating')

    // After fake generation, create the kit and mark it active
    setTimeout(() => {
      const id = createKit()
      updateKit(id, (k) => ({
        ...k,
        name: localName.trim(),
        tagline: '',
        logoText: localName.trim()[0]?.toUpperCase() ?? 'B',
        color: primaryColor,
        logoStyle: { background: primaryColor, color: '#fff' },
        swatches: palette,
        type: {
          display: { family: headingFont.family, weight: headingFont.weight, note: '' },
          body:    { family: bodyFont.family,    weight: bodyFont.weight,    note: '' },
          scale:   [],
          rules:   [],
        },
        onboarding: true,
      }))
      setAppliedId(id)
      setNewKitId(id)
      setBrandSkipped(false)
      setBrandName(localName.trim())
      setPhase('done')
    }, GENERATING_STEPS.length * 600 + 300)
  }

  function createImportedKit(kitName: string) {
    const name = kitName.trim() || 'My Brand'
    const id = createKit()
    updateKit(id, (k) => ({
      ...k,
      name,
      tagline:   '',
      logoText:  name[0]?.toUpperCase() ?? 'B',
      color:     '#EC4899',
      logoStyle: { background: '#EC4899', color: '#fff' },
      swatches:  ['#EC4899', '#FFDE42', '#8B5CF6', '#0A0A0A'],
      type: {
        display: { family: 'Playfair Display', weight: '800', note: '' },
        body:    { family: 'Inter',            weight: '400', note: '' },
        scale:   [],
        rules:   [],
      },
      onboarding: true,
    }))
    setAppliedId(id)
    setNewKitId(id)
    setBrandSkipped(false)
    setBrandName(name)
    setLocalName(name)
    setPhase('done')
  }

  function handleUrlImport() {
    if (!importUrl.trim()) return
    let extracted = 'My Brand'
    try {
      const h = new URL(importUrl).hostname.replace(/^www\./, '').split('.')[0]
      extracted = h.charAt(0).toUpperCase() + h.slice(1)
    } catch {}
    setImportSource('url')
    setPhase('generating')
    setTimeout(() => createImportedKit(extracted), GENERATING_STEPS.length * 600 + 300)
  }

  function handlePdfImport(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    setImportSource('pdf')
    setPhase('generating')
    setTimeout(() => createImportedKit('My Brand'), GENERATING_STEPS.length * 600 + 300)
  }

  if (phase === 'generating') {
    return <GeneratingPhase brandName={localName} color={primaryColor} />
  }

  if (phase === 'done') {
    return (
      <DonePhase
        brandName={localName}
        color={primaryColor}
        fontPair={{ display: headingFont.family, body: bodyFont.family }}
        palette={palette}
        logoPreview={logoPreview}
        tone={selectedTone}
        onContinue={() => nextStep()}
      />
    )
  }

  // ── Phase: Import (URL / PDF) ─────────────────────────────────────────────
  if (phase === 'import') {
    const canImportUrl = importUrl.trim().length > 0

    return (
      <div className="onb-step fade-in" style={{ maxWidth: 640 }}>
        <div className="onb-product-bg">
          <div style={{ marginBottom: 20 }}>
            <BackButton onClick={() => setPhase('hook')} />
          </div>

          <div className="h-eyebrow" style={{ marginBottom: 10 }}>Brand kit</div>
          <h1 className="onb-step-title" style={{ marginBottom: 8, fontSize: 28, fontFamily: 'Anton', fontWeight: 400, letterSpacing: '.01em' }}>
            Set up your brand
          </h1>
          <p className="onb-step-sub" style={{ marginBottom: 20 }}>
            Import from your website or brand guidelines — we'll extract colors, fonts and tone automatically.
          </p>

          {/* URL hero card */}
          <div className="onb-import-hero" style={{ marginBottom: 14, display: 'flex', gap: 0, alignItems: 'stretch', padding: 0, overflow: 'hidden' }}>
            {/* Left: brand kit preview image */}
            <div className="onb-import-hero-visual" style={{ flexShrink: 0, width: 160, position: 'relative', overflow: 'hidden' }}>
              <img
                src={`${import.meta.env.BASE_URL}onboarding/illustration.png`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', display: 'block' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, #141414 0%, transparent 40%)' }} />
            </div>

            {/* Right: text + input */}
            <div style={{ flex: 1, minWidth: 0, padding: '22px 22px 22px 22px' }}>
              <div className="onb-import-hero-label">
                <LinkIcon />
                <span>Import from URL</span>
                <span className="chip solid" style={{ fontSize: 11, padding: '2px 8px' }}>Recommended</span>
              </div>
              <p className="onb-import-hero-sub">
                Paste your website URL — we'll scan it for colors, fonts, logo and tone.
              </p>
              <div className="ob-url-input-wrap" style={{ marginTop: 14 }}>
                <LinkIcon />
                <input
                  className="ob-url-input"
                  type="url"
                  placeholder="https://your-website.com"
                  value={importUrl}
                  autoFocus
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canImportUrl) handleUrlImport() }}
                />
                <button
                  className="ob-url-btn"
                  onClick={handleUrlImport}
                  disabled={!canImportUrl}
                >
                  Import <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary options */}
          <div className="onb-import-secondary">
            <button className="onb-import-alt card hover" onClick={() => pdfRef.current?.click()}>
              <div className="onb-import-alt-icon">
                <Upload style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <div className="onb-import-alt-title">Upload brand PDF</div>
                <div className="onb-import-alt-sub">Style guide, brand manual, guidelines doc</div>
              </div>
            </button>

            <button className="onb-import-alt card hover" onClick={() => setPhase('setup')}>
              <div className="onb-import-alt-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div>
                <div className="onb-import-alt-title">Set up manually</div>
                <div className="onb-import-alt-sub">Configure colors, fonts and tone yourself</div>
              </div>
            </button>
          </div>

          <input
            ref={pdfRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handlePdfImport}
          />
        </div>
      </div>
    )
  }

  // ── Phase 1: Hook ──────────────────────────────────────────────────────────
  if (phase === 'hook') {
    const base = import.meta.env.BASE_URL
    return (
      <div className="onb-step fade-in">
        <div className="onb-product-bg">
          {/* Back button row — sits above all content */}
          <div style={{ marginBottom: 20 }}>
            <BackButton onClick={handleBack} />
          </div>

          {/* Decoration images */}
          <div style={{ position: 'relative', height: 180, marginBottom: 28 }}>
            <img
              src={`${base}onboarding/illustration.png`}
              alt=""
              style={{
                position: 'absolute', left: '50%', top: 0,
                transform: 'translateX(-50%)',
                height: 160, width: 'auto', objectFit: 'contain',
                borderRadius: 14,
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.6))',
              }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <img
              src={`${base}onboarding/colors.png`}
              alt=""
              style={{
                position: 'absolute', left: '10%', bottom: 0,
                width: 88, height: 'auto', objectFit: 'contain',
                borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,.5)',
                transform: 'rotate(-4deg)',
              }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <img
              src={`${base}onboarding/typography.png`}
              alt=""
              style={{
                position: 'absolute', right: '10%', bottom: 0,
                width: 88, height: 'auto', objectFit: 'contain',
                borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,.5)',
                transform: 'rotate(3deg)',
              }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          </div>

          {/* Text */}
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>Brand kit</div>
          <h1 className="onb-step-title" style={{ marginBottom: 12, fontSize: 32, fontFamily: 'Anton', fontWeight: 400, letterSpacing: '.01em' }}>Set up your own brand</h1>
          <p className="onb-step-sub" style={{ marginBottom: 10 }}>
            Upload your logo, pick your colors and type — we'll build a brand kit that keeps every output automatically on-brand.
          </p>
          <p className="tiny" style={{ color: 'var(--t3)', marginBottom: 28 }}>
            You can always adjust your brand kit later.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 15 }}
              onClick={() => setPhase('import')}
            >
              Yes, set up my brand <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <button
              className="btn ghost"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 14 }}
              onClick={() => nextStep()}
            >
              I'll set it up later
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Phase 2: Setup form ────────────────────────────────────────────────────
  return (
    <div className="onb-step onb-step--wide fade-in">
      <div className="onb-product-bg">
        {/* Top nav */}
        <div className="onb-panel-top-row" style={{ marginBottom: 16 }}>
          <BackButton onClick={() => setPhase('hook')} />
          <button className="onb-skip" onClick={() => { setBrandSkipped(true); nextStep() }}>Skip for now</button>
        </div>

        {/* Header — spans full width above both panels */}
        <div style={{ marginBottom: 20 }}>
          <div className="h-eyebrow" style={{ marginBottom: 6 }}>Brand kit</div>
          <h1 className="onb-step-title" style={{ marginBottom: 4, fontFamily: 'Anton', fontWeight: 400, fontSize: 28, letterSpacing: '.01em' }}>A few quick details</h1>
          <p className="tiny" style={{ color: 'var(--t3)' }}>You can always adjust your brand kit later.</p>
        </div>

        {/* Two-panel body */}
        <div className="onb-setup-panels" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* ── Left: live preview ─────────────────────────────── */}
          <div className="onb-setup-preview" style={{ flex: 1, minWidth: 0, position: 'sticky', top: 0 }}>
            {/* Preview card */}
            <div style={{
              borderRadius: 18, overflow: 'hidden',
              border: `1px solid ${primaryColor}30`,
              background: '#0e0e0e',
              boxShadow: `0 8px 32px ${primaryColor}18`,
            }}>
              {/* Hero */}
              <div style={{ background: primaryColor, padding: '24px 20px 18px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', right: -32, top: -32, width: 120, height: 120,
                  borderRadius: '50%', border: '28px solid rgba(255,255,255,.08)',
                  pointerEvents: 'none',
                }} />
                {/* Logo mark */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(255,255,255,.15)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12, overflow: 'hidden',
                }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontFamily: 'Anton', fontSize: 20, color: '#fff', lineHeight: 1 }}>
                      {(localName[0] ?? 'B').toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: headingFont.family, fontWeight: +headingFont.weight, fontSize: 22, color: '#fff', lineHeight: 1.1, letterSpacing: '-.01em' }}>
                  {localName || 'Your Brand'}
                </div>
                <div style={{ fontFamily: bodyFont.family, fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 5 }}>
                  Brand theme preview
                </div>
              </div>

              {/* Palette bar */}
              <div style={{ display: 'flex', height: 14, borderTop: '2px solid rgba(0,0,0,.25)', borderBottom: '2px solid rgba(0,0,0,.25)' }}>
                {(palette.length > 0 ? palette : [primaryColor]).map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c }} />
                ))}
              </div>

              {/* Type specimen */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontFamily: headingFont.family, fontWeight: +headingFont.weight, fontSize: 20, color: '#fff', marginBottom: 5 }}>
                  The quick brown fox
                </div>
                <div style={{ fontFamily: bodyFont.family, fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                  Body copy in {bodyFont.label} — clean and readable at every size.
                </div>
              </div>

              {/* Colour chips */}
              <div style={{ padding: '12px 20px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(palette.length > 0 ? palette : [primaryColor]).map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '5px 9px',
                    border: '1px solid rgba(255,255,255,.07)',
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'monospace' }}>{c.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="tiny" style={{ textAlign: 'center', color: 'var(--t3)', marginTop: 10 }}>
              Live preview · updates as you type
            </p>
          </div>

          {/* ── Right: config form ─────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Brand name */}
            <div className="onb-field">
              <label className="onb-label">
                Brand name <span style={{ color: 'var(--c-red)' }}>*</span>
              </label>
              <input
                className="onb-input"
                type="text"
                placeholder="e.g. Acme Studio"
                value={localName}
                autoFocus
                onChange={(e) => setLocalName(e.target.value)}
              />
            </div>

            {/* Logo upload */}
            <div className="onb-field">
              <label className="onb-label">
                Logo <span className="tiny" style={{ marginLeft: 4 }}>optional</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: '1.5px dashed var(--line-2)', borderRadius: 12, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  background: 'var(--card)', transition: 'border-color .15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-2)')}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--card-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>
                    {logoFile ? logoFile.name : 'Upload your logo'}
                  </div>
                  <div className="tiny" style={{ marginTop: 2 }}>PNG, SVG, or JPG · up to 5 MB</div>
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg,.webp" style={{ display: 'none' }} onChange={handleLogoChange} />
            </div>

            {/* Palette */}
            <div className="onb-field">
              <label className="onb-label">Brand palette</label>
              <ColorPaletteBuilder palette={palette} onChange={setPalette} />
            </div>

            {/* Typography */}
            <div className="onb-field" style={{ marginBottom: 24 }}>
              <label className="onb-label">Typography</label>
              <div className="onb-setup-type-grid" style={{ display: 'flex', gap: 10 }}>
                <FontDropdown
                  label="Heading"
                  options={HEADING_FONTS}
                  value={headingFont}
                  onChange={setHeadingFont}
                  accentColor="var(--accent)"
                />
                <FontDropdown
                  label="Body"
                  options={BODY_FONTS}
                  value={bodyFont}
                  onChange={setBodyFont}
                  accentColor="var(--accent)"
                />
              </div>
            </div>

            {/* Tone */}
            <div className="onb-field" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <label className="onb-label" style={{ margin: 0 }}>Brand voice</label>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
                  color: 'rgba(255,222,66,.6)', background: 'rgba(255,222,66,.08)',
                  border: '1px solid rgba(255,222,66,.15)', borderRadius: 4, padding: '1px 6px',
                }}>Preset</span>
              </div>
              <div className="onb-setup-voice-grid" style={{ display: 'flex', gap: 8 }}>
                {TONES.map(({ id, label, desc }) => {
                  const active = selectedTone === id
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedTone(active ? null : id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 3,
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: active ? '1.5px solid var(--accent)' : '1.5px solid rgba(255,255,255,.10)',
                        background: active ? 'rgba(255,222,66,.08)' : '#111113',
                        cursor: 'pointer',
                        transition: 'border-color .15s, background .15s',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,.24)' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,.10)' }}
                    >
                      {active && (
                        <span style={{
                          position: 'absolute', top: 8, right: 8,
                          width: 16, height: 16, borderRadius: '50%',
                          background: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                      )}
                      <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--t1)' }}>{label}</span>
                      <span style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.4 }}>{desc}</span>
                    </button>
                  )
                })}
              </div>
              <p className="tiny" style={{ color: 'var(--t3)', marginTop: 8 }}>
                Pick the closest match — you can fine-tune tone, spectrum, and custom instructions in your brand kit later.
              </p>
            </div>

            <button
              className="btn primary onb-cta"
              disabled={!canSetup}
              onClick={handleGenerate}
              style={{ width: '100%' }}
            >
              Generate my brand kit <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
