import { useState, useEffect } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { X, Wand, Download, Check, Clock, CheckCircle, Layers, Palette, Type, Mic, Grid } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'

interface GuidelineModalProps {
  kit: BrandKit
  onClose: () => void
}

type Phase = 'config' | 'generating' | 'done'

const steps = [
  'Collecting brand assets',
  'Composing color & type pages',
  'Writing usage rules',
  'Rendering document',
]

const sections = [
  { icon: 'Layers', t: 'Logo usage & misuse', on: true },
  { icon: 'Palette', t: 'Color palette + hex values', on: true },
  { icon: 'Type', t: 'Typography scale & pairing', on: true },
  { icon: 'Mic', t: 'Tone of voice & rewrites', on: true },
  { icon: 'Grid', t: 'Layout & spacing', on: false },
]

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = { Layers, Palette, Type, Mic, Grid }

export function GuidelineModal({ kit, onClose }: GuidelineModalProps) {
  const [phase, setPhase] = useState<Phase>('config')
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (phase !== 'generating') return
    setStep(0)
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) { clearInterval(t); setTimeout(() => setPhase('done'), 500); return s }
        return s + 1
      })
    }, 700)
    return () => clearInterval(t)
  }, [phase])

  const allColors = kit.colors.palettes.flatMap((p) => p.colors)

  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <button className="x" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
          <div className="h-eyebrow">Guideline document</div>
          <h2 className="h2" style={{ marginTop: 6 }}>
            {phase === 'done' ? `${kit.name} — Brand Guidelines` : 'Generate brand guidelines'}
          </h2>
        </div>

        <div className="mbody">
          {phase === 'config' && (
            <div className="fade-in">
              <p className="sub" style={{ fontSize: 14.5, marginTop: 0 }}>
                Compile every asset and rule in <b style={{ color: 'var(--t1)' }}>{kit.name}</b> into a shareable PDF guideline — cover, palette, type, logo usage, voice and do/don'ts.
              </p>
              <div className="card" style={{ padding: '6px 18px', marginTop: 16 }}>
                {sections.map(({ icon, t, on }, i) => {
                  const Icon = iconMap[icon]
                  return (
                    <div key={i} className="rule" style={{ padding: '12px 0' }}>
                      <div className="rk">{Icon && <Icon />}</div>
                      <div className="rbody"><b>{t}</b></div>
                      <div className={`guideline-tag${on ? ' on' : ''}`}>
                        <Check style={{ width: 13, height: 13 }} /> {on ? 'Included' : 'Optional'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {phase === 'generating' && (
            <div className="fade-in" style={{ padding: '10px 0' }}>
              <div className="gen-steps">
                {steps.map((s, i) => (
                  <div key={i} className={`gen-step${i < step ? ' done' : i === step ? ' active' : ''}`}>
                    <div className="tick">
                      {i < step
                        ? <Check style={{ width: 13, height: 13 }} />
                        : i === step
                          ? <Clock className="spin" style={{ width: 13, height: 13 }} />
                          : null}
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="fade-in doc">
              <div className="doc-cover" style={{ background: kit.logoStyle.background, color: kit.logoStyle.color }}>
                <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '.1em', opacity: .8 }}>BRAND GUIDELINES</div>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.02em' }}>{kit.name}</div>
                  <div style={{ opacity: .8, marginTop: 6 }}>Version 1.0 · {kit.updated.replace('Edited ', 'Updated ')}</div>
                </div>
              </div>
              <div className="doc-page">
                <h2>01 — Color</h2>
                <div className="docrow">
                  {allColors.slice(0, 6).map((c, i) => {
                    const light = parseInt(c.hex.slice(1), 16) > 0xaaaaaa
                    return <div key={i} className="docsw" style={{ background: c.hex, color: light ? '#111' : '#fff' }}>{c.hex}</div>
                  })}
                </div>
              </div>
              <div className="doc-page" style={{ borderTop: '1px solid #eee' }}>
                <h2>02 — Typography</h2>
                <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.02em' }}>{kit.type.display.family}</div>
                <div style={{ color: '#666', marginTop: 6 }}>Display {kit.type.display.weight} · Body {kit.type.body.weight}</div>
              </div>
              <div className="doc-page" style={{ borderTop: '1px solid #eee' }}>
                <h2>03 — Voice</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {kit.tone.use.map((w, i) => (
                    <span key={i} style={{ background: '#f1f1f1', padding: '5px 11px', borderRadius: 7, fontSize: 13, fontWeight: 600 }}>{w}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mfoot">
          {phase === 'done'
            ? <span className="tiny"><CheckCircle style={{ width: 14, height: 14, verticalAlign: '-2px', marginRight: 5, color: 'var(--c-green)' }} /> Generated 4-page guideline</span>
            : <span className="tiny">Output: PDF · shareable link</span>
          }
          <div className="row">
            <button className="btn ghost" onClick={onClose}>{phase === 'done' ? 'Close' : 'Cancel'}</button>
            {phase === 'config' && (
              <button className="btn primary" onClick={() => setPhase('generating')}>
                <Wand /> Generate
              </button>
            )}
            {phase === 'done' && (
              <button className="btn primary">
                <Download /> Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  )
}
