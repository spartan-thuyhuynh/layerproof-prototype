import { useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export function Step1_SignUp() {
  const { setEmail, nextStep } = useOnboardingStore()
  const [localEmail, setLocalEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const canContinue = localEmail.includes('@') && password.length >= 6

  function handleContinue() {
    if (!canContinue) return
    setEmail(localEmail)
    nextStep()
  }

  return (
    <div className="onb-auth-form fade-in">
      {/* Logo */}
      <div className="onb-auth-logo">
        <img
          src={`${import.meta.env.BASE_URL}lplogo.png`}
          alt="LayerProof"
          className="onb-auth-logo-img"
        />
      </div>

      <h1 className="onb-auth-headline">Get started in seconds</h1>

      {/* Google SSO */}
      <button
        className="onb-auth-google"
        onClick={() => { setEmail('google@user.com'); nextStep() }}
      >
        <GoogleIcon />
        Sign in with Google
      </button>

      {/* Divider */}
      <div className="onb-divider">
        <div className="onb-divider-line" />
        <span className="onb-divider-label">or</span>
        <div className="onb-divider-line" />
      </div>

      {/* Email */}
      <div className="onb-auth-field">
        <label className="onb-auth-label">
          Email address <span style={{ color: 'var(--c-red)' }}>*</span>
        </label>
        <input
          className="onb-auth-input"
          type="email"
          placeholder="abc@gmail.com"
          value={localEmail}
          autoFocus
          onChange={(e) => setLocalEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        />
      </div>

      {/* Password */}
      <div className="onb-auth-field">
        <label className="onb-auth-label">
          Password <span style={{ color: 'var(--c-red)' }}>*</span>
        </label>
        <div className="onb-auth-pw-wrap">
          <input
            className="onb-auth-input"
            type={showPw ? 'text' : 'password'}
            placeholder="············"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
          />
          <button
            className="onb-auth-eye"
            type="button"
            onClick={() => setShowPw(!showPw)}
            tabIndex={-1}
          >
            <EyeIcon show={showPw} />
          </button>
        </div>
      </div>

      {/* Remember + Forgot */}
      <div className="onb-auth-row">
        <label className="onb-auth-check-label">
          <input
            type="checkbox"
            className="onb-auth-checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>
        <button className="onb-auth-forgot" type="button">Forgot password?</button>
      </div>

      {/* CTA */}
      <button
        className="onb-auth-cta"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continue
      </button>

      {/* Sign up link */}
      <p className="onb-auth-foot">
        Don't have an account?{' '}
        <button className="onb-link" type="button" onClick={nextStep}>Sign up</button>
      </p>
    </div>
  )
}
