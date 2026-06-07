import { X, Plus } from '@/icons'

interface RemoveBtnProps {
  onClick: () => void
  title?: string
}

export function RemoveBtn({ onClick, title }: RemoveBtnProps) {
  return (
    <button
      className="row-x"
      title={title ?? 'Remove'}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      <X />
    </button>
  )
}

interface AddBtnProps {
  onClick: () => void
  label: string
  style?: React.CSSProperties
}

export function AddBtn({ onClick, label, style }: AddBtnProps) {
  return (
    <button className="add-row" onClick={onClick} style={style}>
      <Plus /> {label}
    </button>
  )
}

interface TagEditorProps {
  tags: string[]
  onChange: (tags: string[]) => void
  addLabel?: string
}

export function TagEditor({ tags, onChange, addLabel }: TagEditorProps) {
  return (
    <div className="wordtags">
      {tags.map((t, i) => (
        <span key={i} className="etag">
          <span
            className="edit-text"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={(e) => {
              const v = e.currentTarget.innerText.trim()
              const n = [...tags]
              if (!v) n.splice(i, 1)
              else n[i] = v
              onChange(n)
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
          >
            {t}
          </span>
          <button
            className="etag-x"
            onClick={() => { const n = [...tags]; n.splice(i, 1); onChange(n) }}
          >×</button>
        </span>
      ))}
      <button className="etag-add" onClick={() => onChange([...tags, 'new'])}>
        <Plus style={{ width: 12, height: 12 }} /> {addLabel ?? 'Add'}
      </button>
    </div>
  )
}
