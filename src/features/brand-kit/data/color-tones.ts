export interface ColorTone {
  id: string
  label: string
  description: string
  hueMin: number
  hueMax: number
  swatchPreview: string[]
}

export const COLOR_TONES: ColorTone[] = [
  {
    id: 'warm',
    label: 'Warm',
    description: 'Reds, oranges, golds',
    hueMin: 0,
    hueMax: 50,
    swatchPreview: ['#C0392B', '#E67E22', '#F39C12', '#FAD7A0', '#FDEDEC'],
  },
  {
    id: 'cool',
    label: 'Cool',
    description: 'Blues, teals, purples',
    hueMin: 200,
    hueMax: 280,
    swatchPreview: ['#1A5276', '#2980B9', '#5DADE2', '#85C1E9', '#EAF2F8'],
  },
  {
    id: 'earthy',
    label: 'Earthy',
    description: 'Browns, greens, terracotta',
    hueMin: 60,
    hueMax: 140,
    swatchPreview: ['#5D4037', '#795548', '#8D6E63', '#A1887F', '#EFEBE9'],
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    description: 'Black, white, grays',
    hueMin: 0,
    hueMax: 0,
    swatchPreview: ['#0A0A0A', '#2C2C2C', '#666666', '#BBBBBB', '#F5F5F5'],
  },
  {
    id: 'vibrant',
    label: 'Vibrant',
    description: 'High-saturation, multi-hue',
    hueMin: 0,
    hueMax: 360,
    swatchPreview: ['#E74C3C', '#F39C12', '#27AE60', '#2980B9', '#8E44AD'],
  },
  {
    id: 'pastel',
    label: 'Pastel',
    description: 'Soft, desaturated tones',
    hueMin: 0,
    hueMax: 360,
    swatchPreview: ['#F8BBD9', '#FFE0B2', '#FFF9C4', '#C8E6C9', '#BBDEFB'],
  },
]
