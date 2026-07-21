import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { ProjectCard } from '@/shared/components/project/ProjectCard'
import { RECENT_PROJECTS } from '@/data/recent-projects'
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

const ALL_PROJECTS: RecentProject[] = [
  ...RECENT_PROJECTS,
  {
    id: '7',
    title: 'Product Launch Deck - Q3 2026',
    workspace: 'Personal Project',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jul 20, 2026',
  },
  {
    id: '8',
    title: 'Animate a large numeric counter in motion',
    workspace: 'Personal Project',
    type: 'Motion',
    typeColor: '#f5c518',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Motion',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jul 20, 2026',
  },
  {
    id: '9',
    title: 'Animate a clean, modern user count display',
    workspace: 'Personal Project',
    type: 'Motion',
    typeColor: '#f5c518',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Motion',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jul 20, 2026',
  },
  {
    id: '10',
    title: 'Motion Prompt: 1 Million Users Milestone',
    workspace: 'Personal Project',
    type: 'Motion',
    typeColor: '#f5c518',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Motion',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jul 20, 2026',
  },
  {
    id: '11',
    title: 'Motion Graphic Script IELTS Writing Task',
    workspace: 'Personal Project',
    type: 'Motion',
    typeColor: '#f5c518',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Motion',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jul 19, 2026',
  },
  {
    id: '12',
    title: 'Instagram Story - Summer Sale Campaign',
    workspace: 'Marketing Team',
    type: 'Social Post',
    typeColor: '#f97316',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Social',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jul 18, 2026',
  },
  {
    id: '13',
    title: 'Annual Report 2025 Summary',
    workspace: 'Personal Project',
    type: 'Docs',
    typeColor: '#14b8a6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Docs',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jul 15, 2026',
  },
]

const TYPE_FILTERS = ['All', 'Social Post', 'Presentation', 'Motion', 'Docs']
const SORT_OPTIONS = [
  { value: 'last-edited', label: 'Last edited' },
  { value: 'alphabetical', label: 'Alphabetical' },
]

export function AllProjectsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sort, setSort] = useState('last-edited')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    let items = ALL_PROJECTS
    if (typeFilter !== 'All') items = items.filter(p => p.type === typeFilter)
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
  }, [search, typeFilter, sort])

  const renderGrid = (items: RecentProject[]) => (
    <div className="ap-grid">
      {items.map(p => <ProjectCard key={p.id} project={p} />)}
    </div>
  )

  const renderList = (items: RecentProject[]) => (
    <div className="ap-list">
      <div className="ap-list-header">
        <span>Name</span>
        <span>Type</span>
        <span>Workspace</span>
        <span>Last edited</span>
      </div>
      {items.map(p => {
        const Icon = I.Icons[p.thumbIcon]
        return (
          <div key={p.id} className={`ap-list-row${p.deleted ? ' ap-list-row--deleted' : ''}`}>
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
  )

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="panel">
          <div className="ap-inner">

            {/* Page header */}
            <div className="ap-header">
              <div className="ap-title-row">
                <I.Grid className="ap-title-icon" />
                <h1 className="ap-title">All Projects</h1>
              </div>
              <button
                className="ap-trash-btn"
                onClick={() => navigate('/trash')}
              >
                <I.Trash />
                Trash
                {DELETED_PROJECTS.length > 0 && (
                  <span className="ap-deleted-count">{DELETED_PROJECTS.length}</span>
                )}
              </button>
            </div>

            {/* Toolbar: filters + search + sort + view toggle */}
            <div className="ap-toolbar">
              <div className="ap-toolbar-left">
                <div className="ap-filter-group">
                  <select
                    className="ap-select"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    {TYPE_FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <I.ChevronDown className="ap-select-caret" />
                </div>

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

            {/* Active projects */}
            {filtered.length === 0 ? (
              <div className="ap-empty">
                <I.Search className="ap-empty-icon" />
                <p className="ap-empty-title">No projects found</p>
                <p className="ap-empty-sub">Try adjusting your search or filters</p>
              </div>
            ) : view === 'grid' ? renderGrid(filtered) : renderList(filtered)}

            <p className="ap-count">Showing 1 to {filtered.length} of {ALL_PROJECTS.length} designs</p>
          </div>
        </div>
      </main>
    </div>
  )
}
