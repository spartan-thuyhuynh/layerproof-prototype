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
  genChecklist?: boolean
}

interface ToolCall {
  id: number
  name: string
  status: 'success' | 'error'
  detail: string
}

/* ── Initial chat state ── */
const INITIAL_MESSAGES: ChatMessage[] = []

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

const GEN_STEPS = [
  'Analyzing content structure…',
  'Generating scene compositions…',
  'Applying motion transitions…',
  'Syncing narration timeline…',
  'Rendering keyframe animations…',
  'Finalizing export settings…',
]

const GEN_TIPS = [
  'Edit text, shapes, and images directly on the canvas in real time',
  'Adjust narration volume, speed, and fade directly in the timeline',
  'Keyframe any layer property: position, opacity, scale, and more',
]

const GEN_TIP_SVGS = [
  /* Tip 0 — canvas editing: text cursor + selected element on canvas */
  <svg key={0} className="me-gen-preview-svg" viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="520" height="220" fill="#0e0e12"/>
    {/* topbar */}
    <rect width="520" height="30" fill="#16161a"/>
    <rect x="10" y="9" width="44" height="12" rx="3" fill="#2a2a32"/>
    <rect x="58" y="9" width="44" height="12" rx="3" fill="#2a2a32"/>
    <rect x="106" y="9" width="44" height="12" rx="3" fill="#2a2a32"/>
    <rect x="432" y="7" width="78" height="16" rx="8" fill="#f5c518"/>
    {/* left panel */}
    <rect x="0" y="30" width="90" height="130" fill="#13131a"/>
    <rect x="8" y="38" width="32" height="8" rx="2" fill="#f5c518" opacity="0.8"/>
    <rect x="44" y="38" width="24" height="8" rx="2" fill="#2a2a32"/>
    <rect x="8" y="52" width="74" height="6" rx="2" fill="#222230"/>
    <rect x="8" y="62" width="60" height="6" rx="2" fill="#1e1e28"/>
    <rect x="8" y="72" width="68" height="6" rx="2" fill="#1e1e28"/>
    <rect x="8" y="82" width="55" height="6" rx="2" fill="#1e1e28"/>
    {/* canvas area */}
    <rect x="90" y="30" width="340" height="130" fill="#181820"/>
    {/* selected text element */}
    <rect x="155" y="65" width="210" height="62" rx="4" fill="none" stroke="#f5c518" strokeWidth="1.5" strokeDasharray="4 2"/>
    <rect x="152" y="62" width="7" height="7" rx="1.5" fill="#f5c518"/>
    <rect x="359" y="62" width="7" height="7" rx="1.5" fill="#f5c518"/>
    <rect x="152" y="119" width="7" height="7" rx="1.5" fill="#f5c518"/>
    <rect x="359" y="119" width="7" height="7" rx="1.5" fill="#f5c518"/>
    {/* text lines inside element */}
    <rect x="168" y="79" width="120" height="8" rx="2" fill="rgba(255,255,255,0.7)"/>
    <rect x="168" y="92" width="90" height="6" rx="2" fill="rgba(255,255,255,0.35)"/>
    <rect x="168" y="104" width="105" height="6" rx="2" fill="rgba(255,255,255,0.35)"/>
    {/* blinking cursor */}
    <rect x="290" y="79" width="2" height="10" rx="1" fill="#f5c518" opacity="0.9"/>
    {/* right panel */}
    <rect x="430" y="30" width="90" height="130" fill="#13131a"/>
    <rect x="438" y="38" width="30" height="6" rx="2" fill="#2a2a32"/>
    <rect x="438" y="50" width="72" height="5" rx="2" fill="#1e1e28"/>
    <rect x="438" y="60" width="72" height="5" rx="2" fill="#1e1e28"/>
    <rect x="438" y="74" width="50" height="5" rx="2" fill="#f5c518" opacity="0.3"/>
    <rect x="438" y="84" width="72" height="5" rx="2" fill="#1e1e28"/>
    {/* timeline */}
    <rect x="0" y="160" width="520" height="60" fill="#111118"/>
    <rect x="0" y="160" width="520" height="1" fill="#222230"/>
    <rect x="8" y="168" width="60" height="6" rx="2" fill="#2a2a32"/>
    <rect x="74" y="168" width="130" height="6" rx="3" fill="#3b3b6a" opacity="0.8"/>
    <rect x="210" y="168" width="110" height="6" rx="3" fill="#3b3b6a" opacity="0.6"/>
  </svg>,

  /* Tip 1 — narration track: audio waveform synced to scenes */
  <svg key={1} className="me-gen-preview-svg" viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="520" height="220" fill="#0e0e12"/>
    <rect width="520" height="30" fill="#16161a"/>
    <rect x="10" y="9" width="44" height="12" rx="3" fill="#2a2a32"/>
    <rect x="58" y="9" width="44" height="12" rx="3" fill="#2a2a32"/>
    <rect x="432" y="7" width="78" height="16" rx="8" fill="#f5c518"/>
    {/* canvas preview */}
    <rect x="0" y="30" width="520" height="100" fill="#181820"/>
    {/* scene blocks in canvas */}
    <rect x="40" y="50" width="180" height="64" rx="6" fill="#1c1c28"/>
    <rect x="40" y="50" width="180" height="64" rx="6" stroke="#2a2a40" strokeWidth="1" fill="none"/>
    <rect x="56" y="62" width="70" height="40" rx="3" fill="#222235"/>
    <rect x="134" y="68" width="70" height="8" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="134" y="80" width="52" height="6" rx="2" fill="rgba(255,255,255,0.25)"/>
    <rect x="240" y="50" width="180" height="64" rx="6" fill="#1c1c28"/>
    <rect x="240" y="50" width="180" height="64" rx="6" stroke="#f5c518" strokeWidth="1.5" fill="none"/>
    <rect x="256" y="62" width="70" height="40" rx="3" fill="#222235"/>
    <rect x="334" y="68" width="70" height="8" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="334" y="80" width="52" height="6" rx="2" fill="rgba(255,255,255,0.25)"/>
    {/* timeline area */}
    <rect x="0" y="130" width="520" height="90" fill="#111118"/>
    <rect x="0" y="130" width="520" height="1" fill="#222230"/>
    {/* narration label */}
    <rect x="8" y="140" width="55" height="7" rx="2" fill="#2a2a32"/>
    {/* waveform bars — narration track */}
    {[78,82,70,88,92,76,84,90,68,86,94,72,80,88,66,84,78,90,74,86].map((h, i) => (
      <rect key={i} x={74 + i * 21} y={148 + (20 - h/5)} width="14" height={h/5} rx="2" fill={i < 8 ? '#3b3b6a' : '#f5c518'} opacity={i < 8 ? 0.8 : 0.5}/>
    ))}
    {/* playhead */}
    <rect x="240" y="130" width="2" height="90" fill="#f5c518" opacity="0.8"/>
    <polygon points="235,130 245,130 240,137" fill="#f5c518"/>
    {/* scene track */}
    <rect x="8" y="192" width="55" height="7" rx="2" fill="#2a2a32"/>
    <rect x="74" y="190" width="160" height="16" rx="3" fill="#2a2a40"/>
    <rect x="238" y="190" width="160" height="16" rx="3" fill="#f5c518" opacity="0.2"/>
    <rect x="238" y="190" width="160" height="16" rx="3" stroke="#f5c518" strokeWidth="1" fill="none"/>
  </svg>,

  /* Tip 2 — keyframes: timeline with keyframe diamonds and curves */
  <svg key={2} className="me-gen-preview-svg" viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
    <rect width="520" height="220" fill="#0e0e12"/>
    <rect width="520" height="30" fill="#16161a"/>
    <rect x="10" y="9" width="44" height="12" rx="3" fill="#2a2a32"/>
    <rect x="58" y="9" width="44" height="12" rx="3" fill="#2a2a32"/>
    <rect x="432" y="7" width="78" height="16" rx="8" fill="#f5c518"/>
    {/* canvas */}
    <rect x="0" y="30" width="520" height="80" fill="#181820"/>
    <rect x="160" y="40" width="200" height="60" rx="5" fill="#1c1c28" stroke="#2a2a40" strokeWidth="1"/>
    <rect x="175" y="50" width="80" height="10" rx="2" fill="rgba(255,255,255,0.6)"/>
    <rect x="175" y="65" width="120" height="7" rx="2" fill="rgba(255,255,255,0.25)"/>
    <rect x="175" y="76" width="95" height="7" rx="2" fill="rgba(255,255,255,0.25)"/>
    {/* selected layer highlight */}
    <rect x="160" y="40" width="200" height="60" rx="5" fill="none" stroke="#f5c518" strokeWidth="1.5"/>
    {/* timeline */}
    <rect x="0" y="110" width="520" height="110" fill="#111118"/>
    <rect x="0" y="110" width="520" height="1" fill="#222230"/>
    {/* time ruler ticks */}
    {[0,1,2,3,4,5,6,7,8].map(i => (
      <rect key={i} x={74 + i * 54} y="114" width="1" height="8" fill="#2a2a32"/>
    ))}
    {/* layer rows */}
    <rect x="8" y="126" width="55" height="7" rx="2" fill="#f5c518" opacity="0.6"/>
    <rect x="8" y="148" width="55" height="7" rx="2" fill="#2a2a32"/>
    <rect x="8" y="168" width="55" height="7" rx="2" fill="#2a2a32"/>
    {/* keyframe track row 1 — position */}
    <rect x="74" y="122" width="370" height="15" rx="3" fill="#1c1c28"/>
    {/* keyframe diamonds */}
    {[128, 200, 290, 380].map(x => (
      <polygon key={x} points={`${x},126 ${x+5},130 ${x},134 ${x-5},130`} fill="#f5c518"/>
    ))}
    {/* easing curve between first two */}
    <path d="M133 130 C155 120, 178 140, 200 130" stroke="#f5c518" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <path d="M205 130 C230 118, 265 142, 290 130" stroke="#f5c518" strokeWidth="1.5" fill="none" opacity="0.5"/>
    <path d="M295 130 C320 120, 355 140, 380 130" stroke="#f5c518" strokeWidth="1.5" fill="none" opacity="0.5"/>
    {/* row 2 — opacity */}
    <rect x="74" y="144" width="370" height="15" rx="3" fill="#1c1c28"/>
    {[155, 290].map(x => (
      <polygon key={x} points={`${x},148 ${x+5},152 ${x},156 ${x-5},152`} fill="rgba(255,255,255,0.4)"/>
    ))}
    <path d="M160 152 C200 144, 250 160, 290 152" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none"/>
    {/* row 3 — scale */}
    <rect x="74" y="164" width="370" height="15" rx="3" fill="#1c1c28"/>
    {[200, 350].map(x => (
      <polygon key={x} points={`${x},168 ${x+5},172 ${x},176 ${x-5},172`} fill="rgba(255,255,255,0.4)"/>
    ))}
    {/* playhead */}
    <rect x="200" y="110" width="2" height="110" fill="#f5c518" opacity="0.7"/>
    <polygon points="195,110 205,110 200,118" fill="#f5c518"/>
  </svg>,
]

const base = import.meta.env.BASE_URL

export function MotionEditor() {
  const navigate = useNavigate()

  /* Generating state */
  const [isGenerating, setIsGenerating] = useState(true)
  const [genProgress, setGenProgress]   = useState(0)
  const [genStep, setGenStep]           = useState(0)
  const [tipIndex, setTipIndex]         = useState(0)

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
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [audioGroupOpen, setAudioGroupOpen] = useState(true)
  const [scenesGroupOpen, setScenesGroupOpen] = useState(true)
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null)
  const [audioVolume, setAudioVolume]         = useState(80)
  const [audioFadeIn, setAudioFadeIn]         = useState(0.0)
  const [audioFadeOut, setAudioFadeOut]       = useState(0.0)
  const [audioSpeed, setAudioSpeed]           = useState(1.0)
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
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [canvasBgColor, setCanvasBgColor] = useState('#0e0e1a')
  const [canvasAspect, setCanvasAspect] = useState('16:9')
  const [sceneDuration, setSceneDuration] = useState(12.72)
  const [tlHeight, setTlHeight]           = useState(380)
  const [leftPanelW, setLeftPanelW]       = useState(200)
  const [rightPanelW, setRightPanelW]     = useState(290)
  const [chatW, setChatW]                 = useState(340)
  const msgEndRef      = useRef<HTMLDivElement>(null)
  const playRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextMsgId      = useRef(100)
  const canvasBgRef    = useRef<HTMLDivElement>(null)
  const timelineRef    = useRef<HTMLDivElement>(null)
  const tlResizeRef    = useRef<{ startY: number; startH: number } | null>(null)
  const scrubbingRef   = useRef(false)
  const tlInnerRef     = useRef<HTMLDivElement>(null)
  const panelResizeRef = useRef<{ startX: number; startW: number; side: 'left' | 'right' } | null>(null)
  const chatResizeRef  = useRef<{ startX: number; startW: number } | null>(null)
  const footerRef      = useRef<HTMLDivElement>(null)
  const zoomMenuRef    = useRef<HTMLDivElement>(null)
  const [footerWidth, setFooterWidth] = useState(9999)
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false)

  function handleChatResizeDown(e: React.MouseEvent) {
    e.preventDefault()
    chatResizeRef.current = { startX: e.clientX, startW: chatW }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    function onMove(ev: MouseEvent) {
      if (!chatResizeRef.current) return
      const delta = ev.clientX - chatResizeRef.current.startX
      setChatW(Math.max(260, Math.min(520, chatResizeRef.current.startW + delta)))
    }
    function onUp() {
      chatResizeRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

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

  /* Generating timers */
  const GEN_CHECKLIST_ID = 9999
  useEffect(() => {
    if (!isGenerating) return
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    // Starter: user prompt + agent checklist message
    setMessages([
      { id: 1, role: 'user', text: 'Create a motion video for "Social Campaign – Present intellectual property"', time: now() },
      { id: GEN_CHECKLIST_ID, role: 'agent', genChecklist: true, time: now() },
    ])
    setGenStep(0)

    const dismiss = setTimeout(() => {
      setIsGenerating(false)
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'agent', text: 'Your motion video is ready. You can now edit scenes, adjust keyframes, and export when done.', time: now() },
      ])
    }, 15_000)

    const progress = setInterval(() => setGenProgress(p => Math.min(100, p + 1)), 150)
    const steps = setInterval(() => setGenStep(s => Math.min(GEN_STEPS.length - 1, s + 1)), 1_500)
    const tips = setInterval(() => setTipIndex(i => (i + 1) % GEN_TIPS.length), 5_000)

    return () => { clearTimeout(dismiss); clearInterval(progress); clearInterval(steps); clearInterval(tips) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating])

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

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setFooterWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!zoomMenuOpen) return
    function onClickOutside(e: MouseEvent) {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
        setZoomMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [zoomMenuOpen])

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

  function handlePlayheadMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    scrubbingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onMove(ev: MouseEvent) {
      if (!scrubbingRef.current || !tlInnerRef.current) return
      const rect = tlInnerRef.current.getBoundingClientRect()
      const labelWidth = 220
      const trackWidth = rect.width - labelWidth
      const x = ev.clientX - rect.left - labelWidth
      const fraction = Math.max(0, Math.min(1, x / trackWidth))
      setTimeMs(Math.round(fraction * totalMs))
    }

    function onUp() {
      scrubbingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
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
  function selectLayer(id: string) {
    setSelectedLayerId(id)
    setSelectedAudioId(null)
    setLayersExpanded(prev => {
      const next: Record<string, boolean> = {}
      Object.keys(prev).forEach(k => { next[k] = false })
      next[id] = true
      return next
    })
  }
  function toggleKf(prop: string, value: number) {
    if (!selectedLayerId) return
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

  function setKfValue(prop: string, value: number) {
    if (!selectedLayerId) return
    setKeyframes(prev => {
      const layerKfs = prev[selectedLayerId] ?? {}
      const arr = layerKfs[prop] ?? []
      const idx = arr.findIndex(k => Math.abs(k.timeMs - timeMs) <= KF_TOLERANCE)
      const next = idx >= 0
        ? arr.map((k, i) => i === idx ? { ...k, value } : k)
        : [...arr, { timeMs, value }].sort((a, b) => a.timeMs - b.timeMs)
      return { ...prev, [selectedLayerId]: { ...layerKfs, [prop]: next } }
    })
  }

  function getKfValue(prop: string, defaultVal: number): number {
    if (!selectedLayerId) return defaultVal
    return getKfValueFor(selectedLayerId, prop, defaultVal)
  }

  function getKfValueFor(layerId: string, prop: string, defaultVal: number): number {
    const arr = (keyframes[layerId] ?? {})[prop] ?? []
    if (arr.length === 0) return defaultVal
    const exact = arr.find(k => Math.abs(k.timeMs - timeMs) <= KF_TOLERANCE)
    if (exact) return exact.value
    if (timeMs <= arr[0].timeMs) return arr[0].value
    if (timeMs >= arr[arr.length - 1].timeMs) return arr[arr.length - 1].value
    const next = arr.find(k => k.timeMs > timeMs)!
    const prev = arr[arr.findIndex(k => k.timeMs > timeMs) - 1]
    const t = (timeMs - prev.timeMs) / (next.timeMs - prev.timeMs)
    return Math.round(prev.value + t * (next.value - prev.value))
  }

  function fmtKfVal(layerId: string, prop: string, defaultVal: number): string {
    const v = getKfValueFor(layerId, prop, defaultVal)
    if (prop === 'scale') return `${v}%`
    if (prop === 'rotation') return `${v}°`
    if (prop === 'opacity') return `${v}%`
    return `${v}`
  }

  const selectedLayerKfs = selectedLayerId ? (keyframes[selectedLayerId] ?? {}) : {}
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
          {!chatOpen && (
            <button className="mv3-icon-btn" onClick={() => setChatOpen(true)} title="Show Agent">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>
          )}
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
          <div className="me-export-anchor">
            <button className="mv3-sub-share-btn" onClick={() => setShowExport(v => !v)}>Export</button>
            {showExport && (
              <div className="me-export-popover" onClick={e => e.stopPropagation()}>
                <div className="me-export-modal-header">
                  <span className="me-export-modal-title">Export video</span>
                  <button className="me-export-modal-close" onClick={() => setShowExport(false)}>✕</button>
                </div>

                <div className="me-export-selects">
                  <div className="me-export-select-group">
                    <label className="me-export-select-label">FRAME RATE</label>
                    <div className="me-export-select-wrap">
                      <select className="me-export-select" defaultValue="30 fps">
                        {(['24 fps', '30 fps', '60 fps'] as const).map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="me-export-select-group">
                    <label className="me-export-select-label">RESOLUTION</label>
                    <div className="me-export-select-wrap">
                      <select className="me-export-select" defaultValue="720p (720p)">
                        {(['480p (480p)', '720p (720p)', '1080p (1080p)'] as const).map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="me-export-meta">
                  <span>Duration: {(totalMs / 1000).toFixed(2)}s</span>
                  <span>Frames: {Math.round((totalMs / 1000) * 30)}</span>
                  <span>Output: 1280×720 <span className="me-export-meta-dim">MP4 / H.264</span></span>
                </div>

                <div className="me-export-audio-row">
                  Audio: mixing 2 clips (AAC, 128 kbps)
                </div>

                <button className="me-export-confirm-btn" onClick={() => setShowExport(false)}>
                  Export
                </button>
              </div>
            )}
          </div>
          <div className="mv3-avatar">T</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="me-body">

        {/* ── Chat Sidebar ── */}
        <aside className="me-chat" style={chatOpen ? { width: chatW } : { display: 'none' }}>
          <div className="me-chat-resize-handle" onMouseDown={handleChatResizeDown} />
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

          {/* Generating progress bar */}
          {isGenerating && (
            <div className="me-gen-chat-bar">
              <div className="me-gen-bar-fill" style={{ width: `${genProgress}%` }} />
            </div>
          )}

          {/* Messages */}
          <div className="me-chat-messages">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`me-agent-msg me-agent-msg--${msg.role}`}>

                {msg.genChecklist ? (
                  <div className="me-gen-checklist">
                    {GEN_STEPS.map((step, i) => {
                      const done = i < genStep
                      const active = i === genStep && isGenerating
                      return (
                        <div key={i} className={`me-gen-checklist-item${done ? ' done' : active ? ' active' : ' pending'}`}>
                          <span className="me-gen-checklist-icon">
                            {done ? '✓' : active ? <span className="me-gen-spinner" /> : '○'}
                          </span>
                          {step}
                        </div>
                      )
                    })}
                  </div>
                ) : msg.toolCalls ? (
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
                    <div className={`me-agent-bubble${isGenerating && idx === messages.length - 1 ? ' me-agent-bubble--gen' : ''}`}>
                      {isGenerating && idx === messages.length - 1 && (
                        <span className="me-gen-spinner" style={{ marginRight: 8 }} />
                      )}
                      {formatMessage(msg.text ?? '')}
                    </div>
                    {!isGenerating && msg.role === 'agent' && (
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

          {/* Generating overlay — covers panels/timeline/inspector, chat+header stay visible */}
          {isGenerating && (
            <div className="me-gen-screen">
              <div className="me-gen-modal">
                <h2 className="me-gen-title">Learn while you wait</h2>
                <div className="me-gen-tip">
                  <span className="me-gen-tip-icon">💡</span>
                  <span className="me-gen-tip-label">Tip:</span>
                  {GEN_TIPS[tipIndex]}
                </div>
                <div className="me-gen-preview">
                  {GEN_TIP_SVGS[tipIndex]}
                </div>
                {import.meta.env.DEV && (
                  <button className="me-gen-skip" onClick={() => setIsGenerating(false)}>
                    Skip (dev only)
                  </button>
                )}
              </div>
              <div className="me-gen-status-pill">
                <span className="me-gen-status-dot" />
                LayerProof is designing — please wait to edit
              </div>
            </div>
          )}

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
                        onClick={() => selectLayer(layer.id)}
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
                      { name: 'hero-image.png',   bg: '#2a3a2a', accent: '#4caf50' },
                      { name: 'intro-clip.mp4',   bg: '#2a2a3a', accent: '#7c6af5' },
                      { name: 'brand-kit.ai',     bg: '#3a2a2a', accent: '#f57c4c' },
                      { name: 'product-shot.jpg', bg: '#2a3035', accent: '#4caacc' },
                      { name: 'b-roll.mov',       bg: '#2a2a3a', accent: '#9c7cf5' },
                      { name: 'overlay.svg',      bg: '#2a3530', accent: '#4ccf9f' },
                    ].map((a, i) => {
                      const ext = a.name.split('.').pop()?.toUpperCase() ?? ''
                      return (
                        <div key={i} className="me-asset-card">
                          <div className="me-asset-preview me-asset-placeholder" style={{ background: a.bg }}>
                            <div className="me-asset-ph-lines">
                              <div className="me-asset-ph-line" style={{ width: '60%', background: a.accent, opacity: 0.3 }} />
                              <div className="me-asset-ph-line" style={{ width: '80%', background: a.accent, opacity: 0.15 }} />
                              <div className="me-asset-ph-line" style={{ width: '45%', background: a.accent, opacity: 0.2 }} />
                            </div>
                            <span className="me-asset-ph-ext" style={{ color: a.accent }}>{ext}</span>
                          </div>
                          <span className="me-asset-name">{a.name}</span>
                        </div>
                      )
                    })}
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

              <div className="me-canvas-bg" ref={canvasBgRef} onWheel={handleCanvasWheel} onClick={() => { setSelectedLayerId(null); setSelectedAudioId(null) }} style={{ background: canvasBgColor }}>
                <div
                  className={`me-canvas-scene-card${activeScene === 1 ? ' active' : ''}`}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <span className="me-canvas-scene-label">Scene {activeScene}</span>
                  <span className="me-canvas-scene-hint">
                    {activeScene === 1 ? '0:00 – 0:03.92' : '0:03.92 – 0:12.72'}
                  </span>
                </div>
              </div>

              {/* Canvas footer toolbar */}
              <div className="me-canvas-footer" ref={footerRef}>
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
                  {footerWidth >= 480 ? (
                    <>
                      <button className="me-zoom-btn" onClick={() => setZoom(z => Math.max(10, z - 10))}>−</button>
                      <button className="me-zoom-btn me-zoom-pct" onClick={() => setZoom(100)}>{zoom}%</button>
                      <button className="me-zoom-btn" onClick={() => setZoom(z => Math.min(400, z + 10))}>+</button>
                    </>
                  ) : (
                    <div className="me-zoom-compact" ref={zoomMenuRef}>
                      <button
                        className="me-footer-icon me-zoom-icon-btn"
                        onClick={() => setZoomMenuOpen(o => !o)}
                        aria-label="Zoom"
                        title={`Zoom: ${zoom}%`}
                      >
                        <MagnifyingGlass size={17} />
                      </button>
                      {zoomMenuOpen && (
                        <div className="me-zoom-menu">
                          <div className="me-zoom-menu-row">
                            <span className="me-zoom-menu-label" onClick={() => setZoom(100)} title="Reset to 100%">{zoom}%</span>
                            <input
                              type="range" min={10} max={400} step={5}
                              value={zoom}
                              onChange={e => setZoom(Number(e.target.value))}
                              className="me-zoom-slider"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
              {!selectedLayerId && !selectedAudioId ? (
                /* ── Canvas / Stage default panel ── */
                <div className="me-canvas-info-panel">

                  {/* Background color editor */}
                  <div className="me-ci-section">
                    <div className="me-ci-section-title">Canvas Background</div>
                    <div className="me-design-fill-row">
                      <div
                        className="me-design-color-swatch"
                        style={{ background: canvasBgColor, cursor: 'pointer', position: 'relative', flexShrink: 0 }}
                      >
                        <input
                          type="color"
                          value={canvasBgColor}
                          onChange={e => setCanvasBgColor(e.target.value)}
                          style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                        />
                      </div>
                      <input
                        className="me-design-input me-design-input--hex"
                        type="text"
                        value={canvasBgColor.replace('#', '').toUpperCase()}
                        onChange={e => {
                          const v = e.target.value.replace('#', '')
                          if (/^[0-9a-fA-F]{0,6}$/.test(v)) setCanvasBgColor('#' + v)
                        }}
                      />
                      <input className="me-design-input me-design-input--pct" type="number" defaultValue={100} min={0} max={100} />
                      <span className="me-design-unit">%</span>
                    </div>
                  </div>

                  {/* Project info */}
                  <div className="me-ci-section">
                    <div className="me-ci-section-title">Project</div>
                    <table className="me-ci-table">
                      <tbody>
                        <tr><td className="me-ci-label">Name</td><td className="me-ci-value">Social Campaign</td></tr>
                        <tr><td className="me-ci-label">Scenes</td><td className="me-ci-value">2</td></tr>
                        <tr><td className="me-ci-label">Resolution</td><td className="me-ci-value">1280×720</td></tr>
                        <tr><td className="me-ci-label">Frame rate</td><td className="me-ci-value">30.00fps</td></tr>
                        <tr><td className="me-ci-label">Duration</td><td className="me-ci-value">{(totalMs / 1000).toFixed(2)}s</td></tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              ) : selectedAudioId ? (
                <div className="me-anim-panel me-audio-panel">
                  {/* Audio header */}
                  <div className="me-anim-layer-row">
                    <span className="me-anim-layer-type-pill">Audio</span>
                    <span className="me-anim-layer-name" style={{ flex: 1 }}>
                      {selectedAudioId.replace(/-(\d+)$/, ' $1').replace(/^\w/, c => c.toUpperCase())}
                    </span>
                    <button
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
                      onClick={() => setSelectedAudioId(null)}
                    >×</button>
                  </div>

                  {/* Volume */}
                  <div className="me-audio-section">
                    <span className="me-anim-section-title">Volume</span>
                    <div className="me-anim-scale-row">
                      <input
                        type="range"
                        className="me-anim-slider"
                        min={0} max={100}
                        value={audioVolume}
                        onChange={e => setAudioVolume(Number(e.target.value))}
                      />
                      <div className="me-anim-field me-anim-field--narrow">
                        <input
                          className="me-anim-field-input"
                          type="number"
                          min={0} max={100}
                          value={audioVolume}
                          onChange={e => setAudioVolume(Number(e.target.value))}
                        />
                        <span className="me-anim-field-unit">%</span>
                      </div>
                      <div className="me-anim-duration-stepper">
                        <button onClick={() => setAudioVolume(v => Math.min(100, v + 1))}>▲</button>
                        <button onClick={() => setAudioVolume(v => Math.max(0, v - 1))}>▼</button>
                      </div>
                    </div>
                  </div>

                  {/* Fade */}
                  <div className="me-audio-section">
                    <span className="me-anim-section-title">Fade</span>
                    <div className="me-anim-duration-bar me-audio-bar">
                      <span className="me-anim-duration-label">Fade In</span>
                      <div className="me-anim-duration-field">
                        <span>{audioFadeIn.toFixed(1)}s</span>
                        <div className="me-anim-duration-stepper">
                          <button onClick={() => setAudioFadeIn(v => Math.min(5, +(v + 0.1).toFixed(1)))}>▲</button>
                          <button onClick={() => setAudioFadeIn(v => Math.max(0, +(v - 0.1).toFixed(1)))}>▼</button>
                        </div>
                      </div>
                    </div>
                    <div className="me-anim-duration-bar me-audio-bar">
                      <span className="me-anim-duration-label">Fade Out</span>
                      <div className="me-anim-duration-field">
                        <span>{audioFadeOut.toFixed(1)}s</span>
                        <div className="me-anim-duration-stepper">
                          <button onClick={() => setAudioFadeOut(v => Math.min(5, +(v + 0.1).toFixed(1)))}>▲</button>
                          <button onClick={() => setAudioFadeOut(v => Math.max(0, +(v - 0.1).toFixed(1)))}>▼</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Speed */}
                  <div className="me-audio-section">
                    <span className="me-anim-section-title">Speed</span>
                    <div className="me-anim-scale-row">
                      <input
                        type="range"
                        className="me-anim-slider"
                        min={25} max={200}
                        value={Math.round(audioSpeed * 100)}
                        onChange={e => setAudioSpeed(+(Number(e.target.value) / 100).toFixed(2))}
                      />
                      <div className="me-anim-field me-anim-field--narrow">
                        <input
                          className="me-anim-field-input"
                          type="number"
                          min={0.25} max={2} step={0.05}
                          value={audioSpeed.toFixed(2)}
                          onChange={e => setAudioSpeed(Math.min(2, Math.max(0.25, Number(e.target.value))))}
                        />
                        <span className="me-anim-field-unit">x</span>
                      </div>
                      <div className="me-anim-duration-stepper">
                        <button onClick={() => setAudioSpeed(v => Math.min(2, +(v + 0.05).toFixed(2)))}>▲</button>
                        <button onClick={() => setAudioSpeed(v => Math.max(0.25, +(v - 0.05).toFixed(2)))}>▼</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
              <>
              {/* Mode toggle */}
              <div className="me-inspector-mode-toggle">
                <div className="me-inspector-mode-pill">
                  {(['Design', 'Animate'] as const).map(m => (
                    <button
                      key={m}
                      className={`me-mode-btn${mode === m ? ' active' : ''}`}
                      onClick={() => setMode(m)}
                    >{m}</button>
                  ))}
                </div>
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
                    <span className="me-anim-layer-name">{selectedLayerId}</span>
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
                            <button className={`me-anim-kf-diamond${atKf ? ' me-anim-kf-diamond--active' : ''}`} title="Add keyframe" onClick={e => e.stopPropagation()} style={{ fontSize: 18, lineHeight: 1 }}>{atKf ? '◆' : '◇'}</button>
                          </span>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.5, transition: 'transform .15s', transform: transformOpen ? 'rotate(90deg)' : 'rotate(0deg)', flex: 'none' }}>
                            <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          </svg>
                        </div>
                        {transformOpen && (<>
                          <div className="me-anim-row">
                            <span className="me-anim-row-label">Position</span>
                            <div className="me-anim-row-fields">
                              <div className="me-anim-field">
                                <span className="me-anim-field-axis">X</span>
                                <input className="me-anim-field-input" type="number" value={getKfValue('x', 0)} onChange={e => setKfValue('x', Number(e.target.value))} />
                              </div>
                              <button className={`me-anim-diamond${xAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('x', 0)}>{xAtKf ? '◆' : '◇'}</button>
                              <div className="me-anim-field">
                                <span className="me-anim-field-axis">Y</span>
                                <input className="me-anim-field-input" type="number" value={getKfValue('y', 0)} onChange={e => setKfValue('y', Number(e.target.value))} />
                              </div>
                              <button className={`me-anim-diamond${yAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('y', 0)}>{yAtKf ? '◆' : '◇'}</button>
                            </div>
                          </div>
                          <div className="me-anim-row me-anim-row--col">
                            <span className="me-anim-row-label">Scale</span>
                            <div className="me-anim-scale-row">
                              <input type="range" className="me-anim-slider" min={0} max={400} value={getKfValue('scale', 100)} onChange={e => setKfValue('scale', Number(e.target.value))} />
                              <div className="me-anim-field me-anim-field--narrow">
                                <input className="me-anim-field-input" type="number" value={getKfValue('scale', 100)} onChange={e => setKfValue('scale', Number(e.target.value))} />
                                <span className="me-anim-field-unit">%</span>
                              </div>
                              <div className="me-anim-duration-stepper">
                                <button onClick={() => setKfValue('scale', getKfValue('scale', 100) + 1)}>▲</button>
                                <button onClick={() => setKfValue('scale', getKfValue('scale', 100) - 1)}>▼</button>
                              </div>
                              <button className={`me-anim-diamond${scaleAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('scale', 100)}>{scaleAtKf ? '◆' : '◇'}</button>
                            </div>
                          </div>
                          <div className="me-anim-row">
                            <span className="me-anim-row-label">Rotation</span>
                            <div className="me-anim-row-fields">
                              <div className="me-anim-field me-anim-field--wide">
                                <input className="me-anim-field-input" type="number" value={getKfValue('rotation', 0)} onChange={e => setKfValue('rotation', Number(e.target.value))} />
                                <span className="me-anim-field-unit">°</span>
                              </div>
                              <button className={`me-anim-diamond${rotAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('rotation', 0)}>{rotAtKf ? '◆' : '◇'}</button>
                            </div>
                          </div>
                          <div className="me-anim-row me-anim-row--last">
                            <span className="me-anim-row-label">Opacity</span>
                            <div className="me-anim-scale-row">
                              <input type="range" className="me-anim-slider" min={0} max={100} value={getKfValue('opacity', 100)} onChange={e => setKfValue('opacity', Number(e.target.value))} />
                              <div className="me-anim-field me-anim-field--narrow">
                                <input className="me-anim-field-input" type="number" value={getKfValue('opacity', 100)} onChange={e => setKfValue('opacity', Number(e.target.value))} />
                                <span className="me-anim-field-unit">%</span>
                              </div>
                              <div className="me-anim-duration-stepper">
                                <button onClick={() => setKfValue('opacity', getKfValue('opacity', 100) + 1)}>▲</button>
                                <button onClick={() => setKfValue('opacity', getKfValue('opacity', 100) - 1)}>▼</button>
                              </div>
                              <button className={`me-anim-diamond${opacAtKf ? ' me-anim-diamond--active' : ''}`} onClick={() => toggleKf('opacity', 100)}>{opacAtKf ? '◆' : '◇'}</button>
                            </div>
                          </div>
                        </>)}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="me-design-panel">
                  {/* Layout */}
                  <div className="me-design-section">
                    <div className="me-design-section-title">Layout</div>
                    <div className="me-design-row">
                      <div className="me-design-field">
                        <span className="me-design-field-label">X</span>
                        <input className="me-design-input" type="number" defaultValue={0} />
                      </div>
                      <div className="me-design-field">
                        <span className="me-design-field-label">Y</span>
                        <input className="me-design-input" type="number" defaultValue={0} />
                      </div>
                    </div>
                    <div className="me-design-row">
                      <div className="me-design-field">
                        <span className="me-design-field-label">W</span>
                        <input className="me-design-input" type="number" defaultValue={480} />
                      </div>
                      <div className="me-design-field">
                        <span className="me-design-field-label">H</span>
                        <input className="me-design-input" type="number" defaultValue={270} />
                      </div>
                    </div>
                    <div className="me-design-row">
                      <div className="me-design-field">
                        <span className="me-design-field-label">R</span>
                        <input className="me-design-input" type="number" defaultValue={0} />
                      </div>
                      <div className="me-design-field">
                        <span className="me-design-field-label">⌀</span>
                        <input className="me-design-input" type="number" defaultValue={0} />
                      </div>
                    </div>
                  </div>

                  {/* Fill */}
                  <div className="me-design-section">
                    <div className="me-design-section-header">
                      <span className="me-design-section-title">Fill</span>
                      <button className="me-design-add-btn">+</button>
                    </div>
                    <div className="me-design-fill-row">
                      <div className="me-design-color-swatch" style={{ background: '#1a1a2e' }} />
                      <input className="me-design-input me-design-input--hex" type="text" defaultValue="1A1A2E" />
                      <input className="me-design-input me-design-input--pct" type="number" defaultValue={100} />
                      <span className="me-design-unit">%</span>
                    </div>
                  </div>

                  {/* Stroke */}
                  <div className="me-design-section">
                    <div className="me-design-section-header">
                      <span className="me-design-section-title">Stroke</span>
                      <button className="me-design-add-btn">+</button>
                    </div>
                    <div className="me-design-fill-row">
                      <div className="me-design-color-swatch me-design-color-swatch--empty" />
                      <span className="me-design-empty-label">None</span>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="me-design-section">
                    <div className="me-design-section-title">Typography</div>
                    <div className="me-design-select-row">
                      <select className="me-design-select">
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>SF Pro</option>
                        <option>Helvetica</option>
                      </select>
                    </div>
                    <div className="me-design-row">
                      <div className="me-design-field">
                        <span className="me-design-field-label">Size</span>
                        <input className="me-design-input" type="number" defaultValue={16} />
                      </div>
                      <div className="me-design-field">
                        <span className="me-design-field-label">Weight</span>
                        <select className="me-design-input me-design-input--sel">
                          <option>Regular</option>
                          <option>Medium</option>
                          <option>SemiBold</option>
                          <option>Bold</option>
                        </select>
                      </div>
                    </div>
                    <div className="me-design-row">
                      <div className="me-design-field">
                        <span className="me-design-field-label">Line</span>
                        <input className="me-design-input" type="number" defaultValue={1.5} step={0.1} />
                      </div>
                      <div className="me-design-field">
                        <span className="me-design-field-label">Letter</span>
                        <input className="me-design-input" type="number" defaultValue={0} step={0.1} />
                      </div>
                    </div>
                    <div className="me-design-align-row">
                      {['←', '↔', '→', '↑', '↕', '↓'].map((icon, i) => (
                        <button key={i} className={`me-design-align-btn${i === 0 ? ' active' : ''}`}>{icon}</button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity */}
                  <div className="me-design-section">
                    <div className="me-design-section-title">Appearance</div>
                    <div className="me-design-row">
                      <div className="me-design-field me-design-field--full">
                        <span className="me-design-field-label">Opacity</span>
                        <input className="me-design-input" type="number" defaultValue={100} min={0} max={100} />
                        <span className="me-design-unit">%</span>
                      </div>
                    </div>
                    <div className="me-design-row">
                      <div className="me-design-field me-design-field--full">
                        <span className="me-design-field-label">Blend</span>
                        <select className="me-design-input me-design-input--sel">
                          <option>Normal</option>
                          <option>Multiply</option>
                          <option>Screen</option>
                          <option>Overlay</option>
                          <option>Darken</option>
                          <option>Lighten</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Shadow */}
                  <div className="me-design-section">
                    <div className="me-design-section-header">
                      <span className="me-design-section-title">Shadow</span>
                      <button className="me-design-add-btn">+</button>
                    </div>
                    <div className="me-design-fill-row">
                      <div className="me-design-color-swatch me-design-color-swatch--empty" />
                      <span className="me-design-empty-label">None</span>
                    </div>
                  </div>
                </div>
              )}
              </>
              )}
            </aside>

          </div>{/* end me-body-content */}

          {/* ── Timeline — spans full width of right area ── */}
          <div className="me-timeline" style={{ height: tlHeight, display: (mode === 'Design' && !!selectedLayerId) ? 'none' : undefined }}>

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
              <div className="me-timeline-inner" ref={tlInnerRef} style={{ width: `${Math.max(100, tlZoom)}%` }} onClick={handleTimelineClick}>

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
                  onMouseDown={handlePlayheadMouseDown}
                />

                {/* Audio group header */}
                <div className="me-track-group-header" onClick={() => setAudioGroupOpen(o => !o)}>
                  <div className="me-track-label">
                    <SpeakerHigh size={16} style={{ color: '#f5c518', flexShrink: 0 }} />
                    Audio
                    <CaretRight size={10} style={{ transform: audioGroupOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0, marginLeft: 'auto', opacity: 0.5 }} />
                  </div>
                  <div className="me-track-content" />
                </div>

                {audioGroupOpen && (<>
                  {/* Sound Track row */}
                  <div
                    className={`me-track-row me-track-row--tall me-track-row--child${selectedAudioId === 'soundtrack-1' ? ' me-track-row--track-selected' : ''}`}
                    onClick={() => { setSelectedAudioId(id => id === 'soundtrack-1' ? null : 'soundtrack-1'); setSelectedTrackId(null) }}
                  >
                    <div className="me-track-label me-track-label--child"><MusicNote size={14} /> Sound Track</div>
                    <div className="me-track-content">
                      <div
                        className={`me-waveform-seg${selectedAudioId === 'soundtrack-1' ? ' me-waveform-seg--selected' : ''}`}
                        style={{ flex: totalMs }}
                        onClick={e => e.stopPropagation()}
                      >
                        {WAVEFORM_HEIGHTS.map((h, i) => (
                          <div key={i} className="me-waveform-bar"
                            style={{ height: `${h}px`, opacity: i / WAVEFORM_HEIGHTS.length < timeMs / totalMs ? 1 : 0.45 }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Narration row */}
                  <div
                    className={`me-track-row me-track-row--tall me-track-row--child${selectedTrackId === 'narration' ? ' me-track-row--track-selected' : ''}`}
                    onClick={() => setSelectedTrackId(t => t === 'narration' ? null : 'narration')}
                  >
                    <div className="me-track-label me-track-label--child"><MusicNote size={14} /> Narration</div>
                    <div className="me-track-content">
                      <div
                        className={`me-waveform-seg${selectedAudioId === 'narration-1' ? ' me-waveform-seg--selected' : ''}`}
                        style={{ flex: 3920 }}
                        onClick={e => { e.stopPropagation(); setSelectedAudioId(id => id === 'narration-1' ? null : 'narration-1') }}
                      >
                        {WAVEFORM_HEIGHTS.slice(0, 38).map((h, i) => (
                          <div key={i} className="me-waveform-bar"
                            style={{ height: `${h}px`, opacity: i / 38 < timeMs / 3920 ? 1 : 0.45 }} />
                        ))}
                      </div>
                      <div
                        className={`me-waveform-seg${selectedAudioId === 'narration-2' ? ' me-waveform-seg--selected' : ''}`}
                        style={{ flex: 4720 }}
                        onClick={e => { e.stopPropagation(); setSelectedAudioId(id => id === 'narration-2' ? null : 'narration-2') }}
                      >
                        {WAVEFORM_HEIGHTS.slice(38).map((h, i) => (
                          <div key={i} className="me-waveform-bar"
                            style={{ height: `${h}px`, opacity: timeMs > 3920 ? (i / 35 < (timeMs - 3920) / 4720 ? 1 : 0.45) : 0.45 }} />
                        ))}
                      </div>
                      <div style={{ flex: 12720 - 3920 - 4720 }} />
                    </div>
                  </div>
                </>)}

                {/* Scenes row */}
                <div className="me-track-row me-track-row--tall me-track-group-header" onClick={() => setScenesGroupOpen(o => !o)}>
                  <div className="me-track-label">
                    <FilmStrip size={16} style={{ color: '#f5c518', flexShrink: 0 }} />
                    Scenes
                    <CaretRight size={10} style={{ transform: scenesGroupOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0, marginLeft: 'auto', opacity: 0.5 }} />
                  </div>
                  <div className="me-track-content">
                    <div
                      className={`me-scene-strip me-scene-strip--1${activeScene === 1 ? ' active' : ''}`}
                      style={{ flex: 3920 }}
                      onClick={e => { e.stopPropagation(); handleSceneClick(1) }}
                    >
                      <span className="me-scene-strip-dur">0:03.92</span>
                    </div>
                    <div
                      className={`me-scene-strip me-scene-strip--2${activeScene === 2 ? ' active' : ''}`}
                      style={{ flex: 4720 }}
                      onClick={e => { e.stopPropagation(); handleSceneClick(2) }}
                    >
                      <span className="me-scene-strip-dur">0:04.72</span>
                    </div>
                    <div style={{ flex: 12720 - 3920 - 4720 }} />
                  </div>
                </div>

                {/* Layer tracks — toggled by Scenes caret */}
                {scenesGroupOpen && activeScene === 1 && (() => {
                  const layerStart = 0
                  const layerEnd   = 3920
                  const layerDur   = layerEnd - layerStart
                  const rectKfs    = keyframes['rect-yfer4o'] ?? {}
                  return (
                    <>
                      <div className={`me-layer-group${selectedLayerId === 'rect-yfer4o' ? ' me-layer-group--selected' : ''}`}
                        onClick={() => selectLayer('rect-yfer4o')}>
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
                          <div className="me-track-content">
                            <div className="me-layer-strip" style={{ flex: layerDur, position: 'relative' }}>
                              {[...new Set(Object.values(rectKfs).flat().map(k => k.timeMs))].map(t => (
                                <div key={t} className="me-kf-dot" style={{ left: `${((t - layerStart) / layerDur) * 100}%` }} />
                              ))}
                            </div>
                            <div style={{ flex: totalMs - layerEnd }} />
                          </div>
                        </div>

                        {/* Property tracks — grouped with tree hierarchy */}
                        {layersExpanded['rect-yfer4o'] && (() => {
                          const groups = [
                            { label: 'Position', rows: [{ prop: 'x' as const, axis: 'X', defaultVal: 0 }, { prop: 'y' as const, axis: 'Y', defaultVal: 0 }] },
                            { label: 'Scale',    rows: [{ prop: 'scale' as const, axis: '', defaultVal: 100 }] },
                            { label: 'Rotation', rows: [{ prop: 'rotation' as const, axis: '', defaultVal: 0 }] },
                            { label: 'Opacity',  rows: [{ prop: 'opacity' as const, axis: '', defaultVal: 100 }] },
                          ]
                          const flat = groups.flatMap(g => g.rows.filter(r => (rectKfs[r.prop] ?? []).length > 0).map((r, ri) => ({ ...r, label: g.label, ri })))
                          return flat.map((row, fi) => {
                            const kfs = rectKfs[row.prop] ?? []
                            const active = hasKfAt(rectKfs, row.prop, timeMs)
                            const isLast = fi === flat.length - 1
                            return (
                              <div key={row.prop} className="me-track-row me-prop-track-row">
                                <div className="me-track-label me-prop-track-label">
                                  <span className={`me-tl-tree-gutter${isLast ? ' me-tl-tree-gutter--last' : ''}`} />
                                  <span className="me-prop-group-name">{row.ri === 0 ? row.label : ''}</span>
                                  {row.axis && <span className="me-prop-axis">{row.axis}</span>}
                                  <span className="me-prop-track-val">{fmtKfVal('rect-yfer4o', row.prop, row.defaultVal)}</span>
                                  <button
                                    className={`me-prop-kf-btn${active ? ' me-prop-kf-btn--active' : ''}`}
                                    onClick={e => { e.stopPropagation(); toggleKf(row.prop, row.defaultVal) }}
                                    title="Toggle keyframe"
                                  >{active ? '◆' : '◇'}</button>
                                </div>
                                <div className="me-track-content">
                                  <div className="me-layer-strip me-layer-strip--prop" style={{ flex: layerDur, position: 'relative' }}>
                                    {kfs.length >= 2 && (
                                      <div className="me-kf-line" style={{
                                        left: `${((kfs[0].timeMs - layerStart) / layerDur) * 100}%`,
                                        width: `${((kfs[kfs.length - 1].timeMs - kfs[0].timeMs) / layerDur) * 100}%`,
                                      }} />
                                    )}
                                    {kfs.map(kf => (
                                      <div key={kf.timeMs} className="me-kf-dot"
                                        style={{ left: `${((kf.timeMs - layerStart) / layerDur) * 100}%` }}
                                        onClick={e => { e.stopPropagation(); setTimeMs(kf.timeMs) }}
                                      />
                                    ))}
                                  </div>
                                  <div style={{ flex: totalMs - layerEnd }} />
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </>
                  )
                })()}

                {/* Extra shapes — each toggleable */}
                {scenesGroupOpen && ([
                  activeScene === 1 && { id: 'circle-m4n8x', flexPre: 0,    flexStrip: 3920, flexPost: totalMs - 3920 },
                  activeScene === 2 && { id: 'text-b2r5w',   flexPre: 3920, flexStrip: 4720, flexPost: totalMs - 3920 - 4720 },
                ].filter(Boolean) as { id: string; flexPre: number; flexStrip: number; flexPost: number }[]).map(layer => {
                  const layerKfs = keyframes[layer.id] ?? {}
                  return (
                    <div key={layer.id} className={`me-layer-group${selectedLayerId === layer.id ? ' me-layer-group--selected' : ''}`}
                      onClick={() => selectLayer(layer.id)}>
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
                        <div className="me-track-content">
                          {layer.flexPre > 0 && <div style={{ flex: layer.flexPre }} />}
                          <div className="me-layer-strip" style={{ flex: layer.flexStrip, position: 'relative' }}>
                            {[...new Set(Object.values(layerKfs).flat().map(k => k.timeMs))].map(t => (
                              <div key={t} className="me-kf-dot" style={{ left: `${((t - layer.flexPre) / layer.flexStrip) * 100}%` }} />
                            ))}
                          </div>
                          {layer.flexPost > 0 && <div style={{ flex: layer.flexPost }} />}
                        </div>
                      </div>
                      {layersExpanded[layer.id] && (() => {
                        const lGroups = [
                          { label: 'Position', rows: [{ prop: 'x', axis: 'X', defaultVal: 0 }, { prop: 'y', axis: 'Y', defaultVal: 0 }] },
                          { label: 'Scale',    rows: [{ prop: 'scale', axis: '', defaultVal: 100 }] },
                          { label: 'Rotation', rows: [{ prop: 'rotation', axis: '', defaultVal: 0 }] },
                          { label: 'Opacity',  rows: [{ prop: 'opacity', axis: '', defaultVal: 100 }] },
                        ]
                        const lFlat = lGroups.flatMap(g => g.rows.filter(r => (layerKfs[r.prop] ?? []).length > 0).map((r, ri) => ({ ...r, label: g.label, ri })))
                        return lFlat.map((row, fi) => {
                          const kfs = layerKfs[row.prop] ?? []
                          const isLast = fi === lFlat.length - 1
                          return (
                            <div key={`${layer.id}-${row.prop}`} className="me-track-row me-prop-track-row">
                              <div className="me-track-label me-prop-track-label">
                                <span className={`me-tl-tree-gutter${isLast ? ' me-tl-tree-gutter--last' : ''}`} />
                                <span className="me-prop-group-name">{row.ri === 0 ? row.label : ''}</span>
                                {row.axis && <span className="me-prop-axis">{row.axis}</span>}
                                <span className="me-prop-track-val">{fmtKfVal(layer.id, row.prop, row.defaultVal)}</span>
                                <span className="me-prop-kf-btn" style={{ color: 'rgba(255,255,255,0.2)' }}>◇</span>
                              </div>
                              <div className="me-track-content">
                                {layer.flexPre > 0 && <div style={{ flex: layer.flexPre }} />}
                                <div className="me-layer-strip me-layer-strip--prop" style={{ flex: layer.flexStrip, position: 'relative' }}>
                                  {kfs.length >= 2 && (
                                    <div className="me-kf-line" style={{
                                      left: `${((kfs[0].timeMs - layer.flexPre) / layer.flexStrip) * 100}%`,
                                      width: `${((kfs[kfs.length - 1].timeMs - kfs[0].timeMs) / layer.flexStrip) * 100}%`,
                                    }} />
                                  )}
                                  {kfs.map(kf => (
                                    <div key={kf.timeMs} className="me-kf-dot"
                                      style={{ left: `${((kf.timeMs - layer.flexPre) / layer.flexStrip) * 100}%` }}
                                      onClick={e => { e.stopPropagation(); setTimeMs(kf.timeMs) }}
                                    />
                                  ))}
                                </div>
                                {layer.flexPost > 0 && <div style={{ flex: layer.flexPost }} />}
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  )
                })}

              </div>{/* end me-timeline-inner */}
            </div>
          </div>

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

      {/* dismiss export on outside click */}
      {showExport && <div className="me-export-backdrop" onClick={() => setShowExport(false)} />}
    </div>
  )
}
