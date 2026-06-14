import { useState } from 'react'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { useUIStore } from '@/shared/store/useUIStore'

const INTRO_KEY = 'bk_intro_seen'

export function useBrandKit() {
  const { kits, appliedId, setAppliedId } = useBrandStore()
  const { modal, tweaks, setModal, focusedId } = useUIStore()
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_KEY))

  const focusedKit = kits.find((k) => k.id === focusedId) ?? kits[0]

  function dismissIntro() {
    localStorage.setItem(INTRO_KEY, '1')
    setShowIntro(false)
  }

  function closeModal() {
    setModal(null)
  }

  return {
    kits,
    appliedId,
    setAppliedId,
    modal,
    tweaks,
    setModal,
    closeModal,
    focusedKit,
    showIntro,
    dismissIntro,
  }
}
