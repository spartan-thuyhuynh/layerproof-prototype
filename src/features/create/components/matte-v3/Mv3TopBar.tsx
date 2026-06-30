interface Mv3TopBarProps {
  pages: number[]
  agentOpen: boolean
  onAgentToggle: () => void
  onNavigateHome: () => void
}

export function Mv3TopBar({ pages, agentOpen, onAgentToggle, onNavigateHome }: Mv3TopBarProps) {
  return (
    <header className="mv3-topbar">
      <div className="mv3-topbar-left">
        <button className="mv3-icon-btn" onClick={onNavigateHome} title="Home">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
            <path d="M9 21V12h6v9"/>
          </svg>
        </button>
        <div className="mv3-divider-v" />
        <div className="mv3-breadcrumb">
          <span className="mv3-campaign-title">Social Campaign – Present intellectual property</span>
          <span className="mv3-campaign-sub">1 post · {pages.length} pages</span>
        </div>
      </div>
      <div className="mv3-topbar-right">
        <button className="mv3-ghost-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
            <path d="M12 20v-4M12 20a4 4 0 0 1-4-4M12 20a4 4 0 0 0 4-4"/>
          </svg>
          Look &amp; Feel
        </button>
        <div className="mv3-divider-v" />
        <button className="mv3-sub-pill-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/>
          </svg>
          Outline
        </button>
        <button className={`mv3-sub-pill-btn${agentOpen ? ' mv3-sub-pill-btn--active' : ''}`} onClick={onAgentToggle}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c-1.2 5.4-5 7-9 7 0 5.4 3.3 9.8 9 11 5.7-1.2 9-5.6 9-11-4 0-7.8-1.6-9-7z"/>
          </svg>
          Agent
        </button>
        <button className="mv3-sub-share-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>
        <div className="mv3-divider-v" />
        <div className="mv3-plan-pill">Plan: <strong>Unlimited</strong></div>
        <div className="mv3-avatar">T</div>
      </div>
    </header>
  )
}
