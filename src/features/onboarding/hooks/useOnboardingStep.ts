import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore'

const TOTAL_STEPS = 9

/** Centralises step navigation, skip logic, and per-step validation. */
export function useOnboardingStep() {
  const { step, importPath, prevStep, setStep, email, brandName, selectedProduct } =
    useOnboardingStore()

  // Step 6 (Processing) is skipped when the import path is blank
  const displayStep = step === 6 && importPath === 'blank' ? 7 : step

  const isProcessing = displayStep === 6
  const isComplete   = displayStep === 9
  const showBack     = displayStep > 1 && !isProcessing && !isComplete
  const progress     = (displayStep / TOTAL_STEPS) * 100

  function goBack() {
    if (displayStep === 7 && importPath === 'blank') {
      setStep(5)
    } else {
      prevStep()
    }
  }

  /** Per-step "can proceed" validation */
  function canProceed(): boolean {
    switch (displayStep) {
      case 1: return email.length > 0 && email.includes('@')
      case 4: return brandName.trim().length > 0
      case 3: return selectedProduct !== null
      default: return true
    }
  }

  return {
    step,
    displayStep,
    totalSteps: TOTAL_STEPS,
    isProcessing,
    isComplete,
    showBack,
    progress,
    goBack,
    canProceed,
  }
}
