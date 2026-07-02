import { useEffect, useState } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { Chevron, Info } from '@/shared/icons'
import type { EditorActions } from './types'
import { FontManagerModal, type CustomFontFamily } from '../modals/FontManagerModal'
import { Tip } from '@/shared/components/ui/Tip'

interface TypographyProps {
  kit: BrandKit
  ed: EditorActions
}

/* ── Google Fonts ─────────────────────────────────────────────── */
const GOOGLE_FONTS = [
  'Anton', 'Archivo', 'Bebas Neue', 'DM Sans', 'DM Serif Display',
  'Fraunces', 'IBM Plex Mono', 'IBM Plex Sans', 'Inter',
  'Josefin Sans', 'Lato', 'Libre Baskerville', 'Merriweather',
  'Montserrat', 'Nunito', 'Oswald', 'Playfair Display',
  'Poppins', 'Raleway', 'Roboto', 'Space Grotesk', 'Syne',
  'Work Sans',
]

function loadFont(family: string) {
  const id = `gf-${family.replace(/\s+/g, '-').toLowerCase()}`
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:ital,wght@0,400;0,700;0,800;1,400;1,700&display=swap`
    document.head.appendChild(link)
  }
}

function isBold(w: string) {
  return parseInt(w) >= 700
}

function checkFontAvailable(family: string, customFamilies: CustomFontFamily[]): boolean {
  if (GOOGLE_FONTS.includes(family)) return true
  if (customFamilies.some((f) => f.family === family)) return true
  return false
}

/* Warning icon SVG */
function UnavailableIcon() {
  return (
    <svg
      className="font-unavailable-icon"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 1.5L13.5 12.5H1.5L7.5 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line x1="7.5" y1="6" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7.5" cy="11" r="0.7" fill="currentColor" />
    </svg>
  )
}

/* ── Font config card ─────────────────────────────────────────── */
interface FontCardProps {
  label: string
  typeKey: 'display' | 'body'
  family: string
  weight: string
  note: string
  customFamilies: CustomFontFamily[]
  ed: EditorActions
}

function FontCard({ label, typeKey, family, weight, note, customFamilies, ed }: FontCardProps) {
  const [italic, setItalic] = useState(false)
  const [fontAvailable, setFontAvailable] = useState(true)
  const bold = isBold(weight)

  useEffect(() => {
    if (GOOGLE_FONTS.includes(family)) {
      loadFont(family)
      setFontAvailable(true)
    } else {
      const t = setTimeout(() => setFontAvailable(checkFontAvailable(family, customFamilies)), 100)
      return () => clearTimeout(t)
    }
  }, [family, customFamilies])

  // build options: uploaded custom fonts first, then google fonts, with current family always present
  const customNames = customFamilies.map((f) => f.family)
  const knownFonts = [...customNames, ...GOOGLE_FONTS]
  const options = knownFonts.includes(family) ? knownFonts : [family, ...knownFonts]

  return (
    <div className="type-config-card">
      <div className="type-config-role">{label}</div>
      <div className="type-config-note">{note}</div>
      <div
        className="type-config-specimen"
        style={{
          fontFamily: `'${family}', sans-serif`,
          fontWeight: bold ? 800 : 400,
          fontStyle: italic ? 'italic' : 'normal',
        }}
      >
        Ag
      </div>
      <div className="type-config-sublabel">Font</div>
      <div className="type-config-controls">
        <div className="type-select-wrap">
          <select
            className="type-select"
            value={family}
            onChange={(e) => {
              loadFont(e.target.value)
              ed.setVal(['type', typeKey, 'family'], e.target.value)
            }}
          >
            {options.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <Chevron className="type-select-chevron" style={{ width: 14, height: 14 }} />
          {!fontAvailable && (
            <span className="font-unavailable-badge" title="Font not available — upload the font file using the Upload Font button">
              <UnavailableIcon />
            </span>
          )}
        </div>
        <button
          className={`type-toggle${bold ? ' active' : ''}`}
          onClick={() => ed.setVal(['type', typeKey, 'weight'], bold ? '400' : '800')}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          className={`type-toggle${italic ? ' active' : ''}`}
          onClick={() => setItalic((v) => !v)}
          title="Italic"
        >
          <i>I</i>
        </button>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export function Typography({ kit, ed }: TypographyProps) {
  const { display, body } = kit.type
  const [customFamilies, setCustomFamilies] = useState<CustomFontFamily[]>([])
  const [showFontManager, setShowFontManager] = useState(false)

  // preload both fonts on mount
  useEffect(() => {
    loadFont(display.family)
    loadFont(body.family)
  }, [display.family, body.family])

  function handleAddFamily(incoming: CustomFontFamily) {
    setCustomFamilies((prev) => {
      const existing = prev.find((f) => f.family === incoming.family)
      if (existing) {
        // merge new variants in
        const merged = [...existing.variants]
        for (const v of incoming.variants) {
          if (!merged.some((m) => m.name === v.name)) merged.push(v)
        }
        return prev.map((f) => f.family === incoming.family ? { ...f, variants: merged } : f)
      }
      return [incoming, ...prev]
    })
  }

  function handleRemoveFamily(family: string) {
    setCustomFamilies((prev) => prev.filter((f) => f.family !== family))
  }

  function handleRemoveVariant(family: string, variant: string) {
    setCustomFamilies((prev) => prev.map((f) => {
      if (f.family !== family) return f
      const variants = f.variants.filter((v) => v.name !== variant)
      return { ...f, variants }
    }).filter((f) => f.variants.length > 0))
  }

  const displayBold = isBold(display.weight)

  const unavailableFonts = [display.family, body.family].filter(
    (f) => !GOOGLE_FONTS.includes(f) && !checkFontAvailable(f, customFamilies)
  )

  return (
    <div className="fade-in type-page">
      {showFontManager && (
        <FontManagerModal
          families={customFamilies}
          onAdd={handleAddFamily}
          onRemoveFamily={handleRemoveFamily}
          onRemoveVariant={handleRemoveVariant}
          onClose={() => setShowFontManager(false)}
        />
      )}
      <div className="type-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 className="type-page-title">Typography</h2>
            <Tip label="Configure your typography pairing for a cohesive and visually appealing design" side="right">
              <span className="section-info-icon"><Info style={{ width: 20, height: 20 }} /></span>
            </Tip>
          </div>
        </div>
        <button className="font-upload-btn" onClick={() => setShowFontManager(true)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1v7M3 4l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Upload Font
        </button>
      </div>

      {unavailableFonts.length > 0 && (
        <div className="type-unavail-banner">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
            <path d="M8 2L1.5 13h13L8 2z" />
            <line x1="8" y1="7" x2="8" y2="10" />
            <circle cx="8" cy="12" r=".6" fill="currentColor" stroke="none" />
          </svg>
          <span>
            <strong>{unavailableFonts.join(' and ')}</strong>
            {unavailableFonts.length === 1 ? ' is' : ' are'} not available. Upload or change font to render it correctly.
          </span>
        </div>
      )}

      <div className="type-layout">
        {/* ── Left: config cards ── */}
        <div className="type-config-col">
          <FontCard
            label="DISPLAY FONT"
            typeKey="display"
            family={display.family}
            weight={display.weight}
            note={display.note}
            customFamilies={customFamilies}
            ed={ed}
          />
          <FontCard
            label="BODY FONT"
            typeKey="body"
            family={body.family}
            weight={body.weight}
            note={body.note}
            customFamilies={customFamilies}
            ed={ed}
          />
        </div>

        {/* ── Right: pairing preview ── */}
        <div className="type-preview-card">
          <div className="type-preview-section">
            <div className="type-preview-role">HEADER</div>
            <div
              className="type-preview-heading"
              style={{
                fontFamily: `'${display.family}', sans-serif`,
                fontWeight: displayBold ? 800 : 700,
              }}
            >
              {display.family}
            </div>
          </div>

          <div className="type-preview-divider" />

          <div className="type-preview-section">
            <div className="type-preview-role">BODY COPY</div>
            <div
              className="type-preview-body-name"
              style={{ fontFamily: `'${body.family}', sans-serif` }}
            >
              {body.family}
            </div>
            <p
              className="type-preview-body-text"
              style={{ fontFamily: `'${body.family}', sans-serif` }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
