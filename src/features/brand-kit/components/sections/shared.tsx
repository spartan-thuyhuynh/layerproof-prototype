import type { ReactNode } from 'react'
import { Wand, X, Info } from '@/shared/icons'
import { Tip } from '@/shared/components/ui/Tip'

interface SecHeadProps {
  title: string
  desc?: string
  right?: ReactNode
}

export function SecHead({ title, desc, right }: SecHeadProps) {
  return (
    <div className="sec-head">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <h2 className="h2">{title}</h2>
        {desc && (
          <Tip label={desc} side="right">
            <span className="section-info-icon"><Info style={{ width: 20, height: 20 }} /></span>
          </Tip>
        )}
      </div>
      {right}
    </div>
  )
}

interface BannerProps {
  tag?: string
  title?: ReactNode
  description: ReactNode
  onDismiss?: () => void
  style?: React.CSSProperties
  singleColumn?: boolean
}

export function Banner({ tag, title, description, onDismiss, style, singleColumn }: BannerProps) {
  return (
    <div className={`ov-banner${singleColumn ? ' ov-banner--single' : ''}`} style={{ position: 'relative', ...style }}>
      {(tag || title) && (
        <div className="ov-banner-left">
          {tag && <div className="ov-banner-tag">{tag}</div>}
          {title && <h2 className="ov-banner-title">{title}</h2>}
        </div>
      )}
      <div className="ov-banner-right">{description}</div>
      {onDismiss && (
        <Tip label="Dismiss" side="top">
          <button
            onClick={onDismiss}
            style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.background = 'none' }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </Tip>
      )}
    </div>
  )
}

export function EditHint() {
  return (
    <div className="edit-hint">
      <Wand /> Click any value to edit
    </div>
  )
}
