import { create } from 'zustand'
import type { GeneratedLogo, LogoUseCase } from '@/features/brand-kit/types/brand'

export interface BrandImage {
  id: string
  dataUrl: string
  name: string
  category: 'product' | 'team' | 'inspiration' | 'other'
}

interface WizardState {
  step: number
  subPhase: 'industry' | 'name'
  kitId: string
  industry: string
  name: string
  tagline: string
  archetypes: string[]
  values: string[]
  differentiator: string
  visualDirection: string
  logoStyleId: string
  colorToneId: string
  logoPrompt: string
  brandImages: BrandImage[]
  audienceAgeMin: number
  audienceAgeMax: number
  audienceGender: string
  audienceLocations: string[]
  regenerationCount: number
  generatedPalette: string[]
  generatedFontPairs: Array<{ display: string; body: string }>
  selectedFontIndex: number
  generatedLogos: GeneratedLogo[]
  selectedLogoId: string
  useCases: LogoUseCase[]

  setStep: (step: number) => void
  setSubPhase: (p: 'industry' | 'name') => void
  setKitId: (id: string) => void
  setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void
  setGenerated: (payload: {
    palette: string[]
    fontPairs: Array<{ display: string; body: string }>
    logos: GeneratedLogo[]
  }) => void
  setUseCases: (useCases: LogoUseCase[]) => void
  incrementRegenCount: () => void
  reset: () => void
}

const INITIAL: Omit<WizardState, keyof ReturnType<typeof createActions>> = {
  step: 1,
  subPhase: 'industry',
  kitId: '',
  industry: '',
  name: '',
  tagline: '',
  archetypes: [],
  values: [],
  differentiator: '',
  visualDirection: '',
  logoStyleId: 'lettermark',
  colorToneId: 'cool',
  logoPrompt: '',
  brandImages: [],
  audienceAgeMin: 25,
  audienceAgeMax: 45,
  audienceGender: 'All genders',
  audienceLocations: [],
  regenerationCount: 0,
  generatedPalette: [],
  generatedFontPairs: [],
  selectedFontIndex: 0,
  generatedLogos: [],
  selectedLogoId: '',
  useCases: [],
}

function createActions(set: (fn: (s: WizardState) => Partial<WizardState>) => void) {
  return {
    setStep: (step: number) => set(() => ({ step })),
    setSubPhase: (subPhase: 'industry' | 'name') => set(() => ({ subPhase })),
    setKitId: (kitId: string) => set(() => ({ kitId })),
    setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
      set(() => ({ [key]: value } as Partial<WizardState>)),
    setGenerated: (payload: {
      palette: string[]
      fontPairs: Array<{ display: string; body: string }>
      logos: GeneratedLogo[]
    }) =>
      set(() => ({
        generatedPalette: payload.palette,
        generatedFontPairs: payload.fontPairs,
        generatedLogos: payload.logos,
        selectedLogoId: payload.logos[0]?.id ?? '',
      })),
    setUseCases: (useCases: LogoUseCase[]) => set(() => ({ useCases })),
    incrementRegenCount: () => set((s) => ({ regenerationCount: s.regenerationCount + 1 })),
    reset: () => set(() => ({ ...INITIAL })),
  }
}

export const useWizardStore = create<WizardState>((set) => ({
  ...INITIAL,
  ...createActions(set as (fn: (s: WizardState) => Partial<WizardState>) => void),
}))
