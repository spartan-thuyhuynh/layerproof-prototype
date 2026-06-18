import { ProtoScroller } from '@/features/landing/components/ProtoScroller'

const base = import.meta.env.BASE_URL

const PROTOS = [
  {
    title: 'New Homepage',
    status: 'live' as const,
    thumbnail: `${base}home/homepage-thumb.png`,
    to: '/home',
    flows: [
      'Dashboard & quick-create flow',
      'Recent projects grid',
      'Workspace sidebar navigation',
    ],
  },
  {
    title: 'Brand Kit',
    status: 'live' as const,
    thumbnail: `${base}onboarding/illustration.png`,
    to: '/brand-kit',
    flows: [
      'View & switch brand kits',
      'Edit colours, fonts, logo & tone',
      'Create a new kit from scratch',
    ],
  },
  {
    title: 'New Onboarding',
    status: 'live' as const,
    thumbnail: `${base}onboarding/onboarding-thumb.png`,
    to: '/onboarding',
    flows: [
      'Sign up & personalise your profile',
      'Build your brand kit',
      'Auto-generate your first brand theme',
      'Pick your first product',
    ],
  },
  {
    title: 'Matte V3 Editor',
    status: 'coming-soon' as const,
    thumbnail: undefined,
    to: '/matte-v3',
    flows: [
      'Redesigned editor canvas & toolbar',
      'AI layout & copy suggestions',
      'Multi-format templates',
      'Brand kit integration',
    ],
  },
]

export function LandingPage() {
  return (
    <div className="lp-page">
      <header className="lp-header">
        <div className="lp-logo">
          <img src={`${base}logos/symbol.png`} alt="" className="lp-logo-symbol" />
          <span className="lp-logo-text">LayerProof</span>
        </div>
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
