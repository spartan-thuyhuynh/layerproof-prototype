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
  otherText,
  onOtherText,
}: {
  options: typeof ROLES
  selected: string | null
  onSelect: (id: string) => void
  otherText: string
  onOtherText: (v: string) => void
}) {
  const [otherTouched, setOtherTouched] = useState(false)

  function handleSelect(id: string) {
    if (id !== selected) setOtherTouched(false)
    onSelect(id)
  }

  const showError = otherTouched && otherText.trim() === ''

  return (
    <>
      <div className="onb-role-grid">
        {options.map(({ id, label }) => (
          <button
            key={id}
            className={`onb-role-chip${selected === id ? ' active' : ''}`}
            onClick={() => handleSelect(id)}
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
            onChange={e => onOtherText(e.target.value)}
            onBlur={() => setOtherTouched(true)}
            autoFocus
          />
          {showError && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--c-red, #ef4444)' }}>
              This field is mandatory
            </p>
          )}
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

  const canContinueSub1 = role !== null && (role !== 'other' || roleOther.trim() !== '')
  const canContinueSub2 = referral !== null && (referral !== 'other' || referralOther.trim() !== '')

  if (sub === 1) {
    return (
      <div className="onb-step onb-step--wide fade-in" style={{ maxWidth: 640 }}>
        <div className="onb-product-bg">
          <div className="onb-panel-top-row">
            <BackButton onClick={prevStep} />
            <button className="onb-skip" onClick={nextStep}>Skip for now</button>
          </div>
          <h1 className="onb-step-title" style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 'clamp(26px, 3.5vw, 36px)', textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 6, marginTop: 24 }}>
            What best describes your job?
          </h1>
          <p className="onb-step-sub" style={{ fontSize: 14, marginBottom: 28 }}>Customize LayerProof for your role.</p>
          <ChipGrid options={ROLES} selected={role} onSelect={setRole} otherText={roleOther} onOtherText={setRoleOther} />
          <button className="btn primary onb-cta" onClick={() => setSub(2)} disabled={!canContinueSub1} style={{ margin: 0, marginTop: 8 }}>
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
        <h1 className="onb-step-title" style={{ fontFamily: 'Anton', fontWeight: 400, fontSize: 'clamp(26px, 3.5vw, 36px)', textTransform: 'uppercase', letterSpacing: '.01em', marginBottom: 6, marginTop: 24 }}>
          How did you hear about us?
        </h1>
        <p className="onb-step-sub" style={{ fontSize: 14, marginBottom: 28 }}>We'd love to know how you found LayerProof.</p>
        <ChipGrid options={REFERRALS} selected={referral} onSelect={setReferral} otherText={referralOther} onOtherText={setReferralOther} />
        <button className="btn primary onb-cta" onClick={nextStep} disabled={!canContinueSub2} style={{ margin: 0, marginTop: 8 }}>
          Continue <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  )
}
