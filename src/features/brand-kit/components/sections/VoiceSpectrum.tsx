import type { BrandKit, SpectrumAxis } from '@/features/brand-kit/types/brand'
import { DEFAULT_VOICE_SPECTRUM, DEFAULT_SPECTRUM_EXAMPLE } from '@/features/brand-kit/types/brand'
import type { EditorActions } from './types'

interface VoiceSpectrumProps {
  kit: BrandKit
  ed: EditorActions
}

/* ── One bipolar dimension with anchor stops (NN/g style) ─────── */
function SpectrumRow({
  axis,
  onSelect,
}: {
  axis: SpectrumAxis
  onSelect: (index: number) => void
}) {
  const stops = axis.stops
  const last = stops.length - 1
  const value = Math.min(Math.max(axis.value, 0), last)
  const active = stops[value]
  const pct = (i: number) => (last > 0 ? (i / last) * 100 : 50)

  return (
    <div className="vspec-row">
      <span className="vspec-pole left">{stops[0]?.label}</span>

      <div className="vspec-track-wrap">
        <div className="vspec-track" />
        {/* anchor stops */}
        {stops.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`vspec-anchor${i === value ? ' active' : ''}`}
            style={{ left: `${pct(i)}%` }}
            title={`${s.label} — ${s.desc}`}
            onClick={() => onSelect(i)}
            aria-label={s.label}
          />
        ))}
        <input
          type="range"
          className="vspec-range"
          min={0}
          max={last}
          step={1}
          value={value}
          onChange={(e) => onSelect(Number(e.target.value))}
          aria-label={`${stops[0]?.label} to ${stops[last]?.label}`}
        />
      </div>

      <span className="vspec-pole right">{stops[last]?.label}</span>

      {/* active stop description */}
      <div className="vspec-desc">
        <strong>{active?.label}</strong> · {active?.desc}
      </div>
    </div>
  )
}

/* ── Voice spectrum card ──────────────────────────────────────── */
export function VoiceSpectrum({ kit, ed }: VoiceSpectrumProps) {
  const axes = kit.tone.spectrum ?? DEFAULT_VOICE_SPECTRUM
  const example = kit.tone.spectrumExample ?? DEFAULT_SPECTRUM_EXAMPLE

  function select(idx: number, index: number) {
    const next = axes.map((a, i) => (i === idx ? { ...a, value: index } : a))
    ed.setVal(['tone', 'spectrum'], next)
  }

  return (
    <div className="voice-section-card">
      <div className="voice-section-title">Voice spectrum</div>
      <div className="voice-section-sub">
        Position each dimension of your tone of voice between the two extremes.
      </div>

      <div className="vspec-layout">
        {/* example callout */}
        <div className="vspec-example">
          <div className="vspec-example-label">Example</div>
          <div className="vspec-example-text">“{example}”</div>
        </div>

        {/* dimensions */}
        <div className="vspec-dims">
          {axes.map((axis, idx) => (
            <SpectrumRow key={axis.id} axis={axis} onSelect={(v) => select(idx, v)} />
          ))}
        </div>
      </div>
    </div>
  )
}
