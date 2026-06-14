import type { ReactNode } from 'react'
import { Wand, X } from '@/shared/icons'

interface SecHeadProps {
  title: string
  desc?: string
  right?: ReactNode
}

export function SecHead({ title, desc, right }: SecHeadProps) {
  return (
    <div className="sec-head">
      <div>
        <h2 className="h2">{title}</h2>
        {desc && <p className="sub" style={{ fontSize: 15 }}>{desc}</p>}
      </div>
      {right}
    </div>
  )
}

interface BannerProps {
  tag: string
  title: ReactNode
  description: ReactNode
  onDismiss?: () => void
  style?: React.CSSProperties
}

export function Banner({ tag, title, description, onDismiss, style }: BannerProps) {
  return (
    <div className="ov-banner" style={{ position: 'relative', ...style }}>
      <div className="ov-banner-left">
        <div className="ov-banner-tag">{tag}</div>
        <h2 className="ov-banner-title">{title}</h2>
      </div>
      <div className="ov-banner-right">{description}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          title="Dismiss"
          style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.background = 'none' }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
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
