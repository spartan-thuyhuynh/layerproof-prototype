import { useState } from 'react'
import { useUIStore } from '@/shared/store/useUIStore'
import { Settings, X } from '@/shared/icons'

const ACCENTS = [
  { label: 'Yellow', hex: '#ffde42' },
  { label: 'Blue', hex: '#4f8ef7' },
  { label: 'Green', hex: '#3ecf7a' },
  { label: 'Rose', hex: '#f75f7b' },
  { label: 'Purple', hex: '#b56af7' },
]

const DENSITIES = [
  { label: 'Compact', value: 'compact' },
  { label: 'Default', value: 'default' },
  { label: 'Comfy', value: 'comfy' },
] as const

export function TweaksPanel() {
  const { tweaks, setTweak } = useUIStore()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="tweaks-fab"
        title="Tweaks"
        onClick={() => setOpen((o) => !o)}
        style={{ background: tweaks.accent }}
      >
        <Settings style={{ width: 16, height: 16, color: '#111' }} />
      </button>

      {open && (
        <div className="tweaks-panel card">
          <div className="row" style={{ marginBottom: 16, alignItems: 'center' }}>
            <b style={{ fontSize: 14, fontWeight: 700 }}>Tweaks</b>
            <div className="grow" />
            <button className="x" onClick={() => setOpen(false)} style={{ width: 28, height: 28, fontSize: 14 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <div className="tweak-section">
            <div className="tiny" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Accent colour</div>
            <div className="row" style={{ gap: 8 }}>
              {ACCENTS.map(({ label, hex }) => (
                <button
                  key={hex}
                  title={label}
                  onClick={() => setTweak('accent', hex)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: hex, border: `2.5px solid ${tweaks.accent === hex ? '#fff' : 'transparent'}`, cursor: 'pointer',
                  }}
                />
              ))}
              <label title="Custom colour" style={{ width: 28, height: 28, borderRadius: '50%', background: tweaks.accent, border: '2px dashed rgba(255,255,255,.4)', cursor: 'pointer', overflow: 'hidden' }}>
                <input type="color" value={tweaks.accent} onChange={(e) => setTweak('accent', e.target.value)} style={{ opacity: 0, width: 0, height: 0 }} />
              </label>
            </div>
          </div>

          <div className="tweak-section" style={{ marginTop: 16 }}>
            <div className="tiny" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Density</div>
            <div className="row" style={{ gap: 6 }}>
              {DENSITIES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setTweak('density', value)}
                  className={`density-btn${tweaks.density === value ? ' on' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
