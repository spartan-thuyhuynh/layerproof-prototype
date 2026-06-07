import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { normHex } from '@/lib/utils'
import { Wand } from '@/icons'

interface EditColorProps {
  hex: string
  onCommit: (v: string) => void
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function EditColor({ hex, onCommit, className, style, children }: EditColorProps) {
  return (
    <label
      className={cn('edit-color', className)}
      style={{ background: hex, ...style }}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="color"
        value={normHex(hex)}
        onChange={(e) => onCommit(e.target.value.toUpperCase())}
      />
      <span className="edit-color-dot">
        <Wand />
      </span>
      {children}
    </label>
  )
}
