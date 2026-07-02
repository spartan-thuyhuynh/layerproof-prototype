import { useRef, useState } from 'react'
import { X } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'

/* ── Types ─────────────────────────────────────────────────────── */
export interface FontVariant {
  name: string
  fontFace: FontFace
}

export interface CustomFontFamily {
  family: string
  variants: FontVariant[]
}

/* ── Filename parser ────────────────────────────────────────────── */
const WEIGHTS = [
  'Thin', 'ExtraLight', 'Extra Light', 'UltraLight', 'Ultra Light',
  'Light', 'Regular', 'Normal', 'Medium', 'SemiBold', 'Semi Bold',
  'DemiBold', 'Bold', 'ExtraBold', 'Extra Bold', 'UltraBold', 'Black', 'Heavy',
]
const STYLES = ['Italics', 'Italic', 'Oblique']

function parseFontFilename(filename: string): { family: string; variant: string } {
  const base = filename
    .replace(/\.(ttf|otf|woff2?)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()

  for (const weight of WEIGHTS) {
    for (const style of ['', ...STYLES]) {
      const suffix = style ? `${weight} ${style}` : weight
      if (base.toLowerCase().endsWith(suffix.toLowerCase())) {
        const family = base.slice(0, base.length - suffix.length).trim()
        if (family) return { family, variant: style ? `${weight} ${style}` : weight }
      }
    }
    // also check italic-first patterns like "LightItalic"
    for (const style of STYLES) {
      const suffix = `${weight}${style}`
      if (base.replace(/ /g, '').toLowerCase().endsWith(suffix.replace(/ /g, '').toLowerCase())) {
        const family = base.replace(new RegExp(weight + '\\s*' + style + '$', 'i'), '').trim()
        if (family) return { family, variant: `${weight} ${style}s`.replace('ss', 's') }
      }
    }
  }

  return { family: base, variant: 'Regular' }
}

/* ── Chevron icon ───────────────────────────────────────────────── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .15s' }}
    >
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Trash icon ─────────────────────────────────────────────────── */
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4h12M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4m2 0l-.8 9a1 1 0 01-1 .9H5.3a1 1 0 01-1-.9L3.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 7v4M9.5 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Props ──────────────────────────────────────────────────────── */
interface FontManagerModalProps {
  families: CustomFontFamily[]
  onAdd: (family: CustomFontFamily) => void
  onRemoveFamily: (family: string) => void
  onRemoveVariant: (family: string, variant: string) => void
  onClose: () => void
}

/* ── Modal ──────────────────────────────────────────────────────── */
export function FontManagerModal({
  families,
  onAdd,
  onRemoveFamily,
  onRemoveVariant,
  onClose,
}: FontManagerModalProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleExpand(family: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(family) ? next.delete(family) : next.add(family)
      return next
    })
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      const { family, variant } = parseFontFilename(file.name)
      const buffer = await file.arrayBuffer()
      try {
        const face = new FontFace(family, buffer)
        await face.load()
        document.fonts.add(face)
        onAdd({ family, variants: [{ name: variant, fontFace: face }] })
      } catch (err) {
        console.error('Failed to load font:', file.name, err)
      }
    }
    e.target.value = ''
  }

  return (
    <Portal>
      <div className="scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal fm-modal">
          <div className="fm-header">
            <h2 className="fm-title">Uploaded fonts</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                multiple
                style={{ display: 'none' }}
                onChange={handleFiles}
              />
              <button className="btn sm" onClick={() => fileInputRef.current?.click()}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add new
              </button>
              <button className="modal-x-btn" onClick={onClose} title="Close">
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          <div className="fm-body">
            {families.length === 0 && (
              <div className="fm-empty">
                No fonts uploaded yet. Click "Add new" to upload .ttf, .otf, or .woff files.
              </div>
            )}
            {families.map((fam) => {
              const isOpen = expanded.has(fam.family)
              return (
                <div key={fam.family} className="fm-family">
                  <div className="fm-family-row">
                    <button
                      className="fm-expand-btn"
                      onClick={() => toggleExpand(fam.family)}
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      <ChevronIcon open={isOpen} />
                    </button>
                    <span
                      className="fm-family-name"
                      style={{ fontFamily: `'${fam.family}', sans-serif`, fontWeight: 700 }}
                    >
                      {fam.family}
                    </span>
                    <button
                      className="fm-delete-btn"
                      onClick={() => onRemoveFamily(fam.family)}
                      title={`Remove ${fam.family}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {isOpen && fam.variants.map((v) => {
                    const isItalic = /italic|italics|oblique/i.test(v.name)
                    const weightNum = (() => {
                      const n = v.name.toLowerCase()
                      if (n.includes('thin')) return 100
                      if (n.includes('extralight') || n.includes('extra light') || n.includes('ultralight')) return 200
                      if (n.includes('light')) return 300
                      if (n.includes('medium')) return 500
                      if (n.includes('semibold') || n.includes('semi bold') || n.includes('demibold')) return 600
                      if (n.includes('extrabold') || n.includes('extra bold') || n.includes('ultrabold') || n.includes('black') || n.includes('heavy')) return 800
                      if (n.includes('bold')) return 700
                      return 400
                    })()
                    return (
                      <div key={v.name} className="fm-variant-row">
                        <span
                          className="fm-variant-name"
                          style={{
                            fontFamily: `'${fam.family}', sans-serif`,
                            fontWeight: weightNum,
                            fontStyle: isItalic ? 'italic' : 'normal',
                          }}
                        >
                          {v.name}
                        </span>
                        <button
                          className="fm-delete-btn"
                          onClick={() => onRemoveVariant(fam.family, v.name)}
                          title={`Remove ${v.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Portal>
  )
}
