import { useState, useRef, useEffect } from 'react'
import { ChevronRight, Check, X } from 'lucide-react'
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
  | 'q-purpose'
  | 'q-assets'
  | 'q-style-images'
  | 'q-style-text'
  | 'summary'
  | 'generating'
  | 'refining'

type ThreadItem =
  | { id: string; type: 'section'; label: string }
  | { id: string; type: 'bot'; text: string; sub?: string; suggestions?: string[] }
  | { id: string; type: 'user'; text?: string; images?: string[] }
  | { id: string; type: 'summary' }

interface Answers {
  purpose: string
  assetLabels: string[]
  styleImages: string[]
  instructions: string
}

/* ── helpers ───────────────────────────────────────────────── */
function buildThemePrompt(kit: BrandKit, userInput: string, answers: Answers): string {
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

Brand personality: ${voice}. Imagery should feel authentic and purposeful — avoid stock-photo clichés.${wordsUse ? `\n\nPrefer words like: ${wordsUse}.` : ''}${wordsAvoid ? ` Avoid: ${wordsAvoid}.` : ''}${density ? `\n\nText density: ${density} — keep copy ${density === 'minimal' ? 'extremely brief, visuals lead' : density === 'concise' ? 'clear and purposeful, no filler' : 'thorough with enough context to inform'}.` : ''}${customTone ? `\n\nAdditional tone guidance: ${customTone}` : ''}${answers.instructions.trim() ? `\n\nTheme rules: ${answers.instructions.trim()}` : ''}

This theme is designed for ${userInput.trim()}. Keep layouts well-structured with generous whitespace. All elements should reinforce brand trust and clarity of message.`
}

function purposeAck(p: string): string {
  if (p === 'Product Launch')     return "Product launch — I'll design the theme to build excitement and drive action."
  if (p === 'Social Posts')       return "Social posts — I'll optimise for visual impact and thumb-stopping energy."
  if (p === 'Email Newsletter')   return "Email newsletter — I'll keep things clean and scannable with a clear reading hierarchy."
  if (p === 'Pitch Deck')         return "Pitch deck — I'll go polished and authoritative. Clarity and credibility above all."
  if (p === 'Event Announcement') return "Event announcement — I'll build in energy and urgency to get people excited."
  if (p === 'Seasonal Promotion') return "Seasonal promotion — I'll make it feel timely and festive without being overdone."
  return `Got it — I'll tailor the theme for ${p}.`
}

const THEME_PURPOSES = ['Product Launch', 'Social Posts', 'Email Newsletter', 'Pitch Deck', 'Event Announcement', 'Seasonal Promotion'] as const

const SHEET_QUESTIONS: Record<string, string> = {
  'q-purpose': "What's this theme for?",
  'q-assets': 'Any brand image assets to include?',
  'q-style-images': 'Any visual references or inspiration?',
  'q-style-text': 'Any custom instructions for this theme?',
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

function SummaryCard({ answers }: { answers: Answers }) {
  return (
    <div className="ntm-summary-card">
      <div className="ntm-summary-header">
        <div className="ntm-summary-label-row">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ntm-summary-sparkle">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          <span className="ntm-summary-eyebrow">Theme summary</span>
        </div>
        <div className="ntm-summary-title">{answers.purpose}</div>
      </div>
      <div className="ntm-summary-section">
        <div className="ntm-summary-section-label">Brand assets</div>
        <div className="ntm-summary-section-value">
          {answers.assetLabels.length > 0
            ? `${answers.assetLabels.length} image asset${answers.assetLabels.length !== 1 ? 's' : ''} selected — placed directly in your designs`
            : 'AI picks from the full brand library'}
        </div>
      </div>
      <div className="ntm-summary-section">
        <div className="ntm-summary-section-label">Style direction</div>
        <div className="ntm-summary-section-value">
          {[
            answers.styleImages.length > 0
              ? `${answers.styleImages.length} reference image${answers.styleImages.length !== 1 ? 's' : ''} — shapes visual tone only, won't appear in content`
              : null,
            answers.instructions.trim() ? `"${answers.instructions.trim()}"` : null,
          ].filter(Boolean).join('\n') || 'No additional style guidance'}
        </div>
      </div>
    </div>
  )
}

function WelcomeScreen({ kit, onStart }: { kit: BrandKit; onStart: () => void }) {
  const allColors = kit.colors.palettes.flatMap(p => p.colors).slice(0, 8)
  const hasLogo = kit.logos?.variants?.some((v: { src?: string }) => v.src)
  const imageCount = kit.imagery?.assets?.length ?? 0
  const wordsUse = kit.tone.use?.slice(0, 4) ?? []
  const wordsAvoid = kit.tone.avoid?.slice(0, 3) ?? []

  return (
    <div className="ntm-welcome">
      <div className="ntm-welcome-inner">

        <div className="ntm-welcome-what">
          <div className="ntm-welcome-eyebrow">New Brand Theme</div>
          <div className="ntm-welcome-title">{kit.name}</div>
          <div className="ntm-welcome-desc">
            A theme tailors your brand kit for a specific use case — like a pitch deck, product launch, or social campaign. It applies your existing colors, typography, and voice with layout and style rules optimized for the job.
          </div>
          <div className="ntm-welcome-theme-pillars">
            {[
              { icon: '🎨', label: 'Colors & gradients', sub: 'From your brand palette' },
              { icon: 'Aa', label: 'Type & hierarchy', sub: 'Scale tuned for the format' },
              { icon: '✦', label: 'Voice & tone', sub: 'Copy rules & density' },
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
          {allColors.length > 0 && (
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
                      {a.t}{a.vs ? ` (${a.vs})` : ''}
                    </span>
                  ))}
                </div>
                {(wordsUse.length > 0 || wordsAvoid.length > 0) && (
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {wordsUse.length > 0 && (
                      <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                        <span style={{ color: 'var(--t2)', fontWeight: 600 }}>Use: </span>
                        {wordsUse.join(', ')}
                      </div>
                    )}
                    {wordsAvoid.length > 0 && (
                      <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                        <span style={{ color: 'var(--t2)', fontWeight: 600 }}>Avoid: </span>
                        {wordsAvoid.join(', ')}
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
  const [themeName, setThemeName]             = useState('')
  const [themePrompt, setThemePrompt]         = useState('')
  const [previewGradient, setPreviewGradient] = useState<string | null>(null)

  /* conversational flow */
  const [phase, setPhase]     = useState<Phase>('q-purpose')
  const [thread, setThread]   = useState<ThreadItem[]>([])
  const [answers, setAnswers] = useState<Answers>({ purpose: '', assetLabels: [], styleImages: [], instructions: '' })
  const [thinking, setThinking] = useState(false)

  /* purpose phase */
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [purposeInput, setPurposeInput]       = useState('')

  /* assets phase */
  const [assetPickerOpen, setAssetPickerOpen]         = useState(false)
  const [selectedImageAssets, setSelectedImageAssets] = useState<Set<string>>(new Set())

  /* style-images phase */
  const [styleImages, setStyleImages] = useState<string[]>([])
  const styleImageInputRef = useRef<HTMLInputElement>(null)

  /* style-text phase */
  const [instructionsInput, setInstructionsInput] = useState('')

  /* refining chat */
  const [chatInput, setChatInput]             = useState('')
  const [chatAttachments, setChatAttachments] = useState<string[]>([])
  const [chatInputFocused, setChatInputFocused] = useState(false)
  const chatImageInputRef = useRef<HTMLInputElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* seed thread when welcome is dismissed */
  useEffect(() => {
    if (!welcomeDone) return
    const t = setTimeout(() => {
      setThread([
        { id: 'greeting', type: 'bot', text: `Let's build a new theme for **${kit.name}**. I'll ask a few quick questions to tailor it to your brand.` },
        { id: 's1', type: 'section', label: 'Theme purpose' },
        { id: 'q-purpose', type: 'bot', text: "What's this theme for? Pick a content type or describe your own." },
      ])
    }, 180)
    return () => clearTimeout(t)
  }, [welcomeDone, kit.name])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread, thinking])

  function append(items: ThreadItem[]) {
    setThread(prev => [...prev, ...items])
  }

  /* ── answer handlers ── */
  function handlePurposeAnswer() {
    const answer = selectedPurpose || purposeInput.trim()
    if (!answer) return
    const ack = purposeAck(answer)
    setAnswers(prev => ({ ...prev, purpose: answer }))
    append([{ id: `u-pur-${Date.now()}`, type: 'user', text: answer }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      append([
        { id: `b-pur-${Date.now()}`, type: 'bot', text: ack },
        { id: `s2-${Date.now()}`, type: 'section', label: 'Brand assets' },
        {
          id: `q-assets-${Date.now()}`, type: 'bot',
          text: 'Any brand image assets to include?',
          sub: 'These are the actual images AI will place inside your content — product shots, lifestyle photos, and branded graphics from your library.',
        },
      ])
      setPhase('q-assets')
    }, 700)
  }

  function handleAssetsAnswer(skipped: boolean) {
    const assetLabels = skipped ? [] : Array.from(selectedImageAssets)
    setAnswers(prev => ({ ...prev, assetLabels }))
    const userText = skipped
      ? 'Skip — use full brand library'
      : `${assetLabels.length} image asset${assetLabels.length !== 1 ? 's' : ''} selected`
    const ack = skipped
      ? "No problem — I'll draw from the full brand image library when generating."
      : `Got it — I'll place those ${assetLabels.length} asset${assetLabels.length !== 1 ? 's' : ''} directly in your designs.`
    append([{ id: `u-assets-${Date.now()}`, type: 'user', text: userText }])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      append([
        { id: `b-assets-${Date.now()}`, type: 'bot', text: ack },
        { id: `s3-${Date.now()}`, type: 'section', label: 'Style direction' },
        {
          id: `q-refs-${Date.now()}`, type: 'bot',
          text: 'Any visual references or inspiration?',
          sub: "Upload designs, mood boards, or screenshots. These won't appear in your content — they guide the visual style, layout, and tone of the theme.",
        },
      ])
      setPhase('q-style-images')
    }, 700)
  }

  function handleStyleImagesAnswer(skipped: boolean) {
    const imgs = skipped ? [] : styleImages
    setAnswers(prev => ({ ...prev, styleImages: imgs }))
    const userText = skipped
      ? 'Skip — no references'
      : `${imgs.length} reference image${imgs.length !== 1 ? 's' : ''} added`
    append([
      { id: `u-refs-${Date.now()}`, type: 'user', text: userText, images: imgs.length > 0 ? imgs : undefined },
      {
        id: `q-txt-${Date.now()}`, type: 'bot',
        text: 'Any custom instructions for this theme?',
        sub: 'Rules the AI should always follow — e.g. always dark backgrounds, avoid sans-serif for headlines, keep copy under 10 words.',
      },
    ])
    setPhase('q-style-text')
  }

  function handleStyleTextAnswer(skipped: boolean) {
    const instructions = skipped ? '' : instructionsInput.trim()
    setAnswers(prev => ({ ...prev, instructions }))
    const userText = skipped ? 'Skip — no custom instructions' : instructions
    const ack = instructions
      ? "Noted — I'll bake those rules into the theme so every generation follows them."
      : "No extra rules — I'll stay true to your brand kit defaults."
    append([
      { id: `u-txt-${Date.now()}`, type: 'user', text: userText },
      { id: `b-txt-${Date.now()}`, type: 'bot', text: ack },
      { id: `summary-${Date.now()}`, type: 'summary' },
    ])
    setPhase('summary')
  }

  function handleGenerate() {
    const snap = { ...answers }
    append([{ id: `u-gen-${Date.now()}`, type: 'user', text: 'Generate theme' }])
    setPhase('generating')
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      const name = snap.purpose
      const prompt = buildThemePrompt(kit, snap.purpose, snap)
      setThemeName(name)
      setThemePrompt(prompt)
      setPreviewGradient(pickGradient(snap.purpose + kit.name))
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

  function handleStyleImageAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setStyleImages(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
    e.target.value = ''
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
  const imageryAssets = kit.imagery.assets ?? []
  const showSheet = ['q-purpose', 'q-assets', 'q-style-images', 'q-style-text', 'summary'].includes(phase)

  /* ── render thread item ── */
  function renderItem(item: ThreadItem) {
    if (item.type === 'section') return <SectionDivider key={item.id} label={item.label} />

    if (item.type === 'summary') return <SummaryCard key={item.id} answers={answers} />

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

  /* ── bottom sheet ── */
  const PHASE_ORDER: Phase[] = ['q-purpose', 'q-assets', 'q-style-images', 'q-style-text']
  const stepNum = PHASE_ORDER.indexOf(phase as Phase) + 1
  const isPurposeReady = !!(selectedPurpose || purposeInput.trim())

  function handleSheetSkip() {
    if (phase === 'q-assets') handleAssetsAnswer(true)
    else if (phase === 'q-style-images') handleStyleImagesAnswer(true)
    else if (phase === 'q-style-text') handleStyleTextAnswer(true)
  }

  function handleSheetNext() {
    if (phase === 'q-purpose') handlePurposeAnswer()
    else if (phase === 'q-assets') handleAssetsAnswer(selectedImageAssets.size === 0)
    else if (phase === 'q-style-images') handleStyleImagesAnswer(styleImages.length === 0)
    else if (phase === 'q-style-text') handleStyleTextAnswer(!instructionsInput.trim())
  }

  function getCountLabel(): string {
    if (phase === 'q-purpose') {
      const p = selectedPurpose || purposeInput.trim()
      return p ? '1 selected' : '0 selected'
    }
    if (phase === 'q-assets') return selectedImageAssets.size > 0 ? `${selectedImageAssets.size} selected` : '0 selected'
    if (phase === 'q-style-images') return styleImages.length > 0 ? `${styleImages.length} uploaded` : 'optional'
    if (phase === 'q-style-text') return instructionsInput.trim() ? `${instructionsInput.trim().length} chars` : 'optional'
    return ''
  }

  function renderBottomSheet() {
    /* refining: full chat input bar, normal flow */
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

    /* generating: no bottom UI */
    if (phase === 'generating') return null

    /* summary: same ac2-bac card style, just with generate button */
    if (phase === 'summary') return (
      <div className="ntm-bac-wrap">
        <div className="ac2-bac" style={{ '--bac-color': 'var(--accent)' } as React.CSSProperties}>
          <div className="ac2-bac-header">
            <span className="ac2-bac-q">Ready to generate your theme</span>
          </div>
          <div className="ac2-bac-footer">
            <span className="ac2-bac-count">All questions answered</span>
            <div className="ac2-bac-actions">
              <button className="ac2-bac-next" onClick={handleGenerate}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )

    /* q-* phases: ac2-bac style card */
    const canNext = phase === 'q-purpose' ? isPurposeReady : true

    return (
      <div className="ntm-bac-wrap">
        <div className="ac2-bac" style={{ '--bac-color': 'var(--accent)' } as React.CSSProperties}>
          {/* Header */}
          <div className="ac2-bac-header">
            <span className="ac2-bac-q">{SHEET_QUESTIONS[phase]}</span>
            <div className="ac2-bac-nav">
              <span className="ac2-bac-step">{stepNum} of {PHASE_ORDER.length}</span>
              {phase !== 'q-purpose' && (
                <X size={14} onClick={handleSheetSkip} style={{ cursor: 'pointer', color: 'var(--t3)' }} />
              )}
            </div>
          </div>

          {/* Body */}
          <div className="ac2-bac-body">
            {phase === 'q-purpose' && (
              <>
                <div className="ac2-bac-options">
                  {THEME_PURPOSES.map(p => {
                    const active = selectedPurpose === p
                    return (
                      <button
                        key={p}
                        className={`ac2-bac-option${active ? ' selected' : ''}`}
                        onClick={() => { setSelectedPurpose(p === selectedPurpose ? '' : p); setPurposeInput('') }}
                      >
                        <span className="ac2-bac-checkbox">{active && <Check size={10} strokeWidth={3} />}</span>
                        <span className="ac2-bac-option-label">{p}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="ac2-bac-note-wrap">
                  <input
                    className="ac2-bac-note-input"
                    type="text"
                    value={selectedPurpose ? '' : purposeInput}
                    onChange={e => { setPurposeInput(e.target.value); setSelectedPurpose('') }}
                    placeholder="Or describe your own… (optional)"
                  />
                </div>
              </>
            )}

            {phase === 'q-assets' && (
              <button className="ntm-az-asset-btn" onClick={() => setAssetPickerOpen(true)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <rect x="2" y="2" width="12" height="12" rx="2" /><circle cx="5.5" cy="5.5" r="1" /><path d="M2 10l3-3 3 3 2-2 4 4" />
                  </svg>
                  <span style={{ fontSize: 13, color: selectedImageAssets.size > 0 ? 'var(--t1)' : 'var(--t2)' }}>
                    {selectedImageAssets.size > 0
                      ? `${selectedImageAssets.size} asset${selectedImageAssets.size !== 1 ? 's' : ''} selected`
                      : 'Choose from brand image assets'}
                  </span>
                </span>
                <svg viewBox="0 0 16 16" fill="none" stroke="var(--t3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>
            )}

            {phase === 'q-style-images' && (
              <>
                <input ref={styleImageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleStyleImageAttach} />
                {styleImages.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    {styleImages.map((src, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={src} alt="" style={{ height: 60, borderRadius: 7, objectFit: 'cover', border: '1px solid var(--line-2)', display: 'block' }} />
                        <button
                          onClick={() => setStyleImages(prev => prev.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#333', border: '1px solid var(--line-2)', color: 'var(--t2)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 10, lineHeight: 1 }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                <button className="ntm-az-upload-btn" onClick={() => styleImageInputRef.current?.click()}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 13, height: 13 }}>
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                  Upload reference images
                </button>
              </>
            )}

            {phase === 'q-style-text' && (
              <textarea
                value={instructionsInput}
                onChange={e => setInstructionsInput(e.target.value)}
                placeholder="e.g. Always use dark backgrounds, avoid sans-serif for headlines, keep copy under 10 words…"
                rows={3}
                className="ac2-bac-input"
                style={{ resize: 'none' }}
              />
            )}
          </div>

          {/* Footer */}
          <div className="ac2-bac-footer">
            <span className="ac2-bac-count">{getCountLabel()}</span>
            <div className="ac2-bac-actions">
              {phase !== 'q-purpose' && (
                <button className="ac2-bac-skip" onClick={handleSheetSkip}>Skip</button>
              )}
              <button
                className="ac2-bac-next"
                disabled={!canNext}
                onClick={handleSheetNext}
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

          {/* Right: preview panel — hidden until theme is generated */}
          <div className="ntm-preview-panel" style={{ display: previewGradient ? 'flex' : 'none' }}>
            <PromptSidebar themeName={themeName} themePrompt={themePrompt} onNameChange={setThemeName} />
            <div className="ntm-preview-tiles">
              {previewGradient ? (
                [
                  { g: previewGradient, label: 'Preview' },
                  { g: pickG(previewGradient + '1', G1), label: 'Social' },
                  { g: pickG(previewGradient + '2', G2), label: 'Campaign' },
                ].map((p, i) => (
                  <div key={i} className="ntm-preview-tile" style={{ background: p.g }}>
                    <div className="ntm-preview-tile-label">{p.label}</div>
                    <div style={{ position: 'absolute', bottom: 6, right: 8, background: 'rgba(0,0,0,0.45)', borderRadius: 3, padding: '1px 5px', fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{i + 1}</div>
                  </div>
                ))
              ) : (
                ['Preview', 'Social', 'Campaign'].map((label) => (
                  <div key={label} className="ntm-preview-empty-tile">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                        <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M3 15l5-5 4 4 3-3 6 6" />
                      </svg>
                      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--t3)' }}>{label}</span>
                    </div>
                  </div>
                ))
              )}
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

      {/* Asset picker modal */}
      {assetPickerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setAssetPickerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', width: 560, maxWidth: '90vw', background: 'var(--card)', borderRadius: 16, border: '1px solid var(--line-2)', padding: 28, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>Brand image assets</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>Select assets to place directly in your designs.</div>
              </div>
              <button onClick={() => setAssetPickerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <button
                onClick={() => setSelectedImageAssets(selectedImageAssets.size === imageryAssets.length ? new Set() : new Set(imageryAssets.map(a => a.name)))}
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
      )}
    </Portal>
  )
}
