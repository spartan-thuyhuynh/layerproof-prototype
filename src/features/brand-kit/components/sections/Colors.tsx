import { useState, useRef, useEffect } from 'react'
import type { BrandKit, ColorPalette } from '@/features/brand-kit/types/brand'
import { Plus, Pencil, Trash, Info } from '@/shared/icons'
import { Tip } from '@/shared/components/ui/Tip'
import type { EditorActions } from './types'
import { SaveableField } from '@/features/brand-kit/components/edit/SaveableField'

interface ColorsProps {
  kit: BrandKit
  ed: EditorActions
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

  // determine text color for hex label based on luminance
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
        {/* hidden native color picker */}
        <input
          ref={inputRef}
          type="color"
          value={c.hex.length === 7 ? c.hex : '#888888'}
          className="pal-color-input"
          onChange={(e) => ed.setVal(['colors', 'palettes', pi, 'colors', ci, 'hex'], e.target.value)}
        />
        <Tip label="Remove" side="top">
          <button
            className="pal-swatch-remove"
            style={{ color: lum > 140 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)' }}
            onClick={(e) => { e.stopPropagation(); ed.removeItem(['colors', 'palettes', pi, 'colors'], ci) }}
          >×</button>
        </Tip>
      </div>
      <input
        className="pal-swatch-name"
        value={c.name}
        onChange={(e) => ed.setVal(['colors', 'palettes', pi, 'colors', ci, 'name'], e.target.value)}
        placeholder="Name"
        onClick={(e) => e.stopPropagation()}
      />
      <span className="pal-swatch-hex">{c.hex.toUpperCase()}</span>
    </div>
  )
}

/* ── Palette card ────────────────────────────────────────────── */
function PaletteCard({ palette, pi, ed }: { palette: ColorPalette; pi: number; ed: EditorActions }) {
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(palette.name)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // close menu on outside click
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

  function startEdit() {
    setNameVal(palette.name)
    setEditingName(true)
  }

  function addColor() {
    ed.addItem(['colors', 'palettes', pi, 'colors'], { name: 'New color', hex: '#888888', role: '' })
  }

  return (
    <div className="color-palette-card">
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
          <Tip label="Rename palette" side="top">
            <button className="pal-icon-btn" onClick={startEdit}>
              <Pencil style={{ width: 13, height: 13 }} />
            </button>
          </Tip>
        </div>

        <div className="pal-menu-wrap" ref={menuRef}>
          <Tip label="More options" side="top">
            <button className="pal-icon-btn" onClick={() => setShowMenu((o) => !o)}>
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                <circle cx="10" cy="4.5" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="10" cy="15.5" r="1.5" />
              </svg>
            </button>
          </Tip>
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
      <div className="pal-swatches">
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

/* ── Main ────────────────────────────────────────────────────── */
export function Colors({ kit, ed }: ColorsProps) {
  function addPalette() {
    const id = 'pal-' + Math.random().toString(36).slice(2, 8)
    ed.addItem(['colors', 'palettes'], { id, name: 'New Palette', desc: '', colors: [] })
  }

  return (
    <div className="fade-in colors-page">
      <div className="colors-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 className="colors-page-title">Colors</h2>
            <Tip label="Choose your brand colors to create a consistent and impactful visual identity across all your materials" side="right">
              <span className="section-info-icon"><Info style={{ width: 20, height: 20 }} /></span>
            </Tip>
          </div>
        </div>
        <button className="colors-new-btn" onClick={addPalette}>
          <Plus style={{ width: 14, height: 14 }} /> New Palette
        </button>
      </div>

      <div className="color-palettes">
        {kit.colors.palettes.map((p, pi) => (
          <PaletteCard key={p.id} palette={p} pi={pi} ed={ed} />
        ))}
        {kit.colors.palettes.length === 0 && (
          <div className="colors-empty">No palettes yet. Click &ldquo;New Palette&rdquo; to create your first.</div>
        )}
      </div>
    </div>
  )
}
