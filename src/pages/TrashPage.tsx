import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { ProjectCard } from '@/shared/components/project/ProjectCard'
import type { RecentProject } from '@/data/recent-projects'
import * as I from '@/shared/icons'

const DELETED_PROJECTS: RecentProject[] = [
  {
    id: 'd1',
    title: 'Old Brand Refresh Deck',
    workspace: 'Marketing Team',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Deleted on Jul 10, 2026',
    deleted: true,
  },
  {
    id: 'd2',
    title: 'Summer Newsletter Draft',
    workspace: 'Personal Project',
    type: 'Docs',
    typeColor: '#14b8a6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Docs',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Deleted on Jul 5, 2026',
    deleted: true,
  },
  {
    id: 'd3',
    title: 'Instagram Promo - Flash Sale',
    workspace: 'Marketing Team',
    type: 'Social Post',
    typeColor: '#f97316',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Social',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Deleted on Jun 28, 2026',
    deleted: true,
  },
]

const SORT_OPTIONS = [
  { value: 'last-edited', label: 'Last deleted' },
  { value: 'alphabetical', label: 'Alphabetical' },
]

export function TrashPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('last-edited')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    let items = DELETED_PROJECTS
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.workspace.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      )
    }
    if (sort === 'alphabetical') items = [...items].sort((a, b) => a.title.localeCompare(b.title))
    return items
  }, [search, sort])

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="panel">
          <div className="ap-inner">

            {/* Header */}
            <div className="ap-header">
              <div className="ap-title-row">
                <button className="ap-back-btn" onClick={() => navigate('/all-projects')}>
                  <I.ArrowLeft />
                  All Projects
                </button>
                <span className="ap-title-sep">/</span>
                <I.Trash className="ap-title-icon" />
                <h1 className="ap-breadcrumb-current">Trash</h1>
              </div>
            </div>

            {/* Toolbar */}
            <div className="ap-toolbar">
              <div className="ap-toolbar-left">
                <div className="ap-filter-group">
                  <select
                    className="ap-select"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <I.ChevronDown className="ap-select-caret" />
                </div>
              </div>

              <div className="ap-toolbar-right">
                <div className="ap-search-wrap">
                  <I.Search className="ap-search-icon" />
                  <input
                    className="ap-search"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="ap-search-clear" onClick={() => setSearch('')}>
                      <I.X />
                    </button>
                  )}
                </div>

                <div className="ap-view-toggle">
                  <button
                    className={`ap-view-btn${view === 'grid' ? ' active' : ''}`}
                    onClick={() => setView('grid')}
                    title="Grid view"
                  >
                    <I.Grid />
                  </button>
                  <button
                    className={`ap-view-btn${view === 'list' ? ' active' : ''}`}
                    onClick={() => setView('list')}
                    title="List view"
                  >
                    <I.List />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
              <div className="ap-empty">
                <I.Trash className="ap-empty-icon" />
                <p className="ap-empty-title">Trash is empty</p>
                <p className="ap-empty-sub">Deleted projects will appear here</p>
              </div>
            ) : view === 'grid' ? (
              <div className="ap-grid">
                {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            ) : (
              <div className="ap-list">
                <div className="ap-list-header">
                  <span>Name</span>
                  <span>Type</span>
                  <span>Workspace</span>
                  <span>Deleted</span>
                </div>
                {filtered.map(p => {
                  const Icon = I.Icons[p.thumbIcon]
                  return (
                    <div key={p.id} className="ap-list-row ap-list-row--deleted">
                      <div className="ap-list-name">
                        <div className="ap-list-thumb" style={{ background: p.thumbBg, color: p.typeColor }}>
                          {Icon && <Icon style={{ width: 16, height: 16, opacity: 0.7 }} />}
                        </div>
                        <span>{p.title}</span>
                      </div>
                      <span className="ap-list-type" style={{ color: p.typeColor }}>{p.type}</span>
                      <span className="ap-list-ws">{p.workspace}</span>
                      <span className="ap-list-date">{p.lastAction}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <p className="ap-count">{filtered.length} deleted design{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
