import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback, useEffect } from 'react'

export function MatteV3Editor() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(false)
  const [pages, setPages] = useState([0, 1, 2])
  const [pageTitles, setPageTitles] = useState<Record<number, string>>({})
  const [activePage, setActivePage] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [gridView, setGridView] = useState(false)
  const [agentOpen, setAgentOpen] = useState(true)
  const [agentInput, setAgentInput] = useState('')
  const [agentMessages, setAgentMessages] = useState([
    {
      role: 'agent',
      text: "Here's what I created based on your brief:\n\n• 3-page social campaign on \"Safeguarding Your Innovation on Apple Platforms\"\n• Each page features a headline, supporting copy, a visual lock icon, and a clear CTA — \"Explore IP Best Practices\"\n• Consistent 1:1 square format, optimised for Instagram and LinkedIn feeds",
    },
    {
      role: 'agent',
      text: "Suggested next steps:\n\n1. Swap the placeholder icon for your brand visual\n2. Update the CTA link to your landing page\n3. Adjust the tone in Look & Feel (e.g. more formal for LinkedIn)\n4. Add a 4th page with a testimonial or stat\n\nWhat would you like to change?",
    },
  ])
  const [commentMode, setCommentMode] = useState(false)
  const [tweakOpen, setTweakOpen]     = useState(false)
  const [pendingPins, setPendingPins] = useState<Array<{id:number,x:number,y:number,text:string}>>([])
  const [focusId, setFocusId]         = useState<number|null>(null)
  const [comments, setComments]       = useState<Array<{id:number,x:number,y:number,text:string,page:number}>>([])
  const [activeCommentId, setActiveCommentId] = useState<number|null>(null)
  const commentIdRef = useRef(1)
  const pendingIdRef = useRef(100)
  const prevZoom     = useRef(100)
  const scrollDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sendingRef = useRef(false)

  const openTweakBar = () => {
    prevZoom.current = zoom
    // Reserved: topNav(52) + toolbarRow(54) + canvasWrapPad(26) + tweakBar(140) + bottomBar(52)
    const naturalSize = Math.min(800, Math.max(480, window.innerHeight * 0.68))
    const available = window.innerHeight - 324
    const fitZoom = Math.min(100, Math.max(40, Math.round((available / naturalSize) * 100)))
    setZoom(fitZoom)
    setTweakOpen(true)
    setCommentMode(true)
  }

  const closeTweakBar = () => {
    setZoom(prevZoom.current)
    setTweakOpen(false)
    setPendingPins([])
    setFocusId(null)
    setCommentMode(false)
  }

  const dropPin = (x: number, y: number) => {
    const id = pendingIdRef.current++
    setPendingPins(prev => [...prev, { id, x, y, text: '' }])
    setFocusId(id)
    if (!tweakOpen) openTweakBar()
  }

  const updatePinText = (id: number, text: string) => {
    setPendingPins(prev => prev.map(p => p.id === id ? { ...p, text } : p))
  }

  const removePendingPin = (id: number) => {
    setPendingPins(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length === 0) { closeTweakBar(); return next }
      setFocusId(next[next.length - 1].id)
      return next
    })
  }

  const runComments = () => {
    const toSave = pendingPins.filter(p => p.text.trim())
    if (toSave.length === 0) { closeTweakBar(); return }
    const saved = toSave.map(p => ({ id: commentIdRef.current++, x: p.x, y: p.y, text: p.text.trim(), page: activePage }))
    setComments(prev => [...prev, ...saved])
    const lines = saved.map((c, i) => `#${i + 1}: ${c.text}`).join('\n')
    setAgentMessages(prev => [
      ...prev,
      { role: 'user',  text: `[${saved.length} comment${saved.length > 1 ? 's' : ''} on Page ${activePage + 1}]\n${lines}` },
      { role: 'agent', text: `Got it! I've noted ${saved.length} comment${saved.length > 1 ? 's' : ''} on Page ${activePage + 1} and will apply all the changes.` },
    ])
    setAgentOpen(true)
    closeTweakBar()
  }

  const resolveComment = (id: number) => {
    setComments(prev => prev.filter(c => c.id !== id))
    setActiveCommentId(null)
  }

  const sendAgentMessage = () => {
    if (sendingRef.current) return
    const text = agentInput.trim()
    if (!text) return
    sendingRef.current = true
    setAgentInput('')
    setAgentMessages(prev => [...prev, { role: 'user', text }, { role: 'agent', text: 'Got it! Applying your changes to the post...' }])
    setTimeout(() => { sendingRef.current = false }, 100)
  }

  const addPage = () => {
    setPages(p => [...p, p.length])
    setActivePage(pages.length)
  }

  const deletePage = () => {
    if (pages.length === 1) return
    setPages(p => p.filter((_, i) => i !== activePage))
    setActivePage(i => Math.max(i - 1, 0))
  }

  const duplicatePage = () => {
    setPages(p => { const next = [...p]; next.splice(activePage + 1, 0, p.length); return next })
    setActivePage(activePage + 1)
  }

  const movePageUp = () => {
    if (activePage === 0) return
    setPages(p => { const next = [...p]; [next[activePage - 1], next[activePage]] = [next[activePage], next[activePage - 1]]; return next })
    setActivePage(i => i - 1)
  }

  const movePageDown = () => {
    if (activePage === pages.length - 1) return
    setPages(p => { const next = [...p]; [next[activePage], next[activePage + 1]] = [next[activePage + 1], next[activePage]]; return next })
    setActivePage(i => i + 1)
  }

  const prevPage = () => setActivePage(i => Math.max(i - 1, 0))
  const nextPage = () => setActivePage(i => Math.min(i + 1, pages.length - 1))

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault()
      setZoom(z => Math.min(200, Math.max(10, z + (e.deltaY < 0 ? 5 : -5))))
      return
    }
    if (Math.abs(e.deltaY) < 30) return
    if (scrollDebounce.current) return
    scrollDebounce.current = setTimeout(() => { scrollDebounce.current = null }, 400)
    if (e.deltaY > 0) nextPage()
    else prevPage()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length, activePage])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setZoom(z => Math.min(200, z + 10))
      } else if (e.key === '-') {
        e.preventDefault()
        setZoom(z => Math.max(10, z - 10))
      } else if (e.key === '0') {
        e.preventDefault()
        setZoom(100)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectPageFromGrid = (idx: number) => {
    setActivePage(idx)
    setGridView(false)
    setSelected(false)
  }

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
          </div>
        </div>
        <div className="mv3-topbar-right">
          <button className="mv3-sub-pill-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
              <path d="M12 20v-4M12 20a4 4 0 0 1-4-4M12 20a4 4 0 0 0 4-4"/>
            </svg>
            Look &amp; Feel
          </button>
          <div className="mv3-divider-v" />
          <button className="mv3-sub-pill-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/>
            </svg>
            Outline
          </button>
          <button className={`mv3-sub-pill-btn${agentOpen ? ' mv3-sub-pill-btn--active' : ''}`} onClick={() => setAgentOpen(o => !o)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l1.8 5.4L19.2 9l-5.4 1.8L12 16.2l-1.8-5.4L4.8 9l5.4-1.8L12 2z"/>
              <path d="M19 14l.9 2.7 2.7.9-2.7.9L19 21l-.9-2.7-2.7-.9 2.7-.9L19 14z" opacity=".6"/>
            </svg>
            Agent
          </button>
          <button className="mv3-sub-share-btn">Share</button>
          <div className="mv3-divider-v" />
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
          <div className="mv3-pages-list">
            {pages.map((_, idx) => (
              <div key={idx} className="mv3-page-thumb-group">
                <button
                  className={`mv3-page-thumb-btn${idx === activePage ? ' mv3-page-thumb-btn--active' : ''}`}
                  onClick={() => setActivePage(idx)}
                >
                  <div className="mv3-page-thumb-preview">
                    <div className="mv3-page-thumb-inner">
                      <MiniPostPreview page={idx} />
                    </div>
                  </div>
                  <span className="mv3-page-thumb-label">Page {idx + 1}</span>
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="mv3-main">
          {/* Canvas area */}
          <div className="mv3-canvas-area" onWheel={gridView ? undefined : handleWheel}>

            {gridView ? (
              /* ── Grid view ── */
              <div className="mv3-grid-view" onClick={() => setSelected(false)}>
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`mv3-grid-card${idx === activePage ? ' mv3-grid-card--active' : ''}`}
                    onClick={() => selectPageFromGrid(idx)}
                  >
                    <div className="mv3-grid-card-canvas">
                      <span className="mv3-aspect-label">1:1 · Page {idx + 1}</span>
                      <PostPreview page={idx} />
                    </div>
                    <span className="mv3-grid-card-label">Page {idx + 1}</span>
                  </button>
                ))}
                <button className="mv3-grid-add-btn" onClick={e => { e.stopPropagation(); addPage() }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add page
                </button>
              </div>
            ) : (
              /* ── Single-page view ── */
              <>
                {/* Selection / edit-mode toolbar — outside canvas-wrap so it never scrolls out of view */}
                {(selected || commentMode || tweakOpen) && (
                  <div className={`mv3-sel-toolbar-row`} onClick={e => e.stopPropagation()}>
                    <div className={`mv3-sel-toolbar${(commentMode || tweakOpen) ? ' mv3-sel-toolbar--comment-mode' : ''}`}>
                      {(commentMode || tweakOpen) ? (
                        /* ── Comment edit mode ── */
                        <>
                          <span className="mv3-sel-mode-dot" />
                          <span className="mv3-sel-mode-label">
                            {tweakOpen
                              ? `${pendingPins.length} pin${pendingPins.length !== 1 ? 's' : ''} placed — click canvas to add more`
                              : 'Click on the canvas to place a comment pin'}
                          </span>
                          <div className="mv3-sel-sep" />
                          <button className="mv3-sel-btn mv3-sel-btn--exit" onClick={e => { e.stopPropagation(); closeTweakBar(); setCommentMode(false) }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Exit
                          </button>
                        </>
                      ) : (
                        /* ── Normal toolbar ── */
                        <>
                          <span className="mv3-sel-ratio">1:1</span>
                          <div className="mv3-sel-sep" />
                          <button className="mv3-sel-btn">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/>
                            </svg>
                            Version History
                          </button>
                          <div className="mv3-sel-sep" />
                          <button
                            className="mv3-sel-btn mv3-sel-btn--mark"
                            onClick={e => { e.stopPropagation(); setCommentMode(true) }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            Mark to edit
                          </button>
                          <div className="mv3-sel-sep" />
                          <button className="mv3-sel-icon-btn" title="Download">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </button>
                          <div className="mv3-sel-sep" />
                          <button className="mv3-sel-icon-btn" title="Duplicate page" onClick={e => { e.stopPropagation(); duplicatePage() }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          </button>
                          <button className="mv3-sel-icon-btn" title="Delete page" onClick={e => { e.stopPropagation(); deletePage() }} disabled={pages.length === 1}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                          <button className="mv3-sel-icon-btn" title="Add page" onClick={e => { e.stopPropagation(); addPage() }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

              <div className="mv3-canvas-wrap">
                <div className="mv3-canvas-slot">
                  {/* Canvas card */}
                  <div
                    className={`mv3-canvas-card${selected ? ' mv3-canvas-card--selected' : ''}${commentMode ? ' mv3-canvas-comment-mode' : ''}`}
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    onClick={e => {
                      e.stopPropagation()
                      if (commentMode) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        dropPin(
                          ((e.clientX - rect.left) / rect.width) * 100,
                          ((e.clientY - rect.top)  / rect.height) * 100
                        )
                      } else {
                        setSelected(true)
                        setActiveCommentId(null)
                      }
                    }}
                  >
                    <PostPreview page={activePage} />
                    {/* Saved comment pins for the active page */}
                    {comments.filter(c => c.page === activePage).map((c, idx) => (
                      <div
                        key={c.id}
                        className={`mv3-comment-pin${activeCommentId === c.id ? ' mv3-comment-pin--active' : ''}`}
                        style={{ left: `${c.x}%`, top: `${c.y}%` }}
                        onClick={e => { e.stopPropagation(); setActiveCommentId(activeCommentId === c.id ? null : c.id) }}
                      >
                        <span style={{ transform: 'rotate(45deg)', display: 'block' }}>{idx + 1}</span>
                      </div>
                    ))}
                    {/* Pending pins (in tweak bar, not yet submitted) */}
                    {pendingPins.map((p, idx) => (
                      <div
                        key={p.id}
                        className={`mv3-comment-pin mv3-comment-pin--pending${focusId === p.id ? ' mv3-comment-pin--active' : ''}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        onClick={e => { e.stopPropagation(); setFocusId(p.id) }}
                      >
                        <span style={{ transform: 'rotate(45deg)', display: 'block' }}>{comments.filter(c => c.page === activePage).length + idx + 1}</span>
                      </div>
                    ))}
                  </div>

                  {/* Add page below canvas — hidden in edit mode to avoid dead space */}
                  {!tweakOpen && <button className="mv3-add-page-center" onClick={e => { e.stopPropagation(); addPage() }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add page
                  </button>}
                </div>
              </div>

              {/* Tweak prompt bar — sits outside canvas-wrap so it's always visible above bottom bar */}
              {tweakOpen && (
                <div className="mv3-tweak-bar" onClick={e => e.stopPropagation()}>
                  <div className="mv3-tweak-top">
                    <div className="mv3-tweak-chips">
                      {pendingPins.map((p, idx) => {
                        const num = comments.filter(c => c.page === activePage).length + idx + 1
                        const isFocus = focusId === p.id
                        return (
                          <button
                            key={p.id}
                            className={`mv3-tweak-chip${isFocus ? ' mv3-tweak-chip--focus' : ''}`}
                            onClick={() => setFocusId(p.id)}
                          >
                            <span className="mv3-tweak-chip-num">{num}</span>
                            <span className="mv3-tweak-chip-label">{p.text ? p.text.slice(0, 14) + (p.text.length > 14 ? '…' : '') : 'Add note…'}</span>
                            <span className="mv3-tweak-chip-remove" onClick={e => { e.stopPropagation(); removePendingPin(p.id) }}>×</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {focusId !== null && (() => {
                    const fp = pendingPins.find(p => p.id === focusId)
                    if (!fp) return null
                    return (
                      <input
                        key={focusId}
                        className="mv3-tweak-input"
                        placeholder="Describe the issue or suggestion…"
                        value={fp.text}
                        onChange={e => updatePinText(focusId, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') runComments() }}
                        autoFocus
                      />
                    )
                  })()}
                  <div className="mv3-tweak-bottom-bar">
                    <div className="mv3-tweak-suggestions">
                      {['Change the color', 'Adjust the layout', 'Update the copy', 'Resize this element'].map(s => (
                        <button key={s} className="mv3-tweak-suggestion" onClick={() => focusId !== null && updatePinText(focusId, s)}>{s}</button>
                      ))}
                    </div>
                    <button className="mv3-tweak-cancel-btn" onClick={closeTweakBar}>Cancel</button>
                    <button
                      className="mv3-tweak-edit-btn"
                      onClick={runComments}
                      disabled={pendingPins.every(p => !p.text.trim())}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
              </>
            )}

          </div>

          {/* Bottom toolbar — Canva-style */}
          <div className="mv3-bottom-bar">
            <div className="mv3-bottom-left">
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

            <div className="mv3-bottom-right">
              <div className="mv3-bottom-onboarding">
                <div className="mv3-bottom-onboarding-text">
                  <span className="mv3-bottom-onboarding-label">Get started</span>
                  <span className="mv3-bottom-onboarding-step">1 / 5</span>
                </div>
                <div className="mv3-bottom-onboarding-bar">
                  <div className="mv3-bottom-onboarding-fill" style={{ width: '20%' }} />
                </div>
              </div>
              <div className="mv3-bottom-sep" />
              <button
                className={`mv3-bottom-icon-btn${gridView ? ' mv3-bottom-icon-btn--active' : ''}`}
                title="Grid view"
                onClick={() => { setGridView(v => !v); setSelected(false) }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button className="mv3-bottom-icon-btn" title="Fit to screen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>
                </svg>
              </button>
              <span className="mv3-bottom-pages-count">{activePage + 1} / {pages.length}</span>
              <button className="mv3-bottom-icon-btn mv3-bottom-help-btn" title="Help">?</button>
            </div>
          </div>
        </div>

        {/* ── Agent chat panel ── */}
        {agentOpen && (
          <div className="mv3-agent-panel-wrap">
            <aside className="mv3-agent-panel" onClick={e => e.stopPropagation()}>
              <div className="mv3-agent-panel-header">
                <div className="mv3-agent-panel-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c-1.2 5.4-5 7-9 7 0 5.4 3.3 9.8 9 11 5.7-1.2 9-5.6 9-11-4 0-7.8-1.6-9-7z"/>
                  </svg>
                  Agent
                </div>
                <button className="mv3-agent-panel-close" onClick={() => setAgentOpen(false)} title="Close">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="mv3-agent-thread">
                {agentMessages.map((msg, i) => (
                  <div key={i} className={`mv3-agent-msg mv3-agent-msg--${msg.role}`}>
                    <div className="mv3-agent-msg-bubble">{msg.text}</div>
                  </div>
                ))}
              </div>

              <div className="mv3-agent-compose">
                <textarea
                  className="mv3-agent-input"
                  placeholder="Ask the agent to edit…"
                  value={agentInput}
                  rows={2}
                  onChange={e => setAgentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAgentMessage() } }}
                />
                <div className="mv3-agent-compose-bar">
                  <button className="mv3-agent-attach" title="Attach">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <button className="mv3-agent-model-picker">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    <span>Sonnet 4.6</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <button className="mv3-agent-send" onClick={sendAgentMessage} disabled={!agentInput.trim()} title="Send">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

      </div>


    </div>
  )
}

const PAGE_CONFIGS = [
  {
    bg: '#f5f5f0',
    accent: '#22c55e',
    label: 'Awareness',
  },
  {
    bg: '#0f172a',
    accent: '#3b82f6',
    label: 'Benefits',
  },
  {
    bg: '#faf5ff',
    accent: '#7c3aed',
    label: 'Call to Action',
  },
]

function PostPreview({ page }: { page: number }) {
  const cfg = PAGE_CONFIGS[page % PAGE_CONFIGS.length]

  if (page % 3 === 1) {
    return (
      <div className="mv3-post-preview" style={{ background: cfg.bg }}>
        <div className="mv3-post-content" style={{ gap: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: cfg.accent, margin: 0 }}>3 Ways to Protect Your IP</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
            {[
              { n: '01', title: 'Register Early', sub: 'File patents and trademarks before going public' },
              { n: '02', title: 'Document Everything', sub: 'Timestamped records are your strongest defence' },
              { n: '03', title: 'Monitor Actively', sub: 'Set alerts and audit your competitive landscape' },
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: cfg.accent, lineHeight: 1, flex: 'none', width: 48 }}>{item.n}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mv3-post-cta" style={{ background: cfg.accent, color: '#fff', border: 'none', marginTop: 8 }}>Learn the 3 Steps</button>
        </div>
      </div>
    )
  }

  if (page % 3 === 2) {
    return (
      <div className="mv3-post-preview" style={{ background: cfg.bg }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '100%', background: cfg.accent, opacity: .08, borderRadius: '0 14px 14px 0' }} />
        <div className="mv3-post-content">
          <div style={{ fontSize: 48, lineHeight: 1 }}>🚀</div>
          <h2 className="mv3-post-headline" style={{ color: '#1e1b4b', fontSize: 28 }}>Ready to Secure Your Innovation?</h2>
          <p className="mv3-post-subhead" style={{ color: '#6d28d9' }}>Join 500+ developers who protect their work with LayerProof</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', alignItems: 'center' }}>
            <button className="mv3-post-cta" style={{ background: cfg.accent, color: '#fff', border: 'none', fontSize: 15, padding: '12px 32px' }}>Get Started Free</button>
            <span style={{ fontSize: 11, color: '#a78bfa' }}>No credit card required · Cancel anytime</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mv3-post-preview" style={{ background: cfg.bg }}>
      <div className="mv3-post-bg-pattern">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="mv3-pattern-block" />
        ))}
      </div>
      <div className="mv3-post-content">
        <h2 className="mv3-post-headline">Safeguarding Your Innovation on Apple Platforms</h2>
        <p className="mv3-post-subhead">Mastering Intellectual Property Strategy for Developers and Designers</p>
        <div className="mv3-post-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill={cfg.accent} stroke="none">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke={cfg.accent} strokeWidth={2} strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="white"/>
          </svg>
        </div>
        <button className="mv3-post-cta">Explore IP Best Practices</button>
      </div>
    </div>
  )
}

function MiniPostPreview({ page }: { page: number }) {
  const cfg = PAGE_CONFIGS[page % PAGE_CONFIGS.length]
  const isDark = page % 3 === 1

  if (page % 3 === 1) {
    return (
      <div style={{ aspectRatio: '1', height: '100%', maxWidth: '100%', background: cfg.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 6, padding: '6px 8px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 4, fontWeight: 800, color: cfg.accent, letterSpacing: '.08em', textTransform: 'uppercase' }}>3 Ways to Protect</div>
          {['01 Register Early', '02 Document Everything', '03 Monitor Actively'].map(t => (
            <div key={t} style={{ fontSize: 4, color: '#94a3b8', paddingLeft: 2 }}>{t}</div>
          ))}
          <div style={{ marginTop: 3, padding: '2px 5px', borderRadius: 3, background: cfg.accent, color: '#fff', fontSize: 3.5, fontWeight: 700, width: 'fit-content' }}>Learn More</div>
        </div>
      </div>
    )
  }

  if (page % 3 === 2) {
    return (
      <div style={{ aspectRatio: '1', height: '100%', maxWidth: '100%', background: cfg.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 6 }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: cfg.accent, opacity: .1 }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 6px', gap: 4 }}>
          <div style={{ fontSize: 10 }}>🚀</div>
          <div style={{ fontSize: 5, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.2, maxWidth: 80 }}>Ready to Secure Your Innovation?</div>
          <div style={{ padding: '2px 6px', borderRadius: 4, background: cfg.accent, color: '#fff', fontSize: 3.5, fontWeight: 700, marginTop: 2 }}>Get Started Free</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ aspectRatio: '1', height: '100%', maxWidth: '100%', background: cfg.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 6 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', opacity: .07, pointerEvents: 'none' }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #999', borderRadius: 3, margin: 3, background: '#aaa' }} />
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 6px', gap: 4 }}>
        <div style={{ fontSize: 6, fontWeight: 800, color: '#111', lineHeight: 1.2, maxWidth: 100 }}>Safeguarding Your Innovation</div>
        <div style={{ fontSize: 4, color: '#555', lineHeight: 1.3, maxWidth: 90 }}>Mastering IP Strategy</div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={cfg.accent} stroke="none" style={{ margin: '2px 0' }}>
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke={cfg.accent} strokeWidth={2} strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="white"/>
        </svg>
        <div style={{ fontSize: 4, fontWeight: 700, padding: '2px 6px', borderRadius: 8, border: '0.5px solid #111', color: '#111', background: '#fff' }}>Explore IP Best Practices</div>
      </div>
    </div>
  )
}
