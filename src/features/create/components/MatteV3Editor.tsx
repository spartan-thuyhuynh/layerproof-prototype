import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'

export function MatteV3Editor() {
  const navigate = useNavigate()
  const [captionOpen, setCaptionOpen] = useState(false)
  const [selected, setSelected] = useState(false)
  const [pages, setPages] = useState([0, 1, 2])
  const [activePage, setActivePage] = useState(0)
  const [zoom, setZoom] = useState(100)
  const scrollDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addPage = () => {
    setPages(p => [...p, p.length])
    setActivePage(pages.length)
  }

  const prevPage = () => setActivePage(i => Math.max(i - 1, 0))
  const nextPage = () => setActivePage(i => Math.min(i + 1, pages.length - 1))

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 30) return
    if (scrollDebounce.current) return
    scrollDebounce.current = setTimeout(() => { scrollDebounce.current = null }, 400)
    if (e.deltaY > 0) nextPage()
    else prevPage()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length, activePage])

  return (
    <div className="mv3-layout" onClick={() => setSelected(false)}>
      {/* ── Top bar ── */}
      <header className="mv3-topbar">
        <div className="mv3-topbar-left">
          <button className="mv3-icon-btn" onClick={() => navigate('/')} title="Home">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </button>
          <div className="mv3-divider-v" />
          <div className="mv3-breadcrumb">
            <span className="mv3-campaign-title">Social Campaign – Present intellectual property</span>
            <span className="mv3-campaign-sub">1 post · {pages.length} pages</span>
          </div>
        </div>
        <div className="mv3-topbar-right">
          {/* AI Agent button */}
          <button className="mv3-agent-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            AI Agent
          </button>
          <div className="mv3-divider-v" />
          <button className="mv3-ghost-btn">Feedback</button>
          <button className="mv3-ghost-btn">Tone</button>
          <button className="mv3-ghost-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
            Theme
          </button>
          <div className="mv3-plan-pill">Plan: <strong>Unlimited</strong></div>
          <div className="mv3-avatar">T</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="mv3-body">
        {/* Left sidebar — Pages */}
        <aside className="mv3-sidebar">
          <div className="mv3-sidebar-header">
            <span className="mv3-sidebar-title">Pages</span>
            <span className="mv3-sidebar-count">{activePage + 1}/{pages.length}</span>
          </div>
          <div className="mv3-sidebar-actions">
            <button className="mv3-new-post-btn" onClick={addPage}>New Page +</button>
          </div>
          <div className="mv3-pages-list">
            {pages.map((_, idx) => (
              <button
                key={idx}
                className={`mv3-page-thumb-btn${idx === activePage ? ' mv3-page-thumb-btn--active' : ''}`}
                onClick={() => setActivePage(idx)}
              >
                <div className="mv3-page-thumb-preview">
                  <div className="mv3-page-thumb-inner">
                    <MiniPostPreview />
                  </div>
                </div>
                <span className="mv3-page-thumb-label">Page {idx + 1}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="mv3-main">
          {/* Canvas area */}
          <div className="mv3-canvas-area" onWheel={handleWheel}>
            <div className="mv3-canvas-wrap">
              <div className="mv3-canvas-slot">
                {/* Floating selection toolbar */}
                {selected && (
                  <div className="mv3-sel-toolbar" onClick={e => e.stopPropagation()}>
                    <button className="mv3-sel-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/>
                      </svg>
                      Version History
                    </button>
                    <div className="mv3-sel-sep" />
                    <button className="mv3-sel-btn mv3-sel-btn--icon">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                      </svg>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    <div className="mv3-sel-sep" />
                    <button className="mv3-sel-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                      </svg>
                      Regenerate
                    </button>
                    <button className="mv3-sel-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      AI Edit
                    </button>
                    <button className="mv3-sel-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Manual Edit
                    </button>
                    <div className="mv3-sel-sep" />
                    <button className="mv3-sel-icon-btn" title="Copy">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                    <button className="mv3-sel-icon-btn" title="Download">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button className="mv3-sel-icon-btn" title="Share">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                )}

                {/* Canvas card */}
                <div
                  className={`mv3-canvas-card${selected ? ' mv3-canvas-card--selected' : ''}`}
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
                  onClick={e => { e.stopPropagation(); setSelected(true) }}
                >
                  <span className="mv3-aspect-label">1:1 Square · Page {activePage + 1}</span>
                  <PostPreview />
                </div>
              </div>
            </div>

            {/* Bottom controls: page dots + zoom */}
            <div className="mv3-canvas-footer">
              <div className="mv3-page-dots">
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`mv3-page-dot${idx === activePage ? ' mv3-page-dot--active' : ''}`}
                    onClick={() => setActivePage(idx)}
                  />
                ))}
              </div>
              <div className="mv3-zoom-controls">
                <input
                  type="range"
                  min={10}
                  max={200}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="mv3-zoom-slider"
                />
                <button
                  className="mv3-zoom-pct"
                  onClick={() => setZoom(100)}
                  title="Reset to 100%"
                >
                  {Math.round(zoom)}%
                </button>
              </div>
              <div className="mv3-add-ratio">
                <button className="mv3-add-ratio-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Aspect Ratio
                </button>
              </div>
            </div>
          </div>

          {/* Caption & Hashtags bottom panel */}
          <div className={`mv3-caption-bar${captionOpen ? ' mv3-caption-bar--open' : ''}`}>
            <button className="mv3-caption-toggle" onClick={() => setCaptionOpen(o => !o)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: captionOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
            <span className="mv3-caption-label">Caption &amp; Hashtags</span>
            <div style={{ flex: 1 }} />
            <button className="mv3-caption-edit-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Get started chip */}
      <div className="mv3-onboarding-chip">
        <div className="mv3-onboarding-text">
          <span className="mv3-onboarding-label">Get started</span>
          <span className="mv3-onboarding-step">1/5</span>
        </div>
        <div className="mv3-onboarding-bar">
          <div className="mv3-onboarding-bar-fill" style={{ width: '20%' }} />
        </div>
      </div>
      <button className="mv3-help-btn" title="Help">?</button>
    </div>
  )
}

function PostPreview() {
  return (
    <div className="mv3-post-preview">
      <div className="mv3-post-bg-pattern">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="mv3-pattern-block" />
        ))}
      </div>
      <div className="mv3-post-content">
        <h2 className="mv3-post-headline">Safeguarding Your Innovation on Apple Platforms</h2>
        <p className="mv3-post-subhead">Mastering Intellectual Property Strategy for Developers and Designers</p>
        <div className="mv3-post-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#22c55e" stroke="none">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="white"/>
          </svg>
        </div>
        <button className="mv3-post-cta">Explore IP Best Practices</button>
      </div>
    </div>
  )
}

function MiniPostPreview() {
  return (
    /* This square div maintains the canvas's 1:1 ratio and is centered
       inside the 4/3 preview box — surrounding space stays as panel bg */
    <div style={{ aspectRatio: '1', height: '100%', maxWidth: '100%', background: '#f8f8f8', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 6 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', opacity: .07, pointerEvents: 'none' }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #999', borderRadius: 3, margin: 3, background: '#aaa' }} />
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 6px', gap: 4 }}>
        <div style={{ fontSize: 6, fontWeight: 800, color: '#111', lineHeight: 1.2, maxWidth: 100 }}>Safeguarding Your Innovation</div>
        <div style={{ fontSize: 4, color: '#555', lineHeight: 1.3, maxWidth: 90 }}>Mastering IP Strategy</div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#22c55e" stroke="none" style={{ margin: '2px 0' }}>
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="white"/>
        </svg>
        <div style={{ fontSize: 4, fontWeight: 700, padding: '2px 6px', borderRadius: 8, border: '0.5px solid #111', color: '#111', background: '#fff' }}>Explore IP Best Practices</div>
      </div>
    </div>
  )
}
