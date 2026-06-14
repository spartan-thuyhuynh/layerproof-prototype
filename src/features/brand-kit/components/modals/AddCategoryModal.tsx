import { useState } from 'react'
import { X, Plus, Layers, Palette, Type, Mic, Grid, Folder, Star, Zap, Globe } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'

interface AddCategoryModalProps {
  onClose: () => void
  onAdd: (name: string, icon: string) => void
}

const CAT_ICONS = [
  { key: 'Layers', Icon: Layers },
  { key: 'Palette', Icon: Palette },
  { key: 'Type', Icon: Type },
  { key: 'Mic', Icon: Mic },
  { key: 'Grid', Icon: Grid },
  { key: 'Folder', Icon: Folder },
  { key: 'Star', Icon: Star },
  { key: 'Zap', Icon: Zap },
  { key: 'Globe', Icon: Globe },
  { key: 'Plus', Icon: Plus },
]

export function AddCategoryModal({ onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('Folder')

  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="mhead">
          <button className="x" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
          <div className="h-eyebrow">Custom category</div>
          <h2 className="h2" style={{ marginTop: 6 }}>Add a category</h2>
        </div>

        <div className="mbody">
          <label className="tiny" style={{ display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.08em' }}>Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { onAdd(name.trim(), icon); onClose() } }}
            placeholder="e.g. Motion & Animation"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: '#111', border: '1px solid var(--line-2)', color: 'var(--t1)', fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <div className="tiny" style={{ marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Icon</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {CAT_ICONS.map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setIcon(key)}
                style={{
                  padding: 12, borderRadius: 10, border: `1.5px solid ${icon === key ? 'var(--accent)' : 'var(--line-2)'}`,
                  background: icon === key ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  color: icon === key ? 'var(--accent)' : 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon style={{ width: 18, height: 18 }} />
              </button>
            ))}
          </div>
        </div>

        <div className="mfoot">
          <span />
          <div className="row">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn primary"
              style={{ opacity: name.trim() ? 1 : 0.5 }}
              onClick={() => { if (name.trim()) { onAdd(name.trim(), icon); onClose() } }}
            >
              <Plus /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  )
}
