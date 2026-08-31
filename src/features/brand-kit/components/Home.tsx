import { useState } from 'react'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { useUIStore } from '@/shared/store/useUIStore'
import { KitCard } from '@/features/brand-kit/components/KitCard'
import { Plus, Zap } from '@/shared/icons'

export function Home() {
  const { kits, appliedId, createKit } = useBrandStore()
  const { setModal, focusKit } = useUIStore()
  const applied = kits.find((k) => k.id === appliedId)
  const [importUrl, setImportUrl] = useState('')

  function handleImportUrl() {
    if (!importUrl.trim()) return
    const id = createKit()
    setModal({ type: 'brand-identity-wizard', kitId: id } as never)
  }

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

      {kits.length === 0 ? (
        <div className="bsh-starter">
          <h1 className="bsh-headline">Your Brand Studio</h1>
          <p className="bsh-subtitle">One place for your logo, palette, voice and guidelines.</p>

          {/* Primary: Generate with AI */}
          <button
            className="bsh-generate-card"
            onClick={() => {
              const id = createKit()
              setModal({ type: 'brand-identity-wizard', kitId: id })
            }}
          >
            <div className="bsh-generate-left">
              <span className="bsh-generate-icon">✦</span>
              <div>
                <div className="bsh-generate-title">Generate with AI</div>
                <div className="bsh-generate-sub">
                  Answer a few questions — we'll build your logo, palette, and brand voice automatically.
                </div>
              </div>
            </div>
            <span className="bsh-generate-cta">Generate brand identity →</span>
          </button>

          <div className="bsh-divider"><span>or start another way</span></div>

          {/* Secondary: Import + Blank */}
          <div className="bsh-two-col">
            <div className="bsh-card">
              <div className="bsh-card-title">🔗 Import from URL</div>
              <div className="bsh-card-sub">Paste your brand guidelines URL to pull in colors, fonts and assets.</div>
              <div className="bsh-import-row" style={{ marginTop: 16 }}>
                <input
                  className="bsh-import-input"
                  placeholder="https://yourbrand.com"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
                />
                <button className="btn outline sm" onClick={handleImportUrl}>Import</button>
              </div>
            </div>

            <div className="bsh-card">
              <div className="bsh-card-title">✏️ Start blank</div>
              <div className="bsh-card-sub">Build each section manually. Great if you already have brand assets ready.</div>
              <button
                className="btn ghost sm"
                style={{ marginTop: 16 }}
                onClick={() => setModal({ type: 'new' })}
              >
                Start blank kit →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
