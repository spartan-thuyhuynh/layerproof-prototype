import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { BrandKitPage } from '@/pages/BrandKitPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { CreatePage } from '@/pages/CreatePage'
import { EditorPage } from '@/pages/EditorPage'
import { MatteV3Page } from '@/pages/MatteV3Page'
import { MotionEditorPage } from '@/pages/MotionEditorPage'
import { AllProjectsPage } from '@/pages/AllProjectsPage'
import { TrashPage } from '@/pages/TrashPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { MarketingPage } from '@/pages/MarketingPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/marketing" element={<MarketingPage />} />
      <Route path="/matte-v3" element={<MatteV3Page />} />
      <Route path="/motion-editor" element={<MotionEditorPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/all-projects" element={<AllProjectsPage />} />
      <Route path="/trash" element={<TrashPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/brand-kit" element={<BrandKitPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/create/:product" element={<CreatePage />} />
      <Route path="/editor/:product" element={<EditorPage />} />
    </Routes>
  )
}
