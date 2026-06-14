import heroImg from '@/assets/hero.png'
import { ProtoScroller } from '@/features/landing/components/ProtoScroller'

const base = import.meta.env.BASE_URL

const PROTOS = [
  {
    title: 'Brand Kit',
    status: 'live' as const,
    thumbnail: `${base}onboarding/illustration.png`,
    to: '/brand-kit',
    flows: [
      'Browse & switch brand kits',
      'Edit colors, typography & logos',
      'Apply kit to workspace',
      'Create a new brand kit',
    ],
  },
  {
    title: 'New Onboarding',
    status: 'live' as const,
    thumbnail: heroImg,
    to: '/onboarding',
    flows: [
      'Sign up & choose a product',
      'Import brand from URL or PDF',
      'Review & refine extracted brand kit',
      'Create your first project',
    ],
  },
  {
    title: 'Matte V3 Editor',
    status: 'coming-soon' as const,
    thumbnail: undefined,
    to: '/matte-v3',
    flows: [
      'Explore redesigned editor canvas',
      'Updated toolbar & side panels',
      'Data-driven layout suggestions',
      'New social format templates',
      'Improved asset & brand integration',
    ],
  },
]

export function LandingPage() {
  return (
    <div className="lp-page">
      <header className="lp-header">
        <img src={`${base}lplogo.png`} alt="LayerProof" className="lp-logo" />
        <span className="lp-eyebrow">Prototype Launcher</span>
      </header>

      <main className="lp-main">
        <div className="lp-hero">
          <h1 className="lp-title">Prototypes</h1>
          <p className="lp-sub">Select a prototype to explore the interactive flow.</p>
        </div>
        <ProtoScroller protos={PROTOS} />
      </main>
    </div>
  )
}
