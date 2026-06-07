import type { ReactNode } from 'react'
import { Wand } from '@/icons'

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

export function EditHint() {
  return (
    <div className="edit-hint">
      <Wand /> Click any value to edit
    </div>
  )
}
