import { useState, useRef } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { X } from '@/shared/icons'
import type { EditorActions } from './types'
import { VoiceSpectrum } from './VoiceSpectrum'

interface ToneProps {
  kit: BrandKit
  ed: EditorActions
}

/* ── Language options ─────────────────────────────────────────── */
/* ── Text density options ─────────────────────────────────────── */
const DENSITY_OPTIONS = [
  {
    key: 'minimal' as const,
    label: 'Minimal',
    desc: 'Focus on visuals over text.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 22, height: 22 }}>
        <line x1="3" y1="8" x2="21" y2="8" />
        <line x1="3" y1="14" x2="15" y2="14" />
      </svg>
    ),
  },
  {
    key: 'detailed' as const,
    label: 'Detailed',
    desc: 'Use concise paragraph to explain.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 22, height: 22 }}>
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

/* ── Words to avoid section ───────────────────────────────────── */
function WordsToAvoid({ words, ed }: { words: string[]; ed: EditorActions }) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addWord(raw: string) {
    const w = raw.trim()
    if (w && !words.includes(w)) {
      ed.setVal(['tone', 'avoid'], [...words, w])
    }
    setInput('')
  }

  return (
    <div className="voice-words-wrap">
      {words.map((w, i) => (
        <WordTag
          key={i}
          word={w}
          onRemove={() => {
            const next = [...words]
            next.splice(i, 1)
            ed.setVal(['tone', 'avoid'], next)
          }}
        />
      ))}
      <input
        ref={inputRef}
        className="voice-tag-input"
        placeholder="Add word…"
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

/* ── Target audience ─────────────────────────────────────────── */
const GENDER_OPTIONS = ['All genders', 'Male', 'Female', 'Non-binary']

const LOCATION_OPTIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Netherlands', 'Japan', 'South Korea',
  'China', 'India', 'Brazil', 'Mexico', 'Singapore', 'UAE', 'South Africa',
  'Global',
]

function TargetAudience({ kit, ed }: { kit: BrandKit; ed: EditorActions }) {
  const ageMin    = kit.tone.ageMin    ?? 25
  const ageMax    = kit.tone.ageMax    ?? 44
  const gender    = kit.tone.gender    ?? 'All genders'
  const locations = kit.tone.locations ?? []

  function addLocation(loc: string) {
    if (loc && !locations.includes(loc)) {
      ed.setVal(['tone', 'locations'], [...locations, loc])
    }
  }

  return (
    <div className="audience-grid">
      {/* ── Who you're speaking to ── */}
      <div>
        <div className="voice-section-title">Who you're speaking to</div>
        <div className="audience-fields">
          <div className="audience-field-group">
            <label className="audience-label">Age</label>
            <div className="audience-age-row">
              <input
                type="number"
                className="audience-age-input"
                value={ageMin}
                min={0}
                max={ageMax}
                onChange={(e) => ed.setVal(['tone', 'ageMin'], Number(e.target.value))}
              />
              <span className="audience-age-sep">to</span>
              <input
                type="number"
                className="audience-age-input"
                value={ageMax}
                min={ageMin}
                max={120}
                onChange={(e) => ed.setVal(['tone', 'ageMax'], Number(e.target.value))}
              />
            </div>
          </div>
          <div className="audience-field-group">
            <label className="audience-label">Gender</label>
            <select
              className="audience-select"
              value={gender}
              onChange={(e) => ed.setVal(['tone', 'gender'], e.target.value)}
            >
              {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Audience locations ── */}
      <div>
        <div className="voice-section-title">Audience</div>
        <div className="audience-field-group">
          <label className="audience-label">Primary Market Locations</label>
          <div className="audience-locations">
            {locations.map((loc, i) => (
              <span key={i} className="audience-loc-tag">
                {loc}
                <button
                  className="voice-tag-x"
                  onClick={() => {
                    const next = [...locations]; next.splice(i, 1)
                    ed.setVal(['tone', 'locations'], next)
                  }}
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              </span>
            ))}
            <select
              className="audience-loc-select"
              value=""
              onChange={(e) => { if (e.target.value) addLocation(e.target.value) }}
            >
              <option value="" disabled>Select location…</option>
              {LOCATION_OPTIONS.filter((l) => !locations.includes(l)).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export function Tone({ kit, ed }: ToneProps) {
  const density  = kit.tone.textDensity ?? 'minimal'

  return (
    <div className="fade-in voice-page">
      {/* header */}
      <div className="voice-page-header">
        <h2 className="voice-page-title">Brand Voice</h2>
        <p className="voice-page-sub">
          How your copy should sound to engage and resonate with your audience
        </p>
      </div>

      {/* ── Target audience ── */}
      <div className="voice-section-card">
        <TargetAudience kit={kit} ed={ed} />
      </div>

{/* ── Amount of text ── */}
      <div className="voice-section-card">
        <div className="voice-section-title">Amount of text</div>
        <div className="voice-section-sub">Adjust the level of detail in the slide content</div>
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

      {/* ── Voice spectrum ── */}
      <VoiceSpectrum kit={kit} ed={ed} />

      {/* ── Words to avoid ── */}
      <div className="voice-section-card">
        <div className="voice-section-title">Words to avoid</div>
        <div className="voice-section-sub">Avoid using these words when creating content</div>
        <WordsToAvoid words={kit.tone.avoid} ed={ed} />
      </div>

      {/* ── Custom instruction ── */}
      <div className="voice-section-card">
        <div className="voice-section-title">Custom instruction</div>
        <div className="voice-section-sub">Free-form description of the desired tone, personality, or style.</div>
        <textarea
          className="voice-custom-textarea"
          placeholder="Describe your desired tone..."
          defaultValue={kit.tone.customInstruction ?? ''}
          key={kit.id}
          rows={4}
          onBlur={(e) => ed.setVal(['tone', 'customInstruction'], e.target.value)}
        />
      </div>
    </div>
  )
}
