export interface ColorSwatch {
  name: string
  hex: string
  role: string
}

export interface ColorPalette {
  id: string
  name: string
  desc: string
  colors: ColorSwatch[]
}

export interface ColorGroup {
  palettes: ColorPalette[]
}

export interface Rule {
  t: string
  d: string
}

export interface TypeStyle {
  family: string
  weight: string
  note: string
}

export interface TypeScaleEntry {
  lbl: string
  sz: number
  w: number
  txt: string
}

export interface TypeData {
  display: TypeStyle
  body: TypeStyle
  scale: TypeScaleEntry[]
  rules: Rule[]
}

export interface LogoVariant {
  name: string
  bg: string
  note: string
  src?: string
  size?: string
}

export interface LogoData {
  clearColor: string
  minSize: string
  variants: LogoVariant[]
  donts: string[]
}

export interface ImageryTag {
  t: string
  c: string
}

export interface ImageAsset {
  name: string
  size: string
  preview?: string   // optional gradient / colour for placeholder
}

export interface ImageryData {
  desc: string
  styleDesc?: string
  tags: ImageryTag[]
  dos: string[]
  donts: string[]
  assets?: ImageAsset[]
}

export interface ToneAttr {
  t: string
  vs: string
  v: number
  d: string
}

export interface ToneData {
  attrs: ToneAttr[]
  use: string[]
  avoid: string[]
  off: string
  on: string
  language?: string
  textDensity?: 'minimal' | 'concise' | 'detailed'
  customInstruction?: string
}

export interface RadiusStep {
  v: number
  l: string
}

export interface LayoutData {
  grid: string
  spacing: number[]
  radius: RadiusStep[]
  rules: Rule[]
}

export interface LogoStyle {
  background: string
  color: string
  border?: string
  [key: `--radix-${string}`]: string | undefined
}

export interface ThemeRule {
  id: string
  label: string
  content: string
}

export interface BrandTheme {
  id: string
  name: string
  description: string
  thumbnailSrc?: string
  rules: ThemeRule[]
  prompt?: string
  createdAt: string
}

export interface BrandKit {
  id: string
  name: string
  tagline: string
  sample?: boolean
  onboarding?: boolean
  color: string
  logoText: string
  logoStyle: LogoStyle
  symbolSrc?: string
  swatches: string[]
  updated: string
  assets: number
  colors: ColorGroup
  type: TypeData
  logos: LogoData
  imagery: ImageryData
  tone: ToneData
  layout: LayoutData
  categories: Category[]
  themes: BrandTheme[]
}

export interface Category {
  id: string
  label: string
  icon: string
  fixed?: boolean
  hidden: boolean
  custom?: boolean
  rules?: Rule[]
}

export type ModalType = 'apply' | 'new' | 'doc' | 'new-theme'

export interface ModalState {
  type: ModalType
  kitId?: string
}

export type Density = 'compact' | 'default' | 'comfy'

export interface TweakState {
  accent: string
  density: Density
}

export type PathSegment = string | number
