import { create } from 'zustand'

export type ProductId = 'matte' | 'chromo' | 'vellum' | 'kraft'

interface OnboardingState {
  step: number
  email: string
  intents: string[]
  selectedProduct: ProductId | null
  brandName: string
  tagline: string
  brandDescription: string
  importPath: 'url' | 'pdf' | 'blank' | null
  importUrl: string
  newKitId: string | null
  projectName: string
  projectMeta: Record<string, string>

  setStep: (n: number) => void
  nextStep: () => void
  prevStep: () => void
  setEmail: (e: string) => void
  toggleIntent: (i: string) => void
  setProduct: (p: ProductId) => void
  setBrandName: (n: string) => void
  setTagline: (t: string) => void
  setBrandDescription: (d: string) => void
  setImportPath: (p: OnboardingState['importPath']) => void
  setImportUrl: (u: string) => void
  setNewKitId: (id: string) => void
  setProjectName: (n: string) => void
  setProjectMeta: (key: string, value: string) => void
  reset: () => void
}

const INITIAL: Pick<OnboardingState,
  'step' | 'email' | 'intents' | 'selectedProduct' | 'brandName' |
  'tagline' | 'brandDescription' | 'importPath' | 'importUrl' | 'newKitId' | 'projectName' | 'projectMeta'
> = {
  step: 1,
  email: '',
  intents: [],
  selectedProduct: null,
  brandName: '',
  tagline: '',
  brandDescription: '',
  importPath: null,
  importUrl: '',
  newKitId: null,
  projectName: '',
  projectMeta: {},
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...INITIAL,

  setStep: (n) => set({ step: n }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  prevStep: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
  setEmail: (email) => set({ email }),
  toggleIntent: (id) => set((s) => ({
    intents: s.intents.includes(id)
      ? s.intents.filter((i) => i !== id)
      : [...s.intents, id],
  })),
  setProduct: (selectedProduct) => set({ selectedProduct }),
  setBrandName: (brandName) => set({ brandName }),
  setTagline: (tagline) => set({ tagline }),
  setBrandDescription: (brandDescription) => set({ brandDescription }),
  setImportPath: (importPath) => set({ importPath }),
  setImportUrl: (importUrl) => set({ importUrl }),
  setNewKitId: (newKitId) => set({ newKitId }),
  setProjectName: (projectName) => set({ projectName }),
  setProjectMeta: (key, value) => set((s) => ({
    projectMeta: { ...s.projectMeta, [key]: value },
  })),
  reset: () => set({ ...INITIAL }),
}))
