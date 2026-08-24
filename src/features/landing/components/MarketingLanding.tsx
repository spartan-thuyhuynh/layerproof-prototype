import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react'
import { ArrowRight, Check, Sparkle, ImageSquare, FacebookLogo, InstagramLogo, TiktokLogo, TwitterLogo, LinkedinLogo } from '@phosphor-icons/react' // v2
import { useLocale } from '@/features/landing/i18n'
import type { Locale } from '@/features/landing/i18n'

const base = import.meta.env.BASE_URL

/* ─── Skeleton helpers ─────────────────────────────────────────── */
function Sk({ w, h, r }: { w?: string; h?: string; r?: string }) {
  return (
    <div
      className="ml-sk"
      style={{ width: w ?? '100%', height: h ?? '16px', borderRadius: r ?? '6px' }}
    />
  )
}

function SkeletonScreen() {
  return (
    <div className="ml-skeleton-screen" aria-hidden>
      <div className="ml-sk-nav">
        <Sk w="120px" h="28px" r="6px" />
        <div style={{ display: 'flex', gap: '24px' }}>
          <Sk w="64px" h="14px" />
          <Sk w="76px" h="14px" />
          <Sk w="52px" h="14px" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Sk w="80px" h="38px" r="8px" />
          <Sk w="130px" h="38px" r="8px" />
        </div>
      </div>
      <div className="ml-sk-hero">
        <div className="ml-sk-hero-text">
          <Sk w="170px" h="24px" r="99px" />
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Sk w="95%" h="clamp(44px,6vw,76px)" r="10px" />
            <Sk w="80%" h="clamp(44px,6vw,76px)" r="10px" />
            <Sk w="55%" h="clamp(44px,6vw,76px)" r="10px" />
          </div>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Sk w="85%" h="18px" />
            <Sk w="68%" h="18px" />
          </div>
          <div style={{ marginTop: '36px', display: 'flex', gap: '12px' }}>
            <Sk w="180px" h="50px" r="999px" />
            <Sk w="140px" h="50px" r="999px" />
          </div>
        </div>
        <div className="ml-sk-hero-visual">
          <Sk w="100%" h="100%" r="16px" />
        </div>
      </div>
      <div className="ml-sk-trust">
        {[200, 230, 190].map((w, i) => (
          <Sk key={i} w={`${w}px`} h="50px" r="12px" />
        ))}
      </div>
    </div>
  )
}

/* ─── Illustration frame ───────────────────────────────────────── */
function IllustrationFrame({ label, ratio = '16/9', note }: { label: string; ratio?: string; note?: string }) {
  return (
    <div className="ml-illus-frame" style={{ aspectRatio: ratio }}>
      <ImageSquare size={26} weight="thin" className="ml-illus-icon" aria-hidden />
      <span className="ml-illus-label">{label}</span>
      {note && <span className="ml-illus-note">{note}</span>}
    </div>
  )
}

/* ─── Team avatar: initials placeholder (no real headshots in this
   prototype), neutral across the board. ──────────────────────────── */
function getInitials(name: string) {
  const words = name.match(/[A-Za-zÀ-ỹ]+/g) ?? []
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function TeamAvatar({ name }: { name: string }) {
  return (
    <span className="ml-team-avatar">
      {getInitials(name)}
    </span>
  )
}

/* ─── Hero illustration: layered product mockup (post preview + brand
   colors + chat reply + video + analytics) built from CSS-token-colored
   primitives so it adapts to dark/light mode automatically. ─────── */
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 640 480"
      className="ml-hero-illus"
      role="img"
      aria-label="LayerProof turning a brand into posts, video, replies, and reports"
    >
      <defs>
        <linearGradient id="heroPostGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--line-2)" />
          <stop offset="100%" stopColor="var(--card-2)" />
        </linearGradient>
      </defs>

      {/* central post preview card */}
      <g>
        <rect x="200" y="90" width="240" height="300" rx="18" fill="var(--card)" stroke="var(--line-2)" />
        <rect x="220" y="112" width="200" height="140" rx="12" fill="url(#heroPostGrad)" />
        <circle cx="236" cy="270" r="12" fill="var(--line-2)" />
        <rect x="256" y="264" width="90" height="8" rx="4" fill="var(--line-2)" />
        <rect x="256" y="278" width="60" height="8" rx="4" fill="var(--line-2)" />
        <rect x="220" y="304" width="200" height="7" rx="3.5" fill="var(--t3)" opacity="0.5" />
        <rect x="220" y="320" width="160" height="7" rx="3.5" fill="var(--t3)" opacity="0.5" />
        <g transform="translate(220, 348)">
          <path d="M8 14 C3 10 3 4 8 2 C11 1 13 3 14 5 C15 3 17 1 20 2 C25 4 25 10 20 14 L14 20 Z" fill="var(--t3)" />
          <rect x="34" y="6" width="30" height="8" rx="4" fill="var(--line-2)" />
        </g>
      </g>

      {/* floating brand-kit chip */}
      <g transform="translate(40, 56)">
        <g className="ml-hero-float ml-hero-float--1">
          <rect x="0" y="0" width="132" height="88" rx="14" fill="var(--card)" stroke="var(--line-2)" />
          <circle cx="27" cy="30" r="12" fill="var(--t1)" opacity="0.85" />
          <circle cx="55" cy="30" r="12" fill="var(--t2)" />
          <circle cx="83" cy="30" r="12" fill="var(--t3)" />
          <circle cx="111" cy="30" r="12" fill="var(--line-2)" />
          <rect x="18" y="56" width="96" height="7" rx="3.5" fill="var(--line-2)" />
          <rect x="18" y="70" width="60" height="7" rx="3.5" fill="var(--line-2)" />
        </g>
      </g>

      {/* floating auto-reply chip */}
      <g transform="translate(460, 36)">
        <g className="ml-hero-float ml-hero-float--2">
          <rect x="0" y="0" width="140" height="98" rx="16" fill="var(--card)" stroke="var(--line-2)" />
          <circle cx="27" cy="30" r="14" fill="var(--t3)" />
          <rect x="51" y="23" width="66" height="7" rx="3.5" fill="var(--line-2)" />
          <rect x="51" y="37" width="46" height="7" rx="3.5" fill="var(--line-2)" />
          <rect x="18" y="60" width="106" height="24" rx="12" fill="var(--card-2)" stroke="var(--line-2)" />
          <rect x="30" y="68" width="58" height="8" rx="4" fill="var(--t2)" />
        </g>
      </g>

      {/* floating video chip */}
      <g transform="translate(468, 296)">
        <g className="ml-hero-float ml-hero-float--3">
          <rect x="0" y="0" width="132" height="132" rx="16" fill="var(--card)" stroke="var(--line-2)" />
          <rect x="12" y="12" width="108" height="108" rx="10" fill="var(--panel)" />
          <circle cx="66" cy="66" r="24" fill="var(--line-2)" />
          <path d="M58 53 L82 66 L58 79 Z" fill="var(--t1)" />
        </g>
      </g>

      {/* floating analytics chip */}
      <g transform="translate(48, 322)">
        <g className="ml-hero-float ml-hero-float--4">
          <rect x="0" y="0" width="122" height="100" rx="16" fill="var(--card)" stroke="var(--line-2)" />
          <rect x="18" y="60" width="14" height="26" rx="3" fill="var(--line-2)" />
          <rect x="41" y="46" width="14" height="40" rx="3" fill="var(--line-2)" />
          <rect x="64" y="30" width="14" height="56" rx="3" fill="var(--t2)" />
          <rect x="87" y="52" width="14" height="34" rx="3" fill="var(--line-2)" />
        </g>
      </g>
    </svg>
  )
}

/* ─── Hook section: cards fly in from the viewport edge and text dims
   in/out driven directly by scroll progress (motion's useScroll), not a
   fixed-duration animation. ─────────────────────────────────────── */
type HookCardMotionCfg = { fromX: number; fromY: number; fromRotate: number; toRotate: number; range: [number, number] }

const HOOK_CARD_MOTION: HookCardMotionCfg[] = [
  { fromX: -220, fromY: -90,  fromRotate: -25, toRotate: -6, range: [0.00, 0.34] },
  { fromX: 150,  fromY: -90,  fromRotate: 28,  toRotate: 6,  range: [0.05, 0.39] },
  { fromX: 190,  fromY: -20,  fromRotate: -20, toRotate: -4, range: [0.10, 0.44] },
  { fromX: -190, fromY: 110,  fromRotate: 20,  toRotate: 4,  range: [0.15, 0.49] },
  { fromX: 0,    fromY: 130,  fromRotate: -16, toRotate: -3, range: [0.20, 0.54] },
  { fromX: 210,  fromY: 90,   fromRotate: 25,  toRotate: 6,  range: [0.25, 0.59] },
]

const HOOK_WORD_RANGES: [number, number][] = [
  [0.05, 0.22], [0.12, 0.29], [0.19, 0.36], [0.26, 0.43], [0.33, 0.50], [0.40, 0.57],
]
const HOOK_SUB_RANGE: [number, number] = [0.45, 0.68]

function HookCard({
  progress, cfg, index, label, note, ratio, reduced,
}: {
  progress: MotionValue<number>
  cfg: HookCardMotionCfg
  index: number
  label: string
  note: string
  ratio: string
  reduced: boolean
}) {
  const opacity = useTransform(progress, cfg.range, [0, 1])
  const x = useTransform(progress, cfg.range, [cfg.fromX, 0])
  const y = useTransform(progress, cfg.range, [cfg.fromY, 0])
  const rotate = useTransform(progress, cfg.range, [cfg.fromRotate, cfg.toRotate])
  const scale = useTransform(progress, cfg.range, [0.8, 1])
  return (
    <motion.div
      className={`ml-hook-card ml-hook-card--${index + 1}`}
      style={reduced ? { opacity: 1, rotate: cfg.toRotate } : { opacity, x, y, rotate, scale }}
      whileHover={{ scale: 1.05 }}
    >
      <IllustrationFrame label={label} note={note} ratio={ratio} />
    </motion.div>
  )
}

function HookWord({
  progress, range, reduced, children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  reduced: boolean
  children: string
}) {
  const opacity = useTransform(progress, range, [0.22, 1])
  return (
    <motion.span className="ml-hook-word" style={{ opacity: reduced ? 1 : opacity }}>
      {children}{' '}
    </motion.span>
  )
}

/* ─── Brand marquee (shop names are proper nouns — same in every locale) ─ */
const BRAND_NAMES = [
  'Bánh Mì Phượng', 'Tiệm Nail Lan', 'Cơm Tấm Bà Cụ', 'Spa Bình An', 'Shop Hà',
  'BĐS Minh Quân', 'Cà Phê Nhà', 'Giặt Ủi Sạch', 'Kem Dừa Côn Đảo', 'Tiệm Tóc Minh',
  'Bánh Kem Hạnh', 'Thú Cưng Meo', 'Nước Ép Tươi', 'Thời Trang Thy', 'Nhà Hàng Vị Quê',
  'Bánh Mì Phượng', 'Tiệm Nail Lan', 'Cơm Tấm Bà Cụ', 'Spa Bình An', 'Shop Hà',
  'BĐS Minh Quân', 'Cà Phê Nhà', 'Giặt Ủi Sạch', 'Kem Dừa Côn Đảo', 'Tiệm Tóc Minh',
]

/* ─── Component ────────────────────────────────────────────────── */
const REVEAL_SECTIONS = [
  'brands', 'cases', 'pillars', 'industries', 'ugc', 'deepdives', 'soon', 'compare', 'pricing', 'team', 'cta', 'footer',
] as const

export function MarketingLanding() {
  const { locale, setLocale, content } = useLocale()
  const [loaded, setLoaded] = useState(false)
  const [activeInd, setActiveInd] = useState('fnb')
  const casesRef = useRef<HTMLDivElement>(null)
  const scrollCases = (dir: 'prev' | 'next') => {
    casesRef.current?.scrollBy({ left: dir === 'next' ? 356 : -356, behavior: 'smooth' })
  }
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const industryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const revealRefs = useRef<Record<string, HTMLElement | null>>({})
  const hookSectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = !!useReducedMotion()
  const { scrollYProgress: hookProgress } = useScroll({
    target: hookSectionRef,
    offset: ['start end', 'end start'],
  })
  const hookSubOpacity = useTransform(hookProgress, HOOK_SUB_RANGE, [0, 1])

  const revealClass = (id: string, base: string) =>
    `${base} ml-reveal-section${revealed.has(id) ? ' ml-revealed' : ''}`

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1300)
    return () => clearTimeout(t)
  }, [])

  // Reveal each below-the-fold section whenever it's in view — re-animates
  // both scrolling down into it and scrolling back up into it.
  useEffect(() => {
    if (!loaded) return
    const entries: [string, HTMLElement][] = []
    REVEAL_SECTIONS.forEach((id) => {
      const el = revealRefs.current[id]
      if (el) entries.push([id, el])
    })
    if (!entries.length) return
    const io = new IntersectionObserver(
      (observed) => {
        observed.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.revealId
          if (!id) return
          setRevealed((prev) => {
            const isIn = prev.has(id)
            if (entry.isIntersecting === isIn) return prev
            const next = new Set(prev)
            if (entry.isIntersecting) next.add(id)
            else next.delete(id)
            return next
          })
        })
      },
      { threshold: 0.15 }
    )
    entries.forEach(([, el]) => io.observe(el))
    return () => io.disconnect()
  }, [loaded])

  useEffect(() => {
    if (!loaded) return
    const panels = Object.values(industryRefs.current).filter((el): el is HTMLDivElement => !!el)
    if (!panels.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) {
          const id = (hit.target as HTMLDivElement).dataset.industry
          if (id) setActiveInd(id)
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    )
    panels.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [loaded])

  const activeIndustry = content.industries.items.find((ind) => ind.id === activeInd) ?? content.industries.items[0]


  const switchLocale = (next: Locale) => {
    if (next !== locale) setLocale(next)
  }

  return (
    <div className={`ml-page${loaded ? ' ml-loaded' : ''}`}>
      {!loaded && <SkeletonScreen />}

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav className="ml-nav">
        <div className="ml-nav-inner">
          <a href="#/" className="ml-nav-logo" aria-label={content.nav.backAriaLabel}>
            <img src={`${base}logos/symbol.png`} alt="" className="ml-nav-symbol" />
            <span className="ml-nav-wordmark">LayerProof</span>
          </a>
          <div className="ml-nav-links">
            <a href="#product" className="ml-nav-link-drop">{content.nav.product} <span className="ml-nav-chevron">▾</span></a>
            <a href="#industries" className="ml-nav-link-drop">{content.nav.industries} <span className="ml-nav-chevron">▾</span></a>
            <a href="#pricing">{content.nav.pricing}</a>
            <a href="#">{content.nav.releaseDiary}</a>
            <a href="#">{content.nav.about}</a>
          </div>
          <div className="ml-nav-actions">
            <div className="ml-lang-switch" role="group" aria-label="Language">
              <button
                type="button"
                className={`ml-lang-btn${locale === 'en' ? ' ml-lang-btn--active' : ''}`}
                onClick={() => switchLocale('en')}
                aria-pressed={locale === 'en'}
              >
                EN
              </button>
              <button
                type="button"
                className={`ml-lang-btn${locale === 'vi' ? ' ml-lang-btn--active' : ''}`}
                onClick={() => switchLocale('vi')}
                aria-pressed={locale === 'vi'}
              >
                VI
              </button>
            </div>
            <button className="ml-btn-accent">{content.nav.cta}</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="ml-hero">
        <div className="ml-hero-inner">
          <div className="ml-hero-left">
            <h1 className="ml-hero-h1">
              {content.hero.h1Line1}
              <br />
              <span className="ml-accent">{content.hero.h1Line2}</span>
            </h1>
            <p className="ml-hero-sub">{content.hero.sub}</p>
            <div className="ml-hero-actions">
              <button className="ml-btn-accent ml-btn-lg">
                {content.hero.ctaStart} <ArrowRight size={15} />
              </button>
              <button className="ml-btn-ghost ml-btn-lg">{content.hero.ctaDemo}</button>
            </div>
            <p className="ml-hero-caveat">{content.hero.caveat}</p>
          </div>

          <div className="ml-hero-right">
            <HeroIllustration />
          </div>
        </div>
        <div className="ml-hero-glow" aria-hidden />
        <div className="ml-hero-glow ml-hero-glow--2" aria-hidden />
        <div className="ml-hero-glow ml-hero-glow--3" aria-hidden />
      </section>

      {/* ── BRANDS MARQUEE ───────────────────────────────────────── */}
      <section
        className={revealClass('brands', 'ml-brands')}
        ref={(el) => { revealRefs.current['brands'] = el }}
        data-reveal-id="brands"
      >
        <p className="ml-brands-count">{content.brands.caption}</p>
        <div className="ml-brands-track-wrap">
          <div className="ml-brands-track">
            {BRAND_NAMES.map((name, i) => (
              <span key={`${name}-${i}`} className="ml-brand-item">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ─────────────────────────────────────────── */}
      <section
        className={revealClass('cases', 'ml-cases')}
        ref={(el) => { revealRefs.current['cases'] = el }}
        data-reveal-id="cases"
      >
        <div className="ml-cases-inner">
          <div className="ml-trust-wrap">
            <div className="ml-trust-card">
              {content.cases.trustStats.map((s) => (
                <div key={s.label} className={`ml-stat${s.highlight ? ' ml-stat--price' : ''}`}>
                  <span className="ml-stat-num">{s.num}</span>
                  <span className="ml-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ml-cases-header">
            <h2 className="ml-cases-h2">{content.cases.h2}</h2>
            <div className="ml-cases-nav">
              <button className="ml-cases-arrow" onClick={() => scrollCases('prev')} aria-label={content.cases.prevLabel}>‹</button>
              <button className="ml-cases-arrow" onClick={() => scrollCases('next')} aria-label={content.cases.nextLabel}>›</button>
            </div>
          </div>

          <div className="ml-cases-cards" ref={casesRef}>
            {content.cases.items.map((c) => (
              <div key={c.brand} className="ml-case-card">
                <div className="ml-case-image">
                  <IllustrationFrame label={c.imageLabel} ratio="4/3" />
                  <span className="ml-case-chip">{c.category}</span>
                </div>
                <p className="ml-case-statement">{c.statement}</p>
                <blockquote className="ml-case-quote">
                  <p className="ml-case-quote-text">"{c.quote}"</p>
                  <footer className="ml-case-quote-author">— {c.author}</footer>
                </blockquote>
                <div className="ml-case-footer">
                  <span className="ml-case-brand">{c.brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOOK ─────────────────────────────────────────────────── */}
      {/* Cards fly in and the heading dims/brightens tied directly to
          scroll progress through this section (motion's useScroll) —
          not a fixed-duration animation. */}
      <section className="ml-hook" ref={hookSectionRef}>
        <div className="ml-hook-collage">
          {content.hook.cards.map((c, i) => (
            <HookCard
              key={c.label}
              progress={hookProgress}
              cfg={HOOK_CARD_MOTION[i]}
              index={i}
              label={c.label}
              note={c.note}
              ratio={c.ratio}
              reduced={prefersReducedMotion}
            />
          ))}
          <div className="ml-hook-text">
            <h2 className="ml-hook-h2">
              {content.hook.words1.map((w, i) => (
                <HookWord key={`w1-${w}`} progress={hookProgress} range={HOOK_WORD_RANGES[i]} reduced={prefersReducedMotion}>{w}</HookWord>
              ))}
              <br />
              {content.hook.words2.map((w, i) => (
                <HookWord key={`w2-${w}`} progress={hookProgress} range={HOOK_WORD_RANGES[i + 3]} reduced={prefersReducedMotion}>{w}</HookWord>
              ))}
            </h2>
            <motion.p className="ml-hook-sub" style={{ opacity: prefersReducedMotion ? 1 : hookSubOpacity }}>
              {content.hook.sub}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────────────────────────── */}
      <section
        className={revealClass('pillars', 'ml-pillars')}
        id="product"
        ref={(el) => { revealRefs.current['pillars'] = el }}
        data-reveal-id="pillars"
      >
        <div className="ml-pillars-inner">
          <div className="ml-section-head">
            <h2 className="ml-section-h2">{content.pillars.h2}</h2>
            <p className="ml-section-sub">{content.pillars.sub}</p>
          </div>
          <div className="ml-pillars-grid">
            {content.pillars.items.map((p, i) => (
              <motion.div
                key={p.tag}
                className={`ml-pillar ml-pillar--${p.status}`}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 0.84, 0.44, 1] }}
              >
                <span className="ml-pillar-numeral" aria-hidden>{p.numeral}</span>
                <div className="ml-pillar-illus">
                  <IllustrationFrame label={p.illustLabel} note={p.illustNote} ratio={p.illustRatio} />
                </div>
                <div className="ml-pillar-copy">
                  <span className={`ml-pillar-badge ml-pillar-badge--${p.status}`}>
                    <span className="ml-pillar-badge-dot" aria-hidden />
                    {p.status === 'live' ? content.pillars.badgeLive : content.pillars.badgeSoon}
                  </span>
                  <span className="ml-pillar-tag">{p.tag}</span>
                  <h3 className="ml-pillar-h">{p.headline}</h3>
                  <p className="ml-pillar-body">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="ml-soon-connect">
            <span className="ml-soon-connect-label">{content.soon.connectLabel}</span>
            <div className="ml-soon-connect-icons">
              <span className="ml-soon-connect-icon ml-soon-connect-icon--facebook" title="Facebook">
                <FacebookLogo size={26} weight="fill" />
              </span>
              <span className="ml-soon-connect-icon ml-soon-connect-icon--zalo" title="Zalo">Z</span>
              <span className="ml-soon-connect-icon ml-soon-connect-icon--tiktok" title="TikTok">
                <TiktokLogo size={26} weight="fill" />
              </span>
              <span className="ml-soon-connect-icon ml-soon-connect-icon--instagram" title="Instagram">
                <InstagramLogo size={26} weight="fill" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMING SOON ──────────────────────────────────────────── */}
      <section
        className={revealClass('soon', 'ml-soon')}
        ref={(el) => { revealRefs.current['soon'] = el }}
        data-reveal-id="soon"
      >
        <div className="ml-soon-inner">
          <div className="ml-section-head">
            <h2 className="ml-section-h2">{content.soon.h2}</h2>
          </div>
          <div className="ml-soon-grid">
            {content.soon.cards.map((c) => (
              <div key={c.tag} className="ml-soon-card">
                <IllustrationFrame label={c.illustLabel} note={c.illustNote} ratio="16/9" />
                <div className="ml-soon-card-top">
                  <span className="ml-soon-tag">{c.tag}</span>
                  <h3 className="ml-soon-h">{c.headline}</h3>
                  <p className="ml-soon-body">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES COLLAGE ───────────────────────────────────── */}
      <section
        className={revealClass('industries', 'ml-industries')}
        id="industries"
        ref={(el) => { revealRefs.current['industries'] = el }}
        data-reveal-id="industries"
      >
        <div className="ml-industries-inner ml-industries-split">
          <div className="ml-industries-sticky">
            <div className="ml-section-head ml-section-head--left">
              <h2 className="ml-section-h2">{content.industries.h2}</h2>
              <p className="ml-section-sub">{content.industries.sub}</p>
            </div>

            <div className="ml-collage-tabs ml-collage-tabs--vertical">
              {content.industries.items.map((ind) => (
                <button
                  key={ind.id}
                  className={`ml-showcase-tab${activeInd === ind.id ? ' ml-showcase-tab--active' : ''}`}
                  onClick={() => {
                    setActiveInd(ind.id)
                    industryRefs.current[ind.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                >
                  {ind.tab}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-industries-scroll">
            <div className="ml-industries-triggers">
              {content.industries.items.map((ind) => (
                <div
                  key={ind.id}
                  ref={(el) => { industryRefs.current[ind.id] = el }}
                  data-industry={ind.id}
                  className="ml-industries-trigger"
                />
              ))}
            </div>
            <div className="ml-industries-display">
              <div className="ml-collage">
                {activeIndustry.collage.map((item, i) => (
                  <div key={i} className={`ml-collage-item ml-collage-item--${i + 1}`}>
                    <IllustrationFrame label={item.label} note={item.note} ratio={item.ratio} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UGC VIDEO DEMOS ──────────────────────────────────────── */}
      <section
        className={revealClass('ugc', 'ml-ugc')}
        ref={(el) => { revealRefs.current['ugc'] = el }}
        data-reveal-id="ugc"
      >
        <div className="ml-ugc-inner">
          <div className="ml-section-head">
            <h2 className="ml-section-h2">{content.ugc.h2}</h2>
            <p className="ml-section-sub">{content.ugc.sub}</p>
          </div>
        </div>
        <div className="ml-ugc-scroller">
          {content.ugc.demos.map((label) => (
            <div key={label} className="ml-ugc-card">
              <span className="ml-ugc-badge">{content.ugc.badge}</span>
              <IllustrationFrame label={label} ratio="9/16" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE DEEP-DIVES ───────────────────────────────────── */}
      <section
        className={revealClass('deepdives', 'ml-deepdives')}
        ref={(el) => { revealRefs.current['deepdives'] = el }}
        data-reveal-id="deepdives"
      >
        <div className="ml-deepdives-inner">
          <div className="ml-section-head">
            <h2 className="ml-section-h2">{content.deepdives.h2}</h2>
            <p className="ml-section-sub">{content.deepdives.sub}</p>
          </div>
          {content.deepdives.items.map((f, i) => (
            <div
              key={f.headline}
              className={`ml-deepdive-row${f.reverse ? ' ml-deepdive-row--rev' : ''}`}
              style={{ '--stack-i': i } as CSSProperties}
            >
              <div className="ml-deepdive-visual">
                <IllustrationFrame label={f.illustLabel} note={f.illustNote} ratio={f.illustRatio} />
              </div>
              <div className="ml-deepdive-copy">
                <span className="ml-deepdive-product">{f.product}</span>
                <h3 className="ml-deepdive-h">{f.headline}</h3>
                <p className="ml-deepdive-body">{f.body}</p>
                {f.hint && <p className="ml-deepdive-hint">{f.hint}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY LAYERPROOF ───────────────────────────────────────── */}
      <section
        className={revealClass('compare', 'ml-compare')}
        ref={(el) => { revealRefs.current['compare'] = el }}
        data-reveal-id="compare"
      >
        <div className="ml-compare-inner">
          <div className="ml-why-head">
            <h2 className="ml-why-h2">{content.why.h2Line1}<br />{content.why.h2Line2}</h2>
          </div>
          <div className="ml-why-list">
            {content.why.items.map((c, i) => (
              <motion.div
                key={c.num}
                className="ml-why-row"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 32 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 0.84, 0.44, 1] }}
              >
                <span className="ml-why-num">{c.num}</span>
                <div className="ml-why-row-text">
                  <h3 className="ml-why-card-h">{c.headline}</h3>
                  <p className="ml-why-card-body">{c.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section
        className={revealClass('pricing', 'ml-pricing')}
        id="pricing"
        ref={(el) => { revealRefs.current['pricing'] = el }}
        data-reveal-id="pricing"
      >
        <div className="ml-pricing-inner">
          <div className="ml-section-head">
            <h2 className="ml-section-h2">{content.pricing.h2}</h2>
            <p className="ml-section-sub">{content.pricing.sub}</p>
          </div>
          <div className="ml-pricing-grid">
            {content.pricing.tiers.map((tier) => (
              <div
                key={tier.name}
                className={`ml-price-card${tier.popular ? ' ml-price-card--featured' : ''}`}
              >
                {tier.popular && <span className="ml-price-popular">{content.pricing.popularBadge}</span>}
                <div className="ml-price-head">
                  <h3 className="ml-price-name">{tier.name}</h3>
                  <p className="ml-price-desc">{tier.desc}</p>
                </div>
                <div className="ml-price-amount">
                  <span className="ml-price-num">{tier.price}</span>
                  <span className="ml-price-unit">{tier.priceUnit}</span>
                  {tier.save && <span className="ml-price-save">{tier.save}</span>}
                </div>
                <p className="ml-price-billing">{tier.billing}</p>
                <div className="ml-price-note">
                  {tier.noteBold && <strong>{tier.noteBold}</strong>}
                  <span>{tier.noteText}</span>
                </div>
                <button
                  className={`ml-price-cta ${tier.ctaVariant === 'accent' ? 'ml-btn-accent' : 'ml-btn-ghost'}`}
                >
                  {tier.cta}
                </button>
                <div className="ml-price-divider" aria-hidden />
                <span className="ml-price-features-label">{tier.featuresLabel}</span>
                <ul className="ml-price-features">
                  {tier.features.map((f) => (
                    <li key={f}>
                      <Check size={13} weight="bold" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <section
        className={revealClass('team', 'ml-team')}
        ref={(el) => { revealRefs.current['team'] = el }}
        data-reveal-id="team"
      >
        <div className="ml-team-inner">
          <div className="ml-section-head">
            <h2 className="ml-section-h2">{content.team.h2}</h2>
            <p className="ml-section-sub">{content.team.sub}</p>
            <button className="ml-btn-ghost">{content.team.ctaLabel}</button>
          </div>
          <div className="ml-team-grid">
            {content.team.members.map((m) => (
              <div key={m.name} className="ml-team-member">
                <TeamAvatar name={m.name} />
                <div className="ml-team-member-info">
                  <span className="ml-team-member-name">{m.name}</span>
                  <div className="ml-team-member-role-row">
                    <span className="ml-team-member-role">{m.role}</span>
                    {m.linkedinUrl && (
                      <a href={m.linkedinUrl} className="ml-team-member-linkedin" target="_blank" rel="noreferrer">
                        LinkedIn ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section
        className={revealClass('cta', 'ml-cta')}
        ref={(el) => { revealRefs.current['cta'] = el }}
        data-reveal-id="cta"
      >
        <div className="ml-cta-inner">
          <h2 className="ml-cta-h2">{content.finalCta.h2}</h2>
          <p className="ml-cta-sub">{content.finalCta.sub}</p>
          <div className="ml-cta-form">
            <button className="ml-btn-accent ml-btn-lg">
              {content.finalCta.ctaStart} <ArrowRight size={14} />
            </button>
          </div>
          <p className="ml-cta-microcopy">{content.finalCta.microcopy}</p>
        </div>
        <div className="ml-cta-glow" aria-hidden />
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className={revealClass('footer', 'ml-footer')}
        ref={(el) => { revealRefs.current['footer'] = el }}
        data-reveal-id="footer"
      >
        <div className="ml-footer-top">
          {/* Brand col */}
          <div className="ml-footer-brand">
            <div className="ml-footer-logo">
              <img src={`${base}logos/symbol.png`} alt="" className="ml-footer-symbol" />
              <span className="ml-footer-wordmark">LayerProof</span>
            </div>
            <p className="ml-footer-tagline">{content.footer.tagline}</p>
            <div className="ml-footer-socials">
              <a href="#" aria-label="Facebook"><FacebookLogo size={18} /></a>
              <a href="#" aria-label="Instagram"><InstagramLogo size={18} /></a>
              <a href="#" aria-label="X"><TwitterLogo size={18} /></a>
              <a href="#" aria-label="LinkedIn"><LinkedinLogo size={18} /></a>
            </div>
          </div>

          {/* Company links */}
          <div className="ml-footer-col">
            <h4 className="ml-footer-col-h">{content.footer.companyHeading}</h4>
            <ul>
              {content.footer.companyLinks.map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="ml-footer-col">
            <h4 className="ml-footer-col-h">{content.footer.legalHeading}</h4>
            <ul>
              {content.footer.legalLinks.map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* QR card */}
          <div className="ml-footer-qr-card">
            <a href="#" className="ml-footer-x-follow">
              <TwitterLogo size={15} weight="bold" />
              {content.footer.followX}
            </a>
            <div className="ml-footer-qr-box">
              <div className="ml-footer-qr-img" aria-label="QR code placeholder" />
              <span className="ml-footer-qr-label">{content.footer.qrLabel}</span>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="ml-footer-big-wrap" aria-hidden>
          <span className="ml-footer-big">LAYERPROOF.APP</span>
        </div>

        <div className="ml-footer-bottom">
          <p>{content.footer.copyright}</p>
          <a href="#/" className="ml-footer-devlink">{content.footer.devLink}</a>
        </div>
      </footer>
    </div>
  )
}
