import { MarketingLanding } from '@/features/landing/components/MarketingLanding'
import { LocaleProvider } from '@/features/landing/i18n'

export function MarketingPage() {
  return (
    <LocaleProvider>
      <MarketingLanding />
    </LocaleProvider>
  )
}
