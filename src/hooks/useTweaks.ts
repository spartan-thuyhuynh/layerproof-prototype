import { useEffect } from 'react'
import type { TweakState } from '@/types/brand'
import { applyAccentVars } from '@/lib/utils'

export function useTweaks(tweaks: TweakState) {
  useEffect(() => {
    applyAccentVars(tweaks.accent)
    document.documentElement.setAttribute('data-density', tweaks.density)
  }, [tweaks.accent, tweaks.density])
}
