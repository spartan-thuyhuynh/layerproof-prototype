import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'

interface Props {
  config: ProductConfig
  onSubmit: (prompt: string) => void
}

const SUGGESTIONS: Record<string, string[]> = {
  'social-post':  ['Product launch for summer collection', 'Behind-the-scenes team spotlight', 'Weekly tips carousel', 'Customer success story', 'Seasonal giveaway campaign', 'New feature announcement'],
  'docs':         ['Q3 performance report', 'Product roadmap 2025', 'Onboarding guide for new hires', 'Competitive analysis brief', 'Engineering RFC template', 'Sprint retrospective notes'],
  'space':        ['Minimalist product on white background', 'Lifestyle shot for summer campaign', 'Abstract brand pattern in brand colors', 'Team headshot series', 'Event banner hero image', 'Social ad creative set'],
  'presentation': ['Investor pitch deck — Series A', 'Product demo for enterprise sales', 'Team all-hands update', 'Quarterly business review', 'Design thinking workshop', 'Go-to-market strategy'],
  'design':       ['Instagram ad set — 3 sizes', 'Brand logo refresh', 'Event banner 1920×1080', 'Email header template', 'Icon set for mobile app', 'Packaging mockup'],
  'app':          ['SaaS landing page with CTA', 'Portfolio site with case studies', 'Product waitlist page', 'Pricing comparison page', 'App onboarding flow', 'Interactive product demo'],
}

function getSuggestions(slug: string): string[] {
  return SUGGESTIONS[slug] ?? []
}

function pickThree(all: string[], offset: number): string[] {
  const len = all.length
  return [all[offset % len], all[(offset + 1) % len], all[(offset + 2) % len]]
}

export function PromptScreen({ config, onSubmit }: Props) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [shuffleIdx, setShuffleIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const Icon = I.Icons[config.icon]

  const allSuggestions = getSuggestions(config.slug)
  const visibleSuggestions = pickThree(allSuggestions, shuffleIdx)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  function handleSubmit() {
    if (!prompt.trim()) return
    onSubmit(prompt.trim())
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  function handleShuffle() {
    setShuffleIdx(i => (i + 3) % allSuggestions.length)
  }

  return (
    <div className="cp-screen">
      <div className="cp-orb cp-orb-left" />
      <div className="cp-orb cp-orb-right" />

      <button className="cp-back" onClick={() => navigate('/onboarding', { state: { resumeFromCreate: true } })}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <div className="cp-center">
        <div className="cp-chip" style={{ color: config.color, borderColor: `${config.color}40`, background: `${config.color}14` }}>
          {Icon && <Icon style={{ width: 14, height: 14 }} />}
          {config.label}
        </div>

        <h1 className="cp-heading">{renderTitle(config.promptTitle)}</h1>
        <p className="cp-sub">{config.promptSub}</p>

        <div className="cp-input-wrap">
          <textarea
            ref={textareaRef}
            className="cp-textarea"
            placeholder={config.promptPlaceholder}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            rows={4}
          />
          <div className="cp-input-foot">
            <div className="cp-input-actions">
              <button className="cp-action-btn" title="Web search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </button>
              <button className="cp-action-btn" title="Attach file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
            </div>
            <div className="cp-input-right">
              <span className="cp-hint">⌘ + Enter to generate</span>
              <button
                className="cp-generate-btn"
                disabled={!prompt.trim()}
                onClick={handleSubmit}
                style={{ background: prompt.trim() ? config.color : undefined, color: prompt.trim() ? '#000' : undefined }}
              >
                Generate
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="cp-suggestions">
          <div className="cp-suggestions-chips">
            {visibleSuggestions.map(s => (
              <button key={s} className="cp-suggestion-chip" onClick={() => setPrompt(s)}>
                {s}
              </button>
            ))}
          </div>
          <button className="cp-shuffle-btn" onClick={handleShuffle} title="Shuffle suggestions">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
            Shuffle
          </button>
        </div>
      </div>
    </div>
  )
}

function renderTitle(title: string) {
  const parts = title.split(/\{([^}]+)\}/)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} style={{ color: '#ec4899' }}>{part}</span>
      : part
  )
}
