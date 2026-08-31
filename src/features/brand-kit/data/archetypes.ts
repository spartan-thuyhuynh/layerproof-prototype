export interface Archetype {
  id: string
  label: string
  emoji: string
  description: string
  toneWords: string[]
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'explorer',
    label: 'Explorer',
    emoji: '🧭',
    description: 'Bold, curious, driven by discovery. Breaks boundaries and charts new territory.',
    toneWords: ['adventurous', 'bold', 'curious'],
  },
  {
    id: 'creator',
    label: 'Creator',
    emoji: '🎨',
    description: 'Imaginative, expressive, visionary. Turns ideas into lasting things of beauty.',
    toneWords: ['imaginative', 'expressive', 'original'],
  },
  {
    id: 'sage',
    label: 'Sage',
    emoji: '📚',
    description: 'Knowledgeable, thoughtful, credible. Guides through expertise and deep understanding.',
    toneWords: ['authoritative', 'precise', 'thoughtful'],
  },
  {
    id: 'hero',
    label: 'Hero',
    emoji: '⚡',
    description: 'Courageous, determined, inspiring. Rises to challenges and empowers others.',
    toneWords: ['confident', 'direct', 'empowering'],
  },
  {
    id: 'caregiver',
    label: 'Caregiver',
    emoji: '🤝',
    description: 'Warm, nurturing, protective. Puts people first and builds genuine connection.',
    toneWords: ['warm', 'caring', 'reassuring'],
  },
  {
    id: 'jester',
    label: 'Jester',
    emoji: '🎭',
    description: 'Playful, witty, irreverent. Finds joy in the unexpected and makes people smile.',
    toneWords: ['playful', 'witty', 'fun'],
  },
  {
    id: 'ruler',
    label: 'Ruler',
    emoji: '👑',
    description: 'Authoritative, refined, commanding. Sets the standard and leads with certainty.',
    toneWords: ['premium', 'authoritative', 'polished'],
  },
  {
    id: 'lover',
    label: 'Lover',
    emoji: '✨',
    description: 'Passionate, sensual, devoted. Creates deep emotional resonance and desire.',
    toneWords: ['passionate', 'intimate', 'indulgent'],
  },
]
