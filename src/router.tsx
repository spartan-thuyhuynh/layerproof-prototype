import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { BrandKitPage } from '@/pages/BrandKitPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/brand-kit" element={<BrandKitPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
    </Routes>
  )
}
