import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from '@/icons'
import { cn } from '@/lib/utils'

interface SaveableFieldProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  emptyLabel?: string          // what to show in view mode when value is empty
  rows?: number
  className?: string
  resetKey?: string | number   // change to force a reset (e.g. kit id)
}

/**
 * Two-mode field:
 *  - View mode  → compact text display + Edit (pencil) button
 *  - Edit mode  → full Textarea with Save / Cancel (shadcn Button)
 */
export function SaveableField({
  value,
  onSave,
  placeholder = 'Add a description…',
  emptyLabel,
  rows = 3,
  className,
  resetKey,
}: SaveableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value)
  const dirty = draft !== value
  const ref   = useRef<HTMLTextAreaElement>(null)

  // sync when external value or kit changes; exit edit mode
  useEffect(() => {
    setDraft(value)
    setEditing(false)
  }, [value, resetKey])

  // focus textarea when entering edit mode
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      resize(ref.current)
    }
  }, [editing])

  function resize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function handleSave() {
    onSave(draft)
    setEditing(false)
  }

  function handleCancel() {
    setDraft(value)
    setEditing(false)
  }

  /* ── view mode ── */
  if (!editing) {
    return (
      <div className={cn('sf-view', className)}>
        {value
          ? <p className="sf-view-text">{value}</p>
          : <p className="sf-view-empty">{emptyLabel ?? placeholder}</p>
        }
        <button className="sf-edit-btn" onClick={() => setEditing(true)} title="Edit">
          <Pencil style={{ width: 13, height: 13 }} />
        </button>
      </div>
    )
  }

  /* ── edit mode ── */
  return (
    <div className={cn('saveable-field', className)}>
      <Textarea
        ref={ref}
        className={cn('saveable-textarea', dirty && 'saveable-textarea--dirty')}
        placeholder={placeholder}
        value={draft}
        rows={rows}
        onChange={(e) => {
          setDraft(e.target.value)
          resize(e.target)
        }}
      />
      <div className="saveable-actions saveable-actions--visible">
        <Button
          variant="outline"
          size="sm"
          className="saveable-btn-cancel"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          className="saveable-btn-save"
          disabled={!dirty}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  )
}
