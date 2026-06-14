import { useState } from 'react'
import { X, Plus, Wand, Download } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'

interface NewKitModalProps {
  onClose: () => void
}

export function NewKitModal({ onClose }: NewKitModalProps) {
  const [name, setName] = useState('')

  const options = [
    { icon: 'Wand', title: 'Extract from a URL', desc: 'Pull colors, fonts & logo from a website' },
    { icon: 'Download', title: 'Upload assets', desc: 'Logos, brand PDF, style guide' },
  ]

  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <button className="x" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
          <div className="h-eyebrow">New brand kit</div>
          <h2 className="h2" style={{ marginTop: 6 }}>Start a brand kit</h2>
        </div>
        <div className="mbody">
          <label className="tiny" style={{ display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Brand name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Studio"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#111', border: '1px solid var(--line-2)', color: 'var(--t1)', fontSize: 15, fontFamily: 'inherit' }}
          />
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16, gap: 12 }}>
            {options.map((opt, i) => {
              const Icon = opt.icon === 'Wand' ? Wand : Download
              return (
                <div key={i} className="card hover" style={{ padding: 16 }}>
                  <Icon style={{ width: 20, height: 20, color: 'var(--accent)' }} />
                  <div className="h3" style={{ marginTop: 10, fontSize: 14 }}>{opt.title}</div>
                  <div className="tiny" style={{ marginTop: 3 }}>{opt.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mfoot">
          <span />
          <div className="row">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={onClose} style={{ opacity: name ? 1 : 0.5 }}>
              <Plus /> Create kit
            </button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  )
}
