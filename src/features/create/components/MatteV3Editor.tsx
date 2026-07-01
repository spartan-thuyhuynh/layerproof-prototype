import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback, useEffect, Fragment } from 'react'

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
}
const THEMES: Theme[] = [
  { id: 'minimal-dark',   label: 'Minimal Dark',   bg: '#1c1c1e', lines: [{color:'#ffde42',width:68},{color:'#888',width:52},{color:'#666',width:44},{color:'#ffde42',width:36}] },
  { id: 'bold-gradient',  label: 'Bold Gradient',  bg: 'linear-gradient(135deg,#5b21b6,#7c3aed)', lines: [{color:'#c4b5fd',width:72},{color:'#f9a8d4',width:58},{color:'#ffde42',width:40}] },
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

export function MatteV3Editor() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [thumbMenuPos, setThumbMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const [pages, setPages] = useState([0, 1, 2])
  const [pageTitles, setPageTitles] = useState<Record<number, string>>({})
  const [activePage, setActivePage] = useState(0)
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
  const [pageData, setPageData] = useState<Record<number, PlatformOption>>({ 0: PLATFORM_OPTIONS[0], 1: PLATFORM_OPTIONS[0], 2: PLATFORM_OPTIONS[0] })
  const [pageRenderSlot, setPageRenderSlot] = useState<Record<number, number>>({ 0: 0, 1: 1, 2: 2 })
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)
  const [showAddPagePicker, setShowAddPagePicker] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareTab, setShareTab] = useState<'link' | 'publish' | 'download'>('link')
  const [publishPlatform, setPublishPlatform] = useState('linkedin')
  const [publishCaption, setPublishCaption] = useState('Safeguarding your innovation on Apple platforms. Protect what you build with LayerProof — the IP layer every developer needs.')
  const [publishHashtags, setPublishHashtags] = useState(['LayerProof', 'IPProtection', 'AppleDev', 'Innovation'])
  const [publishTitle, setPublishTitle] = useState('Safeguarding Your Innovation')
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [attachMenuPos, setAttachMenuPos] = useState({ x: 0, y: 0 })
  const attachBtnRef = useRef<HTMLButtonElement>(null)
  const [showAssetsLibrary, setShowAssetsLibrary] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [chatAttachments, setChatAttachments] = useState<Array<{id: string; label: string; bg: string}>>([])
  const pageIdRef = useRef(3)
  const [briefOpen, setBriefOpen] = useState(true)
  const [pagePrompts, setPagePrompts] = useState<Record<number, { prompt: string; model: string; size: string; style: string; quality: string; seed: number }>>({
    0: { prompt: 'A clean social campaign poster about safeguarding intellectual property on Apple platforms, featuring a lock icon, bold headline, and CTA button on a warm off-white background. Minimal, editorial design.', model: 'GPT Image 2', size: '1024×1024', style: 'Dynamic', quality: 'Low', seed: 666597 },
    1: { prompt: 'Dark-themed social post highlighting 3 ways to protect your IP on Apple platforms, with icon list and a blue accent CTA on a deep navy background. Clean, structured layout.', model: 'GPT Image 2', size: '1024×1024', style: 'Dynamic', quality: 'Low', seed: 842103 },
    2: { prompt: 'Purple-gradient social poster with rocket icon, bold headline encouraging developers to secure their innovation on Apple platforms, and a vibrant CTA. High energy, startup aesthetic.', model: 'GPT Image 2', size: '1024×1024', style: 'Dynamic', quality: 'Low', seed: 331847 },
  })
  const [lafOpen, setLafOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0])
  const [pendingTheme, setPendingTheme] = useState<Theme>(THEMES[0])
  const [amountOfText, setAmountOfText] = useState<'minimal'|'concise'|'detailed'>('concise')
  const [pendingAmount, setPendingAmount] = useState<'minimal'|'concise'|'detailed'>('concise')
  const [lafTab, setLafTab] = useState<'system'|'yours'>('system')
  const [brandPersonality, setBrandPersonality] = useState('')
  const [wordsToAvoid, setWordsToAvoid] = useState('')
  const [customInstruction, setCustomInstruction] = useState('')
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
          <div className="mv3-divider-v" />
          <div className="mv3-breadcrumb">
            <span className="mv3-campaign-title">Social Campaign – Present intellectual property</span>
          </div>
        </div>
        <div className="mv3-topbar-right">
          <button className="mv3-sub-pill-btn" onClick={() => { setPendingTheme(selectedTheme); setPendingAmount(amountOfText); setLafOpen(true) }}>
            <div className="mv3-laf-thumb-mini" style={{ background: selectedTheme.bg }}>
              {selectedTheme.lines.slice(0, 3).map((l, i) => (
                <div key={i} className="mv3-laf-thumb-mini-line" style={{ background: l.color, width: `${l.width * 0.55}%` }} />
              ))}
            </div>
            Look &amp; Feel
          </button>
          <div className="mv3-topbar-hist-group">
            <button
              className="mv3-topbar-hist-btn"
              onClick={undoGeneration}
              disabled={undoStack.length === 0}
              title="Undo (⌘Z)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
              </svg>
            </button>
            <button
              className="mv3-topbar-hist-btn"
              onClick={redoGeneration}
              disabled={redoStack.length === 0}
              title="Redo (⌘⇧Z)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.5"/>
              </svg>
            </button>
          </div>
          <div className="mv3-divider-v" />
          <button className={`mv3-sub-pill-btn${showOutline ? ' mv3-sub-pill-btn--active' : ''}`} onClick={() => setShowOutline(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/>
            </svg>
            Outline
          </button>
          <button className="mv3-sub-pill-btn mv3-sub-pill-btn--active">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l1.8 5.4L19.2 9l-5.4 1.8L12 16.2l-1.8-5.4L4.8 9l5.4-1.8L12 2z"/>
              <path d="M19 14l.9 2.7 2.7.9-2.7.9L19 21l-.9-2.7-2.7-.9 2.7-.9L19 14z" opacity=".6"/>
            </svg>
            Agent
          </button>
          <button className="mv3-sub-share-btn" onClick={() => { setShareTab('publish'); setShowShareMenu(true) }}>Share</button>
          <div className="mv3-divider-v" />
          <div className="mv3-avatar">T</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="mv3-body">
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
            {pages.map((_, idx) => (
              <div
                key={pages[idx]}
                className={`mv3-page-thumb-group${dragIdx === idx ? ' mv3-page-thumb-group--dragging' : ''}${dropIdx === idx && dragIdx !== idx ? ' mv3-page-thumb-group--drop-target' : ''}`}
                draggable
                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(idx) }}
                onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropIdx(idx) }}
                onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
                onDrop={e => { e.preventDefault(); if (dragIdx !== null) reorderPages(dragIdx, idx); setDragIdx(null); setDropIdx(null) }}
                onMouseLeave={() => setThumbMenuPage(null)}
              >
                {/* Insert between pages — appears on hover */}
                {idx > 0 && (
                  <button
                    className="mv3-insert-page-btn"
                    onClick={e => { e.stopPropagation(); setActivePage(idx - 1); addPage() }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add page
                  </button>
                )}
                <div className="mv3-page-thumb-row">
                <span className={`mv3-page-num${idx === activePage ? ' mv3-page-num--active' : ''}`}>{idx + 1}</span>
                <div className="mv3-page-thumb-wrap">
                  <button
                    className={`mv3-page-thumb-btn${idx === activePage ? ' mv3-page-thumb-btn--active' : ''}`}
                    onClick={() => setActivePage(idx)}
                  >
                    <div className="mv3-page-thumb-preview">
                      <div className="mv3-page-thumb-inner">
                        <MiniPostPreview page={pageRenderSlot[pages[idx]] ?? idx} />
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
                  {thumbMenuPage === idx && thumbMenuPos && (
                    <>
                      <div className="mv3-thumb-menu-backdrop" onClick={() => { setThumbMenuPage(null); setThumbMenuPos(null) }} />
                      <div className="mv3-thumb-menu" style={{ left: thumbMenuPos.x, top: thumbMenuPos.y }}>
                        <button className="mv3-thumb-menu-item mv3-thumb-menu-item--danger" onClick={() => { setThumbMenuPage(null); setThumbMenuPos(null); deletePage() }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                          Delete page
                        </button>
                      </div>
                    </>
                  )}
                </div>
                </div>{/* end mv3-page-thumb-row */}
              </div>
            ))}
            {/* Add page — last slot */}
            <div className="mv3-page-thumb-row">
              <span style={{ width: 16, flexShrink: 0 }} />
              <button className="mv3-sidebar-add-page-btn" onClick={e => { e.stopPropagation(); addPage() }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add page
              </button>
            </div>
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
                          {(() => {
                            const tbPlatform = pageData[pages[activePage]] ?? PLATFORM_OPTIONS[0]
                            return (
                              <div className="mv3-platform-btn-wrap">
                                <button
                                  className="mv3-platform-btn"
                                  onClick={e => { e.stopPropagation(); setShowPlatformPicker(p => !p) }}
                                >
                                  <span className="mv3-platform-btn-label">{tbPlatform.label}</span>
                                  <span className="mv3-platform-btn-ratio">{tbPlatform.ratio}</span>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                  </svg>
                                </button>
                                {showPlatformPicker && (
                                  <div className="mv3-platform-picker" onClick={e => e.stopPropagation()}>
                                    <div className="mv3-platform-picker-title">Choose platform &amp; size</div>
                                    {PLATFORM_OPTIONS.map(p => (
                                      <button
                                        key={p.id}
                                        className={`mv3-platform-option${tbPlatform.id === p.id ? ' mv3-platform-option--active' : ''}`}
                                        onClick={() => changePlatform(p)}
                                      >
                                        <span className="mv3-platform-option-label">{p.label}</span>
                                        <span className="mv3-platform-option-ratio">{p.ratio}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                          <div className="mv3-sel-sep" />
                          <button className="mv3-sel-btn" onClick={e => { e.stopPropagation(); setShowVersionHistory(true); setSelectedVersionId(null) }}>
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

              {(() => {
                const canvasPlatform = pageData[pages[activePage]] ?? PLATFORM_OPTIONS[0]
                const BASE_PX = 600
                const maxDim = Math.max(canvasPlatform.w, canvasPlatform.h)
                const canvasW = Math.round(BASE_PX * canvasPlatform.w / maxDim)
                const canvasH = Math.round(BASE_PX * canvasPlatform.h / maxDim)
                return (
              <div className="mv3-canvas-wrap">
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

        {/* ── Left side panel: brief + agent ── */}
        <div className="mv3-agent-panel-wrap">

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
                          <button className="mv3-attach-item" onClick={() => setShowAttachMenu(false)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                            </svg>
                            Upload File
                          </button>
                          <button className="mv3-attach-item" onClick={() => { setShowAttachMenu(false); setSelectedAssets([]); setShowAssetsLibrary(true) }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            Select from Assets Library
                          </button>
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

      {/* ── Outline modal ── */}
      {showOutline && (
        <div className="mv3-outline-overlay" onClick={() => setShowOutline(false)}>
          <div className="mv3-outline-modal" onClick={e => e.stopPropagation()}>
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
          </div>
        </div>
      )}

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
        <div className="mv3-laf-overlay" onClick={() => setLafOpen(false)}>
          <div className="mv3-laf-modal" onClick={e => e.stopPropagation()}>
            <div className="mv3-laf-modal-header">
              <span className="mv3-laf-modal-title">Look &amp; Feel</span>
              <button className="mv3-laf-close" onClick={() => setLafOpen(false)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="mv3-laf-body">
              {/* Left — themes */}
              <div className="mv3-laf-left">
                <div className="mv3-laf-section-label">THEME</div>
                <div className="mv3-laf-tabs">
                  <button className={`mv3-laf-tab${lafTab === 'system' ? ' mv3-laf-tab--active' : ''}`} onClick={() => setLafTab('system')}>System</button>
                  <button className={`mv3-laf-tab${lafTab === 'yours' ? ' mv3-laf-tab--active' : ''}`} onClick={() => setLafTab('yours')}>Your themes</button>
                </div>
                {lafTab === 'system' ? (
                  <div className="mv3-laf-theme-grid">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        className={`mv3-laf-theme-card${pendingTheme.id === t.id ? ' mv3-laf-theme-card--active' : ''}`}
                        onClick={() => setPendingTheme(t)}
                      >
                        <div className="mv3-laf-theme-preview" style={{ background: t.bg }}>
                          {t.lines.map((l, i) => (
                            <div key={i} className="mv3-laf-theme-line" style={{ background: l.color, width: `${l.width}%` }} />
                          ))}
                        </div>
                        <span className="mv3-laf-theme-label">{t.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mv3-laf-yours-empty">
                    <span>No saved themes yet.</span>
                  </div>
                )}
              </div>

              {/* Right — settings */}
              <div className="mv3-laf-right">
                <div className="mv3-laf-section-label">AMOUNT OF TEXT</div>
                <div className="mv3-laf-amount-row">
                  {(['minimal','concise','detailed'] as const).map(opt => (
                    <button
                      key={opt}
                      className={`mv3-laf-amount-card${pendingAmount === opt ? ' mv3-laf-amount-card--active' : ''}`}
                      onClick={() => setPendingAmount(opt)}
                    >
                      <span className="mv3-laf-amount-name">{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                      <span className="mv3-laf-amount-desc">
                        {opt === 'minimal' ? 'Short captions, hooks only.' : opt === 'concise' ? 'Balanced, punchy copy.' : 'Paragraph-style detail.'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mv3-laf-section-label" style={{ marginTop: 24 }}>BRAND PERSONALITY</div>
                <input
                  className="mv3-laf-input"
                  placeholder="Add trait…"
                  value={brandPersonality}
                  onChange={e => setBrandPersonality(e.target.value)}
                />

                <div className="mv3-laf-section-label" style={{ marginTop: 18 }}>WORDS TO AVOID</div>
                <input
                  className="mv3-laf-input"
                  placeholder="e.g. leveraging, synergy…"
                  value={wordsToAvoid}
                  onChange={e => setWordsToAvoid(e.target.value)}
                />

                <div className="mv3-laf-section-label" style={{ marginTop: 18 }}>CUSTOM INSTRUCTION</div>
                <textarea
                  className="mv3-laf-textarea"
                  placeholder="Describe the desired tone, personality, or style…"
                  value={customInstruction}
                  onChange={e => setCustomInstruction(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="mv3-laf-footer">
              <button
                className="mv3-laf-apply-btn"
                onClick={() => {
                  const themeChanged = pendingTheme.id !== selectedTheme.id
                  const amountChanged = pendingAmount !== amountOfText
                  setSelectedTheme(pendingTheme)
                  setAmountOfText(pendingAmount)
                  setLafOpen(false)
                  if (themeChanged || amountChanged) {
                    const changes: string[] = []
                    if (themeChanged) changes.push(`theme to ${pendingTheme.label}`)
                    if (amountChanged) changes.push(`copy density to ${pendingAmount}`)
                    logToChat(
                      `Apply Look & Feel — ${changes.join(', ')}`,
                      themeChanged && amountChanged
                        ? `I've updated the visual style to the ${pendingTheme.label} theme and adjusted the copy density to ${pendingAmount}. All pages have been regenerated with the new look. Want me to fine-tune any specific element?`
                        : themeChanged
                        ? `I've applied the ${pendingTheme.label} theme across all ${pages.length} pages. The colour palette, typography, and background treatment have all been updated to match. Let me know if you'd like to tweak anything.`
                        : `I've set the copy density to ${pendingAmount} across all pages — ${pendingAmount === 'minimal' ? 'short hooks and captions only' : pendingAmount === 'concise' ? 'balanced, punchy copy' : 'paragraph-style detail with more context'}. Want me to regenerate a specific page with this in mind?`,
                      true,
                      themeChanged ? `Applying ${pendingTheme.label} theme…` : 'Updating copy style…'
                    )
                  }
                }}
              >
                Apply for all pages
              </button>
            </div>
          </div>
        </div>
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
        const brandKitAssets = [
          { id: 'bk-logo',    label: 'LayerProof Logo',    bg: '#0f0f10', preview: 'logo' },
          { id: 'bk-logo-wh', label: 'Logo White',          bg: '#1a1a2e', preview: 'logo-wh' },
          { id: 'bk-icon',    label: 'App Icon',            bg: '#ffde42', preview: 'icon' },
          { id: 'bk-pattern', label: 'Brand Pattern',       bg: '#18181b', preview: 'pattern' },
          { id: 'bk-hero',    label: 'Hero Background',     bg: 'linear-gradient(135deg,#1a1a2e,#16213e)', preview: 'hero' },
        ]
        const libraryAssets = [
          { id: 'lib-p1', label: 'Western Woman Portrait', bg: '#c9b89a', preview: 'p1' },
          { id: 'lib-p2', label: 'Western Man Portrait',   bg: '#8ca8c4', preview: 'p2' },
          { id: 'lib-p3', label: 'Chinese Woman Portrait', bg: '#b8c4b0', preview: 'p3' },
          { id: 'lib-p4', label: 'Chinese Man Portrait',   bg: '#a8b4c0', preview: 'p4' },
          { id: 'lib-s1', label: 'Office Interior',        bg: 'linear-gradient(135deg,#e8e0d8,#d0c8c0)', preview: 's1' },
          { id: 'lib-s2', label: 'Tech Abstract',          bg: 'linear-gradient(135deg,#1a1a3e,#2a2a5e)', preview: 's2' },
          { id: 'lib-s3', label: 'Product Flat Lay',       bg: 'linear-gradient(135deg,#f0ece8,#e0dcd8)', preview: 's3' },
          { id: 'lib-s4', label: 'City Skyline',           bg: 'linear-gradient(135deg,#1c2b3a,#2c3b4a)', preview: 's4' },
        ]
        const toggleAsset = (id: string) => setSelectedAssets(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
        const allAssets = [...brandKitAssets, ...libraryAssets]

        return (
          <div className="mv3-assets-overlay" onClick={() => setShowAssetsLibrary(false)}>
            <div className="mv3-assets-modal" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="mv3-assets-header">
                <span className="mv3-assets-title">Select from Assets Library</span>
                <button className="mv3-assets-close" onClick={() => setShowAssetsLibrary(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="mv3-assets-body">
                {/* Brand Kit section */}
                <div className="mv3-assets-section-label">Brand Kit</div>
                <div className="mv3-assets-grid">
                  {brandKitAssets.map(a => (
                    <button
                      key={a.id}
                      className={`mv3-asset-card${selectedAssets.includes(a.id) ? ' mv3-asset-card--selected' : ''}`}
                      onClick={() => toggleAsset(a.id)}
                    >
                      <div className="mv3-asset-thumb" style={{ background: a.bg }}>
                        {a.preview === 'logo' && <svg width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#ffde42"/><text x="16" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1600">LP</text></svg>}
                        {a.preview === 'logo-wh' && <svg width="32" height="32" viewBox="0 0 32 32"><text x="16" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">LP</text></svg>}
                        {a.preview === 'icon' && <svg width="32" height="32" viewBox="0 0 32 32"><rect x="6" y="14" width="20" height="14" rx="3" fill="#1a1600"/><path d="M10 14v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#1a1600" strokeWidth="2.5"/><circle cx="16" cy="20" r="2" fill="#ffde42"/></svg>}
                        {a.preview === 'pattern' && <svg width="100%" height="100%" viewBox="0 0 60 60"><rect width="60" height="60" fill="#18181b"/>{Array.from({length:9}).map((_,i) => <circle key={i} cx={(i%3)*20+10} cy={Math.floor(i/3)*20+10} r="3" fill="#ffde42" opacity=".4"/>)}</svg>}
                        {a.preview === 'hero' && <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1a2e,#16213e)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffde42" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>}
                        {selectedAssets.includes(a.id) && (
                          <div className="mv3-asset-check">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="mv3-asset-label">{a.label}</span>
                    </button>
                  ))}
                  <button className="mv3-asset-card mv3-asset-card--add">
                    <div className="mv3-asset-thumb mv3-asset-thumb--add">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                    <span className="mv3-asset-label">Upload</span>
                  </button>
                </div>

                {/* Assets Library section */}
                <div className="mv3-assets-section-label" style={{ marginTop: 24 }}>Assets Library</div>
                <div className="mv3-assets-grid">
                  {libraryAssets.map(a => (
                    <button
                      key={a.id}
                      className={`mv3-asset-card${selectedAssets.includes(a.id) ? ' mv3-asset-card--selected' : ''}`}
                      onClick={() => toggleAsset(a.id)}
                    >
                      <div className="mv3-asset-thumb" style={{ background: a.bg }}>
                        {(a.preview === 'p1' || a.preview === 'p2' || a.preview === 'p3' || a.preview === 'p4') && (
                          <svg width="40" height="40" viewBox="0 0 40 40" style={{opacity:.6}}><circle cx="20" cy="15" r="8" fill="rgba(0,0,0,.25)"/><ellipse cx="20" cy="34" rx="14" ry="10" fill="rgba(0,0,0,.2)"/></svg>
                        )}
                        {(a.preview === 's1'||a.preview==='s2'||a.preview==='s3'||a.preview==='s4') && (
                          <svg width="40" height="40" viewBox="0 0 40 40" style={{opacity:.5}}><rect x="4" y="10" width="32" height="20" rx="2" fill="rgba(0,0,0,.2)"/><rect x="8" y="14" width="10" height="12" rx="1" fill="rgba(0,0,0,.2)"/></svg>
                        )}
                        {selectedAssets.includes(a.id) && (
                          <div className="mv3-asset-check">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="mv3-asset-label">{a.label}</span>
                    </button>
                  ))}
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
                        const asset = allAssets.find(a => a.id === id)
                        return { id, label: asset?.label ?? id, bg: asset?.bg ?? '#333' }
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
          <div className={`mv3-share-modal${shareTab === 'publish' ? ' mv3-share-modal--publish' : ''}`} onClick={e => e.stopPropagation()} style={{ maxHeight: 'calc(100vh - 48px)', overflowY: shareTab === 'publish' ? 'hidden' : 'auto' }}>
            {/* Tab switcher */}
            <div className="mv3-share-tabs">
              {(['link', 'publish', 'download'] as const).map(tab => (
                <button key={tab} className={`mv3-share-tab${shareTab === tab ? ' mv3-share-tab--active' : ''}`} onClick={() => setShareTab(tab)}>
                  {tab === 'link' ? 'Share Link' : tab === 'publish' ? 'Publish' : 'Download'}
                </button>
              ))}
            </div>

            {shareTab === 'publish' ? (
              /* ── Two-column publish layout ── */
              <div className="mv3-publish-body">
                {/* Left — preview + caption editor */}
                <div className="mv3-publish-left">
                  {/* Post card preview */}
                  <div className="mv3-share-preview-card">
                    <div className="mv3-share-preview-header">
                      <div className="mv3-share-avatar">T</div>
                      <div className="mv3-share-preview-meta">
                        <span className="mv3-share-preview-name">Thuy Huynh</span>
                        <span className="mv3-share-preview-when">Just now · {pageData[pages[activePage]]?.label ?? 'LinkedIn'}</span>
                      </div>
                      <div className="mv3-share-nav" style={{ marginLeft: 'auto' }}>
                        <button className="mv3-share-nav-btn" onClick={() => setActivePage(i => Math.max(i - 1, 0))} disabled={activePage === 0}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <span className="mv3-share-nav-label">{activePage + 1} / {pages.length}</span>
                        <button className="mv3-share-nav-btn" onClick={() => setActivePage(i => Math.min(i + 1, pages.length - 1))} disabled={activePage === pages.length - 1}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="mv3-share-preview-image">
                      <PostPreview page={pageRenderSlot[pages[activePage]] ?? activePage} />
                    </div>
                    <p className="mv3-share-preview-caption">{publishCaption.slice(0, 120)}{publishCaption.length > 120 ? '…' : ''}</p>
                    <div className="mv3-share-preview-hashtags">
                      {publishHashtags.map(h => <span key={h} className="mv3-share-hashtag">#{h}</span>)}
                    </div>
                  </div>

                  {/* Edit content section */}
                  <div className="mv3-publish-edit-section">
                    <div className="mv3-publish-edit-header">
                      <span className="mv3-publish-edit-title">Edit Content</span>
                      <button
                        className={`mv3-publish-generate-btn${generatingCaption ? ' mv3-publish-generate-btn--loading' : ''}`}
                        onClick={() => {
                          setGeneratingCaption(true)
                          setTimeout(() => {
                            setPublishCaption('Protect your innovation before someone else does. LayerProof gives Apple developers the IP layer they\'ve always needed — fast, reliable, and built for builders like you.')
                            setPublishHashtags(['LayerProof', 'AppleDeveloper', 'IPStrategy', 'BuildInPublic', 'TechStartup'])
                            setGeneratingCaption(false)
                          }, 1600)
                        }}
                        disabled={generatingCaption}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M12 2l1.8 5.4L19.2 9l-5.4 1.8L12 16.2l-1.8-5.4L4.8 9l5.4-1.8L12 2z"/>
                          <path d="M19 14l.9 2.7 2.7.9-2.7.9L19 21l-.9-2.7-2.7-.9 2.7-.9L19 14z" opacity=".6"/>
                        </svg>
                        {generatingCaption ? 'Generating…' : `Generate caption for ${publishPlatform === 'linkedin' ? 'LinkedIn' : publishPlatform === 'instagram' ? 'Instagram' : publishPlatform === 'twitter' ? 'X' : publishPlatform === 'facebook' ? 'Facebook' : publishPlatform === 'tiktok' ? 'TikTok' : 'Threads'}`}
                      </button>
                    </div>
                    <div className="mv3-publish-field">
                      <div className="mv3-publish-field-label">
                        Caption
                        <button className="mv3-publish-copy-btn" onClick={() => navigator.clipboard?.writeText(publishCaption)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          Copy
                        </button>
                      </div>
                      <textarea
                        className="mv3-publish-caption-input"
                        value={publishCaption}
                        onChange={e => setPublishCaption(e.target.value)}
                        rows={4}
                      />
                      <span className="mv3-publish-char-count">{publishCaption.length} / 3000</span>
                    </div>
                    <div className="mv3-publish-field">
                      <div className="mv3-publish-field-label">
                        Hashtags
                        <button className="mv3-publish-copy-btn" onClick={() => navigator.clipboard?.writeText(publishHashtags.map(h => '#' + h).join(' '))}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          Copy
                        </button>
                      </div>
                      <div className="mv3-publish-hashtag-list">
                        {publishHashtags.map(h => (
                          <span key={h} className="mv3-publish-hashtag-chip">
                            # {h}
                            <button onClick={() => setPublishHashtags(prev => prev.filter(x => x !== h))}>×</button>
                          </span>
                        ))}
                        <button className="mv3-publish-hashtag-add" onClick={() => {
                          const tag = window.prompt('Add hashtag')
                          if (tag) setPublishHashtags(prev => [...prev, tag.replace(/^#/, '')])
                        }}>+ Add</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right — settings panel */}
                <div className="mv3-publish-right">
                  <div className="mv3-publish-section-label">Platform</div>
                  <div className="mv3-publish-platforms">
                    {[
                      { id: 'instagram', label: 'Instagram', color: '#e1306c' },
                      { id: 'facebook',  label: 'Facebook',  color: '#1877f2' },
                      { id: 'twitter',   label: 'X',         color: '#fff' },
                      { id: 'linkedin',  label: 'LinkedIn',  color: '#0a66c2' },
                      { id: 'tiktok',    label: 'TikTok',    color: '#010101' },
                      { id: 'threads',   label: 'Threads',   color: '#101010' },
                    ].map(p => (
                      <button
                        key={p.id}
                        className={`mv3-publish-platform-btn${publishPlatform === p.id ? ' mv3-publish-platform-btn--active' : ''}`}
                        onClick={() => setPublishPlatform(p.id)}
                        title={p.label}
                      >
                        <div className="mv3-publish-platform-icon" style={{ background: p.color }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            {p.id === 'instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>}
                            {p.id === 'facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>}
                            {p.id === 'twitter' && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>}
                            {p.id === 'linkedin' && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>}
                            {p.id === 'tiktok' && <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>}
                            {p.id === 'threads' && <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.689-2.045 1.07-1.127 1.679-2.863 1.769-5.233H12.75v-2.09h7.02l.012.56c.071 3.51-.693 6.101-2.396 7.932-1.55 1.67-3.784 2.575-6.2 2.575z"/>}
                          </svg>
                        </div>
                        <span className="mv3-publish-platform-label">{p.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mv3-publish-divider" />

                  <div className="mv3-publish-section-label">Connected account</div>
                  <p className="mv3-publish-connected-none">No accounts connected for this platform.</p>
                  <button className="mv3-publish-connect-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    Connect account
                  </button>

                  <div className="mv3-publish-divider" />

                  <div className="mv3-publish-section-label">Title</div>
                  <input
                    className="mv3-publish-input"
                    value={publishTitle}
                    onChange={e => setPublishTitle(e.target.value)}
                  />

                  <div className="mv3-publish-section-label" style={{ marginTop: 14 }}>Publishing Time</div>
                  <div className="mv3-publish-time-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Now · 2:41 PM (Tue, Jun 30)</span>
                  </div>

                  <div className="mv3-publish-divider" />

                  <p className="mv3-publish-count-note">1 of {pages.length} images selected for this platform.</p>

                  <button className="mv3-publish-now-btn" onClick={() => setShowShareMenu(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Publish now!
                  </button>
                </div>
              </div>
            ) : (
              /* ── Download / Link tabs (unchanged) ── */
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
            )}

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
  if (page === -1) {
    return <div className="mv3-post-preview" style={{ background: '#f5f4f0' }} />
  }

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
  if (page === -1) {
    return (
      <div style={{ aspectRatio: '1', height: '100%', maxWidth: '100%', background: '#f5f4f0', borderRadius: 6 }} />
    )
  }

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
