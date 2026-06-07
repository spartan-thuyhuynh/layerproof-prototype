import { useRef, useState } from 'react'
import { X } from '@/icons'
import { Portal } from '@/lib/Portal'

/* ── per-category copy ─────────────────────────────────────── */
const CATEGORY_META: Record<string, { title: string; accept: string; hint: string }> = {
  logos: {
    title: 'Upload brand logos',
    accept: 'image/png,image/svg+xml,image/webp,image/jpeg',
    hint: 'PNG or SVG recommended for best quality',
  },
  colors: {
    title: 'Upload colors reference',
    accept: 'image/*',
    hint: 'Upload a swatch sheet or brand guideline image',
  },
  typography: {
    title: 'Upload typography reference',
    accept: 'image/*,.pdf',
    hint: 'Upload a type specimen or brand guideline',
  },
  tone: {
    title: 'Upload voice guidelines',
    accept: 'image/*,.pdf',
    hint: 'Upload a brand voice document or reference image',
  },
  imagery: {
    title: 'Upload brand assets',
    accept: 'image/*',
    hint: 'Upload photos, illustrations, or brand imagery',
  },
}

interface UploadedFile {
  name: string
  dataUrl: string
}

interface CategoryUploadModalProps {
  categoryId: string
  initialImage?: string | null
  onClose: () => void
  onDone: () => void
}

/* ── file card ─────────────────────────────────────────────── */
function FileCard({
  file,
  onRemove,
}: {
  file: UploadedFile
  onRemove: () => void
}) {
  return (
    <div className="cum-card">
      <div className="cum-card-preview">
        <img src={file.dataUrl} alt={file.name} className="cum-card-img" />
        <button className="cum-card-remove" onClick={onRemove} title="Remove">
          <X style={{ width: 11, height: 11 }} />
        </button>
      </div>
      <div className="cum-card-name" title={file.name}>{file.name}</div>
    </div>
  )
}

/* ── add-new card ──────────────────────────────────────────── */
function AddCard({ accept, onFiles }: { accept: string; onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(list: FileList | null) {
    if (!list) return
    onFiles(Array.from(list))
  }

  return (
    <div
      className={`cum-card cum-card--add${dragging ? ' cum-card--drag' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
    >
      <div className="cum-add-inner">
        <div className="cum-add-plus">+</div>
        <div className="cum-add-label">Add new</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}

/* ── modal ─────────────────────────────────────────────────── */
export function CategoryUploadModal({
  categoryId,
  initialImage,
  onClose,
  onDone,
}: CategoryUploadModalProps) {
  const meta = CATEGORY_META[categoryId] ?? CATEGORY_META.logos

  const initialFiles: UploadedFile[] = initialImage
    ? [{ name: `${categoryId}-reference.png`, dataUrl: initialImage }]
    : []

  const [files, setFiles] = useState<UploadedFile[]>(initialFiles)

  function addFiles(rawFiles: File[]) {
    rawFiles.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFiles((prev) => [...prev, { name: f.name, dataUrl: e.target?.result as string }])
      }
      reader.readAsDataURL(f)
    })
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <Portal>
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="mhead" style={{ paddingBottom: 18 }}>
          <button className="x" onClick={onClose}>
            <X style={{ width: 16, height: 16 }} />
          </button>
          <div className="cum-title">{meta.title}</div>
          <div className="cum-hint">{meta.hint}</div>
        </div>

        {/* body */}
        <div className="mbody">
          <div className="cum-grid">
            {files.map((f, i) => (
              <FileCard key={i} file={f} onRemove={() => removeFile(i)} />
            ))}
            <AddCard accept={meta.accept} onFiles={addFiles} />
          </div>
        </div>

        {/* footer */}
        <div className="mfoot">
          <button className="btn ghost sm" onClick={onClose}>Cancel</button>
          <button className="btn primary sm" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
    </Portal>
  )
}
