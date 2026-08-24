import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Locale, LandingContent } from './types'
import { en } from './content.en'
import { vi } from './content.vi'

const CONTENT: Record<Locale, LandingContent> = { en, vi }

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  content: LandingContent
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  content: en,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  return (
    <LocaleContext.Provider value={{ locale, setLocale, content: CONTENT[locale] }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
