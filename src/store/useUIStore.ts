import { create } from 'zustand'
import type { ModalState, TweakState } from '@/types/brand'

type View = 'kit' | 'all'

interface UIStore {
  view: View
  focusedId: string
  modal: ModalState | null
  tweaks: TweakState
  setView: (v: View) => void
  setFocusedId: (id: string) => void
  setModal: (m: ModalState | null) => void
  setTweak: (key: keyof TweakState, value: string) => void
  focusKit: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  view: 'all',
  focusedId: 'layerproof',
  modal: null,
  tweaks: { accent: '#ffde42', density: 'default' },
  setView: (view) => set({ view }),
  setFocusedId: (focusedId) => set({ focusedId }),
  setModal: (modal) => set({ modal }),
  setTweak: (key, value) =>
    set((state) => ({ tweaks: { ...state.tweaks, [key]: value } })),
  focusKit: (id) => set({ focusedId: id, view: 'kit' }),
}))
