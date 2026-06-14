import { useState, useRef } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import type { EditorActions } from '@/features/brand-kit/components/sections/types'
import { X, Globe, Chevron } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'
import { SaveableField } from '@/features/brand-kit/components/edit/SaveableField'

interface VoicePickerModalProps {
  kit: BrandKit
  ed: EditorActions
  onClose: () => void
  onDone: () => void
}

/* ── Language options ─────────────────────────────────────────── */
const LANGUAGES = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German',
  'Portuguese', 'Italian', 'Dutch', 'Japanese', 'Korean', 'Chinese (Simplified)',
]

/* ── Text density options ─────────────────────────────────────── */
const DENSITY_OPTIONS = [
  {
    key: 'minimal' as const,
    label: 'Minimal',
    desc: 'Focus on visuals over text.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M3 13l4-4 4 4 3-3 4 4" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'concise' as const,
    label: 'Concise',
    desc: 'Combine visuals with text.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" style={{ width: 22, height: 22 }}>
        <line x1="3" y1="8" x2="21" y2="8" />
        <line x1="3" y1="14" x2="15" y2="14" />
      </svg>
    ),
  },
  {
    key: 'detailed' as const,
    label: 'Detailed',
    desc: 'Use concise paragraphs to explain.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" style={{ width: 22, height: 22 }}>
        <line x1="3" y1="6"  x2="21" y2="6" />
        <line x1="3" y1="11" x2="21" y2="11" />
        <line x1="3" y1="16" x2="17" y2="16" />
      </svg>
    ),
  },
]

/* ── Word tag chip ────────────────────────────────────────────── */
function WordTag({ word, onRemove }: { word: string; onRemove: () => void }) {
  return (
    <span className="voice-tag">
      {word}
      <button className="voice-tag-x" onClick={onRemove} title="Remove">
        <X style={{ width: 11, height: 11 }} />
      </button>
    </span>
  )
}

/* ── Words to avoid ───────────────────────────────────────────── */
function WordsToAvoid({ words, ed }: { words: string[]; ed: EditorActions }) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addWord(raw: string) {
    const w = raw.trim()
    if (w && !words.includes(w)) ed.setVal(['tone', 'avoid'], [...words, w])
    setInput('')
  }

  return (
    <div className="voice-words-wrap">
      {words.map((w, i) => (
        <WordTag
          key={i}
          word={w}
          onRemove={() => {
            const next = [...words]; next.splice(i, 1)
            ed.setVal(['tone', 'avoid'], next)
          }}
        />
      ))}
      <input
        ref={inputRef}
        className="voice-tag-input"
        placeholder="Type and press Enter…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addWord(input) }
          if (e.key === 'Backspace' && !input && words.length) {
            const next = [...words]; next.pop(); ed.setVal(['tone', 'avoid'], next)
          }
        }}
        onBlur={() => { if (input.trim()) addWord(input) }}
      />
    </div>
  )
}

/* ── Modal ────────────────────────────────────────────────────── */
export function VoicePickerModal({ kit, ed, onClose, onDone }: VoicePickerModalProps) {
  const language = kit.tone.language ?? 'English (US)'
  const density  = kit.tone.textDensity ?? 'minimal'

  return (
    <Portal>
      <div className="scrim" onClick={onClose}>
        <div
          className="modal"
          style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="mhead" style={{ flexShrink: 0 }}>
            <button className="x" onClick={onClose}>
              <X style={{ width: 16, height: 16 }} />
            </button>
            <div className="cum-title">Brand Voice</div>
            <div className="cum-hint">Define how your brand sounds and communicates</div>
          </div>

          {/* scrollable body */}
          <div className="mbody" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Output language */}
            <div className="voice-section-card">
              <div className="voice-section-title">Output language</div>
              <div className="voice-lang-select-wrap" style={{ marginTop: 12 }}>
                <Globe style={{ width: 16, height: 16, color: 'var(--t2)', flexShrink: 0 }} />
                <select
                  className="voice-lang-select"
                  value={language}
                  onChange={(e) => ed.setVal(['tone', 'language'], e.target.value)}
                >
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <Chevron style={{ width: 14, height: 14, color: 'var(--t2)', flexShrink: 0, pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Amount of text */}
            <div className="voice-section-card">
              <div className="voice-section-title">Amount of text</div>
              <div className="voice-section-sub">Adjust the level of detail in the content</div>
              <div className="voice-density-grid">
                {DENSITY_OPTIONS.map(({ key, label, desc, icon }) => {
                  const active = density === key
                  return (
                    <button
                      key={key}
                      className={`voice-density-opt${active ? ' active' : ''}`}
                      onClick={() => ed.setVal(['tone', 'textDensity'], key)}
                    >
                      <span className="voice-density-icon">{icon}</span>
                      <span className="voice-density-label">{label}</span>
                      <span className="voice-density-desc">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Words to avoid */}
            <div className="voice-section-card">
              <div className="voice-section-title">Words to avoid</div>
              <div className="voice-section-sub">Avoid using these words when creating content</div>
              <WordsToAvoid words={kit.tone.avoid} ed={ed} />
            </div>

            {/* Custom instruction */}
            <div className="voice-section-card">
              <div className="voice-section-title">Custom instruction</div>
              <div className="voice-section-sub">Free-form description of the desired tone, personality, or style.</div>
              <SaveableField
                value={kit.tone.customInstruction ?? ''}
                onSave={(v) => ed.setVal(['tone', 'customInstruction'], v)}
                placeholder="Describe your desired tone…"
                resetKey={kit.id}
                rows={4}
              />
            </div>

          </div>

          {/* footer */}
          <div className="mfoot" style={{ flexShrink: 0 }}>
            <button className="btn ghost sm" onClick={onClose}>Cancel</button>
            <button className="btn primary sm" onClick={onDone}>Done</button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
