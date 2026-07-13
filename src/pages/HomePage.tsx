import * as I from '@/shared/icons'
import { DeviceMobile, MonitorPlay, FileText, Stack, Palette, Globe, Lightning, Star, ClockCounterClockwise, Users, FilmStrip } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { RECENT_PROJECTS } from '@/data/recent-projects'
import type { RecentProject } from '@/data/recent-projects'

const base = import.meta.env.BASE_URL

const FEATURE_CARDS = [
  { product: 'Social Post', slug: 'social-post',   title: 'Generate Social Media Content',      desc: 'Create consistent, high-performing social content that keeps your brand active across channels.', icon: 'Social',  color: '#f97316', img: `${base}home/card-social-post.png`, thumbPos: 'center top' },
  { product: 'Docs',        slug: 'docs',           title: 'Generate Blogs & Articles',          desc: 'Write in-depth content faster with AI-powered drafting, editing, and content expansion.',   icon: 'Docs',    color: '#14b8a6', img: `${base}home/card-docs.png`,       thumbPos: 'center top' },
  { product: 'Space',       slug: 'space',          title: 'Combine Images & Ideas',             desc: 'Use multiple references and prompts to create exactly what you envision.', icon: 'Layers',  color: '#22c55e', img: `${base}home/card-space.png`,      thumbPos: 'center top' },
]

const MOTION_CARD = {
  title: 'Create Motion Videos',
  desc: 'Animate your content into scroll-stopping videos with AI-driven scenes, narration, and timeline editing.',
  color: '#f5c518',
}

const COMMUNITY = [
  { id: 'c1', title: 'Mastering Modern Kotlin: From Basics to Coroutines',         type: 'Presentation', thumbBg: 'var(--card-2)', thumbIcon: 'Present', thumbIconColor: 'var(--t3)', date: 'May 7, 2026',  likes: 4 },
  { id: 'c2', title: 'Decoding the Feline Friend',                                 type: 'Presentation', thumbBg: 'var(--card-2)', thumbIcon: 'Present', thumbIconColor: 'var(--t3)', date: 'May 7, 2026',  likes: 1 },
  { id: 'c3', title: 'Differentiating Apex Predators: T-Rex, Spinosaurus, Giga…', type: 'Presentation', thumbBg: 'var(--card-2)', thumbIcon: 'Present', thumbIconColor: 'var(--t3)', date: 'May 7, 2026',  likes: 1 },
  { id: 'c4', title: 'The Enduring Mystery of The Buzzer',                         type: 'Presentation', thumbBg: 'var(--card-2)', thumbIcon: 'Present', thumbIconColor: 'var(--t3)', date: 'May 7, 2026',  likes: 1 },
  { id: 'c5', title: 'Mastering Design Thinking Methodology',                      type: 'Presentation', thumbBg: 'var(--card-2)', thumbIcon: 'Present', thumbIconColor: 'var(--t3)', date: 'May 7, 2026',  likes: 1 },
  { id: 'c6', title: 'Choosing React State Management Solutions',                  type: 'Presentation', thumbBg: 'var(--card-2)', thumbIcon: 'Present', thumbIconColor: 'var(--t3)', date: 'May 20, 2026', likes: 0 },
]

function RecentCard({ project }: { project: RecentProject }) {
  const Icon = I.Icons[project.thumbIcon]
  return (
    <div className="hp-recent-card">
      <div className="hp-recent-thumb" style={{ background: project.thumbBg }}>
        {Icon && <Icon style={{ color: project.thumbIconColor }} />}
      </div>
      <div className="hp-recent-body">
        <span className="hp-recent-workspace">{project.workspace}</span>
        <p className="hp-recent-title">{project.title}</p>
        <div className="hp-recent-foot">
          <span className="hp-recent-badge" style={{ background: `${project.typeColor}22`, color: project.typeColor }}>
            {project.type}
          </span>
          <span className="hp-recent-date">{project.lastAction}</span>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <Sidebar showBack />
      <main className="main">
        <div className="panel">
          <div className="hp-inner">
            <div className="hp-welcome">
              <button className="hp-new-chip">
                <span className="hp-new-chip-badge">New</span>
                <span className="hp-new-chip-roll">
                  <span>Introducing Brand Kit</span>
                  <span>Introducing Brand Kit</span>
                </span>
                <I.ArrowRight style={{ width: 13, height: 13, opacity: 0.7 }} />
              </button>
              <p className="hp-welcome-sub">What do you want to create today?</p>
            </div>

            <div className="hp-feature-grid">
              {FEATURE_CARDS.map((card) => {
                const Icon = I.Icons[card.icon]
                return (
                  <button key={card.product} className="hp-feature-card" onClick={() => navigate(`/create/${card.slug}`)}>
                    <div className="hp-feature-thumb">
                      {card.img
                        ? <img src={card.img} alt={card.product} className="hp-feature-img" style={{ objectPosition: card.thumbPos }} />
                        : <div className="hp-feature-placeholder" style={{ color: card.color }}>{Icon && <Icon style={{ width: 40, height: 40, opacity: 0.25 }} />}</div>
                      }
                    </div>
                    <div className="hp-feature-body">
                      <span className="hp-feature-chip">{card.product}</span>
                      <p className="hp-feature-title">{card.title}</p>
                      <p className="hp-feature-desc">{card.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Motion Editor card */}
            <button
              className="hp-feature-card"
              style={{ width: '100%', marginTop: 4, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px' }}
              onClick={() => navigate('/motion-editor')}
            >
              <div style={{ width: 48, height: 48, borderRadius: 10, background: `${MOTION_CARD.color}18`, display: 'grid', placeItems: 'center', flex: 'none' }}>
                <FilmStrip size={24} style={{ color: MOTION_CARD.color }} />
              </div>
              <div>
                <span className="hp-feature-chip" style={{ background: `${MOTION_CARD.color}22`, color: MOTION_CARD.color, borderColor: `${MOTION_CARD.color}44` }}>Motion Video</span>
                <p className="hp-feature-title" style={{ marginTop: 4 }}>{MOTION_CARD.title}</p>
                <p className="hp-feature-desc">{MOTION_CARD.desc}</p>
              </div>
            </button>

            <div className="hp-sub-section">
              <h2 className="hp-section-title" style={{ marginBottom: 16 }}>
                <Star weight="fill" style={{ width: 14, height: 14, marginRight: 7, opacity: .7 }} />
                Featured
              </h2>
              <div className="hp-sub-products">
                {([
                  { Icon: DeviceMobile,  label: 'Social Post 3.0', slug: 'social-post-3', desc: 'Next-gen social content',          chevron: false, beta: true },
                  { Icon: MonitorPlay,   label: 'Presentation',    slug: 'presentation',  desc: 'Slides & decks for any audience',  chevron: false },
                  { Icon: FileText,      label: 'Docs',            slug: 'docs',          desc: 'Generate Blogs & Articles',        chevron: false },
                  { Icon: Stack,         label: 'Space',           slug: 'space',         desc: 'Combine Images & Ideas',           chevron: false },
                  { Icon: Palette,       label: 'Design',          slug: 'design',        desc: 'Graphics, visuals & brand assets', chevron: false },
                  { Icon: Globe,         label: 'Motion',          slug: 'motion',        desc: 'Animated visuals & video content', chevron: false },
                  { Icon: Lightning,     label: 'AI Tools',        slug: null,            desc: 'Generate content with AI',         chevron: true  },
                ] as const).map((item) => (
                  <button key={item.label} className="hp-sub-pill" onClick={() => item.slug && navigate(`/create/${item.slug}`)}>
                    <span className="hp-sub-pill-icon"><item.Icon size={20} /></span>
                    <span className="hp-sub-pill-text">
                      <span className="hp-sub-pill-label">
                        {item.label}
                        {'beta' in item && item.beta && <span className="hp-sub-pill-beta">BETA</span>}
                      </span>
                      <span className="hp-sub-pill-desc">{item.desc}</span>
                    </span>
                    {item.chevron && <I.ArrowRight className="hp-sub-pill-chevron" style={{ width: 16, height: 16 }} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="hp-vellum-wrap">
              <img src={`${base}home/vellum-banner.png`} alt="" className="hp-vellum-banner-img" />
              <div className="hp-vellum-overlay" />
              <div className="hp-vellum-deco" aria-hidden="true">
                <span className="hp-vellum-orb hp-vellum-orb-1" />
                <span className="hp-vellum-orb hp-vellum-orb-2" />
              </div>
              <div className="hp-vellum-left">
                <span className="hp-vellum-chip">Space</span>
                <span className="hp-vellum-title">Create with<br />LayerProof <span className="hp-vellum-accent">Vellum</span></span>
                <span className="hp-vellum-desc">AI-powered image generation for your brand</span>
              </div>
              <div className="hp-vellum-actions">
                <button className="hp-vellum-btn hp-vellum-btn--primary">Try it</button>
                <button className="hp-vellum-btn hp-vellum-btn--secondary">Read release note</button>
              </div>
            </div>

            {/* Recent — 1 row only */}
            <div className="hp-section-head">
              <h2 className="hp-section-title">
                <ClockCounterClockwise weight="fill" style={{ width: 14, height: 14, marginRight: 7, opacity: .7 }} />
                Pick up where you left off
              </h2>
              <button className="hp-view-all">View All <I.ArrowRight /></button>
            </div>
            <div className="hp-recent-grid">
              {RECENT_PROJECTS.slice(0, 4).map((p) => (
                <RecentCard key={p.id} project={p} />
              ))}
            </div>

            {/* Community */}
            <div className="hp-community">
              <div className="hp-community-head">
                <div>
                  <h2 className="hp-community-title">
                    <Users weight="fill" style={{ width: 16, height: 16 }} />
                    Presentations from the community
                  </h2>
                  <p className="hp-community-sub">See what others are creating with this workspace.</p>
                </div>
                <div className="hp-community-filters">
                  <select className="hp-filter-select">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                  <select className="hp-filter-select">
                    <option>Votes</option>
                    <option>Recent</option>
                    <option>Popular</option>
                  </select>
                  <button className="hp-view-all">View All <I.ArrowRight /></button>
                </div>
              </div>
              <div className="hp-community-grid">
                {COMMUNITY.slice(0, 4).map((c) => {
                  const Icon = I.Icons[c.thumbIcon]
                  return (
                    <div key={c.id} className="hp-community-card">
                      <div className="hp-community-thumb" style={{ background: c.thumbBg }}>
                        {Icon && <Icon style={{ color: c.thumbIconColor, width: 28, height: 28, opacity: .5 }} />}
                      </div>
                      <div className="hp-community-body">
                        <span className="hp-recent-workspace">Personal Project</span>
                        <p className="hp-community-card-title">{c.title}</p>
                        <div className="hp-community-foot">
                          <span className="hp-recent-badge" style={{ background: '#8b5cf622', color: '#8b5cf6' }}>{c.type}</span>
                          <span className="hp-community-likes">
                            <I.Star style={{ width: 11, height: 11 }} /> {c.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
