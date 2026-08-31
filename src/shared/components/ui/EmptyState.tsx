import type { ReactNode } from 'react'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  desc?: string
  action?: EmptyStateAction
  /** Tighter padding + smaller icon, for use inside sheets and cards. */
  compact?: boolean
  className?: string
}

export function EmptyState({ icon, title, desc, action, compact, className }: EmptyStateProps) {
  return (
    <div className={`empty-state${compact ? ' empty-state--compact' : ''}${className ? ` ${className}` : ''}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      {desc && <p className="empty-state-desc">{desc}</p>}
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
