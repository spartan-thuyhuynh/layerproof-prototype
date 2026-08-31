import type { GeneratedLogo } from '@/features/brand-kit/types/brand'
import { ARCHETYPES } from '@/features/brand-kit/data/archetypes'
import { COLOR_TONES } from '@/features/brand-kit/data/color-tones'
import { VISUAL_DIRECTIONS } from '@/features/brand-kit/data/visual-directions'
import { buildLogoSvg } from '@/features/brand-kit/lib/logoSvg'

// ---- Font pairs ----
export const FONT_PAIRS: Array<{ display: string; body: string }> = [
  { display: 'Inter',           body: 'Inter' },
  { display: 'Playfair Display', body: 'Inter' },
  { display: 'Syne',            body: 'DM Sans' },
  { display: 'Space Grotesk',   body: 'Inter' },
  { display: 'Fraunces',        body: 'Source Sans 3' },
  { display: 'DM Serif Display', body: 'DM Sans' },
  { display: 'Manrope',         body: 'Manrope' },
  { display: 'Cormorant',       body: 'Montserrat' },
]

// archetype → font pair indices (3 options shown in review)
const ARCHETYPE_FONT_MAP: Record<string, number[]> = {
  explorer:   [2, 0, 3],
  creator:    [2, 7, 4],
  sage:       [1, 5, 0],
  hero:       [3, 0, 6],
  caregiver:  [6, 0, 1],
  jester:     [2, 3, 6],
  ruler:      [1, 5, 7],
  lover:      [7, 4, 1],
}

function getPrimaryArchetype(archetypes: string[]): string {
  return archetypes[0] ?? 'explorer'
}

// ---- Palette generation ----
function hslToHex(h: number, s: number, l: number): string {
  const a = (s * Math.min(l, 100 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color / 100).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function archetypeHueShift(archetype: string): number {
  const shifts: Record<string, number> = {
    explorer: 15, creator: 0, sage: -10, hero: 20,
    caregiver: -5, jester: 30, ruler: -15, lover: 5,
  }
  return shifts[archetype] ?? 0
}

export function generatePalette(colorToneId: string, archetypes: string[]): string[] {
  const tone = COLOR_TONES.find((t) => t.id === colorToneId)
  if (!tone) return ['#888888', '#AAAAAA', '#CCCCCC', '#444444', '#1A1A1A']

  if (colorToneId === 'monochrome') {
    return ['#0A0A0A', '#2C2C2C', '#666666', '#BBBBBB', '#F5F5F5']
  }

  const archetype = getPrimaryArchetype(archetypes)
  const shift = archetypeHueShift(archetype)

  if (colorToneId === 'pastel') {
    const baseH = 220 + shift
    return [
      hslToHex((baseH + 300) % 360, 60, 85),
      hslToHex((baseH + 40) % 360, 55, 88),
      hslToHex((baseH + 80) % 360, 50, 86),
      hslToHex((baseH + 160) % 360, 45, 90),
      hslToHex((baseH) % 360, 40, 93),
    ]
  }

  if (colorToneId === 'vibrant') {
    const baseH = (30 + shift + 360) % 360
    return [
      hslToHex(baseH, 90, 50),
      hslToHex((baseH + 60) % 360, 85, 52),
      hslToHex((baseH + 120) % 360, 85, 50),
      hslToHex((baseH + 200) % 360, 80, 48),
      hslToHex((baseH + 280) % 360, 80, 46),
    ]
  }

  const midH = ((tone.hueMin + tone.hueMax) / 2 + shift + 360) % 360
  return [
    hslToHex(midH, 75, 35),
    hslToHex((midH + 20) % 360, 65, 50),
    hslToHex((midH + 180) % 360, 70, 45),
    hslToHex(midH, 15, 55),
    hslToHex(midH, 10, 12),
  ]
}

// ---- Font pairs ----
export function generateFontPairs(archetypes: string[]): Array<{ display: string; body: string }> {
  const archetype = getPrimaryArchetype(archetypes)
  const indices = ARCHETYPE_FONT_MAP[archetype] ?? [0, 1, 2]
  return indices.map((i) => FONT_PAIRS[i])
}

// ---- Logo generation ----
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return (words[0].slice(0, 2)).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function generateLogos(
  logoStyleId: string,
  name: string,
  primaryColor: string,
  regenerationSeed: number,
): GeneratedLogo[] {
  const initials = getInitials(name)
  const params = { initials, name, primaryColor, seed: regenerationSeed }

  const poolOffset = (regenerationSeed * 2) % 6
  const variantA = poolOffset
  const variantB = (poolOffset + 1) % 6

  const styleLabels: Record<string, string[]> = {
    wordmark:    ['Classic weight', 'Wide tracking'],
    lettermark:  ['Circle', 'Rounded square'],
    abstract:    ['Layered mark', 'Arc mark'],
    combination: ['Icon left', 'Icon above'],
    emblem:      ['Hexagon seal', 'Filled badge'],
    monogram:    ['Stacked', 'Side by side'],
  }

  const labels = styleLabels[logoStyleId] ?? ['Variant A', 'Variant B']

  return [
    {
      id: `logo-${regenerationSeed}-0`,
      svg: buildLogoSvg(logoStyleId, params, variantA),
      style: logoStyleId,
      variantLabel: labels[0],
    },
    {
      id: `logo-${regenerationSeed}-1`,
      svg: buildLogoSvg(logoStyleId, params, variantB),
      style: logoStyleId,
      variantLabel: labels[1],
    },
  ]
}

// ---- Visual direction helpers ----
export function getVisualDirection(id: string) {
  return VISUAL_DIRECTIONS.find((d) => d.id === id)
}

export function getArchetype(id: string) {
  return ARCHETYPES.find((a) => a.id === id)
}
