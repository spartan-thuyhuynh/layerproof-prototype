import { useLayoutEffect, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { Step1_SignUp }     from './steps/Step1_SignUp'
import { Step2_Intent }     from './steps/Step2_Intent'
import { Step3_DeviceGate } from './steps/Step3_DeviceGate'
import { Step4_BrandName }  from './steps/Step4_BrandName'
import { Step3_Product as Step5_Product } from './steps/Step3_Product'
import { ArrowLeft } from '@/shared/icons'

const base = import.meta.env.BASE_URL

const TOTAL_STEPS = 5

const STEP_LABELS: Record<number, string> = {
  1: 'Sign up',
  2: 'About you',
  3: 'Device check',
  4: 'Brand kit',
  5: 'Choose product',
}

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 1: return <Step1_SignUp />
    case 2: return <Step2_Intent />
    case 3: return <Step3_DeviceGate />
    case 4: return <Step4_BrandName />
    case 5: return <Step5_Product />
    default: return null
  }
}

const HERO_TABS = [
  {
    id: 'social-post',
    label: 'Social Post',
    img: `${base}auth-hero.png`,
    title: 'Multiple creative directions in minutes',
    sub: 'Test dozens of hooks and visual styles simultaneously to find your top-performing creative.',
  },
  {
    id: 'presentation',
    label: 'Presentation',
    img: `${base}home/feature-presentation.png`,
    title: 'Pitch-ready decks, built in seconds',
    sub: 'Turn a brief or URL into a polished presentation with your brand applied automatically.',
  },
  {
    id: 'space',
    label: 'Space',
    img: `${base}home/feature-space.png`,
    title: 'On-brand visuals from a single prompt',
    sub: 'Generate images that match your palette, style, and tone — no design skills needed.',
  },
  {
    id: 'docs',
    label: 'Docs',
    img: `${base}home/feature-docs.png`,
    title: 'Long-form content, in your brand voice',
    sub: 'Blogs, briefs, reports and docs drafted fast — consistent, on-brand, every time.',
  },
  {
    id: 'design',
    label: 'Design',
    img: `${base}home/feature-design.png`,
    title: 'Brand assets at scale',
    sub: 'Create graphics, banners, and visual content that always looks unmistakably yours.',
  },
]

function AuthHeroSwitcher() {
  const [active, setActive] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer(from: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % HERO_TABS.length)
    }, 7000)
  }

  useEffect(() => {
    startTimer(active)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function handleChipClick(i: number) {
    setActive(i)
    startTimer(i)
  }

  const tab = HERO_TABS[active]

  return (
    <div className="auth-switcher">
      <img
        key={tab.id}
        src={tab.img}
        alt={tab.label}
        className="auth-switcher-img"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }}
      />
      <div className="auth-switcher-content">
        <h2 className="auth-switcher-title">{tab.title}</h2>
        <p className="auth-switcher-sub">{tab.sub}</p>
        <div className="auth-switcher-chips">
          {HERO_TABS.map((t, i) => (
            <button
              key={t.id}
              className={`auth-switcher-chip${i === active ? ' active' : ''}`}
              onClick={() => handleChipClick(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
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
  const { step, prevStep, reset, setStep } = useOnboardingStore()
  const location = useLocation()

  const onMobile = typeof window !== 'undefined'
    && (window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))

  useLayoutEffect(() => {
    if (!location.state?.resumeFromCreate) reset()
  }, [])

  // On desktop, skip step 3 (device gate) by advancing the store immediately
  useLayoutEffect(() => {
    if (step === 3 && !onMobile) setStep(4)
  }, [step, onMobile])

  const displayStep = step

  function handleBack() {
    // Skip back over step 3 (device gate) on desktop
    if (step === 4 && !onMobile) {
      setStep(2)
    } else {
      prevStep()
    }
  }

  const isProcessing = false
  const isComplete   = false
  const showBack     = displayStep > 1 && !isProcessing && !isComplete
  const progress     = (displayStep / TOTAL_STEPS) * 100

  // Step 1: full-page auth layout (image left, form right)
  if (displayStep === 1) {
    return (
      <div className="onb-auth-page">
        <BackToPrototypes />
        <div className="onb-auth-shell">
          <div className="onb-auth-left">
            <AuthHeroSwitcher />
          </div>
          <div className="onb-auth-right">
            <div className="onb-auth-form-wrap">
              <Step1_SignUp />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="onb-shell onb-shell--no-left">
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
