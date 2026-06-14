import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import type { ProductId } from '@/features/onboarding/store/useOnboardingStore'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { useUIStore } from '@/shared/store/useUIStore'
import { Social, Present, Image, Docs, CheckCircle, ArrowRight, Zap } from '@/shared/icons'
import { Check } from '@/shared/icons'

const PRODUCT_META: Record<ProductId, {
  label: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  color: string
}> = {
  matte:  { label: 'Matte post',   Icon: Social,   color: 'var(--c-pink)' },
  chromo: { label: 'Chromo deck',  Icon: Present,  color: 'var(--c-purple)' },
  vellum: { label: 'Vellum image', Icon: Image,    color: 'var(--c-teal)' },
  kraft:  { label: 'Kraft doc',    Icon: Docs,     color: 'var(--c-orange)' },
}

export function Step9_Complete() {
  const navigate = useNavigate()
  const { selectedProduct, projectName, brandName, newKitId, reset } = useOnboardingStore()
  const { setAppliedId } = useBrandStore()
  const { focusKit } = useUIStore()

  const product = selectedProduct ?? 'matte'
  const meta = PRODUCT_META[product]
  const ProductIcon = meta.Icon

  // Apply the kit to the workspace immediately on mount
  useEffect(() => {
    if (newKitId) {
      setAppliedId(newKitId)
      focusKit(newKitId)
    }
  }, [newKitId])

  function openEditor() {
    reset()
    navigate('/brand-kit')
  }

  return (
    <div className="onb-complete fade-in">
      {/* Success mark */}
      <div className="onb-complete-check">
        <CheckCircle style={{ width: 56, height: 56, color: 'var(--c-green)' }} />
      </div>

      <h1 className="onb-step-title" style={{ textAlign: 'center', marginTop: 20 }}>
        Your {meta.label} is ready!
      </h1>
      <p className="onb-step-sub" style={{ textAlign: 'center' }}>
        Your brand kit has been applied — everything you generate will stay on-brand.
      </p>

      {/* Project preview card */}
      <div className="onb-complete-card">
        <div className="onb-complete-card-icon" style={{ color: meta.color }}>
          <ProductIcon style={{ width: 24, height: 24 }} />
        </div>
        <div className="onb-complete-card-body">
          <div className="onb-complete-card-name">{projectName || 'My First Project'}</div>
          <div className="onb-complete-card-kit">
            <Zap style={{ width: 12, height: 12, color: 'var(--accent)' }} />
            Powered by {brandName || 'your brand kit'}
          </div>
        </div>
        <div className="onb-complete-card-badge">
          <Check style={{ width: 13, height: 13 }} />
          Ready
        </div>
      </div>

      {/* What's included checklist */}
      <div className="onb-complete-items">
        {['Brand colors applied', 'Typography matched', 'Tone of voice set'].map((item) => (
          <div key={item} className="onb-complete-item">
            <Check style={{ width: 14, height: 14, color: 'var(--c-green)' }} />
            {item}
          </div>
        ))}
      </div>

      <button className="btn primary onb-cta" onClick={openEditor}>
        Open in editor <ArrowRight style={{ width: 16, height: 16 }} />
      </button>

      <button className="onb-skip" onClick={openEditor}>
        Explore your brand kit first
      </button>
    </div>
  )
}
