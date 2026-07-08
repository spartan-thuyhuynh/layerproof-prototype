import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Portal } from '@/shared/lib/Portal'
import { Tip } from '@/shared/components/ui/Tip'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { useUIStore } from '@/shared/store/useUIStore'
import type { BrandKit, BrandTheme } from '@/features/brand-kit/types/brand'

/* ── gradient banks ────────────────────────────────────────── */
const G0 = ['linear-gradient(160deg,#ec4899,#ffde42)', 'linear-gradient(160deg,#3b82f6,#8b5cf6)', 'linear-gradient(160deg,#14b8a6,#22d3ee)', 'linear-gradient(160deg,#f97316,#ec4899)', 'linear-gradient(160deg,#22c55e,#14b8a6)']
const G1 = ['linear-gradient(135deg,#ffde42 0%,#0a0a0a 65%)', 'linear-gradient(135deg,#8b5cf6 0%,#0b1220 65%)', 'linear-gradient(135deg,#22d3ee 0%,#0b1220 65%)', 'linear-gradient(135deg,#ec4899 0%,#1a0010 65%)', 'linear-gradient(135deg,#22c55e 0%,#0a1a0a 65%)']
const G2 = ['linear-gradient(135deg,#0a0a0a 35%,#ec4899)', 'linear-gradient(135deg,#0b1220 35%,#3b82f6)', 'linear-gradient(135deg,#0b1220 35%,#14b8a6)', 'linear-gradient(135deg,#1a0010 35%,#f97316)', 'linear-gradient(135deg,#0a1a0a 35%,#22c55e)']

function pickG(seed: string, bank: string[]) {
  const n = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return bank[n % bank.length]
}

function pickGradient(seed: string) { return pickG(seed, G0) }

/* ── prompt sidebar ────────────────────────────────────────── */
function PromptSidebar({ themeName, themePrompt, onNameChange }: { themeName: string; themePrompt: string; onNameChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)

  if (!themeName && !themePrompt) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', textAlign: 'center', lineHeight: 1.5 }}>Theme details appear here after the conversation</span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      {themeName !== undefined && (
        <div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 4 }}>Theme name</div>
          <input
            value={themeName}
            onChange={(e) => onNameChange(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--t1)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '2px 0 4px', outline: 'none', lineHeight: 1.3, boxSizing: 'border-box' }}
            onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--accent-line)' }}
            onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)' }}
            placeholder="Theme name…"
          />
        </div>
      )}

      {themePrompt && (
        <div style={{ flex: open ? 1 : 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--t3)', fontFamily: 'inherit', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: open ? 8 : 0 }}
          >
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 10, height: 10, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>
              <path d="M2 4l4 4 4-4" />
            </svg>
            {open ? 'Hide prompt' : 'View prompt'}
          </button>
          {open && (
            <div style={{ flex: 1, overflowY: 'auto', fontSize: 11, color: 'var(--t2)', lineHeight: 1.65, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
              {themePrompt}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── chat message types ────────────────────────────────────── */
type MessageRole = 'bot' | 'user'
interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  images?: string[]
  suggestions?: string[]
  isThinking?: boolean
}

/* ── kit summary helpers ───────────────────────────────────── */
function buildKitSummary(kit: BrandKit): string {
  const parts: string[] = []

  const palette = kit.colors.palettes[0]
  if (palette?.colors.length) {
    const names = palette.colors.slice(0, 4).map((c) => c.name || c.hex).join(', ')
    parts.push(`**Colors** — ${names}`)
  }

  if (kit.type.display.family || kit.type.body.family) {
    const t = [kit.type.display.family, kit.type.body.family].filter(Boolean).join(' / ')
    parts.push(`**Typography** — ${t}`)
  }

  const voiceAttrs = kit.tone.attrs.filter((a) => a.t)
  if (voiceAttrs.length) {
    const attrStr = voiceAttrs.slice(0, 4).map((a) => a.vs ? `${a.t} (${a.vs})` : a.t).join(', ')
    parts.push(`**Brand personality** — ${attrStr}`)
  }
  if (kit.tone.textDensity) parts.push(`**Text density** — ${kit.tone.textDensity}`)
  if (kit.tone.use?.length) parts.push(`**Words to use** — ${kit.tone.use.slice(0, 5).join(', ')}`)
  if (kit.tone.avoid?.length) parts.push(`**Words to avoid** — ${kit.tone.avoid.slice(0, 5).join(', ')}`)
  const audienceParts: string[] = []
  if (kit.tone.ageMin !== undefined && kit.tone.ageMax !== undefined) audienceParts.push(`${kit.tone.ageMin}–${kit.tone.ageMax}`)
  if (kit.tone.gender) audienceParts.push(kit.tone.gender)
  if (kit.tone.locations?.length) audienceParts.push(kit.tone.locations.join(', '))
  if (audienceParts.length) parts.push(`**Target audience** — ${audienceParts.join(', ')}`)
  if (kit.tone.customInstruction) parts.push(`**Tone guidance** — ${kit.tone.customInstruction}`)

  const logoCount = kit.logos.variants.length
  if (logoCount) {
    parts.push(`**Logos** — ${logoCount} variant${logoCount !== 1 ? 's' : ''}`)
  }

  return parts.join('\n')
}

function buildThemePrompt(kit: BrandKit, userInput: string): string {
  const palette = kit.colors.palettes[0]
  const primaryColor = palette?.colors[0]?.name || palette?.colors[0]?.hex || 'the primary brand color'
  const accentColor = palette?.colors[1]?.name || palette?.colors[1]?.hex || 'an accent color'
  const displayFont = kit.type.display.family || 'the brand display font'
  const bodyFont = kit.type.body.family || 'the brand body font'
  const voice = kit.tone.attrs.slice(0, 3).map((a) => a.vs ? `${a.t} (${a.vs})` : a.t).filter(Boolean).join(', ') || 'on-brand'
  const wordsUse = kit.tone.use?.slice(0, 4).join(', ')
  const wordsAvoid = kit.tone.avoid?.slice(0, 4).join(', ')
  const density = kit.tone.textDensity
  const customTone = kit.tone.customInstruction

  return `Use ${primaryColor} as the primary background with ${accentColor} for CTAs and highlights. Apply ${displayFont} for headlines and ${bodyFont} for body text at comfortable reading sizes.

Brand personality: ${voice}. Imagery should feel authentic and purposeful — avoid stock-photo clichés.${wordsUse ? `\n\nPrefer words like: ${wordsUse}.` : ''}${wordsAvoid ? ` Avoid: ${wordsAvoid}.` : ''}${density ? `\n\nText density: ${density} — keep copy ${density === 'minimal' ? 'extremely brief, visuals lead' : density === 'concise' ? 'clear and purposeful, no filler' : 'thorough with enough context to inform'}.` : ''}${customTone ? `\n\nAdditional tone guidance: ${customTone}` : ''}

This theme is designed for ${userInput.trim()}. Keep layouts well-structured with generous whitespace. All elements should reinforce brand trust and clarity of message.`
}

const THEME_PURPOSES = [
  'Product Launch',
  'Social Posts',
  'Email Newsletter',
  'Pitch Deck',
  'Event Announcement',
  'Seasonal Promotion',
] as const

const SUGGESTED_PROMPTS = [
  'Product Launch Campaign',
  'Social Media Posts',
  'Email Newsletter',
  'Pitch Deck',
  'Event Announcement',
  'Seasonal Promotion',
]

const ALL_ASSETS = ['Colors', 'Typography', 'Logos', 'Imagery', 'Tone of Voice', 'Layout'] as const
type AssetKey = typeof ALL_ASSETS[number]

/* ── chat bubble ───────────────────────────────────────────── */
function BotAvatar() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),#8b5cf6)', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 13, height: 13, color: '#000' }}>
        <path d="M2 14L9 2l3 7 3-3" />
      </svg>
    </div>
  )
}

function formatContent(content: string) {
  return content.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} style={{ color: 'var(--t1)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
            : part
        )}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    )
  })
}

/* ── main component ────────────────────────────────────────── */
interface NewThemeModalProps {
  kit: BrandKit
  onClose: () => void
}

export function NewThemeModal({ kit, onClose }: NewThemeModalProps) {
  const addTheme = useBrandStore((s) => s.addTheme)
  const setAppliedId = useBrandStore((s) => s.setAppliedId)
  const setModal = useUIStore((s) => s.setModal)
  const navigate = useNavigate()

  const [themeName, setThemeName] = useState('')
  const [themePrompt, setThemePrompt] = useState('')
  const [previewGradient, setPreviewGradient] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [step, setStep] = useState(0)

  const [guideAssets, setGuideAssets] = useState<Set<AssetKey>>(new Set(ALL_ASSETS))
  const [selectedImageAssets, setSelectedImageAssets] = useState<Set<string>>(new Set())
  const [assetPickerOpen, setAssetPickerOpen] = useState(false)
  const [guidePurpose, setGuidePurpose] = useState<string>('')
  const [guideCustomInstruction, setGuideCustomInstruction] = useState<string>('')
  const [guideImages, setGuideImages] = useState<string[]>([])
  const guideImageInputRef = useRef<HTMLInputElement>(null)

  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const [chatInputFocused, setChatInputFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  function handleGuideImageAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setGuideImages((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function handleGuideSubmit() {
    if (!guidePurpose) return
    const assetList = Array.from(guideAssets).join(', ')
    const userContent = `Theme for: **${guidePurpose}**\nUsing brand assets: ${assetList}${guideCustomInstruction.trim() ? `\nCustom instruction: ${guideCustomInstruction.trim()}` : ''}`
    setMessages([
      { id: 'guide-user', role: 'user', content: userContent, images: guideImages.length ? guideImages : undefined },
    ])
    setThinking(true)
    setStep(1)
    setTimeout(() => {
      setThinking(false)
      const name = guidePurpose
      const generatedPrompt = buildThemePrompt(kit, guidePurpose)
      setThemeName(name)
      setThemePrompt(generatedPrompt)
      setPreviewGradient(pickGradient(guidePurpose + kit.name))
      addMessage({
        role: 'bot',
        content: `Great choice! I've drafted a theme prompt for **${name}** based on your brand kit. You can see the preview on the left and the prompt below.\n\nWould you like to refine anything — tone, layout, imagery style, or color emphasis?`,
        suggestions: ['Make it bolder', 'Add more whitespace', 'Warmer colors', 'More minimalist', 'Looks good, create it'],
      })
    }, 1300)
  }

  function handleImageAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setAttachedImages((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  /* messages are seeded by handleGuideSubmit; no boot effect needed */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function addMessage(msg: Omit<ChatMessage, 'id'>) {
    setMessages((prev) => [...prev, { ...msg, id: String(Date.now() + Math.random()) }])
  }

  function handleSend(text: string) {
    const trimmed = text.trim()
    if ((!trimmed && attachedImages.length === 0) || thinking) return
    setInput('')
    const imgs = [...attachedImages]
    setAttachedImages([])

    addMessage({ role: 'user', content: trimmed, images: imgs.length ? imgs : undefined })
    setThinking(true)

    setTimeout(() => {
      setThinking(false)

      const refined = themePrompt + `\n\nAdjustment: ${trimmed}`
      setThemePrompt(refined)
      setPreviewGradient(pickGradient(trimmed + themePrompt))

      if (trimmed.toLowerCase().includes('looks good') || trimmed.toLowerCase().includes('create')) {
        addMessage({
          role: 'bot',
          content: `Your theme is ready! Click **Save theme** in the top right to save it to your brand kit.`,
        })
      } else {
        addMessage({
          role: 'bot',
          content: `Updated! The prompt has been refined with your feedback. Anything else you'd like to adjust?`,
          suggestions: ['Looks good, create it', 'Change imagery style', 'Adjust typography'],
        })
      }
    }, 1300)
  }

  function buildTheme(): BrandTheme {
    return {
      id: 'theme-' + Math.random().toString(36).slice(2, 10),
      name: themeName.trim(),
      description: '',
      thumbnailSrc: undefined,
      rules: [],
      prompt: themePrompt || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    }
  }

  function handleCreate() {
    if (!themeName.trim()) return
    addTheme(kit.id, buildTheme())
    setModal(null)
    onClose()
  }

  function handleCreateAndStart() {
    if (!themeName.trim()) return
    addTheme(kit.id, buildTheme())
    setAppliedId(kit.id)
    setModal(null)
    onClose()
    navigate('/create/presentation')
  }

  const canCreate = themeName.trim().length > 0

  return (
    <Portal>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--app)', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 6, fontFamily: 'inherit' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M10 12L6 8l4-4" />
              </svg>
              Back
            </button>
            <span style={{ color: 'var(--line-2)', fontSize: 18 }}>|</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>New Brand Theme</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn outline"
              onClick={handleCreate}
              style={{ opacity: canCreate ? 1 : 0.4 }}
              disabled={!canCreate}
            >
              Save theme
            </button>
            <button
              className="btn primary"
              onClick={handleCreateAndStart}
              style={{ opacity: canCreate ? 1 : 0.4 }}
              disabled={!canCreate}
            >
              Create project with this theme
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row-reverse', minHeight: 0 }}>
          {/* Right: preview */}
          <div style={{ width: 560, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--panel)', padding: 16, gap: 14, borderLeft: '1px solid var(--line)', overflowY: 'auto' }}>
            {/* Name + prompt toggle — above previews */}
            <PromptSidebar themeName={themeName} themePrompt={themePrompt} onNameChange={setThemeName} />

            {/* 3 stacked previews at 16:9 ratio */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {previewGradient ? (
                [
                  { g: previewGradient, label: 'Preview' },
                  { g: pickG(previewGradient + '1', G1), label: 'Social' },
                  { g: pickG(previewGradient + '2', G2), label: 'Campaign' },
                ].map((p, i) => (
                  <div key={i} style={{ width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', position: 'relative', background: p.g, flexShrink: 0 }}>
                    <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{p.label}</div>
                    <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.45)', borderRadius: 3, padding: '1px 5px', fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{i + 1}</div>
                  </div>
                ))
              ) : (
                ['Preview', 'Social', 'Campaign'].map((label, i) => (
                  <div key={i} style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, background: 'var(--card-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M3 15l5-5 4 4 3-3 6 6" />
                    </svg>
                    <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 8, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Left: guide form or chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 20, background: 'var(--panel)' }}>
            {/* ── Guide form (step 0) ── */}
            {step === 0 && (
              <div style={{ flex: 1, overflowY: 'auto', paddingTop: 72, paddingBottom: 40, paddingLeft: 'max(32px, calc((100% - 480px) / 2))', paddingRight: 'max(32px, calc((100% - 480px) / 2))', display: 'flex', flexDirection: 'column', gap: 32, background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line)' }}>
                <input ref={guideImageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGuideImageAttach} />

                {/* Greeting */}
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', margin: '0 0 6px' }}>Hi! Let's build a new Brand Theme for {kit.name}.</h2>
                  <p style={{ fontSize: 14, color: 'var(--t2)', margin: 0, lineHeight: 1.6 }}>A Brand Theme is a rule set that tells AI how to apply your brand to a specific type of content.</p>
                </div>

                {/* Image asset selection — trigger button */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 12 }}>
                    Which brand assets should I use?
                  </div>
                  <button
                    onClick={() => setAssetPickerOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--card-2)', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s, background .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.background = 'var(--card-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--card-2)' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Tiny thumbnails of selected assets */}
                      {selectedImageAssets.size > 0 ? (
                        <span style={{ display: 'flex', gap: 4 }}>
                          {(kit.imagery.assets ?? []).filter(a => selectedImageAssets.has(a.name)).slice(0, 4).map(a => (
                            <span key={a.name} style={{ width: 28, height: 28, borderRadius: 5, background: a.preview, display: 'block', flexShrink: 0 }} />
                          ))}
                          {selectedImageAssets.size > 4 && (
                            <span style={{ width: 28, height: 28, borderRadius: 5, background: 'var(--card-2)', display: 'grid', placeItems: 'center', fontSize: 10, color: 'var(--t2)' }}>
                              +{selectedImageAssets.size - 4}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ width: 28, height: 28, borderRadius: 5, background: 'var(--card-2)', display: 'grid', placeItems: 'center' }}>
                          <svg viewBox="0 0 16 16" fill="none" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round" style={{ width: 12, height: 12 }}>
                            <rect x="2" y="2" width="12" height="12" rx="2" />
                            <circle cx="5.5" cy="5.5" r="1" />
                            <path d="M2 10l3-3 3 3 2-2 4 4" />
                          </svg>
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: selectedImageAssets.size > 0 ? 'var(--t1)' : 'var(--t3)' }}>
                        {selectedImageAssets.size > 0 ? `${selectedImageAssets.size} asset${selectedImageAssets.size !== 1 ? 's' : ''} selected` : 'Choose from brand image assets'}
                      </span>
                    </span>
                    <svg viewBox="0 0 16 16" fill="none" stroke="var(--t3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </button>
                </div>

                {/* Image references — only relevant when Imagery asset is selected */}
                {guideAssets.has('Imagery') && <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>Any image references?</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 12 }}>Drop in some example designs — the more, the better for matching your style.</div>
                  {guideImages.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      {guideImages.map((src, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={src} alt="reference" style={{ height: 72, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--line-2)', display: 'block' }} />
                          <button
                            onClick={() => setGuideImages((prev) => prev.filter((_, j) => j !== i))}
                            style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#333', border: '1px solid var(--line-2)', color: 'var(--t2)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 11, lineHeight: 1 }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => guideImageInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 8, border: '1px dashed var(--line)', background: 'transparent', color: 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, transition: 'border-color .15s, color .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-line)'; e.currentTarget.style.color = 'var(--t1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--t2)' }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 14, height: 14 }}>
                      <path d="M8 2v12M2 8h12" />
                    </svg>
                    Upload images
                  </button>
                </div>}

                {/* Purpose selection */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 12 }}>What's this theme for?</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {THEME_PURPOSES.map((p) => {
                      const active = guidePurpose === p
                      return (
                        <button
                          key={p}
                          onClick={() => setGuidePurpose(active ? '' : p)}
                          style={{ padding: '8px 18px', borderRadius: 20, border: `1.5px solid ${active ? 'rgba(255,222,66,0.5)' : 'var(--line-2)'}`, background: active ? 'rgba(255,222,66,0.12)' : 'var(--card-2)', color: active ? 'var(--accent)' : 'var(--t2)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all .15s' }}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  <input
                    type="text"
                    value={THEME_PURPOSES.includes(guidePurpose as typeof THEME_PURPOSES[number]) ? '' : guidePurpose}
                    onChange={(e) => setGuidePurpose(e.target.value)}
                    onFocus={(e) => {
                      if (THEME_PURPOSES.includes(guidePurpose as typeof THEME_PURPOSES[number])) setGuidePurpose('')
                      e.currentTarget.style.borderColor = 'var(--accent-line)'
                    }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)' }}
                    placeholder="Or describe it yourself…"
                    style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: 10, color: 'var(--t1)', fontFamily: 'inherit', fontSize: 13, padding: '10px 14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                  />
                </div>

                {/* Custom instruction */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>Any custom instructions?</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 10 }}>Anything specific about style, mood, or restrictions for this theme.</div>
                  <textarea
                    value={guideCustomInstruction}
                    onChange={e => setGuideCustomInstruction(e.target.value)}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-line)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-2)' }}
                    placeholder="e.g. Always use dark backgrounds, avoid sans-serif for headlines, keep copy under 10 words…"
                    rows={3}
                    style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: 10, color: 'var(--t1)', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, padding: '10px 14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color .15s' }}
                  />
                </div>

                {/* Continue */}
                <button
                  onClick={handleGuideSubmit}
                  disabled={!guidePurpose}
                  className="btn primary"
                  style={{ alignSelf: 'flex-start', opacity: guidePurpose ? 1 : 0.4 }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── Chat (step 1+) ── */}
            {step > 0 && (<>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 24, paddingBottom: 24, paddingLeft: 'max(28px, calc((100% - 640px) / 2))', paddingRight: 'max(28px, calc((100% - 640px) / 2))', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'bot' ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '85%' }}>
                      <BotAvatar />
                      <div className="chat-bubble" style={{ background: 'var(--card)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', color: 'var(--t2)', fontSize: 15, lineHeight: 1.65 }}>
                        {formatContent(msg.content)}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: '75%' }}>
                      {msg.images && msg.images.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {msg.images.map((src, i) => (
                            <img key={i} src={src} alt="reference" style={{ height: 80, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--line-2)' }} />
                          ))}
                        </div>
                      )}
                      {msg.content && (
                        <div className="chat-bubble" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '14px 4px 14px 14px', padding: '10px 16px', color: 'rgba(255,255,255,0.85)', fontWeight: 400 }}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestions */}
                  {msg.role === 'bot' && msg.suggestions && (
                    <div style={{ marginLeft: 38, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSend(s)}
                          disabled={thinking}
                          className="chat-chip"
                          style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--line-2)', background: 'transparent', color: 'var(--t2)', cursor: thinking ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'border-color .15s, color .15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-line)'; e.currentTarget.style.color = 'var(--t1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--t2)' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {thinking && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <BotAvatar />
                  <div style={{ background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '4px 14px 14px 14px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--t3)', display: 'block', animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, paddingBottom: 12, paddingLeft: 'max(16px, calc((100% - 640px) / 2))', paddingRight: 'max(16px, calc((100% - 640px) / 2))', background: 'transparent' }}>
              <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageAttach} />

              {/* Attached image thumbnails */}
              {attachedImages.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {attachedImages.map((src, i) => (
                    <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={src} alt="attachment" style={{ height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--line-2)', display: 'block' }} />
                      <button
                        onClick={() => setAttachedImages((prev) => prev.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#333', border: '1px solid var(--line-2)', color: 'var(--t2)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 10, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Unified input container */}
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 0,
                background: 'var(--card)', border: `1.5px solid ${chatInputFocused ? 'var(--accent-line)' : 'var(--line-2)'}`,
                borderRadius: 14, padding: '6px 6px 6px 8px', transition: 'border-color .15s',
                boxShadow: chatInputFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
              }}>
                {/* Attach image button */}
                <Tip label="Attach image reference" side="top">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="chat-input-btn"
                    style={{ background: 'transparent', border: 'none', color: 'var(--t3)', cursor: 'pointer', flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)' }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                      <path d="M13.5 7.5l-6.5 6.5a3.5 3.5 0 01-5-5l7-7a2 2 0 012.8 2.8l-7 7a.5.5 0 01-.7-.7l6.5-6.5" />
                    </svg>
                  </button>
                </Tip>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    const el = e.target
                    el.style.height = 'auto'
                    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(input)
                    }
                  }}
                  placeholder="Describe your theme or attach a layout reference…"
                  rows={1}
                  className="chat-input-text"
                  style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', color: 'var(--t1)', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.6, padding: '6px 8px', outline: 'none', overflowY: 'auto', minHeight: 32, maxHeight: 160 }}
                  onFocus={() => setChatInputFocused(true)}
                  onBlur={() => setChatInputFocused(false)}
                />

                {/* Send button */}
                <button
                  onClick={() => handleSend(input)}
                  disabled={(!input.trim() && attachedImages.length === 0) || thinking}
                  className="chat-input-btn"
                  style={{ background: (input.trim() || attachedImages.length > 0) && !thinking ? 'var(--accent)' : 'var(--card-2)', border: 'none', color: (input.trim() || attachedImages.length > 0) && !thinking ? '#000' : 'var(--t3)', cursor: (input.trim() || attachedImages.length > 0) && !thinking ? 'pointer' : 'default', transition: 'background .15s, color .15s', flexShrink: 0 }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                    <path d="M2 14L14 8 2 2v5l8 1-8 1z" />
                  </svg>
                </button>
              </div>
            </div>
            </div>
            </>)} {/* end step > 0 */}
          </div>
        </div>
      </div>
      {/* ── Asset picker modal ── */}
      {assetPickerOpen && (() => {
        const imageryAssets = kit.imagery.assets ?? []
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Backdrop */}
            <div onClick={() => setAssetPickerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            {/* Dialog */}
            <div style={{ position: 'relative', width: 560, maxWidth: '90vw', background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line-2)', padding: 28, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: 'var(--shadow)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>Brand image assets</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Select the assets you want to include in this theme.</div>
                </div>
                <button onClick={() => setAssetPickerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, display: 'grid', placeItems: 'center' }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {imageryAssets.map(asset => {
                  const selected = selectedImageAssets.has(asset.name)
                  return (
                    <button
                      key={asset.name}
                      onClick={() => setSelectedImageAssets(prev => {
                        const next = new Set(prev)
                        selected ? next.delete(asset.name) : next.add(asset.name)
                        return next
                      })}
                      style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `2px solid ${selected ? 'var(--accent)' : 'var(--line)'}`, cursor: 'pointer', padding: 0, background: 'none', transition: 'border-color .15s' }}
                    >
                      <div style={{ width: '100%', aspectRatio: '4/3', background: asset.preview }} />
                      <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.6)', fontSize: 11, color: 'rgba(255,255,255,0.8)', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {asset.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ')}
                      </div>
                      {selected && (
                        <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
                          <svg viewBox="0 0 10 10" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                            <path d="M2 5l2.5 2.5L8 3" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <button
                  onClick={() => setSelectedImageAssets(
                    selectedImageAssets.size === imageryAssets.length ? new Set() : new Set(imageryAssets.map(a => a.name))
                  )}
                  style={{ fontSize: 12, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}
                >
                  {selectedImageAssets.size === imageryAssets.length ? 'Deselect all' : 'Select all'}
                </button>
                <button className="btn primary" onClick={() => setAssetPickerOpen(false)}>
                  Done{selectedImageAssets.size > 0 ? ` · ${selectedImageAssets.size} selected` : ''}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </Portal>
  )
}
