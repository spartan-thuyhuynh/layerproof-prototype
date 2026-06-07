import * as I from '@/icons'

const mainNav = [
  { icon: 'Home', label: 'Home' },
  { icon: 'Grid', label: 'All Workspaces' },
  { icon: 'Globe', label: 'Community' },
  { icon: 'Library', label: 'Your Library' },
]

const productsTop = [
  { icon: 'Present', label: 'Presentation' },
  { icon: 'Social', label: 'Social Post' },
]

const productsGrid = [
  { icon: 'Docs', label: 'Docs' },
  { icon: 'Layers', label: 'Space' },
  { icon: 'Folder', label: 'App' },
  { icon: 'Sparkle', label: 'Design' },
]

const tools = [
  { icon: 'Zap', label: 'AI Tools', soon: true },
  { icon: 'Calendar', label: 'Schedule' },
]

export function Sidebar() {
  return (
    <aside className="side">
      <div className="brand">
        <img src="/lplogo.png" alt="LayerProof" className="brand-logo-img" />
        <button className="side-icon-btn" style={{ marginLeft: 'auto' }}><I.Grid style={{ width: 16, height: 16 }} /></button>
      </div>

      <button className="create">
        Create new design
        <I.Chevron style={{ width: 15, height: 15, marginLeft: 'auto' }} />
      </button>

      <nav className="nav">
        {mainNav.map((n) => {
          const Icon = I.Icons[n.icon]
          return (
            <button key={n.label} className="navitem">
              {Icon && <Icon />} {n.label}
            </button>
          )
        })}

        <div className="navlabel">Products</div>
        <div className="nav-products">
          {productsTop.map((n) => {
            const Icon = I.Icons[n.icon]
            return (
              <button key={n.label} className="navitem nav-prod-item">
                {Icon && <Icon />} {n.label}
              </button>
            )
          })}
          <div className="nav-prod-grid">
            {productsGrid.map((n) => {
              const Icon = I.Icons[n.icon]
              return (
                <button key={n.label} className="navitem nav-prod-item nav-prod-half">
                  {Icon && <Icon />} {n.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="navlabel">Brand</div>
        <button className="navitem active">
          <I.Layers /> Brand Kit <span className="new-badge">NEW</span>
        </button>
        <button className="navitem">
          <I.Palette /> Theme
        </button>
        <button className="navitem">
          <I.Mic /> Tones
        </button>

        <div className="navlabel">Tools</div>
        {tools.map((n) => {
          const Icon = I.Icons[n.icon]
          return (
            <button key={n.label} className="navitem">
              {Icon && <Icon />} {n.label}
              {n.soon && <I.ArrowRight style={{ width: 15, height: 15, marginLeft: 'auto' }} />}
            </button>
          )
        })}
      </nav>

      <div className="user">
        <div className="av">TH</div>
        <div className="who">
          <b>Thuy Huynh</b>
          <span>Founder</span>
        </div>
        <div className="user-foot">
          <div className="plan-mini">
            <span className="plan-label">FREE</span>
            <div className="plan-bar-wrap">
              <div className="plan-bar-track"><div className="plan-bar-fill" style={{ width: '60%' }} /></div>
              <span className="plan-pct">60% credits used</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
