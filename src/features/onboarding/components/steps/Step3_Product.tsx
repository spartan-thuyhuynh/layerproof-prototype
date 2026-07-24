import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'

const base = import.meta.env.BASE_URL

type Category = 'write' | 'visual' | 'build'

const PINK = 'linear-gradient(to top left, rgba(236,72,153,0.6) 0%, rgba(236,72,153,0) 65%)'
const YELLOW = 'linear-gradient(to top left, rgba(234,179,8,0.55) 0%, rgba(234,179,8,0) 65%)'

const PRODUCTS = [
  {
    slug: 'social-post',
    label: 'Social Post',
    category: 'write' as Category,
    desc: 'Create publish-ready posts and carousels',
    icon: 'Social',
    color: '#f97316',
    gradient: PINK,
    img: `${base}home/card-social-post.png`,
  },
  {
    slug: 'motion',
    label: 'Motion',
    category: 'visual' as Category,
    desc: 'Animate your ideas into motion videos',
    icon: 'Sparkle',
    color: '#a855f7',
    gradient: YELLOW,
    img: `${base}home/card-motion.png`,
    isNew: true,
  },
  {
    slug: 'presentation',
    label: 'Presentation',
    category: 'visual' as Category,
    desc: 'Turn your ideas into ready-to-present decks',
    icon: 'Present',
    color: '#8b5cf6',
    gradient: PINK,
    img: `${base}home/card-presentation.png`,
  },
  {
    slug: 'space',
    label: 'Image Canvas',
    category: 'visual' as Category,
    desc: 'Mix images on a drag-and-drop canvas',
    icon: 'Layers',
    color: '#14b8a6',
    gradient: YELLOW,
    img: `${base}home/card-space.png`,
  },
  {
    slug: 'docs',
    label: 'Docs',
    category: 'write' as Category,
    desc: 'Write insightful long-form content',
    icon: 'Docs',
    color: '#f97316',
    gradient: PINK,
    img: `${base}home/card-docs.png`,
  },
  {
    slug: 'report',
    label: 'Report',
    category: 'write' as Category,
    desc: 'Turn data into interactive HTML reports',
    icon: 'FileText',
    color: '#0ea5e9',
    gradient: YELLOW,
    img: `${base}home/card-report.png`,
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

function getPageSize() {
  if (window.innerWidth <= 768) return 1
  if (window.innerWidth <= 1024) return 2
  return 3
}

export function Step3_Product() {
  const navigate = useNavigate()
  const { prevStep } = useOnboardingStore()
  const [firstVisible, setFirstVisible] = useState(0)
  const [pageSize, setPageSize] = useState(getPageSize)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq768  = window.matchMedia('(max-width: 768px)')
    const mq1024 = window.matchMedia('(max-width: 1024px)')
    const update = () => setPageSize(getPageSize())
    mq768.addEventListener('change', update)
    mq1024.addEventListener('change', update)
    return () => {
      mq768.removeEventListener('change', update)
      mq1024.removeEventListener('change', update)
    }
  }, [])

  function handleCardClick(slug: string) {
    if (slug === 'motion') navigate('/motion-editor')
    else navigate(`/create/${slug}`)
  }

  function goTo(i: number) {
    const idx = Math.max(0, Math.min(i, PRODUCTS.length - 1))
    const el = scrollRef.current?.children[idx] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    setFirstVisible(idx)
  }

  function handleScroll() {
    const clip = scrollRef.current
    if (!clip) return
    const cards = Array.from(clip.children) as HTMLElement[]
    let leftmost = 0
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].offsetLeft >= clip.scrollLeft - 4) { leftmost = i; break }
    }
    setFirstVisible(leftmost)
  }

  const pageCount = Math.ceil(PRODUCTS.length / pageSize)
  const currentPage = Math.floor(firstVisible / pageSize)

  const canPrev = currentPage > 0
  const canNext = currentPage < pageCount - 1

  return (
    <div className="onb-step onb-step--wide fade-in">
      <div className="onb-product-bg">
        <BackButton onClick={prevStep} />
        <div className="h-eyebrow" style={{ marginBottom: 12, marginTop: 20 }}>Welcome to LayerProof</div>
        <h1 className="onb-step-title onb-product-title">
          What are you making today?
        </h1>
        <p className="onb-step-sub onb-carousel-sub">
          Whatever you're creating, make it on-brand in minutes.
        </p>

        <div className="onb-carousel">
          <button className="onb-carousel-btn" disabled={!canPrev} onClick={() => goTo((currentPage - 1) * pageSize)} aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="onb-carousel-clip" ref={scrollRef} onScroll={handleScroll}>
            {PRODUCTS.map((p, idx) => {
              const Icon = I.Icons[p.icon]
              return (
                <button
                  key={p.slug}
                  className="onb-scroll-card"
                  onClick={() => handleCardClick(p.slug)}
                >
                  {'recommended' in p && !!(p as Record<string, unknown>).recommended && (
                    <div className="onb-scroll-rec">Most popular</div>
                  )}
                  <div className="onb-scroll-card-img-wrap" style={{ background: p.gradient }}>
                    {p.img
                      ? <img src={p.img} alt={p.label} className="onb-scroll-card-img" />
                      : <div className="onb-scroll-card-fallback" style={{ background: `${p.color}22`, color: p.color }}>
                          {Icon && <Icon width={48} height={48} />}
                        </div>
                    }
                    <div className="onb-scroll-card-cta-overlay">
                      <span className="onb-scroll-card-cta-btn">
                        Get started
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="onb-scroll-card-body">
                    <div className="onb-scroll-card-title">
                      {p.label}
                      {'isNew' in p && p.isNew && (
                        <span className="onb-new-badge">NEW</span>
                      )}
                      {'beta' in p && !!(p as Record<string, unknown>).beta && (
                        <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '1px 5px', borderRadius: 99, background: '#2a2000', color: '#d4a017', border: '1px solid #d4a01744', verticalAlign: 'middle' }}>BETA</span>
                      )}
                    </div>
                    <div className="onb-scroll-card-desc">{p.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>

          <button className="onb-carousel-btn" disabled={!canNext} onClick={() => goTo((currentPage + 1) * pageSize)} aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="onb-carousel-dots">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button key={i} className={`onb-carousel-dot${i === currentPage ? ' active' : ''}`} onClick={() => goTo(i * pageSize)} />
          ))}
        </div>
      </div>
    </div>
  )
}
