import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { BrandKitPage } from '@/pages/BrandKitPage'
import { OnboardingPage } from '@/pages/OnboardingPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/brand-kit" element={<BrandKitPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
    </Routes>
  )
}
