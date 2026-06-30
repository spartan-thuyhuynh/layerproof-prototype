interface Mv3PageHeaderProps {
  activePage: number
  pageTitle: string
  pageCount: number
  onTitleChange: (t: string) => void
  onAdd: () => void
  onDelete: () => void
  onDuplicate: () => void
}

export function Mv3PageHeader({ activePage, pageTitle, pageCount, onTitleChange, onAdd, onDelete, onDuplicate }: Mv3PageHeaderProps) {
  return (
    <div className="mv3-page-header" onClick={e => e.stopPropagation()}>
      <div className="mv3-page-header-title">
        <span className="mv3-page-header-num">1:1</span>
        <span className="mv3-page-header-sep">-</span>
        <input
          className="mv3-page-header-input"
          value={pageTitle}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Add page title"
        />
      </div>
      <div className="mv3-page-header-actions">
        <button className="mv3-ph-btn" onClick={onDuplicate} data-tip="Duplicate page">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button className="mv3-ph-btn mv3-ph-btn--danger" onClick={onDelete} data-tip="Delete page" disabled={pageCount === 1}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
        <button className="mv3-ph-btn" onClick={onAdd} data-tip="Add page">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
