export type Locale = 'en' | 'vi'

export interface IllustCopy {
  label: string
  note: string
}

export interface HookCardCopy extends IllustCopy {
  ratio: string
}

export interface PillarCopy {
  numeral: string
  tag: string
  headline: string
  body: string
  illustLabel: string
  illustNote: string
  illustRatio: string
  status: 'live' | 'soon'
}

export interface IndustryCollageItemCopy extends IllustCopy {
  ratio: string
}

export interface IndustryCopy {
  id: string
  icon: string
  tab: string
  collage: IndustryCollageItemCopy[]
}

export interface FeatureDeepDiveCopy {
  product: string
  headline: string
  body: string
  hint: string
  illustLabel: string
  illustNote: string
  illustRatio: string
  reverse: boolean
}

export interface CaseStudyCopy {
  category: string
  imageLabel: string
  statement: string
  brand: string
  quote: string
  author: string
}

export interface TrustStatCopy {
  num: string
  label: string
  highlight?: boolean
}

export interface PricingTierCopy {
  name: string
  desc: string
  price: string
  priceUnit: string
  billing: string
  noteBold: string | null
  noteText: string
  save: string | null
  cta: string
  ctaVariant: 'accent' | 'ghost'
  popular: boolean
  featuresLabel: string
  features: string[]
}

export interface WhyCardCopy {
  num: string
  headline: string
  body: string
}

export interface SoonCardCopy {
  illustLabel: string
  illustNote: string
  tag: string
  headline: string
  body: string
}

export interface TeamMemberCopy {
  name: string
  role: string
  linkedinUrl?: string
}

export interface LandingContent {
  nav: {
    backAriaLabel: string
    product: string
    industries: string
    pricing: string
    releaseDiary: string
    about: string
    cta: string
  }
  hero: {
    h1Line1: string
    h1Line2: string
    sub: string
    ctaStart: string
    ctaDemo: string
    caveat: string
    illustLabel: string
    illustNote: string
  }
  brands: {
    caption: string
  }
  cases: {
    h2: string
    prevLabel: string
    nextLabel: string
    items: CaseStudyCopy[]
    trustStats: TrustStatCopy[]
  }
  hook: {
    cards: HookCardCopy[]
    words1: [string, string, string]
    words2: [string, string, string]
    sub: string
  }
  pillars: {
    h2: string
    sub: string
    badgeLive: string
    badgeSoon: string
    items: PillarCopy[]
  }
  industries: {
    h2: string
    sub: string
    items: IndustryCopy[]
  }
  ugc: {
    h2: string
    sub: string
    badge: string
    demos: string[]
  }
  deepdives: {
    h2: string
    sub: string
    items: FeatureDeepDiveCopy[]
  }
  soon: {
    h2: string
    cards: SoonCardCopy[]
    connectLabel: string
  }
  why: {
    h2Line1: string
    h2Line2: string
    items: WhyCardCopy[]
  }
  pricing: {
    h2: string
    sub: string
    popularBadge: string
    tiers: PricingTierCopy[]
  }
  team: {
    h2: string
    sub: string
    ctaLabel: string
    members: TeamMemberCopy[]
  }
  finalCta: {
    h2: string
    sub: string
    ctaStart: string
    microcopy: string
  }
  footer: {
    tagline: string
    companyHeading: string
    companyLinks: string[]
    legalHeading: string
    legalLinks: string[]
    followX: string
    qrLabel: string
    copyright: string
    devLink: string
  }
}
