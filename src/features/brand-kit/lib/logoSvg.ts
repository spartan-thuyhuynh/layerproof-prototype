// SVG logo template library: 6 styles × 6 seed variants = 36 builders

function hsl(h: number, s: number, l: number) {
  return `hsl(${h},${s}%,${l}%)`
}

interface LogoParams {
  initials: string
  name: string
  primaryColor: string
  seed: number
}

type LogoBuilder = (p: LogoParams) => string

// ---- Wordmark ----
const wordmarkBuilders: LogoBuilder[] = [
  ({ name, primaryColor }) =>
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="16" y="52" font-family="Inter,sans-serif" font-size="36" font-weight="900" letter-spacing="-1" fill="${primaryColor}">${name}</text></svg>`,
  ({ name, primaryColor }) =>
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="16" y="52" font-family="Inter,sans-serif" font-size="28" font-weight="400" letter-spacing="8" fill="${primaryColor}">${name.toUpperCase()}</text></svg>`,
  ({ name, primaryColor }) =>
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="16" y="52" font-family="Georgia,serif" font-size="34" font-weight="700" fill="${primaryColor}" font-style="italic">${name}</text></svg>`,
  ({ name, primaryColor }) =>
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="16" y="50" font-family="Inter,sans-serif" font-size="30" font-weight="800" fill="${primaryColor}">${name.slice(0,1).toUpperCase() + name.slice(1).toLowerCase()}</text><rect x="16" y="56" width="60" height="3" fill="${primaryColor}" opacity="0.6"/></svg>`,
  ({ name, primaryColor }) =>
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="16" y="48" font-family="Inter,sans-serif" font-size="38" font-weight="900" fill="${primaryColor}" opacity="0.15">${name}</text><text x="18" y="46" font-family="Inter,sans-serif" font-size="38" font-weight="900" fill="${primaryColor}">${name}</text></svg>`,
  ({ name, primaryColor }) =>
    `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><text x="16" y="36" font-family="Inter,sans-serif" font-size="14" font-weight="400" letter-spacing="6" fill="${primaryColor}" opacity="0.6">${name.toUpperCase().split('').join(' ')}</text><text x="16" y="62" font-family="Inter,sans-serif" font-size="30" font-weight="800" fill="${primaryColor}">${name}</text></svg>`,
]

// ---- Lettermark ----
const lettermarkBuilders: LogoBuilder[] = [
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="90" fill="none" stroke="${primaryColor}" stroke-width="6"/><text x="100" y="118" text-anchor="middle" font-family="Inter,sans-serif" font-size="80" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="180" height="180" rx="24" fill="none" stroke="${primaryColor}" stroke-width="6"/><text x="100" y="118" text-anchor="middle" font-family="Inter,sans-serif" font-size="80" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="180" height="180" rx="90" fill="${primaryColor}"/><text x="100" y="118" text-anchor="middle" font-family="Inter,sans-serif" font-size="80" font-weight="900" fill="#ffffff">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="180" height="180" rx="8" fill="${primaryColor}"/><text x="100" y="118" text-anchor="middle" font-family="Inter,sans-serif" font-size="80" font-weight="900" fill="#ffffff">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="100,10 190,55 190,145 100,190 10,145 10,55" fill="none" stroke="${primaryColor}" stroke-width="6"/><text x="100" y="118" text-anchor="middle" font-family="Inter,sans-serif" font-size="72" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="100" rx="80" ry="60" fill="none" stroke="${primaryColor}" stroke-width="6"/><text x="100" y="115" text-anchor="middle" font-family="Inter,sans-serif" font-size="64" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
]

// ---- Abstract Mark ----
const abstractBuilders: LogoBuilder[] = [
  ({ primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="${primaryColor}" opacity="0.15"/><polygon points="100,40 150,70 150,130 100,160 50,130 50,70" fill="none" stroke="${primaryColor}" stroke-width="5"/><circle cx="100" cy="100" r="18" fill="${primaryColor}"/></svg>`,
  ({ primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 20 A80 80 0 0 1 180 100" fill="none" stroke="${primaryColor}" stroke-width="12" stroke-linecap="round"/><path d="M180 100 A80 80 0 0 1 100 180" fill="none" stroke="${primaryColor}" stroke-width="6" stroke-linecap="round" opacity="0.5"/><circle cx="100" cy="100" r="14" fill="${primaryColor}"/></svg>`,
  ({ primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="30" width="60" height="60" rx="8" fill="${primaryColor}"/><rect x="110" y="30" width="60" height="60" rx="8" fill="${primaryColor}" opacity="0.5"/><rect x="30" y="110" width="60" height="60" rx="8" fill="${primaryColor}" opacity="0.5"/><rect x="110" y="110" width="60" height="60" rx="8" fill="${primaryColor}" opacity="0.25"/></svg>`,
  ({ primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="70" fill="none" stroke="${primaryColor}" stroke-width="8"/><circle cx="100" cy="100" r="48" fill="none" stroke="${primaryColor}" stroke-width="5" opacity="0.5"/><circle cx="100" cy="100" r="24" fill="${primaryColor}"/></svg>`,
  ({ primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M40 160 L100 40 L160 160 Z" fill="none" stroke="${primaryColor}" stroke-width="6"/><path d="M70 160 L100 100 L130 160 Z" fill="${primaryColor}" opacity="0.8"/></svg>`,
  ({ primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="70" cy="100" r="50" fill="${primaryColor}" opacity="0.6"/><circle cx="130" cy="100" r="50" fill="${primaryColor}" opacity="0.6"/><circle cx="100" cy="100" r="30" fill="${primaryColor}"/></svg>`,
]

// ---- Combination Mark ----
const combinationBuilders: LogoBuilder[] = [
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="40" r="28" fill="${primaryColor}"/><text x="36" y="47" text-anchor="middle" font-family="Inter,sans-serif" font-size="22" font-weight="900" fill="#ffffff">${initials}</text><text x="76" y="46" font-family="Inter,sans-serif" font-size="24" font-weight="800" fill="${primaryColor}">${name}</text></svg>`,
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg"><rect x="60" y="8" width="60" height="36" rx="8" fill="${primaryColor}"/><text x="90" y="32" text-anchor="middle" font-family="Inter,sans-serif" font-size="20" font-weight="900" fill="#ffffff">${initials}</text><text x="90" y="74" text-anchor="middle" font-family="Inter,sans-serif" font-size="18" font-weight="700" fill="${primaryColor}">${name}</text></svg>`,
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg"><polygon points="36,12 58,28 58,52 36,68 14,52 14,28" fill="${primaryColor}"/><text x="36" y="46" text-anchor="middle" font-family="Inter,sans-serif" font-size="18" font-weight="900" fill="#ffffff">${initials}</text><text x="74" y="46" font-family="Inter,sans-serif" font-size="22" font-weight="700" fill="${primaryColor}">${name}</text></svg>`,
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="40" r="28" fill="none" stroke="${primaryColor}" stroke-width="4"/><text x="36" y="47" text-anchor="middle" font-family="Inter,sans-serif" font-size="22" font-weight="900" fill="${primaryColor}">${initials}</text><text x="76" y="46" font-family="Georgia,serif" font-size="22" font-weight="400" fill="${primaryColor}" font-style="italic">${name}</text></svg>`,
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="12" width="56" height="56" rx="4" fill="${primaryColor}" opacity="0.12"/><text x="36" y="48" text-anchor="middle" font-family="Inter,sans-serif" font-size="26" font-weight="900" fill="${primaryColor}">${initials}</text><text x="76" y="38" font-family="Inter,sans-serif" font-size="16" font-weight="800" letter-spacing="3" fill="${primaryColor}">${name.toUpperCase()}</text></svg>`,
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="40" r="28" fill="${primaryColor}" opacity="0.1"/><text x="36" y="48" text-anchor="middle" font-family="Inter,sans-serif" font-size="24" font-weight="900" fill="${primaryColor}">${initials}</text><line x1="72" y1="20" x2="72" y2="60" stroke="${primaryColor}" stroke-width="1.5" opacity="0.3"/><text x="82" y="46" font-family="Inter,sans-serif" font-size="22" font-weight="600" fill="${primaryColor}">${name}</text></svg>`,
]

// ---- Emblem ----
const emblemBuilders: LogoBuilder[] = [
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 15 L176 52 L176 148 L100 185 L24 148 L24 52 Z" fill="none" stroke="${primaryColor}" stroke-width="5"/><path d="M100 35 L160 65 L160 135 L100 165 L40 135 L40 65 Z" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.4"/><text x="100" y="116" text-anchor="middle" font-family="Inter,sans-serif" font-size="52" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 15 L176 52 L176 148 L100 185 L24 148 L24 52 Z" fill="${primaryColor}"/><text x="100" y="102" text-anchor="middle" font-family="Inter,sans-serif" font-size="44" font-weight="900" fill="#ffffff">${initials}</text><text x="100" y="130" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="400" fill="#ffffff" letter-spacing="3" opacity="0.8">${name.toUpperCase().slice(0,8)}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 18 C120 18 176 50 176 100 C176 150 120 182 100 182 C80 182 24 150 24 100 C24 50 80 18 100 18 Z" fill="none" stroke="${primaryColor}" stroke-width="5"/><text x="100" y="116" text-anchor="middle" font-family="Georgia,serif" font-size="56" font-weight="700" fill="${primaryColor}" font-style="italic">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="170" height="170" rx="20" fill="none" stroke="${primaryColor}" stroke-width="5"/><rect x="25" y="25" width="150" height="150" rx="14" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.3"/><text x="100" y="116" text-anchor="middle" font-family="Inter,sans-serif" font-size="64" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
  ({ initials, name, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 10 L185 55 L185 145 L100 190 L15 145 L15 55 Z" fill="${primaryColor}" opacity="0.08"/><path d="M100 10 L185 55 L185 145 L100 190 L15 145 L15 55 Z" fill="none" stroke="${primaryColor}" stroke-width="4"/><text x="100" y="100" text-anchor="middle" font-family="Inter,sans-serif" font-size="40" font-weight="900" fill="${primaryColor}">${initials}</text><text x="100" y="124" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="500" letter-spacing="4" fill="${primaryColor}" opacity="0.7">${name.toUpperCase().slice(0,8)}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 20 L135 40 L155 75 L155 125 L135 160 L100 180 L65 160 L45 125 L45 75 L65 40 Z" fill="none" stroke="${primaryColor}" stroke-width="5"/><text x="100" y="115" text-anchor="middle" font-family="Inter,sans-serif" font-size="56" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
]

// ---- Monogram ----
const monogramBuilders: LogoBuilder[] = [
  ({ initials, primaryColor }) => {
    const chars = initials.split('')
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><text x="100" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="72" font-weight="700" fill="${primaryColor}" font-style="italic">${chars[0] ?? ''}</text><text x="100" y="150" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="400" fill="${primaryColor}" font-style="italic" opacity="0.6">${chars[1] ?? ''}</text></svg>`
  },
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><text x="60" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="80" font-weight="900" fill="${primaryColor}">${initials[0] ?? ''}</text><text x="140" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="80" font-weight="900" fill="${primaryColor}" opacity="0.25">${initials[1] ?? initials[0]}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><text x="100" y="105" text-anchor="middle" font-family="Inter,sans-serif" font-size="90" font-weight="900" fill="${primaryColor}" opacity="0.1">${initials}</text><text x="100" y="102" text-anchor="middle" font-family="Inter,sans-serif" font-size="86" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><text x="100" y="130" text-anchor="middle" font-family="Georgia,serif" font-size="110" font-weight="400" fill="${primaryColor}">${initials[0] ?? ''}</text><text x="120" y="140" font-family="Georgia,serif" font-size="50" font-weight="400" fill="${primaryColor}" opacity="0.5">${initials[1] ?? ''}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="none" stroke="${primaryColor}" stroke-width="3" opacity="0.2"/><text x="100" y="115" text-anchor="middle" font-family="Inter,sans-serif" font-size="80" font-weight="900" fill="${primaryColor}">${initials}</text></svg>`,
  ({ initials, primaryColor }) =>
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><text x="100" y="100" text-anchor="middle" font-family="Georgia,serif" font-size="80" font-weight="700" fill="${primaryColor}" font-style="italic">${initials[0] ?? ''}</text><text x="102" y="160" text-anchor="middle" font-family="Inter,sans-serif" font-size="28" font-weight="300" letter-spacing="12" fill="${primaryColor}" opacity="0.7">${initials[1] ?? ''}</text></svg>`,
]

const BUILDERS: Record<string, LogoBuilder[]> = {
  wordmark: wordmarkBuilders,
  lettermark: lettermarkBuilders,
  abstract: abstractBuilders,
  combination: combinationBuilders,
  emblem: emblemBuilders,
  monogram: monogramBuilders,
}

export function buildLogoSvg(
  logoStyleId: string,
  params: LogoParams,
  variantIndex: number,
): string {
  const builders = BUILDERS[logoStyleId] ?? lettermarkBuilders
  const builder = builders[variantIndex % builders.length]
  return builder(params)
}
