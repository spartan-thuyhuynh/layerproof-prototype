import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import type { BrandImage } from '@/features/brand-kit/store/useWizardStore'

const CATEGORIES: Array<{ id: BrandImage['category']; label: string }> = [
  { id: 'product',     label: 'Product' },
  { id: 'team',        label: 'Team' },
  { id: 'inspiration', label: 'Inspiration' },
  { id: 'other',       label: 'Other' },
]

export function WizStep_Images() {
  const { brandImages, setField } = useWizardStore()
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function readFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img: BrandImage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          dataUrl,
          name: file.name,
          category: 'product',
        }
        setField('brandImages', [...useWizardStore.getState().brandImages, img])
      }
      reader.readAsDataURL(file)
    })
  }

  function removeImage(id: string) {
    setField('brandImages', brandImages.filter((img) => img.id !== id))
  }

  function setCategory(id: string, category: BrandImage['category']) {
    setField('brandImages', brandImages.map((img) => img.id === id ? { ...img, category } : img))
  }

  return (
    <div className="biz-step">
      <div>
        <h1 className="biz-step-title">Show us your world</h1>
        <p className="biz-step-sub">Upload product shots, team photos, or anything that captures your brand's feel. Optional, but helps us tailor your identity.</p>
      </div>

      {/* Drop zone */}
      <div
        className={`biz-img-dropzone${dragging ? ' dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); readFiles(e.dataTransfer.files) }}
      >
        <div className="biz-img-drop-icon">↑</div>
        <div className="biz-img-drop-text">
          <strong>Click to upload</strong> or drag & drop
        </div>
        <div className="biz-img-drop-sub">PNG, JPG, WEBP up to 10MB</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => readFiles(e.target.files)}
        />
      </div>

      {/* Uploaded images */}
      {brandImages.length > 0 && (
        <div className="biz-img-grid">
          {brandImages.map((img) => (
            <div key={img.id} className="biz-img-thumb">
              <img src={img.dataUrl} alt={img.name} className="biz-img-thumb-img" />
              <button
                className="biz-img-thumb-remove"
                onClick={() => removeImage(img.id)}
                aria-label="Remove"
              >
                <X size={11} />
              </button>
              <div className="biz-img-thumb-cats">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`biz-img-cat-chip${img.category === cat.id ? ' active' : ''}`}
                    onClick={() => setCategory(img.id, cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function WizStep_ImagesNav({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="biz-nav">
      <button className="biz-nav-back-link" onClick={onBack}>← Back</button>
      <button className="btn primary" onClick={onNext}>Continue →</button>
    </div>
  )
}
