import { useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { ArrowRight } from '@/shared/icons'

const ROLES = [
  { id: 'marketing',   label: 'Marketing' },
  { id: 'student',     label: 'Student' },
  { id: 'consultant',  label: 'Consultant' },
  { id: 'sales',       label: 'Sales' },
  { id: 'support',     label: 'Customer Support' },
  { id: 'content',     label: 'Content Creator' },
  { id: 'founder',     label: 'Business Owner' },
  { id: 'engineering', label: 'Engineering / IT' },
  { id: 'ops',         label: 'Operations & Finance' },
  { id: 'designer',    label: 'Designer' },
  { id: 'other',       label: 'Other' },
]

const REFERRALS = [
  { id: 'producthunt', label: 'Product Hunt' },
  { id: 'friend',      label: 'Friends or colleagues' },
  { id: 'blog',        label: 'Blogs or Articles' },
  { id: 'search',      label: 'Search Engine' },
  { id: 'tiktok',      label: 'TikTok' },
  { id: 'instagram',   label: 'Instagram' },
  { id: 'facebook',    label: 'Facebook' },
  { id: 'youtube',     label: 'Youtube' },
  { id: 'linkedin',    label: 'LinkedIn' },
  { id: 'twitter',     label: 'Twitter/X' },
  { id: 'podcast',     label: 'Podcast' },
  { id: 'newsletter',  label: 'Newsletter' },
  { id: 'reddit',      label: 'Reddit' },
  { id: 'other',       label: 'Other' },
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

function ChipGrid({
  options,
  selected,
  onSelect,
}: {
  options: typeof ROLES
  selected: string | null
  onSelect: (id: string) => void
}) {
  const [otherText, setOtherText] = useState('')
  return (
    <>
      <div className="onb-role-grid">
        {options.map(({ id, label }) => (
          <button
            key={id}
            className={`onb-role-chip${selected === id ? ' active' : ''}`}
            onClick={() => onSelect(id)}
          >
            {selected === id && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
            {label}
          </button>
        ))}
      </div>
      {selected === 'other' && (
        <div className="onb-other-wrap">
          <input
            className="onb-other-input"
            placeholder="Tell us more…"
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
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
  const [referral, setReferral] = useState<string | null>(null)

  if (sub === 1) {
    return (
      <div className="onb-step onb-step--wide fade-in" style={{ maxWidth: 640 }}>
        <div className="onb-product-bg">
          <div className="onb-panel-top-row">
            <BackButton onClick={prevStep} />
            <button className="onb-skip" onClick={() => setSub(2)}>Skip for now</button>
          </div>
          <div className="h-eyebrow" style={{ marginBottom: 12, marginTop: 24 }}>Personalize</div>
          <h1 className="onb-step-title" style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 'clamp(26px, 3.5vw, 36px)', textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 6 }}>
            What best describes your job?
          </h1>
          <p className="onb-step-sub" style={{ fontSize: 14, marginBottom: 28 }}>Customize LayerProof for your role.</p>
          <ChipGrid options={ROLES} selected={role} onSelect={setRole} />
          <button className="btn primary onb-cta" onClick={() => setSub(2)} style={{ margin: 0, marginTop: 8 }}>
            Continue <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="onb-step onb-step--wide fade-in" style={{ maxWidth: 640 }}>
      <div className="onb-product-bg">
        <div className="onb-panel-top-row">
          <BackButton onClick={() => setSub(1)} />
          <button className="onb-skip" onClick={nextStep}>Skip for now</button>
        </div>
        <div className="h-eyebrow" style={{ marginBottom: 12, marginTop: 24 }}>Personalize</div>
        <h1 className="onb-step-title" style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 'clamp(26px, 3.5vw, 36px)', textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 6 }}>
          How did you hear about us?
        </h1>
        <p className="onb-step-sub" style={{ fontSize: 14, marginBottom: 28 }}>We'd love to know how you found LayerProof.</p>
        <ChipGrid options={REFERRALS} selected={referral} onSelect={setReferral} />
        <button className="btn primary onb-cta" onClick={nextStep} style={{ margin: 0, marginTop: 8 }}>
          Continue <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  )
}
