import * as I from '@/shared/icons'
import {
  DeviceMobile,
  MonitorPlay,
  FileText,
  Stack,
  Palette,
  ChartBar,
  Globe,
  Lightning,
  Star,
  ClockCounterClockwise,
  Users,
  FilmStrip,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { RECENT_PROJECTS } from '@/data/recent-projects'
import type { RecentProject } from '@/data/recent-projects'

const base = import.meta.env.BASE_URL

const FEATURE_CARDS = [
  {
    product: 'Social Post',
    slug: 'social-post',
    title: 'Social Posts',
    desc: 'Create publish-ready posts and carousels',
    icon: 'Social',
    color: '#f97316',
    gradient: 'linear-gradient(to top left, rgba(236,72,153,0.6) 0%, transparent 65%)',
    img: `${base}home/card-social-post.png`,
    thumbPos: 'center top',
  },
  {
    product: 'Presentation',
    slug: 'presentation',
    title: 'Presentations',
    desc: 'Turn your ideas into ready-to-present decks',
    icon: 'Present',
    color: '#14b8a6',
    gradient: 'linear-gradient(to top left, rgba(234,179,8,0.55) 0%, transparent 65%)',
    img: `${base}home/card-presentation.png`,
    thumbPos: 'center top',
  },
  {
    product: 'Space',
    slug: 'space',
    title: 'Image Canvas',
    desc: 'A drag-and-drop canvas for your creative process',
    icon: 'Layers',
    color: '#22c55e',
    gradient: 'linear-gradient(to top left, rgba(236,72,153,0.6) 0%, transparent 65%)',
    img: `${base}home/card-space.png`,
    thumbPos: 'center top',
  },
]

const MOTION_CARD = {
  title: 'Create Motion Videos',
  desc: 'Animate your content into scroll-stopping videos with AI-driven scenes, narration, and timeline editing.',
  color: '#f5c518',
}

const COMMUNITY = [
  {
    id: 'c1',
    title: 'Mastering Modern Kotlin: From Basics to Coroutines',
    type: 'Presentation',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    date: 'May 7, 2026',
    likes: 4,
  },
  {
    id: 'c2',
    title: 'Decoding the Feline Friend',
    type: 'Presentation',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    date: 'May 7, 2026',
    likes: 1,
  },
  {
    id: 'c3',
    title: 'Differentiating Apex Predators: T-Rex, Spinosaurus, Giga…',
    type: 'Presentation',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    date: 'May 7, 2026',
    likes: 1,
  },
  {
    id: 'c4',
    title: 'The Enduring Mystery of The Buzzer',
    type: 'Presentation',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    date: 'May 7, 2026',
    likes: 1,
  },
  {
    id: 'c5',
    title: 'Mastering Design Thinking Methodology',
    type: 'Presentation',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    date: 'May 7, 2026',
    likes: 1,
  },
  {
    id: 'c6',
    title: 'Choosing React State Management Solutions',
    type: 'Presentation',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    date: 'May 20, 2026',
    likes: 0,
  },
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
          <span
            className="hp-recent-badge"
            style={{ background: `${project.typeColor}22`, color: project.typeColor }}
          >
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
                  <button
                    key={card.product}
                    className="hp-feature-card"
                    style={{ backgroundImage: card.gradient }}
                    onClick={() => navigate(`/create/${card.slug}`)}
                  >
                    <div className="hp-feature-body">
                      <p className="hp-feature-title">{card.title}</p>
                      <p className="hp-feature-desc">{card.desc}</p>
                    </div>
                    <div className="hp-feature-thumb">
                      {card.img ? (
                        <img
                          src={card.img}
                          alt={card.product}
                          className="hp-feature-img"
                          style={{ objectPosition: card.thumbPos }}
                        />
                      ) : (
                        <div className="hp-feature-placeholder" style={{ color: card.color }}>
                          {Icon && <Icon style={{ width: 40, height: 40, opacity: 0.25 }} />}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="hp-sub-section">
              <h2 className="hp-section-title" style={{ marginBottom: 16 }}>
                <Star
                  weight="fill"
                  style={{ width: 14, height: 14, marginRight: 7, opacity: 0.7 }}
                />
                Featured
              </h2>
              <div className="hp-sub-products">
                {(
                  [
                    {
                      Icon: DeviceMobile,
                      label: 'Social Post',
                      slug: 'social-post',
                      desc: 'Create publish-ready posts and carousels',
                      chevron: false,
                    },
                    {
                      Icon: MonitorPlay,
                      label: 'Presentation',
                      slug: 'presentation',
                      desc: 'Turn your ideas into ready-to-present decks',
                      chevron: false,
                    },
                    {
                      Icon: FileText,
                      label: 'Docs',
                      slug: 'docs',
                      desc: 'Write insightful long-form content',
                      chevron: false,
                    },
                    {
                      Icon: Stack,
                      label: 'Space',
                      slug: 'space',
                      desc: 'Mix images, text, and more on a drag-and-drop canvas',
                      chevron: false,
                    },
                    {
                      Icon: ChartBar,
                      label: 'Report',
                      slug: 'Report',
                      desc: 'Turn data into interactive HTML reports',
                      chevron: false,
                    },
                    {
                      Icon: Globe,
                      label: 'Motion',
                      slug: 'motion',
                      desc: 'Animate your ideas into motion videos',
                      chevron: false,
                    },
                    {
                      Icon: DeviceMobile,
                      label: 'Social Post 3.0',
                      slug: 'social-post-3',
                      desc: 'Create publish-ready posts, now smarter',
                      chevron: false,
                      beta: true,
                    },
                    {
                      Icon: Lightning,
                      label: 'AI Tools',
                      slug: null,
                      desc: 'Make quick image edits with AI',
                      chevron: true,
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.label}
                    className="hp-sub-pill"
                    onClick={() => item.slug && navigate(`/create/${item.slug}`)}
                  >
                    <span className="hp-sub-pill-icon">
                      <item.Icon size={20} />
                    </span>
                    <span className="hp-sub-pill-text">
                      <span className="hp-sub-pill-label">{item.label}</span>
                      <span className="hp-sub-pill-desc">{item.desc}</span>
                    </span>
                    {'beta' in item && item.beta && (
                      <span className="hp-sub-pill-beta">BETA</span>
                    )}
                    {item.chevron && (
                      <I.ArrowRight
                        className="hp-sub-pill-chevron"
                        style={{ width: 16, height: 16 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="hp-vellum-wrap">
              <div className="hp-vellum-left">
                <div className="hp-vellum-deco" aria-hidden="true">
                  <span className="hp-vellum-orb hp-vellum-orb-1" />
                  <span className="hp-vellum-orb hp-vellum-orb-2" />
                </div>
                <span className="hp-vellum-title">
                  Create with
                  <br />
                  LayerProof <span className="hp-vellum-accent">Motion</span>
                </span>
                <span className="hp-vellum-desc">
                  Animate your content into scroll-stopping videos with AI-driven scenes, narration,
                  and timeline editing.
                </span>
              </div>
              <div className="hp-vellum-actions">
                <button className="hp-vellum-btn hp-vellum-btn--primary">Try it</button>
                <button className="hp-vellum-btn hp-vellum-btn--secondary">
                  Read release note
                </button>
              </div>
              <div className="hp-vellum-right">
                <img
                  src={`${base}home/vellum-banner.png`}
                  alt=""
                  className="hp-vellum-banner-img"
                />
                <div className="hp-vellum-overlay" />
              </div>
            </div>

            {/* Recent — 1 row only */}
            <div className="hp-section-head">
              <h2 className="hp-section-title">
                <ClockCounterClockwise
                  weight="fill"
                  style={{ width: 14, height: 14, marginRight: 7, opacity: 0.7 }}
                />
                Pick up where you left off
              </h2>
              <button className="hp-view-all">
                View All <I.ArrowRight />
              </button>
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
                  <p className="hp-community-sub">
                    See what others are creating with this workspace.
                  </p>
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
                  <button className="hp-view-all">
                    View All <I.ArrowRight />
                  </button>
                </div>
              </div>
              <div className="hp-community-grid">
                {COMMUNITY.slice(0, 4).map((c) => {
                  const Icon = I.Icons[c.thumbIcon]
                  return (
                    <div key={c.id} className="hp-community-card">
                      <div className="hp-community-thumb" style={{ background: c.thumbBg }}>
                        {Icon && (
                          <Icon
                            style={{ color: c.thumbIconColor, width: 28, height: 28, opacity: 0.5 }}
                          />
                        )}
                      </div>
                      <div className="hp-community-body">
                        <span className="hp-recent-workspace">Personal Project</span>
                        <p className="hp-community-card-title">{c.title}</p>
                        <div className="hp-community-foot">
                          <span
                            className="hp-recent-badge"
                            style={{ background: '#8b5cf622', color: '#8b5cf6' }}
                          >
                            {c.type}
                          </span>
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
