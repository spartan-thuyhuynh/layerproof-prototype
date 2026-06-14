import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { Step1_SignUp }   from './steps/Step1_SignUp'
import { Step2_Intent }   from './steps/Step2_Intent'
import { Step3_Product }  from './steps/Step3_Product'
import { Step4_BrandName } from './steps/Step4_BrandName'
import { Step5_Import }   from './steps/Step5_Import'
import { Step6_Processing } from './steps/Step6_Processing'
import { Step7_Review }   from './steps/Step7_Review'
import { Step8_Project }  from './steps/Step8_Project'
import { Step9_Complete } from './steps/Step9_Complete'
import { ArrowLeft } from '@/shared/icons'

const base = import.meta.env.BASE_URL

const TOTAL_STEPS = 9

const STEP_LABELS: Record<number, string> = {
  1: 'Sign up',
  2: 'About you',
  3: 'Choose product',
  4: 'Your brand',
  5: 'Brand setup',
  6: 'Extracting',
  7: 'Review brand',
  8: 'First project',
  9: 'All done',
}

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 1: return <Step1_SignUp />
    case 2: return <Step2_Intent />
    case 3: return <Step3_Product />
    case 4: return <Step4_BrandName />
    case 5: return <Step5_Import />
    case 6: return <Step6_Processing />
    case 7: return <Step7_Review />
    case 8: return <Step8_Project />
    case 9: return <Step9_Complete />
    default: return null
  }
}

// Left panel illustration — updates per product selection
function LeftPanel() {
  const { selectedProduct, brandName, step } = useOnboardingStore()

  const PRODUCT_GRADIENTS: Record<string, string> = {
    matte:  'linear-gradient(135deg, #ec4899 0%, #ff6b6b 100%)',
    chromo: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    vellum: 'linear-gradient(135deg, #14b8a6 0%, #22d3ee 100%)',
    kraft:  'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
  }

  const PRODUCT_NAMES: Record<string, string> = {
    matte:  'Matte',
    chromo: 'Chromo',
    vellum: 'Vellum',
    kraft:  'Kraft',
  }

  const gradient = selectedProduct
    ? PRODUCT_GRADIENTS[selectedProduct]
    : 'linear-gradient(135deg, #ec4899 0%, #ffde42 100%)'

  return (
    <div className="onb-left" style={{ background: gradient }}>
      <div className="onb-left-inner">
        {/* Logo */}
        <div className="onb-left-logo">
          <div className="onb-left-mark">
            <i className="a" /><i className="b" />
            <i className="c" /><i className="d" />
          </div>
          <span className="onb-left-wordmark">LayerProof</span>
        </div>

        {/* Context copy */}
        <div className="onb-left-body">
          {step >= 3 && selectedProduct ? (
            <>
              <div className="onb-left-eyebrow">You're building with</div>
              <div className="onb-left-product-name">LayerProof {PRODUCT_NAMES[selectedProduct]}</div>
              {brandName && step >= 4 && (
                <div className="onb-left-brand">
                  <div className="onb-left-brand-avatar">
                    {brandName[0].toUpperCase()}
                  </div>
                  <div className="onb-left-brand-label">{brandName}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="onb-left-tagline">Your brand, consistent across every output.</div>
              <div className="onb-left-features">
                {['Colors & Typography', 'Logo & Imagery', 'Tone of Voice', 'AI-Powered Outputs'].map((f) => (
                  <div key={f} className="onb-left-feature">
                    <span className="onb-left-feature-dot" />
                    {f}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Step counter */}
        <div className="onb-left-steps">
          {step} of {TOTAL_STEPS}
        </div>
      </div>
    </div>
  )
}

function BackToPrototypes() {
  const navigate = useNavigate()
  return (
    <button className="onb-back-proto" onClick={() => navigate('/')}>
      <ChevronLeft size={14} className="onb-back-proto-chevron" />
      All Prototypes
    </button>
  )
}

export function OnboardingWizard() {
  const { step, prevStep, importPath } = useOnboardingStore()

  // Step 6 (Processing) is skipped on blank path:
  const displayStep = (step === 6 && importPath === 'blank') ? 7 : step

  // Back goes to 5 if we're on 7 after a blank import (skip step 6)
  function handleBack() {
    if (displayStep === 7 && importPath === 'blank') {
      useOnboardingStore.getState().setStep(5)
    } else {
      prevStep()
    }
  }

  const isProcessing = displayStep === 6
  const isComplete   = displayStep === 9
  const showBack     = displayStep > 1 && !isProcessing && !isComplete
  const progress     = (displayStep / TOTAL_STEPS) * 100

  // Step 1: full-page auth layout (image left, form right)
  if (displayStep === 1) {
    return (
      <div className="onb-auth-shell">
        <div className="onb-auth-left">
          <img
            src={`${base}onboarding/auth-hero.png`}
            alt=""
            className="onb-auth-hero-img"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div className="onb-auth-left-overlay" />
          <div className="onb-auth-tagline">
            <p className="onb-auth-tagline-title">Your brand, consistent across every output.</p>
            <p className="onb-auth-tagline-sub">One kit. Infinite possibilities.</p>
            <div className="onb-auth-tagline-line" />
          </div>
        </div>
        <div className="onb-auth-right">
          {/* Back nav — matches sidebar style */}
          <BackToPrototypes />
          <div className="onb-auth-form-wrap">
            <Step1_SignUp />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="onb-shell">
      <LeftPanel />

      <div className="onb-right">
        {/* Back to all prototypes — always visible at top */}
        <BackToPrototypes />

        {/* Progress bar */}
        <div className="onb-progress-track">
          <div className="onb-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Nav bar */}
        <div className="onb-nav">
          {showBack ? (
            <button className="onb-back" onClick={handleBack}>
              <ArrowLeft style={{ width: 15, height: 15 }} />
              Back
            </button>
          ) : (
            <div />
          )}
          <span className="onb-step-pill">{STEP_LABELS[displayStep]}</span>
        </div>

        {/* Step content */}
        <div className="onb-content">
          <StepContent step={displayStep} />
        </div>
      </div>
    </div>
  )
}
