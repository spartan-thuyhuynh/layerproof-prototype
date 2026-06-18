import { useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { ArrowRight } from '@/shared/icons'

const ROLES = [
  { id: 'marketer',     label: 'Marketer',               emoji: '🔨' },
  { id: 'engineering',  label: 'Engineering/IT',          emoji: '🖥️' },
  { id: 'designer',     label: 'Designer',                emoji: '🎨' },
  { id: 'founder',      label: 'Founder/ Business Owner', emoji: '🚀' },
  { id: 'content',      label: 'Content Creator',         emoji: '📋' },
  { id: 'other',        label: 'Other',                   emoji: ''   },
]

const REFERRALS = [
  { id: 'social',      label: 'Social Media',        emoji: '📱' },
  { id: 'friend',      label: 'Friend or Colleague', emoji: '👥' },
  { id: 'search',      label: 'Search Engine',       emoji: '🔍' },
  { id: 'blog',        label: 'Blog or Article',     emoji: '📝' },
  { id: 'producthunt', label: 'Product Hunt',        emoji: '🐱' },
  { id: 'other',       label: 'Other',               emoji: '✦'  },
]

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

function OptionGrid({
  options,
  selected,
  onSelect,
  otherText,
  onOtherText,
}: {
  options: typeof ROLES
  selected: string | null
  onSelect: (id: string) => void
  otherText: string
  onOtherText: (v: string) => void
}) {
  return (
    <>
      <div className="onb-intent-grid" style={{ marginBottom: selected === 'other' ? 16 : 32 }}>
        {options.map(({ id, label, emoji }) => (
          <button
            key={id}
            className={`onb-intent-chip onb-intent-chip--rich${selected === id ? ' active' : ''}`}
            onClick={() => onSelect(id)}
          >
            <span className="onb-chip-emoji">{emoji}</span>
            <span className="onb-chip-text">
              <span className="onb-chip-label">{label}</span>
            </span>
            {selected === id && (
              <span className="onb-chip-check">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
      {selected === 'other' && (
        <div className="onb-other-wrap">
          <input
            className="onb-other-input"
            placeholder="Tell us more…"
            value={otherText}
            onChange={(e) => onOtherText(e.target.value)}
            autoFocus
          />
        </div>
      )}
    </>
  )
}

export function Step2_Intent() {
  const { nextStep, prevStep } = useOnboardingStore()
  const [sub, setSub] = useState<1 | 2>(1)
  const [role, setRole] = useState<string | null>(null)
  const [roleOther, setRoleOther] = useState('')
  const [referral, setReferral] = useState<string | null>(null)
  const [referralOther, setReferralOther] = useState('')

  if (sub === 1) {
    return (
      <div className="onb-step onb-step--wide fade-in" style={{ maxWidth: 680 }}>
        <div className="onb-product-bg">
          <div className="onb-panel-top-row">
            <BackButton onClick={prevStep} />
            <button className="onb-skip" onClick={() => setSub(2)}>Skip for now</button>
          </div>
          <div className="h-eyebrow" style={{ marginBottom: 12, marginTop: 20 }}>Personalize</div>
          <h1 className="onb-step-title" style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 'clamp(26px, 3.5vw, 38px)', textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 8 }}>What best describes your role?</h1>
          <p className="onb-step-sub" style={{ fontSize: 15, marginBottom: 28 }}>Help us tailor LayerProof to your needs.</p>
          <OptionGrid
            options={ROLES}
            selected={role}
            onSelect={setRole}
            otherText={roleOther}
            onOtherText={setRoleOther}
          />
          <button className="btn primary onb-cta" onClick={() => setSub(2)} style={{ margin: 0 }}>
            Continue <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="onb-step onb-step--wide fade-in" style={{ maxWidth: 680 }}>
      <div className="onb-product-bg">
        <div className="onb-panel-top-row">
          <BackButton onClick={() => setSub(1)} />
          <button className="onb-skip" onClick={nextStep}>Skip for now</button>
        </div>
        <div className="h-eyebrow" style={{ marginBottom: 12, marginTop: 20 }}>Personalize</div>
        <h1 className="onb-step-title" style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 'clamp(26px, 3.5vw, 38px)', textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 8 }}>How did you hear about us?</h1>
        <p className="onb-step-sub" style={{ fontSize: 15, marginBottom: 28 }}>We'd love to know how you found LayerProof.</p>
        <OptionGrid
          options={REFERRALS}
          selected={referral}
          onSelect={setReferral}
          otherText={referralOther}
          onOtherText={setReferralOther}
        />
        <button className="btn primary onb-cta" onClick={nextStep} style={{ margin: 0 }}>
          Continue <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  )
}
