import type { LogoUseCase } from '@/features/brand-kit/types/brand'

function stripSvgWrapper(svg: string): string {
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
}

export function generateUseCases(logoSvg: string, primaryColor: string): LogoUseCase[] {
  const inner = stripSvgWrapper(logoSvg)

  const wrap = (bg: string, id: string, bg_type: LogoUseCase['background']): LogoUseCase => ({
    id,
    background: bg_type,
    svg: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="180" fill="${bg}" rx="6"/>
  <svg x="85" y="15" width="150" height="150" viewBox="0 0 200 200">${inner}</svg>
</svg>`,
  })

  return [
    wrap('#0A0A0A', 'uc-dark', 'dark'),
    wrap('#FFFFFF', 'uc-light', 'light'),
    wrap(primaryColor, 'uc-colored', 'colored'),
  ]
}
