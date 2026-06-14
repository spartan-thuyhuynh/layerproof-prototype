import { useBrandKit } from '@/features/brand-kit/hooks/useBrandKit'
import { Detail } from '@/features/brand-kit/components/Detail'
import { ApplyModal } from '@/features/brand-kit/components/modals/ApplyModal'
import { IntroModal } from '@/features/brand-kit/components/modals/IntroModal'
import { NewKitModal } from '@/features/brand-kit/components/modals/NewKitModal'
import { NewThemeModal } from '@/features/brand-kit/components/modals/NewThemeModal'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { TweaksPanel } from '@/shared/components/tweaks/TweaksPanel'
import { useTweaks } from '@/shared/hooks/useTweaks'

export function BrandKitPage() {
  const {
    kits,
    appliedId,
    setAppliedId,
    modal,
    tweaks,
    setModal,
    closeModal,
    focusedKit,
    showIntro,
    dismissIntro,
  } = useBrandKit()

  useTweaks(tweaks)

  return (
    <>
      <div className="app">
        <Sidebar showBack />
        <main className="main">
          <Detail key={focusedKit.id} kit={focusedKit} />
        </main>
      </div>

      {showIntro && <IntroModal onClose={dismissIntro} />}

      {modal?.type === 'apply' && (
        <ApplyModal
          kits={kits}
          current={appliedId}
          onClose={closeModal}
          onConfirm={(id) => { setAppliedId(id); closeModal() }}
        />
      )}

      {modal?.type === 'new' && (
        <NewKitModal onClose={closeModal} />
      )}

      {modal?.type === 'new-theme' && (
        <NewThemeModal kit={focusedKit} onClose={closeModal} />
      )}

      <TweaksPanel />
    </>
  )
}
