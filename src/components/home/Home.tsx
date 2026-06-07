import { useBrandStore } from '@/store/useBrandStore'
import { useUIStore } from '@/store/useUIStore'
import { KitCard } from '@/components/kit/KitCard'
import { Plus, Zap } from '@/icons'

export function Home() {
  const { kits, appliedId } = useBrandStore()
  const { setModal, focusKit } = useUIStore()
  const applied = kits.find((k) => k.id === appliedId)

  return (
    <div className="home fade-in">
      {applied && (
        <div className="applied-banner card" style={{ marginBottom: 28, padding: '18px 22px' }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="logo" style={applied.logoStyle}>{applied.logoText}</div>
            <div className="grow">
              <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                <b style={{ fontSize: 16, fontWeight: 700 }}>{applied.name}</b>
                <span className="badge-pill applied"><Zap style={{ width: 12, height: 12 }} /> Applied</span>
              </div>
              <div className="tiny">{applied.tagline}</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn ghost sm" onClick={() => focusKit(applied.id)}>Edit kit</button>
              <button className="btn ghost sm" onClick={() => setModal({ type: 'apply' })}>Switch</button>
            </div>
          </div>
        </div>
      )}

      <div className="row" style={{ marginBottom: 18, alignItems: 'center' }}>
        <h2 className="h2" style={{ margin: 0 }}>Brand kits</h2>
        <div className="grow" />
        <button className="btn primary sm" onClick={() => setModal({ type: 'new' })}>
          <Plus style={{ width: 15, height: 15 }} /> New kit
        </button>
      </div>

      <div className="kit-grid">
        {kits.map((kit) => (
          <KitCard
            key={kit.id}
            kit={kit}
            applied={kit.id === appliedId}
            onOpen={() => focusKit(kit.id)}
            onApply={() => setModal({ type: 'apply' })}
          />
        ))}
        <button className="kit-card-add card hover" onClick={() => setModal({ type: 'new' })}>
          <Plus style={{ width: 24, height: 24, color: 'var(--accent)' }} />
          <div className="h3" style={{ marginTop: 10, fontSize: 14 }}>New brand kit</div>
          <div className="tiny" style={{ marginTop: 3 }}>Import or create from scratch</div>
        </button>
      </div>
    </div>
  )
}
