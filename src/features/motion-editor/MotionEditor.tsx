import { useState, useRef, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Pause,
  ArrowClockwise,
  ArrowsClockwise,
  CornersOut,
  Scan,
  Trash,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ArrowCounterClockwise,
  Plus,
  PaperPlaneRight,
  TextT,
  Rectangle,
  Circle,
  Star,
  MusicNote,
  X,
  Check,
  CaretRight,
  SquaresFour,
  SpeakerHigh,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  ThumbsUp,
  ThumbsDown,
  FilmStrip,
  Sparkle,
  MagnifyingGlass,
  Copy,
  ClipboardText,
} from '@phosphor-icons/react'

/* ── Types ── */
type PanelTab = 'Layers' | 'Assets' | 'Audio'
type Scene = 1 | 2
type Keyframe = { timeMs: number; value: number }
type LayerKeyframes = Record<string, Keyframe[]>

interface ChatMessage {
  id: number
  role: 'user' | 'agent'
  text?: string
  time?: string
  toolCalls?: ToolCall[]
}

interface ToolCall {
  id: number
  name: string
  status: 'success' | 'error'
  detail: string
}

/* ── Initial chat state ── */
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: 'agent',
    text: 'Your motion-graphics video of the app scrolling through the phone mockup is now complete with narration.',
    time: '1:44 PM',
  },
  {
    id: 2,
    role: 'user',
    text: 'change the background to solid green',
    time: '01:46 PM',
  },
  {
    id: 3,
    role: 'agent',
    toolCalls: [
      { id: 1, name: 'narrate',           status: 'success', detail: 'Generated narration audio for Scene 1 and Scene 2.' },
      { id: 2, name: 'regenerate_scene',  status: 'error',   detail: 'Scene storyboard moments are missing — cannot regenerate without source data.' },
      { id: 3, name: 'regenerate_scene',  status: 'error',   detail: 'Retried with fallback config. Still missing storyboard moments.' },
      { id: 4, name: 'regenerate_scene',  status: 'error',   detail: 'Third attempt failed. Storyboard data unavailable for this scene.' },
    ],
  },
  {
    id: 4,
    role: 'agent',
    text: "I've attempted to change the background to solid green for your scenes, but I'm encountering a technical issue with the scene data (storyboard moments are missing).\n\nSince I cannot modify the existing scenes right now, I recommend starting a new generation and including \"solid green background\" in your prompt. This will ensure the background is set correctly from the start.",
    time: '1:46 PM',
  },
]

const VERSION_HISTORY = [
  { id: 1, label: 'v3 — Current', time: 'Today, 2:41 PM', current: true },
  { id: 2, label: 'v2',           time: 'Today, 1:15 PM', current: false },
  { id: 3, label: 'v1',           time: 'Today, 11:03 AM', current: false },
]

const WAVEFORM_HEIGHTS = [
  8,14,20,28,22,16,10,18,30,24,12,8,20,32,26,14,10,22,28,18,12,26,34,22,16,
  10,20,30,24,14,8,18,28,22,12,26,32,20,10,16,24,18,14,28,22,10,20,30,16,12,
  24,18,8,26,32,20,14,10,22,28,18,12,26,30,16,10,20,28,22,14,8,18,26,20,12,
]

function formatMessage(text: string) {
  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim()) {
      paraLines.push(lines[i])
      i++
    }
    blocks.push(<p key={blocks.length} style={{ margin: '0 0 6px' }}>{paraLines.join(' ')}</p>)
  }
  return <Fragment>{blocks}</Fragment>
}

const ANIM_FILTERS = ['Trending', 'Basic', 'Light', 'Glitch', 'Mask']
const ANIM_PRESETS = [
  { name: 'None',       emoji: '⊘',  dur: '' },
  { name: 'Zoom In',    emoji: '🔍', dur: '0.6s' },
  { name: 'Fade In',    emoji: '🌅', dur: '0.5s' },
  { name: 'Slide Up',   emoji: '⬆️', dur: '0.4s' },
  { name: 'Wiper',      emoji: '🧹', dur: '0.8s' },
  { name: 'Pop',        emoji: '💥', dur: '0.3s' },
  { name: 'Zoom Out',   emoji: '🔎', dur: '0.6s' },
  { name: 'Bounce',     emoji: '⚡', dur: '0.5s' },
  { name: 'Slide Left', emoji: '⬅️', dur: '0.4s' },
  { name: 'Rotate',     emoji: '🔄', dur: '0.7s' },
  { name: 'Flip',       emoji: '🃏', dur: '0.5s' },
  { name: 'Shake',      emoji: '📳', dur: '0.4s' },
]

const ICON_LIBRARY = [
  { name: 'Star',         emoji: '⭐' },
  { name: 'Heart',        emoji: '❤️' },
  { name: 'Lightning',    emoji: '⚡' },
  { name: 'Fire',         emoji: '🔥' },
  { name: 'Diamond',      emoji: '💎' },
  { name: 'Crown',        emoji: '👑' },
  { name: 'Rocket',       emoji: '🚀' },
  { name: 'Globe',        emoji: '🌍' },
  { name: 'Music',        emoji: '🎵' },
  { name: 'Camera',       emoji: '📷' },
  { name: 'Chat',         emoji: '💬' },
  { name: 'Bell',         emoji: '🔔' },
  { name: 'Shield',       emoji: '🛡️' },
  { name: 'Lock',         emoji: '🔒' },
  { name: 'Leaf',         emoji: '🍃' },
  { name: 'Sun',          emoji: '☀️' },
  { name: 'Moon',         emoji: '🌙' },
  { name: 'Cloud',        emoji: '☁️' },
  { name: 'Wave',         emoji: '🌊' },
  { name: 'Sparkle',      emoji: '✨' },
]

export function MotionEditor() {
  const navigate = useNavigate()

  /* State */
  const [panelTab, setPanelTab]       = useState<PanelTab>('Layers')
  const [shapesOpen, setShapesOpen]   = useState(false)
  const [iconMenuOpen, setIconMenuOpen] = useState(false)
  const [iconSearch, setIconSearch]     = useState('')
  const [assetSearchOpen, setAssetSearchOpen] = useState(false)
  const [assetSearch, setAssetSearch]         = useState('')
  const [generateOpen, setGenerateOpen]       = useState(false)
  const [generatePrompt, setGeneratePrompt]   = useState('')
  const [mode, setMode]               = useState<'Design' | 'Animate'>('Animate')
  const [animTab, setAnimTab]         = useState<'animation' | 'transform'>('transform')
  const [transformOpen, setTransformOpen] = useState(true)
  const [animSearch, setAnimSearch]   = useState('')
  const [animFilter, setAnimFilter]   = useState('Trending')
  const [animDuration, setAnimDuration] = useState(2.0)
  const [activeScene, setActiveScene] = useState<Scene>(1)
  const [isPlaying, setIsPlaying]     = useState(false)
  const [timeMs, setTimeMs]           = useState(3920)
  const totalMs = 12720
  const [showVersions, setShowVersions] = useState(false)
  const [chatOpen, setChatOpen]         = useState(true)
  const [showExport, setShowExport]     = useState(false)
  const [exportFormat, setExportFormat] = useState<'mp4' | 'gif' | 'webm'>('mp4')
  const [chatInput, setChatInput]       = useState('')
  const [messages, setMessages]         = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [expandedChips, setExpandedChips] = useState<Record<number, boolean>>({})
  const [expandedMsgs, setExpandedMsgs]   = useState<Record<number, boolean>>({})
  const [zoom, setZoom]                   = useState(100)
  const [isLooping, setIsLooping]         = useState(false)
  const [isMuted, setIsMuted]             = useState(false)
  const [tlZoom, setTlZoom]               = useState(100)
  const [kfMenuOpen, setKfMenuOpen]       = useState(false)
  const [keyframes, setKeyframes]         = useState<Record<string, LayerKeyframes>>({
    'rect-yfer4o': {
      x:        [{ timeMs: 500,  value: 0   }, { timeMs: 2000, value: 120 }, { timeMs: 3500, value: 60  }],
      y:        [{ timeMs: 500,  value: 0   }, { timeMs: 2800, value: 80  }],
      scale:    [{ timeMs: 1000, value: 100 }, { timeMs: 3000, value: 140 }],
      rotation: [{ timeMs: 1500, value: 0   }, { timeMs: 3200, value: 45  }],
      opacity:  [{ timeMs: 0,    value: 0   }, { timeMs: 800,  value: 100 }],
    },
    'text-b2r5w': {
      x:        [{ timeMs: 4200, value: 0   }, { timeMs: 6000, value: 180 }, { timeMs: 8000, value: 90  }],
      y:        [{ timeMs: 4200, value: 0   }, { timeMs: 7000, value: 60  }],
      opacity:  [{ timeMs: 3920, value: 0   }, { timeMs: 4600, value: 100 }],
    },
  })
  const [layersExpanded, setLayersExpanded] = useState<Record<string, boolean>>({})
  const [selectedLayerId, setSelectedLayerId] = useState<string>('rect-yfer4o')
  const [tlHeight, setTlHeight]           = useState(380)
  const [leftPanelW, setLeftPanelW]       = useState(200)
  const [rightPanelW, setRightPanelW]     = useState(290)
  const msgEndRef      = useRef<HTMLDivElement>(null)
  const playRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextMsgId      = useRef(100)
  const canvasBgRef    = useRef<HTMLDivElement>(null)
  const timelineRef    = useRef<HTMLDivElement>(null)
  const tlResizeRef    = useRef<{ startY: number; startH: number } | null>(null)
  const panelResizeRef = useRef<{ startX: number; startW: number; side: 'left' | 'right' } | null>(null)

  function handlePanelResizeDown(e: React.MouseEvent, side: 'left' | 'right') {
    e.preventDefault()
    const startW = side === 'left' ? leftPanelW : rightPanelW
    panelResizeRef.current = { startX: e.clientX, startW, side }
    function onMove(ev: MouseEvent) {
      if (!panelResizeRef.current) return
      const delta = ev.clientX - panelResizeRef.current.startX
      if (panelResizeRef.current.side === 'left') {
        setLeftPanelW(Math.max(140, Math.min(400, panelResizeRef.current.startW + delta)))
      } else {
        setRightPanelW(Math.max(220, Math.min(480, panelResizeRef.current.startW - delta)))
      }
    }
    function onUp() {
      panelResizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleTlResizeDown(e: React.MouseEvent) {
    e.preventDefault()
    tlResizeRef.current = { startY: e.clientY, startH: tlHeight }
    function onMove(ev: MouseEvent) {
      if (!tlResizeRef.current) return
      const delta = tlResizeRef.current.startY - ev.clientY
      setTlHeight(Math.max(120, Math.min(700, tlResizeRef.current.startH + delta)))
    }
    function onUp() {
      tlResizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  /* Canvas size (16:9 at 480px wide) */
  const CARD_W = 480
  const CARD_H = 270

  function calcFitZoom() {
    const el = canvasBgRef.current
    if (!el) return 100
    const pad = 48
    const scaleW = (el.clientWidth  - pad) / CARD_W
    const scaleH = (el.clientHeight - pad) / CARD_H
    return Math.round(Math.min(scaleW, scaleH) * 100)
  }

  /* Fit on mount */
  useEffect(() => {
    setZoom(calcFitZoom())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Scroll-wheel zoom on canvas */
  function handleCanvasWheel(e: React.WheelEvent) {
    e.preventDefault()
    const delta = e.ctrlKey ? e.deltaY * 0.5 : e.deltaY * 0.3
    setZoom(z => Math.max(10, Math.min(400, Math.round(z - delta))))
  }

  /* Play/pause ticker */
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setTimeMs(t => {
          if (t >= totalMs) { setIsPlaying(false); return 0 }
          return t + 100
        })
      }, 100)
    } else {
      if (playRef.current) clearInterval(playRef.current)
    }
    return () => { if (playRef.current) clearInterval(playRef.current) }
  }, [isPlaying])

  /* Auto-scroll chat */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* Sync active scene with playhead position */
  useEffect(() => {
    setActiveScene(timeMs < 3920 ? 1 : 2)
  }, [timeMs])

  /* Spacebar play/pause + Ctrl+=/- timeline zoom */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(p => !p) }
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); setTlZoom(z => Math.min(400, z + 25)) }
        if (e.key === '-')                  { e.preventDefault(); setTlZoom(z => Math.max(25,  z - 25)) }
        if (e.key === '0')                  { e.preventDefault(); setTlZoom(100) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function handleTimelineWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -25 : 25
    setTlZoom(z => Math.max(25, Math.min(400, z + delta)))
  }

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    const inner = e.currentTarget
    const rect = inner.getBoundingClientRect()
    const labelWidth = 220
    const clickX = e.clientX - rect.left
    if (clickX < labelWidth) return
    const trackWidth = rect.width - labelWidth
    const fraction = (clickX - labelWidth) / trackWidth
    setTimeMs(Math.round(Math.max(0, Math.min(1, fraction)) * totalMs))
  }

  function formatTime(ms: number) {
    const totalSec = ms / 1000
    const h  = Math.floor(totalSec / 3600)
    const m  = Math.floor((totalSec % 3600) / 60)
    const s  = Math.floor(totalSec % 60)
    const f  = Math.floor((ms % 1000) / (1000 / 30)) // 30fps frames
    return [h, m, s, f].map(n => String(n).padStart(2, '0')).join(':')
  }

  /* ── Keyframe helpers ── */
  const KF_TOLERANCE = 50

  function hasKfAt(layerKfs: LayerKeyframes, prop: string, t: number): boolean {
    return (layerKfs[prop] ?? []).some(k => Math.abs(k.timeMs - t) <= KF_TOLERANCE)
  }
  function anyKfAt(layerKfs: LayerKeyframes, t: number): boolean {
    return Object.keys(layerKfs).some(p => hasKfAt(layerKfs, p, t))
  }
  function toggleKf(prop: string, value: number) {
    setKeyframes(prev => {
      const layerKfs = prev[selectedLayerId] ?? {}
      const arr = layerKfs[prop] ?? []
      const idx = arr.findIndex(k => Math.abs(k.timeMs - timeMs) <= KF_TOLERANCE)
      const next = idx >= 0
        ? arr.filter((_, i) => i !== idx)
        : [...arr, { timeMs, value }].sort((a, b) => a.timeMs - b.timeMs)
      return { ...prev, [selectedLayerId]: { ...layerKfs, [prop]: next } }
    })
  }

  const selectedLayerKfs = keyframes[selectedLayerId] ?? {}
  const atKf     = anyKfAt(selectedLayerKfs, timeMs)
  const xAtKf    = hasKfAt(selectedLayerKfs, 'x', timeMs)
  const yAtKf    = hasKfAt(selectedLayerKfs, 'y', timeMs)
  const scaleAtKf = hasKfAt(selectedLayerKfs, 'scale', timeMs)
  const rotAtKf  = hasKfAt(selectedLayerKfs, 'rotation', timeMs)
  const opacAtKf = hasKfAt(selectedLayerKfs, 'opacity', timeMs)

  function handleSend() {
    const text = chatInput.trim()
    if (!text) return
    setMessages(prev => [...prev, { id: nextMsgId.current++, role: 'user', text, time: 'now' }])
    setChatInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: nextMsgId.current++,
        role: 'agent',
        text: "I'm working on that now. I'll update the scene shortly.",
        time: 'now',
      }])
    }, 900)
  }

  function handleSceneClick(scene: Scene) {
    setActiveScene(scene)
    setTimeMs(scene === 1 ? 0 : 3920)
  }

  return (
    <div className="me-layout">

      {/* ── Top Bar ── */}
      <header className="mv3-topbar">
        <div className="mv3-topbar-left">
          <button className="mv3-icon-btn" onClick={() => navigate('/home')} title="Home">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </button>
          <button className="mv3-icon-btn" onClick={() => setChatOpen(o => !o)} title="Toggle Agent">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          <div className="mv3-divider-v" />
          <div className="mv3-breadcrumb">
            <span className="mv3-campaign-title">Social Campaign – Present intellectual property</span>
          </div>
        </div>

        <div className="mv3-topbar-right">
          <button className="mv3-ghost-btn" onClick={() => setShowVersions(v => !v)}>
            <ArrowClockwise size={13} /> Versions
          </button>
          <div className="mv3-divider-v" />
          <button className="mv3-ghost-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Invite
          </button>
          <div className="mv3-divider-v" />
          <button className="mv3-sub-share-btn" onClick={() => setShowExport(true)}>Export</button>
          <div className="mv3-divider-v" />
          <div className="mv3-plan-badge">
            <span className="mv3-plan-label">Plan:</span>
            <span className="mv3-plan-value">Unlimited</span>
          </div>
          <div className="mv3-avatar">T</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="me-body">

        {/* ── Chat Sidebar ── */}
        <aside className="me-chat" style={chatOpen ? undefined : { display: 'none' }}>
          <div className="me-chat-card">
          {/* Header */}
          <div className="me-chat-panel-header">
            <div className="me-chat-panel-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f5c518' }}>
                <path d="M12 3c-1.2 5.4-5 7-9 7 0 5.4 3.3 9.8 9 11 5.7-1.2 9-5.6 9-11-4 0-7.8-1.6-9-7z"/>
              </svg>
              Agent
            </div>
            <div className="me-chat-panel-actions">
              <button className="me-agent-clear-btn" onClick={() => setMessages(INITIAL_MESSAGES)}>
                <ArrowClockwise size={12} />
                Clear
              </button>
              <button className="mv3-icon-btn" onClick={() => setChatOpen(false)} title="Collapse">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="me-chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`me-agent-msg me-agent-msg--${msg.role}`}>

                {msg.toolCalls ? (
                  <div className="me-tool-chip-row">
                    {(expandedMsgs[msg.id] ? msg.toolCalls : msg.toolCalls.slice(0, 3)).map(tc => (
                      <div key={tc.id} style={{ width: '100%' }}>
                        <button
                          className={`me-tool-chip me-tool-chip--${tc.status}`}
                          onClick={() => setExpandedChips(p => ({ ...p, [tc.id]: !p[tc.id] }))}
                        >
                          <span className="me-tool-chip-icon">
                            {tc.status === 'success'
                              ? <Check size={8} weight="bold" />
                              : <X size={8} weight="bold" />}
                          </span>
                          {tc.name}
                          <CaretRight
                            size={10}
                            style={{ marginLeft: 'auto', opacity: 0.5, transform: expandedChips[tc.id] ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
                          />
                        </button>
                        {expandedChips[tc.id] && (
                          <div className="me-tool-chip-detail">{tc.detail}</div>
                        )}
                      </div>
                    ))}
                    {msg.toolCalls.length > 3 && (
                      <button
                        className="me-more-tools"
                        onClick={() => setExpandedMsgs(p => ({ ...p, [msg.id]: !p[msg.id] }))}
                      >
                        {expandedMsgs[msg.id]
                          ? 'Show less'
                          : `${msg.toolCalls.length - 3} more tool call${msg.toolCalls.length - 3 > 1 ? 's' : ''}`}
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="me-agent-bubble">
                      {formatMessage(msg.text ?? '')}
                    </div>
                    {msg.role === 'agent' && (
                      <div className="me-msg-reactions">
                        <button className="me-reaction-btn" title="Like"><ThumbsUp size={13} /></button>
                        <button className="me-reaction-btn" title="Dislike"><ThumbsDown size={13} /></button>
                      </div>
                    )}
                  </>
                )}

                {msg.time && <span className="me-msg-time">{msg.time}</span>}
              </div>
            ))}
            <div ref={msgEndRef} />
          </div>

          {/* Compose */}
          <div className="me-agent-compose">
            <div className="me-agent-compose-context">
              <span className="me-compose-scene-chip">
                <FilmStrip size={11} weight="fill" />
                Scene {activeScene}
              </span>
              <span className="me-compose-format-chip">Motion · MP4</span>
            </div>
            <textarea
              className="me-agent-input"
              placeholder="Describe changes to make..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              rows={3}
            />
            <div className="me-agent-compose-bar">
              <button className="me-agent-attach" title="Attach">
                <Plus size={14} weight="bold" />
              </button>
              <button className="me-agent-model-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f5c518' }}>
                  <path d="M12 3c-1.2 5.4-5 7-9 7 0 5.4 3.3 9.8 9 11 5.7-1.2 9-5.6 9-11-4 0-7.8-1.6-9-7z"/>
                </svg>
                Sonnet 4.6
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <button
                className="me-agent-send"
                disabled={!chatInput.trim()}
                onClick={handleSend}
                title="Send"
              >
                <PaperPlaneRight size={14} weight="fill" />
              </button>
            </div>
          </div>
          </div>{/* end me-chat-card */}
        </aside>

        {/* ── Right side: content row + timeline ── */}
        <div className="me-body-right">

          {/* Content row: layers + canvas + inspector */}
          <div className="me-body-content">

            {/* Layers Panel */}
            <aside className="me-layers-panel" style={{ width: leftPanelW }}>
              <div className="me-panel-tabs me-layers-tabs">
                {(['Layers', 'Assets', 'Audio'] as PanelTab[]).map(t => (
                  <button
                    key={t}
                    className={`me-panel-tab${panelTab === t ? ' active' : ''}`}
                    onClick={() => setPanelTab(t)}
                  >{t}</button>
                ))}
              </div>
              {panelTab === 'Layers' && (() => {
                const sceneLayers = activeScene === 1
                  ? [{ id: 'rect-yfer4o', icon: '▭', label: 'rect-yfer4o' }, { id: 'circle-m4n8x', icon: '○', label: 'circle-m4n8x' }]
                  : [{ id: 'text-b2r5w',  icon: 'T', label: 'text-b2r5w'  }]
                return (
                  <div className="me-layers-list">
                    {sceneLayers.map(layer => (
                      <button
                        key={layer.id}
                        className={`me-layer-item${selectedLayerId === layer.id ? ' me-layer-item--selected' : ''}`}
                        onClick={() => setSelectedLayerId(layer.id)}
                      >
                        <CaretRight size={10} style={{ opacity: 0.4, flexShrink: 0 }} />
                        <span className="me-layer-item-icon">{layer.icon}</span>
                        <span className="me-layer-item-name">{layer.label}</span>
                      </button>
                    ))}
                  </div>
                )
              })()}
              {panelTab === 'Assets' && (
                <div className="me-assets-panel">
                  <div className="me-assets-toolbar">
                    {assetSearchOpen ? (
                      <div className="me-assets-search-bar">
                        <MagnifyingGlass size={13} className="me-assets-search-ico" />
                        <input
                          className="me-assets-search-input"
                          placeholder="Search assets…"
                          value={assetSearch}
                          onChange={e => setAssetSearch(e.target.value)}
                          autoFocus
                        />
                        <button className="me-tl-tool-btn" onClick={() => { setAssetSearchOpen(false); setAssetSearch('') }}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button className="me-assets-import-btn">
                          <Plus size={12} weight="bold" /> Upload
                        </button>
                        <div className="me-assets-toolbar-right">
                          <button className="me-tl-tool-btn me-tooltip" data-tooltip="Generate Image" style={{ color: '#f5c518' }} onClick={() => setGenerateOpen(true)}>
                            <Sparkle size={15} />
                          </button>
                          <button className="me-tl-tool-btn me-tooltip" data-tooltip="Search" onClick={() => setAssetSearchOpen(true)}>
                            <MagnifyingGlass size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Generate Image modal */}
                  {generateOpen && (
                    <div className="me-generate-modal">
                      <textarea
                        className="me-generate-textarea"
                        placeholder="Describe the image to generate…"
                        value={generatePrompt}
                        onChange={e => setGeneratePrompt(e.target.value)}
                        autoFocus
                      />
                      <div className="me-generate-actions">
                        <button className="me-generate-cancel" onClick={() => { setGenerateOpen(false); setGeneratePrompt('') }}>Cancel</button>
                        <button className="me-generate-submit">
                          <Sparkle size={14} /> Generate
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="me-assets-grid-2">
                    {[
                      { emoji: '🖼', name: 'hero-image.png' },
                      { emoji: '🎬', name: 'intro-clip.mp4' },
                      { emoji: '🎨', name: 'brand-kit.ai' },
                      { emoji: '📸', name: 'product-shot.jpg' },
                      { emoji: '🎞', name: 'b-roll.mov' },
                      { emoji: '🖌', name: 'overlay.svg' },
                    ].map((a, i) => (
                      <div key={i} className="me-asset-card">
                        <div className="me-asset-preview">{a.emoji}</div>
                        <span className="me-asset-name">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {panelTab === 'Audio' && (
                <div className="me-audio-list">
                  {[{ name: 'Narration', dur: '0:12' }, { name: 'BG Music', dur: '0:30' }].map(a => (
                    <div key={a.name} className="me-audio-item">
                      <div className="me-audio-icon"><SpeakerHigh size={14} /></div>
                      <div>
                        <div className="me-audio-name">{a.name}</div>
                        <div className="me-audio-dur">{a.dur}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>

            <div className="me-panel-resize-handle" onMouseDown={e => handlePanelResizeDown(e, 'left')} />

            {/* Canvas */}
            <main className="me-canvas-area">
              {/* Canvas tool strip */}
              <div className="me-canvas-tools">
                <button className="me-canvas-tool-btn"><TextT size={13} weight="bold" /> Text</button>
                <div className="me-shapes-menu">
                  <button
                    className="me-canvas-tool-btn"
                    onClick={() => setShapesOpen(o => !o)}
                  >
                    <Rectangle size={13} weight="bold" /> Shapes
                    <CaretRight size={10} style={{ opacity: 0.5, transform: shapesOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .15s', marginLeft: 2 }} />
                  </button>
                  {shapesOpen && (
                    <div className="me-shapes-dropdown">
                      <button className="me-shapes-option" onClick={() => setShapesOpen(false)}><Rectangle size={13} weight="bold" /> Rectangle</button>
                      <button className="me-shapes-option" onClick={() => setShapesOpen(false)}><Circle size={13} weight="bold" /> Ellipse</button>
                      <button className="me-shapes-option" onClick={() => setShapesOpen(false)}><Star size={13} weight="fill" /> Star</button>
                    </div>
                  )}
                </div>
                <div className="me-shapes-menu">
                  <button
                    className="me-canvas-tool-btn"
                    onClick={() => { setIconMenuOpen(o => !o); setIconSearch('') }}
                  >
                    <SquaresFour size={13} weight="bold" /> Icon <CaretRight size={10} />
                  </button>
                  {iconMenuOpen && (
                    <div className="me-icon-picker">
                      <input
                        className="me-icon-search"
                        placeholder="Search icons…"
                        value={iconSearch}
                        onChange={e => setIconSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="me-icon-grid">
                        {ICON_LIBRARY
                          .filter(i => i.name.toLowerCase().includes(iconSearch.toLowerCase()))
                          .map(i => (
                            <button
                              key={i.name}
                              className="me-icon-cell"
                              title={i.name}
                              onClick={() => setIconMenuOpen(false)}
                            >
                              <span className="me-icon-cell-emoji">{i.emoji}</span>
                              <span className="me-icon-cell-label">{i.name}</span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="me-canvas-bg" ref={canvasBgRef} onWheel={handleCanvasWheel}>
                <div
                  className={`me-canvas-scene-card${activeScene === 1 ? ' active' : ''}`}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <span className="me-canvas-scene-label">Scene {activeScene}</span>
                  <span className="me-canvas-scene-hint">
                    {activeScene === 1 ? '0:00 – 0:03.92' : '0:03.92 – 0:12.72'}
                  </span>
                </div>
              </div>

              {/* Canvas footer toolbar */}
              <div className="me-canvas-footer">
                {/* Left: play + loop */}
                <div className="me-canvas-footer-left">
                  <button
                    className="me-play-btn"
                    onClick={() => setIsPlaying(p => !p)}
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                  </button>
                  <ArrowsClockwise
                    size={17}
                    className="me-footer-icon"
                    style={isLooping ? { color: '#f5c518' } : undefined}
                    onClick={() => setIsLooping(l => !l)}
                  />
                  <span className="me-footer-speed">1x</span>
                </div>
                {/* Center: timecode */}
                <div className="me-canvas-footer-center">
                  <span className="me-timecode-current">{formatTime(timeMs)}</span>
                  <span className="me-timecode-sep">/</span>
                  <span className="me-timecode-total">{formatTime(totalMs)}</span>
                </div>
                {/* Right: zoom + mute + fullscreen */}
                <div className="me-canvas-footer-right">
                  <button className="me-zoom-btn" onClick={() => setZoom(z => Math.max(10, z - 10))}>−</button>
                  <button className="me-zoom-btn me-zoom-pct" onClick={() => setZoom(100)}>{zoom}%</button>
                  <button className="me-zoom-btn" onClick={() => setZoom(z => Math.min(400, z + 10))}>+</button>
                  <div className="me-canvas-footer-divider" />
                  {isMuted
                    ? <SpeakerSimpleSlash size={17} className="me-footer-icon" style={{ color: '#f5c518' }} onClick={() => setIsMuted(false)} />
                    : <SpeakerSimpleHigh size={17} className="me-footer-icon" onClick={() => setIsMuted(true)} />
                  }
                  <CornersOut size={17} className="me-footer-icon" aria-label="Fullscreen" />
                </div>
              </div>
            </main>

            <div className="me-panel-resize-handle" onMouseDown={e => handlePanelResizeDown(e, 'right')} />

            {/* Inspector */}
            <aside className="me-inspector" style={{ width: rightPanelW }}>
              {/* Mode toggle */}
              <div className="me-inspector-mode-toggle">
                {(['Design', 'Animate'] as const).map(m => (
                  <button
                    key={m}
                    className={`me-mode-btn${mode === m ? ' active' : ''}`}
                    onClick={() => setMode(m)}
                  >{m}</button>
                ))}
              </div>
              {mode === 'Animate' ? (
                <div className="me-anim-panel">
                  {/* Sub-tabs */}
                  <div className="me-anim-subtabs">
                    <button className={`me-anim-subtab${animTab === 'transform' ? ' me-anim-subtab--active' : ''}`} onClick={() => setAnimTab('transform')}>Transform</button>
                    <button className={`me-anim-subtab${animTab === 'animation' ? ' me-anim-subtab--active' : ''}`} onClick={() => setAnimTab('animation')}>Animation</button>
                  </div>

                  {/* Layer identity row */}
                  <div className="me-anim-layer-row">
                    <span className="me-anim-layer-type-pill">Object</span>
                    <span className="me-anim-layer-name">rect-yfer4o</span>
                  </div>

                  {animTab === 'animation' ? (
                    <div className="me-anim-library">
                      {/* Search */}
                      <div className="me-anim-search-wrap">
                        <MagnifyingGlass size={12} style={{ color: 'rgba(255,255,255,0.35)', flex: 'none' }} />
                        <input
                          className="me-anim-search-input"
                          placeholder="Search animations…"
                          value={animSearch}
                          onChange={e => setAnimSearch(e.target.value)}
                        />
                      </div>
                      {/* Filter pills */}
                      <div className="me-anim-filters">
                        {ANIM_FILTERS.map(f => (
                          <button key={f} className={`me-anim-filter-btn${animFilter === f ? ' me-anim-filter-btn--active' : ''}`} onClick={() => setAnimFilter(f)}>{f}</button>
                        ))}
                      </div>
                      {/* Grid */}
                      <div className="me-anim-grid">
                        {ANIM_PRESETS.filter(p => p.name.toLowerCase().includes(animSearch.toLowerCase())).map(p => (
                          <button key={p.name} className="me-anim-cell">
                            <div className="me-anim-thumb">{p.emoji}</div>
                            <span className="me-anim-cell-name">{p.name}</span>
                          </button>
                        ))}
                      </div>
                      {/* Duration */}
                      <div className="me-anim-duration-bar">
                        <span className="me-anim-duration-label">Duration</span>
                        <div className="me-anim-duration-field">
                          <span>{animDuration.toFixed(1)}s</span>
                          <div className="me-anim-duration-stepper">
                            <button onClick={() => setAnimDuration(d => Math.min(10, +(d + 0.1).toFixed(1)))}>▲</button>
                            <button onClick={() => setAnimDuration(d => Math.max(0.1, +(d - 0.1).toFixed(1)))}>▼</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Keyframes */}
                      <div className="me-anim-kf-icon-row">
                        <span className="me-anim-section-title" style={{ marginRight: 'auto' }}>Keyframes</span>
                        <button className={`me-tl-tool-btn me-tooltip${atKf ? ' me-kf-btn--active' : ''}`} data-tooltip="Copy Keyframe" disabled={!atKf}><Copy size={14} /></button>
                        <button className="me-tl-tool-btn me-tooltip" data-tooltip="Paste Keyframe"><ClipboardText size={14} /></button>
                        <button className={`me-tl-tool-btn me-tooltip${atKf ? ' me-kf-btn--active' : ''}`} data-tooltip="Delete Keyframe" disabled={!atKf}><Trash size={14} /></button>
                      </div>

                      {/* Transform */}
                      <div className="me-anim-section me-anim-section--transform">
                        <div className="me-anim-section-head" style={{ cursor: 'pointer' }} onClick={() => setTransformOpen(o => !o)}>
                          <span className="me-anim-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            Transform
                            <button className={`me-anim-kf-diamond${atKf ? ' me-anim-kf-diamond--active' : ''}`} title="Add keyframe" onClick={e => e.stopPropagation()} style={{ fontSize: 18, lineHeight: 1 }}>◇</button>
                          </span>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.5, transition: 'transform .15s', transform: transformOpen ? 'rotate(90deg)' : 'rotate(0deg)', flex: 'none' }}>
                            <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        </div>
                        {transformOpen && <>
                          <div className="me-anim-row">
                            <span className="me-anim-row-label">Position</span>
                            <div className="me-anim-row-fields">
                              <div className="me-anim-field"><span className="me-anim-field-axis">X</span><span className="me-anim-field-val">0</span></div>
                              <button className={`me-anim-diamond${xAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('x', 0)}>◇</button>
                              <div className="me-anim-field"><span className="me-anim-field-axis">Y</span><span className="me-anim-field-val">0</span></div>
                              <button className={`me-anim-diamond${yAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('y', 0)}>◇</button>
                            </div>
                          </div>
                          <div className="me-anim-row me-anim-row--col">
                            <span className="me-anim-row-label">Scale</span>
                            <div className="me-anim-scale-row">
                              <input type="range" className="me-anim-slider" min={0} max={400} defaultValue={100} />
                              <div className="me-anim-field me-anim-field--narrow"><span className="me-anim-field-val">100%</span></div>
                              <div className="me-anim-duration-stepper"><button>▲</button><button>▼</button></div>
                              <button className={`me-anim-diamond${scaleAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('scale', 100)}>◇</button>
                            </div>
                          </div>
                          <div className="me-anim-row">
                            <span className="me-anim-row-label">Rotation</span>
                            <div className="me-anim-row-fields">
                              <div className="me-anim-field me-anim-field--wide"><span className="me-anim-field-val">0°</span></div>
                              <button className={`me-anim-diamond${rotAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('rotation', 0)}>◇</button>
                            </div>
                          </div>
                          <div className="me-anim-row me-anim-row--col">
                            <span className="me-anim-row-label">Opacity</span>
                            <div className="me-anim-scale-row">
                              <input type="range" className="me-anim-slider" min={0} max={100} defaultValue={100} />
                              <div className="me-anim-field me-anim-field--narrow"><span className="me-anim-field-val">100%</span></div>
                              <div className="me-anim-duration-stepper"><button>▲</button><button>▼</button></div>
                              <button className={`me-anim-diamond${opacAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('opacity', 100)}>◇</button>
                            </div>
                          </div>
                        </>}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="me-inspector-empty">Select a layer to inspect.</div>
              )}
            </aside>

          </div>{/* end me-body-content */}

          {/* ── Timeline — spans full width of right area ── */}
          {mode === 'Animate' && (
          <div className="me-timeline" style={{ height: tlHeight }}>

            {/* ── Resize handle ── */}
            <div className="me-timeline-resize-handle" onMouseDown={handleTlResizeDown} />

            {/* ── Timeline toolbar ── */}
            <div className="me-timeline-toolbar">
              {/* Left: editing tools */}
              <div className="me-tl-toolbar-left">
                <div className="me-kf-menu-wrap">
                  <button
                    className="me-tl-tool-btn me-kf-trigger"
                    onClick={() => setKfMenuOpen(o => !o)}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5L12.5 7 7 12.5 1.5 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.5 }}>
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>
                  {kfMenuOpen && (
                    <div className="me-kf-dropdown">
                      <button className="me-kf-dropdown-item" onClick={() => setKfMenuOpen(false)}>
                        <Copy size={13} /> Copy Keyframe
                      </button>
                      <button className="me-kf-dropdown-item" onClick={() => setKfMenuOpen(false)}>
                        <ClipboardText size={13} /> Paste Keyframe
                      </button>
                    </div>
                  )}
                </div>
                <div className="me-tl-toolbar-sep" />
                <button className="me-tl-tool-btn me-tooltip" data-tooltip="Undo (⌘Z)"><ArrowCounterClockwise size={15} /></button>
                <button className="me-tl-tool-btn me-tooltip" data-tooltip="Redo (⌘⇧Z)"><ArrowClockwise size={15} /></button>
                <div className="me-tl-toolbar-sep" />
                <button className="me-tl-tool-btn me-tooltip" data-tooltip="Delete"><Trash size={16} /></button>
              </div>
              {/* Right: zoom controls */}
              <div className="me-tl-toolbar-right">
                <button className="me-tl-tool-btn me-tooltip" data-tooltip="Fit timeline (⇧+Z)" onClick={() => setTlZoom(100)}><Scan size={16} /></button>
                <button className="me-tl-tool-btn me-tooltip" data-tooltip="Zoom out" onClick={() => setTlZoom(z => Math.max(25, z - 25))}><MagnifyingGlassMinus size={16} /></button>
                <input
                  type="range"
                  className="me-tl-zoom-slider"
                  min={25}
                  max={400}
                  step={25}
                  value={tlZoom}
                  onChange={e => setTlZoom(Number(e.target.value))}
                />
                <button className="me-tl-tool-btn me-tooltip" data-tooltip="Zoom in" onClick={() => setTlZoom(z => Math.min(400, z + 25))}><MagnifyingGlassPlus size={16} /></button>
              </div>
            </div>

            {/* Tracks */}
            <div className="me-timeline-tracks" ref={timelineRef} onWheel={handleTimelineWheel}>
              <div className="me-timeline-inner" style={{ width: `${Math.max(100, tlZoom)}%` }} onClick={handleTimelineClick}>

                {/* Ruler */}
                <div className="me-ruler">
                  <div className="me-ruler-gutter" />
                  <div className="me-ruler-marks">
                    {Array.from({ length: 13 }, (_, s) => (
                      <div key={s} className="me-ruler-mark" style={{ left: `${(s / (totalMs / 1000)) * 100}%` }}>
                        {s}s
                      </div>
                    ))}
                  </div>
                </div>

                {/* Playhead — percentage-based within inner */}
                <div
                  className="me-playhead"
                  style={{ left: `calc(220px + ${(timeMs / totalMs) * 100}% - ${(timeMs / totalMs) * 220}px)` }}
                />

                {/* Narration row */}
                <div className="me-track-row me-track-row--tall">
                  <div className="me-track-label"><MusicNote size={11} /> Narration</div>
                  <div className="me-track-content">
                    <div className="me-waveform-seg" style={{ flex: 3920 }}>
                      {WAVEFORM_HEIGHTS.slice(0, 38).map((h, i) => (
                        <div key={i} className="me-waveform-bar"
                          style={{ height: `${h}px`, opacity: i / 38 < timeMs / 3920 ? 1 : 0.45 }} />
                      ))}
                    </div>
                    <div className="me-waveform-seg" style={{ flex: 4720 }}>
                      {WAVEFORM_HEIGHTS.slice(38).map((h, i) => (
                        <div key={i} className="me-waveform-bar"
                          style={{ height: `${h}px`, opacity: timeMs > 3920 ? (i / 35 < (timeMs - 3920) / 4720 ? 1 : 0.45) : 0.45 }} />
                      ))}
                    </div>
                    <div style={{ flex: 12720 - 3920 - 4720 }} />
                  </div>
                </div>

                {/* Scenes row */}
                <div className="me-track-row me-track-row--tall">
                  <div className="me-track-label"><FilmStrip size={12} weight="fill" style={{ color: '#f5c518', flexShrink: 0 }} /> Scenes</div>
                  <div className="me-track-content">
                    <div
                      className={`me-scene-strip me-scene-strip--1${activeScene === 1 ? ' active' : ''}`}
                      style={{ flex: 3920 }}
                      onClick={() => handleSceneClick(1)}
                    >
                      <span className="me-scene-strip-name">Scene 1</span>
                      <span className="me-scene-strip-dur">0:03.92</span>
                    </div>
                    <div
                      className={`me-scene-strip me-scene-strip--2${activeScene === 2 ? ' active' : ''}`}
                      style={{ flex: 4720 }}
                      onClick={() => handleSceneClick(2)}
                    >
                      <span className="me-scene-strip-name">Scene 2</span>
                      <span className="me-scene-strip-dur">0:04.72</span>
                    </div>
                    <div style={{ flex: 12720 - 3920 - 4720 }} />
                  </div>
                </div>

                {/* Object track row — only visible in Scene 1 */}
                {activeScene === 1 && (() => {
                  const layerStart = 0
                  const layerEnd   = 3920
                  const stripLeft = `${(layerStart / totalMs) * 100}%`
                  const stripWidth = `${((layerEnd - layerStart) / totalMs) * 100}%`
                  return (
                    <>
                      <div className="me-track-row">
                        <div className="me-track-label">
                          <button
                            className="me-tl-tool-btn"
                            style={{ width: 20, height: 20, flexShrink: 0 }}
                            onClick={e => { e.stopPropagation(); setLayersExpanded(p => ({ ...p, 'rect-yfer4o': !p['rect-yfer4o'] })) }}
                            title={layersExpanded['rect-yfer4o'] ? 'Collapse' : 'Expand'}
                          >
                            <CaretRight size={10} style={{ transform: layersExpanded['rect-yfer4o'] ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
                          </button>
                          <span>rect-yfer4o</span>
                        </div>
                        <div className="me-track-content" style={{ position: 'relative' }}>
                          <div className="me-layer-strip" style={{ left: stripLeft, width: stripWidth }} />
                          {[...new Set(Object.values(selectedLayerKfs).flat().map(k => k.timeMs))].map(t => (
                            <div key={t} className="me-kf-dot" style={{ left: `${(t / totalMs) * 100}%` }} />
                          ))}
                        </div>
                      </div>

                      {/* Property tracks — grouped */}
                      {layersExpanded['rect-yfer4o'] && ([
                        { label: 'Position', rows: [{ prop: 'x' as const, axis: 'X', defaultVal: 0, display: '0' }, { prop: 'y' as const, axis: 'Y', defaultVal: 0, display: '0' }] },
                        { label: 'Scale',    rows: [{ prop: 'scale' as const, axis: '', defaultVal: 100, display: '100%' }] },
                        { label: 'Rotation', rows: [{ prop: 'rotation' as const, axis: '', defaultVal: 0, display: '0°' }] },
                        { label: 'Opacity',  rows: [{ prop: 'opacity' as const, axis: '', defaultVal: 100, display: '100%' }] },
                      ]).flatMap(group =>
                        group.rows.map((row, ri) => {
                          const kfs = selectedLayerKfs[row.prop] ?? []
                          const active = hasKfAt(selectedLayerKfs, row.prop, timeMs)
                          return (
                            <div key={row.prop} className="me-track-row me-prop-track-row">
                              <div className="me-track-label me-prop-track-label">
                                <span className="me-prop-group-name">{ri === 0 ? group.label : ''}</span>
                                {row.axis && <span className="me-prop-axis">{row.axis}</span>}
                                <span className="me-prop-track-val">{row.display}</span>
                                <button
                                  className={`me-prop-kf-btn${active ? ' me-prop-kf-btn--active' : ''}`}
                                  onClick={e => { e.stopPropagation(); toggleKf(row.prop, row.defaultVal) }}
                                  title="Toggle keyframe"
                                >◇</button>
                              </div>
                              <div className="me-track-content" style={{ position: 'relative' }}>
                                <div className="me-layer-strip me-layer-strip--prop" style={{ left: stripLeft, width: stripWidth }} />
                                {kfs.length >= 2 && (
                                  <div className="me-kf-line" style={{
                                    left: `${(kfs[0].timeMs / totalMs) * 100}%`,
                                    width: `${((kfs[kfs.length - 1].timeMs - kfs[0].timeMs) / totalMs) * 100}%`,
                                  }} />
                                )}
                                {kfs.map(kf => (
                                  <div key={kf.timeMs} className="me-kf-dot"
                                    style={{ left: `${(kf.timeMs / totalMs) * 100}%` }}
                                    onClick={e => { e.stopPropagation(); setTimeMs(kf.timeMs) }}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </>
                  )
                })()}

                {/* Extra shapes — each toggleable */}
                {([
                  activeScene === 1 && { id: 'circle-m4n8x', left: '0%',                              width: `${(3920 / totalMs) * 100}%` },
                  activeScene === 2 && { id: 'text-b2r5w',   left: `${(3920 / totalMs) * 100}%`,      width: `${(4720 / totalMs) * 100}%` },
                ].filter(Boolean) as { id: string; left: string; width: string }[]).map(layer => (
                  <Fragment key={layer.id}>
                    <div className="me-track-row">
                      <div className="me-track-label">
                        <button
                          className="me-tl-tool-btn"
                          style={{ width: 20, height: 20, flexShrink: 0 }}
                          onClick={e => { e.stopPropagation(); setLayersExpanded(p => ({ ...p, [layer.id]: !p[layer.id] })) }}
                          title={layersExpanded[layer.id] ? 'Collapse' : 'Expand'}
                        >
                          <CaretRight size={10} style={{ transform: layersExpanded[layer.id] ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
                        </button>
                        <span>{layer.id}</span>
                      </div>
                      <div className="me-track-content" style={{ position: 'relative' }}>
                        <div className="me-layer-strip" style={{ left: layer.left, width: layer.width }} />
                      </div>
                    </div>
                    {layersExpanded[layer.id] && ([
                      { label: 'Position', rows: [{ prop: 'x', axis: 'X', display: '0' }, { prop: 'y', axis: 'Y', display: '0' }] },
                      { label: 'Scale',    rows: [{ prop: 'scale', axis: '', display: '100%' }] },
                      { label: 'Rotation', rows: [{ prop: 'rotation', axis: '', display: '0°' }] },
                      { label: 'Opacity',  rows: [{ prop: 'opacity', axis: '', display: '100%' }] },
                    ]).flatMap(group =>
                      group.rows.map((row, ri) => (
                        <div key={`${layer.id}-${row.prop}`} className="me-track-row me-prop-track-row">
                          <div className="me-track-label me-prop-track-label">
                            <span className="me-prop-group-name">{ri === 0 ? group.label : ''}</span>
                            {row.axis && <span className="me-prop-axis">{row.axis}</span>}
                            <span className="me-prop-track-val">{row.display}</span>
                            <span className="me-prop-kf-btn" style={{ color: 'rgba(255,255,255,0.2)' }}>◇</span>
                          </div>
                          <div className="me-track-content" style={{ position: 'relative' }}>
                            <div className="me-layer-strip me-layer-strip--prop" style={{ left: layer.left, width: layer.width }} />
                          </div>
                        </div>
                      ))
                    )}
                  </Fragment>
                ))}

              </div>{/* end me-timeline-inner */}
            </div>
          </div>
          )}

        </div>{/* end me-body-right */}
      </div>{/* end me-body */}

      {/* ── Versions overlay ── */}
      {showVersions && (
        <div className="me-versions-overlay">
          <div className="me-versions-backdrop" onClick={() => setShowVersions(false)} />
          <div className="me-versions-panel">
            <div className="me-versions-panel-header">
              Version History
              <button className="me-versions-panel-close" onClick={() => setShowVersions(false)}>×</button>
            </div>
            {VERSION_HISTORY.map(v => (
              <div key={v.id} className={`me-version-item${v.current ? ' me-version-item--current' : ''}`}>
                <div className="me-version-dot" />
                <div className="me-version-info">
                  <div className="me-version-label">{v.label}</div>
                  <div className="me-version-time">{v.time}</div>
                </div>
                {!v.current && <button className="me-version-restore">Restore</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Export modal ── */}
      {showExport && (
        <div className="me-export-overlay" onClick={() => setShowExport(false)}>
          <div className="me-export-modal" onClick={e => e.stopPropagation()}>
            <div className="me-export-modal-header">
              <span className="me-export-modal-title">Export Video</span>
              <button className="me-export-modal-close" onClick={() => setShowExport(false)}>×</button>
            </div>
            <div className="me-export-format-list">
              {([
                { id: 'mp4',  icon: '🎬', name: 'MP4 Video',    desc: 'Best for sharing and uploading' },
                { id: 'gif',  icon: '🖼',  name: 'Animated GIF', desc: 'Loops, works everywhere' },
                { id: 'webm', icon: '🌐', name: 'WebM',          desc: 'Optimised for the web' },
              ] as const).map(f => (
                <button
                  key={f.id}
                  className={`me-export-format-btn${exportFormat === f.id ? ' selected' : ''}`}
                  onClick={() => setExportFormat(f.id)}
                >
                  <div className="me-export-format-icon">{f.icon}</div>
                  <div>
                    <div className="me-export-format-name">{f.name}</div>
                    <div className="me-export-format-desc">{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="me-export-modal-footer">
              <button className="me-export-cancel" onClick={() => setShowExport(false)}>Cancel</button>
              <button className="me-export-confirm" onClick={() => setShowExport(false)}>
                Export as {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
