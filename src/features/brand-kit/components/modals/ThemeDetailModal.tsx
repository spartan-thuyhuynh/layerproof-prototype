import { useState, useEffect, useRef } from 'react'
import { X, Pencil } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'
import type { BrandKit, BrandTheme } from '@/features/brand-kit/types/brand'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'

/* ── gradient banks ────────────────────────────────────────── */
const G0 = ['linear-gradient(160deg,#ec4899,#ffde42)', 'linear-gradient(160deg,#3b82f6,#8b5cf6)', 'linear-gradient(160deg,#14b8a6,#22d3ee)', 'linear-gradient(160deg,#f97316,#ec4899)', 'linear-gradient(160deg,#22c55e,#14b8a6)']
const G1 = ['linear-gradient(135deg,#ffde42 0%,#0a0a0a 65%)', 'linear-gradient(135deg,#8b5cf6 0%,#0b1220 65%)', 'linear-gradient(135deg,#22d3ee 0%,#0b1220 65%)', 'linear-gradient(135deg,#ec4899 0%,#1a0010 65%)', 'linear-gradient(135deg,#22c55e 0%,#0a1a0a 65%)']
const G2 = ['linear-gradient(135deg,#0a0a0a 35%,#ec4899)', 'linear-gradient(135deg,#0b1220 35%,#3b82f6)', 'linear-gradient(135deg,#0b1220 35%,#14b8a6)', 'linear-gradient(135deg,#1a0010 35%,#f97316)', 'linear-gradient(135deg,#0a1a0a 35%,#22c55e)']

function pick(id: string, bank: string[]) {
  return bank[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % bank.length]
}

function rulesAsPrompt(theme: BrandTheme) {
  return theme.rules
    .filter((r) => r.label || r.content)
    .map((r) => (r.label && r.content ? `${r.label}:\n${r.content}` : r.label || r.content))
    .join('\n\n')
}

function buildKitSummary(kit: BrandKit) {
  const parts: string[] = []
  const palette = kit.colors.palettes[0]
  if (palette?.colors.length) parts.push(`**Colors** — ${palette.colors.slice(0, 4).map((c) => c.name || c.hex).join(', ')}`)
  if (kit.type.display.family || kit.type.body.family) parts.push(`**Typography** — ${[kit.type.display.family, kit.type.body.family].filter(Boolean).join(' / ')}`)
  const voice = kit.tone.attrs.slice(0, 3).map((a) => a.t).filter(Boolean)
  if (voice.length) parts.push(`**Brand voice** — ${voice.join(', ')}`)
  return parts.join('\n')
}

/* ── preview panel ─────────────────────────────────────────── */
function PreviewPanel({ src, gradient, label, index }: { src?: string; gradient: string; label: string; index: number }) {
  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 10, background: gradient }}>
      {src && index === 0 ? (
        <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : null}
      <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: '2px 6px', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{index + 1}</div>
    </div>
  )
}

/* ── chat helpers ──────────────────────────────────────────── */
interface ChatMessage { id: string; role: 'bot' | 'user'; content: string; images?: string[]; suggestions?: string[] }

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
  return content.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={i}>
        {parts.map((p, j) => p.startsWith('**') && p.endsWith('**')
          ? <strong key={j} style={{ color: 'var(--t1)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
          : p
        )}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

/* ── edit chat panel ───────────────────────────────────────── */
interface EditChatProps {
  theme: BrandTheme
  kit: BrandKit
  kitId: string
  currentPrompt: string
  onBack: () => void
  onSaved: (name: string, prompt: string) => void
}

function EditChatPanel({ theme, kit, kitId, currentPrompt, onBack, onSaved }: EditChatProps) {
  const updateTheme = useBrandStore((s) => s.updateTheme)

  const [nameDraft, setNameDraft] = useState(theme.name)
  const [promptDraft, setPromptDraft] = useState(currentPrompt)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [step, setStep] = useState(0)
  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const [promptOpen, setPromptOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const summary = buildKitSummary(kit)
    const hasPrompt = currentPrompt.trim().length > 0
    const welcome = hasPrompt
      ? `Let's refine **${theme.name}**.\n\nA **Brand Theme** is a prompt rule set that tells AI how to apply your brand to a specific content type. You can adjust tone, color usage, layout style, or completely rewrite the prompt.\n\nHere's what I'll draw from your brand kit:\n${summary}\n\n**Current prompt** (excerpt):\n_${currentPrompt.slice(0, 180)}${currentPrompt.length > 180 ? '…' : ''}_\n\n**What would you like to change?** You can:\n- Refine the tone or mood ("Make it bolder", "More conversational")\n- Adjust how colors or typography are used\n- Change the target content type entirely\n- Or describe a specific adjustment in your own words`
      : `Let's write a prompt for **${theme.name}**.\n\nA **Brand Theme** is a reusable prompt rule set that tells AI how to apply your brand — colors, fonts, and tone — to a specific type of content.\n\nHere's what I'll use from your brand kit:\n${summary}\n\n**To get started, tell me:**\n- What type of content is this theme for? (e.g. "Pitch deck", "Email newsletter")\n- Any specific mood? (e.g. "Bold and energetic", "Clean and minimal")`
    setMessages([{ id: 'welcome', role: 'bot', content: welcome, suggestions: hasPrompt ? ['Make it bolder', 'Adjust color emphasis', 'Update imagery style', 'Change the tone', 'Rewrite from scratch'] : ['Campaign landing page', 'Social media posts', 'Email newsletter', 'Pitch deck'] }])
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  function addMsg(msg: Omit<ChatMessage, 'id'>) {
    setMessages((prev) => [...prev, { ...msg, id: String(Date.now() + Math.random()) }])
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

  function handleSend(text: string) {
    const trimmed = text.trim()
    if ((!trimmed && attachedImages.length === 0) || thinking) return
    setInput('')
    const imgs = [...attachedImages]
    setAttachedImages([])
    addMsg({ role: 'user', content: trimmed, images: imgs.length ? imgs : undefined })
    setThinking(true)

    setTimeout(() => {
      setThinking(false)
      const lower = trimmed.toLowerCase()

      if (lower.includes('rewrite') || step === 0) {
        const palette = kit.colors.palettes[0]
        const primary = palette?.colors[0]?.name || 'primary brand color'
        const accent = palette?.colors[1]?.name || 'accent color'
        const display = kit.type.display.family || 'brand display font'
        const voice = kit.tone.attrs.slice(0, 2).map((a) => a.t).filter(Boolean).join(' and ') || 'on-brand'
        const newPrompt = `Use ${primary} as the primary background with ${accent} for CTAs and highlights. Apply ${display} for headlines at large, confident sizes.\n\nImagery should feel ${voice} — authentic and visually consistent. Avoid generic stock photography.\n\nThis theme is designed for ${trimmed}. Keep layouts structured with generous whitespace and clear visual hierarchy.`
        setPromptDraft(newPrompt)
        addMsg({ role: 'bot', content: `I've drafted a new prompt for **${nameDraft}**. Check the prompt panel on the left — anything else to adjust?`, suggestions: ['Make it bolder', 'More minimalist', 'Warmer colors', 'Looks good, save it'] })
        setStep(1)
      } else if (lower.includes('looks good') || lower.includes('save')) {
        addMsg({ role: 'bot', content: `Great! Click **Save theme** to apply the changes.` })
      } else {
        const refined = promptDraft + `\n\nAdjustment: ${trimmed}`
        setPromptDraft(refined)
        addMsg({ role: 'bot', content: `Updated the prompt with your feedback. Anything else?`, suggestions: ['Looks good, save it', 'More changes'] })
      }
    }, 1200)
  }

  function handleSave() {
    updateTheme(kitId, theme.id, (t) => ({ ...t, name: nameDraft.trim() || t.name, prompt: promptDraft }))
    onSaved(nameDraft, promptDraft)
  }

  const g0 = pick(theme.id, G0)
  const g1 = pick(theme.id + '1', G1)
  const g2 = pick(theme.id + '2', G2)
  const canSend = (input.trim().length > 0 || attachedImages.length > 0) && !thinking

  return (
    <Portal>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--app)', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ height: 56, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: 13, padding: '4px 8px', borderRadius: 6, fontFamily: 'inherit' }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M10 12L6 8l4-4" /></svg>
              Back
            </button>
            <span style={{ color: 'var(--line-2)', fontSize: 18 }}>|</span>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--t1)', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, padding: '4px 0', outline: 'none', minWidth: 220, borderBottom: '1px solid transparent' }}
              onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--line-2)' }}
              onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'transparent' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={onBack}>Cancel</button>
            <button className="btn primary" onClick={handleSave}>Save theme</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
          {/* Left: previews + prompt panel */}
          <div style={{ width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0a0a0a', padding: 16, gap: 12, borderRight: '1px solid var(--line)', overflowY: 'auto' }}>
            {/* Name */}
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 2 }}>Theme name</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{nameDraft}</div>

            {/* Prompt toggle */}
            {promptDraft && (
              <div>
                <button onClick={() => setPromptOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--t3)', fontFamily: 'inherit', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: promptOpen ? 8 : 0 }}>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, transition: 'transform .2s', transform: promptOpen ? 'rotate(180deg)' : 'none' }}>
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                  {promptOpen ? 'Hide prompt' : 'View prompt'}
                </button>
                {promptOpen && (
                  <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.65, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.07)', maxHeight: 180, overflowY: 'auto' }}>
                    {promptDraft}
                  </div>
                )}
              </div>
            )}

            {/* 3 preview panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { g: g0, label: 'Preview' },
                { g: g1, label: 'Social' },
                { g: g2, label: 'Campaign' },
              ].map((p, i) => (
                <div key={i} style={{ width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', position: 'relative', background: p.g, flexShrink: 0 }}>
                  {theme.thumbnailSrc && i === 0 && <img src={theme.thumbnailSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />}
                  <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{p.label}</div>
                  <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.45)', borderRadius: 3, padding: '1px 5px', fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: chat */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
                          {msg.images.map((src, i) => <img key={i} src={src} alt="ref" style={{ height: 80, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--line-2)' }} />)}
                        </div>
                      )}
                      {msg.content && (
                        <div className="chat-bubble" style={{ background: 'var(--accent)', borderRadius: '14px 4px 14px 14px', padding: '10px 16px', color: '#000', fontWeight: 500 }}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  )}
                  {msg.role === 'bot' && msg.suggestions && (
                    <div style={{ marginLeft: 38, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {msg.suggestions.map((s) => (
                        <button key={s} onClick={() => handleSend(s)} disabled={thinking}
                          className="chat-chip"
                          style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--line-2)', background: 'transparent', color: 'var(--t2)', cursor: thinking ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-line)'; e.currentTarget.style.color = 'var(--t1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--t2)' }}
                        >{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {thinking && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <BotAvatar />
                  <div style={{ background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '4px 14px 14px 14px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--t3)', display: 'block', animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, paddingBottom: 12, paddingLeft: 'max(16px, calc((100% - 640px) / 2))', paddingRight: 'max(16px, calc((100% - 640px) / 2))', background: 'var(--panel)' }}>
              <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageAttach} />
              {attachedImages.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {attachedImages.map((src, i) => (
                    <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={src} alt="" style={{ height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--line-2)', display: 'block' }} />
                      <button onClick={() => setAttachedImages((prev) => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#333', border: '1px solid var(--line-2)', color: 'var(--t2)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 10 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <button onClick={() => imageInputRef.current?.click()} title="Attach image reference"
                  className="chat-input-btn"
                  style={{ background: 'var(--card)', border: '1px solid var(--line-2)', color: 'var(--t3)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)' }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 14, height: 14 }}>
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </button>
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input) } }}
                  placeholder="Describe what to change or attach a layout reference…"
                  rows={1}
                  className="chat-input-text"
                  style={{ flex: 1, resize: 'none', background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: 12, color: 'var(--t1)', fontFamily: 'inherit', lineHeight: 1.6, padding: '9px 13px', outline: 'none', maxHeight: 120, overflowY: 'auto' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-line)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)' }}
                />
                <button onClick={() => handleSend(input)} disabled={!canSend}
                  className="chat-input-btn"
                  style={{ background: canSend ? 'var(--accent)' : 'var(--card)', border: '1px solid var(--line-2)', color: canSend ? '#000' : 'var(--t3)', cursor: canSend ? 'pointer' : 'not-allowed', transition: 'background .15s, color .15s' }}>
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

/* ── main component ────────────────────────────────────────── */
interface ThemeDetailModalProps {
  theme: BrandTheme
  kit: BrandKit
  kitId: string
  onClose: () => void
  onCreateWithTheme: () => void
}

const CREATE_MENU_ITEMS = [
  {
    id: 'presentation',
    label: 'Presentation',
    desc: 'Slides & pitch decks',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <rect x="2" y="3" width="16" height="11" rx="1.5" />
        <path d="M7 17h6M10 14v3" />
      </svg>
    ),
  },
  {
    id: 'social',
    label: 'Social Post',
    desc: 'Instagram, LinkedIn, X',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <circle cx="7.5" cy="7.5" r="1.5" />
        <path d="M3 13l4-4 3 3 2-2 5 5" />
      </svg>
    ),
  },
]

export function ThemeDetailModal({ theme, kit, kitId, onClose, onCreateWithTheme }: ThemeDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [prompt, setPrompt] = useState(theme.prompt ?? rulesAsPrompt(theme))
  const [saved, setSaved] = useState(false)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const createMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) setCreateMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    setPrompt(theme.prompt ?? rulesAsPrompt(theme))
  }, [theme.id])

  const g0 = pick(theme.id, G0)
  const g1 = pick(theme.id + '1', G1)
  const g2 = pick(theme.id + '2', G2)

  const PREVIEWS = [
    { gradient: g0, label: 'Preview' },
    { gradient: g1, label: 'Social' },
    { gradient: g2, label: 'Campaign' },
  ]

  if (isEditing) {
    return (
      <EditChatPanel
        theme={theme}
        kit={kit}
        kitId={kitId}
        currentPrompt={prompt}
        onBack={() => setIsEditing(false)}
        onSaved={(name, newPrompt) => {
          setPrompt(newPrompt)
          setSaved(true)
          setTimeout(() => setSaved(false), 1800)
          setIsEditing(false)
        }}
      />
    )
  }

  /* ── VIEW MODE ─────────────────────────────────────────────── */
  return (
    <Portal>
      <div className="scrim" onClick={onClose}>
        <div
          className="modal wide"
          style={{ width: 'min(90vw, 1100px)', maxWidth: '90vw', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'row', height: 'clamp(500px, 75vh, 680px)', maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: 3 stacked previews */}
          <div style={{ width: '40%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, padding: 12, background: '#0a0a0a' }}>
            {PREVIEWS.map((p, i) => (
              <PreviewPanel key={i} src={theme.thumbnailSrc} gradient={p.gradient} label={p.label} index={i} />
            ))}
          </div>

          {/* Right: info + prompt (read) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--card)', overflowY: 'auto' }}>
            <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="h-eyebrow" style={{ marginBottom: 4 }}>Brand Theme</div>
                  <h2 className="h2" style={{ margin: 0, lineHeight: 1.2, fontSize: 18 }}>{theme.name}</h2>
                  {theme.description && (
                    <p className="sub" style={{ marginTop: 5, fontSize: 13, lineHeight: 1.45 }}>{theme.description}</p>
                  )}
                </div>
                <button className="x" onClick={onClose} style={{ marginLeft: 12, flexShrink: 0 }}>
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 22px 0', minHeight: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--t3)', marginBottom: 10 }}>
                Theme prompt
              </div>
              <div style={{ flex: 1, overflowY: 'auto', background: '#0d0d0d', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: 1.7, color: 'var(--t2)', whiteSpace: 'pre-wrap', minHeight: 0 }}>
                {prompt || <span style={{ color: 'var(--t3)' }}>No prompt defined. Click "Edit theme" to add one.</span>}
              </div>
              {saved && (
                <span style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><path d="M2 6l3 3 5-5" /></svg>
                  Saved
                </span>
              )}
            </div>

            <div style={{ padding: '14px 22px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'var(--card-2)', border: '1px solid var(--line-2)', borderRadius: 8, color: 'var(--t2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
              >
                <Pencil style={{ width: 13, height: 13 }} />
                Edit theme
              </button>
              <div className="design-menu-wrap" ref={createMenuRef}>
                <button className="btn primary" onClick={() => setCreateMenuOpen((o) => !o)}>
                  Create with this theme
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, marginLeft: 4, opacity: 0.7, flexShrink: 0, transition: 'transform .15s', transform: createMenuOpen ? 'rotate(180deg)' : 'none' }}>
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </button>

                {createMenuOpen && (
                  <div className="design-menu" style={{ bottom: 'calc(100% + 8px)', top: 'auto' }}>
                    <div className="design-menu-label">Choose a format</div>
                    {CREATE_MENU_ITEMS.map(({ id, label, desc, icon }) => (
                      <button
                        key={id}
                        className="design-menu-item"
                        onClick={() => { setCreateMenuOpen(false); onCreateWithTheme() }}
                      >
                        <span className="design-menu-item-icon">{icon}</span>
                        <span>
                          <span className="design-menu-item-label">{label}</span>
                          <span style={{ display: 'block', fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
