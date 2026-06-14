import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { Social, Present, Palette, Docs, Sparkle, Zap, ArrowRight } from '@/shared/icons'

const INTENTS = [
  { id: 'social',  label: 'Social Media Content',       Icon: Social },
  { id: 'slides',  label: 'Slide Decks & Presentations', Icon: Present },
  { id: 'brand',   label: 'Brand Management',            Icon: Palette },
  { id: 'docs',    label: 'Marketing Docs',              Icon: Docs },
  { id: 'images',  label: 'AI Image Generation',         Icon: Sparkle },
  { id: 'all',     label: 'All of the above',            Icon: Zap },
]

export function Step2_Intent() {
  const { intents, toggleIntent, nextStep } = useOnboardingStore()

  return (
    <div className="onb-step fade-in">
      <div className="h-eyebrow" style={{ marginBottom: 10 }}>Personalise</div>
      <h1 className="onb-step-title">What will you use LayerProof for?</h1>
      <p className="onb-step-sub">Select everything that applies — we'll tailor your experience.</p>

      <div className="onb-intent-grid">
        {INTENTS.map(({ id, label, Icon }) => {
          const active = intents.includes(id)
          return (
            <button
              key={id}
              className={`onb-intent-chip${active ? ' active' : ''}`}
              onClick={() => toggleIntent(id)}
            >
              <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              {label}
            </button>
          )
        })}
      </div>

      <button className="btn primary onb-cta" onClick={nextStep}>
        Continue <ArrowRight style={{ width: 16, height: 16 }} />
      </button>

      <button className="onb-skip" onClick={nextStep}>
        Skip for now
      </button>
    </div>
  )
}
