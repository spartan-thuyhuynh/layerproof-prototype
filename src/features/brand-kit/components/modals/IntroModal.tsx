import { X, Layers, Palette, Type } from '@/shared/icons'
import { Portal } from '@/shared/lib/Portal'

interface IntroModalProps {
  onClose: () => void
}

export function IntroModal({ onClose }: IntroModalProps) {
  return (
    <Portal>
    <div className="scrim" onClick={onClose} style={{ alignItems: 'center' }}>
      <div className="intro-modal" onClick={(e) => e.stopPropagation()}>
        {/* Left illustrated panel */}
        <div className="intro-left">
          <div className="intro-card">
            <div className="intro-card-inner">
              <div className="intro-sparkle">✦</div>
              <div className="intro-aa">Aa</div>
              <div className="intro-swatches">
                <div style={{ background: '#111' }} />
                <div style={{ background: '#ec4899' }} />
                <div style={{ background: '#ffde42' }} />
                <div style={{ background: '#fff' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="intro-right">
          <button className="x intro-x" onClick={onClose}><X style={{ width: 16, height: 16 }} /></button>
          <div className="intro-eyebrow">Introducing</div>
          <h2 className="intro-title">Brand Kit ✨</h2>
          <p className="intro-desc">
            Manage your brand visual direction effortlessly by uploading and configuring your branding assets in one centralized hub. Customize your brand identity with ease and keep everything organized.
          </p>

          <div className="intro-features">
            <div className="intro-features-label">Brand Kit allow you to manage:</div>
            <ul>
              <li><span className="intro-dot" /><span>The overall visual style of your designs</span></li>
              <li><span className="intro-dot" /><span>Consistency across all designs in a workspace</span></li>
              <li><span className="intro-dot" /><span>Brand assets and preset visuals</span></li>
            </ul>
          </div>

          <button className="btn primary intro-cta" onClick={onClose}>Got It!</button>
        </div>
      </div>
    </div>
    </Portal>
  )
}
