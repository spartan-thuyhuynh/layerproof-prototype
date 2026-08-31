import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import * as I from '@/shared/icons'
import { useTheme } from '@/shared/context/ThemeContext'

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

interface SidebarProps {
  showBack?: boolean
}

const CREATE_PRODUCTS = [
  {
    icon: 'Social', label: 'Social Post', color: '#f97316', slug: 'social-post',
    desc: 'Create eye-catching content for every social platform.',
    features: ['X, LinkedIn, Instagram & more', 'Brand-consistent templates', 'AI caption & hashtag writer'],
    sampleBg: 'linear-gradient(135deg, #431407 0%, #7c2d12 100%)',
  },
  {
    icon: 'Docs', label: 'Docs', color: '#14b8a6', slug: 'docs',
    desc: 'Write polished documents and reports with AI assistance.',
    features: ['Smart writing assistant', 'Real-time collaboration', 'Export to PDF or DOCX'],
    sampleBg: 'linear-gradient(135deg, #042f2e 0%, #134e4a 100%)',
  },
  {
    icon: 'Layers', label: 'Space', color: '#22c55e', slug: 'space',
    desc: "Organize and share your team's creative assets in one place.",
    features: ['Brand asset library', 'Team permissions', 'Version history'],
    sampleBg: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
  },
  {
    icon: 'Present', label: 'Presentation', color: '#8b5cf6', slug: 'presentation',
    desc: 'Build stunning slide decks that captivate any audience.',
    features: ['100+ slide templates', 'Animate & present live', 'AI content suggestions'],
    sampleBg: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)',
  },
  {
    icon: 'Sparkle', label: 'Design', color: '#3b82f6', slug: 'design',
    desc: 'Create graphics, visuals, and brand assets at scale.',
    features: ['Drag-and-drop canvas', 'Brand kit integration', 'Export any format'],
    sampleBg: 'linear-gradient(135deg, #172554 0%, #1e3a8a 100%)',
  },
  {
    icon: 'Globe', label: 'App', color: '#ec4899', slug: 'app',
    desc: 'Build interactive web experiences and landing pages.',
    features: ['No-code builder', 'Responsive layouts', 'Publish instantly'],
    sampleBg: 'linear-gradient(135deg, #500724 0%, #831843 100%)',
  },
]

type Product = typeof CREATE_PRODUCTS[number]

export function Sidebar({ showBack }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const onHome = pathname === '/home'
  const [createOpen, setCreateOpen] = useState(false)
  const createRef = useRef<HTMLDivElement>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateOpen(false)
        setHoveredProduct(null)
      }
    }
    if (createOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [createOpen])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [userMenuOpen])

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`side${mobileOpen ? ' open' : ''}`}>
        <button className="side-back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={14} />
          All Prototypes
        </button>

      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}logos/symbol.png`} alt="" className="brand-symbol" />
        <span className="brand-wordmark">LayerProof</span>
        <button className="side-icon-btn" style={{ marginLeft: 'auto' }}>
          <I.Grid style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <div className="create-wrap" ref={createRef}>
        <button className="create" onClick={() => { setCreateOpen(o => !o); setHoveredProduct(null) }}>
          Create new project
          <I.Chevron style={{ width: 15, height: 15, marginLeft: 'auto', transform: createOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {createOpen && (
          <div className="create-dropdown">
            <p className="create-dropdown-label">Choose a product</p>
            {CREATE_PRODUCTS.map((p) => {
              const Icon = I.Icons[p.icon]
              return (
                <button
                  key={p.label}
                  className={`create-dropdown-item${hoveredProduct?.label === p.label ? ' hovered' : ''}`}
                  onMouseEnter={() => setHoveredProduct(p)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => { setCreateOpen(false); setHoveredProduct(null); navigate(`/create/${p.slug}`) }}
                >
                  <span className="create-dropdown-icon" style={{ background: `${p.color}22`, color: p.color }}>
                    {Icon && <Icon style={{ width: 14, height: 14 }} />}
                  </span>
                  {p.label}
                </button>
              )
            })}
          </div>
        )}

        {createOpen && hoveredProduct && (
          <div className="create-preview" onMouseEnter={() => setHoveredProduct(hoveredProduct)} onMouseLeave={() => setHoveredProduct(null)}>
            <div className="create-preview-thumb" style={{ background: hoveredProduct.sampleBg }}>
              {(() => { const Icon = I.Icons[hoveredProduct.icon]; return Icon ? <Icon style={{ width: 36, height: 36, color: hoveredProduct.color }} /> : null })()}
              <div className="create-preview-mock">
                <div className="create-preview-line" style={{ width: '72%' }} />
                <div className="create-preview-line" style={{ width: '55%' }} />
                <div className="create-preview-line" style={{ width: '88%' }} />
                <div className="create-preview-line" style={{ width: '40%' }} />
              </div>
            </div>
            <div className="create-preview-body">
              <span className="create-preview-title" style={{ color: hoveredProduct.color }}>{hoveredProduct.label}</span>
              <p className="create-preview-desc">{hoveredProduct.desc}</p>
              <ul className="create-preview-features">
                {hoveredProduct.features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      <nav className="nav">
        <button className={`navitem${onHome ? ' active' : ''}`} onClick={() => navigate('/home')}>
          <I.Home /> Home
        </button>
        <button className={`navitem${pathname.startsWith('/all-projects') ? ' active' : ''}`} onClick={() => navigate('/all-projects')}>
          <I.Grid /> All Projects
        </button>
        <button className={`navitem${pathname.startsWith('/community') ? ' active' : ''}`} onClick={() => navigate('/community')}>
          <I.Globe /> Community
        </button>

        <div className="navlabel">Brand</div>
        <button className={`navitem${pathname.startsWith('/brand-kit') ? ' active' : ''}`} onClick={() => navigate('/brand-kit')}>
          <I.Layers /> Brand Studio <span className="new-badge">NEW</span>
        </button>
        <button className="navitem">
          <I.Palette /> Theme
        </button>

        <div className="navlabel">Tools</div>
        <button className="navitem">
          <I.Zap /> AI Tools
          <I.ArrowRight style={{ width: 15, height: 15, marginLeft: 'auto' }} />
        </button>
      </nav>

      <div className="user user--home" ref={userMenuRef} onClick={() => setUserMenuOpen(o => !o)}>
        {userMenuOpen && (
          <div className="user-menu" onClick={e => e.stopPropagation()}>
            <button className="user-menu-item" onClick={() => { toggleTheme(); setUserMenuOpen(false) }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
            <div className="user-menu-sep" />
            <button className="user-menu-item" onClick={() => { setUserMenuOpen(false); navigate('/') }}>
              <LogOutIcon />
              Log out
            </button>
          </div>
        )}
        <div className="av">TH</div>
        <div className="who">
          <b>Thuy Huynh</b>
          <span>thuy.huynh@c0x12c.com</span>
        </div>
        <button className="side-icon-btn" style={{ marginLeft: 'auto' }} onClick={e => e.stopPropagation()}>
          <I.Bell style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </aside>
    </>
  )
}
