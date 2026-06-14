import { useState, useEffect } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { Check, Clock } from '@/shared/icons'

const MOCK_COLORS = ['#EC4899', '#FFDE42', '#8B5CF6', '#0A0A0A']
const MOCK_FONTS  = ['Inter', 'Playfair Display']

const EXTRACTION_STEPS = [
  {
    label: 'Colors detected',
    detail: () => (
      <span className="onb-proc-swatches">
        {MOCK_COLORS.map((c) => (
          <span key={c} className="onb-proc-swatch" style={{ background: c }} title={c} />
        ))}
      </span>
    ),
  },
  {
    label: 'Fonts identified',
    detail: () => (
      <span className="onb-proc-fonts">
        {MOCK_FONTS.map((f) => (
          <span key={f} style={{ fontFamily: f, fontSize: 12, color: 'var(--t2)', marginRight: 12 }}>{f}</span>
        ))}
      </span>
    ),
  },
  { label: 'Logo extracted',         detail: () => null },
  { label: 'Imagery style analysed', detail: () => null },
  { label: 'Tone of voice mapped',   detail: () => null },
]

const STEP_INTERVAL = 650 // ms per extraction step
const TOTAL_DURATION = EXTRACTION_STEPS.length * STEP_INTERVAL + 400

export function Step6_Processing() {
  const { brandName, importPath, importUrl, setBrandName: _s, setNewKitId, nextStep } = useOnboardingStore()
  const { createKit, updateKit } = useBrandStore()
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  // Read from store once (avoid re-render issues)
  const storedBrandName = useOnboardingStore((s) => s.brandName)
  const storedTagline   = useOnboardingStore((s) => s.tagline)

  useEffect(() => {
    // Kick off extraction animation
    const stepInterval = setInterval(() => {
      setActiveStep((s) => {
        if (s >= EXTRACTION_STEPS.length - 1) {
          clearInterval(stepInterval)
          return s
        }
        return s + 1
      })
    }, STEP_INTERVAL)

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + (100 / (TOTAL_DURATION / 50)), 100))
    }, 50)

    // Finish — create kit & advance
    const finishTimer = setTimeout(() => {
      setDone(true)
      clearInterval(progressInterval)
      setProgress(100)

      const newId = createKit()
      updateKit(newId, (k) => ({
        ...k,
        name: storedBrandName || 'Untitled Brand',
        tagline: storedTagline,
        logoText: (storedBrandName || 'U')[0].toUpperCase(),
        onboarding: true,
        // seed mock extracted data
        colors: {
          palettes: [{
            id: 'brand',
            name: 'Brand Colors',
            desc: `Extracted from ${importPath === 'url' ? importUrl : 'uploaded file'}`,
            colors: [
              { name: 'Accent', hex: '#EC4899', role: 'Primary brand' },
              { name: 'Highlight', hex: '#FFDE42', role: 'CTAs' },
              { name: 'Deep', hex: '#8B5CF6', role: 'Gradients' },
              { name: 'Ink', hex: '#0A0A0A', role: 'Backgrounds' },
            ],
          }],
        },
        type: {
          ...k.type,
          display: { family: 'Playfair Display', weight: '700', note: 'Headlines' },
          body:    { family: 'Inter',            weight: '400', note: 'Body copy' },
        },
        tone: {
          ...k.tone,
          attrs: [
            { t: 'Confident', vs: 'not arrogant', v: 75, d: 'We know the craft.' },
            { t: 'Warm',      vs: 'not casual',   v: 60, d: 'Friendly, human.' },
            { t: 'Clear',     vs: 'not jargon-y', v: 85, d: 'Plain words, real verbs.' },
          ],
        },
      }))
      setNewKitId(newId)

      setTimeout(() => nextStep(), 600)
    }, TOTAL_DURATION)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearTimeout(finishTimer)
    }
  }, []) // intentionally run once

  const headline = importPath === 'url'
    ? `Scanning ${importUrl || 'your site'}…`
    : 'Processing your file…'

  return (
    <div className="onb-processing fade-in">
      <div className="h-eyebrow" style={{ marginBottom: 12 }}>
        {done ? 'Done!' : 'Extracting'}
      </div>
      <h2 className="onb-step-title" style={{ fontSize: 24 }}>
        {done ? `${brandName || 'Brand'} kit is ready` : headline}
      </h2>

      <div className="onb-proc-steps">
        {EXTRACTION_STEPS.map(({ label, detail: Detail }, i) => {
          const isDone   = i < activeStep || done
          const isActive = i === activeStep && !done
          return (
            <div key={i} className={`onb-proc-step${isDone ? ' done' : isActive ? ' active' : ''}`}>
              <div className="onb-proc-tick">
                {isDone
                  ? <Check style={{ width: 13, height: 13 }} />
                  : isActive
                    ? <Clock className="spin" style={{ width: 13, height: 13 }} />
                    : null}
              </div>
              <span className="onb-proc-label">{label}</span>
              {isDone && <Detail />}
            </div>
          )
        })}
      </div>

      <div className="onb-proc-bar-wrap">
        <div className="onb-proc-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="onb-proc-pct tiny">{Math.round(progress)}%</div>
    </div>
  )
}
