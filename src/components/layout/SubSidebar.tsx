import { useState, useRef, useEffect } from 'react'
import type { BrandKit, Category } from '@/types/brand'
import { Icons, Settings, EyeOff, Plus, ChevronUp, ChevronDown, Trash, Check, Chevron, Zap } from '@/icons'
import { useUIStore } from '@/store/useUIStore'
import { useBrandStore } from '@/store/useBrandStore'

interface SubSidebarProps {
  kit: BrandKit
  activeSection: string
  onSection: (id: string) => void
  onAddCategory: () => void
  onDeleteCategory: (id: string) => void
  onReorderCategory: (id: string, dir: -1 | 1) => void
  onToggleCategoryHidden: (id: string) => void
}

const BUILT_IN_SECTIONS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'themes',      label: 'Brand Themes' },
  { id: 'logos',       label: 'Logos' },
  { id: 'colors',      label: 'Colors' },
  { id: 'typography',  label: 'Typography' },
  { id: 'tone',        label: 'Brand Voice' },
  { id: 'imagery',     label: 'Image Assets' },
]

export function SubSidebar({
  kit, activeSection, onSection,
  onAddCategory, onDeleteCategory, onReorderCategory, onToggleCategoryHidden,
}: SubSidebarProps) {
  const [manage, setManage] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const switchRef = useRef<HTMLDivElement>(null)
  const { kits, appliedId } = useBrandStore()
  const { focusKit } = useUIStore()
  const { setModal } = useUIStore()
  const createKit = useBrandStore((s) => s.createKit)
  const focusedId = useUIStore((s) => s.focusedId)

  const isApplied = appliedId === kit.id
  const customCats = kit.categories.filter((c: Category) => c.custom)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) setSwitchOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="subsidebar">
      {/* New brand kit button */}
      <div className="subsidebar-new">
        <button className="sub-new-btn" onClick={() => { const id = createKit(); focusKit(id) }}>
          <Plus style={{ width: 15, height: 15 }} /> New Brand Kit
        </button>
      </div>

      {/* Kit switcher row — click to open dropdown */}
      <div className="kit-identity" ref={switchRef}>
        <button className="kit-id-row" onClick={() => setSwitchOpen((o) => !o)}>
          <div className="kit-id-logo" style={kit.symbolSrc ? { background: '#0a0a0a' } : kit.logoStyle}>
            {kit.symbolSrc
              ? <img src={kit.symbolSrc} alt={kit.name} style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
              : kit.logoText}
          </div>
          <div className="kit-id-text">
            <div className="kit-id-name">{kit.name}</div>
            <div className="kit-id-sub">{isApplied ? 'Applied to generation' : kit.tagline}</div>
          </div>
          <Chevron style={{
            width: 14, height: 14, color: '#666', flexShrink: 0,
            transition: 'transform .18s',
            transform: switchOpen ? 'rotate(180deg)' : 'none',
          }} />
        </button>

        {switchOpen && (
          <div className="kit-switch-menu">
            <div className="kit-switch-label">Switch brand kit</div>
            {kits.map((k) => (
              <button
                key={k.id}
                className={`kit-switch-opt${k.id === focusedId ? ' active' : ''}`}
                onClick={() => { focusKit(k.id); setSwitchOpen(false) }}
              >
                <div className="kit-switch-logo" style={k.symbolSrc ? { background: '#0a0a0a' } : k.logoStyle}>
                  {k.symbolSrc
                    ? <img src={k.symbolSrc} alt={k.name} style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                    : k.logoText}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="nm">{k.name}</div>
                  <div className="tg">{k.tagline}</div>
                </div>
                {k.id === appliedId
                  ? <Zap style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                  : k.id === focusedId
                    ? <Check style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                    : null}
              </button>
            ))}
            <div className="kit-switch-div" />
            <button className="kit-switch-action" onClick={() => { setModal({ type: 'new' }); setSwitchOpen(false) }}>
              <div className="kit-switch-ic"><Plus style={{ width: 15, height: 15 }} /></div>
              New brand kit
            </button>
          </div>
        )}
      </div>

      <nav className="subnav">
        <div className="subnav-group-label">Brand sections</div>
        {BUILT_IN_SECTIONS.map(({ id, label }) => (
          <div key={id}>
            <button
              className={`navitem sub${activeSection === id ? ' active' : ''}`}
              onClick={() => onSection(id)}
            >
              <span className="grow">{label}</span>
            </button>
            {id === 'themes' && <div style={{ height: 1, background: 'var(--line)', margin: '6px 0' }} />}
          </div>
        ))}

        {customCats.length > 0 && (
          <>
            <div className="subnav-group-label" style={{ marginTop: 14 }}>Custom</div>
            {customCats.map((cat: Category, idx: number) => {
              const Icon = Icons[cat.icon || 'Folder']
              return (
                <div key={cat.id} className={`navitem sub custom${activeSection === cat.id ? ' active' : ''}${cat.hidden ? ' hidden-cat' : ''}`}>
                  <button className="grow row" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', gap: 8, alignItems: 'center' }} onClick={() => onSection(cat.id)}>
                    {Icon && <Icon style={{ width: 15, height: 15 }} />}
                    <span className="grow" style={{ textAlign: 'left' }}>{cat.label}</span>
                  </button>
                  {manage && (
                    <div className="row" style={{ gap: 4 }}>
                      <button className="icon-btn" title="Move up" onClick={() => onReorderCategory(cat.id, -1)} disabled={idx === 0}><ChevronUp style={{ width: 14, height: 14 }} /></button>
                      <button className="icon-btn" title="Move down" onClick={() => onReorderCategory(cat.id, 1)} disabled={idx === customCats.length - 1}><ChevronDown style={{ width: 14, height: 14 }} /></button>
                      <button className="icon-btn" title={cat.hidden ? 'Show' : 'Hide'} onClick={() => onToggleCategoryHidden(cat.id)}><EyeOff style={{ width: 14, height: 14 }} /></button>
                      <button className="icon-btn danger" title="Delete" onClick={() => onDeleteCategory(cat.id)}><Trash style={{ width: 14, height: 14 }} /></button>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </nav>

    </div>
  )
}
