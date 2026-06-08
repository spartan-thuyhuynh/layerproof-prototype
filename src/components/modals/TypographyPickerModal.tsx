import { useEffect, useState } from 'react'
import type { BrandKit } from '@/types/brand'
import type { EditorActions } from '@/components/sections/types'
import { X, Chevron } from '@/icons'
import { Portal } from '@/lib/Portal'

interface TypographyPickerModalProps {
  kit: BrandKit
  ed: EditorActions
  onClose: () => void
  onDone: () => void
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

function isBold(w: string) { return parseInt(w) >= 700 }

/* ── Font config card ─────────────────────────────────────────── */
function FontCard({
  label, typeKey, family, weight, note, ed,
}: {
  label: string
  typeKey: 'display' | 'body'
  family: string
  weight: string
  note: string
  ed: EditorActions
}) {
  const [italic, setItalic] = useState(false)
  const bold = isBold(weight)

  useEffect(() => { loadFont(family) }, [family])

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

/* ── Modal ────────────────────────────────────────────────────── */
export function TypographyPickerModal({ kit, ed, onClose, onDone }: TypographyPickerModalProps) {
  const { display, body } = kit.type
  const displayBold = isBold(display.weight)

  useEffect(() => {
    loadFont(display.family)
    loadFont(body.family)
  }, [display.family, body.family])

  return (
    <Portal>
      <div className="scrim" onClick={onClose}>
        <div
          className="modal"
          style={{ maxWidth: 740, display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="mhead" style={{ flexShrink: 0 }}>
            <button className="x" onClick={onClose}>
              <X style={{ width: 16, height: 16 }} />
            </button>
            <div className="cum-title">Typography</div>
            <div className="cum-hint">Choose your display and body typeface pairing</div>
          </div>

          {/* body */}
          <div className="mbody" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* top row: two config cards side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

            {/* bottom: live preview */}
            <div className="type-preview-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div className="type-preview-section">
                  <div className="type-preview-role">HEADER</div>
                  <div
                    className="type-preview-heading"
                    style={{
                      fontFamily: `'${display.family}', sans-serif`,
                      fontWeight: displayBold ? 800 : 700,
                      fontSize: 52,
                    }}
                  >
                    {display.family}
                  </div>
                </div>

                <div className="type-preview-section">
                  <div className="type-preview-role">BODY COPY</div>
                  <div
                    className="type-preview-body-name"
                    style={{ fontFamily: `'${body.family}', sans-serif`, fontSize: 22, marginBottom: 12 }}
                  >
                    {body.family}
                  </div>
                  <p
                    className="type-preview-body-text"
                    style={{ fontFamily: `'${body.family}', sans-serif`, fontSize: 14 }}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris.
                  </p>
                </div>
              </div>
            </div>

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
