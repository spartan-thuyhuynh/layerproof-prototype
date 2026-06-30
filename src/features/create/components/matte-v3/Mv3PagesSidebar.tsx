import { MiniPostPreview } from './MiniPostPreview'

interface Mv3PagesSidebarProps {
  pages: number[]
  activePage: number
  onSelectPage: (i: number) => void
}

export function Mv3PagesSidebar({ pages, activePage, onSelectPage }: Mv3PagesSidebarProps) {
  return (
    <aside className="mv3-sidebar">
      <div className="mv3-sidebar-header">
        <span className="mv3-sidebar-title">Pages</span>
        <span className="mv3-sidebar-count">{activePage + 1}/{pages.length}</span>
      </div>
      <div className="mv3-pages-list">
        {pages.map((_, idx) => (
          <div key={idx} className="mv3-page-thumb-group">
            <button
              className={`mv3-page-thumb-btn${idx === activePage ? ' mv3-page-thumb-btn--active' : ''}`}
              onClick={() => onSelectPage(idx)}
            >
              <div className="mv3-page-thumb-preview">
                <div className="mv3-page-thumb-inner">
                  <MiniPostPreview />
                </div>
              </div>
              <span className="mv3-page-thumb-label">Page {idx + 1}</span>
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}
