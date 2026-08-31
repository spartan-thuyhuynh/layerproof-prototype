import { create } from 'zustand'
import type { ModalState, TweakState } from '@/features/brand-kit/types/brand'

type View = 'kit' | 'all'

interface UIStore {
  view: View
  focusedId: string
  modal: ModalState | null
  /** Section the brand kit detail view should jump to; consumed and cleared by Detail. */
  pendingSection: string | null
  tweaks: TweakState
  setView: (v: View) => void
  setFocusedId: (id: string) => void
  setModal: (m: ModalState | null) => void
  setPendingSection: (s: string | null) => void
  setTweak: (key: keyof TweakState, value: string) => void
  focusKit: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  view: 'all',
  focusedId: 'layerproof',
  modal: null,
  pendingSection: null,
  tweaks: { accent: '#ffde42', density: 'default' },
  setView: (view) => set({ view }),
  setFocusedId: (focusedId) => set({ focusedId }),
  setModal: (modal) => set({ modal }),
  setPendingSection: (pendingSection) => set({ pendingSection }),
  setTweak: (key, value) =>
    set((state) => ({ tweaks: { ...state.tweaks, [key]: value } })),
  focusKit: (id) => set({ focusedId: id, view: 'kit' }),
}))
