import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'

const base = import.meta.env.BASE_URL

const PRODUCTS = [
  {
    slug: 'social-post',
    name: 'LayerProof Matte',
    sub: 'Social Post Generator',
    desc: 'AI-powered posts for Instagram, LinkedIn & beyond',
    icon: 'Social',
    color: '#f97316',
    img: `${base}home/card-social-post.png`,
    recommended: true,
  },
  {
    slug: 'presentation',
    name: 'LayerProof Chromo',
    sub: 'Slide Generation',
    desc: 'Turn ideas into polished decks, pitch-ready in minutes',
    icon: 'Present',
    color: '#8b5cf6',
    img: `${base}home/card-presentation.png`,
    recommended: false,
  },
  {
    slug: 'space',
    name: 'LayerProof Vellum',
    sub: 'Image Generator',
    desc: 'Generate on-brand visuals from text prompts',
    icon: 'Layers',
    color: '#14b8a6',
    img: `${base}home/card-space.png`,
    recommended: false,
  },
  {
    slug: 'docs',
    name: 'LayerProof Kraft',
    sub: 'Long Form Content',
    desc: 'Blogs, briefs, reports and docs, in your brand voice',
    icon: 'Docs',
    color: '#f97316',
    img: `${base}home/card-docs.png`,
    recommended: false,
  },
  {
    slug: 'design',
    name: 'LayerProof Design',
    sub: 'Graphic Design',
    desc: 'Create graphics, visuals, and brand assets at scale',
    icon: 'Sparkle',
    color: '#3b82f6',
    img: `${base}home/card-design.png`,
    recommended: false,
    comingSoon: true,
  },
  {
    slug: 'app',
    name: 'LayerProof App',
    sub: 'App Builder',
    desc: 'Build interactive web experiences and landing pages',
    icon: 'Globe',
    color: '#ec4899',
    img: `${base}home/card-app.png`,
    recommended: false,
    comingSoon: true,
  },
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

export function Step3_Product() {
  const navigate = useNavigate()
  const { prevStep } = useOnboardingStore()
  const [showNudge, setShowNudge] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowNudge(true), 7000)
    return () => clearTimeout(t)
  }, [])

  function handleCardClick(slug: string) {
    setShowNudge(false)
    navigate(`/create/${slug}`)
  }

  return (
    <div className="onb-step onb-step--wide fade-in">
      <div className="onb-product-bg">
        <BackButton onClick={prevStep} />
        <div className="h-eyebrow" style={{ marginBottom: 12, marginTop: 20 }}>Welcome to LayerProof</div>
        <h1 className="onb-step-title" style={{ fontSize: 36, marginBottom: 8, fontFamily: 'Anton', fontWeight: 400, letterSpacing: '.01em' }}>How would you like to get started?</h1>
        <p className="onb-step-sub" style={{ fontSize: 16, marginBottom: 28 }}>Pick a product to dive into — you can explore everything else from your dashboard.</p>
        <div className="onb-product-grid onb-product-grid--6" style={showNudge ? { paddingTop: 56 } : undefined}>
          {PRODUCTS.map(({ slug, name, sub, desc, icon, color, img, recommended, comingSoon }) => {
            const Icon = I.Icons[icon]
            const isNudged = showNudge && recommended
            return (
              <div key={slug} className="onb-product-card-wrap">
                {isNudged && (
                  <div className="onb-nudge">
                    <div className="onb-nudge-bubble">Not sure? Start here!</div>
                    <div className="onb-nudge-arrow" />
                  </div>
                )}
                <button
                  className={`onb-product-card card hover${isNudged ? ' onb-product-card--nudged' : ''}${comingSoon ? ' onb-product-card--coming-soon' : ''}`}
                  onClick={() => !comingSoon && handleCardClick(slug)}
                >
                  <div className="onb-product-thumb">
                    {comingSoon && <span className="onb-coming-soon-badge">Coming Soon</span>}
                    <img
                      src={img}
                      alt={name}
                      className="onb-product-thumb-img"
                      onError={(e) => {
                        const el = e.currentTarget
                        el.style.display = 'none'
                        const placeholder = el.nextElementSibling as HTMLElement | null
                        if (placeholder) placeholder.style.display = 'flex'
                      }}
                    />
                    <div
                      className="onb-product-thumb-placeholder"
                      style={{ background: comingSoon ? `${color}35` : `${color}18`, display: 'none' }}
                    />
                  </div>
                  <div className="onb-product-body">
                    <div className="onb-product-header">
                      <div className="onb-product-name">{name}</div>
                    </div>
                    <div className="onb-product-sub">{sub}</div>
                    <div className="onb-product-desc">{desc}</div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
