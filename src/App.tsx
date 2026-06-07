import { useState } from 'react'
import { useBrandStore } from '@/store/useBrandStore'
import { useUIStore } from '@/store/useUIStore'
import { useTweaks } from '@/hooks/useTweaks'
import { Sidebar } from '@/components/layout/Sidebar'
import { Detail } from '@/components/kit/Detail'
import { ApplyModal } from '@/components/modals/ApplyModal'
import { NewKitModal } from '@/components/modals/NewKitModal'
import { IntroModal } from '@/components/modals/IntroModal'
import { TweaksPanel } from '@/components/tweaks/TweaksPanel'

const INTRO_KEY = 'bk_intro_seen'

export default function App() {
  const { kits, appliedId, setAppliedId } = useBrandStore()
  const { modal, tweaks, setModal } = useUIStore()
  const focusedId = useUIStore((s) => s.focusedId)
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_KEY))

  useTweaks(tweaks)

  const focusedKit = kits.find((k) => k.id === focusedId) ?? kits[0]

  function dismissIntro() {
    localStorage.setItem(INTRO_KEY, '1')
    setShowIntro(false)
  }

  return (
    <>
      <div className="app">
        <Sidebar />
        <main className="main">
          <Detail kit={focusedKit} />
        </main>
      </div>

      {showIntro && <IntroModal onClose={dismissIntro} />}

      {modal?.type === 'apply' && (
        <ApplyModal
          kits={kits}
          current={appliedId}
          onClose={() => setModal(null)}
          onConfirm={(id) => { setAppliedId(id); setModal(null) }}
        />
      )}

      {modal?.type === 'new' && (
        <NewKitModal onClose={() => setModal(null)} />
      )}

      <TweaksPanel />
    </>
  )
}
