import { useEffect, useState } from 'react'
import { Portal } from '@/shared/lib/Portal'
import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import { WizStep1_Basics, WizStep1_Nav } from './wizard-steps/WizStep1_Basics'
import { WizStep3_Values, WizStep3_Nav } from './wizard-steps/WizStep3_Values'
import { WizStep4_Audience, WizStep4_Nav } from './wizard-steps/WizStep4_Audience'
import { WizStep5_Visual, WizStep5_Nav } from './wizard-steps/WizStep5_Visual'
import { WizStep_Images, WizStep_ImagesNav } from './wizard-steps/WizStep_Images'
import { WizStep6_Logo, WizStep6_Nav } from './wizard-steps/WizStep6_Logo'
import { WizStep7_Processing } from './wizard-steps/WizStep7_Processing'
import { WizCongratsScreen } from './wizard-steps/WizCongratsScreen'
import { WizPreviewPanel } from './wizard-steps/WizPreviewPanel'

const TOTAL_STEPS = 7
// Step order: Industry/Name → Values → Audience → Brand Images → Logo Design → Palette & Fonts → Generating
const STEP_TITLES = [
  'Industry & Name',
  'Brand Values',
  'Audience',
  'Brand Images',
  'Logo Design',
  'Palette & Fonts',
  'Generating',
]

interface Props {
  kitId: string
  onClose: () => void
  onAfterApply?: (action: 'new-theme' | 'done') => void
}

export function BrandIdentityWizard({ kitId, onClose, onAfterApply }: Props) {
  const wizard = useWizardStore()
  const { updateKit, createKit } = useBrandStore()
  const [appliedDone, setAppliedDone] = useState(false)

  useEffect(() => {
    wizard.reset()
    wizard.setKitId(kitId)
  }, [kitId])

  const { step } = wizard
  const progress = appliedDone ? 100 : ((step - 1) / (TOTAL_STEPS - 1)) * 100

  function goTo(s: number) {
    wizard.setStep(s)
  }

  function handleApply() {
    const {
      name, tagline, archetypes, values, differentiator,
      visualDirection, logoStyleId, colorToneId,
      generatedPalette, generatedFontPairs, selectedFontIndex,
      generatedLogos, selectedLogoId, useCases,
    } = wizard

    const targetKitId = kitId || createKit()
    const selectedLogo = generatedLogos.find((l) => l.id === selectedLogoId) ?? generatedLogos[0]
    const fontPair = generatedFontPairs[selectedFontIndex] ?? generatedFontPairs[0]
    const PALETTE_ROLES = ['Primary', 'Secondary', 'Accent', 'Neutral', 'Surface']

    updateKit(targetKitId, (k: BrandKit): BrandKit => {
      const updatedLogos = { ...k.logos }
      if (selectedLogo) {
        updatedLogos.variants = [
          { name: 'Primary', bg: 'transparent', note: 'Generated logo', src: `data:image/svg+xml;utf8,${encodeURIComponent(selectedLogo.svg)}` },
          ...useCases.map((uc) => ({
            name: `On ${uc.background} background`,
            bg: uc.background === 'dark' ? '#0A0A0A' : uc.background === 'light' ? '#FFFFFF' : generatedPalette[0] ?? '#888',
            note: 'Use case render',
            src: `data:image/svg+xml;utf8,${encodeURIComponent(uc.svg)}`,
          })),
        ]
      }

      const newPalette = generatedPalette.length > 0
        ? [{
            id: 'brand-identity',
            name: 'Brand Identity',
            desc: 'Generated from logo tone selection',
            colors: generatedPalette.map((hex, i) => ({
              name: PALETTE_ROLES[i] ?? `Color ${i + 1}`,
              hex,
              role: (PALETTE_ROLES[i] ?? 'other').toLowerCase(),
            })),
          }, ...k.colors.palettes.filter((p) => p.id !== 'brand-identity')]
        : k.colors.palettes

      return {
        ...k,
        name: name || k.name,
        tagline: tagline || k.tagline,
        color: generatedPalette[0] ?? k.color,
        logoText: (name || k.name).slice(0, 2).toUpperCase(),
        logoStyle: { background: generatedPalette[0] ?? k.color, color: '#ffffff' },
        swatches: generatedPalette.length > 0 ? generatedPalette.slice(0, 5) : k.swatches,
        colors: { ...k.colors, palettes: newPalette },
        type: fontPair
          ? {
              ...k.type,
              display: { family: fontPair.display, weight: '800', note: '' },
              body:    { family: fontPair.body,    weight: '400', note: '' },
            }
          : k.type,
        logos: updatedLogos,
        spirit: {
          archetype: archetypes,
          values,
          differentiator,
          visualDirection,
          logoStyle: logoStyleId,
          colorTone: colorToneId,
          wizardCompleted: true,
        },
        updated: new Date().toISOString().slice(0, 10),
      }
    })

    setAppliedDone(true)
  }

  function handleClose() {
    wizard.reset()
    onClose()
  }

  function handleCreateTheme() {
    wizard.reset()
    if (onAfterApply) {
      onAfterApply('new-theme')
    } else {
      onClose()
    }
  }

  function handleDone() {
    wizard.reset()
    onClose()
  }

  return (
    <Portal>
      <div className="biz-shell">
        <div className={`biz-card${appliedDone ? ' biz-card--congrats' : ''}`}>

          {/* LEFT: Vertical stepper */}
          {!appliedDone && (
            <div className="biz-stepper">
              <button className="biz-stepper-close" onClick={handleClose} aria-label="Close">✕</button>
              <div className="biz-stepper-steps">
                {STEP_TITLES.map((title, i) => {
                  const s = i + 1
                  const done = step > s
                  const active = step === s
                  return (
                    <div key={s} className={`biz-stepper-item${active ? ' active' : ''}${done ? ' done' : ''}`} title={title}>
                      <div className="biz-stepper-dot">
                        {done ? '✓' : active ? '●' : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* MIDDLE: Setup panel */}
          <div className="biz-setup">
            <div className="biz-body">
              {appliedDone ? (
                <WizCongratsScreen
                  onCreateTheme={handleCreateTheme}
                  onDone={handleDone}
                />
              ) : (
                <>
                  {step === 1 && <WizStep1_Basics />}
                  {step === 2 && <WizStep3_Values />}
                  {step === 3 && <WizStep4_Audience />}
                  {step === 4 && <WizStep_Images />}
                  {step === 5 && <WizStep6_Logo />}
                  {step === 6 && <WizStep5_Visual />}
                  {step === 7 && <WizStep7_Processing onDone={handleApply} />}
                </>
              )}

            </div>

            {/* Nav footer */}
            {!appliedDone && (
              <>
                {step === 1 && <WizStep1_Nav onNext={() => goTo(2)} onBack={handleClose} />}
                {step === 2 && <WizStep3_Nav onNext={() => goTo(3)} onBack={() => goTo(1)} />}
                {step === 3 && <WizStep4_Nav onNext={() => goTo(4)} onBack={() => goTo(2)} />}
                {step === 4 && <WizStep_ImagesNav onNext={() => goTo(5)} onBack={() => goTo(3)} />}
                {step === 5 && <WizStep6_Nav onNext={() => goTo(6)} onBack={() => goTo(4)} />}
                {step === 6 && <WizStep5_Nav onNext={() => goTo(7)} onBack={() => goTo(5)} />}
              </>
            )}
          </div>

          {/* RIGHT: Preview panel */}
          {!appliedDone && <WizPreviewPanel />}
        </div>
      </div>
    </Portal>
  )
}
