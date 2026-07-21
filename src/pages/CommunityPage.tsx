import { useState, useMemo } from 'react'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { ProjectCard } from '@/shared/components/project/ProjectCard'
import type { RecentProject } from '@/data/recent-projects'
import * as I from '@/shared/icons'

const COMMUNITY_PROJECTS: RecentProject[] = [
  {
    id: 'c1',
    title: 'Mastering Modern Kotlin: From Basics to Coroutines',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'May 7, 2026',
  },
  {
    id: 'c2',
    title: 'Decoding the Feline Friend',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'May 7, 2026',
  },
  {
    id: 'c3',
    title: 'Differentiating Apex Predators: T-Rex, Spinosaurus & More',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'May 7, 2026',
  },
  {
    id: 'c4',
    title: 'The Enduring Mystery of The Buzzer',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'May 7, 2026',
  },
  {
    id: 'c5',
    title: 'Mastering Design Thinking Methodology',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'May 7, 2026',
  },
  {
    id: 'c6',
    title: 'Choosing React State Management Solutions',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'May 20, 2026',
  },
  {
    id: 'c7',
    title: 'The Science of Sleep: What Happens When You Rest',
    workspace: 'Community',
    type: 'Social Post',
    typeColor: '#f97316',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Social',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Jun 3, 2026',
  },
  {
    id: 'c8',
    title: 'Understanding Blockchain Beyond Crypto',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Jun 10, 2026',
  },
  {
    id: 'c9',
    title: 'Climate Change: A Visual Story',
    workspace: 'Community',
    type: 'Social Post',
    typeColor: '#f97316',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Social',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Jun 15, 2026',
  },
  {
    id: 'c10',
    title: 'Introduction to Machine Learning for Beginners',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Jun 18, 2026',
  },
  {
    id: 'c11',
    title: 'Remote Work Productivity: Tips from the Trenches',
    workspace: 'Community',
    type: 'Docs',
    typeColor: '#14b8a6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Docs',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Jul 1, 2026',
  },
  {
    id: 'c12',
    title: 'The Art of Minimalism in UI Design',
    workspace: 'Community',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Jul 10, 2026',
  },
]

const TYPE_FILTERS = ['All', 'Presentation', 'Social Post', 'Docs', 'Motion']
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'popular', label: 'Most popular' },
  { value: 'alphabetical', label: 'Alphabetical' },
]


export function CommunityPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sort, setSort] = useState('recent')

  const filtered = useMemo(() => {
    let items = COMMUNITY_PROJECTS

    if (typeFilter !== 'All') {
      items = items.filter(p => p.type === typeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      )
    }

    if (sort === 'alphabetical') {
      items = [...items].sort((a, b) => a.title.localeCompare(b.title))
    }

    return items
  }, [search, typeFilter, sort])

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="panel">

          {/* ── Banner ───────────────────────────────────────────── */}
          <div className="cm-banner-wrap">
          <div className="cm-banner">
            <div className="cm-banner-orb cm-banner-orb-1" />
            <div className="cm-banner-orb cm-banner-orb-2" />
            <div className="cm-banner-orb cm-banner-orb-3" />
            <div className="cm-banner-orb cm-banner-orb-4" />

            <div className="cm-banner-content">
              <h1 className="cm-banner-title">
                See what the world is creating
              </h1>
              <p className="cm-banner-desc">
                Explore designs, presentations, and social posts made by creators around the globe.
              </p>

              <div className="cm-banner-search-wrap">
                <I.Search className="cm-banner-search-icon" />
                <input
                  className="cm-banner-search"
                  placeholder="Search community projects…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="ap-search-clear" onClick={() => setSearch('')}>
                    <I.X />
                  </button>
                )}
              </div>

              <div className="cm-banner-chips">
                {TYPE_FILTERS.map(f => (
                  <button
                    key={f}
                    className={`cm-chip${typeFilter === f ? ' active' : ''}`}
                    onClick={() => setTypeFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>

          {/* ── Listing ──────────────────────────────────────────── */}
          <div className="cm-inner">
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

            </div>

            {filtered.length === 0 ? (
              <div className="ap-empty">
                <I.Search className="ap-empty-icon" />
                <p className="ap-empty-title">No projects found</p>
                <p className="ap-empty-sub">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="ap-grid">
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}

            <p className="ap-count">Showing {filtered.length} of {COMMUNITY_PROJECTS.length} community projects</p>
          </div>

        </div>
      </main>
    </div>
  )
}
