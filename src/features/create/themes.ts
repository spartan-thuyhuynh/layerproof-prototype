import type { BrandKit } from '@/features/brand-kit/types/brand'

export interface ThemeOption {
  id: string
  name: string
  sub?: string
  colors: string[]
  section: 'system' | 'standalone' | 'brand'
  prompt?: string
}

export const SYSTEM_THEMES: ThemeOption[] = [
  { id: 'minimal-dark',  name: 'Minimal Dark',  colors: ['#09090b','#ffffff','#fbbf24'], section: 'system',
    prompt: 'Color Usage:\nUse near-black (#09090b) for all backgrounds. White for body copy. Yellow (#fbbf24) for headlines and CTAs only.\n\nTypography:\nClean sans-serif. Large, confident headlines. Generous whitespace between sections.\n\nImagery Style:\nMinimal, high-contrast visuals. Single subject on dark background. Avoid busy or colorful imagery.\n\nCTA Buttons:\nYellow fill with black text. Rounded corners. No secondary outline buttons.' },
  { id: 'bold-gradient', name: 'Bold Gradient',  colors: ['#7c3aed','#ec4899','#fbbf24'], section: 'system',
    prompt: 'Color Usage:\nLead with purple-to-pink gradients (#7c3aed → #ec4899) for hero sections and key visuals. Yellow (#fbbf24) as accent for highlights.\n\nTypography:\nBold, expressive headlines at large sizes. Use gradient text treatment for key phrases.\n\nImagery Style:\nHigh energy, vibrant imagery. Dark spotlight scenes with colorful overlays. Bold product shots.\n\nCTA Buttons:\nGradient fill from purple to pink. White text. Pill-shaped with shadow.' },
  { id: 'clean-light',   name: 'Clean Light',    colors: ['#f8f8f8','#1a1a1a','#3b82f6'], section: 'system',
    prompt: 'Color Usage:\nOff-white (#f8f8f8) backgrounds. Near-black (#1a1a1a) for text. Blue (#3b82f6) as the primary accent for links and CTAs.\n\nTypography:\nClean, readable serif or sans-serif. Comfortable line height. Body text at 16px.\n\nImagery Style:\nBright, airy photography. Natural light. Professional but approachable.\n\nCTA Buttons:\nSolid blue with white text. Subtle rounded corners.' },
  { id: 'neon-accent',   name: 'Neon Accent',    colors: ['#0a0a0a','#22d3ee','#a855f7'], section: 'system',
    prompt: 'Color Usage:\nDeep black base (#0a0a0a). Cyan (#22d3ee) for primary accents and highlights. Purple (#a855f7) for secondary elements.\n\nTypography:\nFuturistic, geometric typefaces. Glowing text effects on key headlines.\n\nImagery Style:\nDark, atmospheric scenes with neon lighting. Tech and digital aesthetics.\n\nCTA Buttons:\nCyan with black text. Sharp corners. Optional glow effect.' },
  { id: 'warm-terra',    name: 'Warm Terra',     colors: ['#1c0f07','#f97316','#fbbf24'], section: 'system',
    prompt: 'Color Usage:\nDeep brown base (#1c0f07). Warm orange (#f97316) for accents. Amber (#fbbf24) for highlights and CTAs.\n\nTypography:\nWarm, humanist typefaces. Earthy and organic feel.\n\nImagery Style:\nNatural textures, warm tones, earthy materials. Artisan and handcrafted aesthetics.\n\nCTA Buttons:\nOrange fill with dark text. Rounded, organic shape.' },
  { id: 'ocean',         name: 'Ocean',          colors: ['#040d1a','#0ea5e9','#38bdf8'], section: 'system',
    prompt: 'Color Usage:\nDeep navy (#040d1a) as the base. Sky blue (#0ea5e9) for primary elements. Light blue (#38bdf8) for highlights and accents.\n\nTypography:\nClean, modern sans-serif. Confident and professional.\n\nImagery Style:\nWater, sky, and coastal photography. Clean horizons and open spaces.\n\nCTA Buttons:\nBlue gradient fill with white text. Pill-shaped.' },
  { id: 'rose-gold',     name: 'Rose Gold',      colors: ['#1a0a0f','#f43f5e','#fda4af'], section: 'system',
    prompt: 'Color Usage:\nDeep burgundy base (#1a0a0f). Rose red (#f43f5e) as primary accent. Soft pink (#fda4af) for secondary highlights.\n\nTypography:\nElegant serif or refined sans-serif. Graceful and sophisticated.\n\nImagery Style:\nLuxury product photography. Soft bokeh, warm lighting. Premium lifestyle.\n\nCTA Buttons:\nRose fill with white text. Rounded corners.' },
  { id: 'forest',        name: 'Forest',         colors: ['#0a1a0f','#22c55e','#86efac'], section: 'system',
    prompt: 'Color Usage:\nDark forest green base (#0a1a0f). Vibrant green (#22c55e) for accents. Mint (#86efac) for highlights.\n\nTypography:\nOrganic, nature-inspired typefaces. Grounded and authentic.\n\nImagery Style:\nNature and environmental photography. Lush greenery, sustainability themes.\n\nCTA Buttons:\nGreen fill with dark text. Rounded, natural shape.' },
  { id: 'slate',         name: 'Slate',          colors: ['#0f172a','#94a3b8','#e2e8f0'], section: 'system',
    prompt: 'Color Usage:\nDeep slate navy (#0f172a). Medium slate (#94a3b8) for body text. Light slate (#e2e8f0) for headings and highlights.\n\nTypography:\nProfessional, structured typefaces. Clear hierarchy with strong contrast.\n\nImagery Style:\nCorporate, clean, minimal. Abstract geometric visuals. Business-appropriate photography.\n\nCTA Buttons:\nLight slate fill with dark text. Subtle borders.' },
]

export const STANDALONE_THEMES: ThemeOption[] = [
  { id: 'custom-1', name: 'My Minimal Theme', colors: ['#18181b','#e4e4e7','#6366f1'], section: 'standalone' },
  { id: 'custom-2', name: 'Summer Vibes',     colors: ['#fff7ed','#ea580c','#fbbf24'], section: 'standalone' },
  { id: 'custom-3', name: 'Midnight Blue',    colors: ['#030712','#1e40af','#93c5fd'], section: 'standalone' },
]

function buildBrandPrompt(kit: BrandKit, variant: string, bg: string, accent: string): string {
  const tone = kit.tone
  const lines: string[] = []

  const variantDesc: Record<string, string> = {
    Primary: 'Full brand color palette. Use brand colors as-is for maximum brand alignment.',
    Dark:    'Dark-mode variant. Deep background with brand accent colors for a bold look.',
    Minimal: 'Neutral base with a single brand accent — clean and focused.',
    Light:   'Light-mode variant. Bright background with brand accent for an airy, professional feel.',
  }
  lines.push(`Color Usage:\n${variantDesc[variant] ?? `${variant} variant.`} Background: ${bg}. Accent: ${accent}.`)

  if (tone?.use?.length) {
    lines.push(`Voice:\n${tone.use.slice(0, 3).join(' ')}`)
  } else if (tone?.on) {
    lines.push(`Voice:\n${tone.on}`)
  }

  if (tone?.avoid?.length) {
    lines.push(`Avoid:\n${tone.avoid.slice(0, 3).join(', ')}.`)
  }

  if (tone?.customInstruction) {
    lines.push(`Instructions:\n${tone.customInstruction}`)
  }

  const typeDisplay = kit.type?.display?.family
  if (typeDisplay) {
    lines.push(`Typography:\n${typeDisplay} — ${kit.type?.display?.weight ?? 'regular'}.`)
  }

  return lines.join('\n\n')
}

export function makeBrandKitThemes(kit: BrandKit): ThemeOption[] {
  const paletteColors = kit.colors.palettes.flatMap(p => p.colors).map(c => c.hex)
  // Fall back to top-level swatches (set during onboarding before full palette editing)
  const allColors = paletteColors.length > 0 ? paletteColors : (kit.swatches ?? [])
  if (allColors.length === 0) {
    // Last resort: use the kit's primary color
    const fallback = kit.color && kit.color !== '#888888' ? [kit.color] : []
    if (fallback.length === 0) return []
    allColors.push(...fallback)
  }
  const c = allColors
  const primaryColors = c.slice(0, 3).length >= 2 ? c.slice(0, 3) : [...c.slice(0, 2), '#1a1a1a']
  return [
    {
      id: `brand-${kit.id}-primary`,
      name: 'Primary Brand Colors',
      colors: primaryColors,
      section: 'brand',
      prompt: buildBrandPrompt(kit, 'Primary', primaryColors[0], primaryColors[2] ?? primaryColors[1]),
    },
    {
      id: `brand-${kit.id}-dark`,
      name: 'Dark Mode',
      colors: ['#0a0a0a', c[0] ?? '#ffffff', c[1] ?? '#fbbf24'],
      section: 'brand',
      prompt: buildBrandPrompt(kit, 'Dark', '#0a0a0a', c[0] ?? '#ffffff'),
    },
    {
      id: `brand-${kit.id}-minimal`,
      name: 'Minimal Accent',
      colors: ['#18181b', '#e4e4e7', c[0] ?? '#6366f1'],
      section: 'brand',
      prompt: buildBrandPrompt(kit, 'Minimal', '#18181b', c[0] ?? '#6366f1'),
    },
    {
      id: `brand-${kit.id}-light`,
      name: 'Light & Professional',
      colors: ['#f8f8f8', '#1a1a1a', c[0] ?? '#6366f1'],
      section: 'brand',
      prompt: buildBrandPrompt(kit, 'Light', '#f8f8f8', c[0] ?? '#6366f1'),
    },
  ]
}

export const PROMPT_TONES = [
  { id: 'professional',  label: 'Professional', desc: 'Polished & credible' },
  { id: 'friendly',      label: 'Friendly',     desc: 'Warm & approachable' },
  { id: 'bold',          label: 'Bold',         desc: 'Confident & direct' },
  { id: 'playful',       label: 'Playful',      desc: 'Fun & energetic' },
  { id: 'elegant',       label: 'Elegant',      desc: 'Refined & tasteful' },
  { id: 'casual',        label: 'Casual',       desc: 'Relaxed & natural' },
  { id: 'inspirational', label: 'Inspirational',desc: 'Uplifting & motivating' },
  { id: 'witty',         label: 'Witty',        desc: 'Clever & entertaining' },
  { id: 'direct',        label: 'Direct',       desc: 'Clear & no-nonsense' },
]
