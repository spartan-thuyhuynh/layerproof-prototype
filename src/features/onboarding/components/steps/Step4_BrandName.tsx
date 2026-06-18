import { useEffect, useRef, useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { ArrowRight } from '@/shared/icons'

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

const GENERATING_STEPS = [
  'Reading your brand details…',
  'Generating colour palette…',
  'Pairing display & body fonts…',
  'Composing brand style rules…',
  'Rendering your theme…',
]

type Phase = 'hook' | 'setup' | 'generating' | 'done'

// ─── Generating animation ─────────────────────────────────────────────────────

function GeneratingPhase({ brandName, color }: { brandName: string; color: string }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, GENERATING_STEPS.length - 1)), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="onb-step fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, gap: 0 }}>
      {/* Spinning ring */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 32 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ animation: 'spin 1.2s linear infinite' }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray="160 54" strokeLinecap="round" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color, lineHeight: 1,
        }}>
          {brandName[0]?.toUpperCase() ?? '?'}
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', margin: '0 0 10px', letterSpacing: '-.02em' }}>
        Generating your brand theme
      </h2>
      <p style={{ fontSize: 14, color: 'var(--t2)', margin: '0 0 32px' }}>Pulling it all together — won't take long.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        {GENERATING_STEPS.map((label, i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            opacity: i <= idx ? 1 : 0.25,
            transition: 'opacity .3s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: i < idx ? color : i === idx ? color + '33' : 'var(--card)',
              border: `2px solid ${i <= idx ? color : 'var(--line)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .3s',
            }}>
              {i < idx && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13.5, color: i <= idx ? 'var(--t1)' : 'var(--t3)', fontWeight: i === idx ? 600 : 400 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Done / Congratulations phase ────────────────────────────────────────────

function DonePhase({ brandName, color, fontPair, palette, logoPreview, onContinue }: {
  brandName: string
  color: string
  fontPair: { display: string; body: string }
  palette: string[]
  logoPreview: string | null
  onContinue: () => void
}) {
  const base = import.meta.env.BASE_URL
  const activePalette = palette.length > 0 ? palette : [color]

  return (
    <div className="onb-step fade-in" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div className="h-eyebrow" style={{ marginBottom: 6 }}>Theme generated</div>
      <h1 className="onb-step-title" style={{ marginBottom: 6, fontFamily: 'Anton', fontWeight: 400, fontSize: 32, letterSpacing: '.01em' }}>Your brand theme is ready.</h1>
      <p className="onb-step-sub" style={{ maxWidth: 340, margin: '0 auto 24px' }}>
        Here's what we built. Any output with this theme applied will stay on-brand automatically.
      </p>

      {/* ── Brand Kit card ─────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 400, margin: '0 auto 10px',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.08)',
        background: '#131313',
        textAlign: 'left',
      }}>
        {/* Section label */}
        <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)' }}>
            Brand Kit
          </span>
        </div>

        {/* Kit identity row */}
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo */}
          <div style={{
            width: 52, height: 52, borderRadius: 13, flexShrink: 0,
            background: logoPreview ? '#1a1a1a' : color,
            border: logoPreview ? `1px solid rgba(255,255,255,.1)` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: `0 2px 12px ${color}44`,
          }}>
            {logoPreview ? (
              <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontFamily: 'Anton', fontSize: 24, color: '#fff', lineHeight: 1 }}>
                {brandName[0]?.toUpperCase() ?? 'B'}
              </span>
            )}
          </div>

          {/* Name + palette */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: fontPair.display, fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.1, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {brandName}
            </div>
            {/* Palette dots */}
            <div style={{ display: 'flex', gap: 5 }}>
              {activePalette.map((c, i) => (
                <div key={i} style={{
                  width: i === 0 ? 22 : 16, height: 16, borderRadius: 5,
                  background: c, border: '1px solid rgba(255,255,255,.1)',
                  transition: 'width .2s',
                }} />
              ))}
            </div>
          </div>

          {/* Check */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: color + '22', border: `1.5px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Brand Theme card ───────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 400, margin: '0 auto 20px',
        borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${color}28`,
        background: '#131313',
        textAlign: 'left',
        boxShadow: `0 8px 32px ${color}18`,
      }}>
        {/* Section label */}
        <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)' }}>
            Brand Theme
          </span>
        </div>

        {/* Hero: colour backdrop with brand name in display font */}
        <div style={{ position: 'relative', height: 120, background: color, overflow: 'hidden' }}>
          <img
            src={`${base}onboarding/illustration.png`}
            alt=""
            style={{ position: 'absolute', right: -10, top: -10, height: 140, width: 'auto', opacity: 0.3, mixBlendMode: 'luminosity' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div style={{ position: 'absolute', inset: 0, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: fontPair.display, fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>
              {brandName}
            </div>
            <div style={{ fontFamily: fontPair.body, fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
              {fontPair.display} · {fontPair.body}
            </div>
          </div>
        </div>

        {/* Palette bar */}
        <div style={{ display: 'flex', height: 6 }}>
          {activePalette.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>

        {/* Type + colour row */}
        <div style={{ display: 'flex', padding: '14px 16px', gap: 12 }}>
          {/* Typography */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Typography</div>
            <div style={{ fontFamily: fontPair.display, fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1 }}>Aa</div>
            <div style={{ fontFamily: fontPair.body, fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>The quick brown fox</div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: 'rgba(255,255,255,.06)', alignSelf: 'stretch' }} />

          {/* Colours */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 6 }}>Colours</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {activePalette.map((c, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: 6, background: c,
                  border: '1px solid rgba(255,255,255,.1)',
                  outline: i === 0 ? `2px solid ${c}` : 'none',
                  outlineOffset: 2,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="tiny" style={{ color: 'var(--t3)', marginBottom: 20 }}>
        Fine-tune colours, fonts, and voice any time in the brand kit editor.
      </p>

      <button className="btn primary onb-cta" onClick={onContinue} style={{ maxWidth: 400, width: '100%' }}>
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

export function Step4_BrandName() {
  const { setBrandName, setTagline, nextStep, prevStep } = useOnboardingStore()
  const { createKit, updateKit, setAppliedId } = useBrandStore()

  const [phase, setPhase]             = useState<Phase>('hook')
  const [localName, setLocalName]     = useState('')
  const [palette,       setPalette]     = useState<string[]>(DEFAULT_PALETTE)
  const [headingFont,   setHeadingFont] = useState(HEADING_FONTS[0])
  const [bodyFont,      setBodyFont]    = useState(BODY_FONTS[0])

  const primaryColor = palette[0] ?? '#ec4899'
  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canSetup = localName.trim().length > 0

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
      setBrandName(localName.trim())
      setPhase('done')
    }, GENERATING_STEPS.length * 600 + 300)
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
        onContinue={() => nextStep()}
      />
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
            <BackButton onClick={prevStep} />
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
          <h1 className="onb-step-title" style={{ marginBottom: 12, fontSize: 32, fontFamily: 'Anton', fontWeight: 400, letterSpacing: '.01em' }}>Want to bring your brand?</h1>
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
              onClick={() => setPhase('setup')}
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
          <button className="onb-skip" onClick={() => nextStep()}>Skip for now</button>
        </div>

        {/* Header — spans full width above both panels */}
        <div style={{ marginBottom: 20 }}>
          <div className="h-eyebrow" style={{ marginBottom: 6 }}>Brand kit</div>
          <h1 className="onb-step-title" style={{ marginBottom: 4, fontFamily: 'Anton', fontWeight: 400, fontSize: 28, letterSpacing: '.01em' }}>A few quick details</h1>
          <p className="tiny" style={{ color: 'var(--t3)' }}>You can always adjust your brand kit later.</p>
        </div>

        {/* Two-panel body */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* ── Left: live preview ─────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, position: 'sticky', top: 0 }}>
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
              <div style={{ display: 'flex', gap: 10 }}>
                <FontDropdown
                  label="Heading"
                  options={HEADING_FONTS}
                  value={headingFont}
                  onChange={setHeadingFont}
                  accentColor={primaryColor}
                />
                <FontDropdown
                  label="Body"
                  options={BODY_FONTS}
                  value={bodyFont}
                  onChange={setBodyFont}
                  accentColor={primaryColor}
                />
              </div>
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
