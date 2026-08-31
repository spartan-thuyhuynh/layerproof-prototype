import { useEffect, useState } from 'react'
import { useWizardStore } from '@/features/brand-kit/store/useWizardStore'
import { generatePalette, generateFontPairs, generateLogos } from '@/features/brand-kit/lib/generateIdentity'
import { generateUseCases } from '@/features/brand-kit/lib/generateUseCases'

const STEPS = [
  'Analyzing brand values',
  'Building color palette',
  'Selecting typography',
  'Crafting logo concepts',
  'Composing logo variants',
  'Finalizing brand identity',
]

const STEP_DELAYS = [800, 900, 750, 1000, 1200, 700]

interface Props {
  onDone: () => void
}

export function WizStep7_Processing({ onDone }: Props) {
  const [doneCount, setDoneCount] = useState(0)
  const {
    archetypes, colorToneId, logoStyleId, name,
    regenerationCount, generatedLogos, generatedPalette,
    selectedLogoId, useCases,
    setGenerated, setUseCases,
  } = useWizardStore()

  useEffect(() => {
    const hasExisting = generatedLogos.length > 0
    let total = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    STEP_DELAYS.forEach((delay, i) => {
      total += delay
      timers.push(setTimeout(() => setDoneCount(i + 1), total))
    })

    const finalTimer = setTimeout(() => {
      if (!hasExisting) {
        const palette = generatePalette(colorToneId, archetypes)
        const fontPairs = generateFontPairs(archetypes)
        const logos = generateLogos(logoStyleId, name || 'Brand', palette[0], regenerationCount)
        setGenerated({ palette, fontPairs, logos })
        if (logos[0]) setUseCases(generateUseCases(logos[0].svg, palette[0]))
      } else if (useCases.length === 0) {
        const logo = generatedLogos.find((l) => l.id === selectedLogoId) ?? generatedLogos[0]
        if (logo) setUseCases(generateUseCases(logo.svg, generatedPalette[0] ?? '#888'))
      }
      onDone()
    }, total + 300)

    timers.push(finalTimer)
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="biz-processing">
      <h2 className="biz-processing-title">Building your brand identity…</h2>
      <div className="biz-processing-steps">
        {STEPS.map((label, i) => {
          const done = doneCount > i
          const active = doneCount === i
          return (
            <div
              key={label}
              className={`biz-processing-step${done ? ' done' : ''}${active ? ' active' : ''}`}
            >
              <span className="biz-step-icon">
                {done ? '✓' : active ? <span className="biz-spinner" /> : <span style={{ fontSize: 11 }}>{i + 1}</span>}
              </span>
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
