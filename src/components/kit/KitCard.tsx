import type { BrandKit } from '@/types/brand'
import { Check } from '@/icons'

interface KitCardProps {
  kit: BrandKit
  applied: boolean
  onOpen: () => void
  onApply: () => void
}

export function KitCard({ kit, applied, onOpen, onApply }: KitCardProps) {
  return (
    <div className="card kitcard hover" onClick={onOpen}>
      <div className="swatchbar">
        {kit.swatches.map((c, i) => <i key={i} style={{ background: c }} />)}
      </div>
      <div className="body">
        <div className="logo" style={{ marginLeft: 2, ...kit.logoStyle }}>{kit.logoText}</div>
        <div className="ktitle">{kit.name}</div>
        <div className="kmeta">{kit.tagline} · {kit.assets} assets</div>
        <div className="kfoot">
          {applied
            ? <span className="applied-badge"><Check /> Applied</span>
            : (
              <button
                className="btn sm"
                onClick={(e) => { e.stopPropagation(); onApply() }}
              >Apply</button>
            )
          }
          <span className="tiny">{kit.updated}</span>
        </div>
      </div>
    </div>
  )
}
