import { useEffect, useState } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { Chevron } from '@/shared/icons'
import type { EditorActions } from './types'

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

/* ── Font config card ─────────────────────────────────────────── */
interface FontCardProps {
  label: string
  typeKey: 'display' | 'body'
  family: string
  weight: string
  note: string
  ed: EditorActions
}

function FontCard({ label, typeKey, family, weight, note, ed }: FontCardProps) {
  const [italic, setItalic] = useState(false)
  const bold = isBold(weight)

  useEffect(() => { loadFont(family) }, [family])

  // ensure selected font is in list, else prepend
  const options = GOOGLE_FONTS.includes(family) ? GOOGLE_FONTS : [family, ...GOOGLE_FONTS]

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

  // preload both fonts on mount
  useEffect(() => {
    loadFont(display.family)
    loadFont(body.family)
  }, [display.family, body.family])

  const displayBold = isBold(display.weight)

  return (
    <div className="fade-in type-page">
      <div className="type-page-header">
        <div>
          <h2 className="type-page-title">Typography</h2>
          <p className="type-page-sub">
            Configure your typography pairing for a cohesive and visually appealing design
          </p>
        </div>
      </div>

      <div className="type-layout">
        {/* ── Left: config cards ── */}
        <div className="type-config-col">
          <FontCard
            label="DISPLAY FONT"
            typeKey="display"
            family={display.family}
            weight={display.weight}
            note={display.note}
            ed={ed}
          />
          <FontCard
            label="BODY FONT"
            typeKey="body"
            family={body.family}
            weight={body.weight}
            note={body.note}
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
