import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function OnboardingPage() {
  const navigate = useNavigate()
  const base = import.meta.env.BASE_URL

  return (
    <div className="lp-page ob-placeholder-page">
      <button className="proto-back-btn ob-placeholder-back" onClick={() => navigate('/')}>
        <ChevronLeft size={14} />
        All Prototypes
      </button>

      <div className="ob-placeholder-body">
        <img
          src={`${base}onboarding/illustration.png`}
          alt=""
          className="ob-placeholder-img"
        />
        <span className="chip">Coming Soon</span>
        <h1 className="ob-placeholder-title">New Onboarding</h1>
        <p className="ob-placeholder-sub">
          The walk-through flow for first-time brand kit setup is in progress.<br />
          Check back soon.
        </p>
        <button className="btn" onClick={() => navigate('/')}>
          ← Back to Prototypes
        </button>
      </div>
    </div>
  )
}
