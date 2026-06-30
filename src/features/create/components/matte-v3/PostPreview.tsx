export function PostPreview() {
  return (
    <div className="mv3-post-preview">
      <div className="mv3-post-bg-pattern">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="mv3-pattern-block" />
        ))}
      </div>
      <div className="mv3-post-content">
        <h2 className="mv3-post-headline">Safeguarding Your Innovation on Apple Platforms</h2>
        <p className="mv3-post-subhead">Mastering Intellectual Property Strategy for Developers and Designers</p>
        <div className="mv3-post-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#22c55e" stroke="none">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="white"/>
          </svg>
        </div>
        <button className="mv3-post-cta">Explore IP Best Practices</button>
      </div>
    </div>
  )
}
