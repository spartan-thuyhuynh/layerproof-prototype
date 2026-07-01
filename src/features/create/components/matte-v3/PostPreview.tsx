export function PostPreview() {
  return (
    <div className="mv3-post-preview">
      <div className="mv3-post-bg-gradient" />
      <div className="mv3-post-grid" />
      <div className="mv3-post-content">
        <div className="mv3-post-eyebrow">Intellectual Property</div>
        <h2 className="mv3-post-headline">Safeguarding Your Innovation on Apple Platforms</h2>
        <p className="mv3-post-subhead">Mastering IP strategy for developers and designers who build for the future.</p>
        <div className="mv3-post-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" fill="#22c55e"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="white"/>
          </svg>
        </div>
        <button className="mv3-post-cta">Explore IP Best Practices</button>
      </div>
    </div>
  )
}
