import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'
import type { ProductId } from '@/features/onboarding/store/useOnboardingStore'
import { Social, Present, Image, Docs } from '@/shared/icons'

const PRODUCTS: {
  id: ProductId
  name: string
  sub: string
  desc: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  color: string
}[] = [
  {
    id: 'matte',
    name: 'LayerProof Matte',
    sub: 'Social Post Generator',
    desc: 'AI-powered posts for Instagram, LinkedIn & beyond',
    Icon: Social,
    color: 'var(--c-pink)',
  },
  {
    id: 'chromo',
    name: 'LayerProof Chromo',
    sub: 'Slide Generation',
    desc: 'Turn ideas into polished decks, pitch-ready in minutes',
    Icon: Present,
    color: 'var(--c-purple)',
  },
  {
    id: 'vellum',
    name: 'LayerProof Vellum',
    sub: 'Image Generator',
    desc: 'Generate on-brand visuals from text prompts',
    Icon: Image,
    color: 'var(--c-teal)',
  },
  {
    id: 'kraft',
    name: 'LayerProof Kraft',
    sub: 'Long Form Content',
    desc: 'Blogs, briefs, reports and docs, in your brand voice',
    Icon: Docs,
    color: 'var(--c-orange)',
  },
]

export function Step3_Product() {
  const { setProduct, nextStep } = useOnboardingStore()

  function pick(id: ProductId) {
    setProduct(id)
    nextStep()
  }

  return (
    <div className="onb-step fade-in">
      <div className="h-eyebrow" style={{ marginBottom: 10 }}>Pick a product</div>
      <h1 className="onb-step-title">What do you want to create?</h1>
      <p className="onb-step-sub">Choose a product to start with — you can use all of them later.</p>

      <div className="onb-product-grid">
        {PRODUCTS.map(({ id, name, sub, desc, Icon, color }) => (
          <button
            key={id}
            className="onb-product-card card hover"
            onClick={() => pick(id)}
          >
            <div className="onb-product-icon" style={{ color }}>
              <Icon style={{ width: 28, height: 28 }} />
            </div>
            <div className="onb-product-name">{name}</div>
            <div className="onb-product-sub">{sub}</div>
            <div className="onb-product-desc">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
