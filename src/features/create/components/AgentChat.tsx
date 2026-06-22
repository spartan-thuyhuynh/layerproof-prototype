import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Send, ChevronRight, Check, X } from 'lucide-react'
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
  | 'form-platform'
  | 'form-thinking'
  | 'form-conflict'
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

function generateBrief(config: ProductConfig, prompt: string, values: FormValues) {
  const platform    = values.platform   || 'Instagram'
  const tone        = values.tone       || 'Professional'
  const audience    = values.audience   || `Professionals and enthusiasts interested in ${prompt}`
  const theme       = values.theme      ?? ''
  const format      = values.format     || 'Single Image'
  const imageCount  = values.imageCount || '1'
  const angle       = values.angle       ?? ''
  const emotion     = values.emotion     ?? ''
  const keyMessage  = values.keyMessage  ?? ''
  const cta         = values.cta         ?? ''
  const talkingPoints = values.talkingPoints ?? ''

  const formatLabel = imageCount ? `${format} · ${imageCount} image${parseInt(imageCount) > 1 ? 's' : ''}` : format

  const title = `${config.label} — ${capitalize(prompt)}`

  const setup: [string, string][] = [
    ['Platform',  platform],
    ['Format',    formatLabel],
    ['Audience',  audience],
  ]

  const content: [string, string][] = [
    keyMessage    && ['Key message', keyMessage],
    angle         && ['Angle',       angle],
    emotion       && ['Feeling',     emotion],
    cta           && ['CTA',         cta],
    talkingPoints && ['Notes',       talkingPoints],
  ].filter(Boolean) as [string, string][]

  const count = parseInt(imageCount, 10) || 1
  const TOPIC_POOL = [
    `Introduction to ${prompt}: what it is and why it matters`,
    'Core concepts and mental models to understand first',
    'Step-by-step framework you can apply immediately',
    'Real-world examples and case study walkthrough',
    'Common mistakes and how to avoid over-complicating it',
    'Quick wins you can implement today',
    'Advanced tips for experienced practitioners',
    'Tools and resources to go deeper',
    'Community insights and expert perspectives',
    'Summary and next steps',
  ]
  const topics = Array.from({ length: count }, (_, i) =>
    TOPIC_POOL[i] ?? `Post ${i + 1}: ${capitalize(prompt)} — key insight ${i + 1}`
  )

  const summaryParts: string[] = [
    `Create a ${formatLabel.toLowerCase()} social post about "${prompt}" for ${platform}, targeting ${audience}.`,
    angle    ? `The content will take a ${angle.toLowerCase()} angle` + (emotion ? `, aiming to make the audience feel ${emotion.toLowerCase()}.` : '.') : (emotion ? `Aiming to make the audience feel ${emotion.toLowerCase()}.` : ''),
    keyMessage ? `Key message: ${keyMessage}.` : '',
    cta      ? `Call to action: ${cta}.` : '',
    talkingPoints ? `Additional notes: ${talkingPoints}.` : '',
  ]
  const summary = summaryParts.filter(Boolean).join(' ')

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
  const brandThemes: ThemeOption[] = kits.flatMap(kit => makeBrandKitThemes(kit))

  function ThemeCard({ theme }: { theme: ThemeOption }) {
    const isSelected = selected === theme.id
    return (
      <button
        className={`ac2-theme-card${isSelected ? ' selected' : ''}`}
        onClick={() => onSelect(theme)}
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
    <div className="ac2-check-log">
      {items.map(({ question, answer }) => (
        <div key={question} className="ac2-check-log-item">
          <div className="ac2-check-log-icon">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <span><span className="ac2-check-log-label">{question}</span><span className="ac2-check-log-value">{answer}</span></span>
        </div>
      ))}
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
        style={{ background: config.color }}
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
  { label: 'cool / blue',        keywords: ['blue', 'cool', 'ocean', 'sky', 'navy', 'azure', 'cobalt', 'teal', 'cyan', 'icy'] },
  { label: 'green / nature',     keywords: ['green', 'forest', 'emerald', 'sage', 'olive', 'mint', 'nature', 'earthy'] },
  { label: 'purple / violet',    keywords: ['purple', 'violet', 'lavender', 'indigo', 'mauve', 'lilac'] },
  { label: 'yellow / gold',      keywords: ['yellow', 'gold', 'golden', 'mustard', 'sunny'] },
  { label: 'pink / rose',        keywords: ['pink', 'rose', 'blush', 'magenta'] },
  { label: 'dark / moody',       keywords: ['dark', 'moody', 'night', 'noir', 'black', 'deep', 'shadow', 'bold'] },
  { label: 'light / minimal',    keywords: ['light', 'white', 'minimal', 'clean', 'bright', 'airy', 'soft', 'neutral'] },
]

const CONTRADICTIONS: Array<[string, string]> = [
  ['warm / red-orange', 'cool / blue'],
  ['dark / moody',      'light / minimal'],
  ['green / nature',    'dark / moody'],
  ['purple / violet',   'warm / red-orange'],
  ['yellow / gold',     'cool / blue'],
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
  const promptPalettes = matchPalettes(p)

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

function buildBaseConfirmMessage(platform: string, imageCount: string, theme: ThemeOption | null): string {
  const count  = parseInt(imageCount, 10) || 1
  const format = count === 1 ? 'single-image post' : `${count}-slide carousel`
  const ratio  = ({ Instagram: '1:1 / 9:16', LinkedIn: '1.91:1', 'X (Twitter)': '16:9', 'All Platforms': 'multiple ratios' } as Record<string, string>)[platform] ?? ''
  const base   = `Got it — a ${format} for ${platform}${ratio ? ` (${ratio})` : ''}.`
  if (!theme) return `${base} No theme selected yet — the brief will be style-neutral for now.`
  const qualifier = theme.section === 'brand' ? 'Your brand theme' : `The "${theme.name}" theme`
  return `${base} ${qualifier} looks like a great fit. A few more details and I'll have your brief ready.`
}

function ConflictConfirmCard({
  conflict,
  theme,
  config,
  onConfirm,
}: {
  conflict:  ThemeConflict
  theme:     ThemeOption
  config:    ProductConfig
  onConfirm: (choice: string) => void
}) {
  const msg = conflict.soft
    ? `Your prompt hints at ${conflict.promptDir} tones, but the "${theme.name}" theme has a ${conflict.themeDir} palette — these could pull in different directions. Which should we follow?`
    : `I noticed a conflict — your prompt leans ${conflict.promptDir} but the "${theme.name}" theme goes ${conflict.themeDir}. Which visual direction should we go with?`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="ac2-agent-row">
        <div className="ac2-agent-av">AI</div>
        <div className="ac2-agent-bubble">{msg}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, paddingLeft: 40 }}>
        <button
          className="ac2-pill active"
          style={{ '--pc': config.color } as React.CSSProperties}
          onClick={() => onConfirm(`Keep "${theme.name}" theme`)}
        >
          <Check size={11} strokeWidth={3} />
          Keep &ldquo;{theme.name}&rdquo; theme
        </button>
        <button
          className="ac2-pill"
          onClick={() => onConfirm(`Follow prompt direction (${conflict.promptDir})`)}
        >
          Follow my prompt
        </button>
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
        style={{ background: config.color }}
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

/* ── Main component ──────────────────────────────────────────────── */
interface Props {
  config: ProductConfig
  userPrompt: string
  onBack: () => void
  initialTheme?: ThemeOption | null
  initialTone?: string | null
}

export function AgentChat({ config, userPrompt, onBack, initialTheme, initialTone }: Props) {
  const navigate   = useNavigate()
  const Icon       = I.Icons[config.icon]
  const threadRef  = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const [phase, setPhase]             = useState<Phase>('idle')
  const [formPlatform, setFormPlatform]         = useState('')
  const [formImageCount, setFormImageCount]     = useState('1')
  const [formConflictChoice, setFormConflictChoice] = useState('')
  const [brief, setBrief]             = useState<ReturnType<typeof generateBrief> | null>(null)
  const [savedFormValues, setSavedFormValues] = useState<FormValues>({})
  const [input, setInput]             = useState('')
  const [briefVersion, setBriefVersion] = useState(0)
  const [changeHistory, setChangeHistory] = useState<{ text: string; done: boolean }[]>([])
  const contextChips = [config.label, 'AI-assisted', 'Guided brief']

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    setTimeout(() => setPhase('tool-form'), 500)
    setTimeout(() => setPhase('form-platform'), 1200)
  }, [])

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [phase, brief, changeHistory])

  function handlePlatformAndImageConfirm(platform: string, imageCount: string) {
    setFormPlatform(platform)
    setFormImageCount(imageCount)
    setPhase('form-thinking')
    const conflict = detectThemeConflict(userPrompt, initialTheme ?? null)
    setTimeout(() => setPhase(conflict ? 'form-conflict' : 'form'), 1400)
  }

  function handleConflictChoice(choice: string) {
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
        initialTheme={initialTheme}
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

        {/* Step 1 — Platform + image count */}
        {phase === 'form-platform' && (
          <PlatformAndImageCard config={config} onConfirm={handlePlatformAndImageConfirm} />
        )}
        {phase !== 'idle' && phase !== 'tool-form' && phase !== 'form-platform' && (
          <AnsweredBlock items={[
            { question: 'Which platform are you targeting?', answer: `${formPlatform} · ${PLATFORM_RATIOS[formPlatform] ?? ''}` },
            { question: 'How many images in this post?', answer: formImageCount },
          ]} />
        )}

        {/* Thinking indicator */}
        {phase === 'form-thinking' && (
          <div className="ac2-typing"><span /><span /><span /></div>
        )}

        {/* Conflict confirmation */}
        {phase === 'form-conflict' && initialTheme && (() => {
          const conflict = detectThemeConflict(userPrompt, initialTheme)
          return conflict ? (
            <ConflictConfirmCard conflict={conflict} theme={initialTheme} config={config} onConfirm={handleConflictChoice} />
          ) : null
        })()}

        {/* Conflict choice answered */}
        {formConflictChoice && phase !== 'form-conflict' && (
          <AnsweredBlock items={[{ question: 'Visual direction', answer: formConflictChoice }]} />
        )}

        {/* No-conflict confirm message */}
        {(phase === 'form' || phase === 'submitting') && !formConflictChoice && (
          <div className="ac2-agent-row">
            <div className="ac2-agent-av">AI</div>
            <div className="ac2-agent-bubble">
              {buildBaseConfirmMessage(formPlatform, formImageCount, initialTheme ?? null)}
            </div>
          </div>
        )}

        {/* Step 2 — Campaign details form */}
        {(phase === 'form' || phase === 'submitting') && (
          <CampaignDetailsCard config={config} onConfirm={handleFormConfirm} initialTheme={initialTheme} initialTone={initialTone} initialPlatform={formPlatform} initialImageCount={formImageCount} />
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
