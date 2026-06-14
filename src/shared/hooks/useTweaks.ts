import { useEffect } from 'react'
import type { TweakState } from '@/features/brand-kit/types/brand'
import { applyAccentVars } from '@/shared/lib/utils'

export function useTweaks(tweaks: TweakState) {
  useEffect(() => {
    applyAccentVars(tweaks.accent)
    document.documentElement.setAttribute('data-density', tweaks.density)
  }, [tweaks.accent, tweaks.density])
}
