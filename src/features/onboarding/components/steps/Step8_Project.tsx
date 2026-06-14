import { useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import type { ProductId } from '@/features/onboarding/store/useOnboardingStore'
import { ArrowRight } from '@/shared/icons'

/* ── product config ─────────────────────────────────────────── */

interface ProductConfig {
  label: string
  placeholder: string
  extraSection: React.FC<ExtraProps>
}

interface ExtraProps {
  meta: Record<string, string>
  setMeta: (key: string, val: string) => void
}

function ChipGroup({ options, value, onChange }: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="onb-chip-group">
      {options.map((opt) => (
        <button
          key={opt}
          className={`onb-chip-btn${value === opt ? ' active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

const MatteExtra: React.FC<ExtraProps> = ({ meta, setMeta }) => (
  <div className="onb-field">
    <label className="onb-label">Format</label>
    <ChipGroup
      options={['Instagram Square', 'LinkedIn Banner', 'Story (9:16)', 'X Post']}
      value={meta.format ?? ''}
      onChange={(v) => setMeta('format', v)}
    />
  </div>
)

const ChromoExtra: React.FC<ExtraProps> = ({ meta, setMeta }) => (
  <>
    <div className="onb-field">
      <label className="onb-label">Number of slides</label>
      <ChipGroup
        options={['5', '10', '15', '20+']}
        value={meta.slides ?? ''}
        onChange={(v) => setMeta('slides', v)}
      />
    </div>
    <div className="onb-field">
      <label className="onb-label">Topic or theme <span className="tiny" style={{ marginLeft: 4 }}>optional</span></label>
      <textarea
        className="onb-input onb-textarea"
        placeholder="e.g. Q3 product launch, investor pitch, onboarding deck"
        value={meta.topic ?? ''}
        rows={3}
        onChange={(e) => setMeta('topic', e.target.value)}
      />
    </div>
  </>
)

const VellumExtra: React.FC<ExtraProps> = ({ meta, setMeta }) => (
  <>
    <div className="onb-field">
      <label className="onb-label">Describe the image you want</label>
      <textarea
        className="onb-input onb-textarea"
        placeholder="e.g. A hero banner with a dark gradient and a single bright accent color"
        value={meta.prompt ?? ''}
        rows={3}
        onChange={(e) => setMeta('prompt', e.target.value)}
      />
    </div>
    <div className="onb-field">
      <label className="onb-label">Aspect ratio</label>
      <ChipGroup
        options={['1:1', '16:9', '4:5', '9:16']}
        value={meta.ratio ?? ''}
        onChange={(v) => setMeta('ratio', v)}
      />
    </div>
  </>
)

const KraftExtra: React.FC<ExtraProps> = ({ meta, setMeta }) => (
  <div className="onb-field">
    <label className="onb-label">Content type</label>
    <ChipGroup
      options={['Blog Post', 'Brand Brief', 'Report', 'Newsletter']}
      value={meta.contentType ?? ''}
      onChange={(v) => setMeta('contentType', v)}
    />
  </div>
)

const PRODUCT_CONFIG: Record<ProductId, ProductConfig> = {
  matte:  { label: 'Matte post',   placeholder: 'My First Social Post', extraSection: MatteExtra },
  chromo: { label: 'Chromo deck',  placeholder: 'Q3 Launch Deck',       extraSection: ChromoExtra },
  vellum: { label: 'Vellum image', placeholder: 'Hero Banner',          extraSection: VellumExtra },
  kraft:  { label: 'Kraft doc',    placeholder: 'Brand Brief',          extraSection: KraftExtra },
}

/* ── component ──────────────────────────────────────────────── */

export function Step8_Project() {
  const { selectedProduct, projectName, projectMeta, setProjectName, setProjectMeta, nextStep } = useOnboardingStore()

  const product = selectedProduct ?? 'matte'
  const config  = PRODUCT_CONFIG[product]
  const Extra   = config.extraSection

  const canCreate = projectName.trim().length > 0

  return (
    <div className="onb-step fade-in">
      <div className="h-eyebrow" style={{ marginBottom: 10 }}>Almost there</div>
      <h1 className="onb-step-title">Name your {config.label}</h1>
      <p className="onb-step-sub">
        Your brand kit will be applied automatically to everything you generate.
      </p>

      <div className="onb-field">
        <label className="onb-label">Project name <span style={{ color: 'var(--c-red)' }}>*</span></label>
        <input
          className="onb-input"
          type="text"
          placeholder={config.placeholder}
          value={projectName}
          autoFocus
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canCreate && nextStep()}
        />
      </div>

      <Extra
        meta={projectMeta}
        setMeta={setProjectMeta}
      />

      <button
        className="btn primary onb-cta"
        disabled={!canCreate}
        onClick={nextStep}
      >
        Create <ArrowRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  )
}
