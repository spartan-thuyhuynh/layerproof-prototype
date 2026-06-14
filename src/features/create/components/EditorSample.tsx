import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'

interface Props {
  config: ProductConfig
}

export function EditorSample({ config }: Props) {
  const navigate = useNavigate()
  const Icon = I.Icons[config.icon]

  return (
    <div className="es-layout">
      {/* Top bar */}
      <header className="es-topbar">
        <div className="es-topbar-left">
          <button className="es-back" onClick={() => navigate('/home')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="es-product-chip" style={{ color: config.color, background: `${config.color}18`, borderColor: `${config.color}35` }}>
            {Icon && <Icon style={{ width: 13, height: 13 }} />}
            {config.label}
          </div>
          <span className="es-title">Untitled {config.label}</span>
        </div>
        <div className="es-topbar-right">
          <button className="es-action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
            Share
          </button>
          <button className="es-publish-btn" style={{ background: config.color }}>Publish</button>
        </div>
      </header>

      {/* Editor body */}
      <div className="es-body">
        {config.editorType === 'canvas' && <CanvasEditor config={config} />}
        {config.editorType === 'document' && <DocumentEditor config={config} />}
        {config.editorType === 'builder' && <AppBuilder config={config} />}
      </div>
    </div>
  )
}

function CanvasEditor({ config }: { config: ProductConfig }) {
  const tools = [
    { icon: 'cursor', label: 'Select' },
    { icon: 'T', label: 'Text' },
    { icon: '□', label: 'Shape' },
    { icon: '⬜', label: 'Image' },
    { icon: '✦', label: 'AI' },
  ]

  const propSections = [
    { title: 'Format', items: ['1080 × 1080 px', 'RGB Color', '72 DPI'] },
    { title: 'Fill', items: ['Background color', 'Gradient', 'Image fill'] },
    { title: 'Typography', items: ['Font family', 'Size / Weight', 'Line height'] },
    { title: 'Effects', items: ['Shadow', 'Blur', 'Opacity'] },
  ]

  return (
    <>
      {/* Left tools */}
      <div className="es-tools">
        {tools.map(t => (
          <button key={t.label} className={`es-tool-btn${t.icon === 'cursor' ? ' active' : ''}`} title={t.label}
            style={t.icon === 'cursor' ? { color: config.color } : undefined}>
            <span className="es-tool-glyph">{t.icon === 'cursor' ? '↖' : t.icon}</span>
          </button>
        ))}
        <div className="es-tools-sep" />
        <button className="es-tool-btn" title="Brand Kit">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </button>
        <button className="es-tool-btn" title="Components">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
      </div>

      {/* Center canvas */}
      <div className="es-canvas-area">
        <div className="es-canvas-toolbar">
          <button className="es-canvas-tb-btn">Page 1</button>
          <button className="es-canvas-tb-btn">+ Add page</button>
          <div style={{ flex: 1 }} />
          <button className="es-canvas-tb-btn">50%</button>
          <button className="es-canvas-tb-btn">Fit</button>
        </div>
        <div className="es-canvas-bg">
          <div className="es-canvas-frame">
            <CanvasContent config={config} />
          </div>
        </div>
      </div>

      {/* Right properties */}
      <div className="es-props">
        <div className="es-props-header">Properties</div>
        {propSections.map(s => (
          <div key={s.title} className="es-props-section">
            <div className="es-props-section-title">{s.title}</div>
            {s.items.map(item => (
              <div key={item} className="es-props-row">
                <span className="es-props-label">{item}</span>
                <div className="es-props-value-skel" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

function CanvasContent({ config }: { config: ProductConfig }) {
  if (config.slug === 'social-post') {
    return (
      <div className="es-canvas-social">
        <div className="es-canvas-social-img" style={{ background: `${config.color}15` }}>
          <div className="es-canvas-placeholder-icon" style={{ color: config.color }}>⬜</div>
        </div>
        <div className="es-canvas-social-body">
          <div className="es-canvas-line" style={{ width: '75%', height: 10 }} />
          <div className="es-canvas-line" style={{ width: '55%', height: 8 }} />
        </div>
        <div className="es-canvas-social-foot">
          <div className="es-canvas-skel-btn" style={{ background: config.color }}>Shop Now</div>
        </div>
      </div>
    )
  }
  if (config.slug === 'presentation') {
    return (
      <div className="es-canvas-slide">
        <div className="es-slide-title-block">
          <div className="es-canvas-line" style={{ width: '60%', height: 12, background: config.color, borderRadius: 3 }} />
          <div className="es-canvas-line" style={{ width: '80%', height: 7 }} />
        </div>
        <div className="es-slide-content-row">
          <div className="es-slide-box" />
          <div className="es-slide-box" />
          <div className="es-slide-box" />
        </div>
      </div>
    )
  }
  return (
    <div className="es-canvas-design">
      <div className="es-design-shape" style={{ background: `${config.color}25`, borderRadius: 12 }} />
      <div className="es-design-shape es-design-shape--sm" style={{ background: `${config.color}18`, borderRadius: 8, top: '20%', left: '60%' }} />
      <div className="es-canvas-line" style={{ width: '50%', height: 8, position: 'relative' }} />
    </div>
  )
}

function DocumentEditor({ config }: { config: ProductConfig }) {
  const isSpace = config.slug === 'space'
  const outlineItems = isSpace
    ? ['📁 Brand Assets', '📁 Campaigns', '📁 Templates', '📁 Archive']
    : ['Introduction', 'Overview', 'Key Findings', 'Recommendations', 'Appendix']

  return (
    <>
      {/* Left outline */}
      <div className="es-outline">
        <div className="es-outline-header">{isSpace ? 'Folders' : 'Outline'}</div>
        {outlineItems.map((item, i) => (
          <div key={item} className={`es-outline-item${i === 0 ? ' active' : ''}`}
            style={i === 0 ? { color: config.color } : undefined}>
            {item}
          </div>
        ))}
        <button className="es-outline-add">+ {isSpace ? 'New folder' : 'Add section'}</button>
      </div>

      {/* Document body */}
      <div className="es-doc-body">
        <div className="es-doc-inner">
          <div className="es-doc-title-skel" />
          {isSpace ? (
            <div className="es-space-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="es-space-card">
                  <div className="es-space-card-thumb" style={{ background: `${config.color}15` }}>
                    <span style={{ fontSize: 22, opacity: 0.4 }}>🖼</span>
                  </div>
                  <div className="es-canvas-line" style={{ width: '70%', height: 6, marginTop: 8 }} />
                  <div className="es-canvas-line" style={{ width: '45%', height: 5, marginTop: 5 }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="es-doc-section-title" />
              {[90, 75, 85, 65, 90, 70].map((w, i) => (
                <div key={i} className="es-canvas-line" style={{ width: `${w}%`, height: 7, margin: '6px 0' }} />
              ))}
              <div className="es-doc-section-title" style={{ marginTop: 24 }} />
              {[80, 65, 90].map((w, i) => (
                <div key={i} className="es-canvas-line" style={{ width: `${w}%`, height: 7, margin: '6px 0' }} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function AppBuilder({ config }: { config: ProductConfig }) {
  const components = ['Header', 'Hero section', 'Feature cards', 'Testimonials', 'CTA Banner', 'Footer']

  return (
    <>
      {/* Left component tree */}
      <div className="es-outline">
        <div className="es-outline-header">Components</div>
        {components.map((c, i) => (
          <div key={c} className={`es-outline-item${i === 0 ? ' active' : ''}`}
            style={i === 0 ? { color: config.color } : undefined}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ opacity: 0.5 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            {c}
          </div>
        ))}
        <button className="es-outline-add">+ Add component</button>
      </div>

      {/* Center canvas */}
      <div className="es-canvas-area">
        <div className="es-canvas-toolbar">
          <button className="es-canvas-tb-btn">Preview</button>
          <button className="es-canvas-tb-btn">Mobile</button>
          <div style={{ flex: 1 }} />
          <button className="es-canvas-tb-btn">75%</button>
        </div>
        <div className="es-canvas-bg">
          <div className="es-app-preview">
            <div className="es-app-nav" style={{ borderBottomColor: `${config.color}30` }}>
              <div className="es-canvas-line" style={{ width: 80, height: 8 }} />
              <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
                {[50, 50, 70].map((w, i) => <div key={i} className="es-canvas-line" style={{ width: w, height: 7 }} />)}
              </div>
            </div>
            <div className="es-app-hero" style={{ background: `${config.color}0a` }}>
              <div className="es-canvas-line" style={{ width: '55%', height: 14, margin: '0 auto 10px' }} />
              <div className="es-canvas-line" style={{ width: '40%', height: 8, margin: '0 auto 20px' }} />
              <div className="es-canvas-skel-btn" style={{ background: config.color, margin: '0 auto' }}>Get Started</div>
            </div>
            <div className="es-app-features">
              {[1, 2, 3].map(i => (
                <div key={i} className="es-app-feature-card">
                  <div className="es-canvas-line" style={{ width: '60%', height: 8, marginBottom: 8 }} />
                  <div className="es-canvas-line" style={{ width: '90%', height: 6 }} />
                  <div className="es-canvas-line" style={{ width: '75%', height: 6, marginTop: 4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right inspector */}
      <div className="es-props">
        <div className="es-props-header">Inspector</div>
        <div className="es-props-section">
          <div className="es-props-section-title">Layout</div>
          {['Width', 'Height', 'Padding', 'Gap'].map(p => (
            <div key={p} className="es-props-row">
              <span className="es-props-label">{p}</span>
              <div className="es-props-value-skel" />
            </div>
          ))}
        </div>
        <div className="es-props-section">
          <div className="es-props-section-title">Content</div>
          {['Heading text', 'Body copy', 'CTA label', 'CTA link'].map(p => (
            <div key={p} className="es-props-row">
              <span className="es-props-label">{p}</span>
              <div className="es-props-value-skel" style={{ width: 80 }} />
            </div>
          ))}
        </div>
        <div className="es-props-section">
          <div className="es-props-section-title">Style</div>
          {['Background', 'Text color', 'Border radius'].map(p => (
            <div key={p} className="es-props-row">
              <span className="es-props-label">{p}</span>
              <div className="es-props-value-skel" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
