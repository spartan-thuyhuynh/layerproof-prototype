import { useState } from 'react'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { deepClone } from '@/shared/lib/utils'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import type { EditorActions, PathSegment } from '@/features/brand-kit/components/sections/types'
import { ColorPickerModal } from '@/features/brand-kit/components/modals/ColorPickerModal'
import { TypographyPickerModal } from '@/features/brand-kit/components/modals/TypographyPickerModal'
import { VoicePickerModal } from '@/features/brand-kit/components/modals/VoicePickerModal'
import { CategoryUploadModal } from '@/features/brand-kit/components/modals/CategoryUploadModal'
import { ArrowRight, Palette, Type, Mic, Image, Plus } from '@/shared/icons'

type ModalId = 'colors' | 'typography' | 'tone' | 'logos' | 'imagery' | null

function getByPath(obj: unknown, path: PathSegment[]): unknown {
  return path.reduce((acc: unknown, key) => {
    if (acc == null) return undefined
    return (acc as Record<string | number, unknown>)[key]
  }, obj)
}

function setByPath(obj: unknown, path: PathSegment[], value: unknown): unknown {
  if (path.length === 0) return value
  const clone = Array.isArray(obj) ? [...(obj as unknown[])] : { ...(obj as object) }
  const [head, ...rest] = path
  ;(clone as Record<string | number, unknown>)[head] = setByPath(
    (clone as Record<string | number, unknown>)[head],
    rest,
    value,
  )
  return clone
}

function makeEd(kitId: string, updateKit: BrandStore['updateKit']): EditorActions {
  return {
    toggle(path) {
      updateKit(kitId, (k) => {
        const next = deepClone(k)
        const cur = getByPath(next, path)
        return setByPath(next, path, !cur) as BrandKit
      })
    },
    setVal(path, value) {
      updateKit(kitId, (k) => setByPath(deepClone(k), path, value) as BrandKit)
    },
    addItem(path, item) {
      updateKit(kitId, (k) => {
        const next = deepClone(k)
        const arr = getByPath(next, path) as unknown[]
        return setByPath(next, path, [...arr, item]) as BrandKit
      })
    },
    removeItem(path, index) {
      updateKit(kitId, (k) => {
        const next = deepClone(k)
        const arr = [...(getByPath(next, path) as unknown[])]
        arr.splice(index, 1)
        return setByPath(next, path, arr) as BrandKit
      })
    },
  }
}

interface BrandStore {
  updateKit: (id: string, updater: (k: BrandKit) => BrandKit) => void
}

export function Step7_Review() {
  const { newKitId, brandName, importPath, nextStep } = useOnboardingStore()
  const { kits, updateKit } = useBrandStore()
  const [modal, setModal] = useState<ModalId>(null)

  const kit = kits.find((k) => k.id === newKitId)
  const isBlank = importPath === 'blank'
  const headline = isBlank
    ? `Set up ${brandName || 'your brand'}`
    : `Here's what we found for ${brandName || 'your brand'}`

  if (!kit) {
    // Kit not yet available (shouldn't happen — but guard gracefully)
    return (
      <div className="onb-step fade-in" style={{ justifyContent: 'center' }}>
        <div className="tiny" style={{ color: 'var(--t3)' }}>Preparing your brand kit…</div>
      </div>
    )
  }

  const ed = makeEd(kit.id, updateKit)
  const allColors = kit.colors.palettes.flatMap((p) => p.colors)
  const hasColors = allColors.length > 0
  const hasType   = kit.type.display.family !== 'Inter' || kit.type.body.family !== 'Inter'
  const hasTone   = kit.tone.attrs.length > 0

  return (
    <div className="onb-step fade-in">
      <div className="h-eyebrow" style={{ marginBottom: 10 }}>Review</div>
      <h1 className="onb-step-title">{headline}</h1>
      <p className="onb-step-sub">
        {isBlank
          ? 'Add your brand assets section by section — or skip and fill them in later.'
          : "Looks right? You can edit any section now or come back later."}
      </p>

      <div className="onb-review-list">

        {/* Colors */}
        <div className="onb-review-row">
          <div className="onb-review-icon"><Palette style={{ width: 16, height: 16 }} /></div>
          <div className="onb-review-body">
            <div className="onb-review-label">Colors</div>
            {hasColors ? (
              <div className="onb-review-swatches">
                {allColors.slice(0, 4).map((c, i) => (
                  <span key={i} className="onb-swatch" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
                ))}
                {allColors.length > 4 && (
                  <span className="tiny" style={{ color: 'var(--t3)' }}>+{allColors.length - 4}</span>
                )}
              </div>
            ) : (
              <button className="onb-review-add" onClick={() => setModal('colors')}>
                <Plus style={{ width: 13, height: 13 }} /> Add colors
              </button>
            )}
          </div>
          <button className="onb-review-edit" onClick={() => setModal('colors')}>Edit →</button>
        </div>

        {/* Typography */}
        <div className="onb-review-row">
          <div className="onb-review-icon"><Type style={{ width: 16, height: 16 }} /></div>
          <div className="onb-review-body">
            <div className="onb-review-label">Typography</div>
            {hasType ? (
              <div className="onb-review-detail">
                <span style={{ fontFamily: kit.type.display.family, fontWeight: 700 }}>{kit.type.display.family}</span>
                <span className="tiny" style={{ color: 'var(--t3)', margin: '0 6px' }}>+</span>
                <span style={{ fontFamily: kit.type.body.family }}>{kit.type.body.family}</span>
              </div>
            ) : (
              <button className="onb-review-add" onClick={() => setModal('typography')}>
                <Plus style={{ width: 13, height: 13 }} /> Add typography
              </button>
            )}
          </div>
          <button className="onb-review-edit" onClick={() => setModal('typography')}>Edit →</button>
        </div>

        {/* Logo */}
        <div className="onb-review-row">
          <div className="onb-review-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="onb-review-body">
            <div className="onb-review-label">Logo</div>
            {kit.logos.variants.length > 0 ? (
              <div className="onb-review-detail tiny">
                {kit.logos.variants.map((v) => v.name).join(' · ')}
              </div>
            ) : (
              <button className="onb-review-add" onClick={() => setModal('logos')}>
                <Plus style={{ width: 13, height: 13 }} /> Upload logo
              </button>
            )}
          </div>
          <button className="onb-review-edit" onClick={() => setModal('logos')}>Edit →</button>
        </div>

        {/* Tone */}
        <div className="onb-review-row">
          <div className="onb-review-icon"><Mic style={{ width: 16, height: 16 }} /></div>
          <div className="onb-review-body">
            <div className="onb-review-label">Tone of Voice</div>
            {hasTone ? (
              <div className="onb-review-chips">
                {kit.tone.attrs.slice(0, 3).map((a, i) => (
                  <span key={i} className="chip">{a.t}</span>
                ))}
              </div>
            ) : (
              <button className="onb-review-add" onClick={() => setModal('tone')}>
                <Plus style={{ width: 13, height: 13 }} /> Define tone
              </button>
            )}
          </div>
          <button className="onb-review-edit" onClick={() => setModal('tone')}>Edit →</button>
        </div>

        {/* Imagery */}
        <div className="onb-review-row">
          <div className="onb-review-icon"><Image style={{ width: 16, height: 16 }} /></div>
          <div className="onb-review-body">
            <div className="onb-review-label">Imagery</div>
            {kit.imagery.desc ? (
              <div className="onb-review-detail tiny">{kit.imagery.desc}</div>
            ) : (
              <button className="onb-review-add" onClick={() => setModal('imagery')}>
                <Plus style={{ width: 13, height: 13 }} /> Add imagery style
              </button>
            )}
          </div>
          <button className="onb-review-edit" onClick={() => setModal('imagery')}>Edit →</button>
        </div>
      </div>

      <button className="btn primary onb-cta" onClick={nextStep}>
        Looks good — Next <ArrowRight style={{ width: 16, height: 16 }} />
      </button>
      <button className="onb-skip" onClick={nextStep}>Skip review</button>

      {/* Modals */}
      {modal === 'colors' && (
        <ColorPickerModal
          kit={kit} ed={ed}
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}
      {modal === 'typography' && (
        <TypographyPickerModal
          kit={kit} ed={ed}
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}
      {modal === 'tone' && (
        <VoicePickerModal
          kit={kit} ed={ed}
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}
      {(modal === 'logos' || modal === 'imagery') && (
        <CategoryUploadModal
          categoryId={modal}
          initialImage={null}
          onClose={() => setModal(null)}
          onDone={() => setModal(null)}
        />
      )}
    </div>
  )
}

