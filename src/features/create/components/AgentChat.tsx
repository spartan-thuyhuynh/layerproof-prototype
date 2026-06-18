import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Send, ChevronRight, Check, X } from 'lucide-react'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'

/* ── types ────────────────────────────────────────────────────────── */
type Phase =
  | 'idle'
  | 'tool-form'
  | 'form'
  | 'submitting'
  | 'tool-brief'
  | 'brief'
  | 'outline'
  | 'done'

interface FormValues { [key: string]: string }

interface PostOutline {
  index: number
  title: string
  subtitle: string
  imageDesc: string
  cta: string
}

interface ThemeOption {
  id: string
  name: string
  sub?: string
  colors: string[]
  section: 'system' | 'standalone' | 'brand'
}

/* ── mock data ────────────────────────────────────────────────────── */
const SYSTEM_THEMES: ThemeOption[] = [
  { id: 'minimal-dark',  name: 'Minimal Dark',    colors: ['#09090b','#ffffff','#fbbf24'], section: 'system' },
  { id: 'bold-gradient', name: 'Bold Gradient',   colors: ['#7c3aed','#ec4899','#fbbf24'], section: 'system' },
  { id: 'clean-light',   name: 'Clean Light',     colors: ['#f8f8f8','#1a1a1a','#3b82f6'], section: 'system' },
  { id: 'neon-accent',   name: 'Neon Accent',     colors: ['#0a0a0a','#22d3ee','#a855f7'], section: 'system' },
  { id: 'warm-terra',    name: 'Warm Terra',      colors: ['#1c0f07','#f97316','#fbbf24'], section: 'system' },
  { id: 'ocean',         name: 'Ocean',           colors: ['#040d1a','#0ea5e9','#38bdf8'], section: 'system' },
  { id: 'rose-gold',     name: 'Rose Gold',       colors: ['#1a0a0f','#f43f5e','#fda4af'], section: 'system' },
  { id: 'forest',        name: 'Forest',          colors: ['#0a1a0f','#22c55e','#86efac'], section: 'system' },
  { id: 'slate',         name: 'Slate',           colors: ['#0f172a','#94a3b8','#e2e8f0'], section: 'system' },
]

const STANDALONE_THEMES: ThemeOption[] = [
  { id: 'custom-1', name: 'My Minimal Theme', colors: ['#18181b','#e4e4e7','#6366f1'], section: 'standalone' },
  { id: 'custom-2', name: 'Summer Vibes',     colors: ['#fff7ed','#ea580c','#fbbf24'], section: 'standalone' },
  { id: 'custom-3', name: 'Midnight Blue',    colors: ['#030712','#1e40af','#93c5fd'], section: 'standalone' },
]

// Generate multiple theme variants from a brand kit's palette
function makeBrandKitThemes(kit: { id: string; name: string; colors: { palettes: { colors: { hex: string }[] }[] } }): ThemeOption[] {
  const allColors = kit.colors.palettes.flatMap(p => p.colors).map(c => c.hex)
  if (allColors.length === 0) return []
  const c = allColors
  // Primary variant: first 3 colors
  const primary: ThemeOption = {
    id: `brand-${kit.id}-primary`,
    name: 'Primary',
    sub: 'Brand kit',
    colors: c.slice(0, 3).length >= 2 ? c.slice(0, 3) : [...c.slice(0,2), '#1a1a1a'],
    section: 'brand',
  }
  // Dark variant: darken bg, keep accents
  const dark: ThemeOption = {
    id: `brand-${kit.id}-dark`,
    name: 'Dark',
    sub: 'Brand kit',
    colors: ['#0a0a0a', c[0] ?? '#ffffff', c[1] ?? '#fbbf24'],
    section: 'brand',
  }
  // Minimal variant: muted bg + single accent
  const minimal: ThemeOption = {
    id: `brand-${kit.id}-minimal`,
    name: 'Minimal',
    sub: 'Brand kit',
    colors: ['#18181b', '#e4e4e7', c[0] ?? '#6366f1'],
    section: 'brand',
  }
  return [primary, dark, minimal]
}

/* ── helpers ─────────────────────────────────────────────────────── */
function capitalize(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function generateBrief(config: ProductConfig, prompt: string, values: FormValues) {
  const platform  = values.platform  ?? 'LinkedIn'
  const tone      = values.tone      ?? 'Professional'
  const count     = values.count     ?? '5 posts'
  const audience  = values.audience  ?? 'Professionals and enthusiasts'
  const theme     = values.theme     ?? 'Minimal Dark'

  const title = `${config.label} Campaign — ${capitalize(prompt)}`
  const meta: [string, string][] = [
    ['Platform', platform],
    ['Audience', audience],
    ['Theme',    theme],
    ['Tone',     tone],
    ['Format',   count],
  ]

  const topics = [
    `Introduction to ${prompt}: what it is and why it matters`,
    'Core concepts and mental models to understand first',
    'Step-by-step framework you can apply immediately',
    'Real-world examples and case study walkthrough',
    'Common mistakes and how to avoid over-complicating it',
  ]

  return { title, meta, topics }
}

/* ── ThemeLibrary ────────────────────────────────────────────────── */
function ThemePreview({ colors }: { colors: string[] }) {
  const [c0, c1, c2] = colors
  const bg  = c0 ?? '#0a0a0a'
  const txt = c1 ?? '#e4e4e7'
  const acc = c2 ?? c1 ?? '#fbbf24'

  return (
    <div className="ac2-theme-preview" style={{ background: bg }}>
      {/* Top bar — eyebrow tag */}
      <div className="ac2-tp-top">
        <div className="ac2-tp-tag" style={{ background: acc, opacity: .9 }} />
        <div className="ac2-tp-tag" style={{ background: txt, opacity: .25, width: 24 }} />
      </div>
      {/* Headline block */}
      <div className="ac2-tp-headline" style={{ background: acc }} />
      <div className="ac2-tp-headline" style={{ background: acc, width: '65%', opacity: .7, marginTop: 4 }} />
      {/* Body copy lines */}
      <div className="ac2-tp-body-lines">
        <div className="ac2-tp-line" style={{ background: txt, opacity: .35 }} />
        <div className="ac2-tp-line" style={{ background: txt, opacity: .25, width: '80%' }} />
      </div>
      {/* CTA button */}
      <div className="ac2-tp-cta" style={{ background: acc }} />
    </div>
  )
}

function ThemeLibraryModal({
  selected, onSelect, onClose,
}: {
  selected: string
  onSelect: (theme: ThemeOption) => void
  onClose: () => void
}) {
  const { kits } = useBrandStore()
  const [tab, setTab] = useState<'system' | 'yours'>('system')

  // Each brand kit expands into 3 theme variants
  const brandThemes: ThemeOption[] = kits.flatMap(kit => makeBrandKitThemes(kit))

  function ThemeCard({ theme }: { theme: ThemeOption }) {
    const isSelected = selected === theme.id
    return (
      <button
        className={`ac2-theme-card${isSelected ? ' selected' : ''}`}
        onClick={() => { onSelect(theme); onClose() }}
      >
        <ThemePreview colors={theme.colors} />
        <div className="ac2-theme-card-name">{theme.name}</div>
        {theme.sub && <div className="ac2-theme-card-sub">{theme.sub}</div>}
      </button>
    )
  }

  return (
    <div className="ac2-theme-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ac2-theme-modal">
        {/* Header */}
        <div className="ac2-theme-modal-header">
          <span className="ac2-theme-modal-title">Theme Library</span>
          <button className="ac2-theme-modal-close" onClick={onClose}><X size={13} /></button>
        </div>

        {/* Tab toggle */}
        <div className="ac2-theme-tabs">
          <button
            className={`ac2-theme-tab${tab === 'system' ? ' active' : ''}`}
            onClick={() => setTab('system')}
          >
            System themes
          </button>
          <button
            className={`ac2-theme-tab${tab === 'yours' ? ' active' : ''}`}
            onClick={() => setTab('yours')}
          >
            Your themes
          </button>
        </div>

        {/* Body */}
        <div className="ac2-theme-modal-body">
          {tab === 'system' && (
            <div className="ac2-theme-grid">
              {SYSTEM_THEMES.map(t => <ThemeCard key={t.id} theme={t} />)}
            </div>
          )}

          {tab === 'yours' && (
            <>
              {/* Standalone */}
              <div className="ac2-theme-subsection">
                <div className="ac2-theme-subsection-label">Standalone themes</div>
                <div className="ac2-theme-grid">
                  {STANDALONE_THEMES.map(t => <ThemeCard key={t.id} theme={t} />)}
                </div>
              </div>

              {/* Brand kit themes — grouped per kit */}
              {kits.map(kit => {
                const themes = makeBrandKitThemes(kit)
                if (!themes.length) return null
                return (
                  <div key={kit.id} className="ac2-theme-subsection">
                    <div className="ac2-theme-subsection-label">{kit.name}</div>
                    <div className="ac2-theme-grid">
                      {themes.map(t => <ThemeCard key={t.id} theme={t} />)}
                    </div>
                  </div>
                )
              })}

              {kits.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>
                  No brand kits yet. Create one in Brand Kit first.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── CampaignDetailsCard ─────────────────────────────────────────── */
function CampaignDetailsCard({
  config, onConfirm,
}: {
  config: ProductConfig
  onConfirm: (values: FormValues) => void
}) {
  const [values, setValues]       = useState<FormValues>({})
  const [showThemes, setShowThemes] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null)

  // Extract only the platform and tone turns from agentScript (skip variations/count for now)
  const platformTurn = config.agentScript.find(t => t.message.toLowerCase().includes('platform'))
  const toneTurn     = config.agentScript.find(t => t.message.toLowerCase().includes('tone'))
  const countTurn    = config.agentScript.find(t =>
    t.message.toLowerCase().includes('variation') ||
    t.message.toLowerCase().includes('how many') ||
    !t.isFinal && !t.message.toLowerCase().includes('platform') && !t.message.toLowerCase().includes('tone')
  )

  function set(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const isComplete = !!values.platform && !!values.tone && !!selectedTheme

  function PillGroup({ fieldKey, chips }: { fieldKey: string; chips: string[] }) {
    return (
      <div className="ac2-pill-group">
        {chips.map(opt => {
          const active = values[fieldKey] === opt
          return (
            <button
              key={opt}
              className={`ac2-pill${active ? ' active' : ''}`}
              style={active ? { '--pc': config.color } as React.CSSProperties : undefined}
              onClick={() => set(fieldKey, opt)}
            >
              {active && <Check size={11} strokeWidth={3} />}
              {opt}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <div className="ac2-card ac2-form-card">
        <p className="ac2-form-intro">
          Help me tailor this {config.label.toLowerCase()} for your audience.
        </p>

        {/* Platform */}
        {platformTurn && (
          <div className="ac2-form-field">
            <div className="ac2-form-label">Platform</div>
            <PillGroup fieldKey="platform" chips={platformTurn.chips!} />
          </div>
        )}

        {/* Target Audience */}
        <div className="ac2-form-field">
          <div className="ac2-form-label">Target audience</div>
          <input
            className="ac2-form-text"
            placeholder="e.g. CS students, software engineers…"
            value={values.audience ?? ''}
            onChange={e => set('audience', e.target.value)}
          />
        </div>

        {/* Tone */}
        {toneTurn && (
          <div className="ac2-form-field">
            <div className="ac2-form-label">Tone</div>
            <PillGroup fieldKey="tone" chips={toneTurn.chips!} />
          </div>
        )}

        {/* Count/format */}
        {countTurn && countTurn.chips && (
          <div className="ac2-form-field">
            <div className="ac2-form-label">Posts</div>
            <PillGroup fieldKey="count" chips={countTurn.chips} />
          </div>
        )}

        {/* Theme */}
        <div className="ac2-form-field">
          <div className="ac2-form-label">Theme</div>
          <button className="ac2-theme-btn" onClick={() => setShowThemes(true)}>
            {/* Single mini preview */}
            <div className="ac2-theme-btn-preview">
              {selectedTheme ? (
                <div className="ac2-theme-btn-preview-inner" style={{ background: selectedTheme.colors[0] }}>
                  <div style={{ background: selectedTheme.colors[2] ?? selectedTheme.colors[1], width: '60%', height: 3, borderRadius: 2, marginBottom: 3, opacity: .9 }} />
                  <div style={{ background: selectedTheme.colors[1] ?? '#fff', width: '80%', height: 2, borderRadius: 2, opacity: .5 }} />
                </div>
              ) : (
                <div className="ac2-theme-btn-preview-inner" style={{ background: 'rgba(255,255,255,.06)' }} />
              )}
            </div>
            <span className={`ac2-theme-btn-name${selectedTheme ? ' selected' : ''}`}>
              {selectedTheme ? selectedTheme.name : 'Choose from theme library'}
            </span>
            <ChevronRight size={14} className="ac2-theme-btn-caret" />
          </button>
        </div>

        <button
          className="ac2-confirm-btn"
          disabled={!isComplete}
          style={isComplete ? { background: config.color } : undefined}
          onClick={() => onConfirm({ ...values, theme: selectedTheme?.name ?? '' })}
        >
          Confirm requirements
          <ChevronRight size={14} />
        </button>
      </div>

      {showThemes && (
        <ThemeLibraryModal
          selected={selectedTheme?.id ?? ''}
          onSelect={t => { setSelectedTheme(t); set('theme', t.name) }}
          onClose={() => setShowThemes(false)}
        />
      )}
    </>
  )
}

/* ── BriefCard ───────────────────────────────────────────────────── */
function BriefCard({
  brief, config, onApprove,
}: {
  brief: ReturnType<typeof generateBrief>
  config: ProductConfig
  onApprove: () => void
}) {
  const [change, setChange] = useState('')
  return (
    <div className="ac2-card ac2-brief-card">
      <div className="ac2-brief-title">
        <span className="ac2-brief-label">Brief</span>
        {brief.title}
      </div>

      <div className="ac2-brief-meta">
        {brief.meta.map(([k, v]) => (
          <div key={k} className="ac2-brief-row">
            <span className="ac2-brief-key">{k}</span>
            <span className="ac2-brief-val">{v}</span>
          </div>
        ))}
      </div>

      <div className="ac2-brief-section-label">Proposed post themes</div>
      <ul className="ac2-brief-themes">
        {brief.topics.map((t, i) => <li key={i}>{t}</li>)}
      </ul>

      <div className="ac2-ready-box">
        <div className="ac2-ready-title">Ready to generate</div>
        <p className="ac2-ready-sub">Approve the brief above, or describe what to change.</p>
        <button
          className="ac2-generate-btn"
          style={{ background: config.color }}
          onClick={onApprove}
        >
          Generate outline
        </button>
        <div className="ac2-change-label">What would you like to change?</div>
        <div className="ac2-change-row">
          <input
            className="ac2-change-input"
            placeholder="e.g. Change tone to more playful, target a younger audience…"
            value={change}
            onChange={e => setChange(e.target.value)}
          />
          <button className="ac2-change-send" disabled={!change.trim()}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Outline generator ───────────────────────────────────────────── */
function generateOutline(brief: ReturnType<typeof generateBrief>): PostOutline[] {
  const ctas = ['Start your journey today!', 'Learn more →', 'Try it yourself', 'Save & share this post', 'Drop a comment below ↓']
  return brief.topics.map((topic, i) => {
    const [head, rest] = topic.split(':')
    return {
      index: i,
      title: head?.trim() ?? topic,
      subtitle: rest?.trim() ?? `Discover key insights about ${head?.toLowerCase() ?? 'this topic'}.`,
      imageDesc: `An illustration representing ${head?.toLowerCase() ?? topic} — clean, modern, on-brand.`,
      cta: ctas[i % ctas.length],
    }
  })
}

/* ── OutlineEditor ───────────────────────────────────────────────── */
function OutlineEditor({
  brief, config, formValues, userPrompt, onBack,
}: {
  brief: ReturnType<typeof generateBrief>
  config: ProductConfig
  formValues: FormValues
  userPrompt: string
  onBack: () => void
}) {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostOutline[]>(() => generateOutline(brief))
  const [chatInput, setChatInput] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [genPhase, setGenPhase] = useState<'idle' | 'rewriting' | 'rewrite-done' | 'confirming' | 'brief-updating' | 'brief-updated'>('idle')
  const [chatLabel, setChatLabel] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [liveBrief, setLiveBrief] = useState(brief)
  const sidebarThreadRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Setup card state (Text Format, Theme, Brand Kit, Aspect Ratio)
  const RATIOS = [
    { id: '1:1',  label: '1:1 Square',   w: 1,  h: 1  },
    { id: '4:5',  label: '4:5 Portrait',  w: 4,  h: 5  },
    { id: '9:16', label: '9:16 Story',    w: 9,  h: 16 },
    { id: '16:9', label: '16:9 Landscape',w: 16, h: 9  },
  ]
  const TEXT_FORMATS = ['Auto', 'Concise', 'Detailed', 'Bullet points']
  const [selectedRatio, setSelectedRatio] = useState('1:1')
  const [selectedTextFormat, setSelectedTextFormat] = useState('Auto')
  const [selectedBrandKit, setSelectedBrandKit] = useState<string | null>(null)
  const [setupTheme, setSetupTheme] = useState<ThemeOption | null>(() => {
    const initialTheme = formValues.theme ?? ''
    return [...SYSTEM_THEMES, ...STANDALONE_THEMES].find(t => t.name === initialTheme) ?? null
  })
  const [showSetupThemes, setShowSetupThemes] = useState(false)
  const [ratioPickerOpen, setRatioPickerOpen] = useState(false)
  const currentRatio = RATIOS.find(r => r.id === selectedRatio) ?? RATIOS[0]

  const tone    = formValues.tone    ?? 'Auto'
  const count   = formValues.count   ?? `${posts.length} posts`
  const theme   = formValues.theme   ?? 'No theme selected'
  const platform = formValues.platform ?? '1:1 Square'

  function triggerBriefUpdate(changeDesc: string) {
    setChatMessages(prev => [...prev, { role: 'assistant', text: `I've updated the brief: ${changeDesc}. Would you like to change or adjust anything else?` }])
    setGenPhase('brief-updating')
    setTimeout(() => {
      setGenPhase('brief-updated')
      setTimeout(() => {
        if (sidebarThreadRef.current) {
          sidebarThreadRef.current.scrollTo({ top: sidebarThreadRef.current.scrollHeight, behavior: 'smooth' })
        }
      }, 50)
    }, 1200)
  }

  useEffect(() => {
    setTimeout(() => setGenPhase('rewriting'), 400)
    setTimeout(() => setGenPhase('rewrite-done'), 1400)
    setTimeout(() => setGenPhase('confirming'), 2000)
  }, [])

  function handleGenerateClick() {
    setTimeout(() => {
      if (sidebarThreadRef.current) {
        sidebarThreadRef.current.scrollTo({ top: sidebarThreadRef.current.scrollHeight, behavior: 'smooth' })
      }
    }, 50)
  }

  function updatePost(idx: number, field: keyof PostOutline, val: string) {
    setPosts(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p))
  }

  function handleChatSend() {
    const text = chatInput.trim()
    if (!text) return
    setChatMessages(prev => [...prev, { role: 'user', text }])
    setChatInput('')
    setChatLabel('')
    setGenPhase('brief-updating')
    setTimeout(() => {
      setGenPhase('brief-updated')
      // In a real app, liveBrief would be updated from the AI response
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Got it! I\'ve updated your brief based on your feedback.' }])
      setTimeout(() => {
        if (sidebarThreadRef.current) {
          sidebarThreadRef.current.scrollTo({ top: sidebarThreadRef.current.scrollHeight, behavior: 'smooth' })
        }
      }, 50)
    }, 1800)
    setTimeout(() => {
      if (sidebarThreadRef.current) {
        sidebarThreadRef.current.scrollTo({ top: sidebarThreadRef.current.scrollHeight, behavior: 'smooth' })
      }
    }, 50)
  }

  const jsonPreview = JSON.stringify({ posts: posts.map((p, i) => ({ post_index: i, title: p.title })) }, null, 2)

  return (
    <div className="oe-shell">
      {/* Page-level back button */}
      <button className="oe-page-back" onClick={onBack}>
        <ChevronLeft size={15} />
      </button>

      {/* ── Left: Guided chat panel ── */}
      <aside className="oe-sidebar">
        <div className="oe-sidebar-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} className="oe-sidebar-icon">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="oe-sidebar-title">Guided chat</span>
        </div>

        <div className="oe-sidebar-thread" ref={sidebarThreadRef}>
          {/* User prompt bubble */}
          <div className="oe-user-bubble">{userPrompt}</div>

          {/* Context chips */}
          <div className="oe-chips-row">
            <span className="oe-chip oe-chip--tone">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              Tone
            </span>
            <span className="oe-chip-val">{tone}</span>
            <span className="oe-chip oe-chip--format">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
              Format
            </span>
            <span className="oe-chip-val">{count}</span>
          </div>

          {/* Tool call */}
          <div className="oe-tool-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span className="oe-tool-name">list_entries</span>
            <span className="oe-tool-done"><Check size={10} strokeWidth={3} /></span>
            <button className="oe-tool-chevron" onClick={() => setShowJson(v => !v)}>
              <ChevronRight size={12} style={{ transform: showJson ? 'rotate(90deg)' : undefined, transition: 'transform .15s' }} />
            </button>
          </div>

          {/* JSON block */}
          {showJson && (
            <div className="oe-json-block">
              <pre>{jsonPreview}</pre>
              <button className="oe-json-collapse" onClick={() => setShowJson(false)}>
                <ChevronRight size={11} style={{ transform: 'rotate(270deg)' }} /> Hide JSON block
              </button>
            </div>
          )}
          {!showJson && (
            <button className="oe-json-show" onClick={() => setShowJson(true)}>
              <ChevronRight size={11} style={{ transform: 'rotate(90deg)' }} /> Show JSON block
            </button>
          )}

          {/* Brief rewrite tool call */}
          {(genPhase === 'rewriting' || genPhase === 'rewrite-done' || genPhase === 'confirming') && (
            <div className="oe-tool-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span className="oe-tool-name">rewrite_brief</span>
              {genPhase === 'rewriting'
                ? <span className="ac2-tool-running"><span /><span /><span /></span>
                : <span className="oe-tool-done"><Check size={10} strokeWidth={3} /></span>
              }
            </div>
          )}

          {/* Rewritten brief summary */}
          {(genPhase === 'rewrite-done' || genPhase === 'confirming') && (() => {
            const themeEntry  = brief.meta.find(([k]) => k === 'Theme')
            const themeName   = themeEntry?.[1] ?? theme
            const themeOption = [...SYSTEM_THEMES, ...STANDALONE_THEMES].find(t => t.name === themeName)
            const themeColors = themeOption?.colors ?? ['#09090b', '#ffffff', '#fbbf24']
            const otherMeta   = brief.meta.filter(([k]) => k !== 'Theme' && k !== 'Format')
            return (
              <div className="oe-rewrite-brief">
                <div className="oe-rewrite-brief-title">{brief.title}</div>

                {/* Theme — full width */}
                <div className="oe-rewrite-visual-cell">
                  <div className="oe-rewrite-visual-label">Theme</div>
                  <div className="oe-rewrite-theme-preview-wrap">
                    <ThemePreview colors={themeColors} />
                  </div>
                  <div className="oe-rewrite-visual-val">{themeName}</div>
                </div>

                {/* Meta rows — read-only */}
                <div className="oe-rewrite-brief-meta">
                  {otherMeta.map(([k, v]) => (
                    <div key={k} className="oe-rewrite-brief-row">
                      <span className="oe-rewrite-brief-key">{k}</span>
                      <span className="oe-rewrite-brief-val">{v}</span>
                    </div>
                  ))}
                  <div className="oe-rewrite-brief-row">
                    <span className="oe-rewrite-brief-key">Aspect ratio</span>
                    <span className="oe-rewrite-brief-val">{currentRatio.label}</span>
                  </div>
                </div>

                {/* Edit guide */}
                <div className="oe-rewrite-guide">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Use the chat below to update any part of your brief.
                </div>
              </div>
            )
          })()}

          {/* Generation confirmation */}
          {genPhase === 'confirming' && (
            <div className="oe-confirm-block">
              <div className="oe-agent-bubble">
                Your outline looks great! Would you like to make any final adjustments, or are you ready to generate?
              </div>
              {!chatLabel && (
                <div className="oe-confirm-actions">
                  <button
                    className="oe-confirm-adjust"
                    onClick={() => {
                      setChatLabel('Provide detail for adjustment')
                      setTimeout(() => chatInputRef.current?.focus(), 50)
                    }}
                  >
                    Adjust
                  </button>
                  <button
                    className="oe-confirm-generate"
                    style={{ background: '#fff', color: '#000' }}
                    onClick={() => navigate(`/editor/${config.slug}`)}
                  >
                    Confirm &amp; Generate
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat history after initial confirmation */}
          {chatMessages.map((msg, i) => (
            msg.role === 'user'
              ? <div key={i} className="oe-user-bubble">{msg.text}</div>
              : <div key={i} className="oe-agent-bubble">{msg.text}</div>
          ))}

          {/* Brief updating animation */}
          {genPhase === 'brief-updating' && (
            <div className="oe-tool-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span className="oe-tool-name">update_brief</span>
              <span className="ac2-tool-running"><span /><span /><span /></span>
            </div>
          )}

          {/* Updated brief panel */}
          {genPhase === 'brief-updated' && (() => {
            const themeEntry  = liveBrief.meta.find(([k]) => k === 'Theme')
            const themeName   = themeEntry?.[1] ?? theme
            const themeOption = [...SYSTEM_THEMES, ...STANDALONE_THEMES].find(t => t.name === themeName)
            const themeColors = themeOption?.colors ?? ['#09090b', '#ffffff', '#fbbf24']
            const otherMeta   = liveBrief.meta.filter(([k]) => k !== 'Theme' && k !== 'Format')
            return (
              <div className="oe-rewrite-brief oe-rewrite-brief--updated">
                <div className="oe-brief-updated-badge">
                  <Check size={10} strokeWidth={3} /> Brief updated
                </div>
                <div className="oe-rewrite-brief-title">{liveBrief.title}</div>
                <div className="oe-rewrite-visual-cell">
                  <div className="oe-rewrite-visual-label">Theme</div>
                  <div className="oe-rewrite-theme-preview-wrap">
                    <ThemePreview colors={themeColors} />
                  </div>
                  <div className="oe-rewrite-visual-val">{themeName}</div>
                </div>
                <div className="oe-rewrite-brief-meta">
                  {otherMeta.map(([k, v]) => (
                    <div key={k} className="oe-rewrite-brief-row">
                      <span className="oe-rewrite-brief-key">{k}</span>
                      <span className="oe-rewrite-brief-val">{v}</span>
                    </div>
                  ))}
                  <div className="oe-rewrite-brief-row">
                    <span className="oe-rewrite-brief-key">Aspect ratio</span>
                    <span className="oe-rewrite-brief-val">{currentRatio.label}</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Input */}
        <div className="oe-sidebar-input">
          {chatLabel && (
            <div className="oe-chat-label-row">
              <span className="oe-chat-label">{chatLabel}</span>
              <button
                className="oe-chat-label-close"
                onClick={() => { setChatLabel(''); setChatInput('') }}
              >
                <X size={12} />
              </button>
            </div>
          )}
          {chatLabel && (
            <div className="oe-adjust-suggestions">
              {['Change tone to more casual', 'Reduce to 3 posts', 'Focus more on product benefits', 'Add a strong CTA to each post'].map(s => (
                <button key={s} className="oe-adjust-chip" onClick={() => { setChatInput(s); chatInputRef.current?.focus() }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <input
            ref={chatInputRef}
            className="oe-chat-input"
            placeholder={chatLabel ? 'Describe what to adjust…' : 'Ask the agent to update your brief...'}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChatSend()}
          />
          <div className="oe-input-actions">
            <button className="oe-input-add"><Plus size={14} /></button>
            <div style={{ flex: 1 }} />
            <button
              className="oe-input-send"
              style={{ background: config.color }}
              disabled={!chatInput.trim() || genPhase === 'brief-updating'}
              onClick={handleChatSend}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Right: Content outline ── */}
      <main className="oe-main">
        {/* ── Setup cards ── */}
        <div className="oe-setup-bar">
          {/* Text Format */}
          <div className="oe-setup-card">
            <div className="oe-setup-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
            </div>
            <div className="oe-setup-card-body">
              <div className="oe-setup-card-title">Text Format</div>
              <div className="oe-setup-card-sub">{[tone, selectedTextFormat, brief.meta.find(([k]) => k === 'Audience')?.[1] ?? ''].filter(Boolean).join(' · ')}</div>
            </div>
          </div>

          {/* Theme */}
          <button className="oe-setup-card oe-setup-card--btn" onClick={() => setShowSetupThemes(true)}>
            <div className="oe-setup-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </div>
            <div className="oe-setup-card-body">
              <div className="oe-setup-card-title">Theme</div>
              {setupTheme ? (
                <div className="oe-setup-theme-preview">
                  <div className="oe-setup-theme-swatch" style={{ background: setupTheme.colors[0] }}>
                    <div style={{ background: setupTheme.colors[2] ?? setupTheme.colors[1], height: 3, width: '55%', borderRadius: 1, marginBottom: 2, opacity: .9 }} />
                    <div style={{ background: setupTheme.colors[1], height: 2, width: '75%', borderRadius: 1, opacity: .5 }} />
                    <div style={{ background: setupTheme.colors[1], height: 2, width: '60%', borderRadius: 1, opacity: .35 }} />
                  </div>
                  <span className="oe-setup-card-sub">{setupTheme.name}</span>
                </div>
              ) : (
                <div className="oe-setup-card-sub">No theme selected</div>
              )}
            </div>
          </button>

          {/* Aspect Ratio */}
          <div className="oe-setup-card" style={{ position: 'relative' }}>
            <button className="oe-setup-card-inner-btn" onClick={() => setRatioPickerOpen(v => !v)}>
              <div className="oe-setup-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </div>
              <div className="oe-setup-card-body">
                <div className="oe-setup-card-title">Aspect Ratio</div>
                <div className="oe-setup-card-sub">{currentRatio.label}</div>
              </div>
            </button>
            {ratioPickerOpen && (
              <div className="oe-ratio-picker oe-ratio-picker--setup" onClick={e => e.stopPropagation()}>
                {RATIOS.map(r => (
                  <button key={r.id}
                    className={`oe-ratio-option${r.id === selectedRatio ? ' active' : ''}`}
                    onClick={() => { setSelectedRatio(r.id); setRatioPickerOpen(false); triggerBriefUpdate(`Aspect ratio changed to ${r.label}`) }}
                  >
                    <div className="oe-ratio-shape" style={{ aspectRatio: `${r.w}/${r.h}`, width: r.w >= r.h ? 20 : undefined, height: r.h > r.w ? 20 : undefined }} />
                    <span className="oe-ratio-label">{r.label}</span>
                    {r.id === selectedRatio && <Check size={11} strokeWidth={3} style={{ marginLeft: 'auto', color: config.color }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content header */}
        <div className="oe-content-header">
          <div>
            <h2 className="oe-content-title">Content outline</h2>
            <p className="oe-content-sub">Review and refine your social post structure</p>
          </div>
          <div className="oe-post-count" style={{ background: config.color, color: '#000' }}>
            {posts.length} posts
          </div>
        </div>

        {/* Post cards */}
        <div className="oe-posts">
          {posts.map((post, i) => (
            <div key={i} className="oe-post-card">
              {/* Card header */}
              <div className="oe-post-header">
                <div className="oe-post-num" style={{ background: config.color, color: '#000' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <span className="oe-post-title-preview">{post.title}</span>
              </div>

              {/* Fields */}
              <div className="oe-post-fields">
                <div className="oe-post-field">
                  <div className="oe-field-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                    TITLE
                  </div>
                  <div
                    className="oe-field-value"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updatePost(i, 'title', e.currentTarget.textContent ?? '')}
                  >{post.title}</div>
                </div>

                <div className="oe-post-field">
                  <div className="oe-field-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    SUBTITLE <span className="oe-optional">(optional)</span>
                  </div>
                  <div
                    className="oe-field-value"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updatePost(i, 'subtitle', e.currentTarget.textContent ?? '')}
                  >{post.subtitle}</div>
                </div>

                <div className="oe-post-field">
                  <div className="oe-field-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    IMAGE DESCRIPTION
                  </div>
                  <div
                    className="oe-field-value oe-field-value--muted"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updatePost(i, 'imageDesc', e.currentTarget.textContent ?? '')}
                  >{post.imageDesc}</div>
                </div>

                <div className="oe-post-field">
                  <div className="oe-field-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    CTA <span className="oe-optional">(optional)</span>
                  </div>
                  <div
                    className="oe-field-value"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => updatePost(i, 'cta', e.currentTarget.textContent ?? '')}
                  >{post.cta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="oe-generate-bar">
          <button className="oe-auto-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            AI Model
            <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>

        {/* Theme picker modal for setup card */}
        {showSetupThemes && (
          <ThemeLibraryModal
            selected={setupTheme?.id ?? ''}
            onSelect={t => {
              setSetupTheme(t)
              setShowSetupThemes(false)
              triggerBriefUpdate(`Theme changed to "${t.name}"`)
            }}
            onClose={() => setShowSetupThemes(false)}
          />
        )}
      </main>
    </div>
  )
}

/* ── ToolCallRow ─────────────────────────────────────────────────── */
function ToolCallRow({ name, done }: { name: string; done: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="ac2-tool-call">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="ac2-tool-icon">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
      <span className="ac2-tool-name">{name}</span>
      {done ? (
        <span className="ac2-tool-done"><Check size={10} strokeWidth={3} /></span>
      ) : (
        <span className="ac2-tool-running"><span /><span /><span /></span>
      )}
      <button className="ac2-tool-expand" onClick={() => setExpanded(e => !e)}>
        <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : undefined, transition: 'transform .15s' }} />
      </button>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────── */
interface Props {
  config: ProductConfig
  userPrompt: string
  onBack: () => void
}

export function AgentChat({ config, userPrompt, onBack }: Props) {
  const navigate   = useNavigate()
  const Icon       = I.Icons[config.icon]
  const threadRef  = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const [phase, setPhase]             = useState<Phase>('idle')
  const [brief, setBrief]             = useState<ReturnType<typeof generateBrief> | null>(null)
  const [savedFormValues, setSavedFormValues] = useState<FormValues>({})
  const [input, setInput]             = useState('')
  const contextChips = [config.label, 'AI-assisted', 'Guided brief']

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    setTimeout(() => setPhase('tool-form'), 500)
    setTimeout(() => setPhase('form'), 1200)
  }, [])

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [phase, brief])

  function handleFormConfirm(values: FormValues) {
    setSavedFormValues(values)
    setPhase('submitting')
    setTimeout(() => setPhase('tool-brief'), 300)
    setTimeout(() => {
      setBrief(generateBrief(config, userPrompt, values))
      setPhase('brief')
    }, 1100)
  }

  function handleApprove() {
    setPhase('outline')
  }

  // Render the full-screen outline editor when in outline phase
  if (phase === 'outline' && brief) {
    return (
      <OutlineEditor
        brief={brief}
        config={config}
        formValues={savedFormValues}
        userPrompt={userPrompt}
        onBack={() => setPhase('brief')}
      />
    )
  }

  return (
    <div className="ac2-shell">
      {/* Header */}
      <header className="ac2-header">
        <button className="ac2-header-back" onClick={onBack}>
          <ChevronLeft size={15} />
        </button>
        <div className="ac2-header-info">
          <div className="ac2-header-title">Chat with Agent</div>
          <div className="ac2-header-sub">
            Confirm requirements in chat. When the brief is ready, follow the agent to generate.
          </div>
        </div>
        <div className="ac2-header-product" style={{ color: config.color }}>
          {Icon && <Icon style={{ width: 15, height: 15 }} />}
          <span>{config.label}</span>
        </div>
      </header>

      {/* Thread */}
      <div className="ac2-thread" ref={threadRef}>
        <button className="ac2-new-chat">
          <Plus size={13} /> New chat
        </button>

        {/* User message */}
        <div className="ac2-user-block">
          <div className="ac2-user-chips">
            {contextChips.map(c => <span key={c} className="ac2-user-chip">{c}</span>)}
          </div>
          <div className="ac2-user-bubble-row">
            <div className="ac2-user-bubble">{userPrompt}</div>
            <div className="ac2-user-av"><span>TH</span></div>
          </div>
        </div>

        {/* Tool call 1 */}
        {phase !== 'idle' && (
          <ToolCallRow name="read_campaign_state" done={phase !== 'tool-form'} />
        )}

        {/* Campaign details form */}
        {(phase === 'form' || phase === 'submitting') && (
          <CampaignDetailsCard config={config} onConfirm={handleFormConfirm} />
        )}

        {phase === 'submitting' && (
          <div className="ac2-typing"><span /><span /><span /></div>
        )}

        {/* Tool call 2 */}
        {(phase === 'tool-brief' || phase === 'brief' || phase === 'done') && (
          <ToolCallRow
            name="prepare_guided_generation_context"
            done={phase === 'brief' || phase === 'done'}
          />
        )}

        {/* Brief */}
        {brief && (phase === 'brief' || phase === 'done') && (
          <BriefCard brief={brief} config={config} onApprove={handleApprove} />
        )}

        <div style={{ height: 32 }} />
      </div>

      {/* Input bar */}
      <div className="ac2-input-bar">
        <div className="ac2-input-wrap">
          <button className="ac2-input-add"><Plus size={16} /></button>
          <input
            className="ac2-input"
            placeholder="How can I help you? Attach files or type your idea…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && input.trim() && setInput('')}
          />
          <button
            className="ac2-input-send"
            disabled={!input.trim()}
            style={input.trim() ? { background: config.color } : undefined}
            onClick={() => setInput('')}
          >
            <Send size={14} />
          </button>
        </div>
        <div className="ac2-input-hint">
          Press Enter to send · Attach images for visual reference
        </div>
      </div>
    </div>
  )
}
