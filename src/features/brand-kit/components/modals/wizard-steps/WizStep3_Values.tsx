import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { BRAND_VALUES } from '@/features/brand-kit/data/brand-values'

export function WizStep3_Values() {
  const { values, differentiator, setField } = useWizardStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = BRAND_VALUES.filter(
    (v) => !values.includes(v) && (
      query.trim() === '' || v.toLowerCase().includes(query.toLowerCase())
    )
  )

  function add(v: string) {
    if (!values.includes(v) && values.length < 5) {
      setField('values', [...values, v])
    }
    setQuery('')
    inputRef.current?.focus()
  }

  function remove(v: string) {
    setField('values', values.filter((x) => x !== v))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && query === '' && values.length > 0) {
      remove(values[values.length - 1])
    }
    if (e.key === 'Enter' && query.trim()) {
      const match = BRAND_VALUES.find(
        (v) => v.toLowerCase() === query.trim().toLowerCase()
      )
      if (match) add(match)
    }
  }

  const atMax = values.length >= 5

  return (
    <div className="biz-step">
      <div>
        <h1 className="biz-step-title">What does your brand stand for?</h1>
        <p className="biz-step-sub">Add 3–5 values that define your brand's character.</p>
      </div>

      <div className="biz-val-wrap">
        {/* Tag input */}
        <div className="biz-val-input-row" onClick={() => inputRef.current?.focus()}>
          {values.map((v) => (
            <span key={v} className="biz-val-tag">
              {v}
              <button className="biz-val-tag-remove" onClick={(e) => { e.stopPropagation(); remove(v) }}>
                <X size={10} />
              </button>
            </span>
          ))}
          {!atMax && (
            <input
              ref={inputRef}
              className="biz-val-input"
              placeholder={values.length === 0 ? 'Search or pick values…' : 'Add more…'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>

        <div className="biz-val-count">{values.length} / 5</div>

        {/* Suggestion chips */}
        {!atMax && (
          <div className="biz-val-suggestions">
            {suggestions.slice(0, 8).map((v) => (
              <button key={v} className="biz-val-suggestion" onClick={() => add(v)}>
                + {v}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="onb-field">
        <label className="onb-label">
          What makes you different? <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional, 140 chars)</span>
        </label>
        <textarea
          className="onb-input onb-textarea"
          style={{ minHeight: 72 }}
          placeholder="e.g. We're the only platform that combines speed with handcrafted quality"
          maxLength={140}
          value={differentiator}
          onChange={(e) => setField('differentiator', e.target.value)}
        />
      </div>
    </div>
  )
}

export function WizStep3_Nav({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { values } = useWizardStore()
  return (
    <div className="biz-nav">
      <button className="biz-nav-back-link" onClick={onBack}>← Back</button>
      <button className="btn primary" disabled={values.length < 3} onClick={onNext}>Continue →</button>
    </div>
  )
}
