import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Send, ChevronRight, Check, X, ChevronDown } from 'lucide-react'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import {
  type ThemeOption,
  SYSTEM_THEMES,
  STANDALONE_THEMES,
  makeBrandKitThemes,
} from '../themes'

/* ── types ────────────────────────────────────────────────────────── */
type Phase =
  | 'idle'
  | 'tool-form'
  | 'reading'
  | 'ctx-reveal'
  | 'conflict-q'
  | 'conflict-thinking'
  | 'form-platform'
  | 'form-thinking'
  | 'form-confirm'
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

/* ── helpers ─────────────────────────────────────────────────────── */
function capitalize(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

const COLOR_KEYWORDS: Record<string, string> = {
  red: '#e05252', crimson: '#dc143c', scarlet: '#ff2400',
  orange: '#e8842c', amber: '#e8a630', golden: '#f5c518', gold: '#f5c518',
  yellow: '#f0d040', cream: '#fffdd0', beige: '#d4b896',
  green: '#4caf70', olive: '#8fba50', sage: '#8fab80', forest: '#228b22',
  teal: '#2a9d8f', cyan: '#00bcd4', mint: '#98edd2',
  blue: '#4a90d9', navy: '#1a2d5a', cobalt: '#0047ab', sky: '#87ceeb', indigo: '#3949ab',
  purple: '#8e44ad', violet: '#7c3aed', lavender: '#b57bee', lilac: '#c8a2c8',
  pink: '#e8549a', rose: '#e91e8c', blush: '#de9ba8', magenta: '#d81b60',
  brown: '#8b5e3c', chocolate: '#7b3f00', caramel: '#c68642',
  black: '#1a1a1a', white: '#f5f5f5', gray: '#888', grey: '#888',
  silver: '#aaa', charcoal: '#36454f', slate: '#708090',
  coral: '#ff6b6b', peach: '#ffb347', ivory: '#fffff0', sand: '#c2b280',
}

function extractVisualFromPrompt(prompt: string): { hexes: string[]; colorWords: string[] } {
  const lower = prompt.toLowerCase()
  const hexes = [...new Set((prompt.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? []))]
  const colorWords: string[] = []
  for (const [word] of Object.entries(COLOR_KEYWORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(lower) && !colorWords.includes(word)) colorWords.push(word)
  }
  return { hexes: hexes.slice(0, 5), colorWords: colorWords.slice(0, 4) }
}

interface PromptInsights {
  contentType:  string
  toneSignals:  string[]
  audiences:    string[]
  seasonTag:    string | null
  urgency:      boolean
  subject:      string
  designStyle:  string[]
  explicitHexes: string[]
}

function analyzePrompt(prompt: string): PromptInsights {
  const p = prompt.toLowerCase()

  /* Content type */
  let contentType = 'social post'
  if (/\b(sale|discount|offer|deal|promo|off)\b/.test(p))              contentType = 'promotional campaign'
  else if (/\b(launch|new|introduc|announc|reveal|debut)\b/.test(p))   contentType = 'product launch'
  else if (/\b(tips|how to|guide|tutorial|learn|educat|explain)\b/.test(p)) contentType = 'educational content'
  else if (/\b(story|behind.the.scene|journey|founder|origin)\b/.test(p))   contentType = 'brand story'
  else if (/\b(event|webinar|conference|workshop|summit)\b/.test(p))        contentType = 'event promotion'
  else if (/\b(testimonial|review|case study|success|result)\b/.test(p))    contentType = 'social proof'
  else if (/\b(inspir|motiv|empower|uplift|transform)\b/.test(p))           contentType = 'inspirational post'
  else if (/\b(campaign|series|collection)\b/.test(p))                      contentType = 'campaign'

  /* Tone signals */
  const toneSignals: string[] = []
  if (/\b(warm|cozy|inviting|friendly|welcoming|approachable)\b/.test(p))   toneSignals.push('warm & inviting')
  if (/\b(bold|strong|powerful|confident|assertive|striking)\b/.test(p))    toneSignals.push('bold & confident')
  if (/\b(playful|fun|witty|humor|lighthearted|quirky)\b/.test(p))          toneSignals.push('playful')
  if (/\b(professional|formal|polished|corporate|executive)\b/.test(p))     toneSignals.push('professional')
  if (/\b(minimal|clean|simple|elegant|refined|sleek)\b/.test(p))           toneSignals.push('minimal & elegant')
  if (/\b(luxury|premium|exclusive|high.end|sophisticated)\b/.test(p))      toneSignals.push('luxury')
  if (/\b(urgent|limited|now|hurry|last chance|don.t miss)\b/.test(p))      toneSignals.push('urgent')
  if (/\b(inspir|emotiv|moving|heartfelt|authentic|genuine)\b/.test(p))     toneSignals.push('emotionally driven')
  if (/\b(tech|innovation|cutting.edge|futuristic|smart|ai)\b/.test(p))     toneSignals.push('tech-forward')
  if (/\b(sustainable|eco|green|ethical|conscious|responsible)\b/.test(p))  toneSignals.push('sustainability-focused')

  /* Audiences */
  const audiences: string[] = []
  if (/\b(coffee|café|cafe|barista|espresso|brew|roast)\b/.test(p))     audiences.push('coffee enthusiasts')
  if (/\b(tech|software|app|saas|developer|startup|engineer)\b/.test(p)) audiences.push('tech professionals')
  if (/\b(fashion|style|wear|clothing|outfit|apparel)\b/.test(p))       audiences.push('fashion-conscious consumers')
  if (/\b(fitness|gym|workout|health|wellness|active)\b/.test(p))       audiences.push('health & fitness community')
  if (/\b(food|restaurant|cuisine|dish|recipe|chef|dining)\b/.test(p))  audiences.push('food lovers')
  if (/\b(crypto|blockchain|web3|defi|nft|token|wallet)\b/.test(p))     audiences.push('crypto & Web3 community')
  if (/\b(business|entrepreneur|b2b|enterprise|executive|ceo)\b/.test(p)) audiences.push('business professionals')
  if (/\b(student|learn|education|university|course|skill)\b/.test(p))  audiences.push('students & learners')
  if (/\b(parent|family|kid|child|home|household)\b/.test(p))           audiences.push('families')
  if (/\b(remote|distributed|team|collaborate|async|wfh)\b/.test(p))    audiences.push('remote teams')
  if (/\b(creator|influencer|content|youtube|tiktok|podcast)\b/.test(p)) audiences.push('content creators')
  if (/\b(design|creative|agency|brand|visual|art)\b/.test(p))          audiences.push('creative professionals')

  /* Season */
  let seasonTag: string | null = null
  if (/\bsummer\b/.test(p))              seasonTag = 'summer'
  else if (/\bspring\b/.test(p))         seasonTag = 'spring'
  else if (/\b(fall|autumn)\b/.test(p))  seasonTag = 'fall'
  else if (/\bwinter\b/.test(p))         seasonTag = 'winter'
  else if (/\bholiday\b/.test(p))        seasonTag = 'holiday season'
  else if (/\bchristmas\b/.test(p))      seasonTag = 'Christmas'
  else if (/\b(new year|nye)\b/.test(p)) seasonTag = 'New Year'

  /* Urgency */
  const urgency = /\b(limited|exclusive|urgent|now|hurry|last chance|ending soon|only)\b/.test(p)

  /* Core subject — rough extraction of the main noun phrase */
  const subjectMatch = prompt.match(/(?:about|for|on|showcase|promoting|featuring)\s+([^,.—–]+)/i)
  const subject = subjectMatch ? subjectMatch[1].trim() : prompt.slice(0, 60).trim()

  /* Design style signals */
  const designStyle: string[] = []
  if (/\b(futuristic|sci.fi|cyber|holographic|neon|digital|glitch|neural|particle)\b/.test(p))       designStyle.push('futuristic')
  if (/\b(premium|luxury|high.end|sophisticated|exclusive|upscale)\b/.test(p))                        designStyle.push('premium')
  if (/\b(minimal|clean|whitespace|simple|airy|stripped)\b/.test(p))                                  designStyle.push('minimal')
  if (/\b(bold|striking|high.contrast|vivid|vibrant|dynamic|impactful)\b/.test(p))                    designStyle.push('bold')
  if (/\b(glassmorphism|glass|frosted|translucent|blur panel)\b/.test(p))                             designStyle.push('glassmorphism')
  if (/\b(gradient|glow|ambient|luminous|radiant|electric|light trail)\b/.test(p))                    designStyle.push('gradient & glow')
  if (/\b(geometric|wireframe|grid|abstract|mesh|structure|node|network)\b/.test(p))                  designStyle.push('geometric / abstract')
  if (/\b(earthy|organic|natural|warm|textured|grain|rustic)\b/.test(p))                              designStyle.push('organic / earthy')
  if (/\b(poster|billboard|print|large.format|editorial|typographic)\b/.test(p))                      designStyle.push('editorial / poster')
  if (/\b(innovation|ai|intelligence|machine learning|deep learning|generative)\b/.test(p))           designStyle.push('AI / innovation')

  /* Explicit hex codes in prompt */
  const explicitHexes = [...new Set(prompt.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? [])].slice(0, 6)

  /* More content types for detailed briefs */
  if (contentType === 'social post') {
    if (/\b(poster|flyer|banner|billboard)\b/.test(p))              contentType = 'event poster'
    else if (/\b(brief|direction|spec|requirement)\b/.test(p))      contentType = 'creative brief'
    else if (/\b(ad|advertisement|paid|campaign|commercial)\b/.test(p)) contentType = 'ad campaign'
  }

  return { contentType, toneSignals, audiences, seasonTag, urgency, subject, designStyle, explicitHexes }
}

function generateBrief(config: ProductConfig, prompt: string, values: FormValues) {
  const insights      = analyzePrompt(prompt)
  const platform      = values.platform   || 'Instagram'
  const audience      = values.audience   || (insights.audiences[0] ?? 'general audience')
  const theme         = values.theme      ?? ''
  const imageCount    = values.imageCount || '1'
  const angle         = values.angle       ?? ''
  const emotion       = values.emotion     ?? ''
  const keyMessage    = values.keyMessage  ?? ''
  const cta           = values.cta         ?? ''
  const talkingPoints = values.talkingPoints ?? ''
  const imgNum        = parseInt(imageCount, 10) || 1
  const formatLabel   = imgNum === 1 ? 'Single image' : `${imgNum}-image carousel`

  // Smart title: short subject from prompt, not the raw prompt text
  const subjectRaw = insights.subject.trim()
  const subjectClean = (() => {
    if (!subjectRaw || subjectRaw.startsWith('#')) return null
    const s = subjectRaw.replace(/^(the |a |an )/i, '')
    return s.length > 55 ? s.slice(0, 55).trim() + '…' : s
  })()
  const title = subjectClean
    ? capitalize(subjectClean)
    : capitalize(insights.contentType)

  const setup: [string, string][] = [
    ['Content type', capitalize(insights.contentType)],
    ['Platform',     platform],
    ['Format',       formatLabel],
    ['Audience',     capitalize(audience)],
    ...(theme ? [['Theme', theme] as [string, string]] : []),
  ]

  const content: [string, string][] = [
    keyMessage    && ['Key message', keyMessage],
    angle         && ['Angle',       angle],
    emotion       && ['Feeling',     emotion],
    cta           && ['CTA',         cta],
    talkingPoints && ['Notes',       talkingPoints],
  ].filter(Boolean) as [string, string][]

  // Outline topics driven by the brief's subject
  const topicBase = subjectClean ?? insights.contentType
  const count = imgNum
  const TOPIC_POOL = [
    `${capitalize(topicBase)} — the hook and core idea`,
    'Why this matters: the problem it solves',
    'The key insight or unique angle',
    'Supporting evidence or proof points',
    'Real-world example or use case',
    'What this means for the audience',
    'The call to action — next steps',
    'Visual headline slide',
    'Key takeaway and closing thought',
    'Summary and follow-up prompt',
  ]
  const topics = Array.from({ length: count }, (_, i) =>
    TOPIC_POOL[i] ?? `Slide ${i + 1}: ${capitalize(topicBase)} — insight ${i + 1}`
  )

  // Synthesised summary prose — no raw prompt dumping
  const summaryParts: string[] = []
  summaryParts.push(
    `A ${formatLabel} ${insights.contentType} for ${platform}, targeted at ${audience}.`
  )
  if (insights.designStyle.length > 0 || insights.explicitHexes.length > 0) {
    const styleStr = insights.designStyle.slice(0, 2).join(' + ')
    const colorStr = insights.explicitHexes.length > 0
      ? `${insights.explicitHexes.length} specific color values defined`
      : ''
    const parts = [styleStr && `${styleStr} aesthetic`, colorStr].filter(Boolean).join(', ')
    summaryParts.push(`Visual direction: ${parts}.`)
  }
  if (insights.toneSignals.length > 0) {
    summaryParts.push(`Tone: ${insights.toneSignals.slice(0, 2).join(', ')}.`)
  }
  if (angle || emotion) {
    const parts = [angle && `${angle} angle`, emotion && `evoke ${emotion.toLowerCase()}`].filter(Boolean).join(', ')
    summaryParts.push(`Content approach: ${parts}.`)
  }
  if (keyMessage) summaryParts.push(`Key message: ${keyMessage}.`)
  if (cta)        summaryParts.push(`CTA: "${cta}".`)
  const summary = summaryParts.join(' ')

  return { title, setup, content, topics, summary }
}

/* ── Look & Feel constants ───────────────────────────────────────── */
const SPECTRUM_AXES = [
  { key: 'formality',  left: 'Formal',        right: 'Casual',       stops: ['Formal', 'Slightly formal', 'Neutral', 'Slightly casual', 'Casual'] },
  { key: 'humor',      left: 'Serious',        right: 'Funny',        stops: ['Serious', 'Mostly serious', 'Balanced', 'Light-hearted', 'Funny'] },
  { key: 'respect',    left: 'Respectful',     right: 'Irreverent',   stops: ['Respectful', 'Polite', 'Neutral', 'Edgy', 'Irreverent'] },
  { key: 'enthusiasm', left: 'Matter-of-fact', right: 'Enthusiastic', stops: ['Direct', 'Measured', 'Balanced', 'Energetic', 'Enthusiastic'] },
]
const TEXT_AMOUNT_OPTIONS = [
  { id: 'minimal',  label: 'Minimal',  desc: 'Short captions, hooks only.' },
  { id: 'concise',  label: 'Concise',  desc: 'Balanced, punchy copy.' },
  { id: 'detailed', label: 'Detailed', desc: 'Paragraph-style detail.' },
]

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

function LookAndFeelModal({
  selected, onSelect, onClose,
  spectrumValues, onSpectrumChange,
  textAmount, onTextAmountChange,
  wordsToAvoid, onWordsToAvoidChange,
  customInstruction, onCustomInstructionChange,
}: {
  selected: string
  onSelect: (theme: ThemeOption) => void
  onClose: () => void
  spectrumValues: Record<string, number>
  onSpectrumChange: (key: string, v: number) => void
  textAmount: string
  onTextAmountChange: (v: string) => void
  wordsToAvoid: string
  onWordsToAvoidChange: (v: string) => void
  customInstruction: string
  onCustomInstructionChange: (v: string) => void
}) {
  const { kits } = useBrandStore()
  const [tab, setTab] = useState<'system' | 'yours'>('system')
  const [autofillKit, setAutofillKit] = useState<string | null>(null)
  const brandThemes: ThemeOption[] = kits.flatMap(kit => makeBrandKitThemes(kit))

  function getKitForTheme(theme: ThemeOption) {
    if (theme.section !== 'brand') return null
    // ID format: brand-{kitId}-{variant}
    const match = theme.id.match(/^brand-(.+)-(?:primary|dark|minimal|light)$/)
    if (!match) return null
    return kits.find(k => k.id === match[1]) ?? null
  }

  function handleThemeSelect(theme: ThemeOption) {
    onSelect(theme)
    const kit = getKitForTheme(theme)
    if (!kit) { setAutofillKit(null); return }
    const tone = kit.tone
    if (tone?.textDensity) onTextAmountChange(tone.textDensity)
    if (tone?.avoid?.length) onWordsToAvoidChange(tone.avoid.slice(0, 6).join(', '))
    if (tone?.customInstruction) onCustomInstructionChange(tone.customInstruction)
    setAutofillKit(kit.name)
  }

  function ThemeCard({ theme }: { theme: ThemeOption }) {
    const isSelected = selected === theme.id
    return (
      <button
        className={`ac2-theme-card${isSelected ? ' selected' : ''}`}
        onClick={() => handleThemeSelect(theme)}
      >
        <ThemePreview colors={theme.colors} />
        <div className="ac2-theme-card-name">{theme.name}</div>
        {theme.sub && <div className="ac2-theme-card-sub">{theme.sub}</div>}
      </button>
    )
  }

  return (
    <div className="ac2-theme-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ac2-laf-modal">
        {/* Header */}
        <div className="ac2-theme-modal-header">
          <span className="ac2-theme-modal-title">Look &amp; Feel</span>
          <button className="ac2-theme-modal-close" onClick={onClose}><X size={13} /></button>
        </div>

        <div className="ac2-laf-body">
          {/* ── Left: Theme selection ── */}
          <div className="ac2-laf-left">
            <div className="ac2-laf-section-title">Theme</div>
            <div className="ac2-theme-tabs" style={{ padding: '0 0 12px', background: 'none', border: 'none' }}>
              <button className={`ac2-theme-tab${tab === 'system' ? ' active' : ''}`} onClick={() => setTab('system')}>System</button>
              <button className={`ac2-theme-tab${tab === 'yours' ? ' active' : ''}`} onClick={() => setTab('yours')}>Your themes</button>
            </div>

            <div className="ac2-laf-theme-scroll">
              {tab === 'system' && (
                <div className="ac2-theme-grid">
                  {SYSTEM_THEMES.map(t => <ThemeCard key={t.id} theme={t} />)}
                </div>
              )}
              {tab === 'yours' && (
                <>
                  <div className="ac2-theme-subsection">
                    <div className="ac2-theme-subsection-label">Standalone themes</div>
                    <div className="ac2-theme-grid">
                      {STANDALONE_THEMES.map(t => <ThemeCard key={t.id} theme={t} />)}
                    </div>
                  </div>
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
                    <p style={{ fontSize: 12, color: 'var(--t3)' }}>No brand kits yet.</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Right: Voice & Writing ── */}
          <div className="ac2-laf-right">

            {/* Brand tone autofill banner */}
            {autofillKit && (
              <div className="ac2-laf-autofill-banner">
                <div className="ac2-laf-autofill-banner-left">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  <span>Settings pre-filled from <strong>{autofillKit}</strong> brand tone</span>
                </div>
                <button className="ac2-laf-autofill-dismiss" onClick={() => setAutofillKit(null)}>✕</button>
              </div>
            )}

            {/* Amount of text */}
            <div className="ac2-laf-section-title">Amount of text</div>
            <div className="ac2-laf-text-grid">
              {TEXT_AMOUNT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`ac2-laf-text-card${textAmount === opt.id ? ' active' : ''}`}
                  onClick={() => onTextAmountChange(opt.id)}
                >
                  <div className="ac2-laf-text-label">{opt.label}</div>
                  <div className="ac2-laf-text-desc">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="ac2-laf-divider" />

            {/* Words to avoid */}
            <div className="ac2-laf-section-title">Words to avoid</div>
            <input
              className="ac2-laf-input"
              placeholder="e.g. leveraging, synergy, utilize…"
              value={wordsToAvoid}
              onChange={e => onWordsToAvoidChange(e.target.value)}
            />

            {/* Custom instruction */}
            <div className="ac2-laf-section-title" style={{ marginTop: 14 }}>Custom instruction</div>
            <textarea
              className="ac2-laf-input ac2-laf-textarea"
              placeholder="Describe the desired tone, personality, or style…"
              rows={3}
              value={customInstruction}
              onChange={e => onCustomInstructionChange(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="ac2-laf-footer">
          <button className="ac2-laf-apply" onClick={onClose}>Apply changes</button>
        </div>
      </div>
    </div>
  )
}

/* ── Sequential question cards ──────────────────────────────────── */
function AnsweredBlock({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="ac2-user-bubble-row">
      <div className="ac2-user-bubble ac2-user-bubble--answers">
        {items.map(({ question, answer }) => (
          <div key={question} className="ac2-answer-qa">
            <div className="ac2-answer-q"><span className="ac2-answer-prefix">Q:</span> {question}</div>
            <div className="ac2-answer-a"><span className="ac2-answer-prefix">A:</span> {answer}</div>
          </div>
        ))}
      </div>
      <div className="ac2-user-av"><span>TH</span></div>
    </div>
  )
}

/* ── UserReply — single answer bubble ────────────────────────────── */
function UserReply({ answer }: { answer: string }) {
  if (!answer) return null
  return (
    <div className="ac2-user-bubble-row">
      <div className="ac2-user-bubble">{answer}</div>
      <div className="ac2-user-av"><span>TH</span></div>
    </div>
  )
}

/* ── QAQuestion type ─────────────────────────────────────────────── */
interface QAQuestion {
  key: string
  message: string
  type: 'chips' | 'text' | 'textarea'
  chips?: string[]
  ratios?: Record<string, string>
  placeholder?: string
  optional?: boolean
}

/* ── BottomAnswerCard — floating answer UI at bottom of screen ───── */
function BottomAnswerCard({
  question,
  stepCurrent,
  stepTotal,
  config,
  onAnswer,
  showNote,
}: {
  question: QAQuestion
  stepCurrent: number
  stepTotal: number
  config: ProductConfig
  onAnswer: (answer: string) => void
  showNote?: boolean
}) {
  const [selected, setSelected] = useState('')
  const [text, setText] = useState('')
  const [note, setNote] = useState('')

  const canSubmit = question.type === 'chips'
    ? !!selected
    : text.trim().length > 0 || !!question.optional

  function submit() {
    if (question.type === 'chips') {
      if (!selected) return
      onAnswer(note.trim() ? `${selected} — ${note.trim()}` : selected)
    } else {
      onAnswer(text.trim())
    }
  }

  return (
    <div className="ac2-bac" style={{ '--bac-color': config.color } as React.CSSProperties}>
      {/* Header */}
      <div className="ac2-bac-header">
        <span className="ac2-bac-q">{question.message}</span>
        <div className="ac2-bac-nav">
          <span className="ac2-bac-step">{stepCurrent} of {stepTotal}</span>
          <X size={14} className="ac2-bac-close" onClick={() => onAnswer('')} style={{ cursor: 'pointer', color: 'var(--t3)' }} />
        </div>
      </div>

      {/* Body */}
      <div className="ac2-bac-body">
        {question.type === 'chips' && (
          <div className="ac2-bac-options">
            {question.chips!.map(chip => {
              const active = selected === chip
              return (
                <button
                  key={chip}
                  className={`ac2-bac-option${active ? ' selected' : ''}`}
                  onClick={() => setSelected(chip)}
                >
                  <span className="ac2-bac-checkbox">{active && <Check size={10} strokeWidth={3} />}</span>
                  <span className="ac2-bac-option-label">{chip}</span>
                  {question.ratios?.[chip] && (
                    <span className="ac2-bac-option-sub">{question.ratios[chip]}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Optional note field — always shown when showNote=true */}
        {showNote && question.type === 'chips' && (
          <div className="ac2-bac-note-wrap">
            <input
              className="ac2-bac-note-input"
              placeholder="Any additional instructions? (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
            />
          </div>
        )}

        {(question.type === 'text' || question.type === 'textarea') && (
          question.type === 'textarea' ? (
            <textarea
              className="ac2-bac-input"
              placeholder={question.placeholder}
              value={text}
              rows={3}
              onChange={e => setText(e.target.value)}
              style={{ resize: 'none' }}
              autoFocus
            />
          ) : (
            <input
              className="ac2-bac-input"
              placeholder={question.placeholder}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
              autoFocus
            />
          )
        )}
      </div>

      {/* Footer */}
      <div className="ac2-bac-footer">
        <span className="ac2-bac-count">
          {question.type === 'chips'
            ? selected ? '1 selected' : '0 selected'
            : text.trim() ? `${text.trim().length} chars` : question.optional ? 'optional' : ''}
        </span>
        <div className="ac2-bac-actions">
          {question.optional && (
            <button className="ac2-bac-skip" onClick={() => onAnswer('')}>Skip</button>
          )}
          <button
            className="ac2-bac-next"
            disabled={!canSubmit}
            onClick={submit}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── BottomQuestionPanel ─────────────────────────────────────────── */
function BottomQuestionPanel({
  step,
  config,
  initialTheme,
  initialTone,
  formPlatform,
  formImageCount,
  onStep1Confirm,
  onStep2Confirm,
}: {
  step: 1 | 2
  config: ProductConfig
  initialTheme?: ThemeOption | null
  initialTone?: string | null
  formPlatform?: string
  formImageCount?: string
  onStep1Confirm: (platform: string, count: string) => void
  onStep2Confirm: (values: FormValues) => void
}) {
  const platformTurn = config.agentScript.find(t => t.message.toLowerCase().includes('platform'))

  /* Step 1 state */
  const [platform, setPlatform] = useState(platformTurn?.chips?.[0] ?? '')
  const [count, setCount] = useState('1')

  /* Step 2 state */
  const [values, setValues] = useState<FormValues>(() => ({
    platform: formPlatform ?? '',
    ...(initialTone ? { tone: initialTone } : {}),
  }))
  const [angle, setAngle]     = useState('')
  const [emotion, setEmotion] = useState('')
  const [keyMessage, setKeyMessage] = useState('')
  const [cta, setCta]         = useState('')
  const [talkingPoints, setTalkingPoints] = useState('')

  const imgNum = parseInt(formImageCount ?? '1', 10) || 1
  const derivedFormat = imgNum === 1 ? 'Single Image' : 'Carousel'

  function set(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  function toggle<T extends string>(current: T, val: T, setter: (v: T) => void) {
    setter(current === val ? '' as T : val)
  }

  function PillRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
    return (
      <div className="ac2-pill-group">
        {options.map(opt => {
          const active = value === opt
          return (
            <button
              key={opt}
              className={`ac2-pill${active ? ' active' : ''}`}
              style={active ? { '--pc': config.color } as React.CSSProperties : undefined}
              onClick={() => toggle(value, opt, onChange)}
            >
              {active && <Check size={11} strokeWidth={3} />}
              {opt}
            </button>
          )
        })}
      </div>
    )
  }

  const title = step === 1 ? 'Post setup' : 'Campaign details'
  const btnLabel = step === 1 ? 'Next' : 'Confirm'

  function handleConfirm() {
    if (step === 1) {
      onStep1Confirm(platform, count)
    } else {
      onStep2Confirm({
        ...values,
        format: derivedFormat,
        imageCount: formImageCount ?? '1',
        angle,
        emotion,
        keyMessage,
        cta,
        talkingPoints,
        theme: initialTheme?.name ?? '',
      })
    }
  }

  function handleDecideForMe() {
    if (step === 1) {
      const defaultPlatform = platformTurn?.chips?.[0] ?? 'Instagram'
      onStep1Confirm(defaultPlatform, '1')
    } else {
      onStep2Confirm({
        ...values,
        format: 'Single Image',
        imageCount: formImageCount ?? '1',
        angle: 'Educational',
        emotion: 'Inspired',
        keyMessage: keyMessage || '',
        cta: cta || '',
        talkingPoints: talkingPoints || '',
        theme: initialTheme?.name ?? '',
      })
    }
  }

  return (
    <div className="ac2-bottom-panel">
      <div className="ac2-bottom-panel-header">
        <div className="ac2-bottom-panel-title">{title}</div>
        <div className="ac2-bottom-panel-meta">
          <span className="ac2-bottom-panel-step">{step} of 2</span>
          <button className="ac2-bottom-panel-close" onClick={handleConfirm}>
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="ac2-bottom-panel-body">
        {step === 1 && (
          <>
            {platformTurn && (
              <div className="ac2-bp-block">
                <div className="ac2-bp-question">Which platform are you targeting?</div>
                <div className="ac2-pill-group">
                  {platformTurn.chips!.map(opt => {
                    const active = platform === opt
                    return (
                      <button
                        key={opt}
                        className={`ac2-pill ac2-pill--ratio${active ? ' active' : ''}`}
                        style={active ? { '--pc': config.color } as React.CSSProperties : undefined}
                        onClick={() => setPlatform(opt)}
                      >
                        <span className="ac2-pill-main">
                          {active && <Check size={11} strokeWidth={3} />}
                          {opt}
                        </span>
                        <span className="ac2-pill-ratio">{PLATFORM_RATIOS[opt]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="ac2-bp-block">
              <div className="ac2-bp-question">How many images in this post?</div>
              <input
                className="ac2-form-text ac2-form-text--compact"
                type="number" min={1} max={30}
                value={count}
                onChange={e => setCount(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="ac2-bp-block">
              <div className="ac2-bp-question">Who's your target audience?</div>
              <input
                className="ac2-form-text"
                placeholder="e.g. CS students, software engineers…"
                value={values.audience ?? ''}
                onChange={e => set('audience', e.target.value)}
              />
            </div>
            <div className="ac2-bp-block">
              <div className="ac2-bp-question">What's the key message or hook?</div>
              <input
                className="ac2-form-text"
                placeholder="e.g. Limited summer offer, only 48 hours…"
                value={keyMessage}
                onChange={e => setKeyMessage(e.target.value)}
              />
            </div>
            <div className="ac2-bp-block">
              <div className="ac2-bp-question">What content angle are you going for?</div>
              <PillRow options={CONTENT_ANGLES} value={angle} onChange={setAngle} />
            </div>
            <div className="ac2-bp-block">
              <div className="ac2-bp-question">How should the audience feel?</div>
              <PillRow options={CONTENT_EMOTIONS} value={emotion} onChange={setEmotion} />
            </div>
            <div className="ac2-bp-block">
              <div className="ac2-bp-question">Any call-to-action in mind?</div>
              <input
                className="ac2-form-text"
                placeholder="e.g. Shop now, Learn more, Book a demo…"
                value={cta}
                onChange={e => setCta(e.target.value)}
              />
            </div>
            <div className="ac2-bp-block">
              <div className="ac2-bp-question">
                Anything specific to mention? <span className="ac2-qna-optional">(optional)</span>
              </div>
              <textarea
                className="ac2-form-text"
                placeholder="Key stats, product features, offers, hashtags…"
                rows={3}
                value={talkingPoints}
                onChange={e => setTalkingPoints(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>
          </>
        )}
      </div>

      <div className="ac2-bottom-panel-footer">
        <button
          className="ac2-bp-next"
          style={{ background: config.color, color: '#0a0a0a' }}
          onClick={handleConfirm}
        >
          {btnLabel}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}


function PlatformAndImageCard({
  config,
  onConfirm,
}: {
  config: ProductConfig
  onConfirm: (platform: string, imageCount: string) => void
}) {
  const platformTurn = config.agentScript.find(t => t.message.toLowerCase().includes('platform'))
  const [platform, setPlatform] = useState(platformTurn?.chips?.[0] ?? '')
  const [count, setCount]       = useState('1')

  return (
    <div className="ac2-card ac2-qna-card">
      {platformTurn && (
        <div className="ac2-qna-block">
          <div className="ac2-qna-question">Which platform are you targeting?</div>
          <div className="ac2-pill-group">
            {platformTurn.chips!.map(opt => {
              const active = platform === opt
              return (
                <button
                  key={opt}
                  className={`ac2-pill ac2-pill--ratio${active ? ' active' : ''}`}
                  style={active ? { '--pc': config.color } as React.CSSProperties : undefined}
                  onClick={() => setPlatform(opt)}
                >
                  <span className="ac2-pill-main">
                    {active && <Check size={11} strokeWidth={3} />}
                    {opt}
                  </span>
                  <span className="ac2-pill-ratio">{PLATFORM_RATIOS[opt]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="ac2-qna-block">
        <div className="ac2-qna-question">How many images in this post?</div>
        <input
          className="ac2-form-text ac2-form-text--compact"
          type="number" min={1} max={30}
          value={count}
          onChange={e => setCount(e.target.value)}
        />
      </div>

      <button
        className="ac2-confirm-btn"
        style={{  }}
        onClick={() => onConfirm(platform, count)}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  )
}

/* ── Confirm message helper ──────────────────────────────────────── */
const PALETTE_GROUPS: Array<{ label: string; keywords: string[] }> = [
  { label: 'warm / red-orange',  keywords: ['red', 'warm', 'orange', 'coral', 'rust', 'terracotta', 'sunset', 'fire', 'amber'] },
  { label: 'cool / blue',        keywords: ['blue', 'cool', 'ocean', 'sky', 'navy', 'azure', 'cobalt', 'teal', 'cyan', 'icy', 'electric blue', 'midnight'] },
  { label: 'green / nature',     keywords: ['green', 'forest', 'emerald', 'sage', 'olive', 'mint', 'nature', 'earthy'] },
  { label: 'purple / violet',    keywords: ['purple', 'violet', 'lavender', 'indigo', 'mauve', 'lilac'] },
  { label: 'yellow / gold',      keywords: ['yellow', 'gold', 'golden', 'mustard', 'sunny'] },
  { label: 'pink / rose',        keywords: ['pink', 'rose', 'blush', 'magenta'] },
  { label: 'dark / moody',       keywords: ['dark', 'moody', 'night', 'noir', 'black', 'deep', 'shadow', 'bold', 'midnight', 'deep navy', 'slate'] },
  { label: 'light / minimal',    keywords: ['light', 'white', 'minimal', 'clean', 'bright', 'airy', 'soft', 'neutral'] },
  { label: 'futuristic / tech',  keywords: ['futuristic', 'neon', 'cyber', 'holographic', 'electric', 'sci-fi', 'digital', 'particle', 'neural', 'glitch', 'data grid', 'wireframe', 'ai-inspired'] },
]

const CONTRADICTIONS: Array<[string, string]> = [
  ['warm / red-orange',  'cool / blue'],
  ['warm / red-orange',  'futuristic / tech'],
  ['dark / moody',       'light / minimal'],
  ['green / nature',     'dark / moody'],
  ['green / nature',     'futuristic / tech'],
  ['purple / violet',    'warm / red-orange'],
  ['yellow / gold',      'cool / blue'],
  ['light / minimal',    'futuristic / tech'],
]

function matchPalettes(text: string): string[] {
  return PALETTE_GROUPS.filter(g => g.keywords.some(k => text.includes(k))).map(g => g.label)
}

function hexToHsl(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  let r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function palettesFromColors(colors: string[]): string[] {
  const [bg, , accent] = colors
  const result: string[] = []
  const bgHsl = bg ? hexToHsl(bg) : null
  if (bgHsl) {
    if (bgHsl[2] < 0.15) result.push('dark / moody')
    else if (bgHsl[2] > 0.75) result.push('light / minimal')
  }
  const acHsl = accent ? hexToHsl(accent) : null
  if (acHsl && acHsl[1] > 0.3) {
    const h = acHsl[0]
    if (h < 30 || h >= 330) result.push('warm / red-orange')
    else if (h < 60)  result.push('warm / red-orange')
    else if (h < 80)  result.push('yellow / gold')
    else if (h < 160) result.push('green / nature')
    else if (h < 260) result.push('cool / blue')
    else if (h < 300) result.push('purple / violet')
    else              result.push('pink / rose')
  }
  return result
}

interface ThemeConflict {
  promptDir: string
  themeDir:  string
  soft:      boolean
}

function detectThemeConflict(userPrompt: string, theme: ThemeOption | null): ThemeConflict | null {
  if (!theme) return null
  const p = userPrompt.toLowerCase()
  const namePalettes = matchPalettes(theme.name.toLowerCase())
  const themePalettes = namePalettes.length > 0 ? namePalettes : palettesFromColors(theme.colors)

  // Derive palette labels from prompt text + any explicit hex codes in the prompt
  const promptPalettes = matchPalettes(p)
  const promptHexes = userPrompt.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) ?? []
  for (const hex of promptHexes.slice(0, 10)) {
    for (const label of palettesFromColors([hex, '', hex])) {
      if (!promptPalettes.includes(label)) promptPalettes.push(label)
    }
  }

  for (const [a, b] of CONTRADICTIONS) {
    const promptA = promptPalettes.includes(a), promptB = promptPalettes.includes(b)
    const themeA  = themePalettes.includes(a),  themeB  = themePalettes.includes(b)
    if ((promptA && themeB) || (promptB && themeA)) {
      return { promptDir: promptA ? a : b, themeDir: themeA ? a : b, soft: false }
    }
  }

  if (promptPalettes.length > 0 && themePalettes.length > 0 && !promptPalettes.some(l => themePalettes.includes(l))) {
    return { promptDir: promptPalettes[0], themeDir: themePalettes[0], soft: true }
  }

  return null
}

/* ── DirectionConfirmCard ────────────────────────────────────────── */
function DirectionConfirmCard({
  platform,
  imageCount,
  theme,
  conflict,
  config,
  onConfirm,
  onChangeTheme,
}: {
  platform:      string
  imageCount:    string
  theme:         ThemeOption | null
  conflict:      ThemeConflict | null
  config:        ProductConfig
  onConfirm:     (choice: string) => void
  onChangeTheme: (t: ThemeOption) => void
}) {
  const [showThemePicker, setShowThemePicker] = useState(false)
  const { kits } = useBrandStore()
  const brandThemes: ThemeOption[] = kits.flatMap(kit => makeBrandKitThemes(kit))

  const count  = parseInt(imageCount, 10) || 1
  const format = count === 1 ? 'single image' : `${count}-image carousel`
  const ratio  = PLATFORM_RATIOS[platform] ?? ''

  const intro = conflict
    ? (conflict.soft
        ? `One thing to double-check — your prompt feels ${conflict.promptDir}, but the "${theme?.name}" theme runs ${conflict.themeDir}. That tension might actually work, or it might not. Which direction should lead?`
        : `I want to flag something before we go further. Your prompt is pulling toward ${conflict.promptDir}, but "${theme?.name}" is firmly ${conflict.themeDir} — these are genuinely at odds. Which one should I follow?`)
    : `Here's the setup I've got so far. Does this feel right?`

  const allThemes = [...SYSTEM_THEMES, ...brandThemes]

  return (
    <div className="ac2-dir-card">
      <div className="ac2-agent-row">
        <div className="ac2-agent-av">AI</div>
        <div className="ac2-agent-bubble">{intro}</div>
      </div>

      <div className="ac2-dir-summary">
        <div className="ac2-dir-row">
          <span className="ac2-dir-key">Format</span>
          <span className="ac2-dir-val">{platform} · {format}{ratio ? ` (${ratio})` : ''}</span>
        </div>

        <div className="ac2-dir-row ac2-dir-row--theme">
          <span className="ac2-dir-key">Theme</span>
          {theme ? (
            <div className="ac2-dir-theme-block">
              <div className="ac2-dir-theme-preview-lg">
                <ThemePreview colors={theme.colors} />
              </div>
              <div className="ac2-dir-theme-meta">
                <span className="ac2-dir-val">{theme.name}</span>
                <button
                  className="ac2-dir-change-theme"
                  onClick={() => setShowThemePicker(v => !v)}
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div className="ac2-dir-theme-block">
              <span className="ac2-dir-val ac2-dir-val--muted">None — style-neutral</span>
              <button
                className="ac2-dir-change-theme"
                onClick={() => setShowThemePicker(v => !v)}
              >
                Pick a theme
              </button>
            </div>
          )}
        </div>

        {showThemePicker && (
          <div className="ac2-dir-theme-picker">
            {allThemes.map(t => (
              <button
                key={t.id}
                className={`ac2-dir-theme-opt${theme?.id === t.id ? ' selected' : ''}`}
                onClick={() => { onChangeTheme(t); setShowThemePicker(false) }}
              >
                <ThemePreview colors={t.colors} />
                <span className="ac2-dir-theme-opt-name">{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ac2-dir-chips">
        {conflict ? (
          <>
            <button
              className="ac2-pill active"
              style={{ '--pc': config.color } as React.CSSProperties}
              onClick={() => onConfirm(`Keep "${theme?.name}" theme`)}
            >
              <Check size={11} strokeWidth={3} />
              Keep &ldquo;{theme?.name}&rdquo; theme
            </button>
            <button className="ac2-pill" onClick={() => onConfirm(`Follow prompt (${conflict.promptDir})`)}>
              Follow my prompt
            </button>
          </>
        ) : (
          <button
            className="ac2-pill active"
            style={{ '--pc': config.color } as React.CSSProperties}
            onClick={() => onConfirm('Looks good!')}
          >
            <Check size={11} strokeWidth={3} />
            Looks good
          </button>
        )}
      </div>
    </div>
  )
}

/* ── CampaignDetailsCard ─────────────────────────────────────────── */
const PLATFORM_RATIOS: Record<string, string> = {
  'Instagram':    '1:1 · 9:16',
  'LinkedIn':     '1.91:1',
  'X (Twitter)':  '16:9',
  'All Platforms':'Multiple',
}

const CONTENT_ANGLES  = ['Educational', 'Inspirational', 'Promotional', 'Behind the scenes', 'Story-driven']
const CONTENT_EMOTIONS = ['Excited', 'Inspired', 'Curious', 'Entertained', 'Informed']

function CampaignDetailsCard({
  config, onConfirm, initialTheme, initialTone, initialPlatform, initialImageCount,
}: {
  config: ProductConfig
  onConfirm: (values: FormValues) => void
  initialTheme?: ThemeOption | null
  initialTone?: string | null
  initialPlatform?: string
  initialImageCount?: string
}) {
  const [values, setValues]   = useState<FormValues>(() => ({
    platform: initialPlatform ?? '',
    ...(initialTone ? { tone: initialTone } : {}),
  }))
  const [imageCount] = useState(initialImageCount ?? '1')
  const [angle, setAngle]     = useState('')
  const [emotion, setEmotion] = useState('')
  const [keyMessage, setKeyMessage] = useState('')
  const [cta, setCta]         = useState('')
  const [talkingPoints, setTalkingPoints] = useState('')
  const selectedTheme = initialTheme ?? null

  function set(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  function toggle<T extends string>(current: T, val: T, setter: (v: T) => void) {
    setter(current === val ? '' as T : val)
  }

  const imgNum = parseInt(imageCount, 10) || 1
  const derivedFormat = imgNum === 1 ? 'Single Image' : 'Carousel'

  function PillRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
    return (
      <div className="ac2-pill-group">
        {options.map(opt => {
          const active = value === opt
          return (
            <button
              key={opt}
              className={`ac2-pill${active ? ' active' : ''}`}
              style={active ? { '--pc': config.color } as React.CSSProperties : undefined}
              onClick={() => toggle(value, opt, onChange)}
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
    <div className="ac2-card ac2-qna-card">

      {/* Target audience */}
      <div className="ac2-qna-block">
        <div className="ac2-qna-question">Who's your target audience?</div>
        <input
          className="ac2-form-text"
          placeholder="e.g. CS students, software engineers…"
          value={values.audience ?? ''}
          onChange={e => set('audience', e.target.value)}
        />
      </div>

      {/* Key message */}
      <div className="ac2-qna-block">
        <div className="ac2-qna-question">What's the key message or hook?</div>
        <input
          className="ac2-form-text"
          placeholder="e.g. Limited summer offer, only 48 hours…"
          value={keyMessage}
          onChange={e => setKeyMessage(e.target.value)}
        />
      </div>

      {/* Content angle */}
      <div className="ac2-qna-block">
        <div className="ac2-qna-question">What content angle are you going for?</div>
        <PillRow options={CONTENT_ANGLES} value={angle} onChange={setAngle} />
      </div>

      {/* Desired feeling */}
      <div className="ac2-qna-block">
        <div className="ac2-qna-question">How should the audience feel?</div>
        <PillRow options={CONTENT_EMOTIONS} value={emotion} onChange={setEmotion} />
      </div>

      {/* CTA */}
      <div className="ac2-qna-block">
        <div className="ac2-qna-question">Any call-to-action in mind?</div>
        <input
          className="ac2-form-text"
          placeholder="e.g. Shop now, Learn more, Book a demo…"
          value={cta}
          onChange={e => setCta(e.target.value)}
        />
      </div>

      {/* Talking points */}
      <div className="ac2-qna-block">
        <div className="ac2-qna-question">Anything specific to mention? <span className="ac2-qna-optional">(optional)</span></div>
        <textarea
          className="ac2-form-text"
          placeholder="Key stats, product features, offers, hashtags…"
          rows={3}
          value={talkingPoints}
          onChange={e => setTalkingPoints(e.target.value)}
          style={{ resize: 'none' }}
        />
      </div>

      <button
        className="ac2-confirm-btn"
        style={{  }}
        onClick={() => onConfirm({
          ...values,
          format: derivedFormat,
          imageCount,
          angle,
          emotion,
          keyMessage,
          cta,
          talkingPoints,
          theme: selectedTheme?.name ?? '',
        })}
      >
        Confirm
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

/* ── BriefCard ───────────────────────────────────────────────────── */
function BriefCard({
  brief, config, onApprove, onRequestChange,
}: {
  brief: ReturnType<typeof generateBrief>
  config: ProductConfig
  onApprove: () => void
  onRequestChange: (text: string) => void
}) {
  const [change, setChange] = useState('')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 500)
    return () => clearTimeout(t)
  }, [])

  function handleChangeSubmit() {
    const text = change.trim()
    if (!text) return
    setChange('')
    onRequestChange(text)
  }

  const INLINE_KEYS = new Set(['Angle', 'Feeling'])
  const sections = [
    brief.setup.length > 0 && 'setup',
    brief.content.length > 0 && 'content',
    'summary',
  ].filter(Boolean) as string[]

  return (
    <div className={`ac2-card ac2-brief-card${revealed ? ' ac2-brief-card--revealed' : ''}`}>

      {/* Animated top shine bar */}
      <div className="ac2-brief-shine" />

      {/* Header */}
      <div className="ac2-brief-header">
        <div className="ac2-brief-label-row">
          <svg className="ac2-brief-sparkle" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          <span className="ac2-brief-label">Requirement Summary</span>
        </div>
        <div className="ac2-brief-title">{brief.title}</div>
      </div>


      {/* Skeleton while loading */}
      {!revealed && (
        <div className="ac2-brief-skeleton">
          {[100, 68, 84, 52, 90, 75].map((w, i) => (
            <div key={i} className="ac2-brief-skel-row" style={{ width: `${w}%`, animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
      )}

      {/* Sections revealed with stagger */}
      {revealed && (
        <>
          {brief.setup.length > 0 && (
            <div className="ac2-brief-section ac2-brief-section--anim" style={{ '--bd': `${sections.indexOf('setup') * 90}ms` } as React.CSSProperties}>
              <div className="ac2-brief-section-label">Post format</div>
              <div className="ac2-brief-meta">
                {brief.setup.map(([k, v]) => (
                  <div key={k} className="ac2-brief-row">
                    <span className="ac2-brief-key">{k}</span>
                    <span className="ac2-brief-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {brief.content.length > 0 && (
            <div className="ac2-brief-section ac2-brief-section--anim" style={{ '--bd': `${sections.indexOf('content') * 90}ms` } as React.CSSProperties}>
              <div className="ac2-brief-section-label">Content direction</div>
              <div className="ac2-brief-content">
                {brief.content.filter(([k]) => !INLINE_KEYS.has(k)).map(([k, v]) => (
                  <div key={k} className="ac2-brief-content-block">
                    <div className="ac2-brief-content-key">{k}</div>
                    <div className="ac2-brief-content-val">{v}</div>
                  </div>
                ))}
                {brief.content.some(([k]) => INLINE_KEYS.has(k)) && (
                  <div className="ac2-brief-chips-row">
                    {brief.content.filter(([k]) => INLINE_KEYS.has(k)).map(([k, v]) => (
                      <div key={k} className="ac2-brief-chip-group">
                        <span className="ac2-brief-chip-label">{k}</span>
                        <span className="ac2-brief-chip">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="ac2-brief-section ac2-brief-section--anim" style={{ '--bd': `${sections.indexOf('summary') * 90}ms` } as React.CSSProperties}>
            <div className="ac2-brief-section-label">Content summary</div>
            <p className="ac2-brief-summary">{brief.summary}</p>
          </div>

          <div className="ac2-ready-box ac2-ready-box--anim">
            <div className="ac2-ready-title">Ready to generate</div>
            <p className="ac2-ready-sub">Approve the brief above, or describe what to change.</p>
            <button
              className="ac2-generate-btn"
              style={{  }}
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
                onKeyDown={e => e.key === 'Enter' && handleChangeSubmit()}
              />
              <button
                className="ac2-change-send"
                disabled={!change.trim()}
                onClick={handleChangeSubmit}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ── SidebarBriefCard ────────────────────────────────────────────── */
function SidebarBriefCard({
  brief, updated = false, theme = null,
}: {
  brief: ReturnType<typeof generateBrief>
  updated?: boolean
  theme?: ThemeOption | null
}) {
  const INLINE_KEYS = new Set(['Angle', 'Feeling'])
  return (
    <div className="ac2-card ac2-brief-card ac2-brief-card--revealed ac2-brief-card--sidebar">
      <div className="ac2-brief-shine" />

      {updated && (
        <div className="ac2-brief-updated-badge">
          <Check size={10} strokeWidth={3} /> Brief updated
        </div>
      )}

      <div className="ac2-brief-header">
        <div className="ac2-brief-label-row">
          <svg className="ac2-brief-sparkle" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          <span className="ac2-brief-label">Requirement Summary</span>
        </div>
        <div className="ac2-brief-title">{brief.title}</div>
      </div>

      {(brief.setup.length > 0 || theme) && (
        <div className="ac2-brief-section">
          <div className="ac2-brief-section-label">Post format</div>
          {theme && (
            <div className="ac2-brief-theme-row">
              <div className="ac2-brief-theme-swatch" style={{ background: theme.colors[0] }}>
                <div style={{ background: theme.colors[2] ?? theme.colors[1], height: 3, width: '55%', borderRadius: 1, marginBottom: 2, opacity: .9 }} />
                <div style={{ background: theme.colors[1], height: 2, width: '75%', borderRadius: 1, opacity: .5 }} />
                <div style={{ background: theme.colors[1], height: 2, width: '60%', borderRadius: 1, opacity: .35 }} />
              </div>
              <div className="ac2-brief-theme-info">
                <span className="ac2-brief-key">Theme</span>
                <span className="ac2-brief-val">{theme.name}</span>
              </div>
            </div>
          )}
          <div className="ac2-brief-meta">
            {brief.setup.map(([k, v]) => (
              <div key={k} className="ac2-brief-row">
                <span className="ac2-brief-key">{k}</span>
                <span className="ac2-brief-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {brief.content.length > 0 && (
        <div className="ac2-brief-section">
          <div className="ac2-brief-section-label">Content direction</div>
          <div className="ac2-brief-content">
            {brief.content.filter(([k]) => !INLINE_KEYS.has(k)).map(([k, v]) => (
              <div key={k} className="ac2-brief-content-block">
                <div className="ac2-brief-content-key">{k}</div>
                <div className="ac2-brief-content-val">{v}</div>
              </div>
            ))}
            {brief.content.some(([k]) => INLINE_KEYS.has(k)) && (
              <div className="ac2-brief-chips-row">
                {brief.content.filter(([k]) => INLINE_KEYS.has(k)).map(([k, v]) => (
                  <div key={k} className="ac2-brief-chip-group">
                    <span className="ac2-brief-chip-label">{k}</span>
                    <span className="ac2-brief-chip">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
  brief, config, formValues, userPrompt, onBack, initialTheme,
}: {
  brief: ReturnType<typeof generateBrief>
  config: ProductConfig
  formValues: FormValues
  userPrompt: string
  onBack: () => void
  initialTheme?: ThemeOption | null
}) {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostOutline[]>(() => generateOutline(brief))
  const [chatInput, setChatInput] = useState('')
  const [showJson, setShowJson] = useState(false)
  const [genPhase, setGenPhase] = useState<'idle' | 'rewriting' | 'rewrite-done' | 'confirming' | 'brief-updating' | 'brief-updated'>('idle')
  const [chatLabel, setChatLabel] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant' | 'status'; text: string }>>([])
  const [liveBrief, setLiveBrief] = useState(brief)
  const sidebarThreadRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Setup card state
  const PLATFORMS = ['Instagram', 'LinkedIn', 'X (Twitter)', 'All Platforms']
  const [setupTheme, setSetupTheme] = useState<ThemeOption | null>(() => {
    // Prefer the full ThemeOption passed from PromptScreen; fall back to name lookup
    if (initialTheme) return initialTheme
    const themeName = formValues.theme ?? ''
    if (!themeName) return null
    return [...SYSTEM_THEMES, ...STANDALONE_THEMES].find(t => t.name === themeName) ?? null
  })
  const [showLookAndFeel, setShowLookAndFeel] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(formValues.platform ?? 'Instagram')
  const [platformPickerOpen, setPlatformPickerOpen] = useState(false)
  const [spectrumValues, setSpectrumValues] = useState<Record<string, number>>({})
  const [textAmount, setTextAmount] = useState('concise')
  const [wordsToAvoid, setWordsToAvoid] = useState('')
  const [customInstruction, setCustomInstruction] = useState('')

  const tone  = formValues.tone ?? 'Auto'
  const count = formValues.count ?? `${posts.length} posts`
  const theme = formValues.theme ?? 'No theme selected'

  function triggerBriefUpdate(changeDesc: string) {
    setChatMessages(prev => [...prev, { role: 'status', text: changeDesc }])
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


          {/* Generation confirmation */}
          {genPhase === 'confirming' && !chatLabel && (
            <div className="oe-ready-block">
              <div className="oe-ready-msg">
                <Check size={11} strokeWidth={3} />
                Your outline looks great! Ready to generate.
              </div>
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
            </div>
          )}

          {/* Chat history after initial confirmation */}
          {chatMessages.map((msg, i) => (
            msg.role === 'user'
              ? <div key={i} className="oe-user-bubble">{msg.text}</div>
              : msg.role === 'status'
                ? (
                  <div key={i} className="oe-status-row">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    <span className="oe-status-name">{msg.text}</span>
                    <span className="oe-tool-done"><Check size={10} strokeWidth={3} /></span>
                  </div>
                )
                : <div key={i} className="oe-agent-bubble">{msg.text}</div>
          ))}

          {/* Brief updating animation */}
          {(genPhase === 'brief-updating' || genPhase === 'brief-updated') && (
            <div className="oe-tool-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span className="oe-tool-name">update_brief</span>
              {genPhase === 'brief-updating'
                ? <span className="ac2-tool-running"><span /><span /><span /></span>
                : <span className="oe-tool-done"><Check size={10} strokeWidth={3} /></span>
              }
            </div>
          )}

          {/* Ready message + actions after brief update */}
          {genPhase === 'brief-updated' && (
            <div className="oe-ready-block">
              <div className="oe-ready-msg">
                <Check size={11} strokeWidth={3} />
                Brief updated. Ready to generate.
              </div>
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
            </div>
          )}

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
              style={{  }}
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
          {/* Look & Feel */}
          <button className="oe-setup-card oe-setup-card--btn" onClick={() => setShowLookAndFeel(true)}>
            <div className="oe-setup-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            </div>
            <div className="oe-setup-card-body">
              <div className="oe-setup-card-title">Look &amp; Feel</div>
              {setupTheme ? (
                <div className="oe-setup-theme-preview">
                  <div className="oe-setup-theme-swatch" style={{ background: setupTheme.colors[0] }}>
                    <div style={{ background: setupTheme.colors[2] ?? setupTheme.colors[1], height: 3, width: '55%', borderRadius: 1, marginBottom: 2, opacity: .9 }} />
                    <div style={{ background: setupTheme.colors[1], height: 2, width: '75%', borderRadius: 1, opacity: .5 }} />
                    <div style={{ background: setupTheme.colors[1], height: 2, width: '60%', borderRadius: 1, opacity: .35 }} />
                  </div>
                  <span className="oe-setup-card-sub">
                    {setupTheme.name}{tone && tone !== 'Auto' ? ` · ${tone}` : ''}
                  </span>
                </div>
              ) : (
                <div className="oe-setup-card-sub">{tone && tone !== 'Auto' ? tone : 'No theme selected'}</div>
              )}
            </div>
          </button>

          {/* Platform */}
          <div className="oe-setup-card" style={{ position: 'relative' }}>
            <button className="oe-setup-card-inner-btn" onClick={() => setPlatformPickerOpen(v => !v)}>
              <div className="oe-setup-card-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <div className="oe-setup-card-body">
                <div className="oe-setup-card-title">Platform</div>
                <div className="oe-setup-card-sub">{selectedPlatform} · {PLATFORM_RATIOS[selectedPlatform] ?? 'Multiple'}</div>
              </div>
            </button>
            {platformPickerOpen && (
              <div className="oe-ratio-picker oe-ratio-picker--setup" onClick={e => e.stopPropagation()}>
                {PLATFORMS.map(p => (
                  <button key={p}
                    className={`oe-ratio-option${p === selectedPlatform ? ' active' : ''}`}
                    onClick={() => {
                      setSelectedPlatform(p)
                      setPlatformPickerOpen(false)
                      triggerBriefUpdate(`Platform changed to ${p}`)
                    }}
                  >
                    <span className="oe-ratio-label">{p}</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 4 }}>{PLATFORM_RATIOS[p] ?? 'Multiple'}</span>
                    {p === selectedPlatform && <Check size={11} strokeWidth={3} style={{ marginLeft: 'auto', color: config.color }} />}
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

        {/* Look & Feel modal */}
        {showLookAndFeel && (
          <LookAndFeelModal
            selected={setupTheme?.id ?? ''}
            onSelect={t => {
              setSetupTheme(t)
              triggerBriefUpdate(`Theme changed to "${t.name}"`)
            }}
            onClose={() => setShowLookAndFeel(false)}
            spectrumValues={spectrumValues}
            onSpectrumChange={(key, v) => setSpectrumValues(prev => ({ ...prev, [key]: v }))}
            textAmount={textAmount}
            onTextAmountChange={setTextAmount}
            wordsToAvoid={wordsToAvoid}
            onWordsToAvoidChange={setWordsToAvoid}
            customInstruction={customInstruction}
            onCustomInstructionChange={setCustomInstruction}
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

/* ── Step2CombinedCard ───────────────────────────────────────────── */
function Step2CombinedCard({
  config,
  onSubmit,
}: {
  config: ProductConfig
  onSubmit: (values: FormValues) => void
}) {
  const [audience,   setAudience]   = useState('')
  const [angle,      setAngle]      = useState('')
  const [emotion,    setEmotion]    = useState('')
  const [keyMessage, setKeyMessage] = useState('')
  const [cta,        setCta]        = useState('')

  const canSubmit = audience.trim().length > 0 || !!angle || !!emotion || keyMessage.trim().length > 0

  function submit() {
    if (!canSubmit) return
    onSubmit({ audience, angle, emotion, keyMessage, cta })
  }

  return (
    <div className="ac2-bac ac2-bac--combined" style={{ '--bac-color': config.color } as React.CSSProperties}>
      <div className="ac2-bac-header">
        <span className="ac2-bac-q">Tell me about the content</span>
        <div className="ac2-bac-nav">
          <span className="ac2-bac-step">Content details</span>
        </div>
      </div>

      <div className="ac2-bac-body ac2-bac-body--combined">
        <div className="ac2-s2-field">
          <div className="ac2-s2-label">Who are you speaking to?</div>
          <input
            className="ac2-bac-input"
            placeholder="e.g. indie coffee shop owners, early-career designers…"
            value={audience}
            onChange={e => setAudience(e.target.value)}
          />
        </div>

        <div className="ac2-s2-field">
          <div className="ac2-s2-label">Content angle</div>
          <div className="ac2-s2-chips">
            {CONTENT_ANGLES.map(opt => (
              <button
                key={opt}
                className={`ac2-s2-chip${angle === opt ? ' active' : ''}`}
                style={angle === opt ? { '--pc': config.color } as React.CSSProperties : undefined}
                onClick={() => setAngle(prev => prev === opt ? '' : opt)}
              >
                {angle === opt && <Check size={10} strokeWidth={3} />}
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="ac2-s2-field">
          <div className="ac2-s2-label">How should they feel?</div>
          <div className="ac2-s2-chips">
            {CONTENT_EMOTIONS.map(opt => (
              <button
                key={opt}
                className={`ac2-s2-chip${emotion === opt ? ' active' : ''}`}
                style={emotion === opt ? { '--pc': config.color } as React.CSSProperties : undefined}
                onClick={() => setEmotion(prev => prev === opt ? '' : opt)}
              >
                {emotion === opt && <Check size={10} strokeWidth={3} />}
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="ac2-s2-field">
          <div className="ac2-s2-label">Key message or hook</div>
          <input
            className="ac2-bac-input"
            placeholder="e.g. Limited summer offer — only 48 hours left…"
            value={keyMessage}
            onChange={e => setKeyMessage(e.target.value)}
          />
        </div>

        <div className="ac2-s2-field">
          <div className="ac2-s2-label">Call to action <span className="ac2-s2-optional">(optional)</span></div>
          <input
            className="ac2-bac-input"
            placeholder="e.g. Shop now, Book a demo, Learn more…"
            value={cta}
            onChange={e => setCta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}
          />
        </div>
      </div>

      <div className="ac2-bac-footer">
        <span className="ac2-bac-count">{canSubmit ? 'Ready' : 'Fill in at least one field'}</span>
        <button
          className="ac2-bac-next"
          disabled={!canSubmit}
          onClick={submit}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────── */
interface Props {
  config: ProductConfig
  userPrompt: string
  onBack: () => void
  initialTheme?: ThemeOption | null
  initialTone?: string | null
  attachedFiles?: File[]
}

export function AgentChat({ config, userPrompt, onBack, initialTheme, initialTone, attachedFiles = [] }: Props) {
  const navigate   = useNavigate()
  const Icon       = I.Icons[config.icon]
  const { kits, appliedId } = useBrandStore()
  const appliedKit = kits.find(k => k.id === appliedId) ?? null
  const threadRef  = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [phase, setPhase]             = useState<Phase>('idle')
  const [activeTheme, setActiveTheme] = useState<ThemeOption | null>(initialTheme ?? null)
  const [ctxRevealStep, setCtxRevealStep]   = useState(0)   // 0=hidden 1=greeting 2=analysis
  const [conflictResolution, setConflictResolution] = useState<string | null>(null)
  const [stepThinking, setStepThinking] = useState(false)
  const [formPlatform, setFormPlatform]         = useState('')
  const [formImageCount, setFormImageCount]     = useState('1')
  const [formConflictChoice, setFormConflictChoice] = useState('')
  const [brief, setBrief]             = useState<ReturnType<typeof generateBrief> | null>(null)
  const [savedFormValues, setSavedFormValues] = useState<FormValues>({})
  const [input, setInput]             = useState('')
  const [briefVersion, setBriefVersion] = useState(0)
  const [changeHistory, setChangeHistory] = useState<{ text: string; done: boolean }[]>([])
  const contextChips = [config.label, 'AI-assisted', 'Guided brief']

  /* ── Conversational Q&A state ─────────────────────────────────── */
  const [step1History, setStep1History] = useState<{ key: string; question: string; answer: string; ack?: string }[]>([])
  const [step1Index,   setStep1Index]   = useState(0)
  const [step2Values, setStep2Values] = useState<FormValues | null>(null)

  const STEP1_QUESTIONS: QAQuestion[] = [
    { key: 'platform',   message: 'Where will this post live? Platform shapes the format and tone.',
      type: 'chips', chips: ['Instagram', 'LinkedIn', 'X (Twitter)', 'All Platforms'], ratios: PLATFORM_RATIOS },
    { key: 'imageCount', message: 'Single hero image, or a carousel? How many slides are you thinking?',
      type: 'text', placeholder: 'e.g. 1 for a single image, 3 for a carousel…' },
  ]
  const conflict = detectThemeConflict(userPrompt, activeTheme)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    setTimeout(() => setPhase('tool-form'), 500)
    setTimeout(() => setPhase('reading'), 1200)
    setTimeout(() => setPhase('ctx-reveal'), 2200)
  }, [])

  useEffect(() => {
    if (phase !== 'ctx-reveal') return
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setCtxRevealStep(1), 500))
    timers.push(setTimeout(() => setCtxRevealStep(2), 1500))
    if (conflict) {
      timers.push(setTimeout(() => setCtxRevealStep(3), 2600))  // thinking dots appear
      timers.push(setTimeout(() => setCtxRevealStep(4), 3700))  // conflict bubble appears
      timers.push(setTimeout(() => setPhase('conflict-q'), 4500))
    } else {
      timers.push(setTimeout(() => setPhase('form-platform'), 2300))
    }
    return () => timers.forEach(clearTimeout)
  }, [phase])

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [phase, brief, changeHistory])

  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    function onScroll() {
      const distFromBottom = el!.scrollHeight - el!.scrollTop - el!.clientHeight
      setShowScrollBtn(distFromBottom > 120)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToBottom() {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }

  function handlePlatformAndImageConfirm(platform: string, imageCount: string) {
    setFormPlatform(platform)
    setFormImageCount(imageCount)
    setFormConflictChoice('confirmed')
    setPhase('form-thinking')
    setTimeout(() => setPhase('form'), 1400)
  }

  function conflictAck(resolution: string): string {
    if (resolution === 'Follow my prompt') return "Got it — I'll let your prompt lead the direction. The theme will adapt around it."
    if (resolution === 'Keep the theme')   return "Understood — I'll stay true to your theme's visual language and shape the content to fit."
    return "Love it. I'll blend both — pulling energy from your prompt and grounding it in the theme's palette."
  }

  function handleConflictAnswer(answer: string) {
    setConflictResolution(answer)
    setPhase('conflict-thinking')
    setTimeout(() => setPhase('form-platform'), 900)
  }

  function handleDirectionConfirm(choice: string) {
    setFormConflictChoice(choice)
    setPhase('form')
  }

  function handleFormConfirm(values: FormValues) {
    setSavedFormValues(values)
    setPhase('submitting')
    setTimeout(() => setPhase('tool-brief'), 400)
    setTimeout(() => {
      setBrief(generateBrief(config, userPrompt, values))
      setPhase('brief')
    }, 1200)
  }

  function generateStepAck(key: string, answer: string): string {
    if (key === 'platform') {
      if (answer === 'Instagram')   return "Instagram — I'll optimise for the visual-first format. Composition and colour are going to do most of the work here."
      if (answer === 'LinkedIn')    return "LinkedIn — I'll push the copy to work harder. That audience responds to clarity and credibility over pure aesthetics."
      if (answer === 'X (Twitter)') return "X — I'll keep everything punchy. One strong idea, nothing that needs to be read twice."
      if (answer === 'All Platforms') return "All platforms — I'll build a flexible layout that holds up across aspect ratios without losing visual impact."
      return `Got it — ${answer}. I'll adapt the format and tone accordingly.`
    }
    if (key === 'imageCount') {
      const n = parseInt(answer, 10)
      if (!isNaN(n) && n === 1) return "Single image — I'll treat it as one focused moment. Every element needs to pull its weight."
      if (!isNaN(n) && n > 1)   return `${n} slides — I'll build a narrative arc so each one leads naturally into the next, not just a set of separate frames.`
      return `Got it — I'll plan the layout around ${answer}.`
    }
    if (key === 'audience')    return `Noted. "${answer}" — that gives me a clear person to design and write for.`
    if (key === 'angle')       return `${answer} — useful framing. I'll make sure the structure and copy stay true to that lens throughout.`
    if (key === 'emotion')     return `${answer} — I'll treat that as the emotional undercurrent. If someone doesn't feel that within the first second, something's off.`
    if (key === 'keyMessage')  return `Locked in. I'll keep everything — headline, visuals, CTA — anchored to that single idea.`
    if (key === 'cta')         return answer ? `"${answer}" — I'll make that the most visible thing on the piece.` : `No hard CTA — I'll keep the ending open and let the content do the selling.`
    return `Got it.`
  }

  function handleStep1Answer(answer: string) {
    const q = STEP1_QUESTIONS[step1Index]
    const ack = generateStepAck(q.key, answer)
    const newHistory = [...step1History, { key: q.key, question: q.message, answer }]
    setStep1History(newHistory)
    setStepThinking(true)
    setTimeout(() => {
      setStepThinking(false)
      // Persist ack into history so it stays visible in the thread
      setStep1History(prev => prev.map((item, i) => i === prev.length - 1 ? { ...item, ack } : item))
      setTimeout(() => {
        if (step1Index + 1 < STEP1_QUESTIONS.length) {
          setStep1Index(step1Index + 1)
        } else {
          const platform   = newHistory.find(h => h.key === 'platform')?.answer   ?? 'Instagram'
          const imageCount = newHistory.find(h => h.key === 'imageCount')?.answer ?? '1'
          handlePlatformAndImageConfirm(platform, imageCount)
        }
      }, 1100)
    }, 600)
  }

  function handleStep2Submit(values: FormValues) {
    setStep2Values(values)
    const imgNum = parseInt(formImageCount, 10) || 1
    const fullValues: FormValues = {
      platform:   formPlatform,
      imageCount: formImageCount,
      format:     imgNum === 1 ? 'Single Image' : 'Carousel',
      ...(initialTone  ? { tone:  initialTone      } : {}),
      ...(activeTheme  ? { theme: activeTheme.name } : {}),
      ...values,
    }
    handleFormConfirm(fullValues)
  }

  function handleApprove() {
    setPhase('outline')
  }

  function handleBriefChange(text: string) {
    setChangeHistory(prev => [...prev, { text, done: false }])
    setTimeout(() => {
      setChangeHistory(prev => prev.map((c, i) => i === prev.length - 1 ? { ...c, done: true } : c))
      setBriefVersion(v => v + 1)
    }, 1400)
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
        initialTheme={activeTheme}
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

        {/* Tool call 1 — read campaign state */}
        {phase !== 'idle' && (
          <ToolCallRow name="read_campaign_state" done={phase !== 'tool-form'} />
        )}

        {/* Thinking dots while reading campaign state */}
        {phase === 'reading' && (
          <div className="ac2-typing"><span /><span /><span /></div>
        )}

        {/* Greeting bubble — step 1 of context reveal */}
        {ctxRevealStep >= 1 && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-agent-bubble">
              Got your request. Let me break down what I picked up before we dive in.
            </div>
          </div>
        )}

        {/* "Here's what I'm working with" — context reveal after tool call */}
        {ctxRevealStep >= 2 && (() => {
          const insights      = analyzePrompt(userPrompt)
          const primaryColors = appliedKit?.colors?.palettes?.[0]?.colors ?? []
          const colorDesc     = primaryColors.length > 0
            ? primaryColors.slice(0, 3).map(c => `${c.name} (${c.hex})`).join(', ')
            : appliedKit?.swatches.slice(0, 3).join(', ') ?? ''
          const font         = appliedKit?.type?.display?.family ?? null
          const bodyFont     = appliedKit?.type?.body?.family ?? null
          const imageryStyle = appliedKit?.imagery?.styleDesc ?? appliedKit?.imagery?.tags?.slice(0, 3).map(t => t.t).join(', ') ?? null
          const kitToneDesc  = appliedKit?.tone?.use?.slice(0, 2).join(', ') ?? null
          const kitAvoid     = appliedKit?.tone?.avoid?.slice(0, 2).join(', ') ?? null

          const hasSignals   = insights.toneSignals.length > 0 || insights.audiences.length > 0 || insights.urgency

          /* What I can do — dynamic synthesis */
          const canDo = (() => {
            const parts: string[] = []
            if (appliedKit) parts.push(`use ${appliedKit.name}'s brand system`)
            if (activeTheme) parts.push(`stay inside the ${activeTheme.name} visual language`)
            if (insights.designStyle.length > 0) parts.push(`apply a ${insights.designStyle.slice(0, 2).join(' + ')} aesthetic`)
            if (insights.explicitHexes.length > 0) parts.push(`honour the ${insights.explicitHexes.length} specified color values`)
            if (insights.toneSignals.length > 0) parts.push(`match the ${insights.toneSignals[0]} feel`)
            if (insights.audiences.length > 0) parts.push(`speak to ${insights.audiences[0]}`)
            if (parts.length === 0) parts.push('work with style-neutral defaults')
            const missing: string[] = []
            if (!appliedKit) missing.push('brand guidelines')
            if (insights.toneSignals.length === 0 && insights.designStyle.length === 0) missing.push('visual direction')
            if (insights.audiences.length === 0) missing.push('audience')
            return { can: parts, missing }
          })()

          const imageFiles = attachedFiles.filter(f => f.type.startsWith('image/'))
          const otherFiles = attachedFiles.filter(f => !f.type.startsWith('image/'))

          // Synthesize para 1 — what this is + visual direction
          const styleDesc = insights.designStyle.length > 0
            ? insights.designStyle.slice(0, 3).join(', ')
            : null
          // Content description — what the user is trying to make
          const article = /^[aeiou]/i.test(insights.contentType) ? 'an' : 'a'
          const subjectClean = (() => {
            const s = insights.subject.trim()
            if (!s || s.startsWith('#') || s.toLowerCase() === insights.contentType.toLowerCase()) return null
            // Strip markdown: headings mid-string, placeholders, bold/italic markers
            let clean = s
              .replace(/#{1,6}\s+.*/g, '')           // cut off at any ## heading
              .replace(/\[[^\]]*\]/g, '')             // strip [PLACEHOLDER] style brackets
              .replace(/\*\*([^*]*)\*\*/g, '$1')     // unwrap **bold**
              .replace(/\*([^*]*)\*/g, '$1')          // unwrap *italic*
              .replace(/[_~`]+/g, '')                 // strip remaining markdown chars
              .trim()
              .replace(/[-–—,]+$/, '')                // strip trailing punctuation
              .trim()
            if (!clean || clean.length < 3) return null
            return clean.length > 72 ? clean.slice(0, 72).trim() + '…' : clean
          })()

          const para1 = (() => {
            const parts: React.ReactNode[] = []
            if (styleDesc && insights.explicitHexes.length > 0) {
              parts.push(<>I can see the brief defines both a visual direction ({styleDesc}) and a specific color system — that's a solid foundation I can build directly from.</>)
            } else if (styleDesc) {
              parts.push(<>I'm picking up a <strong>{styleDesc}</strong> aesthetic — I'll shape everything around that direction.</>)
            } else if (insights.explicitHexes.length > 0) {
              parts.push(<>I didn't find an explicit visual style, but the {insights.explicitHexes.length} color values give me a clear palette to anchor from.</>)
            } else {
              parts.push(<>I don't have much visual direction yet — I'll ask a few questions to pin that down.</>)
            }
            if (insights.seasonTag) parts.push(<> There's a <strong>{insights.seasonTag}</strong> context here I'll factor in.</>)
            if (insights.urgency) parts.push(<> I'm also reading urgency into this — I'll make sure that comes through in the hierarchy.</>)
            return parts
          })()

          // Synthesize para 2 — tone + audience
          const para2 = (() => {
            const tone    = insights.toneSignals.slice(0, 3)
            const aud     = insights.audiences.slice(0, 2)
            if (tone.length === 0 && aud.length === 0) return null
            const parts: React.ReactNode[] = []
            if (tone.length > 0) {
              parts.push(<>I'm picking up <strong>{tone.join(', ')}</strong> tone signals</>)
              if (aud.length > 0) parts.push(<>, and I'm reading the audience as <strong>{aud.join(' and ')}</strong></>)
              if (tone.includes('luxury') || tone.includes('premium')) parts.push(<> — so I'll keep the visuals and copy deliberate and refined, not loud</>)
              else if (tone.includes('bold & confident') || tone.includes('urgent')) parts.push(<> — I'll prioritise strong visual hierarchy and make the CTA impossible to miss</>)
              else if (tone.includes('tech-forward') || tone.includes('futuristic')) parts.push(<> — I'll push the design language toward something intelligent and forward-looking</>)
              parts.push(<>.</>)
            } else if (aud.length > 0) {
              parts.push(<>I'll be speaking to <strong>{aud.join(' and ')}</strong>, so I'll calibrate the messaging to match what resonates with that group.</>)
            }
            return parts
          })()

          // Theme alignment note
          const themeNote = (() => {
            if (!activeTheme) return null
            if (conflict) return <>You've got the <strong>{activeTheme.name}</strong> theme selected — I want to check something about how that sits with your direction before we continue.</>
            return <>I can see the <strong>{activeTheme.name}</strong> theme aligns well with the direction you're going — I'll stay inside that visual language.</>
          })()

          return (
            <div className="ac2-agent-row">
              <div className="ac2-agent-av">AI</div>
              <div className="ac2-ctx-bubble ac2-ctx-bubble--v2">

                {/* Content type badge + subject heading */}
                <div className="ac2-cv2-header">
                  <div className="ac2-cv2-header-row">
                    <span className="ac2-cv2-type">{insights.contentType}</span>
                    {insights.urgency && <span className="ac2-cv2-tag ac2-cv2-tag--urgent">Urgent</span>}
                    {insights.seasonTag && <span className="ac2-cv2-tag">{insights.seasonTag}</span>}
                  </div>
                  {subjectClean && <p className="ac2-cv2-subject">{subjectClean}</p>}
                </div>

                {/* Para 1 — visual direction analysis */}
                <p className="ac2-cv2-para">{para1}</p>

                {/* Color palette — swatches + hex list */}
                {insights.explicitHexes.length > 0 && (
                  <div className="ac2-cv2-palette">
                    <div className="ac2-cv2-swatches">
                      {insights.explicitHexes.map((hex, i) => (
                        <span key={i} className="ac2-cv2-swatch" style={{ background: hex }} title={hex} />
                      ))}
                    </div>
                    <div className="ac2-cv2-hex-list">
                      {insights.explicitHexes.map((hex, i) => (
                        <span key={i} className="ac2-cv2-hex">{hex}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Para 2 — tone + audience synthesis */}
                {para2 && <p className="ac2-cv2-para">{para2}</p>}

                {/* Reference images / files */}
                {attachedFiles.length > 0 && (
                  <div className="ac2-cv2-refs">
                    <p className="ac2-cv2-para">
                      {imageFiles.length > 0
                        ? <>{imageFiles.length === 1 ? "I can see one reference image" : `I can see ${imageFiles.length} reference images`} — I'll use {imageFiles.length === 1 ? 'it' : 'them'} to inform the compositional style and visual density of the output.</>
                        : null}
                      {otherFiles.length > 0
                        ? <>{imageFiles.length > 0 ? ' ' : ''}{otherFiles.length === 1 ? "I've also got one supporting file" : `I've also got ${otherFiles.length} supporting files`} I'll pull context from.</>
                        : null}
                    </p>
                    <div className="ac2-cv2-ref-files">
                      {imageFiles.map((f, i) => (
                        <div key={i} className="ac2-cv2-ref-img">
                          <img src={URL.createObjectURL(f)} alt={f.name} />
                        </div>
                      ))}
                      {otherFiles.map((f, i) => (
                        <div key={i} className="ac2-cv2-ref-file">
                          <span className="ac2-cv2-ref-name">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand kit + theme — footer section */}
                {(appliedKit || activeTheme) && (
                  <div className="ac2-cv2-footer">
                    {appliedKit && (
                      <p className="ac2-cv2-para">
                        <div className="ac2-cv2-kit-row">
                          {appliedKit.swatches.slice(0, 5).map((hex, i) => (
                            <span key={i} className="ac2-cv2-swatch ac2-cv2-swatch--sm" style={{ background: hex }} />
                          ))}
                        </div>
                        I'll pull from the <strong>{appliedKit.name}</strong> brand kit
                        {font ? <> — <strong>{font}</strong> typeface</> : null}
                        {kitToneDesc ? <>, <strong>{kitToneDesc}</strong> voice</> : null}.
                      </p>
                    )}
                    {activeTheme && (
                      <div className="ac2-cv2-theme-note">
                        <div className="ac2-cv2-theme-thumb">
                          <ThemePreview colors={activeTheme.colors} />
                        </div>
                        <p className="ac2-cv2-para ac2-cv2-para--theme">{themeNote}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )
        })()}

        {/* Conflict thinking dots — between context bubble and conflict message */}
        {ctxRevealStep >= 3 && ctxRevealStep < 4 && conflict && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-typing"><span /><span /><span /></div>
          </div>
        )}

        {/* Separate conflict message bubble */}
        {ctxRevealStep >= 4 && conflict && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-agent-bubble">
              {conflict.soft
                ? `One thing to check — your brief feels ${conflict.promptDir}, but the "${activeTheme?.name}" theme sits in ${conflict.themeDir} territory. That tension can work, but I want to make sure it's intentional before I lock anything in.`
                : `Before we go further — your prompt is pulling toward ${conflict.promptDir}, but the "${activeTheme?.name}" theme is firmly ${conflict.themeDir}. These are genuinely at odds, and I need to know which should lead.`}
            </div>
          </div>
        )}

        {/* Conflict resolution — user reply + thinking dots + ack */}
        {conflictResolution && (
          <UserReply answer={conflictResolution} />
        )}
        {phase === 'conflict-thinking' && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-typing"><span /><span /><span /></div>
          </div>
        )}
        {conflictResolution && phase !== 'conflict-q' && phase !== 'conflict-thinking' && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-agent-bubble">{conflictAck(conflictResolution)}</div>
          </div>
        )}

        {/* ── Step 1 Q&A history ─────────────────────────────────── */}
        {step1History.map(item => (
          <div key={item.key}>
            <div className="ac2-agent-row">
              <div className="ac2-agent-av">AI</div>
              <div className="ac2-agent-bubble">{item.question}</div>
            </div>
            <UserReply answer={item.answer} />
            {item.ack && (
              <div className="ac2-agent-row">
                <div className="ac2-agent-av">AI</div>
                <div className="ac2-agent-bubble">{item.ack}</div>
              </div>
            )}
          </div>
        ))}
        {/* Inter-question thinking dots */}
        {stepThinking && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-typing"><span /><span /><span /></div>
          </div>
        )}

        {/* Active step 1 question bubble (answer card is rendered below the thread) */}
        {phase === 'form-platform' && !stepThinking && STEP1_QUESTIONS[step1Index] && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-agent-bubble">{STEP1_QUESTIONS[step1Index].message}</div>
          </div>
        )}

        {/* Thinking indicator */}
        {phase === 'form-thinking' && (
          <div className="ac2-typing"><span /><span /><span /></div>
        )}

        {/* ── Step 2 conversational Q&A ──────────────────────────── */}
        {formConflictChoice && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-agent-bubble">
              Good. Now let's get into the content itself — a few quick questions and I'll have everything I need to build your brief.
            </div>
          </div>
        )}
        {/* Step 2 submitted — compact summary reply + ack */}
        {step2Values && (
          <>
            <div className="ac2-user-bubble-row">
              <div className="ac2-user-bubble ac2-user-bubble--summary">
                {[
                  step2Values.audience  && `Audience: ${step2Values.audience}`,
                  step2Values.angle     && `Angle: ${step2Values.angle}`,
                  step2Values.emotion   && `Feel: ${step2Values.emotion}`,
                  step2Values.keyMessage && `Message: ${step2Values.keyMessage}`,
                  step2Values.cta       && `CTA: ${step2Values.cta}`,
                ].filter(Boolean).join(' · ')}
              </div>
              <div className="ac2-user-av"><span>TH</span></div>
            </div>
            <div className="ac2-agent-row">
              <div className="ac2-agent-av">AI</div>
              <div className="ac2-agent-bubble">
                Perfect — that gives me everything I need. Let me put your brief together.
              </div>
            </div>
          </>
        )}

        {phase === 'submitting' && (
          <div className="ac2-typing"><span /><span /><span /></div>
        )}

        {/* Tool call 2 — build brief */}
        {(phase === 'tool-brief' || phase === 'brief' || phase === 'done') && (
          <ToolCallRow
            name="prepare_guided_generation_context"
            done={phase === 'brief' || phase === 'done'}
          />
        )}

        {/* Brief change messages */}
        {(phase === 'brief' || phase === 'done') && changeHistory.map((entry, i) => (
          <div key={i} className="ac2-brief-change-thread">
            <div className="ac2-user-bubble-row">
              <div className="ac2-user-bubble">{entry.text}</div>
              <div className="ac2-user-av"><span>TH</span></div>
            </div>
            <div className="ac2-edit-log-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="ac2-tool-icon">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span className="ac2-tool-name">rewrite_requirement_summary</span>
              {entry.done
                ? <span className="ac2-tool-done"><Check size={10} strokeWidth={3} /></span>
                : <span className="ac2-tool-running"><span /><span /><span /></span>
              }
              <button className="ac2-tool-expand"><ChevronRight size={12} /></button>
            </div>
          </div>
        ))}

        {/* Brief */}
        {brief && (phase === 'brief' || phase === 'done') && (
          <BriefCard key={briefVersion} brief={brief} config={config} onApprove={handleApprove} onRequestChange={handleBriefChange} />
        )}

        <div style={{ height: 32 }} />
      </div>

      {/* Bottom answer card — floating Q&A prompt */}
      {phase === 'conflict-q' && conflict && (
        <BottomAnswerCard
          key="bac-conflict"
          question={{
            key: 'conflictResolution',
            message: conflict.soft
              ? `Lean into the ${conflict.promptDir} brief, or hold the ${conflict.themeDir} theme?`
              : `Follow the ${conflict.promptDir} direction in your brief, or stay with the ${conflict.themeDir} theme?`,
            type: 'chips',
            chips: ['Follow my prompt', 'Keep the theme', 'Blend both'],
          }}
          stepCurrent={1}
          stepTotal={1}
          config={config}
          onAnswer={handleConflictAnswer}
          showNote
        />
      )}
      {phase === 'form-platform' && !stepThinking && STEP1_QUESTIONS[step1Index] && (
        <BottomAnswerCard
          key={`bac-s1-${step1Index}`}
          question={STEP1_QUESTIONS[step1Index]}
          stepCurrent={step1Index + 1}
          stepTotal={STEP1_QUESTIONS.length}
          config={config}
          onAnswer={handleStep1Answer}
        />
      )}
      {phase === 'form' && !step2Values && (
        <Step2CombinedCard config={config} onSubmit={handleStep2Submit} />
      )}

      {/* Scroll to latest */}
      {showScrollBtn && (
        <button className="ac2-scroll-btn" onClick={scrollToBottom}>
          <ChevronDown size={15} />
          <span>Latest</span>
        </button>
      )}

      {/* Input bar — hidden while a question card is active */}
      {!(
        (phase === 'conflict-q' && conflict) ||
        (phase === 'form-platform' && !stepThinking && !!STEP1_QUESTIONS[step1Index]) ||
        (phase === 'form' && !step2Values)
      ) && <div className="ac2-input-bar">
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
      </div>}
    </div>
  )
}
