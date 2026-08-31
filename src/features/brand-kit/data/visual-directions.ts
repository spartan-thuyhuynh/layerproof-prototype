export interface VisualDirection {
  id: string
  label: string
  swatches: string[]
  typeSample: string
  fontPairIndex: number
}

export const VISUAL_DIRECTIONS: VisualDirection[] = [
  {
    id: 'modern-minimal',
    label: 'Modern & Minimal',
    swatches: ['#0A0A0A', '#1A1A1A', '#F5F5F5', '#E0E0E0', '#FFFFFF'],
    typeSample: 'Aa',
    fontPairIndex: 0,
  },
  {
    id: 'bold-expressive',
    label: 'Bold & Expressive',
    swatches: ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF'],
    typeSample: 'Aa',
    fontPairIndex: 1,
  },
  {
    id: 'friendly-approachable',
    label: 'Friendly & Approachable',
    swatches: ['#FF6B6B', '#FFA07A', '#FFD700', '#90EE90', '#87CEEB'],
    typeSample: 'Aa',
    fontPairIndex: 2,
  },
  {
    id: 'premium-refined',
    label: 'Premium & Refined',
    swatches: ['#1C1C1E', '#2C2C2E', '#C8A96E', '#D4B896', '#F2EDE4'],
    typeSample: 'Aa',
    fontPairIndex: 0,
  },
  {
    id: 'earthy-organic',
    label: 'Earthy & Organic',
    swatches: ['#5C4033', '#8B6F47', '#A0956A', '#C4B48A', '#E8DFC4'],
    typeSample: 'Aa',
    fontPairIndex: 2,
  },
  {
    id: 'playful-bright',
    label: 'Playful & Bright',
    swatches: ['#FF4FCB', '#FF9A3C', '#FFD740', '#69F0AE', '#40C4FF'],
    typeSample: 'Aa',
    fontPairIndex: 1,
  },
]
