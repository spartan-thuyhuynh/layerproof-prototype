import { useState } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { X, Zap, Info } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'

interface ApplyModalProps {
  kits: BrandKit[]
  current: string
  onClose: () => void
  onConfirm: (id: string) => void
}

export function ApplyModal({ kits, current, onClose, onConfirm }: ApplyModalProps) {
  const [sel, setSel] = useState(current)

  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <button className="x" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
          <div className="h-eyebrow">Apply brand kit</div>
          <h2 className="h2" style={{ marginTop: 6 }}>Which brand should AI follow?</h2>
          <p className="sub" style={{ fontSize: 14.5 }}>The selected kit&apos;s rules are applied to every generation until you switch.</p>
        </div>
        <div className="mbody">
          {kits.map((k) => (
            <div
              key={k.id}
              className={`kitpick${sel === k.id ? ' sel' : ''}`}
              onClick={() => setSel(k.id)}
            >
              <div className="logo" style={k.logoStyle}>{k.logoText}</div>
              <div className="grow">
                <b style={{ fontSize: 15, fontWeight: 700 }}>{k.name}</b>
                <div className="tiny">{k.tagline}</div>
              </div>
              <div className="radio" />
            </div>
          ))}
        </div>
        <div className="mfoot">
          <span className="tiny">
            <Info style={{ width: 14, height: 14, verticalAlign: '-2px', marginRight: 5 }} />
            You can switch any time.
          </span>
          <div className="row">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={() => onConfirm(sel)}>
              <Zap /> Apply kit
            </button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  )
}
