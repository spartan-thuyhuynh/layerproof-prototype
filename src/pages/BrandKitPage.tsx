import { useBrandKit } from '@/features/brand-kit/hooks/useBrandKit'
import { Detail } from '@/features/brand-kit/components/Detail'
import { Home } from '@/features/brand-kit/components/Home'
import { ApplyModal } from '@/features/brand-kit/components/modals/ApplyModal'
import { IntroModal } from '@/features/brand-kit/components/modals/IntroModal'
import { NewKitModal } from '@/features/brand-kit/components/modals/NewKitModal'
import { NewThemeModal } from '@/features/brand-kit/components/modals/NewThemeModal'
import { BrandIdentityWizard } from '@/features/brand-kit/components/modals/BrandIdentityWizard'
import { Sidebar } from '@/shared/components/layout/Sidebar'
export function BrandKitPage() {
  const {
    kits,
    appliedId,
    setAppliedId,
    modal,
    setModal,
    closeModal,
    focusedKit,
    showIntro,
    dismissIntro,
  } = useBrandKit()

  return (
    <>
      <div className="app">
        <Sidebar showBack />
        <main className="main">
          {focusedKit
            ? <Detail key={focusedKit.id} kit={focusedKit} />
            : <Home />
          }
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

      {modal?.type === 'new-theme' && focusedKit && (
        <NewThemeModal kit={focusedKit} onClose={closeModal} />
      )}

      {modal?.type === 'brand-identity-wizard' && (
        <BrandIdentityWizard
          kitId={modal.kitId ?? focusedKit?.id ?? ''}
          onClose={closeModal}
          onAfterApply={(action) => {
            closeModal()
            if (action === 'new-theme') setModal({ type: 'new-theme' })
          }}
        />
      )}

    </>
  )
}
