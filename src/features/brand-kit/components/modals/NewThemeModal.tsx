import { useState, useRef, useEffect } from 'react'
import { ChevronRight, Check } from 'lucide-react'
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

/* ── types ─────────────────────────────────────────────────── */
type Phase =
  | 'q-background'
  | 'q-element'
  | 'q-logo'
  | 'q-purpose-ref'
  | 'prompt-preview'
  | 'generating'
  | 'refining'

type ThreadItem =
  | { id: string; type: 'section'; label: string }
  | { id: string; type: 'bot'; text: string; sub?: string; suggestions?: string[] }
  | { id: string; type: 'user'; text?: string; images?: string[] }

interface Answers {
  backgroundColor: string
  backgroundColorName: string
  mainElement: string
  logoUsage: string
  purpose: string
  referenceImage: string
  promptRefinement: string
}

/* ── data ───────────────────────────────────────────────────── */
const LOGO_OPTIONS = [
  { value: 'top-left',  label: 'Top left',            sub: 'Standard, professional placement' },
  { value: 'top-center',label: 'Top center',           sub: 'Centered, editorial feel' },
  { value: 'bottom',    label: 'Bottom',               sub: 'Subtle; used in full-bleed designs' },
  { value: 'floating',  label: 'Floating / Watermark', sub: 'Light opacity when visuals take priority' },
  { value: 'none',      label: 'No logo',              sub: 'Omit the brand mark from this theme' },
]

const PURPOSE_OPTIONS = [
  { value: 'Product Launch',      sub: 'Bold CTAs, high contrast, urgency-driven layouts' },
  { value: 'Social Posts',        sub: 'Square/portrait-optimized, thumb-stopping visuals, minimal text' },
  { value: 'Email Newsletter',    sub: 'Single-column, readable body text, clear section dividers' },
  { value: 'Pitch Deck',          sub: 'Structured slides, data-forward, confident professional tone' },
  { value: 'Event Announcement',  sub: 'Date-prominent, venue detail blocks, excitement-building energy' },
  { value: 'Seasonal Promotion',  sub: 'Seasonal color shifts, limited-time messaging, festive energy' },
]

/* ── helpers ────────────────────────────────────────────────── */
function buildThemePrompt(kit: BrandKit, answers: Answers): string {
  const { backgroundColor, backgroundColorName, mainElement, logoUsage, purpose, referenceImage, promptRefinement } = answers
  const displayFont = kit.type.display.family || 'the brand display font'
  const bodyFont    = kit.type.body.family    || 'the brand body font'
  const voice       = kit.tone.attrs.slice(0, 3).map(a => (a as { t: string; vs?: string }).vs ? `${(a as { t: string; vs?: string }).t} (${(a as { t: string; vs?: string }).vs})` : (a as { t: string }).t).filter(Boolean).join(', ') || 'on-brand'
  const wordsUse    = kit.tone.use?.slice(0, 4).join(', ')
  const wordsAvoid  = kit.tone.avoid?.slice(0, 4).join(', ')
  const density     = kit.tone.textDensity

  const lines: string[] = []
  if (backgroundColorName || backgroundColor)
    lines.push(`Background: Use ${backgroundColorName}${backgroundColor ? ` (${backgroundColor})` : ''} as the primary background.`)
  lines.push(mainElement
    ? `Key visual: ${mainElement} is the dominant element — it should appear consistently as the visual anchor.`
    : 'Key visual: AI decides the dominant visual per layout.')
  if (logoUsage === 'none')
    lines.push('Logo: Omit the brand mark entirely.')
  else if (logoUsage) {
    const logoLabel = LOGO_OPTIONS.find(o => o.value === logoUsage)?.label ?? logoUsage
    lines.push(`Logo: Positioned ${logoLabel.toLowerCase()}.`)
  }
  if (purpose) lines.push(`Purpose: This theme is designed for ${purpose}.`)
  if (referenceImage) lines.push('Layout reference: Match the composition style and decorative treatment from the provided reference image.')
  lines.push('')
  lines.push(`Typography: ${displayFont} for headlines, ${bodyFont} for body text.`)
  lines.push(`Brand personality: ${voice}.`)
  if (wordsUse)   lines.push(`Prefer words like: ${wordsUse}.`)
  if (wordsAvoid) lines.push(`Avoid: ${wordsAvoid}.`)
  if (density === 'minimal')  lines.push('Text density: minimal — visuals lead, keep copy extremely brief.')
  if (density === 'concise')  lines.push('Text density: concise — clear and purposeful, no filler.')
  if (density && density !== 'minimal' && density !== 'concise') lines.push('Text density: thorough — include enough context to inform.')
  if (promptRefinement) lines.push(`\nAdjustments: ${promptRefinement}`)
  return lines.join('\n')
}

/* ── sub-components ────────────────────────────────────────── */
function BotAvatar() {
  return (
    <div className="ntm-bot-avatar">
      <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 13, height: 13, color: '#000' }}>
        <path d="M2 14L9 2l3 7 3-3" />
      </svg>
    </div>
  )
}

function formatContent(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} style={{ color: 'var(--t1)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
            : part
        )}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="ntm-section-divider">
      <div className="ntm-section-divider-line" />
      <span className="ntm-section-divider-label">{label}</span>
      <div className="ntm-section-divider-line" />
    </div>
  )
}

function WelcomeScreen({ kit, onStart }: { kit: BrandKit; onStart: () => void }) {
  const wordsUse   = kit.tone.use?.slice(0, 4) ?? []
  const wordsAvoid = kit.tone.avoid?.slice(0, 3) ?? []
  const hasLogo    = kit.logos?.variants?.some((v: { src?: string }) => v.src)
  const imageCount = kit.imagery?.assets?.length ?? 0

  return (
    <div className="ntm-welcome">
      <div className="ntm-welcome-inner">

        <div className="ntm-welcome-what">
          <div className="ntm-welcome-eyebrow">New Brand Theme</div>
          <div className="ntm-welcome-title">{kit.name}</div>
          <div className="ntm-welcome-desc">
            A brand theme defines the <strong>rules</strong> for how your brand kit elements are applied — background treatment, dominant visual, logo placement, and color hierarchy. It's not a finished design; it's a ruleset your AI follows every time it creates content for this theme.
          </div>
          <div className="ntm-welcome-theme-pillars">
            {[
              { icon: '🎨', label: 'Color rules',  sub: 'Background, accent, and CTA hierarchy' },
              { icon: '🖼', label: 'Layout rules', sub: 'Dominant visual and logo placement' },
              { icon: '✦',  label: 'Voice rules',  sub: 'Copy density, tone, and word choices' },
            ].map(p => (
              <div key={p.label} className="ntm-welcome-pillar">
                <span className="ntm-welcome-pillar-icon">{p.icon}</span>
                <div>
                  <div className="ntm-welcome-pillar-label">{p.label}</div>
                  <div className="ntm-welcome-pillar-sub">{p.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ntm-welcome-kit-header">
          <span className="ntm-welcome-section-label">What's in this brand kit</span>
        </div>

        <div className="ntm-welcome-kit">
          {kit.colors.palettes.length > 0 && (
            <div className="ntm-welcome-section">
              <div className="ntm-welcome-section-label">Colors</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kit.colors.palettes.map(palette => (
                  <div key={palette.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {palette.colors.map((c, i) => (
                        <div key={i} title={`${c.name}: ${c.hex}`}
                          style={{ width: 20, height: 20, borderRadius: 5, background: c.hex, border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t2)' }}>{palette.name}</span>
                      {palette.desc && <span style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.4 }}>{palette.desc}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(kit.type.display.family || kit.type.body.family) && (
            <div className="ntm-welcome-section">
              <div className="ntm-welcome-section-label">Typography</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {kit.type.display.family && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>{kit.type.display.family}</span>
                    {kit.type.display.note && <span style={{ fontSize: 11, color: 'var(--t3)' }}>{kit.type.display.note}</span>}
                  </div>
                )}
                {kit.type.body.family && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--t2)' }}>{kit.type.body.family}</span>
                    {kit.type.body.note && <span style={{ fontSize: 11, color: 'var(--t3)' }}>{kit.type.body.note}</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {kit.tone.attrs.length > 0 && (
            <div className="ntm-welcome-section">
              <div className="ntm-welcome-section-label">Voice &amp; tone</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {kit.tone.attrs.map((a, i) => (
                    <span key={i} className="ntm-welcome-voice-chip">
                      {(a as { t: string; vs?: string }).t}{(a as { t: string; vs?: string }).vs ? ` (${(a as { t: string; vs?: string }).vs})` : ''}
                    </span>
                  ))}
                </div>
                {(wordsUse.length > 0 || wordsAvoid.length > 0) && (
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {wordsUse.length > 0 && (
                      <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                        <span style={{ color: 'var(--t2)', fontWeight: 600 }}>Use: </span>{wordsUse.join(', ')}
                      </div>
                    )}
                    {wordsAvoid.length > 0 && (
                      <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                        <span style={{ color: 'var(--t2)', fontWeight: 600 }}>Avoid: </span>{wordsAvoid.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {(kit.imagery?.desc || kit.imagery?.styleDesc) && (
            <div className="ntm-welcome-section">
              <div className="ntm-welcome-section-label">Imagery style</div>
              <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.55 }}>
                {kit.imagery.desc || kit.imagery.styleDesc}
              </div>
              {kit.imagery.tags && kit.imagery.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                  {kit.imagery.tags.map((tag: { t: string; c: string }, i: number) => (
                    <span key={i} className="ntm-welcome-voice-chip">{tag.t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="ntm-welcome-section" style={{ flexDirection: 'row', gap: 24 }}>
            <div>
              <div className="ntm-welcome-section-label">Brand images</div>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>
                {imageCount > 0 ? `${imageCount} asset${imageCount !== 1 ? 's' : ''} available` : 'No assets yet'}
              </div>
            </div>
            {hasLogo && (
              <div>
                <div className="ntm-welcome-section-label">Logo</div>
                <div style={{ fontSize: 13, color: 'var(--t2)' }}>
                  {kit.logos?.variants?.length ?? 0} variant{(kit.logos?.variants?.length ?? 0) !== 1 ? 's' : ''} included
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={onStart}>
          Start building →
        </button>
      </div>
    </div>
  )
}

function PromptSidebar({ themeName, themePrompt, onNameChange }: { themeName: string; themePrompt: string; onNameChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)

  if (!themeName && !themePrompt) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.13)', textAlign: 'center', lineHeight: 1.6 }}>
          Theme preview appears<br />after you generate
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 4 }}>Theme name</div>
        <input
          value={themeName}
          onChange={(e) => onNameChange(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--t1)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '2px 0 4px', outline: 'none', lineHeight: 1.3, boxSizing: 'border-box' }}
          onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--accent-line)' }}
          onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)' }}
          placeholder="Theme name…"
        />
      </div>
      {themePrompt && (
        <div>
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
            <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.65, whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.07)' }}>
              {themePrompt}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── main component ────────────────────────────────────────── */
interface NewThemeModalProps {
  kit: BrandKit
  onClose: () => void
}

export function NewThemeModal({ kit, onClose }: NewThemeModalProps) {
  const addTheme     = useBrandStore((s) => s.addTheme)
  const setAppliedId = useBrandStore((s) => s.setAppliedId)
  const setModal     = useUIStore((s) => s.setModal)
  const navigate     = useNavigate()

  /* welcome */
  const [welcomeDone, setWelcomeDone] = useState(false)

  /* preview */
  const [themeName,       setThemeName]       = useState('')
  const [themePrompt,     setThemePrompt]     = useState('')
  const [previewGradient, setPreviewGradient] = useState<string | null>(null)

  /* conversational flow */
  const [phase,    setPhase]    = useState<Phase>('q-background')
  const [thread,   setThread]   = useState<ThreadItem[]>([])
  const [answers,  setAnswers]  = useState<Answers>({ backgroundColor: '', backgroundColorName: '', mainElement: '', logoUsage: '', purpose: '', referenceImage: '', promptRefinement: '' })
  const [thinking, setThinking] = useState(false)

  /* per-phase selection state */
  const [selectedBgHex,       setSelectedBgHex]       = useState('')
  const [selectedBgName,      setSelectedBgName]       = useState('')
  const [selectedElement,     setSelectedElement]      = useState('')
  const [selectedLogoUsage,   setSelectedLogoUsage]    = useState('')
  const [selectedPurpose,     setSelectedPurpose]      = useState('')
  const [referenceImageData,  setReferenceImageData]   = useState('')
  const [promptRefinementInput, setPromptRefinementInput] = useState('')

  /* refining chat */
  const [chatInput,        setChatInput]        = useState('')
  const [chatAttachments,  setChatAttachments]  = useState<string[]>([])
  const [chatInputFocused, setChatInputFocused] = useState(false)
  const chatImageInputRef  = useRef<HTMLInputElement>(null)
  const referenceInputRef  = useRef<HTMLInputElement>(null)
  const messagesEndRef     = useRef<HTMLDivElement>(null)

  /* seed thread on welcome dismiss */
  useEffect(() => {
    if (!welcomeDone) return
    const t = setTimeout(() => {
      setThread([
        { id: 'greeting', type: 'bot', text: `Let's build a theme for **${kit.name}**. I'll ask a few quick questions about how you want it to look.` },
        { id: 's1', type: 'section', label: 'Visual setup' },
        { id: 'q-bg', type: 'bot', text: "What's the background color for this theme?", sub: 'Pick from your brand palette — sets the dominant tone: dark, light, or brand-saturated.' },
      ])
      setPhase('q-background')
    }, 180)
    return () => clearTimeout(t)
  }, [welcomeDone, kit.name])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread, thinking])

  function append(items: ThreadItem[]) {
    setThread(prev => [...prev, ...items])
  }

  /* ── answer handlers ─────────────────────────────────────── */
  function handleBgAnswer() {
    if (!selectedBgHex) return
    setAnswers(prev => ({ ...prev, backgroundColor: selectedBgHex, backgroundColorName: selectedBgName }))
    append([{ id: `u-bg-${Date.now()}`, type: 'user', text: `${selectedBgName} · ${selectedBgHex}` }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      append([
        { id: `b-bg-${Date.now()}`, type: 'bot', text: `**${selectedBgName}** — that sets the tone.` },
        { id: `q-el-${Date.now()}`, type: 'bot', text: "What's the key visual for this theme?", sub: 'The main element that appears consistently — a mascot, product shot, or hero image. Leave blank to let AI decide.' },
      ])
      setPhase('q-element')
      setSelectedElement('')
    }, 700)
  }

  function handleElementAnswer(elementName: string) {
    setAnswers(prev => ({ ...prev, mainElement: elementName }))
    const userText = elementName || 'AI decides — no key visual specified'
    append([{ id: `u-el-${Date.now()}`, type: 'user', text: userText }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      append([
        { id: `b-el-${Date.now()}`, type: 'bot', text: elementName ? `**${elementName}** will anchor every layout.` : "No key visual — I'll decide per layout." },
        { id: `q-logo-${Date.now()}`, type: 'bot', text: 'How should the logo appear?' },
      ])
      setPhase('q-logo')
      setSelectedLogoUsage('')
    }, 700)
  }

  function handleLogoAnswer() {
    if (!selectedLogoUsage) return
    setAnswers(prev => ({ ...prev, logoUsage: selectedLogoUsage }))
    const label = LOGO_OPTIONS.find(o => o.value === selectedLogoUsage)?.label ?? selectedLogoUsage
    append([{ id: `u-logo-${Date.now()}`, type: 'user', text: label }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      append([
        { id: `b-logo-${Date.now()}`, type: 'bot', text: selectedLogoUsage === 'none' ? 'No logo — the design will stand on its own.' : `Logo ${label.toLowerCase()} — noted.` },
        { id: `s2-${Date.now()}`, type: 'section', label: 'Layout & purpose' },
        { id: `q-pur-${Date.now()}`, type: 'bot', text: "What's this theme for?", sub: 'Pick a purpose to get a layout preset — or paste your own reference image. You can do both.' },
      ])
      setPhase('q-purpose-ref')
      setSelectedPurpose('')
      setReferenceImageData('')
    }, 700)
  }

  function handlePurposeRefAnswer() {
    const purpose  = selectedPurpose
    const refImage = referenceImageData
    if (!purpose && !refImage) return
    const updatedAnswers = { ...answers, purpose, referenceImage: refImage }
    setAnswers(updatedAnswers)
    const parts = [purpose || null, refImage ? 'layout reference attached' : null].filter(Boolean)
    append([{ id: `u-pur-${Date.now()}`, type: 'user', text: parts.join(' · '), images: refImage ? [refImage] : undefined }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      append([
        { id: `b-pur-${Date.now()}`, type: 'bot', text: "Here's the theme ruleset I've assembled. Review it and make any adjustments before generating." },
      ])
      setPhase('prompt-preview')
      setPromptRefinementInput('')
    }, 700)
  }

  function handlePromptPreviewNext() {
    const refinement = promptRefinementInput.trim()
    const snap = { ...answers, promptRefinement: refinement }
    const prompt = buildThemePrompt(kit, snap)
    setAnswers(snap)
    append([{ id: `u-gen-${Date.now()}`, type: 'user', text: refinement ? `Generate · ${refinement}` : 'Generate theme' }])
    setPhase('generating')
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      const name = snap.purpose || `${kit.name} Theme`
      setThemeName(name)
      setThemePrompt(prompt)
      setPreviewGradient(pickGradient(name + kit.name))
      append([{
        id: `b-gen-${Date.now()}`, type: 'bot',
        text: `Your **${name}** theme is ready! Preview is on the right.\n\nWould you like to refine anything — tone, layout, imagery style, or colour emphasis?`,
        suggestions: ['Make it bolder', 'Add more whitespace', 'Warmer colours', 'More minimalist', 'Looks good, save it'],
      }])
      setPhase('refining')
    }, 1400)
  }

  function handleChatSend(text: string) {
    const trimmed = text.trim()
    if ((!trimmed && chatAttachments.length === 0) || thinking) return
    setChatInput('')
    const imgs = [...chatAttachments]
    setChatAttachments([])
    append([{ id: `u-chat-${Date.now()}`, type: 'user', text: trimmed, images: imgs.length ? imgs : undefined }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      setThemePrompt(prev => prev + `\n\nAdjustment: ${trimmed}`)
      setPreviewGradient(pickGradient(trimmed + themePrompt))
      if (trimmed.toLowerCase().includes('looks good') || trimmed.toLowerCase().includes('save')) {
        append([{ id: `b-done-${Date.now()}`, type: 'bot', text: `Theme locked in! Click **Save theme** in the top right.` }])
      } else {
        append([{
          id: `b-chat-${Date.now()}`, type: 'bot',
          text: `Updated! Anything else you'd like to adjust?`,
          suggestions: ['Looks good, save it', 'Change imagery style', 'Adjust typography'],
        }])
      }
    }, 1300)
  }

  function handleChatImageAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setChatAttachments(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
    e.target.value = ''
  }

  function handleReferenceImageAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setReferenceImageData(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleReferencePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image/'))
    if (imageItem) {
      const file = imageItem.getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => setReferenceImageData(ev.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
  }

  /* build + save */
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
  const showSheet = ['q-background', 'q-element', 'q-logo', 'q-purpose-ref', 'prompt-preview'].includes(phase)

  /* ── kit assets for q-element ─────────────────────────────── */
  const logoVariants = (kit.logos?.variants ?? []).filter((v: { src?: string }) => v.src)
  const imageryAssets = kit.imagery?.assets ?? []
  type KitAsset = { name: string; preview: string; isImage: boolean }
  const kitAssets: KitAsset[] = [
    ...logoVariants.map((v: { src?: string }) => ({ name: 'Logo', preview: v.src ?? '', isImage: true })),
    ...imageryAssets.map((a: { name: string; preview?: string }) => ({
      name: a.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
      preview: a.preview ?? '',
      isImage: false,
    })),
  ]

  /* ── render thread item ────────────────────────────────────── */
  function renderItem(item: ThreadItem) {
    if (item.type === 'section') return <SectionDivider key={item.id} label={item.label} />

    if (item.type === 'bot') return (
      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="ntm-bot-row">
          <BotAvatar />
          <div className="ntm-bot-bubble">
            <div>{formatContent(item.text)}</div>
            {item.sub && <p className="ntm-bot-sub">{item.sub}</p>}
          </div>
        </div>
        {item.suggestions && item.suggestions.length > 0 && (
          <div className="ntm-suggestions">
            {item.suggestions.map(s => (
              <button key={s} className="ntm-chip" disabled={thinking} onClick={() => handleChatSend(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>
    )

    if (item.type === 'user') return (
      <div key={item.id} className="ntm-user-row">
        {item.images && item.images.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {item.images.map((src, i) => (
              <img key={i} src={src} alt="" style={{ height: 72, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--line-2)' }} />
            ))}
          </div>
        )}
        {item.text && <div className="ntm-user-bubble">{item.text}</div>}
      </div>
    )

    return null
  }

  /* ── bottom sheet ──────────────────────────────────────────── */
  const PHASE_ORDER: Phase[] = ['q-background', 'q-element', 'q-logo', 'q-purpose-ref']
  const stepNum = PHASE_ORDER.indexOf(phase as Phase) + 1

  function renderBottomSheet() {
    if (phase === 'refining') return (
      <div className="ntm-input-bar">
        <input ref={chatImageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleChatImageAttach} />
        {chatAttachments.length > 0 && (
          <div className="ntm-attachments">
            {chatAttachments.map((src, i) => (
              <div key={i} className="ntm-attachment">
                <img src={src} alt="" style={{ height: 56, borderRadius: 7, objectFit: 'cover', border: '1px solid var(--line-2)', display: 'block' }} />
                <button className="ntm-attachment-remove" onClick={() => setChatAttachments(prev => prev.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
          </div>
        )}
        <div className={`ntm-input-box${chatInputFocused ? ' focused' : ''}`}>
          <Tip label="Attach image" side="top">
            <button className="ntm-input-attach" onClick={() => chatImageInputRef.current?.click()}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M13.5 7.5l-6.5 6.5a3.5 3.5 0 01-5-5l7-7a2 2 0 012.8 2.8l-7 7a.5.5 0 01-.7-.7l6.5-6.5" />
              </svg>
            </button>
          </Tip>
          <textarea
            className="ntm-input-textarea"
            placeholder="Refine your theme…"
            value={chatInput}
            rows={1}
            onChange={e => {
              setChatInput(e.target.value)
              const el = e.target
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 160) + 'px'
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(chatInput) } }}
            onFocus={() => setChatInputFocused(true)}
            onBlur={() => setChatInputFocused(false)}
          />
          <button
            className="ntm-input-send"
            style={{
              background: (chatInput.trim() || chatAttachments.length > 0) && !thinking ? 'var(--accent)' : 'var(--card-2)',
              color: (chatInput.trim() || chatAttachments.length > 0) && !thinking ? '#000' : 'var(--t3)',
            }}
            disabled={(!chatInput.trim() && chatAttachments.length === 0) || thinking}
            onClick={() => handleChatSend(chatInput)}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M2 14L14 8 2 2v5l8 1-8 1z" />
            </svg>
          </button>
        </div>
      </div>
    )

    if (phase === 'generating') return null

    if (phase === 'prompt-preview') {
      const previewText = buildThemePrompt(kit, { ...answers, promptRefinement: promptRefinementInput })
      return (
        <div className="ntm-bac-wrap">
          <div className="ac2-bac" style={{ '--bac-color': 'var(--accent)' } as React.CSSProperties}>
            <div className="ac2-bac-header">
              <span className="ac2-bac-q">Review your theme ruleset</span>
            </div>
            <div className="ac2-bac-body">
              <div className="ntm-preview-prompt-wrap">
                <div className="ntm-preview-prompt-text">{previewText}</div>
              </div>
              <div className="ac2-bac-note-wrap" style={{ marginTop: 8 }}>
                <textarea
                  className="ac2-bac-input"
                  placeholder="Want to adjust anything? Describe changes (optional)…"
                  value={promptRefinementInput}
                  onChange={e => setPromptRefinementInput(e.target.value)}
                  rows={2}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>
            <div className="ac2-bac-footer">
              <span className="ac2-bac-count">Ready to generate</span>
              <div className="ac2-bac-actions">
                <button className="ac2-bac-next" onClick={handlePromptPreviewNext}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    /* q-* phases */
    const allSwatches = kit.colors.palettes.flatMap(p => p.colors)
    const canNext = phase === 'q-background' ? !!selectedBgHex
      : phase === 'q-logo' ? !!selectedLogoUsage
      : phase === 'q-purpose-ref' ? !!(selectedPurpose || referenceImageData)
      : true

    return (
      <div className="ntm-bac-wrap">
        <div className="ac2-bac" style={{ '--bac-color': 'var(--accent)' } as React.CSSProperties}>

          {/* Header */}
          <div className="ac2-bac-header">
            <span className="ac2-bac-q">
              {phase === 'q-background' && 'Background color'}
              {phase === 'q-element'    && 'Key visual'}
              {phase === 'q-logo'       && 'Logo placement'}
              {phase === 'q-purpose-ref'&& 'Purpose & layout'}
            </span>
            <div className="ac2-bac-nav">
              <span className="ac2-bac-step">{stepNum} of {PHASE_ORDER.length}</span>
            </div>
          </div>

          {/* Body */}
          <div className="ac2-bac-body">

            {/* Q1: Background color swatches */}
            {phase === 'q-background' && (
              <div className="ntm-swatch-grid">
                {allSwatches.map(c => (
                  <button
                    key={c.hex}
                    className={`ntm-swatch-btn${selectedBgHex === c.hex ? ' selected' : ''}`}
                    onClick={() => { setSelectedBgHex(c.hex); setSelectedBgName(c.name) }}
                  >
                    <div className="ntm-swatch-color" style={{ background: c.hex }} />
                    <span className="ntm-swatch-name">{c.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Q2: Key visual (kit assets) */}
            {phase === 'q-element' && (
              kitAssets.length === 0 ? (
                <div style={{ fontSize: 12.5, color: 'var(--t3)', padding: '6px 0', lineHeight: 1.55 }}>
                  No brand assets in this kit — AI will decide the dominant visual.
                </div>
              ) : (
                <div className="ac2-bac-options">
                  {kitAssets.map((asset, i) => {
                    const active = selectedElement === asset.name
                    return (
                      <button
                        key={i}
                        className={`ac2-bac-option${active ? ' selected' : ''}`}
                        onClick={() => setSelectedElement(active ? '' : asset.name)}
                      >
                        <span className="ac2-bac-checkbox">{active && <Check size={10} strokeWidth={3} />}</span>
                        <span className="ac2-bac-option-label" style={{ flex: 1 }}>{asset.name}</span>
                        {asset.isImage
                          ? <img src={asset.preview} alt="" style={{ width: 28, height: 20, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 28, height: 20, borderRadius: 4, background: asset.preview, flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />
                        }
                      </button>
                    )
                  })}
                </div>
              )
            )}

            {/* Q3: Logo placement */}
            {phase === 'q-logo' && (
              <div className="ac2-bac-options">
                {LOGO_OPTIONS.map(opt => {
                  const active = selectedLogoUsage === opt.value
                  return (
                    <button
                      key={opt.value}
                      className={`ac2-bac-option${active ? ' selected' : ''}`}
                      onClick={() => setSelectedLogoUsage(active ? '' : opt.value)}
                    >
                      <span className="ac2-bac-checkbox">{active && <Check size={10} strokeWidth={3} />}</span>
                      <div style={{ flex: 1 }}>
                        <span className="ac2-bac-option-label">{opt.label}</span>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{opt.sub}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Q4: Purpose + reference image */}
            {phase === 'q-purpose-ref' && (
              <>
                <div className="ac2-bac-options">
                  {PURPOSE_OPTIONS.map(opt => {
                    const active = selectedPurpose === opt.value
                    return (
                      <button
                        key={opt.value}
                        className={`ac2-bac-option${active ? ' selected' : ''}`}
                        onClick={() => setSelectedPurpose(active ? '' : opt.value)}
                      >
                        <span className="ac2-bac-checkbox">{active && <Check size={10} strokeWidth={3} />}</span>
                        <div style={{ flex: 1 }}>
                          <span className="ac2-bac-option-label">{opt.value}</span>
                          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{opt.sub}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Reference image section */}
                <div className="ntm-ref-divider">
                  <div className="ntm-ref-divider-line" />
                  <span className="ntm-ref-divider-label">Or paste a layout reference</span>
                  <div className="ntm-ref-divider-line" />
                </div>
                <input ref={referenceInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReferenceImageAttach} />
                {referenceImageData ? (
                  <div className="ntm-ref-preview">
                    <img src={referenceImageData} alt="Layout reference" className="ntm-ref-thumb" />
                    <button className="ntm-ref-remove" onClick={() => setReferenceImageData('')}>Remove</button>
                  </div>
                ) : (
                  <div
                    className="ntm-ref-dropzone"
                    onClick={() => referenceInputRef.current?.click()}
                    onPaste={handleReferencePaste}
                    tabIndex={0}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 14, height: 14, color: 'var(--t3)' }}>
                      <rect x="2" y="2" width="12" height="12" rx="2" /><circle cx="5.5" cy="5.5" r="1" /><path d="M2 10l3-3 3 3 2-2 4 4" />
                    </svg>
                    <span>Click to browse or paste an image</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="ac2-bac-footer">
            <span className="ac2-bac-count">
              {phase === 'q-background' && (selectedBgHex ? selectedBgName : '0 selected')}
              {phase === 'q-element'    && (selectedElement ? selectedElement : kitAssets.length === 0 ? 'No assets' : '0 selected')}
              {phase === 'q-logo'       && (selectedLogoUsage ? LOGO_OPTIONS.find(o => o.value === selectedLogoUsage)?.label ?? '' : '0 selected')}
              {phase === 'q-purpose-ref'&& ([selectedPurpose, referenceImageData ? 'reference attached' : null].filter(Boolean).join(' · ') || '0 selected')}
            </span>
            <div className="ac2-bac-actions">
              {phase === 'q-element' && (
                <button className="ac2-bac-skip" onClick={() => handleElementAnswer('')}>Leave blank</button>
              )}
              <button
                className="ac2-bac-next"
                disabled={!canNext}
                onClick={() => {
                  if (phase === 'q-background')  handleBgAnswer()
                  else if (phase === 'q-element') handleElementAnswer(selectedElement)
                  else if (phase === 'q-logo')    handleLogoAnswer()
                  else if (phase === 'q-purpose-ref') handlePurposeRefAnswer()
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Portal>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--app)', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div className="ntm-bar">
          <button className="ntm-bar-back" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back
          </button>
          <div className="ntm-bar-sep" />
          <span className="ntm-bar-title">New Brand Theme</span>
          <div className="ntm-bar-actions">
            <button className="btn outline" onClick={handleCreate} disabled={!canCreate} style={{ opacity: canCreate ? 1 : 0.4 }}>Save theme</button>
            <button className="btn primary" onClick={handleCreateAndStart} disabled={!canCreate} style={{ opacity: canCreate ? 1 : 0.4 }}>Create project with this theme</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row-reverse', minHeight: 0 }}>

          {/* Right: preview panel — hidden until generated */}
          <div className="ntm-preview-panel" style={{ display: previewGradient ? 'flex' : 'none' }}>
            <PromptSidebar themeName={themeName} themePrompt={themePrompt} onNameChange={setThemeName} />
            <div className="ntm-preview-tiles">
              {[
                { g: previewGradient!, label: 'Preview' },
                { g: pickG(previewGradient! + '1', G1), label: 'Social' },
                { g: pickG(previewGradient! + '2', G2), label: 'Campaign' },
              ].map((p, i) => (
                <div key={i} className="ntm-preview-tile" style={{ background: p.g }}>
                  <div className="ntm-preview-tile-label">{p.label}</div>
                  <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.45)', borderRadius: 3, padding: '1px 5px', fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Left: chat */}
          <div className="ntm-chat-main" style={{ position: 'relative' }}>
            {!welcomeDone ? (
              <WelcomeScreen kit={kit} onStart={() => setWelcomeDone(true)} />
            ) : (
              <>
                <div className={`ntm-messages${showSheet ? ' ntm-messages--has-sheet' : ''}`}>
                  {thread.map(item => renderItem(item))}
                  {thinking && (
                    <div className="ntm-thinking">
                      <BotAvatar />
                      <div className="ntm-thinking-dots">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="ntm-thinking-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {renderBottomSheet()}
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  )
}
