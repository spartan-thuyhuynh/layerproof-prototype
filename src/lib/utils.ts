import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}


export function normHex(h: string): string {
  if (!h) return '#000000'
  h = h.trim()
  if (h[0] !== '#') h = '#' + h
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h : '#000000'
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null
}

export function applyAccentVars(hex: string) {
  const rgb = hexToRgb(hex)
  document.documentElement.style.setProperty('--accent', hex)
  if (rgb) {
    document.documentElement.style.setProperty('--accent-soft', `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`)
    document.documentElement.style.setProperty('--accent-line', `rgba(${rgb.r},${rgb.g},${rgb.b},0.30)`)
  }
  document.documentElement.style.setProperty('--accent-ink', '#1a1600')
}

