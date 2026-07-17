import { useState, useEffect, useRef } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import type { EditorActions } from './types'
import { Info } from '@/shared/icons'
import { Tip } from '@/shared/components/ui/Tip'

interface ImageryProps {
  kit: BrandKit
  ed: EditorActions
}

/* ── Upload icon ──────────────────────────────────────────────── */
function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

/* ── Asset card ───────────────────────────────────────────────── */
function AssetCard({ name, size, preview }: { name: string; size: string; preview?: string }) {
  const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE'
  const bg = preview ?? 'linear-gradient(135deg,#1c1c1c,#2e2e2e)'
  return (
    <div className="logo-file-card">
      <div className="asset-preview-cover" style={{ background: bg }}>
        <span className="asset-ext-badge">{ext}</span>
      </div>
      <div className="logo-file-info">
        <span className="logo-file-name" title={name}>{name}</span>
        <span className="logo-file-size">{size}</span>
      </div>
    </div>
  )
}

/* ── AI summary ───────────────────────────────────────────────── */
function generateVisualStyleText(kit: BrandKit): string {
  const tags      = kit.imagery.tags.map(t => t.t).join(', ')
  const dos       = kit.imagery.dos.join(', ')
  const donts     = kit.imagery.donts.join(', ')
  const toneAttrs = kit.tone.attrs.map(a => a.t).join(', ')
  const palette   = kit.colors.palettes[0]?.colors.map(c => c.name).join(', ') ?? ''

  return [
    `• ${dos}. Inspired by: ${tags}.`,
    `• Dark, textured surfaces that let subjects breathe. Avoid: ${donts}.`,
    `• Subject dominates the frame. Tone is ${toneAttrs.toLowerCase()} — imagery should match. Palette: ${palette}.`,
    `• ${tags}. Always editorial, never stock. Negative space is intentional.`,
  ].join('\n')
}

type Phase = 'idle' | 'thinking' | 'typing'

/* ── Main ─────────────────────────────────────────────────────── */
export function Imagery({ kit, ed }: ImageryProps) {
  const assets  = kit.imagery.assets ?? []
  const kitText = kit.imagery.styleDesc ?? kit.imagery.desc ?? ''

  const [value,    setValue]   = useState(kitText)
  const [phase,    setPhase]   = useState<Phase>('idle')
  const [editing,  setEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typeTimer  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset on kit switch
  useEffect(() => {
    setPhase('idle')
    setValue(kit.imagery.styleDesc ?? kit.imagery.desc ?? '')
    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current)
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [kit.id])

  function handleChange(text: string) {
    setValue(text)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      ed.setVal(['imagery', 'styleDesc'], text)
    }, 600)
  }

  async function handleRewrite() {
    if (typeTimer.current) clearInterval(typeTimer.current)

    // Phase 1: thinking
    setPhase('thinking')
    setValue('')
    await new Promise(r => setTimeout(r, 900))

    // Phase 2: typing
    const result = generateVisualStyleText(kit)
    setPhase('typing')

    let i = 0
    const CHUNK = 4
    typeTimer.current = setInterval(() => {
      i = Math.min(i + CHUNK, result.length)
      setValue(result.slice(0, i))
      if (i >= result.length) {
        clearInterval(typeTimer.current!)
        typeTimer.current = null
        setPhase('idle')
        ed.setVal(['imagery', 'styleDesc'], result)
      }
    }, 16)
  }

  const busy = phase !== 'idle'

  function handleEdit() {
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  function handleSave() {
    setEditing(false)
    ed.setVal(['imagery', 'styleDesc'], value)
  }

  function handleCancel() {
    setEditing(false)
    setValue(kit.imagery.styleDesc ?? kit.imagery.desc ?? '')
  }

  return (
    <div className="fade-in assets-page">
      {/* ── page header ── */}
      <div className="assets-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 className="assets-page-title">Image Assets</h2>
            <Tip label="Incorporate visual elements and brand assets to maintain design consistency" side="right">
              <span className="section-info-icon"><Info style={{ width: 20, height: 20 }} /></span>
            </Tip>
          </div>
        </div>
        <button className="assets-upload-btn">
          <UploadIcon /> Upload Images
        </button>
      </div>

      {/* ── Visual Style Rules card ── */}
      <div className="assets-style-card">
        <div className="vsr-header-row">
          <div>
            <div className="assets-style-title">Visual Style Rules</div>
          </div>

          <div className="vsr-actions">
            {editing ? (
              <>
                <button className="vsr-cancel-btn" onClick={handleCancel}>Cancel</button>
                <button className="vsr-save-btn" onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                <button className="vsr-edit-btn" onClick={handleEdit} disabled={busy}>Edit</button>
                <button
                  className={`vsr-rewrite-btn${busy ? ' vsr-rewrite-btn--busy' : ''}`}
                  onClick={handleRewrite}
                  disabled={busy}
                >
                  {phase === 'thinking' && <span className="vsr-spinner vsr-spinner--brand" />}
                  {phase === 'typing'   && <span className="vsr-sparkle vsr-sparkle--pulse">✦</span>}
                  {phase === 'idle'     && <span className="vsr-sparkle">✦</span>}
                  <span>
                    {phase === 'thinking' ? 'Thinking…' : phase === 'typing' ? 'Writing…' : 'Rewrite with AI'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="vsr-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="vsr-textarea"
              value={value}
              placeholder="Describe your visual style rules…"
              rows={6}
              onChange={e => handleChange(e.target.value)}
            />
          </div>
        ) : (
          <div className="vsr-display">
            {value
              ? <p className="vsr-display-text">{value}{phase === 'typing' && <span className="vsr-cursor vsr-cursor--inline" />}</p>
              : (
                <>
                  <p className="vsr-display-empty-desc">Visual Style Rules define the visual language your brand imagery should follow — guiding tone, aesthetics, and consistency across all visuals. For example:</p>
                  <ul className="vsr-display-empty-list">
                    <li>Lighting & mood — e.g. dark and dramatic, bright and airy</li>
                    <li>Composition & framing — e.g. tight crops, wide negative space</li>
                    <li>Color temperature — e.g. warm tones, desaturated, high contrast</li>
                    <li>What to avoid — e.g. stock photography, flat lighting, busy backgrounds</li>
                  </ul>
                </>
              )
            }
          </div>
        )}
      </div>

      {/* ── Uploaded grid ── */}
      {assets.length > 0 && (
        <div className="assets-grid-section">
          <div className="assets-grid-label">Uploaded ({assets.length})</div>
          <div className="logos-card-grid">
            {assets.map((a, i) => (
              <AssetCard key={i} name={a.name} size={a.size} preview={a.preview} />
            ))}
          </div>
        </div>
      )}

      {assets.length === 0 && (
        <div className="assets-empty">
          <div className="assets-empty-icon"><UploadIcon /></div>
          <div className="assets-empty-text">No images uploaded yet</div>
          <div className="assets-empty-sub">Click &ldquo;Upload Images&rdquo; to add your brand assets</div>
        </div>
      )}
    </div>
  )
}
