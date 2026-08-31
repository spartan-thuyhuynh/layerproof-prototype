export interface LogoStyleOption {
  id: string
  label: string
  description: string
  exampleSvg: string
}

export const LOGO_STYLES: LogoStyleOption[] = [
  {
    id: 'wordmark',
    label: 'Wordmark',
    description: 'Brand name in a distinctive typeface',
    exampleSvg: `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><text x="8" y="27" font-family="Inter,sans-serif" font-size="18" font-weight="800" fill="currentColor">BRAND</text></svg>`,
  },
  {
    id: 'lettermark',
    label: 'Lettermark',
    description: 'Initials inside a geometric shape',
    exampleSvg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/><text x="20" y="26" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="800" fill="currentColor">B</text></svg>`,
  },
  {
    id: 'abstract',
    label: 'Abstract Mark',
    description: 'Geometric symbol representing your brand',
    exampleSvg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 36,32 4,32" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="currentColor"/></svg>`,
  },
  {
    id: 'combination',
    label: 'Combination Mark',
    description: 'Icon paired with your brand name',
    exampleSvg: `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="2"/><text x="16" y="25" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="800" fill="currentColor">B</text><text x="38" y="25" font-family="Inter,sans-serif" font-size="14" font-weight="700" fill="currentColor">Brand</text></svg>`,
  },
  {
    id: 'emblem',
    label: 'Emblem',
    description: 'Initials enclosed in a badge or seal',
    exampleSvg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M20 3 L34 10 L37 25 L20 37 L3 25 L6 10 Z" fill="none" stroke="currentColor" stroke-width="2"/><text x="20" y="25" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="800" fill="currentColor">B</text></svg>`,
  },
  {
    id: 'monogram',
    label: 'Monogram',
    description: 'Stylized stacked or interlinked initials',
    exampleSvg: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><text x="20" y="18" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="900" fill="currentColor">B</text><text x="20" y="34" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="400" fill="currentColor" letter-spacing="4">CO</text></svg>`,
  },
]
