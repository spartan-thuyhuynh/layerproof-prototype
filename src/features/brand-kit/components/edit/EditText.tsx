import { useRef, useEffect, type CSSProperties, type ElementType } from 'react'
import { cn } from '@/shared/lib/utils'

interface EditTextProps {
  value: string | number
  onCommit: (v: string | number) => void
  multiline?: boolean
  numeric?: boolean
  placeholder?: string
  className?: string
  style?: CSSProperties
  tag?: ElementType
  suffix?: string
}

export function EditText({
  value,
  onCommit,
  multiline,
  numeric,
  placeholder,
  className,
  style,
  tag: Tag = 'span',
}: EditTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerText !== (value == null ? '' : String(value))) {
      ref.current.innerText = value == null ? '' : String(value)
    }
  }, [value])

  const commit = () => {
    if (!ref.current) return
    let t = ref.current.innerText.replace(/\s+$/, '')
    if (numeric) {
      const n = parseFloat(t.replace(/[^0-9.\-]/g, ''))
      if (isNaN(n)) { ref.current.innerText = String(value); return }
      if (n !== value) onCommit(n)
      else ref.current.innerText = String(value)
      return
    }
    t = t.trim()
    if (t !== value) onCommit(t)
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLDivElement>}
      className={cn('edit-text', className)}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={placeholder ?? ''}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) { e.preventDefault(); (ref.current as HTMLElement)?.blur() }
        if (e.key === 'Escape') {
          if (ref.current) ref.current.innerText = value == null ? '' : String(value)
          ;(ref.current as HTMLElement)?.blur()
        }
      }}
    />
  )
}
