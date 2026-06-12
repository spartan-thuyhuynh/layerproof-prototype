import { useState, useRef, useEffect } from 'react'
import { Portal } from '@/lib/Portal'
import { useBrandStore } from '@/store/useBrandStore'
import { useUIStore } from '@/store/useUIStore'
import type { BrandKit, BrandTheme } from '@/types/brand'

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

  const voiceAttrs = kit.tone.attrs.slice(0, 3).map((a) => a.t).filter(Boolean)
  if (voiceAttrs.length) {
    parts.push(`**Brand voice** — ${voiceAttrs.join(', ')}`)
  }

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
  const voice = kit.tone.attrs.slice(0, 2).map((a) => a.t).filter(Boolean).join(' and ') || 'on-brand'

  return `Use ${primaryColor} as the primary background with ${accentColor} for CTAs and highlights. Apply ${displayFont} for headlines and ${bodyFont} for body text at comfortable reading sizes.

Imagery should feel ${voice} — authentic, purposeful, visually consistent with the brand. Avoid stock-photo clichés.

This theme is designed for ${userInput.trim()}. Keep layouts well-structured with generous whitespace. All elements should reinforce brand trust and clarity of message.`
}

const SUGGESTED_PROMPTS = [
  'Product Launch Campaign',
  'Social Media Posts',
  'Email Newsletter',
  'Pitch Deck',
  'Event Announcement',
  'Seasonal Promotion',
]

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
  const setModal = useUIStore((s) => s.setModal)

  const [themeName, setThemeName] = useState('')
  const [themePrompt, setThemePrompt] = useState('')
  const [previewGradient, setPreviewGradient] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [step, setStep] = useState(0)

  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  function handleImageAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setAttachedImages((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  /* boot: welcome message */
  useEffect(() => {
    const summary = buildKitSummary(kit)
    const welcome = `Let's build a new brand theme for **${kit.name}**.\n\nA **Brand Theme** is a reusable prompt rule set that tells AI how to apply your brand — colors, fonts, tone — to a specific type of content. Each theme is tailored to one use case: a social post looks and feels different from a pitch deck, even using the same brand.\n\nHere's what I'll use from your brand kit:\n${summary}\n\n**To get started, tell me:**\n- What type of content is this theme for? (e.g. "Social media posts", "Email campaigns", "Pitch deck")\n- Any specific mood or style? (e.g. "Bold and energetic", "Clean and minimal", "Warm and approachable")\n\nOr pick one of the suggestions below.`
    setMessages([{
      id: 'welcome',
      role: 'bot',
      content: welcome,
      suggestions: SUGGESTED_PROMPTS,
    }])
  }, [])

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

      if (step === 0) {
        const name = trimmed.length < 40 ? trimmed : trimmed.slice(0, 37) + '…'
        const generatedPrompt = buildThemePrompt(kit, trimmed)
        setThemeName(name)
        setThemePrompt(generatedPrompt)
        setPreviewGradient(pickGradient(trimmed + kit.name))

        addMessage({
          role: 'bot',
          content: `Great choice! I've drafted a theme prompt for **${name}** based on your brand kit. You can see the preview on the left and the prompt below.\n\nWould you like to refine anything — tone, layout, imagery style, or color emphasis?`,
          suggestions: ['Make it bolder', 'Add more whitespace', 'Warmer colors', 'More minimalist', 'Looks good, create it'],
        })
        setStep(1)
      } else {
        const refined = themePrompt + `\n\nAdjustment: ${trimmed}`
        setThemePrompt(refined)
        setPreviewGradient(pickGradient(trimmed + themePrompt))

        if (trimmed.toLowerCase().includes('looks good') || trimmed.toLowerCase().includes('create')) {
          addMessage({
            role: 'bot',
            content: `Your theme is ready! Click **Create theme** in the top right to save it to your brand kit.`,
          })
        } else {
          addMessage({
            role: 'bot',
            content: `Updated! The prompt has been refined with your feedback. Anything else you'd like to adjust?`,
            suggestions: ['Looks good, create it', 'Change imagery style', 'Adjust typography'],
          })
        }
      }
    }, 1300)
  }

  function handleCreate() {
    if (!themeName.trim()) return
    const theme: BrandTheme = {
      id: 'theme-' + Math.random().toString(36).slice(2, 10),
      name: themeName.trim(),
      description: '',
      thumbnailSrc: undefined,
      rules: [],
      prompt: themePrompt || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    addTheme(kit.id, theme)
    setModal(null)
    onClose()
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
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn primary"
              onClick={handleCreate}
              style={{ opacity: canCreate ? 1 : 0.4 }}
              disabled={!canCreate}
            >
              Create theme
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
          {/* Left: preview */}
          <div style={{ width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0a0a0a', padding: 16, gap: 14, borderRight: '1px solid var(--line)', overflowY: 'auto' }}>
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
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, background: 'linear-gradient(160deg,#1a1a1a,#2a2a2a)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M3 15l5-5 4 4 3-3 6 6" />
                  </svg>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', textAlign: 'center', lineHeight: 1.4 }}>Previews appear after describing your theme</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 24, paddingBottom: 24, paddingLeft: 'max(28px, calc((100% - 640px) / 2))', paddingRight: 'max(28px, calc((100% - 640px) / 2))', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'bot' ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: '85%' }}>
                      <BotAvatar />
                      <div className="chat-bubble" style={{ background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', color: 'var(--t2)' }}>
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
                        <div className="chat-bubble" style={{ background: 'var(--accent)', borderRadius: '14px 4px 14px 14px', padding: '10px 16px', color: '#000', fontWeight: 500 }}>
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

            {/* Input */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, paddingBottom: 12, paddingLeft: 'max(16px, calc((100% - 640px) / 2))', paddingRight: 'max(16px, calc((100% - 640px) / 2))', background: 'var(--panel)' }}>
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

              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                {/* Attach image button */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  title="Attach image reference"
                  className="chat-input-btn"
                  style={{ background: 'var(--card)', border: '1px solid var(--line-2)', color: 'var(--t3)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.borderColor = 'var(--line)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderColor = 'var(--line-2)' }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(input)
                    }
                  }}
                  placeholder="Describe your theme or attach a layout reference…"
                  rows={1}
                  className="chat-input-text"
                  style={{ flex: 1, resize: 'none', background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: 12, color: 'var(--t1)', fontFamily: 'inherit', lineHeight: 1.6, padding: '9px 13px', outline: 'none', maxHeight: 120, overflowY: 'auto' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-line)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)' }}
                />

                {/* Send button */}
                <button
                  onClick={() => handleSend(input)}
                  disabled={(!input.trim() && attachedImages.length === 0) || thinking}
                  className="chat-input-btn"
                  style={{ background: (input.trim() || attachedImages.length > 0) && !thinking ? 'var(--accent)' : 'var(--card)', border: '1px solid var(--line-2)', color: (input.trim() || attachedImages.length > 0) && !thinking ? '#000' : 'var(--t3)', cursor: (input.trim() || attachedImages.length > 0) && !thinking ? 'pointer' : 'not-allowed', transition: 'background .15s, color .15s' }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                    <path d="M2 14L14 8 2 2v5l8 1-8 1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
