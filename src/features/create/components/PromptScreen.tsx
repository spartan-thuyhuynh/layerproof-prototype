import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'

interface Props {
  config: ProductConfig
  onSubmit: (prompt: string) => void
}

export function PromptScreen({ config, onSubmit }: Props) {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const Icon = I.Icons[config.icon]

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

  return (
    <div className="cp-screen" style={{ background: config.gradient }}>
      <button className="cp-back" onClick={() => navigate('/home')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to Home
      </button>

      <div className="cp-center">
        <div className="cp-chip" style={{ color: config.color, borderColor: `${config.color}40`, background: `${config.color}14` }}>
          {Icon && <Icon style={{ width: 14, height: 14 }} />}
          {config.label}
        </div>

        <h1 className="cp-heading">What do you want to create?</h1>
        <p className="cp-sub">Describe your idea and LayerProof will set up your workspace.</p>

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
            <span className="cp-hint">⌘ + Enter to generate</span>
            <button
              className="cp-generate-btn"
              disabled={!prompt.trim()}
              onClick={handleSubmit}
              style={{ background: prompt.trim() ? config.color : undefined }}
            >
              Generate
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="cp-suggestions">
          <span className="cp-suggestions-label">Try:</span>
          {getSuggestions(config.slug).map(s => (
            <button key={s} className="cp-suggestion-chip" onClick={() => setPrompt(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getSuggestions(slug: string): string[] {
  const map: Record<string, string[]> = {
    'social-post':    ['Product launch for summer collection', 'Behind-the-scenes team spotlight', 'Weekly tips carousel'],
    'docs':           ['Q3 performance report', 'Product roadmap 2025', 'Onboarding guide for new hires'],
    'space':          ['Marketing team asset hub', 'Campaign folder for Q4', 'Client presentation library'],
    'presentation':   ['Investor pitch deck — Series A', 'Product demo for enterprise sales', 'Team all-hands update'],
    'design':         ['Instagram ad set — 3 sizes', 'Brand logo refresh', 'Event banner 1920×1080'],
    'app':            ['SaaS landing page with CTA', 'Portfolio site with case studies', 'Product waitlist page'],
  }
  return map[slug] ?? []
}
