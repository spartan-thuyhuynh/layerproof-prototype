import type { BrandKit } from '@/types/brand'
import type { EditorActions } from './types'
import { SaveableField } from '@/components/edit/SaveableField'

interface ImageryProps {
  kit: BrandKit
  ed: EditorActions
}

/* ── Upload icon (inline) ─────────────────────────────────────── */
function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

/* ── Asset card ───────────────────────────────────────────────── */
function AssetCard({ name, size, preview }: { name: string; size: string; preview?: string }) {
  const ext = name.split('.').pop()?.toUpperCase() ?? 'FILE'
  const bg = preview ?? 'linear-gradient(135deg,#1c1c1c,#2e2e2e)'

  return (
    <div className="logo-file-card">
      <div className="asset-preview-cover" style={{ background: bg }}>
        <span className="asset-ext-badge">{ext}</span>
      </div>
      <div className="logo-file-info">
        <span className="logo-file-name" title={name}>{name}</span>
        <span className="logo-file-size">{size}</span>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export function Imagery({ kit, ed }: ImageryProps) {
  const assets = kit.imagery.assets ?? []

  return (
    <div className="fade-in assets-page">
      {/* ── header ── */}
      <div className="assets-page-header">
        <div>
          <h2 className="assets-page-title">Image Assets</h2>
          <p className="assets-page-sub">
            Incorporate visual elements and brand assets to maintain design consistency
          </p>
        </div>
        <button className="assets-upload-btn">
          <UploadIcon /> Upload Images
        </button>
      </div>

      {/* ── Visual Style Rules card ── */}
      <div className="assets-style-card">
        <div>
          <div className="assets-style-title">Visual Style Rules</div>
          <div className="assets-style-sub">Set the image style that best reflects your brand</div>
        </div>
        <SaveableField
          value={kit.imagery.styleDesc ?? kit.imagery.desc}
          onSave={(v) => ed.setVal(['imagery', 'styleDesc'], v)}
          placeholder="Describe your desired image style..."
          resetKey={kit.id}
          rows={4}
        />
      </div>

      {/* ── Uploaded grid ── */}
      {assets.length > 0 && (
        <div className="assets-grid-section">
          <div className="assets-grid-label">Uploaded ({assets.length})</div>
          <div className="logos-card-grid">
            {assets.map((a, i) => (
              <AssetCard key={i} name={a.name} size={a.size} preview={a.preview} />
            ))}
          </div>
        </div>
      )}

      {assets.length === 0 && (
        <div className="assets-empty">
          <div className="assets-empty-icon">
            <UploadIcon />
          </div>
          <div className="assets-empty-text">No images uploaded yet</div>
          <div className="assets-empty-sub">Click &ldquo;Upload Images&rdquo; to add your brand assets</div>
        </div>
      )}
    </div>
  )
}
