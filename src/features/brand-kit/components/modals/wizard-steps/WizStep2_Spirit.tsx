import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { ARCHETYPES } from '@/features/brand-kit/data/archetypes'

export function WizStep2_Spirit() {
  const { archetypes, setField } = useWizardStore()

  function toggle(id: string) {
    if (archetypes.includes(id)) {
      setField('archetypes', archetypes.filter((a) => a !== id))
    } else if (archetypes.length < 2) {
      setField('archetypes', [...archetypes, id])
    } else {
      setField('archetypes', [archetypes[1], id])
    }
  }

  return (
    <div className="biz-step">
      <div>
        <h1 className="biz-step-title">What's your brand's spirit?</h1>
        <p className="biz-step-sub">Choose 1–2 archetypes that best capture your brand's personality. These shape everything downstream.</p>
      </div>
      <div className="biz-archetype-grid">
        {ARCHETYPES.map((a) => (
          <button
            key={a.id}
            className={`biz-archetype-card${archetypes.includes(a.id) ? ' active' : ''}`}
            onClick={() => toggle(a.id)}
          >
            <span className="biz-archetype-emoji">{a.emoji}</span>
            <span className="biz-archetype-label">{a.label}</span>
            <span className="biz-archetype-desc">{a.description}</span>
          </button>
        ))}
      </div>
      {archetypes.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--t3)' }}>
          Selected: {archetypes.map((id) => ARCHETYPES.find((a) => a.id === id)?.label).join(' + ')}
          {archetypes.length === 1 && ' — you can pick one more'}
        </div>
      )}
    </div>
  )
}

export function WizStep2_Nav({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { archetypes } = useWizardStore()
  return (
    <div className="biz-nav">
      <div className="biz-nav-left">
        <button className="btn ghost sm" onClick={onBack}>Back</button>
      </div>
      <button className="btn primary sm" disabled={archetypes.length === 0} onClick={onNext}>
        Continue →
      </button>
    </div>
  )
}
