import { useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { ArrowRight } from '@/shared/icons'

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Polished and credible' },
  { id: 'friendly',     label: 'Friendly',     desc: 'Warm and approachable' },
  { id: 'bold',         label: 'Bold',         desc: 'Confident and direct' },
  { id: 'playful',      label: 'Playful',      desc: 'Fun and lighthearted' },
  { id: 'elegant',      label: 'Elegant',      desc: 'Refined and sophisticated' },
  { id: 'casual',       label: 'Casual',       desc: 'Relaxed and conversational' },
  { id: 'authoritative',label: 'Authoritative','desc': 'Expert and trustworthy' },
  { id: 'inspirational',label: 'Inspirational','desc': 'Motivating and uplifting' },
  { id: 'witty',        label: 'Witty',        desc: 'Clever and engaging' },
  { id: 'empathetic',   label: 'Empathetic',   desc: 'Understanding and caring' },
  { id: 'direct',       label: 'Direct',       desc: 'Clear and to the point' },
  { id: 'creative',     label: 'Creative',     desc: 'Imaginative and expressive' },
]

const MAX = 3

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="onb-panel-back" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back
    </button>
  )
}

export function Step5_Tone() {
  const { nextStep, prevStep } = useOnboardingStore()
  const [selected, setSelected] = useState<string[]>([])

  function toggle(id: string) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= MAX) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="onb-step onb-step--wide fade-in" style={{ maxWidth: 680 }}>
      <div className="onb-product-bg">
        <div className="onb-panel-top-row">
          <BackButton onClick={prevStep} />
          <button className="onb-skip" onClick={nextStep}>Skip for now</button>
        </div>
        <div className="h-eyebrow" style={{ marginBottom: 12, marginTop: 24 }}>Brand Kit</div>
        <h1 className="onb-step-title" style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 'clamp(26px, 3.5vw, 36px)', textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 6 }}>
          What's your brand's tone?
        </h1>
        <p className="onb-step-sub" style={{ fontSize: 14, marginBottom: 28 }}>
          Pick <strong style={{ color: 'var(--t1)' }}>3 tones</strong> that best describe how your brand communicates.
          <span className="onb-tone-count"> {selected.length}/{MAX} selected</span>
        </p>

        <div className="onb-tone-grid">
          {TONES.map(({ id, label, desc }) => {
            const active = selected.includes(id)
            const maxed = !active && selected.length >= MAX
            return (
              <button
                key={id}
                className={`onb-tone-card${active ? ' active' : ''}${maxed ? ' disabled' : ''}`}
                onClick={() => toggle(id)}
                disabled={maxed}
              >
                {active && (
                  <span className="onb-tone-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                <span className="onb-tone-label">{label}</span>
                <span className="onb-tone-desc">{desc}</span>
              </button>
            )
          })}
        </div>

        <button
          className="btn primary onb-cta"
          onClick={nextStep}
          disabled={selected.length === 0}
          style={{ margin: 0, marginTop: 24 }}
        >
          Continue <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  )
}
