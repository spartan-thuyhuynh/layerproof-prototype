import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback, useEffect, Fragment } from 'react'
import { LookAndFeelModal } from './LookAndFeelModal'
import { EditorDialog, EditorDialogTrigger, EditorDialogContent, EditorDialogHeader, EditorDialogTitle, EditorDialogBody, EditorDialogFooter, EditorDialogClose } from '@/features/create/components/matte-v3/editor-ui'
import type { ThemeOption } from '../themes'
import { SYSTEM_THEMES } from '../themes'

interface VersionEntry {
  id: number
  label: string
  timestamp: string
  prompt: string
  renderSlot: number
  isCurrent?: boolean
}

const PAGE_VERSION_HISTORY: Record<number, VersionEntry[]> = {
  0: [
    { id: 1, label: 'v3 — Current', timestamp: 'Today, 2:41 PM', renderSlot: 0, isCurrent: true, prompt: 'A clean social campaign poster about safeguarding intellectual property on Apple platforms, featuring a lock icon, bold headline, and CTA button on a warm off-white background. Minimal, editorial design.' },
    { id: 2, label: 'v2', timestamp: 'Today, 1:15 PM', renderSlot: 1, prompt: 'Social post for an Apple developer audience about protecting intellectual property. Use a clean layout with a strong headline, supporting body copy, and a bright CTA. Light background, professional tone.' },
    { id: 3, label: 'v1', timestamp: 'Today, 11:03 AM', renderSlot: 2, prompt: 'Launch post for LayerProof targeting Apple developers. High-contrast design, bold call-to-action, with a visual metaphor around IP protection and innovation.' },
  ],
  1: [
    { id: 4, label: 'v2 — Current', timestamp: 'Today, 2:38 PM', renderSlot: 1, isCurrent: true, prompt: 'Dark-themed social post highlighting 3 ways to protect your IP on Apple platforms, with icon list and a blue accent CTA on a deep navy background. Clean, structured layout.' },
    { id: 5, label: 'v1', timestamp: 'Today, 12:50 PM', renderSlot: 0, prompt: 'Educational post in list format for developers. Three IP tips, dark background with coloured accents, structured hierarchy and clear section labels.' },
  ],
  2: [
    { id: 6, label: 'v4 — Current', timestamp: 'Today, 2:44 PM', renderSlot: 2, isCurrent: true, prompt: 'Purple-gradient social poster with rocket icon, bold headline encouraging developers to secure their innovation on Apple platforms, and a vibrant CTA. High energy, startup aesthetic.' },
    { id: 7, label: 'v3', timestamp: 'Today, 2:10 PM', renderSlot: 0, prompt: 'Gradient poster with bold typography — rocket or launch icon, energetic tagline, and a CTA aimed at indie developers building on Apple platforms.' },
    { id: 8, label: 'v2', timestamp: 'Today, 1:28 PM', renderSlot: 1, prompt: 'Vibrant social post with playful visual energy. Encourage Apple developers to protect their work, using short punchy copy and a prominent sign-up CTA.' },
    { id: 9, label: 'v1', timestamp: 'Today, 11:55 AM', renderSlot: 2, prompt: 'First draft — high energy poster for LayerProof launch. Bold claim headline, supporting copy about protecting code, and a primary action button.' },
  ],
}

function formatMessage(text: string) {
  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (/^>\s/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s*/, ''))
        i++
      }
      blocks.push(<blockquote key={blocks.length} className="mv3-msg-quote">{quoteLines.join(' ')}</blockquote>)
    } else if (/^[•\-]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[•\-]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[•\-]\s*/, ''))
        i++
      }
      blocks.push(<ul key={blocks.length} className="mv3-msg-list">{items.map((it, j) => <li key={j}>{it}</li>)}</ul>)
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s*/, ''))
        i++
      }
      blocks.push(<ol key={blocks.length} className="mv3-msg-list mv3-msg-list--ol">{items.map((it, j) => <li key={j}>{it}</li>)}</ol>)
    } else {
      const paraLines: string[] = []
      while (i < lines.length && lines[i].trim() && !/^[•\-]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
        paraLines.push(lines[i])
        i++
      }
      blocks.push(<p key={blocks.length} className="mv3-msg-para">{paraLines.join(' ')}</p>)
    }
  }

  return <Fragment>{blocks}</Fragment>
}

interface Theme {
  id: string
  label: string
  bg: string
  lines: Array<{ color: string; width: number }>
  isBrand?: boolean
}
const THEMES: Theme[] = [
  { id: 'minimal-dark',   label: 'Minimal Dark',   bg: '#1c1c1e', lines: [{color:'#ffde42',width:68},{color:'#888',width:52},{color:'#666',width:44},{color:'#ffde42',width:36}] },
  { id: 'bold-gradient',  label: 'Bold Gradient',  bg: 'linear-gradient(135deg,#5b21b6,#7c3aed)', lines: [{color:'#c4b5fd',width:72},{color:'#f9a8d4',width:58},{color:'#ffde42',width:40}], isBrand: true },
  { id: 'clean-light',    label: 'Clean Light',    bg: '#ffffff', lines: [{color:'#93c5fd',width:66},{color:'#60a5fa',width:50},{color:'#d1d5db',width:58},{color:'#9ca3af',width:40}] },
  { id: 'neon-accent',    label: 'Neon Accent',    bg: '#0d0d12', lines: [{color:'#a855f7',width:70},{color:'#22d3ee',width:52},{color:'#86efac',width:44},{color:'#a855f7',width:34}] },
  { id: 'warm-terra',     label: 'Warm Terra',     bg: '#1c1008', lines: [{color:'#fb923c',width:66},{color:'#fbbf24',width:54},{color:'#14b8a6',width:42},{color:'#fb923c',width:30}] },
  { id: 'ocean',          label: 'Ocean',          bg: '#0c2233', lines: [{color:'#22d3ee',width:70},{color:'#67e8f9',width:56},{color:'#a5f3fc',width:44}] },
  { id: 'rose-gold',      label: 'Rose Gold',      bg: '#1a0a10', lines: [{color:'#f43f5e',width:68},{color:'#fb7185',width:52},{color:'#fda4af',width:40},{color:'#f43f5e',width:30}] },
  { id: 'forest',         label: 'Forest',         bg: '#071a07', lines: [{color:'#4ade80',width:66},{color:'#86efac',width:50},{color:'#bbf7d0',width:40}] },
  { id: 'slate',          label: 'Slate',          bg: '#0f172a', lines: [{color:'#94a3b8',width:70},{color:'#64748b',width:54},{color:'#e2e8f0',width:44},{color:'#94a3b8',width:34}] },
]

interface PlatformOption { id: string; label: string; ratio: string; w: number; h: number }
const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'ig-square',   label: 'Instagram',       ratio: '1:1',    w: 1,   h: 1   },
  { id: 'ig-portrait', label: 'Instagram',       ratio: '4:5',    w: 4,   h: 5   },
  { id: 'ig-story',    label: 'Instagram Story', ratio: '9:16',   w: 9,   h: 16  },
  { id: 'linkedin',    label: 'LinkedIn',        ratio: '1:1',    w: 1,   h: 1   },
  { id: 'twitter',     label: 'X (Twitter)',     ratio: '16:9',   w: 16,  h: 9   },
  { id: 'facebook',    label: 'Facebook',        ratio: '1.91:1', w: 191, h: 100 },
]

const PUB_STEPS: Array<{key: 'select' | 'setup' | 'connect' | 'review'; label: string}> = [
  { key: 'select',  label: 'Select Images' },
  { key: 'setup',   label: 'Set Up Post' },
  { key: 'connect', label: 'Connect Account' },
  { key: 'review',  label: 'Review & Publish' },
]

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram', facebook: 'Facebook', twitter: 'X',
  linkedin: 'LinkedIn', tiktok: 'TikTok', threads: 'Threads',
}

const PUBLISH_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#e1306c' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877f2' },
  { id: 'twitter',   label: 'X',         color: '#fff' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0a66c2' },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101' },
  { id: 'threads',   label: 'Threads',   color: '#101010' },
] as const

export function MatteV3Editor() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [thumbMenuPos, setThumbMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const [pages, setPages] = useState([0, 1, 2, 3, 4])
  const [pageTitles, setPageTitles] = useState<Record<number, string>>({})
  const [activePage, setActivePage] = useState(0)
  const [sections, setSections] = useState<{ id: number; title: string; collapsed: boolean; afterPageId: number }[]>([])
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [editingSectionTitle, setEditingSectionTitle] = useState('')
  const nextSectionIdRef = useRef(1)
  const [insertMenuIdx, setInsertMenuIdx] = useState<number | null>(null)
  const [insertMenuPos, setInsertMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [dropSectionId, setDropSectionId] = useState<number | null>(null)
  const [sectionMenuId, setSectionMenuId] = useState<number | null>(null)
  const [sectionMenuPos, setSectionMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [pageCtxIdx, setPageCtxIdx] = useState<number | null>(null)
  const [pageCtxPos, setPageCtxPos] = useState<{ x: number; y: number } | null>(null)
  const [zoom, setZoom] = useState(100)
  const [gridView, setGridView] = useState(false)
  const [agentOpen, setAgentOpen] = useState(true)
  const [agentInput, setAgentInput] = useState('')
  const [agentMessages, setAgentMessages] = useState<Array<{
    role: string
    text: string
    variants?: Array<{ pageId: number; slot: number; label: string; description?: string; insertAt?: number }>
    variantChosen?: number
  }>>([
    {
      role: 'agent',
      text: "Here's what I created based on your brief:\n\n• 3-page social campaign on \"Safeguarding Your Innovation on Apple Platforms\"\n• Each page features a headline, supporting copy, a visual lock icon, and a clear CTA — \"Explore IP Best Practices\"\n• Consistent 1:1 square format, optimised for Instagram and LinkedIn feeds",
    },
  ])
  const [pageData, setPageData] = useState<Record<number, PlatformOption>>({ 0: PLATFORM_OPTIONS[0], 1: PLATFORM_OPTIONS[0], 2: PLATFORM_OPTIONS[0], 3: PLATFORM_OPTIONS[0], 4: PLATFORM_OPTIONS[0] })
  const [pageRenderSlot, setPageRenderSlot] = useState<Record<number, number>>({ 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 })
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)
  const [showAddPagePicker, setShowAddPagePicker] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareTab, setShareTab] = useState<'link' | 'publish' | 'download'>('link')
  const [publishPlatform, setPublishPlatform] = useState('linkedin')
  const [publishCaption, setPublishCaption] = useState('')
  const [publishHashtags, setPublishHashtags] = useState(['LayerProof', 'IPProtection', 'AppleDev', 'Innovation'])
  const [publishTitle, setPublishTitle] = useState('Social post')
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [adaptingCaption, setAdaptingCaption] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'settings' | 'history'>('settings')
  const [publishFormat, setPublishFormat] = useState<'single' | 'carousel'>('single')
  const [publishSelectedPageIds, setPublishSelectedPageIds] = useState<Set<number>>(new Set())
  const [sizeFilter, setSizeFilter] = useState<string>('all')
  const [publishStep, setPublishStep] = useState<'select' | 'setup' | 'connect' | 'review'>('select')
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, string>>({})
  const [connectingAccount, setConnectingAccount] = useState(false)
  const [publishPlatformExpanded, setPublishPlatformExpanded] = useState(false)
  const [publishScheduleType, setPublishScheduleType] = useState<'now' | 'later'>('now')
  const [publishScheduledDate, setPublishScheduledDate] = useState('')
  const [publishScheduledTime, setPublishScheduledTime] = useState('')
  type PublishDraft = {
    id: number; title: string; platform: string; imageCount: number
    format: 'single' | 'carousel'; caption: string; hashtags: string[]
    scheduleType: 'now' | 'later'; scheduledDate: string; scheduledTime: string
    savedAt: string
  }
  type PublishHistoryItem = {
    id: number; title: string; platform: string; imageCount: number
    format: 'single' | 'carousel'; status: 'published' | 'scheduled' | 'cancelled'
    publishedAt: string; scheduledFor?: string; caption?: string
  }
  const [savedDrafts, setSavedDrafts] = useState<PublishDraft[]>([])
  const [publishHistory, setPublishHistory] = useState<PublishHistoryItem[]>([
    { id: 1, title: 'Safeguarding Your Innovation', platform: 'instagram', imageCount: 3, format: 'carousel', status: 'scheduled', publishedAt: new Date().toISOString(), scheduledFor: new Date(Date.now() + 86400000).toISOString(), caption: 'Safeguarding your innovation on Apple platforms. Protect what you build with LayerProof — the IP layer every developer needs.' },
    { id: 2, title: 'Safeguarding Your Innovation', platform: 'linkedin', imageCount: 1, format: 'single', status: 'published', publishedAt: new Date(Date.now() - 3600000).toISOString(), caption: 'Protect your intellectual property before going public. LayerProof helps developers secure what they build.' },
  ])
  const [publishTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      + ` (${now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})`
  })
  const [editorTab, setEditorTab] = useState<'preview' | 'publishing'>('preview')
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [attachMenuPos, setAttachMenuPos] = useState({ x: 0, y: 0 })
  const attachBtnRef = useRef<HTMLButtonElement>(null)
  const [connectedSources, setConnectedSources] = useState<Set<string>>(new Set(['notion']))
  const [showAssetsLibrary, setShowAssetsLibrary] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetsTab, setAssetsTab] = useState<'uploads' | 'generated'>('uploads')
  const [assetsProjectFilter, setAssetsProjectFilter] = useState<string>('all')
  const [assetsProjectDropdownOpen, setAssetsProjectDropdownOpen] = useState(false)
  const [uploadFolderId, setUploadFolderId] = useState<string>('images')
  const [expandedUploadFolders, setExpandedUploadFolders] = useState<Set<string>>(new Set(['root']))
  const [assetsSearch, setAssetsSearch] = useState('')
  const [chatAttachments, setChatAttachments] = useState<Array<{id: string; label: string; bg: string}>>([])
  const pageIdRef = useRef(3)
  const [briefOpen, setBriefOpen] = useState(true)
  const [chatPanelCollapsed, setChatPanelCollapsed] = useState(false)
  const [chatPanelWidth, setChatPanelWidth] = useState(400)
  const chatResizeRef = useRef<{ startX: number; startW: number } | null>(null)

  const onChatResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    chatResizeRef.current = { startX: e.clientX, startW: chatPanelWidth }
    const onMove = (ev: MouseEvent) => {
      if (!chatResizeRef.current) return
      const delta = chatResizeRef.current.startX - ev.clientX
      const next = Math.min(600, Math.max(280, chatResizeRef.current.startW + delta))
      setChatPanelWidth(next)
    }
    const onUp = () => {
      chatResizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
  const [pagePrompts, setPagePrompts] = useState<Record<number, { prompt: string; model: string; size: string; style: string; quality: string; seed: number }>>({
    0: { prompt: 'A clean social campaign poster about safeguarding intellectual property on Apple platforms, featuring a lock icon, bold headline, and CTA button on a warm off-white background. Minimal, editorial design.', model: 'GPT Image 2', size: '1024×1024', style: 'Dynamic', quality: 'Low', seed: 666597 },
    1: { prompt: 'Dark-themed social post highlighting 3 ways to protect your IP on Apple platforms, with icon list and a blue accent CTA on a deep navy background. Clean, structured layout.', model: 'GPT Image 2', size: '1024×1024', style: 'Dynamic', quality: 'Low', seed: 842103 },
    2: { prompt: 'Purple-gradient social poster with rocket icon, bold headline encouraging developers to secure their innovation on Apple platforms, and a vibrant CTA. High energy, startup aesthetic.', model: 'GPT Image 2', size: '1024×1024', style: 'Dynamic', quality: 'Low', seed: 331847 },
  })
  const [lafOpen, setLafOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0])
  const [pendingTheme, setPendingTheme] = useState<Theme>(THEMES[0])
  const [selectedThemeOption, setSelectedThemeOption] = useState<ThemeOption>(SYSTEM_THEMES[0])
  const [amountOfText, setAmountOfText] = useState<'minimal'|'concise'|'detailed'>('concise')
  const [pendingAmount, setPendingAmount] = useState<'minimal'|'concise'|'detailed'>('concise')
  const [outlineThemeSearch, setOutlineThemeSearch] = useState('')
  const [outlineThemeCategory, setOutlineThemeCategory] = useState('All')
  const [brandPersonality, setBrandPersonality] = useState<string[]>([])
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([])
  const [customInstruction, setCustomInstruction] = useState('')
  const [spectrumValues, setSpectrumValues] = useState<Record<string, number>>({})
  const [commentMode, setCommentMode] = useState(false)
  const [tweakOpen, setTweakOpen]     = useState(false)
  const [pendingPins, setPendingPins] = useState<Array<{id:number,x:number,y:number,text:string}>>([])
  const [focusId, setFocusId]         = useState<number|null>(null)
  const [comments, setComments]       = useState<Array<{id:number,x:number,y:number,text:string,page:number}>>([])
  const [activeCommentId, setActiveCommentId] = useState<number|null>(null)
  const [generating, setGenerating]   = useState(false)
  const [genLabel, setGenLabel]       = useState('Generating…')
  const [agentThinking, setAgentThinking] = useState(false)
  const [undoStack, setUndoStack] = useState<Array<{pageId: number; slot: number; msgCount: number}>>([])
  const [redoStack, setRedoStack] = useState<Array<{pageId: number; slot: number; msgCount: number}>>([])
  const [showUndoBanner, setShowUndoBanner] = useState(false)
  const undoBannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const canUndoRef = useRef(false)
  const [msgReactions, setMsgReactions] = useState<Record<number, 'up' | 'down'>>({})
  const [showRatingBanner, setShowRatingBanner] = useState(true)
  const [ratingChosen, setRatingChosen] = useState<'sad' | 'neutral' | 'happy' | null>(null)
  const [thumbMenuPage, setThumbMenuPage] = useState<number | null>(null)
  const [expandedVariant, setExpandedVariant] = useState<{ slot: number; label: string } | null>(null)
  const commentIdRef = useRef(1)
  const pendingIdRef = useRef(100)
  const prevZoom     = useRef(100)
  const scrollDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sendingRef = useRef(false)
  const iterateModeRef = useRef(false)
  const threadRef  = useRef<HTMLDivElement>(null)

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

  const changePlatform = (p: PlatformOption) => {
    setShowPlatformPicker(false)
    const newId = pageIdRef.current++
    const insertAt = activePage + 1
    const sourceSlot = pageRenderSlot[pages[activePage]] ?? activePage
    setPageData(prev => ({ ...prev, [newId]: p }))
    setPageRenderSlot(prev => ({ ...prev, [newId]: sourceSlot }))
    setPages(prev => { const next = [...prev]; next.splice(insertAt, 0, newId); return next })
    setActivePage(insertAt)
    const platformHints: Record<string, string> = {
      'ig-square':   'copy is kept punchy for the feed, the visual hierarchy anchors the CTA in the lower third, and padding accounts for the rounded preview crop',
      'ig-portrait': 'the taller canvas gives more breathing room — headline and subhead are spaced out and the CTA sits clear of the thumb zone',
      'ig-story':    'copy is stripped to a single bold statement optimised for the 3-second swipe window, safe zones keep all text away from the top and bottom UI chrome',
      'linkedin':    'tone is shifted to a professional register, the headline leads with a value proposition, and body copy length matches what performs well in the LinkedIn feed',
      'twitter':     'headline is condensed to work at a glance on a wide crop, contrast is boosted for dark-mode feeds, and the CTA is direct and action-oriented',
      'facebook':    'the wider crop keeps the key message left-aligned for thumbnail previews, and the visual weight is balanced for both desktop and mobile feed placements',
    }
    const hint = platformHints[p.id] ?? 'content and layout have been adapted to suit this format'
    logToChat(
      `Add a new ${p.label} page (${p.ratio}) below Page ${activePage + 1}`,
      `I've created Page ${insertAt + 1} optimised for ${p.label} (${p.ratio}).\n\nBeyond resizing, ${hint}.\n\nLet me know if you'd like to tweak the copy, layout, or visual style for this format.`,
      true,
      `Optimising for ${p.label} (${p.ratio})…`
    )
  }

  const showBanner = () => {
    setShowUndoBanner(true)
    if (undoBannerTimer.current) clearTimeout(undoBannerTimer.current)
    undoBannerTimer.current = setTimeout(() => setShowUndoBanner(false), 4000)
  }

  const pushUndo = () => {
    const pageId = pages[activePage]
    const slot = pageRenderSlot[pageId] ?? activePage
    const msgCount = agentMessages.length
    setUndoStack(prev => [...prev, { pageId, slot, msgCount }])
    setRedoStack([])
  }

  const undoGeneration = () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev
      const entry = prev[prev.length - 1]
      const currentPageId = pages[activePage]
      const currentSlot = pageRenderSlot[currentPageId] ?? activePage
      const currentMsgCount = agentMessages.length
      setRedoStack(r => [...r, { pageId: currentPageId, slot: currentSlot, msgCount: currentMsgCount }])
      setPageRenderSlot(r => ({ ...r, [entry.pageId]: entry.slot }))
      setAgentMessages(msgs => [
        ...msgs.slice(0, entry.msgCount),
        { role: 'agent', text: 'Change undone. Restored to the previous version.' }
      ])
      setGenerating(false)
      setShowUndoBanner(false)
      return prev.slice(0, -1)
    })
  }

  const redoGeneration = () => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev
      const entry = prev[prev.length - 1]
      const currentPageId = pages[activePage]
      const currentSlot = pageRenderSlot[currentPageId] ?? activePage
      const currentMsgCount = agentMessages.length
      setUndoStack(u => [...u, { pageId: currentPageId, slot: currentSlot, msgCount: currentMsgCount }])
      setPageRenderSlot(r => ({ ...r, [entry.pageId]: entry.slot }))
      setAgentMessages(msgs => [
        ...msgs.slice(0, entry.msgCount),
        { role: 'agent', text: 'Change re-applied.' }
      ])
      setGenerating(false)
      showBanner()
      return prev.slice(0, -1)
    })
  }

  const logToChat = (userText: string, agentText: string, withGenerating = false, genLabelText = 'Generating…') => {
    if (withGenerating) pushUndo()
    setAgentOpen(true)
    setAgentMessages(prev => [...prev, { role: 'user', text: userText }])
    setAgentThinking(true)
    if (withGenerating) { setGenerating(true); setGenLabel(genLabelText) }
    setTimeout(() => {
      setAgentThinking(false)
      setAgentMessages(prev => [...prev, { role: 'agent', text: agentText }])
      if (withGenerating) setTimeout(() => { setGenerating(false); showBanner() }, 600)
    }, 1400)
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
    pushUndo()
    const saved = toSave.map(p => ({ id: commentIdRef.current++, x: p.x, y: p.y, text: p.text.trim(), page: activePage }))
    setComments(prev => [...prev, ...saved])
    const savedIds = saved.map(c => c.id)
    const lines = saved.map((c, i) => `#${i + 1}: ${c.text}`).join('\n')
    const userText = `[${saved.length} edit mark${saved.length > 1 ? 's' : ''} on Page ${activePage + 1}]\n${lines}`
    const agentText = `I've applied ${saved.length} targeted edit${saved.length !== 1 ? 's' : ''} to Page ${activePage + 1}:\n\n${saved.map((c, i) => `• #${i + 1}: ${c.text}`).join('\n')}\n\nThe page has been regenerated with your changes. Let me know if you'd like to adjust anything further.`
    setAgentOpen(true)
    setAgentMessages(prev => [...prev, { role: 'user', text: userText }])
    setAgentThinking(true)
    setGenerating(true)
    setGenLabel(`Applying ${saved.length} edit${saved.length !== 1 ? 's' : ''}…`)
    closeTweakBar()
    setTimeout(() => {
      setAgentThinking(false)
      setComments(prev => prev.filter(c => !savedIds.includes(c.id)))
      setAgentMessages(prev => [...prev, { role: 'agent', text: agentText }])
      setTimeout(() => setGenerating(false), 500)
    }, 2400)
  }

  const resolveComment = (id: number) => {
    setComments(prev => prev.filter(c => c.id !== id))
    setActiveCommentId(null)
  }

  const sendAgentMessage = () => {
    if (sendingRef.current) return
    const text = agentInput.trim()
    if (!text && chatAttachments.length === 0) return
    pushUndo()
    sendingRef.current = true
    const isIterate = iterateModeRef.current
    iterateModeRef.current = false
    setAgentInput('')
    setAgentOpen(true)
    const attachPrefix = chatAttachments.length > 0
      ? `[Assets: ${chatAttachments.map(a => a.label).join(', ')}]\n`
      : ''
    setAgentMessages(prev => [...prev, { role: 'user', text: attachPrefix + (text || 'Apply these assets to the design') }])
    setChatAttachments([])
    setAgentThinking(true)
    setGenerating(true)
    setGenLabel(isIterate ? 'Generating variant…' : 'Generating…')

    if (isIterate) {
      const currentPlatform = pageData[pages[activePage]] ?? PLATFORM_OPTIONS[0]
      const sourceSlot = pageRenderSlot[pages[activePage]] ?? activePage
      const idA = pageIdRef.current++
      const idB = pageIdRef.current++
      const idC = pageIdRef.current++
      const slotA = (sourceSlot + 1) % 3
      const slotB = (sourceSlot + 2) % 3
      const slotC = sourceSlot % 3
      // Register platform/slot data but do NOT add to pages list yet
      setPageData(prev => ({ ...prev, [idA]: currentPlatform, [idB]: currentPlatform, [idC]: currentPlatform }))
      setPageRenderSlot(prev => ({ ...prev, [idA]: slotA, [idB]: slotB, [idC]: slotC }))
      const insertAt = activePage + 1
      const lower = text.toLowerCase()
      const isColor = lower.includes('colour') || lower.includes('color')
      const isLayout = lower.includes('layout')
      const isCopy = lower.includes('copy') || lower.includes('text') || lower.includes('headline')
      setTimeout(() => {
        setAgentThinking(false)
        setAgentMessages(prev => [...prev, {
          role: 'agent',
          text: `Here are 3 variants based on your direction — "${text}". Pick the one you'd like to keep:`,
          variants: [
            {
              pageId: idA, slot: slotA, label: 'Version A', insertAt,
              description: isColor ? 'Warmer tones with higher contrast — draws the eye to the CTA.' : isLayout ? 'Headline-first layout with generous white space for a premium feel.' : isCopy ? 'Punchy, direct copy — short headline, single-line CTA.' : 'Minimal approach — clean hierarchy, lots of breathing room.',
            },
            {
              pageId: idB, slot: slotB, label: 'Version B', insertAt,
              description: isColor ? 'Cooler palette, more muted — polished and professional.' : isLayout ? 'Visual-first layout — image leads, copy anchors the bottom third.' : isCopy ? 'Narrative-driven copy — hooks with a question, builds to the CTA.' : 'Bold approach — strong visual weight, accent colour on headline.',
            },
            {
              pageId: idC, slot: slotC, label: 'Version C', insertAt,
              description: isColor ? 'High-contrast dark mode — stands out in a busy feed.' : isLayout ? 'Split layout — left text, right visual, balanced weight.' : isCopy ? 'Emotional copy — speaks to the reader\'s ambition, softer CTA.' : 'Experimental — breaks the grid slightly for visual tension.',
            },
          ],
        }])
        setTimeout(() => { setGenerating(false); sendingRef.current = false }, 600)
      }, 2200)
      return
    }

    const lower = text.toLowerCase()
    const agentReply = lower.includes('color') || lower.includes('colour')
      ? `I've updated the colour palette across Page ${activePage + 1} based on your direction. The new tones should feel more on-brand. Want me to apply the same change to the other pages too?`
      : lower.includes('copy') || lower.includes('text') || lower.includes('headline') || lower.includes('caption')
      ? `I've rewritten the copy on Page ${activePage + 1} with your direction in mind. The headline and supporting text have been updated to better match your tone and intent. Let me know if you'd like a different angle.`
      : lower.includes('layout') || lower.includes('move') || lower.includes('align')
      ? `I've adjusted the layout on Page ${activePage + 1}. Elements have been repositioned for better visual balance. Want me to apply a similar layout change to the other pages?`
      : lower.includes('font') || lower.includes('type') || lower.includes('size')
      ? `I've updated the typography on Page ${activePage + 1}. The font size and weight have been adjusted for readability and visual hierarchy.`
      : lower.includes('icon') || lower.includes('image') || lower.includes('photo') || lower.includes('visual')
      ? `I've updated the visual element on Page ${activePage + 1}. The new image better supports the message and overall aesthetic. Want me to swap visuals on the other pages too?`
      : `I've applied your changes to Page ${activePage + 1}. The post has been regenerated with your direction in mind. If you'd like to refine it further or apply this to other pages, just say the word.`
    setTimeout(() => {
      setAgentThinking(false)
      setAgentMessages(prev => [...prev, { role: 'agent', text: agentReply }])
      setTimeout(() => { setGenerating(false); sendingRef.current = false; showBanner() }, 600)
    }, 2000)
  }

  const addPage = () => setShowAddPagePicker(true)

  const createBlankPage = (platform: PlatformOption) => {
    setShowAddPagePicker(false)
    const newId = pageIdRef.current++
    const newPageNum = activePage + 2
    setPageData(prev => ({ ...prev, [newId]: platform }))
    setPageRenderSlot(prev => ({ ...prev, [newId]: -1 }))
    setPages(p => { const next = [...p]; next.splice(activePage + 1, 0, newId); return next })
    setActivePage(activePage + 1)
    setAgentOpen(true)
    setAgentMessages(prev => [...prev, { role: 'user', text: `Add a blank ${platform.label} (${platform.ratio}) page after Page ${activePage + 1}` }])
    setAgentThinking(true)
    setTimeout(() => {
      setAgentThinking(false)
      setAgentMessages(prev => [...prev, {
        role: 'agent',
        text: `Page ${newPageNum} is ready — blank canvas, ${platform.label} format (${platform.ratio}).\n\nWhat would you like to create here?\n\n• Generate a new post from a fresh brief\n• Adapt content from another page in this campaign\n• Try a different visual style or layout angle\n• Use this page for a specific platform or audience\n\nJust tell me the direction and I'll get started.`
      }])
    }, 1000)
  }

  const deletePage = () => {
    if (pages.length === 1) return
    const deletedNum = activePage + 1
    setPages(p => p.filter((_, i) => i !== activePage))
    setActivePage(i => Math.max(i - 1, 0))
    logToChat(
      `Delete Page ${deletedNum}`,
      `Page ${deletedNum} has been removed. Your campaign now has ${pages.length - 1} page${pages.length - 1 !== 1 ? 's' : ''}. I've kept all remaining pages intact.`
    )
  }

  const duplicatePage = () => {
    const newId = pageIdRef.current++
    setPageData(prev => ({ ...prev, [newId]: prev[pages[activePage]] ?? PLATFORM_OPTIONS[0] }))
    setPageRenderSlot(prev => ({ ...prev, [newId]: prev[pages[activePage]] ?? activePage }))
    setPages(p => { const next = [...p]; next.splice(activePage + 1, 0, newId); return next })
    setActivePage(activePage + 1)
    logToChat(
      `Duplicate Page ${activePage + 1}`,
      `I've duplicated Page ${activePage + 1} — the copy is now Page ${activePage + 2}. It's an exact replica for now. Want me to vary the copy or layout to differentiate it from the original?`
    )
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

  const openPublishingTab = () => {
    setPublishStep('select')
    setEditorTab('publishing')
  }

  const prevPage = () => setActivePage(i => Math.max(i - 1, 0))
  const nextPage = () => setActivePage(i => Math.min(i + 1, pages.length - 1))

  const reorderPages = (from: number, to: number) => {
    if (from === to) return
    setPages(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setActivePage(prev => {
      if (prev === from) return to
      if (from < to && prev > from && prev <= to) return prev - 1
      if (from > to && prev < from && prev >= to) return prev + 1
      return prev
    })
  }

  const addSection = (prevIdx: number) => {
    const id = nextSectionIdRef.current++
    const count = sections.length + 1
    const afterPageId = pages[prevIdx]
    setSections(prev => [...prev, { id, title: `Section ${count}`, collapsed: false, afterPageId }])
    setEditingSectionId(id)
    setEditingSectionTitle(`Section ${count}`)
  }

  const movePageToSection = (pageIdx: number, sectionId: number) => {
    const sec = sections.find(s => s.id === sectionId)
    if (!sec) return
    const anchorIdx = pages.indexOf(sec.afterPageId)
    if (anchorIdx === -1) return
    // Insert right after the anchor (first slot of that section)
    const targetIdx = anchorIdx + 1
    reorderPages(pageIdx, targetIdx)
  }

  const deleteSection = (id: number) => {
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const toggleSectionCollapse = (id: number) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, collapsed: !s.collapsed } : s))
  }

  const commitSectionTitle = () => {
    if (editingSectionId === null) return
    const title = editingSectionTitle.trim() || 'Section'
    setSections(prev => prev.map(s => s.id === editingSectionId ? { ...s, title } : s))
    setEditingSectionId(null)
  }

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

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [agentMessages, agentThinking])

  useEffect(() => {
    if (!showPlatformPicker) return
    const close = () => setShowPlatformPicker(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showPlatformPicker])

  useEffect(() => {
    canUndoRef.current = undoStack.length > 0
  }, [undoStack])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        if (canUndoRef.current) { e.preventDefault(); undoGeneration() }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault(); redoGeneration()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
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
          {chatPanelCollapsed && (
            <button
              className="mv3-icon-btn"
              onClick={() => setChatPanelCollapsed(false)}
              title="Expand panel"
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.5" y="1.5" width="17" height="17" rx="2.5"/>
                <line x1="7" y1="1.5" x2="7" y2="18.5"/>
              </svg>
            </button>
          )}
          <div className="mv3-divider-v" />
          <div className="mv3-breadcrumb">
            <span className="mv3-campaign-title">Social Campaign – Present intellectual property</span>
          </div>
        </div>
        <div className="mv3-topbar-right">
          <div className="mv3-divider-v" />
          <button className={`mv3-sub-pill-btn${showOutline ? ' mv3-sub-pill-btn--active' : ''}`} onClick={() => setShowOutline(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/>
            </svg>
            Outline
          </button>
          <button className="mv3-sub-pill-btn" onClick={() => { setPendingTheme(selectedTheme); setPendingAmount(amountOfText); setLafOpen(true) }}>
            <div className="mv3-laf-thumb-mini" style={{ background: selectedTheme.bg }}>
              {selectedTheme.lines.slice(0, 3).map((l, i) => (
                <div key={i} className="mv3-laf-thumb-mini-line" style={{ background: l.color, width: `${l.width * 0.55}%` }} />
              ))}
            </div>
            Look &amp; Feel
          </button>
          <button className="mv3-rate-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Rate
          </button>
          <button className="mv3-sub-share-btn" onClick={() => { setShareTab('link'); setShowShareMenu(true) }}>Share</button>
          <div className="mv3-avatar">T</div>
        </div>
      </header>

      {/* ── Body — always rendered so agent panel can animate out ── */}
      <div className="mv3-body">
        {/* Canvas zone — tabs + pages sidebar + main canvas */}
        <div className="mv3-canvas-zone">

          {/* ── Editor tabs ── */}
          <div className="mv3-editor-tabs">
            <div className="mv3-editor-tab-group">
              <button className="mv3-editor-tab mv3-editor-tab--active" onClick={() => setEditorTab('preview')}>
                Image preview
              </button>
              <button className="mv3-editor-tab" onClick={openPublishingTab}>
                Publishing
              </button>
            </div>
          </div>

          {/* Pages + canvas row */}
          <div className="mv3-canvas-row">

        {/* Left sidebar — Pages */}
        <aside className={`mv3-sidebar${sidebarCollapsed ? ' mv3-sidebar--collapsed' : ''}`}>
          <div className="mv3-sidebar-header">
            {!sidebarCollapsed && (
              <div className="mv3-sidebar-header-content">
              </div>
            )}
            <button
              className="mv3-sidebar-toggle"
              onClick={() => setSidebarCollapsed(v => !v)}
              data-tip={sidebarCollapsed ? 'Expand pages panel' : 'Collapse pages panel'}
              data-tip-dir={sidebarCollapsed ? 'right' : undefined}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </div>
          <div className="mv3-pages-list">
            {(() => {
              const items: React.ReactNode[] = []
              // Map pageId → section anchored after that page
              const sectionAfterPage: Record<number, typeof sections[0]> = {}
              sections.forEach(s => { sectionAfterPage[s.afterPageId] = s })

              // Track which section each page currently falls under
              let currentSection: typeof sections[0] | null = null

              pages.forEach((pageId, idx) => {
                // Insert between-page zone and any section header before this page (except before first)
                if (idx > 0) {
                  const prevPageId = pages[idx - 1]
                  const prevIdx = idx - 1
                  items.push(
                    <div key={`between-${idx}`} className="mv3-between-pages">
                      <button
                        className="mv3-insert-plus-btn"
                        onClick={e => {
                          e.stopPropagation()
                          if (insertMenuIdx === prevIdx) { setInsertMenuIdx(null); setInsertMenuPos(null) }
                          else {
                            const r = e.currentTarget.getBoundingClientRect()
                            setInsertMenuPos({ x: r.right + 6, y: r.top + r.height / 2 })
                            setInsertMenuIdx(prevIdx)
                          }
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>
                  )
                  // Section header anchored after prevPageId
                  if (sectionAfterPage[prevPageId]) {
                    const sec = sectionAfterPage[prevPageId]
                    currentSection = sec
                    items.push(
                      <div
                        key={`sec-${sec.id}`}
                        className={`mv3-section-header${dropSectionId === sec.id ? ' mv3-section-header--drop-target' : ''}`}
                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropSectionId(sec.id) }}
                        onDragLeave={() => setDropSectionId(null)}
                        onDrop={e => { e.preventDefault(); setDropSectionId(null); if (dragIdx !== null) movePageToSection(dragIdx, sec.id) }}
                      >
                        <button
                          className="mv3-section-chevron"
                          onClick={() => toggleSectionCollapse(sec.id)}
                          title={sec.collapsed ? 'Expand section' : 'Collapse section'}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: sec.collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform .15s' }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                        {editingSectionId === sec.id ? (
                          <input
                            className="mv3-section-title-input"
                            value={editingSectionTitle}
                            autoFocus
                            onChange={e => setEditingSectionTitle(e.target.value)}
                            onBlur={commitSectionTitle}
                            onKeyDown={e => { if (e.key === 'Enter') commitSectionTitle(); if (e.key === 'Escape') { setEditingSectionId(null) } }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="mv3-section-title"
                            onDoubleClick={() => { setEditingSectionId(sec.id); setEditingSectionTitle(sec.title) }}
                            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setSectionMenuId(sec.id); setSectionMenuPos({ x: e.clientX, y: e.clientY }) }}
                          >{sec.title}</span>
                        )}
                      </div>
                    )
                  }
                }

                // Page is collapsed if it falls under a collapsed section
                const isCollapsed = currentSection?.collapsed ?? false

                if (!isCollapsed) {
                  items.push(
                    <div
                      key={pageId}
                      className={`mv3-page-thumb-group${dragIdx === idx ? ' mv3-page-thumb-group--dragging' : ''}${dropIdx === idx && dragIdx !== idx ? ' mv3-page-thumb-group--drop-target' : ''}`}
                      draggable
                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(idx) }}
                      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropIdx(idx) }}
                      onDragEnd={() => { setDragIdx(null); setDropIdx(null); setDropSectionId(null) }}
                      onDrop={e => { e.preventDefault(); if (dragIdx !== null) reorderPages(dragIdx, idx); setDragIdx(null); setDropIdx(null) }}
                      onMouseLeave={() => setThumbMenuPage(null)}
                    >
                      <div className="mv3-page-thumb-row">
                        <span className={`mv3-page-num${idx === activePage ? ' mv3-page-num--active' : ''}`}>{idx + 1}</span>
                        <div className="mv3-page-thumb-wrap">
                          <button
                            className={`mv3-page-thumb-btn${idx === activePage ? ' mv3-page-thumb-btn--active' : ''}`}
                            onClick={() => setActivePage(idx)}
                            onContextMenu={e => {
                              e.preventDefault(); e.stopPropagation()
                              setThumbMenuPos({ x: e.clientX, y: e.clientY })
                              setThumbMenuPage(idx)
                            }}
                          >
                            <div className="mv3-page-thumb-preview">
                              <div className="mv3-page-thumb-inner">
                                <MiniPostPreview page={pageRenderSlot[pages[idx]] ?? idx} ratio={pageData[pages[idx]]?.ratio ?? '1:1'} />
                              </div>
                            </div>
                          </button>
                          <button
                            className="mv3-thumb-more-btn"
                            onClick={e => {
                              e.stopPropagation()
                              if (thumbMenuPage === idx) { setThumbMenuPage(null); setThumbMenuPos(null) }
                              else {
                                const r = e.currentTarget.getBoundingClientRect()
                                setThumbMenuPos({ x: r.right + 4, y: r.top })
                                setThumbMenuPage(idx)
                              }
                            }}
                            title="Page options"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                            </svg>
                          </button>
                          {thumbMenuPage === idx && thumbMenuPos && (() => {
                              const closeMenu = () => { setThumbMenuPage(null); setThumbMenuPos(null) }
                              return (
                                <>
                                  <div className="mv3-thumb-menu-backdrop" onClick={closeMenu} />
                                  <div className="mv3-thumb-menu" style={{ left: thumbMenuPos.x, top: thumbMenuPos.y }}>
                                    {/* Duplicate */}
                                    <button className="mv3-thumb-menu-item" onClick={() => {
                                      closeMenu()
                                      const pageId = pages[idx]
                                      const newId = pageIdRef.current++
                                      setPageData(prev => ({ ...prev, [newId]: prev[pageId] ?? PLATFORM_OPTIONS[0] }))
                                      setPageRenderSlot(prev => ({ ...prev, [newId]: prev[pageId] ?? idx }))
                                      setPages(p => { const next = [...p]; next.splice(idx + 1, 0, newId); return next })
                                      setActivePage(idx + 1)
                                    }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                      </svg>
                                      Duplicate
                                    </button>
                                    {/* Move up */}
                                    <button className="mv3-thumb-menu-item" disabled={idx === 0} onClick={() => {
                                      if (idx === 0) return
                                      closeMenu()
                                      setPages(p => { const next = [...p]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; return next })
                                      setActivePage(idx - 1)
                                    }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                                      </svg>
                                      Move up
                                    </button>
                                    {/* Move down */}
                                    <button className="mv3-thumb-menu-item" disabled={idx === pages.length - 1} onClick={() => {
                                      if (idx === pages.length - 1) return
                                      closeMenu()
                                      setPages(p => { const next = [...p]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; return next })
                                      setActivePage(idx + 1)
                                    }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                                      </svg>
                                      Move down
                                    </button>
                                    <div className="mv3-thumb-menu-divider" />
                                    {/* Set as cover */}
                                    <button className="mv3-thumb-menu-item" disabled={idx === 0} onClick={() => {
                                      if (idx === 0) return
                                      closeMenu()
                                      setPages(p => { const next = [...p]; const [removed] = next.splice(idx, 1); next.unshift(removed); return next })
                                      setActivePage(0)
                                    }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                      </svg>
                                      Set as cover
                                    </button>
                                    {/* Download image */}
                                    <button className="mv3-thumb-menu-item" onClick={closeMenu}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                      </svg>
                                      Download image
                                    </button>
                                    {/* Move to section */}
                                    {sections.length > 0 && (
                                      <>
                                        <div className="mv3-thumb-menu-divider" />
                                        <div className="mv3-thumb-menu-label">Move to section</div>
                                        {sections.map(sec => (
                                          <button key={sec.id} className="mv3-thumb-menu-item" onClick={() => { closeMenu(); movePageToSection(idx, sec.id) }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                                            </svg>
                                            {sec.title}
                                          </button>
                                        ))}
                                      </>
                                    )}
                                    <div className="mv3-thumb-menu-divider" />
                                    {/* Delete */}
                                    <button className="mv3-thumb-menu-item mv3-thumb-menu-item--danger" disabled={pages.length === 1} onClick={() => {
                                      if (pages.length === 1) return
                                      closeMenu()
                                      setPages(p => p.filter((_, i) => i !== idx))
                                      setActivePage(i => Math.max(i - 1, 0))
                                    }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                      </svg>
                                      Delete page
                                    </button>
                                  </div>
                                </>
                              )
                            })()}
                        </div>
                      </div>
                    </div>
                  )
                }
              })
              return items
            })()}
            {/* Add page — last slot */}
            <div className="mv3-page-thumb-row" style={{ marginTop: 4 }}>
              <span style={{ width: 16, flexShrink: 0 }} />
              <button className="mv3-sidebar-add-page-btn" onClick={e => { e.stopPropagation(); addPage() }} title="Add page">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="mv3-main">

          {/* ── Page toolbar bar ── */}
          {!(commentMode || tweakOpen) && (
          <div className="mv3-page-toolbar" onClick={e => e.stopPropagation()}>
            {/* Left actions */}
            <button className="mv3-sel-btn" onClick={e => { e.stopPropagation(); setShowVersionHistory(true); setSelectedVersionId(null) }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/>
              </svg>
              Version history
            </button>
            <button className="mv3-sel-btn mv3-sel-btn--mark" onClick={e => { e.stopPropagation(); setCommentMode(true) }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Mark to edit
            </button>
            <button className="mv3-sel-btn" onClick={e => e.stopPropagation()}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
              Image Property
            </button>

            {/* Platform info + action icons */}
            {(() => {
              const tbPlatform = pageData[pages[activePage]] ?? PLATFORM_OPTIONS[0]
              return (
                <>
                  <div className="mv3-platform-btn-wrap">
                    <button className="mv3-platform-btn" onClick={e => { e.stopPropagation(); setShowPlatformPicker(p => !p) }}>
                      <span className="mv3-platform-btn-label">{tbPlatform.label}</span>
                      <span className="mv3-platform-btn-ratio">{tbPlatform.ratio}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {showPlatformPicker && (
                      <div className="mv3-platform-picker mv3-platform-picker--right" onClick={e => e.stopPropagation()}>
                        <div className="mv3-platform-picker-title">Choose platform &amp; size</div>
                        {PLATFORM_OPTIONS.map(p => (
                          <button key={p.id} className={`mv3-platform-option${tbPlatform.id === p.id ? ' mv3-platform-option--active' : ''}`} onClick={() => changePlatform(p)}>
                            <span className="mv3-platform-option-label">{p.label}</span>
                            <span className="mv3-platform-option-ratio">{p.ratio}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="mv3-tb-icon-btn" title="Duplicate page" onClick={e => { e.stopPropagation(); duplicatePage() }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button className="mv3-tb-icon-btn" title="Download">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button className="mv3-tb-icon-btn mv3-tb-icon-btn--danger" title="Delete page" onClick={e => { e.stopPropagation(); deletePage() }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </>
              )
            })()}
          </div>
          )}

          {/* ── Floating comment mode bar ── */}
          {(commentMode || tweakOpen) && (
            <div className="mv3-comment-float-bar" onClick={e => e.stopPropagation()}>
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
            </div>
          )}

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
                      <PostPreview page={pageRenderSlot[pages[idx]] ?? idx} />
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

              {(() => {
                const canvasPlatform = pageData[pages[activePage]] ?? PLATFORM_OPTIONS[0]
                const BASE_PX = 600
                const maxDim = Math.max(canvasPlatform.w, canvasPlatform.h)
                const canvasW = Math.round(BASE_PX * canvasPlatform.w / maxDim)
                const canvasH = Math.round(BASE_PX * canvasPlatform.h / maxDim)
                return (
              <div className={`mv3-canvas-wrap${sidebarCollapsed ? ' mv3-canvas-wrap--peek' : ''}`}>
                <div className="mv3-canvas-slot">
                  <div className="mv3-canvas-inner" style={{ width: canvasW * (zoom / 100) }}>
                  {/* Platform header */}
                  <div className="mv3-canvas-platform-header">
                    <span className="mv3-canvas-platform-name">{canvasPlatform.label}</span>
                    <span className="mv3-canvas-platform-sep">·</span>
                    <span className="mv3-canvas-platform-ratio">{canvasPlatform.ratio}</span>
                  </div>
                  {/* Canvas card — wrapper collapses layout to scaled size so banners sit flush below */}
                  <div style={{ position: 'relative', width: canvasW * (zoom / 100), height: canvasH * (zoom / 100), flexShrink: 0 }}>
                  <div
                    className={`mv3-canvas-card${selected ? ' mv3-canvas-card--selected' : ''}${commentMode ? ' mv3-canvas-comment-mode' : ''}`}
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: canvasW, height: canvasH, position: 'absolute', top: 0, left: 0 }}
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
                    <PostPreview page={pageRenderSlot[pages[activePage]] ?? activePage} />
                    {/* Generation overlay */}
                    {generating && (
                      <div className="mv3-gen-overlay">
                        <div className="mv3-gen-scan" />
                        <div className="mv3-gen-noise" />
                        <div className="mv3-gen-bar-wrap">
                          <div className="mv3-gen-bar"><div className="mv3-gen-bar-fill" /></div>
                          <span className="mv3-gen-label">{genLabel}</span>
                        </div>
                      </div>
                    )}
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
                  </div>{/* end canvas-card scale wrapper */}

                  {/* Undo banner — below canvas card */}
                  {showUndoBanner && (
                    <div className="mv3-undo-banner" onClick={() => setShowUndoBanner(false)}>
                      <span className="mv3-undo-banner-text">Generation complete</span>
                      <button
                        className="mv3-undo-banner-btn"
                        onClick={e => { e.stopPropagation(); undoGeneration(); setShowUndoBanner(false) }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                        </svg>
                        Undo
                      </button>
                      <button className="mv3-undo-banner-close" onClick={e => { e.stopPropagation(); setShowUndoBanner(false) }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Rating — inline below the last page */}
                  {showRatingBanner && activePage === pages.length - 1 && !tweakOpen && (
                    <div className="mv3-rating-banner" onClick={e => e.stopPropagation()}>
                      <div className="mv3-rating-inner">
                        <span className="mv3-rating-label">Help refine our product</span>
                        <span className="mv3-rating-question">How satisfied are you with the output?</span>
                        <div className="mv3-rating-options">
                          {(['sad', 'neutral', 'happy'] as const).map(r => (
                            <button
                              key={r}
                              className={`mv3-rating-btn${ratingChosen === r ? ' mv3-rating-btn--chosen' : ''}`}
                              onClick={() => setRatingChosen(r)}
                              title={r === 'sad' ? 'Not satisfied' : r === 'neutral' ? 'Neutral' : 'Satisfied'}
                            >
                              {r === 'sad' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                                </svg>
                              )}
                              {r === 'neutral' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                                </svg>
                              )}
                              {r === 'happy' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                        <button className="mv3-rating-close" onClick={() => setShowRatingBanner(false)} title="Dismiss">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  </div>{/* end mv3-canvas-inner */}

                  {/* Next page peek — only when pages sidebar is collapsed */}
                  {sidebarCollapsed && activePage < pages.length - 1 && (() => {
                    const nextPlatform = pageData[pages[activePage + 1]] ?? PLATFORM_OPTIONS[0]
                    const maxDim2 = Math.max(nextPlatform.w, nextPlatform.h)
                    const peekW = Math.round(600 * nextPlatform.w / maxDim2) * (zoom / 100)
                    const peekH = Math.round(600 * nextPlatform.h / maxDim2) * (zoom / 100)
                    return (
                      <div className="mv3-canvas-next-peek" style={{ width: peekW }}>
                        <div className="mv3-canvas-next-peek-inner" style={{ height: 48, overflow: 'hidden' }}>
                          <div style={{ width: peekW, height: peekH, position: 'relative', transform: `scale(${zoom / 100})`, transformOrigin: 'top left', flexShrink: 0 }}>
                            <PostPreview page={pageRenderSlot[pages[activePage + 1]] ?? (activePage + 1)} />
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                </div>
              </div>
                )
              })()}

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
          </div>{/* end mv3-canvas-row */}
        </div>{/* end mv3-canvas-zone */}

        {/* ── Left side panel: brief + agent ── */}
        <div className={`mv3-agent-panel-wrap${chatPanelCollapsed || editorTab === 'publishing' ? ' mv3-agent-panel-wrap--collapsed' : ''}`} style={chatPanelCollapsed || editorTab === 'publishing' ? undefined : { width: chatPanelWidth }}>
          <div className="mv3-chat-resize-handle" onMouseDown={onChatResizeStart} />

            {/* ── Brief panel — sits above the agent panel ── */}
            {(() => {
              const brief = pagePrompts[pages[activePage]]
              if (!brief) return null
              return (
                <div className="mv3-brief-panel" onClick={e => e.stopPropagation()}>
                  <div className="mv3-brief-panel-header" onClick={() => setBriefOpen(o => !o)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--t2)', flex: 'none' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <span className="mv3-brief-panel-title">Brief</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      className="mv3-brief-chevron" style={{ transform: briefOpen ? 'rotate(180deg)' : 'none' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  {briefOpen && (
                    <div className="mv3-brief-body">
                      <p className="mv3-brief-text">{brief.prompt}</p>
                      <div className="mv3-brief-panel-actions">
                        <button className="mv3-brief-icon-btn" title="Copy brief" onClick={() => navigator.clipboard?.writeText(brief.prompt)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                        <button className="mv3-brief-iterate-btn" onClick={e => {
                          e.stopPropagation()
                          setBriefOpen(false)
                          setAgentOpen(true)
                          iterateModeRef.current = true
                          setAgentMessages(prev => [...prev, { role: 'user', text: 'Iterate on this image' }])
                          setAgentThinking(true)
                          setTimeout(() => {
                            setAgentThinking(false)
                            setAgentMessages(prev => [...prev, {
                              role: 'agent',
                              text: `Sure! Here's the current brief I'm working from:\n\n> ${brief.prompt}\n\nWhat would you like to change for the new variant?\n\n• Content angle — different message, hook, or narrative\n• Visual layout — composition, hierarchy, spacing\n• Colour palette — warmer, cooler, more contrast\n• Typography — font weight, size, style\n• Copy tone — more formal, punchy, emotional\n• Target audience — who this page speaks to\n\nJust tell me what direction to explore and I'll generate a fresh version.`,
                            }])
                          }, 1000)
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                          </svg>
                          Iterate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            <aside className="mv3-agent-panel" onClick={e => e.stopPropagation()}>
              <div className="mv3-agent-panel-header">
                <div className="mv3-agent-panel-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c-1.2 5.4-5 7-9 7 0 5.4 3.3 9.8 9 11 5.7-1.2 9-5.6 9-11-4 0-7.8-1.6-9-7z"/>
                  </svg>
                  Agent
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    className="mv3-agent-clear-btn"
                    title="Clear session"
                    onClick={() => setAgentMessages([{ role: 'agent', text: 'Session cleared. What would you like to work on?' }])}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                    </svg>
                    Clear
                  </button>
                  <button
                    className="mv3-agent-collapse-btn"
                    title={chatPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
                    onClick={() => setChatPanelCollapsed(c => !c)}
                  >
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1.5" y="1.5" width="17" height="17" rx="2.5"/>
                      <line x1="7" y1="1.5" x2="7" y2="18.5"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mv3-agent-thread" ref={threadRef}>
                {agentMessages.map((msg, i) => (
                  <div key={i} className={`mv3-agent-msg mv3-agent-msg--${msg.role}`}>
                    <div className="mv3-agent-msg-body">
                    <div className="mv3-agent-msg-bubble">{formatMessage(msg.text)}</div>

                    {/* Variant picker cards */}
                    {msg.variants && (
                      <div className="mv3-variant-picker">
                        {msg.variants.map(v => (
                          <div
                            key={v.pageId}
                            className={`mv3-variant-card${msg.variantChosen === v.pageId ? ' mv3-variant-card--chosen' : ''}`}
                          >
                            <div className="mv3-variant-thumb">
                              <MiniPostPreview page={v.slot} />
                              <button
                                className="mv3-variant-expand-btn"
                                onClick={e => { e.stopPropagation(); setExpandedVariant({ slot: v.slot, label: v.label }) }}
                                title="Preview"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                                  <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                                </svg>
                              </button>
                            </div>
                            <div className="mv3-variant-info">
                              <span className="mv3-variant-label">{v.label}</span>
                              {v.description && <p className="mv3-variant-desc">{v.description}</p>}
                              {msg.variantChosen ? (
                                msg.variantChosen === v.pageId
                                  ? <span className="mv3-variant-chosen-badge">Selected</span>
                                  : null
                              ) : (
                                <button
                                  className="mv3-variant-use-btn"
                                  onClick={() => {
                                    // Insert only the chosen page into the pages list
                                    const insertAt = v.insertAt ?? activePage + 1
                                    // Copy the source page's brief so the brief panel stays visible
                                    const sourcePageId = pages[insertAt - 1]
                                    const sourceBrief = pagePrompts[sourcePageId]
                                    if (sourceBrief) setPagePrompts(prev => ({ ...prev, [v.pageId]: sourceBrief }))
                                    setPages(prev => {
                                      const next = [...prev]
                                      next.splice(insertAt, 0, v.pageId)
                                      setActivePage(insertAt)
                                      return next
                                    })
                                    setAgentMessages(prev => prev.map((m, j) =>
                                      j === i ? { ...m, variantChosen: v.pageId } : m
                                    ))
                                    setAgentMessages(prev => [...prev, {
                                      role: 'agent',
                                      text: `Great choice! I've kept ${v.label} and removed the other variants. Let me know if you'd like to refine it further.`,
                                    }])
                                  }}
                                >
                                  Use this
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.role === 'agent' && (
                      <div className="mv3-msg-actions">
                        <button
                          className={`mv3-msg-react-btn${msgReactions[i] === 'up' ? ' mv3-msg-react-btn--active' : ''}`}
                          onClick={() => setMsgReactions(r => ({ ...r, [i]: r[i] === 'up' ? undefined as any : 'up' }))}
                          title="Good response"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill={msgReactions[i] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                          </svg>
                        </button>
                        <button
                          className={`mv3-msg-react-btn${msgReactions[i] === 'down' ? ' mv3-msg-react-btn--active mv3-msg-react-btn--down' : ''}`}
                          onClick={() => setMsgReactions(r => ({ ...r, [i]: r[i] === 'down' ? undefined as any : 'down' }))}
                          title="Bad response"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill={msgReactions[i] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                          </svg>
                        </button>
                        {undoStack.length > 0 && i === agentMessages.length - 1 && (
                          <button className="mv3-msg-react-btn mv3-msg-undo-btn" onClick={undoGeneration} title="Undo this generation">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                            </svg>
                            Undo
                          </button>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                ))}
                {agentThinking && (
                  <div className="mv3-agent-msg mv3-agent-msg--agent">
                    <div className="mv3-agent-msg-bubble mv3-agent-typing">
                      <span className="mv3-typing-dot" />
                      <span className="mv3-typing-dot" />
                      <span className="mv3-typing-dot" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mv3-agent-compose">
                <div className="mv3-compose-context-row">
                  <div className="mv3-compose-page-chip">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
                    </svg>
                    Page {activePage + 1}
                  </div>
                  {pageData[pages[activePage]] && (
                    <div className="mv3-compose-platform-chip">
                      {pageData[pages[activePage]].label} · {pageData[pages[activePage]].ratio}
                    </div>
                  )}
                </div>
                {chatAttachments.length > 0 && (
                  <div className="mv3-compose-attachments">
                    {chatAttachments.map(a => (
                      <div key={a.id} className="mv3-compose-attachment">
                        <div className="mv3-compose-attachment-thumb" style={{ background: a.bg }} />
                        <span className="mv3-compose-attachment-label">{a.label}</span>
                        <button className="mv3-compose-attachment-remove" onClick={() => setChatAttachments(prev => prev.filter(x => x.id !== a.id))}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  className="mv3-agent-input"
                  placeholder={`Edit Page ${activePage + 1}…`}
                  value={agentInput}
                  rows={1}
                  onChange={e => {
                    setAgentInput(e.target.value)
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAgentMessage() } }}
                />
                <div className="mv3-agent-compose-bar">
                  <div className="mv3-attach-wrap">
                    {showAttachMenu && (
                      <>
                        <div className="mv3-attach-backdrop" onClick={() => setShowAttachMenu(false)} />
                        <div className="mv3-attach-menu" style={{ left: attachMenuPos.x, top: attachMenuPos.y - 8, transform: 'translateY(-100%)' }}>
                          <div className="mv3-attach-header">Chat actions</div>

                          {/* Primary actions — card style */}
                          <button className="mv3-attach-item" onClick={() => setShowAttachMenu(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                            </svg>
                            Upload file
                          </button>
                          <button className="mv3-attach-item" onClick={() => { setShowAttachMenu(false); setSelectedAssets([]); setShowAssetsLibrary(true) }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            Select from Assets
                          </button>

                          {/* Connector rows */}
                          {[
                            {
                              id: 'google-drive',
                              label: 'Google Drive',
                              icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4.5 19.5L8 13.5H22L18.5 19.5H4.5Z" fill="#1FA463"/>
                                  <path d="M2 19.5L8 9L11.5 15H5.5L2 19.5Z" fill="#4285F4"/>
                                  <path d="M16 9H8L12 3L20 9L16.5 15H11.5L16 9Z" fill="#FBBC04"/>
                                </svg>
                              ),
                            },
                            {
                              id: 'notion',
                              label: 'Notion',
                              icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.469l13.212-.78c.281 0 .047-.28-.046-.327L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
                                </svg>
                              ),
                            },
                            {
                              id: 'microsoft-365',
                              label: 'Microsoft 365',
                              icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
                                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
                                  <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
                                </svg>
                              ),
                            },
                            {
                              id: 'confluence',
                              label: 'Atlassian (Confluence)',
                              icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2.264 14.963c-.275-.44-.55-.936-.165-1.541L10.24 1.155c.33-.55 1.1-.715 1.65-.385.55.33.715 1.1.385 1.65L4.354 14.413c-.495.825-1.705.99-2.09.55z" fill="url(#cg1)"/>
                                  <path d="M21.736 9.037c.275.44.55.936.165 1.541L13.76 22.845c-.33.55-1.1.715-1.65.385-.55-.33-.715-1.1-.385-1.65l7.921-11.993c.495-.825 1.705-.99 2.09-.55z" fill="url(#cg2)"/>
                                  <defs>
                                    <linearGradient id="cg1" x1="10.15" y1="14.09" x2="4.97" y2="1.13" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#0052CC"/><stop offset="1" stopColor="#2684FF"/>
                                    </linearGradient>
                                    <linearGradient id="cg2" x1="13.85" y1="9.91" x2="19.03" y2="22.87" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#0052CC"/><stop offset="1" stopColor="#2684FF"/>
                                    </linearGradient>
                                  </defs>
                                </svg>
                              ),
                            },
                          ].map(({ id, label, icon }) => {
                            const isConnected = connectedSources.has(id)
                            const connectorRow = (
                              <div className={`mv3-attach-connector ${isConnected ? 'mv3-connector-connected' : 'mv3-connector-unavailable'}`}>
                                <span className="mv3-attach-connector-icon">{icon}</span>
                                <span className="mv3-attach-connector-label">{label}</span>
                                {isConnected ? (
                                  <span className="mv3-attach-connected-badge">Connected</span>
                                ) : (
                                  <button
                                    className="mv3-attach-connect-btn"
                                    onClick={() => setConnectedSources(prev => new Set([...prev, id]))}
                                  >
                                    Connect
                                  </button>
                                )}
                              </div>
                            )
                            if (isConnected) {
                              return (
                                <div key={id} className="mv3-attach-connector-row">
                                  {connectorRow}
                                  <button
                                    className="mv3-attach-disconnect-btn"
                                    title="Disconnect"
                                    onClick={() => setConnectedSources(prev => { const s = new Set(prev); s.delete(id); return s })}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                      <line x1="4" y1="4" x2="20" y2="20"/>
                                    </svg>
                                  </button>
                                </div>
                              )
                            }
                            return <div key={id}>{connectorRow}</div>
                          })}

                          {/* Footer */}
                          <div className="mv3-attach-footer-divider" />
                          <button className="mv3-attach-manage-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>
                            </svg>
                            Manage connectors
                          </button>
                          <div className="mv3-attach-size-note">Max local file size: 50.0 MB.</div>
                        </div>
                      </>
                    )}
                    <button ref={attachBtnRef} className="mv3-agent-attach" title="Add" onClick={e => {
                      e.stopPropagation()
                      if (!showAttachMenu && attachBtnRef.current) {
                        const r = attachBtnRef.current.getBoundingClientRect()
                        setAttachMenuPos({ x: r.left, y: r.top })
                      }
                      setShowAttachMenu(v => !v)
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>
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

      </div>

      {/* ── Publishing (3-column: select | preview | setup) ── */}
      {editorTab === 'publishing' && (() => {
        const handlePublish = () => {
          setPublishHistory(prev => [{
            id: Date.now(), title: publishTitle || 'Untitled post',
            platform: publishPlatform, imageCount: publishSelectedPageIds.size,
            format: publishFormat,
            status: publishScheduleType === 'later' ? 'scheduled' : 'published',
            publishedAt: new Date().toISOString(),
            scheduledFor: publishScheduleType === 'later' && publishScheduledDate
              ? `${publishScheduledDate}T${publishScheduledTime}` : undefined,
            caption: publishCaption.trim() || undefined,
          }, ...prev])
          setPublishSelectedPageIds(new Set())
          setPublishCaption('')
          setPublishScheduleType('now')
          setPublishScheduledDate('')
          setPublishScheduledTime('')
          setSettingsTab('history')
        }

        const platformColor = PUBLISH_PLATFORMS.find(p => p.id === publishPlatform)?.color ?? '#0077b5'
        const firstSelId = Array.from(publishSelectedPageIds)[0] ?? pages[0]
        const firstSelIdx = pages.indexOf(firstSelId)

        // Platform-specific preview rules
        const platformAspect: Record<string, string> = {
          instagram: '1 / 1', facebook: '1.91 / 1', twitter: '16 / 9',
          linkedin: '1.91 / 1', tiktok: '9 / 16', threads: '1 / 1',
        }
        const platformSubtext: Record<string, string> = {
          instagram: '@thuyhuynh', facebook: 'Just now · 🌍 Public',
          twitter: '@thuyhuynh', linkedin: 'Software Engineer · 1st',
          tiktok: '@thuyhuynh', threads: '@thuyhuynh',
        }
        const iconLike = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        const iconHeart = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        const iconComment = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        const iconRepost = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        const iconSend = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        const iconShare = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        const iconBookmark = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        const iconReply = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
        const PLATFORM_RECOMMENDED_RATIOS: Record<string, string[]> = {
          instagram: ['1:1', '4:5', '9:16'],
          facebook:  ['1.91:1', '1:1'],
          twitter:   ['16:9', '1:1'],
          linkedin:  ['1.91:1', '1:1'],
          tiktok:    ['9:16'],
          threads:   ['1:1', '4:5'],
        }
        const recRatios = PLATFORM_RECOMMENDED_RATIOS[publishPlatform] ?? ['1:1']
        const firstPageRatio = pageData[firstSelId]?.ratio ?? '1:1'
        const firstPageFits = recRatios.includes(firstPageRatio)

        const platformActions: Record<string, Array<{ label: string; icon: React.ReactNode }>> = {
          instagram: [{ label: '', icon: iconHeart }, { label: '', icon: iconComment }, { label: '', icon: iconSend }, { label: '', icon: iconBookmark }],
          facebook:  [{ label: 'Like', icon: iconLike }, { label: 'Comment', icon: iconComment }, { label: 'Share', icon: iconShare }],
          twitter:   [{ label: '', icon: iconReply }, { label: '', icon: iconRepost }, { label: '', icon: iconHeart }, { label: '', icon: iconShare }],
          linkedin:  [{ label: 'Like', icon: iconLike }, { label: 'Comment', icon: iconComment }, { label: 'Repost', icon: iconRepost }, { label: 'Send', icon: iconSend }],
          tiktok:    [{ label: '', icon: iconHeart }, { label: '', icon: iconComment }, { label: '', icon: iconShare }],
          threads:   [{ label: '', icon: iconHeart }, { label: '', icon: iconReply }, { label: '', icon: iconRepost }, { label: '', icon: iconShare }],
        }
        const platformIcon = (id: string, size = 16) => (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
            {id === 'instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>}
            {id === 'facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>}
            {id === 'twitter' && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>}
            {id === 'linkedin' && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>}
            {id === 'tiktok' && <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>}
            {id === 'threads' && <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.689-2.045 1.07-1.127 1.679-2.863 1.769-5.233H12.75v-2.09h7.02l.012.56c.071 3.51-.693 6.101-2.396 7.932-1.55 1.67-3.784 2.575-6.2 2.575z"/>}
          </svg>
        )

        // ── Per-platform social card renderer ──
        const renderSocialCard = () => {
          if (publishSelectedPageIds.size === 0) return (
            <div className="mv3-pub-empty-state">
              <div className="mv3-pub-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="m3 9 4-4 4 4 4-4 4 4"/>
                  <circle cx="8.5" cy="14.5" r="1.5"/>
                </svg>
              </div>
              <p className="mv3-pub-empty-title">No images selected</p>
              <p className="mv3-pub-empty-sub">Select images from the left panel to preview your post</p>
            </div>
          )

          const allIds = Array.from(publishSelectedPageIds)

          // Image area helpers
          const singleImg = (ar: string) => (
            <div className="mv3-pub-social-image" style={{ aspectRatio: ar }}>
              <PostPreview page={pageRenderSlot[firstSelId] ?? firstSelIdx} />
            </div>
          )

          const fbGrid = (ids: number[]) => {
            if (ids.length === 1) return singleImg('1.91 / 1')
            if (ids.length === 2) return (
              <div className="mv3-pub-fb-grid mv3-pub-fb-grid--2">
                {ids.map(pid => <div key={pid} className="mv3-pub-fb-cell"><PostPreview page={pageRenderSlot[pid] ?? 0} /></div>)}
              </div>
            )
            if (ids.length === 3) return (
              <div className="mv3-pub-fb-grid mv3-pub-fb-grid--3">
                <div className="mv3-pub-fb-cell mv3-pub-fb-cell--main"><PostPreview page={pageRenderSlot[ids[0]] ?? 0} /></div>
                <div className="mv3-pub-fb-col">
                  {ids.slice(1).map(pid => <div key={pid} className="mv3-pub-fb-cell"><PostPreview page={pageRenderSlot[pid] ?? 0} /></div>)}
                </div>
              </div>
            )
            const vis = ids.slice(0, 4); const ov = ids.length - 4
            return (
              <div className="mv3-pub-fb-grid mv3-pub-fb-grid--4">
                {vis.map((pid, i) => (
                  <div key={pid} className="mv3-pub-fb-cell" style={{ position: 'relative' }}>
                    <PostPreview page={pageRenderSlot[pid] ?? 0} />
                    {i === 3 && ov > 0 && <div className="mv3-pub-carousel-sub-more">+{ov}</div>}
                  </div>
                ))}
              </div>
            )
          }

          const xGrid = (ids: number[]) => {
            if (ids.length === 1) return singleImg('16 / 9')
            const vis = ids.slice(0, 4); const ov = ids.length - 4
            if (ids.length === 2) return (
              <div className="mv3-pub-fb-grid mv3-pub-fb-grid--2">
                {vis.map(pid => <div key={pid} className="mv3-pub-fb-cell"><PostPreview page={pageRenderSlot[pid] ?? 0} /></div>)}
              </div>
            )
            if (ids.length === 3) return (
              <div className="mv3-pub-fb-grid mv3-pub-fb-grid--3">
                <div className="mv3-pub-fb-cell mv3-pub-fb-cell--main"><PostPreview page={pageRenderSlot[vis[0]] ?? 0} /></div>
                <div className="mv3-pub-fb-col">
                  {vis.slice(1).map(pid => <div key={pid} className="mv3-pub-fb-cell"><PostPreview page={pageRenderSlot[pid] ?? 0} /></div>)}
                </div>
              </div>
            )
            return (
              <div className="mv3-pub-fb-grid mv3-pub-fb-grid--4">
                {vis.map((pid, i) => (
                  <div key={pid} className="mv3-pub-fb-cell" style={{ position: 'relative' }}>
                    <PostPreview page={pageRenderSlot[pid] ?? 0} />
                    {i === 3 && ov > 0 && <div className="mv3-pub-carousel-sub-more">+{ov}</div>}
                  </div>
                ))}
              </div>
            )
          }

          const liGrid = (ids: number[]) => {
            if (ids.length === 1) return singleImg('1.91 / 1')
            const rest = ids.slice(1)
            return (
              <div className="mv3-pub-carousel-grid">
                <div className="mv3-pub-carousel-hero">
                  <PostPreview page={pageRenderSlot[ids[0]] ?? 0} />
                </div>
                <div className="mv3-pub-carousel-sub">
                  {rest.slice(0, 4).map((pid, i) => (
                    <div key={pid} className="mv3-pub-carousel-sub-item" style={{ position: 'relative' }}>
                      <PostPreview page={pageRenderSlot[pid] ?? 0} />
                      {i === 3 && rest.length > 4 && <div className="mv3-pub-carousel-sub-more">+{rest.length - 4}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          const igImage = (ids: number[]) => (
            <div className="mv3-pub-social-image" style={{ aspectRatio: '1 / 1', position: 'relative' }}>
              <PostPreview page={pageRenderSlot[ids[0]] ?? firstSelIdx} />
              {ids.length > 1 && (
                <div className="mv3-pub-ig-dots">
                  {Array.from({ length: Math.min(ids.length, 7) }).map((_, i) => (
                    <div key={i} className={`mv3-pub-ig-dot${i === 0 ? ' mv3-pub-ig-dot--active' : ''}`} />
                  ))}
                </div>
              )}
            </div>
          )

          const shortCap = publishCaption.length > 180 ? publishCaption.slice(0, 180) + '…' : publishCaption

          // ── Facebook ──
          if (publishPlatform === 'facebook') return (
            <div className="mv3-plat-card mv3-plat-fb">
              <div className="mv3-plat-fb-header">
                <div className="mv3-plat-fb-avatar">T</div>
                <div className="mv3-plat-fb-meta">
                  <span className="mv3-plat-fb-name">Thuy Huynh</span>
                  <span className="mv3-plat-fb-subtext">Just now · 🌐</span>
                </div>
                <button className="mv3-plat-more-btn">···</button>
              </div>
              {publishCaption && <p className="mv3-plat-fb-caption">{shortCap}</p>}
              {fbGrid(allIds)}
              <div className="mv3-plat-fb-reactions">
                <span className="mv3-plat-fb-react-left">
                  <span className="mv3-plat-fb-react-icons">
                    <span className="mv3-plat-fb-react-icon mv3-plat-fb-react-icon--like">👍</span>
                    <span className="mv3-plat-fb-react-icon mv3-plat-fb-react-icon--love">❤️</span>
                    <span className="mv3-plat-fb-react-icon mv3-plat-fb-react-icon--haha">😂</span>
                  </span>
                  <span>117</span>
                </span>
                <span className="mv3-plat-fb-react-right">23 comments · 14 shares</span>
              </div>
              <div className="mv3-plat-fb-divider" />
              <div className="mv3-plat-fb-actions">
                <button className="mv3-plat-fb-action">👍 <span>Like</span></button>
                <div className="mv3-plat-fb-sep" />
                <button className="mv3-plat-fb-action">💬 <span>Comment</span></button>
                <div className="mv3-plat-fb-sep" />
                <button className="mv3-plat-fb-action">↗ <span>Share</span></button>
              </div>
            </div>
          )

          // ── Instagram ──
          if (publishPlatform === 'instagram') return (
            <div className="mv3-plat-card mv3-plat-ig">
              <div className="mv3-plat-ig-header">
                <div className="mv3-plat-ig-avatar-ring">
                  <div className="mv3-plat-ig-avatar">T</div>
                </div>
                <span className="mv3-plat-ig-username">thuyhuynh</span>
                <button className="mv3-plat-more-btn mv3-plat-more-btn--dark">···</button>
              </div>
              {igImage(allIds)}
              <div className="mv3-plat-ig-actions">
                <div className="mv3-plat-ig-actions-left">
                  <button className="mv3-plat-ig-icon-btn mv3-plat-ig-icon-btn--heart">♡</button>
                  <button className="mv3-plat-ig-icon-btn">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </button>
                  <button className="mv3-plat-ig-icon-btn">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth={1.8}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
                <button className="mv3-plat-ig-icon-btn">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth={1.8}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>
              <p className="mv3-plat-ig-likes">1,234 likes</p>
              {publishCaption && <p className="mv3-plat-ig-caption"><strong>thuyhuynh</strong> {shortCap}</p>}
              <p className="mv3-plat-ig-comments-link">View all 23 comments</p>
              <p className="mv3-plat-ig-time">2 HOURS AGO</p>
            </div>
          )

          // ── X (Twitter) ──
          if (publishPlatform === 'twitter') return (
            <div className="mv3-plat-card mv3-plat-x">
              <div className="mv3-plat-x-header">
                <div className="mv3-plat-x-avatar">T</div>
                <div className="mv3-plat-x-meta">
                  <span className="mv3-plat-x-name">Thuy Huynh</span>
                  <span className="mv3-plat-x-verified">✓</span>
                  <span className="mv3-plat-x-handle">@thuyhuynh</span>
                  <span className="mv3-plat-x-sep">·</span>
                  <span className="mv3-plat-x-time">2h</span>
                </div>
                <button className="mv3-plat-more-btn mv3-plat-more-btn--muted">···</button>
              </div>
              {publishCaption && <p className="mv3-plat-x-text">{shortCap}</p>}
              {xGrid(allIds)}
              <div className="mv3-plat-x-actions">
                <button className="mv3-plat-x-action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span>12</span>
                </button>
                <button className="mv3-plat-x-action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  <span>45</span>
                </button>
                <button className="mv3-plat-x-action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span>234</span>
                </button>
                <button className="mv3-plat-x-action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
              </div>
            </div>
          )

          // ── LinkedIn ──
          if (publishPlatform === 'linkedin') return (
            <div className="mv3-plat-card mv3-plat-li">
              <div className="mv3-plat-li-header">
                <div className="mv3-plat-li-avatar">T</div>
                <div className="mv3-plat-li-meta">
                  <span className="mv3-plat-li-name">Thuy Huynh</span>
                  <span className="mv3-plat-li-title">Product Designer at LayerProof</span>
                  <span className="mv3-plat-li-time">2h · 🌐</span>
                </div>
                <div className="mv3-plat-li-hdr-right">
                  <button className="mv3-plat-li-follow-btn">Follow</button>
                  <button className="mv3-plat-more-btn mv3-plat-more-btn--muted">···</button>
                </div>
              </div>
              {publishCaption && (
                <p className="mv3-plat-li-caption">
                  {shortCap}
                  {publishCaption.length > 180 && <button className="mv3-plat-li-seemore">…see more</button>}
                </p>
              )}
              {liGrid(allIds)}
              <p className="mv3-plat-li-reactions">👍 ❤️ 💡 <span>117 reactions · 23 comments · 14 reposts</span></p>
              <div className="mv3-plat-li-divider" />
              <div className="mv3-plat-li-actions">
                <button className="mv3-plat-li-action">👍 <span>Like</span></button>
                <button className="mv3-plat-li-action">💬 <span>Comment</span></button>
                <button className="mv3-plat-li-action">🔁 <span>Repost</span></button>
                <button className="mv3-plat-li-action">✈️ <span>Send</span></button>
              </div>
            </div>
          )

          // ── TikTok ──
          if (publishPlatform === 'tiktok') return (
            <div className="mv3-plat-card mv3-plat-tt">
              <div className="mv3-plat-tt-inner">
                <div className="mv3-plat-tt-img">
                  <PostPreview page={pageRenderSlot[firstSelId] ?? firstSelIdx} />
                </div>
                <div className="mv3-plat-tt-overlay" />
                <div className="mv3-plat-tt-info">
                  <p className="mv3-plat-tt-username">@thuyhuynh</p>
                  {publishCaption && (
                    <p className="mv3-plat-tt-caption">
                      {publishCaption.length > 100 ? publishCaption.slice(0, 100) + '…' : publishCaption}
                    </p>
                  )}
                  <p className="mv3-plat-tt-music">🎵 Original Sound</p>
                </div>
                <div className="mv3-plat-tt-sidebar">
                  <div className="mv3-plat-tt-sidebar-item">
                    <div className="mv3-plat-tt-avwrap">
                      <div className="mv3-plat-tt-avatar">T</div>
                      <div className="mv3-plat-tt-avplus">+</div>
                    </div>
                  </div>
                  <div className="mv3-plat-tt-sidebar-item">
                    <span className="mv3-plat-tt-icon">❤️</span>
                    <span className="mv3-plat-tt-label">45.6K</span>
                  </div>
                  <div className="mv3-plat-tt-sidebar-item">
                    <span className="mv3-plat-tt-icon">💬</span>
                    <span className="mv3-plat-tt-label">1234</span>
                  </div>
                  <div className="mv3-plat-tt-sidebar-item">
                    <span className="mv3-plat-tt-icon">🔖</span>
                    <span className="mv3-plat-tt-label">892</span>
                  </div>
                  <div className="mv3-plat-tt-sidebar-item">
                    <span className="mv3-plat-tt-icon">↗️</span>
                    <span className="mv3-plat-tt-label">Share</span>
                  </div>
                </div>
              </div>
            </div>
          )

          // ── Threads (default) ──
          return (
            <div className="mv3-plat-card mv3-plat-th">
              <div className="mv3-plat-th-header">
                <div className="mv3-plat-th-avatar">T</div>
                <div className="mv3-plat-th-meta">
                  <span className="mv3-plat-th-username">thuyhuynh</span>
                  <span className="mv3-plat-th-follow">Follow</span>
                </div>
                <span className="mv3-plat-th-time">2h</span>
              </div>
              {publishCaption && <p className="mv3-plat-th-caption">{shortCap}</p>}
              <div className="mv3-pub-social-image" style={{ aspectRatio: '1 / 1' }}>
                <PostPreview page={pageRenderSlot[firstSelId] ?? firstSelIdx} />
              </div>
              <div className="mv3-plat-th-actions">
                <button className="mv3-plat-th-action mv3-plat-th-action--heart">♡</button>
                <button className="mv3-plat-th-action">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button className="mv3-plat-th-action">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                </button>
                <button className="mv3-plat-th-action">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
              <p className="mv3-plat-th-likes">234 likes</p>
            </div>
          )
        }

        return (
        <div className="mv3-pub-layout">
          <div className="mv3-editor-tabs">
            <div className="mv3-editor-tab-group">
              <button className="mv3-editor-tab" onClick={() => {
                if (publishCaption.trim() || publishSelectedPageIds.size > 0) {
                  setShowDiscardDialog(true)
                } else {
                  setEditorTab('preview')
                }
              }}>Image preview</button>
              <button className="mv3-editor-tab mv3-editor-tab--active">Publishing</button>
            </div>
          </div>

          <div className="mv3-pub-columns">

            {/* Left: Image selection */}
            <aside className="mv3-pub-sel-panel">
              {(() => {
                const uniqueRatios = Array.from(new Set(pages.map(pid => pageData[pid]?.ratio ?? '1:1')))
                const filteredPages = pages.filter(pid => sizeFilter === 'all' || (pageData[pid]?.ratio ?? '1:1') === sizeFilter)
                const allSelected = filteredPages.length > 0 && filteredPages.every(pid => publishSelectedPageIds.has(pid))
                return (
                  <div className="mv3-pub-sel-header">
                    <div className="mv3-pub-sel-title-row">
                      <span className="mv3-pub-sel-title">Images</span>
                      <button
                        className="mv3-pub-sel-all-btn"
                        onClick={() => {
                          if (allSelected) {
                            setPublishSelectedPageIds(prev => { const next = new Set(prev); filteredPages.forEach(pid => next.delete(pid)); return next })
                          } else {
                            setPublishSelectedPageIds(prev => new Set([...prev, ...filteredPages]))
                          }
                        }}
                      >
                        {allSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="mv3-pub-sel-tools">
                      <select
                        className="mv3-pub-size-select"
                        value={sizeFilter}
                        onChange={e => setSizeFilter(e.target.value)}
                      >
                        <option value="all">All sizes</option>
                        {uniqueRatios.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                )
              })()}
              <div className="mv3-pub-page-grid mv3-pub-page-grid--left">
                {pages.filter(pid => sizeFilter === 'all' || (pageData[pid]?.ratio ?? '1:1') === sizeFilter).map((pageId, idx) => {
                  const isSelected = publishSelectedPageIds.has(pageId)
                  const pageRatio = pageData[pageId]?.ratio ?? '1:1'
                  const pageFits = recRatios.includes(pageRatio)
                  return (
                    <button
                      key={pageId}
                      className={`mv3-pub-page-row${isSelected ? ' mv3-pub-page-row--selected' : ''}`}
                      onClick={() => setPublishSelectedPageIds(prev => {
                          const next = new Set(prev)
                          if (next.has(pageId)) { next.delete(pageId) } else { next.add(pageId) }
                          return next
                        })}
                    >
                      <div className={`mv3-pub-page-row-cb${isSelected ? ' mv3-pub-page-row-cb--checked' : ''}`}>
                        {isSelected && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div className="mv3-pub-page-row-img">
                        <MiniPostPreview page={pageRenderSlot[pageId] ?? idx} ratio={pageData[pageId]?.ratio ?? '1:1'} />
                        <span className="mv3-pub-page-thumb-ratio">{pageRatio}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

            </aside>

            {/* Center: social post preview card */}
            <div className="mv3-pub-center mv3-pub-center--preview">
              {renderSocialCard()}
            </div>

            {/* ── Step 2/3/4 content removed — consolidated into right panel ── */}
            {false && <div>
              {/* ── Step 2: Set Up Post ── */}
              {publishStep === 'setup' && (
                <div className="mv3-pub-step-content mv3-pub-step-scroll">
                  <div className="mv3-pub-step-heading">
                    <h2 className="mv3-pub-step-title">Set up your post</h2>
                    <p className="mv3-pub-step-desc">Write your caption and configure platform settings</p>
                  </div>

                  <div className="mv3-pub-field-group">
                    <div className="mv3-pub-field-label-row">
                      <span className="mv3-pub-field-label">Caption</span>
                      <div className="mv3-pub-ai-btns">
                        <button
                          className={`mv3-pub-ai-btn${generatingCaption ? ' mv3-pub-ai-btn--loading' : ''}`}
                          disabled={generatingCaption || adaptingCaption}
                          onClick={() => {
                            setGeneratingCaption(true)
                            setTimeout(() => {
                              setPublishCaption('Protect your innovation before someone else does. LayerProof gives Apple developers the IP layer they\'ve always needed — fast, reliable, and built for builders like you.')
                              setPublishHashtags(['LayerProof', 'AppleDeveloper', 'IPStrategy', 'BuildInPublic', 'TechStartup'])
                              setGeneratingCaption(false)
                            }, 1600)
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l1.8 5.4L19.2 9l-5.4 1.8L12 16.2l-1.8-5.4L4.8 9l5.4-1.8L12 2z"/></svg>
                          {generatingCaption ? 'Generating…' : 'Generate with AI'}
                        </button>
                        <button
                          className={`mv3-pub-ai-btn${adaptingCaption ? ' mv3-pub-ai-btn--loading' : ''}`}
                          disabled={generatingCaption || adaptingCaption}
                          onClick={() => {
                            setAdaptingCaption(true)
                            setTimeout(() => {
                              const platform = PLATFORM_LABELS[publishPlatform] ?? 'LinkedIn'
                              const adapted: Record<string, string> = {
                                LinkedIn: 'Excited to share how LayerProof is helping Apple developers protect their IP. In today\'s competitive landscape, safeguarding your innovation isn\'t optional — it\'s essential.',
                                Instagram: '🔒 Your code deserves protection. LayerProof gives Apple devs the IP layer they\'ve always needed. ✨',
                                X: 'Protect your Apple app\'s IP before someone else does. #AppleDev',
                                Facebook: 'Are you protecting your innovations? LayerProof is the IP layer every Apple developer needs.',
                                TikTok: '🚀 Did you know your app idea could be stolen? LayerProof protects it.',
                                Threads: 'Safeguarding your Apple platform innovations with LayerProof.',
                              }
                              setPublishCaption(adapted[platform] ?? publishCaption)
                              setAdaptingCaption(false)
                            }, 1200)
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          {adaptingCaption ? 'Adapting…' : `Adapt for ${PLATFORM_LABELS[publishPlatform] ?? 'LinkedIn'}`}
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="mv3-pub-caption-textarea"
                      value={publishCaption}
                      onChange={e => setPublishCaption(e.target.value)}
                      rows={5}
                      placeholder="Write your caption..."
                    />
                    <div className="mv3-pub-char-count">{publishCaption.length} / 3000</div>
                  </div>

                  {publishPlatform === 'instagram' && (
                    <div className="mv3-pub-field-group">
                      <span className="mv3-pub-field-label">Location</span>
                      <input className="mv3-pub-text-input" placeholder="Add a location tag..." />
                    </div>
                  )}
                  {publishPlatform === 'linkedin' && (
                    <div className="mv3-pub-field-group">
                      <span className="mv3-pub-field-label">Audience</span>
                      <div className="mv3-pub-radio-group">
                        <label className="mv3-pub-radio"><input type="radio" name="lk-audience" defaultChecked /> Anyone</label>
                        <label className="mv3-pub-radio"><input type="radio" name="lk-audience" /> Connections only</label>
                      </div>
                    </div>
                  )}
                  {publishPlatform === 'twitter' && (
                    <div className="mv3-pub-field-group">
                      <span className="mv3-pub-field-label">Reply settings</span>
                      <div className="mv3-pub-radio-group">
                        <label className="mv3-pub-radio"><input type="radio" name="tw-reply" defaultChecked /> Everyone</label>
                        <label className="mv3-pub-radio"><input type="radio" name="tw-reply" /> Followers only</label>
                        <label className="mv3-pub-radio"><input type="radio" name="tw-reply" /> Mentioned only</label>
                      </div>
                    </div>
                  )}

                  <div className="mv3-pub-field-group">
                    <span className="mv3-pub-field-label">When to publish</span>
                    <div className="mv3-pub-schedule-toggle">
                      <button
                        className={`mv3-pub-schedule-btn${publishScheduleType === 'now' ? ' mv3-pub-schedule-btn--active' : ''}`}
                        onClick={() => setPublishScheduleType('now')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Publish now
                      </button>
                      <button
                        className={`mv3-pub-schedule-btn${publishScheduleType === 'later' ? ' mv3-pub-schedule-btn--active' : ''}`}
                        onClick={() => setPublishScheduleType('later')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Schedule
                      </button>
                    </div>
                    {publishScheduleType === 'later' && (
                      <div className="mv3-pub-datetime-row">
                        <input type="date" className="mv3-pub-date-input" value={publishScheduledDate} onChange={e => setPublishScheduledDate(e.target.value)} />
                        <input type="time" className="mv3-pub-date-input" value={publishScheduledTime} onChange={e => setPublishScheduledTime(e.target.value)} />
                        <p className="mv3-pub-best-time">Best time: Tuesday 9 AM — your audience is most active then.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 3: Connect Account ── */}
              {publishStep === 'connect' && (
                <div className="mv3-pub-connect-wrap">
                  {connectedAccounts[publishPlatform] ? (
                    <div className="mv3-pub-connected-state">
                      <div className="mv3-pub-connected-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <h2 className="mv3-pub-connect-title">Account connected!</h2>
                      <p className="mv3-pub-connect-desc">@{connectedAccounts[publishPlatform]} is ready on {PLATFORM_LABELS[publishPlatform]}</p>
                      <button className="mv3-pub-disconnect-btn" onClick={() => setConnectedAccounts(prev => { const next = {...prev}; delete next[publishPlatform]; return next })}>
                        Disconnect account
                      </button>
                    </div>
                  ) : (
                    <div className="mv3-pub-connect-state">
                      <div className="mv3-pub-platform-big" style={{ background: platformColor }}>
                        {platformIcon(publishPlatform, 32)}
                      </div>
                      <h2 className="mv3-pub-connect-title">Connect your {PLATFORM_LABELS[publishPlatform] ?? 'account'}</h2>
                      <p className="mv3-pub-connect-desc">LayerProof will be able to publish posts on your behalf. You can disconnect at any time.</p>
                      <ul className="mv3-pub-permissions">
                        <li>Read your profile information</li>
                        <li>Publish posts to your feed</li>
                        <li>Access basic post analytics</li>
                      </ul>
                      <button
                        className="mv3-pub-oauth-btn"
                        disabled={connectingAccount}
                        style={{ background: platformColor }}
                        onClick={() => {
                          setConnectingAccount(true)
                          setTimeout(() => {
                            setConnectedAccounts(prev => ({ ...prev, [publishPlatform]: 'thuyhuynh' }))
                            setConnectingAccount(false)
                            setTimeout(() => setPublishStep('review'), 500)
                          }, 2000)
                        }}
                      >
                        {connectingAccount ? 'Connecting…' : `Connect ${PLATFORM_LABELS[publishPlatform] ?? 'account'}`}
                      </button>
                      <button className="mv3-pub-skip-link" onClick={() => setPublishStep('review')}>
                        Skip for now — save as draft
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 4: Review & Publish ── */}
              {publishStep === 'review' && (
                <div className="mv3-pub-step-content mv3-pub-step-scroll">
                  <div className="mv3-pub-step-heading">
                    <h2 className="mv3-pub-step-title">Review your post</h2>
                    <p className="mv3-pub-step-desc">Preview how it will look on {PLATFORM_LABELS[publishPlatform]}</p>
                  </div>
                  <div className="mv3-pub-social-card">
                    <div className="mv3-pub-social-header">
                      <div className="mv3-pub-social-avatar">T</div>
                      <div className="mv3-pub-social-meta">
                        <span className="mv3-pub-social-name">Thuy Huynh</span>
                        <span className="mv3-pub-social-when">Just now · {PLATFORM_LABELS[publishPlatform] ?? 'LinkedIn'}</span>
                      </div>
                    </div>
                    <div className="mv3-pub-social-image">
                      <PostPreview page={pageRenderSlot[pages[activePage]] ?? activePage} />
                    </div>
                    <div className="mv3-pub-social-caption-area">
                      <textarea
                        className="mv3-pub-social-caption"
                        value={publishCaption}
                        onChange={e => setPublishCaption(e.target.value)}
                        placeholder="Caption will appear here..."
                        rows={3}
                      />
                      <div className="mv3-pub-social-charcount">{publishCaption.length} / 3000</div>
                    </div>
                    <div className="mv3-pub-social-actions">
                      <button className="mv3-pub-social-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        Like
                      </button>
                      <button className="mv3-pub-social-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Comment
                      </button>
                      <button className="mv3-pub-social-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>}

            {/* Right: post setup panel */}
            <aside className="mv3-pub-right">

              {/* Settings / History tab bar */}
              <div className="mv3-pub-settings-tabs">
                <div className="mv3-pub-settings-tab-group">
                  <button
                    className={`mv3-pub-settings-tab${settingsTab === 'settings' ? ' mv3-pub-settings-tab--active' : ''}`}
                    onClick={() => setSettingsTab('settings')}
                  >Settings</button>
                  <button
                    className={`mv3-pub-settings-tab${settingsTab === 'history' ? ' mv3-pub-settings-tab--active' : ''}`}
                    onClick={() => setSettingsTab('history')}
                  >History</button>
                </div>
              </div>

              {/* History panel */}
              {settingsTab === 'history' && (
                <div className="mv3-pub-history">
                  {publishHistory.length === 0 ? (
                    <p className="mv3-pub-history-empty">No publish history yet.</p>
                  ) : (
                    publishHistory.map(item => {
                      const platColor = PUBLISH_PLATFORMS.find(p => p.id === item.platform)?.color ?? '#888'
                      const platLabel = PLATFORM_LABELS[item.platform] ?? item.platform
                      const scheduledDate = item.scheduledFor
                        ? new Date(item.scheduledFor).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : null
                      const scheduledTime = item.scheduledFor
                        ? new Date(item.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                        : null
                      const publishedAgo = (() => {
                        const diff = Date.now() - new Date(item.publishedAt).getTime()
                        if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
                        if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
                        return new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      })()
                      return (
                        <div key={item.id} className="mv3-pub-history-item">
                          <div className="mv3-pub-history-item-icon" style={{ background: platColor }}>
                            {platformIcon(item.platform, 13)}
                          </div>
                          <div className="mv3-pub-history-item-meta">
                            <div className="mv3-pub-history-item-row1">
                              <span className="mv3-pub-history-item-platform">{platLabel}</span>
                              {item.status === 'scheduled' ? (
                                <button
                                  className="mv3-pub-history-cancel-btn"
                                  onClick={() => setPublishHistory(prev =>
                                    prev.map(h => h.id === item.id ? { ...h, status: 'cancelled' as const } : h)
                                  )}
                                >Cancel</button>
                              ) : (
                                <span className={`mv3-pub-history-badge mv3-pub-history-badge--${item.status}`}>
                                  {item.status === 'cancelled' ? 'Cancelled' : 'Published'}
                                </span>
                              )}
                            </div>
                            {item.caption && (
                              <p className="mv3-pub-history-item-caption">{item.caption}</p>
                            )}
                            <div className="mv3-pub-history-item-row2">
                              <span className="mv3-pub-history-item-chip">{item.imageCount} {item.imageCount === 1 ? 'image' : 'images'}</span>
                              <span className="mv3-pub-history-item-chip">{item.format === 'carousel' ? 'Carousel' : 'Single'}</span>
                              {item.status === 'scheduled' && scheduledDate && (
                                <span className="mv3-pub-history-item-time">{scheduledDate} · {scheduledTime}</span>
                              )}
                              {item.status === 'published' && (
                                <span className="mv3-pub-history-item-time">{publishedAgo}</span>
                              )}
                              {item.status === 'cancelled' && (
                                <span className="mv3-pub-history-item-time">Cancelled</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {settingsTab === 'settings' && (<>

              {/* Platform — collapsed header + overlay dropdown */}
              <div className="mv3-pub-platform-wrap">
                <button
                  className="mv3-pub-platform-header"
                  onClick={() => setPublishPlatformExpanded(v => !v)}
                >
                  <div className="mv3-pub-platform-pill-icon" style={{ background: platformColor }}>
                    {platformIcon(publishPlatform, 13)}
                  </div>
                  <div className="mv3-pub-platform-header-info">
                    <span className="mv3-pub-platform-header-label">{PLATFORM_LABELS[publishPlatform]}</span>
                    {connectedAccounts[publishPlatform] ? (
                      <span className="mv3-pub-platform-header-handle">@{connectedAccounts[publishPlatform]}</span>
                    ) : (
                      <span className="mv3-pub-platform-header-no-account">No account connected</span>
                    )}
                  </div>
                  {connectedAccounts[publishPlatform] && (
                    <span className="mv3-pub-platform-header-connected">Connected</span>
                  )}
                  <svg className={`mv3-pub-platform-header-chevron${publishPlatformExpanded ? ' mv3-pub-platform-header-chevron--open' : ''}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {publishPlatformExpanded && (
                  <>
                    <div className="mv3-pub-platform-overlay-backdrop" onClick={() => setPublishPlatformExpanded(false)} />
                    <div className="mv3-pub-platform-overlay">
                      {PUBLISH_PLATFORMS.map(p => {
                        const isConnected = !!connectedAccounts[p.id]
                        return (
                          <button
                            key={p.id}
                            className={`mv3-pub-platform-overlay-item${publishPlatform === p.id ? ' mv3-pub-platform-overlay-item--active' : ''}`}
                            onClick={() => { setPublishPlatform(p.id); setPublishPlatformExpanded(false) }}
                          >
                            <div className="mv3-pub-overlay-avatar-wrap">
                              {isConnected ? (
                                <div className="mv3-pub-overlay-avatar">T</div>
                              ) : (
                                <div className="mv3-pub-overlay-avatar-empty">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </div>
                              )}
                              <div className="mv3-pub-overlay-avatar-badge" style={{ background: p.color }}>
                                {platformIcon(p.id, 8)}
                              </div>
                            </div>
                            <div className="mv3-pub-overlay-item-meta">
                              {isConnected && <span className="mv3-pub-platform-overlay-label">Thuy Huynh</span>}
                              <span className="mv3-pub-overlay-item-handle">{p.label}</span>
                            </div>
                            {publishPlatform === p.id && (
                              <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Account */}
              <div className="mv3-pub-section-label">Account</div>
              {connectedAccounts[publishPlatform] ? (
                <div className="mv3-pub-account-row">
                  <div className="mv3-pub-account-avatar">T</div>
                  <div className="mv3-pub-account-info">
                    <span className="mv3-pub-account-name">Thuy Huynh</span>
                    <span className="mv3-pub-account-handle">@{connectedAccounts[publishPlatform]}</span>
                  </div>
                  <button
                    className="mv3-pub-account-disconnect"
                    title="Disconnect account"
                    onClick={() => setConnectedAccounts(prev => { const next = { ...prev }; delete next[publishPlatform]; return next })}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  </button>
                </div>
              ) : (
                <div className="mv3-pub-account-empty">
                  <span className="mv3-pub-account-empty-text">No {PLATFORM_LABELS[publishPlatform]} account connected</span>
                  <button
                    className="mv3-pub-account-connect-btn"
                    disabled={connectingAccount}
                    onClick={() => {
                      if (!connectingAccount) {
                        setConnectingAccount(true)
                        setTimeout(() => {
                          setConnectedAccounts(prev => ({ ...prev, [publishPlatform]: 'thuyhuynh' }))
                          setConnectingAccount(false)
                        }, 2000)
                      }
                    }}
                  >
                    {connectingAccount ? 'Connecting…' : `Connect ${PLATFORM_LABELS[publishPlatform]}`}
                  </button>
                </div>
              )}

              {/* Caption */}
              <div className="mv3-pub-section-label">Caption</div>
              <div className="mv3-pub-caption-box">
                <textarea
                  className="mv3-pub-right-caption"
                  value={publishCaption}
                  onChange={e => setPublishCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={5}
                />
                <div className="mv3-pub-caption-footer">
                  {publishCaption.trim() ? (
                    <button
                      className={`mv3-pub-gen-btn${adaptingCaption ? ' mv3-pub-gen-btn--loading' : ''}`}
                      disabled={adaptingCaption}
                      onClick={() => {
                        setAdaptingCaption(true)
                        setTimeout(() => {
                          const platform = PLATFORM_LABELS[publishPlatform] ?? 'LinkedIn'
                          const adapted: Record<string, string> = {
                            LinkedIn: 'Excited to share how LayerProof is helping Apple developers protect their IP. In today\'s competitive landscape, safeguarding your innovation isn\'t optional — it\'s essential.',
                            Instagram: '🔒 Your code deserves protection. LayerProof gives Apple devs the IP layer they\'ve always needed. ✨',
                            X: 'Protect your Apple app\'s IP before someone else does. #AppleDev',
                            Facebook: 'Are you protecting your innovations? LayerProof is the IP layer every Apple developer needs.',
                            TikTok: '🚀 Did you know your app idea could be stolen? LayerProof protects it.',
                            Threads: 'Safeguarding your Apple platform innovations with LayerProof.',
                          }
                          setPublishCaption(adapted[platform] ?? publishCaption)
                          setAdaptingCaption(false)
                        }, 1200)
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      {adaptingCaption ? 'Adapting…' : `Adapt to ${PLATFORM_LABELS[publishPlatform] ?? 'LinkedIn'}`}
                    </button>
                  ) : (
                    <button
                      className={`mv3-pub-gen-btn${generatingCaption ? ' mv3-pub-gen-btn--loading' : ''}`}
                      disabled={generatingCaption}
                      onClick={() => {
                        setGeneratingCaption(true)
                        setTimeout(() => {
                          setPublishCaption('Protect your innovation before someone else does. LayerProof gives developers the IP layer they\'ve always needed — fast, reliable, and built for builders like you.')
                          setPublishHashtags(['LayerProof', 'IPStrategy', 'BuildInPublic', 'TechStartup'])
                          setGeneratingCaption(false)
                        }, 1600)
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {generatingCaption ? 'Generating…' : 'Generate caption'}
                    </button>
                  )}
                  <span className="mv3-pub-caption-count">{publishCaption.length}/2200</span>
                </div>
              </div>

              {/* Hashtags */}
              <div className="mv3-pub-section-label">Hashtags</div>
              <div className="mv3-publish-hashtag-list">
                {publishHashtags.map(h => (
                  <span key={h} className="mv3-publish-hashtag-chip">
                    #{h}
                    <button onClick={() => setPublishHashtags(prev => prev.filter(x => x !== h))}>×</button>
                  </span>
                ))}
                <button className="mv3-publish-hashtag-add" onClick={() => {
                  const tag = window.prompt('Add hashtag')
                  if (tag) setPublishHashtags(prev => [...prev, tag.replace(/^#/, '')])
                }}>+ Add</button>
              </div>

              {/* Schedule */}
              <div className="mv3-pub-section-label">Schedule</div>
              <div className="mv3-pub-schedule-toggle">
                <button
                  className={`mv3-pub-schedule-btn${publishScheduleType === 'now' ? ' mv3-pub-schedule-btn--active' : ''}`}
                  onClick={() => setPublishScheduleType('now')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Publish now
                </button>
                <button
                  className={`mv3-pub-schedule-btn${publishScheduleType === 'later' ? ' mv3-pub-schedule-btn--active' : ''}`}
                  onClick={() => setPublishScheduleType('later')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Schedule
                </button>
              </div>
              {publishScheduleType === 'later' && (
                <input
                  type="datetime-local"
                  className="mv3-pub-datetime-input"
                  value={publishScheduledDate && publishScheduledTime ? `${publishScheduledDate}T${publishScheduledTime}` : ''}
                  onChange={e => {
                    const [d, t] = e.target.value.split('T')
                    setPublishScheduledDate(d ?? '')
                    setPublishScheduledTime(t ?? '')
                  }}
                />
              )}

              {/* CTA stack */}
              <div className="mv3-pub-cta-stack">
                <button
                  className="mv3-pub-connect-cta"
                  style={!connectedAccounts[publishPlatform] ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                  disabled={!connectedAccounts[publishPlatform]}
                  onClick={() => { if (connectedAccounts[publishPlatform]) handlePublish() }}
                >
                  Publish now!
                </button>
              </div>

              </>)}

            </aside>
          </div>{/* end mv3-pub-columns */}

          <EditorDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
            <EditorDialogContent size="sm" hideClose>
              <EditorDialogHeader>
                <EditorDialogTitle>Discard draft?</EditorDialogTitle>
              </EditorDialogHeader>
              <EditorDialogBody>
                <p className="mv3-discard-body">Your caption, selected images, and settings will be discarded.</p>
              </EditorDialogBody>
              <EditorDialogFooter>
                <EditorDialogClose asChild>
                  <button className="mv3-discard-keep-btn">Keep editing</button>
                </EditorDialogClose>
                <button className="mv3-discard-confirm-btn" onClick={() => {
                  setShowDiscardDialog(false)
                  setEditorTab('preview')
                  setPublishSelectedPageIds(new Set())
                }}>Discard</button>
              </EditorDialogFooter>
            </EditorDialogContent>
          </EditorDialog>
        </div>
        )
      })()}

      {/* ── Outline modal ── */}
      {showOutline && (() => {
        const OUTLINE_THEME_CATEGORIES: Record<string, string[]> = {
          All:       THEMES.map(t => t.id),
          Dark:      ['minimal-dark','neon-accent','warm-terra','ocean','rose-gold','forest','slate'],
          Light:     ['clean-light'],
          Gradient:  ['bold-gradient'],
          Vibrant:   ['neon-accent','rose-gold','bold-gradient'],
          Neutral:   ['minimal-dark','slate','clean-light'],
        }
        const cats = Object.keys(OUTLINE_THEME_CATEGORIES)
        const sq = outlineThemeSearch.toLowerCase().trim()
        const catIds = OUTLINE_THEME_CATEGORIES[outlineThemeCategory] ?? THEMES.map(t => t.id)
        const filteredThemes = THEMES.filter(t => {
          const inCat = catIds.includes(t.id)
          const inSearch = !sq || t.label.toLowerCase().includes(sq)
          return inCat && inSearch
        })
        return (
          <div className="mv3-outline-overlay" onClick={() => setShowOutline(false)}>
            <div className="mv3-outline-modal mv3-outline-modal--wide" onClick={e => e.stopPropagation()}>
              <div className="mv3-outline-header">
                <div className="mv3-outline-header-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/>
                  </svg>
                  <span className="mv3-outline-title">Outline</span>
                  <span className="mv3-outline-count">{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
                </div>
                <button className="mv3-outline-close" onClick={() => setShowOutline(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="mv3-outline-split">
                {/* Left — page list */}
                <div className="mv3-outline-body">
                  {pages.map((pageId, idx) => {
                    const brief = pagePrompts[pageId]
                    const platform = pageData[pageId] ?? PLATFORM_OPTIONS[0]
                    const slot = pageRenderSlot[pageId] ?? idx
                    const isActive = idx === activePage
                    return (
                      <div
                        key={pageId}
                        className={`mv3-outline-row${isActive ? ' mv3-outline-row--active' : ''}`}
                        onClick={() => { setActivePage(idx); setShowOutline(false) }}
                      >
                        <div className="mv3-outline-row-num">{idx + 1}</div>
                        <div className="mv3-outline-row-thumb">
                          <MiniPostPreview page={slot} />
                        </div>
                        <div className="mv3-outline-row-content">
                          <div className="mv3-outline-row-top">
                            <span className="mv3-outline-row-platform">{platform.label}</span>
                            <span className="mv3-outline-row-ratio">{platform.ratio}</span>
                            {isActive && <span className="mv3-outline-row-badge">Viewing</span>}
                          </div>
                          {brief ? (
                            <p className="mv3-outline-row-brief">{brief.prompt}</p>
                          ) : (
                            <p className="mv3-outline-row-brief mv3-outline-row-brief--empty">No brief — blank page</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Right — Look & Feel panel */}
                <div className="mv3-outline-laf">
                  <div className="mv3-outline-laf-heading">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Look &amp; Feel
                  </div>

                  {/* Search */}
                  <div className="mv3-laf-search-wrap">
                    <svg className="mv3-laf-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      className="mv3-laf-search"
                      placeholder="Search themes…"
                      value={outlineThemeSearch}
                      onChange={e => setOutlineThemeSearch(e.target.value)}
                    />
                    {outlineThemeSearch && (
                      <button className="mv3-laf-search-clear" onClick={() => setOutlineThemeSearch('')}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>

                  {/* Category chips */}
                  {!outlineThemeSearch && (
                    <div className="mv3-outline-laf-cats">
                      {cats.map(c => (
                        <button
                          key={c}
                          className={`mv3-outline-laf-cat${outlineThemeCategory === c ? ' mv3-outline-laf-cat--active' : ''}`}
                          onClick={() => setOutlineThemeCategory(c)}
                        >{c}</button>
                      ))}
                    </div>
                  )}

                  {/* Theme grid */}
                  {filteredThemes.length > 0 ? (
                    <div className="mv3-outline-laf-grid">
                      {filteredThemes.map(t => (
                        <button
                          key={t.id}
                          className={`mv3-laf-theme-card${pendingTheme.id === t.id ? ' mv3-laf-theme-card--active' : ''}${t.isBrand ? ' mv3-laf-theme-card--brand' : ''}`}
                          onClick={() => { setPendingTheme(t); setSelectedTheme(t) }}
                        >
                          <div className="mv3-laf-theme-preview" style={{ background: t.bg }}>
                            {t.lines.map((l, i) => (
                              <div key={i} className="mv3-laf-theme-line" style={{ background: l.color, width: `${l.width}%` }} />
                            ))}
                            {t.isBrand && <span className="mv3-laf-brand-badge">Brand</span>}
                          </div>
                          <span className="mv3-laf-theme-label">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mv3-laf-yours-empty"><span>No themes match "{outlineThemeSearch}"</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Add Page size picker ── */}
      {showAddPagePicker && (
        <div className="mv3-addpage-overlay" onClick={() => setShowAddPagePicker(false)}>
          <div className="mv3-addpage-modal" onClick={e => e.stopPropagation()}>
            <div className="mv3-addpage-header">
              <span className="mv3-addpage-title">Choose a size</span>
              <button className="mv3-addpage-close" onClick={() => setShowAddPagePicker(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="mv3-addpage-grid">
              {PLATFORM_OPTIONS.map(p => {
                const maxDim = Math.max(p.w, p.h)
                const thumbW = Math.round(56 * p.w / maxDim)
                const thumbH = Math.round(56 * p.h / maxDim)
                return (
                  <button key={p.id} className="mv3-addpage-option" onClick={() => createBlankPage(p)}>
                    <div className="mv3-addpage-thumb-wrap">
                      <div className="mv3-addpage-thumb" style={{ width: thumbW, height: thumbH }} />
                    </div>
                    <span className="mv3-addpage-option-label">{p.label}</span>
                    <span className="mv3-addpage-option-ratio">{p.ratio}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Look & Feel modal ── */}
      {lafOpen && (
        <LookAndFeelModal
          selected={selectedThemeOption.id}
          onSelect={t => setSelectedThemeOption(t)}
          onClose={() => setLafOpen(false)}
          spectrumValues={spectrumValues}
          onSpectrumChange={(key, v) => setSpectrumValues(prev => ({ ...prev, [key]: v }))}
          textAmount={amountOfText}
          onTextAmountChange={v => setAmountOfText(v as 'minimal' | 'concise' | 'detailed')}
          brandPersonality={brandPersonality}
          onBrandPersonalityChange={setBrandPersonality}
          wordsToAvoid={wordsToAvoid}
          onWordsToAvoidChange={setWordsToAvoid}
          customInstruction={customInstruction}
          onCustomInstructionChange={setCustomInstruction}
          onOpenBrandKit={() => { setLafOpen(false); navigate('/brand-kit') }}
        />
      )}

      {/* ── Version History modal ── */}
      {showVersionHistory && (() => {
        const versions = PAGE_VERSION_HISTORY[pages[activePage]] ?? PAGE_VERSION_HISTORY[activePage % 3] ?? []
        const currentVersion = versions.find(v => v.isCurrent) ?? versions[0]
        const activeVer = versions.find(v => v.id === selectedVersionId) ?? currentVersion
        return (
          <div className="mv3-ver-overlay" onClick={() => setShowVersionHistory(false)}>
            <div className="mv3-ver-modal" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="mv3-ver-header">
                <div className="mv3-ver-header-left">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/>
                  </svg>
                  <span className="mv3-ver-title">Version History</span>
                  <span className="mv3-ver-subtitle">Page {activePage + 1}</span>
                </div>
                <button className="mv3-ver-close" onClick={() => setShowVersionHistory(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="mv3-ver-body">
                {/* Version list */}
                <div className="mv3-ver-list">
                  {versions.map(ver => (
                    <button
                      key={ver.id}
                      className={`mv3-ver-item${activeVer?.id === ver.id ? ' mv3-ver-item--active' : ''}${ver.isCurrent ? ' mv3-ver-item--current' : ''}`}
                      onClick={() => setSelectedVersionId(ver.id)}
                    >
                      <div className="mv3-ver-item-thumb">
                        <MiniPostPreview page={ver.renderSlot} />
                      </div>
                      <div className="mv3-ver-item-meta">
                        <div className="mv3-ver-item-label">
                          {ver.label}
                          {ver.isCurrent && <span className="mv3-ver-badge">Current</span>}
                        </div>
                        <div className="mv3-ver-item-time">{ver.timestamp}</div>
                        <div className="mv3-ver-item-brief">{ver.prompt.slice(0, 72)}…</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Preview + brief */}
                {activeVer && (
                  <div className="mv3-ver-preview">
                    <div className="mv3-ver-canvas">
                      <PostPreview page={activeVer.renderSlot} />
                    </div>
                    <div className="mv3-ver-detail">
                      <div className="mv3-ver-detail-row">
                        <span className="mv3-ver-detail-label">Version</span>
                        <span className="mv3-ver-detail-val">{activeVer.label.replace(' — Current', '')}</span>
                      </div>
                      <div className="mv3-ver-detail-row">
                        <span className="mv3-ver-detail-label">Saved</span>
                        <span className="mv3-ver-detail-val">{activeVer.timestamp}</span>
                      </div>
                      <div className="mv3-ver-brief-label">Brief</div>
                      <p className="mv3-ver-brief-text">{activeVer.prompt}</p>
                      {!activeVer.isCurrent && (
                        <button
                          className="mv3-ver-restore-btn"
                          onClick={() => {
                            setShowVersionHistory(false)
                            logToChat(
                              `Restore ${activeVer.label} of Page ${activePage + 1}`,
                              `I've restored ${activeVer.label} of Page ${activePage + 1}. The brief and visual layout have been rolled back to that point. Let me know if you'd like to continue from here or make further adjustments.`,
                              true,
                              `Restoring ${activeVer.label}…`
                            )
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                          </svg>
                          Restore this version
                        </button>
                      )}
                      {activeVer.isCurrent && (
                        <div className="mv3-ver-current-note">This is the current version</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Assets Library modal ── */}
      {showAssetsLibrary && (() => {
        const generatedProjects = [
          {
            id: 'proj-social',
            name: 'Social Campaign – Create a poster campaign to launch LayerProof new',
            assets: [
              { id: 'gs-1',  bg: '#c9b89a' },
              { id: 'gs-2',  bg: 'linear-gradient(160deg,#1a120a,#3d2408)' },
              { id: 'gs-3',  bg: '#b8c0cc' },
              { id: 'gs-4',  bg: 'linear-gradient(160deg,#1a120a,#3d2408)' },
              { id: 'gs-5',  bg: 'linear-gradient(135deg,#f2a8b0,#e87ca0)' },
              { id: 'gs-6',  bg: '#b8d4c0' },
              { id: 'gs-7',  bg: 'linear-gradient(135deg,#1a3a6a,#2a5a9a)' },
              { id: 'gs-8',  bg: '#e8d4b0' },
              { id: 'gs-9',  bg: '#c0c8d8' },
              { id: 'gs-10', bg: 'linear-gradient(135deg,#2a4a2a,#4a7a4a)' },
            ],
          },
          {
            id: 'proj-brand',
            name: 'Brand Refresh – Q3 2025 Visual Identity Update',
            assets: [
              { id: 'gb-1',  bg: '#f5e6d0' },
              { id: 'gb-2',  bg: 'linear-gradient(135deg,#0f0f20,#1a1a40)' },
              { id: 'gb-3',  bg: '#d0e8f0' },
              { id: 'gb-4',  bg: '#e8c8d0' },
              { id: 'gb-5',  bg: 'linear-gradient(135deg,#2a1a0a,#5a3a1a)' },
              { id: 'gb-6',  bg: '#c8d8e8' },
            ],
          },
          {
            id: 'proj-product',
            name: 'Product Launch – LayerProof Editor Announcement',
            assets: [
              { id: 'gp-1',  bg: 'linear-gradient(135deg,#1a2a4a,#2a4a7a)' },
              { id: 'gp-2',  bg: '#e0d0c0' },
              { id: 'gp-3',  bg: 'linear-gradient(135deg,#3a1a4a,#6a2a8a)' },
              { id: 'gp-4',  bg: '#c8e0c8' },
              { id: 'gp-5',  bg: '#d8c8e0' },
            ],
          },
        ]

        const genQ = assetsSearch.trim().toLowerCase()
        const visibleProjects = (assetsProjectFilter === 'all'
          ? generatedProjects
          : generatedProjects.filter(p => p.id === assetsProjectFilter)
        ).filter(p => !genQ || p.name.toLowerCase().includes(genQ))

        const allGeneratedAssets = generatedProjects.flatMap(p => p.assets.map(a => ({ ...a, projectId: p.id })))
        const toggleAsset = (id: string) => setSelectedAssets(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])

        return (
          <div className="mv3-assets-overlay" onClick={() => setShowAssetsLibrary(false)}>
            <div className="mv3-assets-modal" onClick={e => e.stopPropagation()}>

              {/* Tab bar + search */}
              <div className="mv3-assets-topbar">
                <div className="mv3-assets-tabs">
                  <button
                    className={`mv3-assets-tab${assetsTab === 'uploads' ? ' mv3-assets-tab--active' : ''}`}
                    onClick={() => { setAssetsTab('uploads'); setAssetsSearch('') }}
                  >
                    My Uploads
                    <span className="mv3-assets-tab-badge mv3-assets-tab-badge--beta">BETA</span>
                  </button>
                  <button
                    className={`mv3-assets-tab${assetsTab === 'generated' ? ' mv3-assets-tab--active' : ''}`}
                    onClick={() => { setAssetsTab('generated'); setAssetsSearch('') }}
                  >
                    Generated
                    <span className="mv3-assets-tab-badge">99+</span>
                  </button>
                </div>
                <div className="mv3-assets-search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    className="mv3-assets-search-input"
                    placeholder={assetsTab === 'uploads' ? 'Search your uploads' : 'Search generated'}
                    value={assetsSearch}
                    onChange={e => setAssetsSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {assetsSearch && (
                    <button className="mv3-assets-search-clear" onClick={() => setAssetsSearch('')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
                <button className="mv3-assets-close" onClick={() => setShowAssetsLibrary(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Two-pane body */}
              <div className="mv3-assets-panes">

                {/* Left sidebar */}
                <div className="mv3-assets-sidebar">
                  {assetsTab === 'uploads' ? (() => {
                    const uploadTree = [
                      {
                        id: 'root', name: 'My Uploads',
                        children: [
                          {
                            id: 'images', name: 'Images',
                            files: [
                              { id: 'uf-1', name: '31e62970-6563-4157-a206-9db855958962.png', size: '3.1 MB', bg: '#c9b89a' },
                              { id: 'uf-2', name: '207a4f52-5325-4fce-8fad-32a214f228b3.png', size: '2.9 MB', bg: '#8ca8c4' },
                            ],
                          },
                          { id: 'documents', name: 'Documents', files: [] },
                          { id: 'videos',    name: 'Videos',    files: [] },
                        ],
                      },
                    ]
                    const toggleExpand = (id: string) => setExpandedUploadFolders(prev => {
                      const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
                    })
                    const renderTree = (nodes: typeof uploadTree, depth = 0): React.ReactNode =>
                      nodes.map(node => (
                        <div key={node.id}>
                          <button
                            className={`mv3-assets-sidebar-item${uploadFolderId === node.id ? ' mv3-assets-sidebar-item--active' : ''}`}
                            style={{ paddingLeft: 10 + depth * 14 }}
                            onClick={() => { setUploadFolderId(node.id); if ('children' in node) toggleExpand(node.id) }}
                          >
                            {'children' in node ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedUploadFolders.has(node.id) ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            ) : <span style={{ width: 12 }} />}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span className="mv3-assets-sidebar-label">{node.name}</span>
                          </button>
                          {'children' in node && expandedUploadFolders.has(node.id) && renderTree(node.children as any, depth + 1)}
                        </div>
                      ))
                    return <>{renderTree(uploadTree)}</>
                  })() : (
                    <>
                      <button
                        className={`mv3-assets-sidebar-item${assetsProjectFilter === 'all' ? ' mv3-assets-sidebar-item--active' : ''}`}
                        onClick={() => setAssetsProjectFilter('all')}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        All Generated
                      </button>
                      <div className="mv3-assets-sidebar-section">Projects</div>
                      {generatedProjects.map(p => (
                        <button
                          key={p.id}
                          className={`mv3-assets-sidebar-item${assetsProjectFilter === p.id ? ' mv3-assets-sidebar-item--active' : ''}`}
                          onClick={() => setAssetsProjectFilter(p.id)}
                          title={p.name}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                          <span className="mv3-assets-sidebar-label">{p.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Main content */}
                <div className="mv3-assets-content">
                  {assetsTab === 'uploads' ? (() => {
                    const uploadFolders: Record<string, { name: string; parent?: string; files: { id: string; name: string; size: string; bg: string }[] }> = {
                      root:      { name: 'My Uploads', files: [] },
                      images:    { name: 'Images',    parent: 'root', files: [
                        { id: 'uf-1', name: '31e62970-6563-4157-a206-9db855958962.png', size: '3.1 MB', bg: '#c9b89a' },
                        { id: 'uf-2', name: '207a4f52-5325-4fce-8fad-32a214f228b3.png', size: '2.9 MB', bg: '#8ca8c4' },
                      ]},
                      documents: { name: 'Documents', parent: 'root', files: [] },
                      videos:    { name: 'Videos',    parent: 'root', files: [] },
                    }
                    const q = assetsSearch.trim().toLowerCase()
                    // When searching: show all files across folders that match
                    const searchResults = q
                      ? Object.values(uploadFolders).flatMap(f => f.files).filter(f => f.name.toLowerCase().includes(q))
                      : null
                    const current = uploadFolders[uploadFolderId] ?? uploadFolders.root
                    const breadcrumb = current.parent
                      ? [{ id: current.parent, name: uploadFolders[current.parent]?.name ?? 'My Uploads' }, { id: uploadFolderId, name: current.name }]
                      : [{ id: uploadFolderId, name: current.name }]
                    const displayFiles = searchResults ?? current.files

                    const highlight = (text: string) => {
                      if (!q) return <>{text}</>
                      const i = text.toLowerCase().indexOf(q)
                      if (i === -1) return <>{text}</>
                      return <>{text.slice(0, i)}<mark className="mv3-search-highlight">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>
                    }

                    return (
                      <>
                        {/* Breadcrumb — hide when searching */}
                        {!q && (
                          <div className="mv3-upload-breadcrumb">
                            {breadcrumb.map((crumb, i) => (
                              <span key={crumb.id} className="mv3-upload-breadcrumb-row">
                                {i > 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
                                <button
                                  className={`mv3-upload-breadcrumb-btn${i === breadcrumb.length - 1 ? ' mv3-upload-breadcrumb-btn--current' : ''}`}
                                  onClick={() => setUploadFolderId(crumb.id)}
                                >{crumb.name}</button>
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Search result label */}
                        {q && (
                          <div className="mv3-search-result-label">
                            {displayFiles.length} result{displayFiles.length !== 1 ? 's' : ''} for "{assetsSearch}"
                          </div>
                        )}
                        {/* Drop zone — hide when searching */}
                        {!q && (
                          <div className="mv3-assets-dropzone">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--t3)' }}>
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17 8 12 3 7 8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            <span className="mv3-assets-dropzone-main">Drop images here or click to select</span>
                            <span className="mv3-assets-dropzone-sub">Max size: 20.0 MB per file</span>
                            <span className="mv3-assets-dropzone-sub">Supported: Images, Text, PDF, CSV, Excel, Word, PowerPoint</span>
                          </div>
                        )}
                        {/* File list */}
                        {displayFiles.length > 0 ? (
                          <div className="mv3-upload-filelist">
                            {displayFiles.map(f => (
                              <button
                                key={f.id}
                                className={`mv3-upload-file${selectedAssets.includes(f.id) ? ' mv3-upload-file--selected' : ''}`}
                                onClick={() => setSelectedAssets(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])}
                              >
                                <div className="mv3-upload-file-thumb" style={{ background: f.bg }} />
                                <span className="mv3-upload-file-name">{highlight(f.name)}</span>
                                <span className="mv3-upload-file-size">{f.size}</span>
                                {selectedAssets.includes(f.id) && (
                                  <div className="mv3-asset-check" style={{ position: 'static', width: 18, height: 18 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="mv3-assets-empty">
                            {q ? 'No files match your search.' : 'This folder is empty.'}
                          </div>
                        )}
                      </>
                    )
                  })() : (
                    <>
                      {/* Search result label */}
                      {genQ && (
                        <div className="mv3-search-result-label">
                          {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''} match "{assetsSearch}"
                        </div>
                      )}
                      {visibleProjects.length === 0 && (
                        <div className="mv3-assets-empty">No projects match your search.</div>
                      )}
                      {/* Grouped by project */}
                      {visibleProjects.map(project => (
                        <div key={project.id} className="mv3-gen-group">
                          <div className="mv3-gen-group-title">
                            {genQ ? (() => {
                              const i = project.name.toLowerCase().indexOf(genQ)
                              if (i === -1) return project.name
                              return <>{project.name.slice(0, i)}<mark className="mv3-search-highlight">{project.name.slice(i, i + genQ.length)}</mark>{project.name.slice(i + genQ.length)}</>
                            })() : project.name}
                          </div>
                          <div className="mv3-gen-masonry">
                            {project.assets.map(a => (
                              <button
                                key={a.id}
                                className={`mv3-gen-card${selectedAssets.includes(a.id) ? ' mv3-gen-card--selected' : ''}`}
                                onClick={() => toggleAsset(a.id)}
                              >
                                <div className="mv3-gen-thumb" style={{ background: a.bg }}>
                                  {selectedAssets.includes(a.id) && (
                                    <div className="mv3-asset-check">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mv3-assets-footer">
                <span className="mv3-assets-selection-count">
                  {selectedAssets.length > 0 ? `${selectedAssets.length} selected` : ''}
                </span>
                <div className="mv3-assets-footer-actions">
                  <button className="mv3-assets-cancel" onClick={() => setShowAssetsLibrary(false)}>Cancel</button>
                  <button
                    className="mv3-assets-apply"
                    disabled={selectedAssets.length === 0}
                    onClick={() => {
                      const picked = selectedAssets.map(id => {
                        const asset = allGeneratedAssets.find(a => a.id === id)
                        return { id, label: id, bg: asset?.bg ?? '#333' }
                      })
                      setChatAttachments(prev => {
                        const existingIds = new Set(prev.map(a => a.id))
                        return [...prev, ...picked.filter(p => !existingIds.has(p.id))]
                      })
                      setShowAssetsLibrary(false)
                      setSelectedAssets([])
                      setAgentOpen(true)
                    }}
                  >
                    Apply{selectedAssets.length > 0 ? ` (${selectedAssets.length})` : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Share modal ── */}
      {showShareMenu && (
        <div className="mv3-share-overlay" onClick={() => setShowShareMenu(false)}>
          <div className="mv3-share-modal" onClick={e => e.stopPropagation()}>
            {/* Tab switcher */}
            <div className="mv3-share-tabs">
              {([
                { id: 'link',     label: 'Share Link' },
                { id: 'download', label: 'Download' },
              ] as const).map(tab => (
                <button key={tab.id} className={`mv3-share-tab${shareTab === tab.id ? ' mv3-share-tab--active' : ''}`} onClick={() => setShareTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Share Link / Download ── */}
            <>
              <div className="mv3-share-preview-card">
                <div className="mv3-share-preview-header">
                  <div className="mv3-share-avatar">T</div>
                  <div className="mv3-share-preview-meta">
                    <span className="mv3-share-preview-name">Thuy Huynh</span>
                    <span className="mv3-share-preview-when">Just now · {pageData[pages[activePage]]?.label ?? 'LinkedIn'}</span>
                  </div>
                </div>
                <div className="mv3-share-preview-image">
                  <PostPreview page={pageRenderSlot[pages[activePage]] ?? activePage} />
                </div>
              </div>
              <div className="mv3-share-ratio-row">
                <span className="mv3-share-ratio-label">ASPECT RATIO</span>
                <span className="mv3-share-ratio-badge">{pageData[pages[activePage]]?.ratio ?? '1:1'}</span>
              </div>
              <div className="mv3-share-action-row">
                {shareTab === 'download' && (
                  <button className="mv3-share-action-btn mv3-share-action-btn--accent" onClick={() => setShowShareMenu(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download PNG
                  </button>
                )}
                {shareTab === 'link' && (
                  <div className="mv3-share-link-row">
                    <div className="mv3-share-link-input">https://layerproof.app/share/abc123</div>
                    <button className="mv3-share-action-btn mv3-share-action-btn--accent" onClick={() => setShowShareMenu(false)}>Copy link</button>
                  </div>
                )}
              </div>
            </>

            <button className="mv3-share-modal-close" onClick={() => setShowShareMenu(false)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Variant expand lightbox ── */}
      {expandedVariant && (
        <div className="mv3-variant-lightbox" onClick={() => setExpandedVariant(null)}>
          <div className="mv3-variant-lightbox-card" onClick={e => e.stopPropagation()}>
            <div className="mv3-variant-lightbox-header">
              <span className="mv3-variant-lightbox-label">{expandedVariant.label}</span>
              <button className="mv3-variant-lightbox-close" onClick={() => setExpandedVariant(null)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="mv3-variant-lightbox-preview">
              <PostPreview page={expandedVariant.slot} />
            </div>
          </div>
        </div>
      )}


      {/* Section right-click menu */}
      {sectionMenuId !== null && sectionMenuPos && (
        <>
          <div className="mv3-thumb-menu-backdrop" onClick={() => { setSectionMenuId(null); setSectionMenuPos(null) }} />
          <div className="mv3-thumb-menu" style={{ left: sectionMenuPos.x, top: sectionMenuPos.y }}>
            <button className="mv3-thumb-menu-item mv3-thumb-menu-item--danger" onClick={() => { deleteSection(sectionMenuId); setSectionMenuId(null); setSectionMenuPos(null) }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Remove section
            </button>
          </div>
        </>
      )}

      {/* Insert menu — rendered at fixed position to escape sidebar overflow clipping */}
      {insertMenuIdx !== null && insertMenuPos && (
        <>
          <div className="mv3-insert-menu-backdrop" onClick={() => { setInsertMenuIdx(null); setInsertMenuPos(null) }} />
          <div className="mv3-insert-menu" style={{ position: 'fixed', left: insertMenuPos.x, top: insertMenuPos.y, transform: 'translateY(-50%)' }}>
            <button className="mv3-insert-menu-item" onClick={e => { e.stopPropagation(); setInsertMenuIdx(null); setInsertMenuPos(null); setActivePage(insertMenuIdx); addPage() }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Add page
            </button>
            <button className="mv3-insert-menu-item" onClick={e => { e.stopPropagation(); setInsertMenuIdx(null); setInsertMenuPos(null); addSection(insertMenuIdx) }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              Add section
            </button>
          </div>
        </>
      )}

    </div>
  )
}

const PAGE_CONFIGS = [
  { bg: '#f5f5f0', accent: '#22c55e', label: 'Awareness' },
  { bg: '#0f172a', accent: '#3b82f6', label: 'Benefits' },
  { bg: '#faf5ff', accent: '#7c3aed', label: 'Call to Action' },
  { bg: '#fff7ed', accent: '#f97316', label: 'Social Proof' },
  { bg: '#0d1117', accent: '#14b8a6', label: 'Stats' },
]

function PostPreview({ page }: { page: number }) {
  if (page === -1) return <div className="mv3-post-preview" style={{ background: '#f5f4f0' }} />
  const cfg = PAGE_CONFIGS[page % PAGE_CONFIGS.length]
  const slot = page % 5

  // Slide 0 — Hero / Awareness
  if (slot === 0) return (
    <div className="mv3-post-preview" style={{ background: cfg.bg }}>
      <div className="mv3-post-bg-pattern">
        {Array.from({ length: 20 }).map((_, i) => <div key={i} className="mv3-pattern-block" />)}
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

  // Slide 1 — Benefits / List
  if (slot === 1) return (
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

  // Slide 2 — CTA
  if (slot === 2) return (
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

  // Slide 3 — Testimonial / Social Proof
  if (slot === 3) return (
    <div className="mv3-post-preview" style={{ background: cfg.bg }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: cfg.accent }} />
      <div className="mv3-post-content" style={{ gap: 20 }}>
        <svg width="32" height="24" viewBox="0 0 32 24" fill={cfg.accent} opacity={0.4}><path d="M0 24V14.4C0 6.4 4.267 1.6 12.8 0l1.6 2.4C10.133 3.6 7.733 6.267 7.2 10.4H13.6V24H0zm18.4 0V14.4C18.4 6.4 22.667 1.6 31.2 0l1.6 2.4c-4.267 1.2-6.667 3.867-7.2 8H32V24H18.4z"/></svg>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#1c1917', lineHeight: 1.6, fontStyle: 'italic', margin: 0, textAlign: 'center', maxWidth: 320 }}>
          "LayerProof saved us months of legal back-and-forth. Our IP was protected before we even launched."
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: cfg.accent, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>M</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1917' }}>Marcus Chen</div>
          <div style={{ fontSize: 12, color: '#78716c' }}>Founder, SwiftKit · YC W24</div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(i => <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={cfg.accent}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
        </div>
      </div>
    </div>
  )

  // Slide 4 — Stats
  return (
    <div className="mv3-post-preview" style={{ background: cfg.bg }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 70% 30%, ${cfg.accent}18 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div className="mv3-post-content" style={{ gap: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: cfg.accent, margin: 0 }}>LayerProof by the Numbers</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%' }}>
          {[
            { value: '10K+', label: 'Patents Filed' },
            { value: '98%', label: 'Success Rate' },
            { value: '3×', label: 'Faster Process' },
            { value: '$2M+', label: 'IP Protected' },
          ].map(s => (
            <div key={s.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '16px 8px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: cfg.accent, lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <button className="mv3-post-cta" style={{ background: cfg.accent, color: '#fff', border: 'none' }}>See How It Works</button>
      </div>
    </div>
  )
}

function MiniPostPreview({ page, ratio = '1:1' }: { page: number; ratio?: string }) {
  const ar = ratio.replace(':', '/')
  if (page === -1) return <div style={{ aspectRatio: ar, maxWidth: '100%', maxHeight: '100%', background: '#f5f4f0', borderRadius: 6 }} />
  const cfg = PAGE_CONFIGS[page % PAGE_CONFIGS.length]
  const slot = page % 5
  const base: React.CSSProperties = { aspectRatio: ar, maxWidth: '100%', maxHeight: '100%', background: cfg.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 6 }

  if (slot === 0) return (
    <div style={base}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', opacity: .07, pointerEvents: 'none' }}>
        {Array.from({ length: 16 }).map((_, i) => <div key={i} style={{ border: '1px solid #999', borderRadius: 3, margin: 3, background: '#aaa' }} />)}
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 6px', gap: 4 }}>
        <div style={{ fontSize: 6, fontWeight: 800, color: '#111', lineHeight: 1.2, maxWidth: 100 }}>Safeguarding Your Innovation</div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={cfg.accent} stroke="none" style={{ margin: '2px 0' }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke={cfg.accent} strokeWidth={2} strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="white"/></svg>
        <div style={{ fontSize: 3.5, fontWeight: 700, padding: '2px 5px', borderRadius: 8, border: '0.5px solid #111', color: '#111' }}>Explore IP Best Practices</div>
      </div>
    </div>
  )

  if (slot === 1) return (
    <div style={{ ...base, padding: '6px 8px', boxSizing: 'border-box' as const }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 4, fontWeight: 800, color: cfg.accent, letterSpacing: '.08em', textTransform: 'uppercase' as const }}>3 Ways to Protect</div>
        {['01 Register Early', '02 Document Everything', '03 Monitor Actively'].map(t => (
          <div key={t} style={{ fontSize: 3.5, color: '#94a3b8', paddingLeft: 2 }}>{t}</div>
        ))}
        <div style={{ marginTop: 3, padding: '2px 5px', borderRadius: 3, background: cfg.accent, color: '#fff', fontSize: 3.5, fontWeight: 700, width: 'fit-content' }}>Learn More</div>
      </div>
    </div>
  )

  if (slot === 2) return (
    <div style={base}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: cfg.accent, opacity: .1 }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 6px', gap: 3 }}>
        <div style={{ fontSize: 10 }}>🚀</div>
        <div style={{ fontSize: 4.5, fontWeight: 800, color: '#1e1b4b', lineHeight: 1.2 }}>Ready to Secure?</div>
        <div style={{ padding: '2px 5px', borderRadius: 4, background: cfg.accent, color: '#fff', fontSize: 3.5, fontWeight: 700 }}>Get Started Free</div>
      </div>
    </div>
  )

  if (slot === 3) return (
    <div style={base}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: cfg.accent }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 6px', gap: 4 }}>
        <div style={{ fontSize: 4.5, fontWeight: 600, color: '#1c1917', fontStyle: 'italic', lineHeight: 1.4, maxWidth: 90 }}>"LayerProof saved us months of legal back-and-forth."</div>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: cfg.accent, display: 'grid', placeItems: 'center', fontSize: 7, fontWeight: 700, color: '#fff' }}>M</div>
        <div style={{ fontSize: 4, fontWeight: 700, color: '#1c1917' }}>Marcus Chen · YC W24</div>
        <div style={{ display: 'flex', gap: 1 }}>
          {[1,2,3,4,5].map(i => <svg key={i} width="5" height="5" viewBox="0 0 24 24" fill={cfg.accent}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
        </div>
      </div>
    </div>
  )

  return (
    <div style={base}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 70% 30%, ${cfg.accent}25 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '8px 6px', width: '100%', boxSizing: 'border-box' as const }}>
        {[{ v: '10K+', l: 'Patents' }, { v: '98%', l: 'Success' }, { v: '3×', l: 'Faster' }, { v: '$2M+', l: 'Protected' }].map(s => (
          <div key={s.v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '4px 2px', borderRadius: 4, background: 'rgba(255,255,255,.05)', border: '0.5px solid rgba(255,255,255,.1)' }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: cfg.accent, lineHeight: 1 }}>{s.v}</span>
            <span style={{ fontSize: 3, color: '#94a3b8' }}>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
