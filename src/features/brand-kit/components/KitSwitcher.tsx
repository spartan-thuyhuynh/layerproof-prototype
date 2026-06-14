import { useState, useRef, useEffect } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { Check, Zap, Chevron, Plus, Grid } from '@/shared/icons'

interface KitSwitcherProps {
  kits: BrandKit[]
  focusedId: string
  appliedId: string
  onSwitch: (id: string) => void
  onNew: () => void
  onBrowseAll: () => void
}

export function KitSwitcher({ kits, focusedId, appliedId, onSwitch, onNew, onBrowseAll }: KitSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const cur = kits.find((k) => k.id === focusedId) ?? kits[0]

  return (
    <div className="kit-switch" ref={ref}>
      <button
        className={`switch-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <div className="logo" style={cur.logoStyle}>{cur.logoText}</div>
        <div className="txt">
          <div className="nm">{cur.name}</div>
          <div className="tg">{cur.id === appliedId ? 'Applied to generation' : cur.tagline}</div>
        </div>
        <Chevron className="chev" />
      </button>

      {open && (
        <div className="switch-menu">
          <div className="mlbl">Switch brand kit</div>
          {kits.map((k) => (
            <button
              key={k.id}
              className={`switch-opt${k.id === focusedId ? ' active' : ''}`}
              onClick={() => { onSwitch(k.id); setOpen(false) }}
            >
              <div className="logo" style={k.logoStyle}>{k.logoText}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="nm">{k.name}</div>
                <div className="tg">{k.tagline}</div>
              </div>
              {k.id === appliedId
                ? <span className="applied-mini" title="Applied to generation"><Zap style={{ width: 15, height: 15 }} /></span>
                : k.id === focusedId
                  ? <Check style={{ width: 15, height: 15, color: 'var(--accent)' }} />
                  : null
              }
            </button>
          ))}
          <div className="switch-div" />
          <button className="switch-new" onClick={() => { onNew(); setOpen(false) }}>
            <div className="ic"><Plus style={{ width: 16, height: 16 }} /></div>
            New brand kit
          </button>
          <button className="switch-new" onClick={() => { onBrowseAll(); setOpen(false) }}>
            <div className="ic"><Grid style={{ width: 15, height: 15 }} /></div>
            Browse all kits
          </button>
        </div>
      )}
    </div>
  )
}
