import { create } from 'zustand'
import { BRAND_KITS } from '@/data/brand-kits'
import type { BrandKit, BrandTheme } from '@/features/brand-kit/types/brand'
import { deepClone } from '@/shared/lib/utils'

interface BrandStore {
  kits: BrandKit[]
  appliedId: string
  setAppliedId: (id: string) => void
  updateKit: (id: string, updater: (k: BrandKit) => BrandKit) => void
  createKit: () => string
  deleteKit: (id: string) => void
  addTheme: (kitId: string, theme: BrandTheme) => void
  updateTheme: (kitId: string, themeId: string, updater: (t: BrandTheme) => BrandTheme) => void
  deleteTheme: (kitId: string, themeId: string) => void
  markSectionVisited: (kitId: string, sectionId: string) => void
}

function makeEmptyKit(): BrandKit {
  const id = 'kit-' + Math.random().toString(36).slice(2, 10)
  return {
    id,
    name: 'Untitled',
    tagline: '',
    onboarding: true,
    color: '#888888',
    logoText: 'U',
    logoStyle: { background: '#2a2a2a', color: '#ffffff' },
    swatches: [],
    updated: new Date().toISOString().slice(0, 10),
    assets: 0,
    colors: { palettes: [] },
    type: {
      display: { family: 'Inter', weight: '800', note: '' },
      body:    { family: 'Inter', weight: '400', note: '' },
      scale:   [],
      rules:   [],
    },
    logos: { clearColor: '#000000', minSize: '24px', variants: [], donts: [] },
    imagery: { desc: '', tags: [], dos: [], donts: [] },
    tone: { attrs: [], use: [], avoid: [], off: '', on: '' },
    layout: { grid: '8px', spacing: [], radius: [], rules: [] },
    categories: [
      { id: 'overview',   label: 'Overview',     icon: 'grid',    fixed: true, hidden: false },
      { id: 'logos',      label: 'Logos',        icon: 'image',   fixed: true, hidden: false },
      { id: 'colors',     label: 'Colors',       icon: 'palette', fixed: true, hidden: false },
      { id: 'typography', label: 'Typography',   icon: 'type',    fixed: true, hidden: false },
      { id: 'tone',       label: 'Brand Voice',  icon: 'mic',     fixed: true, hidden: false },
      { id: 'imagery',    label: 'Image Assets', icon: 'photo',   fixed: true, hidden: false },
    ],
    themes: [],
  }
}

export const useBrandStore = create<BrandStore>((set) => ({
  kits: deepClone(BRAND_KITS),
  appliedId: '',
  setAppliedId: (id) => set({ appliedId: id }),
  updateKit: (id, updater) =>
    set((state) => ({
      kits: state.kits.map((k) => (k.id === id ? updater(k) : k)),
    })),
  createKit: () => {
    const kit = makeEmptyKit()
    set((state) => ({ kits: [...state.kits, kit] }))
    return kit.id
  },
  deleteKit: (id) =>
    set((state) => ({ kits: state.kits.filter((k) => k.id !== id) })),
  addTheme: (kitId, theme) =>
    set((state) => ({
      kits: state.kits.map((k) =>
        k.id === kitId ? { ...k, themes: [...(k.themes ?? []), theme] } : k
      ),
    })),
  updateTheme: (kitId, themeId, updater) =>
    set((state) => ({
      kits: state.kits.map((k) =>
        k.id === kitId
          ? { ...k, themes: (k.themes ?? []).map((t) => (t.id === themeId ? updater(t) : t)) }
          : k
      ),
    })),
  deleteTheme: (kitId, themeId) =>
    set((state) => ({
      kits: state.kits.map((k) =>
        k.id === kitId
          ? { ...k, themes: (k.themes ?? []).filter((t) => t.id !== themeId) }
          : k
      ),
    })),
  markSectionVisited: (kitId, sectionId) =>
    set((state) => ({
      kits: state.kits.map((k) =>
        k.id === kitId
          ? { ...k, visitedSections: [...new Set([...(k.visitedSections ?? []), sectionId])] }
          : k
      ),
    })),
}))
