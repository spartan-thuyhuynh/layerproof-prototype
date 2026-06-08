import { useState, useRef, useEffect } from 'react'
import type { BrandKit, ColorPalette } from '@/types/brand'
import type { EditorActions } from '@/components/sections/types'
import { X, Plus, Pencil, Trash } from '@/icons'
import { Portal } from '@/lib/Portal'
import { SaveableField } from '@/components/edit/SaveableField'

interface ColorPickerModalProps {
  kit: BrandKit
  ed: EditorActions
  onClose: () => void
  onDone: () => void
}

/* ── Swatch item ─────────────────────────────────────────────── */
function SwatchItem({
  c, pi, ci, ed,
}: {
  c: { name: string; hex: string }
  pi: number
  ci: number
  ed: EditorActions
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const lum = (() => {
    const h = c.hex.replace('#', '').padEnd(6, '0')
    return parseInt(h.slice(0, 2), 16) * 0.299 +
           parseInt(h.slice(2, 4), 16) * 0.587 +
           parseInt(h.slice(4, 6), 16) * 0.114
  })()

  return (
    <div className="pal-swatch-item">
      <div
        className="pal-swatch-box"
        style={{ background: c.hex }}
        onClick={() => inputRef.current?.click()}
        title="Click to pick color"
      >
        <input
          ref={inputRef}
          type="color"
          value={c.hex.length === 7 ? c.hex : '#888888'}
          className="pal-color-input"
          onChange={(e) =>
            ed.setVal(['colors', 'palettes', pi, 'colors', ci, 'hex'], e.target.value)
          }
        />
        <button
          className="pal-swatch-remove"
          style={{ color: lum > 140 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)' }}
          onClick={(e) => {
            e.stopPropagation()
            ed.removeItem(['colors', 'palettes', pi, 'colors'], ci)
          }}
          title="Remove"
        >×</button>
      </div>
      <input
        className="pal-swatch-name"
        value={c.name}
        onChange={(e) =>
          ed.setVal(['colors', 'palettes', pi, 'colors', ci, 'name'], e.target.value)
        }
        placeholder="Name"
        onClick={(e) => e.stopPropagation()}
      />
      <span className="pal-swatch-hex">{c.hex.toUpperCase()}</span>
    </div>
  )
}

/* ── Palette card ────────────────────────────────────────────── */
function PaletteCard({
  palette, pi, ed,
}: {
  palette: ColorPalette
  pi: number
  ed: EditorActions
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(palette.name)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function commitName() {
    const v = nameVal.trim()
    if (v) ed.setVal(['colors', 'palettes', pi, 'name'], v)
    else setNameVal(palette.name)
    setEditingName(false)
  }

  function addColor() {
    ed.addItem(['colors', 'palettes', pi, 'colors'], { name: 'New color', hex: '#888888', role: '' })
  }

  return (
    <div className="color-palette-card" style={{ padding: '18px 20px' }}>
      {/* header */}
      <div className="pal-header">
        <div className="pal-name-area">
          {editingName ? (
            <input
              className="pal-name-input"
              value={nameVal}
              autoFocus
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName()
                if (e.key === 'Escape') { setNameVal(palette.name); setEditingName(false) }
              }}
            />
          ) : (
            <span className="pal-name">{palette.name}</span>
          )}
          <button className="pal-icon-btn" onClick={() => { setNameVal(palette.name); setEditingName(true) }} title="Rename">
            <Pencil style={{ width: 13, height: 13 }} />
          </button>
        </div>

        <div className="pal-menu-wrap" ref={menuRef}>
          <button className="pal-icon-btn" onClick={() => setShowMenu((o) => !o)} title="More options">
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <circle cx="10" cy="4.5" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="15.5" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <div className="pal-menu">
              <button
                className="pal-menu-item danger"
                onClick={() => { ed.removeItem(['colors', 'palettes'], pi); setShowMenu(false) }}
              >
                <Trash style={{ width: 13, height: 13 }} /> Delete palette
              </button>
            </div>
          )}
        </div>
      </div>

      {/* description */}
      <SaveableField
        value={palette.desc}
        onSave={(v) => ed.setVal(['colors', 'palettes', pi, 'desc'], v)}
        placeholder="Add a usage guide or description…"
        resetKey={`${palette.id}`}
        rows={2}
      />

      {/* swatches */}
      <div className="pal-swatches" style={{ marginTop: 14 }}>
        {palette.colors.map((c, ci) => (
          <SwatchItem key={ci} c={c} pi={pi} ci={ci} ed={ed} />
        ))}
        <button className="pal-add-swatch" onClick={addColor}>
          <Plus style={{ width: 20, height: 20 }} />
          <span>Add Color</span>
        </button>
      </div>
    </div>
  )
}

/* ── Modal ────────────────────────────────────────────────────── */
export function ColorPickerModal({ kit, ed, onClose, onDone }: ColorPickerModalProps) {
  function addPalette() {
    const id = 'pal-' + Math.random().toString(36).slice(2, 8)
    ed.addItem(['colors', 'palettes'], { id, name: 'New Palette', desc: '', colors: [] })
  }

  const palettes = kit.colors.palettes

  return (
    <Portal>
      <div className="scrim" onClick={onClose}>
        <div
          className="modal"
          style={{ maxWidth: 660, display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="mhead" style={{ flexShrink: 0 }}>
            <button className="x" onClick={onClose}>
              <X style={{ width: 16, height: 16 }} />
            </button>
            <div className="cum-title">Brand Colors</div>
            <div className="cum-hint">Build your color palettes — click any swatch to pick a color</div>
          </div>

          {/* body — scrollable */}
          <div
            className="mbody"
            style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}
          >
            {palettes.map((p, pi) => (
              <PaletteCard key={p.id} palette={p} pi={pi} ed={ed} />
            ))}

            {palettes.length === 0 && (
              <div style={{
                textAlign: 'center', color: 'var(--t3)', fontSize: 13,
                padding: '32px 0', border: '1px dashed #333', borderRadius: 10,
              }}>
                No palettes yet — click &ldquo;Add Palette&rdquo; to start
              </div>
            )}

            {/* add palette button inline */}
            <button
              onClick={addPalette}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'none', border: '1px dashed #3a3a3a', borderRadius: 10,
                color: 'var(--t2)', fontSize: 13, padding: '10px 16px',
                cursor: 'pointer', width: '100%', justifyContent: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = 'var(--t1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = 'var(--t2)' }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Add Palette
            </button>
          </div>

          {/* footer */}
          <div className="mfoot" style={{ flexShrink: 0 }}>
            <button className="btn ghost sm" onClick={onClose}>Cancel</button>
            <button className="btn primary sm" onClick={onDone}>Done</button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
