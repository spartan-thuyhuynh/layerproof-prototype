export function Step3_DeviceGate() {

  return (
    <div className="onb-device-gate">
      <div className="onb-dg-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2"/>
          <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>
      </div>

      <h2 className="onb-dg-heading">Finish setup on desktop</h2>
      <p className="onb-dg-sub">
        LayerProof is built for desktop — the full creative experience needs a bigger screen. Copy the link below and open it on your computer to continue.
      </p>

      <div className="onb-dg-url-box">
        <span className="onb-dg-url">layerproof.com/onboarding</span>
        <button
          className="onb-dg-copy"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
        >
          Copy link
        </button>
      </div>

      <p className="onb-dg-hint">Already have an account? Log in on your desktop to pick up right where you left off.</p>
    </div>
  )
}
