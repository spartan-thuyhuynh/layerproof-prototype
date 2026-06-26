import type { BrandKit, SpectrumAxis } from '@/features/brand-kit/types/brand'
import { DEFAULT_VOICE_SPECTRUM } from '@/features/brand-kit/types/brand'
import type { EditorActions } from './types'

/* ── Generate example text from current spectrum values ─────── */
const SPECTRUM_EXAMPLES: Record<string, string> = {
  '0-0-0-0': "We regret to inform you that a technical error has occurred. Please contact our support team if the issue persists.",
  '0-0-0-1': "We're sorry for the inconvenience. A technical error has occurred — our team is already working on it.",
  '0-0-0-2': "We sincerely apologise! A technical error has occurred and we are actively resolving it. Thank you for your patience!",
  '0-0-1-0': "A system error has been detected. We are addressing the issue.",
  '0-0-1-1': "Something went wrong on our end. We're working to resolve it as quickly as possible.",
  '0-0-1-2': "We hit a snag! Something went wrong on our end, but we're on the case and working hard to fix it!",
  '0-1-0-1': "Something went sideways on our end. We're working to fix it — thank you for your patience.",
  '0-1-1-1': "Looks like we ran into a problem. We're already on it — sorry for the trouble.",
  '1-0-0-0': "Something went wrong on our end. We're working on it.",
  '1-0-0-1': "We're sorry — something went wrong on our end. We're working to get it sorted quickly.",
  '1-0-1-0': "There's an error on our end. We're looking into it.",
  '1-1-1-1': "Oops! We hit a snag on our end. Hang tight — we're on it.",
  '1-1-1-2': "Oops! Something broke on our side — but we're already working on a fix. Hang tight!",
  '1-2-1-2': "Oh no! We managed to break something — classic us. We're fixing it right now!",
  '2-0-0-0': "Something went wrong on our end. We're working on fixing it.",
  '2-0-0-1': "Sorry about that! Something went wrong on our side. We're on it.",
  '2-1-0-1': "Oops! Something broke on our end. We're fixing it — thanks for bearing with us!",
  '2-1-1-1': "Uh oh! Something broke on our side. We're fixing it now — sorry for the trouble!",
  '2-1-1-2': "Oops! Something broke on our side, but we're already on it — sit tight!",
  '2-2-1-2': "Well, this is embarrassing! Something went sideways on our end. We're on the case!",
  '2-2-2-2': "Welp, we broke something. Our bad! We're fixing it faster than you can say 'refresh'.",
}

function generateExample(axes: SpectrumAxis[]): string {
  const vals = axes.map((a) => Math.min(Math.max(a.value, 0), a.stops.length - 1))
  const key = vals.join('-')
  if (SPECTRUM_EXAMPLES[key]) return SPECTRUM_EXAMPLES[key]

  // Nearest match by Manhattan distance
  let best = ''
  let bestDist = Infinity
  for (const [k, v] of Object.entries(SPECTRUM_EXAMPLES)) {
    const parts = k.split('-').map(Number)
    const dist = parts.reduce((sum, p, i) => sum + Math.abs(p - (vals[i] ?? 0)), 0)
    if (dist < bestDist) { bestDist = dist; best = v }
  }
  return best
}

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
  const example = generateExample(axes)

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
