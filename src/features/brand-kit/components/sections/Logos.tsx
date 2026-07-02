import { useState } from 'react'
import type { BrandKit, LogoVariant } from '@/features/brand-kit/types/brand'
import type { EditorActions } from './types'
import { X, Info } from '@/shared/icons'
import { Tip } from '@/shared/components/ui/Tip'
import { CategoryUploadModal } from '@/features/brand-kit/components/modals/CategoryUploadModal'
import { Portal } from '@/shared/lib/Portal'

interface LogosProps {
  kit: BrandKit
  ed: EditorActions
}

/* ── full-size lightbox ─────────────────────────────────────── */
function LogoLightbox({ variant, onClose }: { variant: LogoVariant; onClose: () => void }) {
  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="logo-lightbox" onClick={(e) => e.stopPropagation()}>
        <button className="logo-lightbox-close" onClick={onClose}>
          <X style={{ width: 16, height: 16 }} />
        </button>
        <div className="logo-lightbox-img-wrap" style={{ background: variant.bg ?? '#0a0a0a' }}>
          {variant.src && <img src={variant.src} alt={variant.name} className="logo-lightbox-img" />}
        </div>
        <div className="logo-lightbox-footer">
          <span className="logo-file-name">{toFilename(variant.name)}</span>
          {variant.size && <span className="logo-file-size">{variant.size}</span>}
        </div>
      </div>
    </div>
    </Portal>
  )
}

export function Logos({ kit }: LogosProps) {
  const variants = kit.logos.variants
  const count = variants.length
  const [active, setActive] = useState<LogoVariant | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="fade-in logos-page">
      <div className="logos-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 className="logos-page-title">Logos ({count})</h2>
            <Tip label="Add your brand's logo to keep your branding consistent" side="right">
              <span className="section-info-icon"><Info style={{ width: 20, height: 20 }} /></span>
            </Tip>
          </div>
        </div>
        <button className="logos-upload-btn" onClick={() => setShowUpload(true)}>Upload Logos</button>
      </div>

      <div className="logos-card-grid">
        {variants.map((v, i) => (
          <div key={i} className="logo-file-card" onClick={() => v.src && setActive(v)} style={{ cursor: v.src ? 'pointer' : 'default' }}>
            <div className="logo-file-preview" style={{ background: v.bg ?? '#0a0a0a' }}>
              {v.src && <img src={v.src} alt={v.name} className="logo-file-img" />}
            </div>
            <div className="logo-file-info">
              <span className="logo-file-name">{toFilename(v.name)}</span>
              {v.size && <span className="logo-file-size">{v.size}</span>}
            </div>
          </div>
        ))}

        {count === 0 && (
          <div className="logos-empty">No logos yet. Click &ldquo;Upload Logos&rdquo; to add your first.</div>
        )}
      </div>

      {active && <LogoLightbox variant={active} onClose={() => setActive(null)} />}

      {showUpload && (
        <CategoryUploadModal
          categoryId="logos"
          onClose={() => setShowUpload(false)}
          onDone={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}

function toFilename(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_') + '.png'
}
