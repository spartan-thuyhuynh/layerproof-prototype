import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { INDUSTRIES, INDUSTRY_NAMES } from '@/features/brand-kit/data/industry-names'

const INDUSTRY_TAGLINES: Record<string, string> = {
  'Retail':                 'e.g. "Quality you can feel, prices you\'ll love."',
  'Food & Beverage':        'e.g. "Every bite tells a story."',
  'Tech & Software':        'e.g. "Build faster. Ship smarter."',
  'Health & Wellness':      'e.g. "Feel better, live fully."',
  'Finance':                'e.g. "Your wealth, your future, our focus."',
  'Education':              'e.g. "Learning that opens every door."',
  'Beauty & Lifestyle':     'e.g. "Confidence starts here."',
  'Professional Services':  'e.g. "Expertise you can rely on."',
  'Real Estate':            'e.g. "Find the home you\'ve been imagining."',
  'Creative & Design':      'e.g. "Ideas made tangible."',
  'Travel & Hospitality':   'e.g. "Every journey, unforgettable."',
  'Fitness':                'e.g. "Push further. Recover stronger."',
  'Legal':                  'e.g. "Your rights. Our commitment."',
  'Construction':           'e.g. "Built to stand the test of time."',
  'Non-profit':             'e.g. "Together we change what\'s possible."',
  'Fashion':                'e.g. "Wear who you are."',
  'Entertainment':          'e.g. "Stories worth remembering."',
  'Consulting':             'e.g. "Clarity in every decision."',
  'E-commerce':             'e.g. "Everything you need, delivered."',
  'Other':                  'e.g. "A short phrase that captures your brand."',
}

export function WizStep1_Basics() {
  const { industry, name, tagline, subPhase, setField, setSubPhase } = useWizardStore()
  const suggestions = industry ? (INDUSTRY_NAMES[industry] ?? []) : []

  if (subPhase === 'industry') {
    return (
      <div className="biz-step">
        <div>
          <h1 className="biz-step-title">What industry are you in?</h1>
          <p className="biz-step-sub">We'll use this to suggest brand names and tailor your identity.</p>
        </div>
        <div className="biz-industry-section">
          <div className="biz-industry-chips">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                className={`biz-industry-chip${industry === ind ? ' active' : ''}`}
                onClick={() => setField('industry', ind)}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="biz-step">
      <div>
        <h1 className="biz-step-title">What's your brand called?</h1>
        <p className="biz-step-sub">Pick a suggested name or type your own. You can always change it later.</p>
      </div>

      <div className="biz-fields">
        <div className="onb-field">
          <label className="onb-label">Brand name *</label>
          <input
            className="onb-input"
            placeholder="Enter your brand name"
            value={name}
            onChange={(e) => setField('name', e.target.value)}
            autoFocus
          />
        </div>

        {suggestions.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em' }}>
              Suggestions for {industry}
            </div>
            <div className="biz-name-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className={`biz-name-chip${name === s ? ' active' : ''}`}
                  onClick={() => setField('name', s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="onb-field">
          <label className="onb-label">Tagline <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
          <input
            className="onb-input"
            placeholder={INDUSTRY_TAGLINES[industry] ?? 'e.g. "A short phrase that captures your brand."'}
            maxLength={140}
            value={tagline}
            onChange={(e) => setField('tagline', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export function WizStep1_Nav({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { industry, name, subPhase, setSubPhase } = useWizardStore()

  if (subPhase === 'industry') {
    return (
      <div className="biz-nav">
        <button className="btn primary" disabled={!industry} onClick={() => setSubPhase('name')}>
          Next →
        </button>
      </div>
    )
  }

  return (
    <div className="biz-nav">
      <button className="biz-nav-back-link" onClick={() => setSubPhase('industry')}>← Back</button>
      <button className="btn primary" disabled={!name.trim()} onClick={onNext}>Continue →</button>
    </div>
  )
}
