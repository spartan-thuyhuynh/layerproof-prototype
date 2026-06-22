import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BrandKit, Category } from '@/features/brand-kit/types/brand'
import { SubSidebar } from '@/shared/components/layout/SubSidebar'
import { Overview } from '@/features/brand-kit/components/sections/Overview'
import { Colors } from '@/features/brand-kit/components/sections/Colors'
import { Typography } from '@/features/brand-kit/components/sections/Typography'
import { Logos } from '@/features/brand-kit/components/sections/Logos'
import { Imagery } from '@/features/brand-kit/components/sections/Imagery'
import { Tone } from '@/features/brand-kit/components/sections/Tone'
import { Layout } from '@/features/brand-kit/components/sections/Layout'
import { Themes } from '@/features/brand-kit/components/sections/Themes'
import { AddCategoryModal } from '@/features/brand-kit/components/modals/AddCategoryModal'
import { GuidelineModal } from '@/features/brand-kit/components/modals/GuidelineModal'
import { useBrandStore } from '@/features/brand-kit/store/useBrandStore'
import { useUIStore } from '@/shared/store/useUIStore'
import { deepClone } from '@/shared/lib/utils'
import type { EditorActions, PathSegment } from '@/features/brand-kit/components/sections/types'
import { Wand, Zap, Pencil, Trash } from '@/shared/icons'

const BUILT_IN_CATEGORIES: Category[] = [
  { id: 'logos', label: 'Logos', icon: 'Star', hidden: false },
  { id: 'colors', label: 'Colors', icon: 'Palette', hidden: false },
  { id: 'typography', label: 'Typography', icon: 'Type', hidden: false },
  { id: 'imagery', label: 'Image Assets', icon: 'Globe', hidden: false },
  { id: 'tone', label: 'Brand Voice', icon: 'Mic', hidden: false },
]

function getByPath(obj: unknown, path: PathSegment[]): unknown {
  return path.reduce((acc: unknown, key) => {
    if (acc == null) return undefined
    return (acc as Record<string | number, unknown>)[key]
  }, obj)
}

function setByPath(obj: unknown, path: PathSegment[], value: unknown): unknown {
  if (path.length === 0) return value
  const clone = Array.isArray(obj) ? [...(obj as unknown[])] : { ...(obj as object) }
  const [head, ...rest] = path
  ;(clone as Record<string | number, unknown>)[head] = setByPath(
    (clone as Record<string | number, unknown>)[head],
    rest,
    value,
  )
  return clone
}

interface DetailProps {
  kit: BrandKit
}

export function Detail({ kit }: DetailProps) {
  const { updateKit, appliedId, setAppliedId } = useBrandStore()
  const { setModal } = useUIStore()
  const navigate = useNavigate()
  const [section, setSection] = useState('overview')
  const [showAddCat, setShowAddCat] = useState(false)
  const [showDoc, setShowDoc] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  const prevOnboarding = useRef(kit.onboarding)

  // Kit-menu (three-dot) state
  const [menuOpen, setMenuOpen]             = useState(false)
  const [designMenuOpen, setDesignMenuOpen] = useState(false)
  const [devToast, setDevToast]             = useState(false)
  const [editingName, setEditingName]   = useState(false)
  const [editingDesc, setEditingDesc]   = useState(false)
  const [nameDraft, setNameDraft]       = useState(kit.name)
  const [descDraft, setDescDraft]       = useState(kit.tagline)
  const menuRef       = useRef<HTMLDivElement>(null)
  const designMenuRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLInputElement>(null)

  // Sync drafts when kit switches
  useEffect(() => { setNameDraft(kit.name) },    [kit.name])
  useEffect(() => { setDescDraft(kit.tagline) }, [kit.tagline])

  // Close menus on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (designMenuRef.current && !designMenuRef.current.contains(e.target as Node)) setDesignMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Auto-focus inline inputs
  useEffect(() => { if (editingName) nameRef.current?.select() }, [editingName])
  useEffect(() => { if (editingDesc) descRef.current?.select() }, [editingDesc])

  // Detect onboarding completion → show welcome banner on overview
  useEffect(() => {
    if (prevOnboarding.current && !kit.onboarding) {
      setSection('overview')
      setShowWelcomeBanner(true)
    }
    prevOnboarding.current = kit.onboarding
  }, [kit.onboarding])

  function commitName() {
    const v = nameDraft.trim()
    if (v) updateKit(kit.id, (k) => ({ ...k, name: v }))
    else setNameDraft(kit.name)
    setEditingName(false)
  }
  function commitDesc() {
    updateKit(kit.id, (k) => ({ ...k, tagline: descDraft }))
    setEditingDesc(false)
  }
  function handleDelete() {
    setMenuOpen(false)
    const { kits, deleteKit } = useBrandStore.getState()
    const remaining = kits.filter((k) => k.id !== kit.id)
    deleteKit(kit.id)
    if (remaining.length > 0) useUIStore.getState().focusKit(remaining[0].id)
  }

  // If the user navigates away from an onboarding kit without completing it,
  // discard it so it isn't saved as a blank "Untitled" entry.
  // Guard: only delete when focus has actually moved elsewhere, so React
  // StrictMode's simulated unmount/remount cycle doesn't delete the new kit.
  useEffect(() => {
    const kitId = kit.id
    return () => {
      const { focusedId } = useUIStore.getState()
      if (focusedId === kitId) return          // StrictMode re-mount or still here
      const current = useBrandStore.getState().kits.find((k) => k.id === kitId)
      if (current?.onboarding) {
        useBrandStore.getState().deleteKit(kitId)
      }
    }
  }, [kit.id])

  const ed: EditorActions = {
    toggle(path) {
      updateKit(kit.id, (k) => {
        const next = deepClone(k)
        const cur = getByPath(next, path)
        return setByPath(next, path, !cur) as BrandKit
      })
    },
    setVal(path, value) {
      updateKit(kit.id, (k) => setByPath(deepClone(k), path, value) as BrandKit)
    },
    addItem(path, item) {
      updateKit(kit.id, (k) => {
        const next = deepClone(k)
        const arr = getByPath(next, path) as unknown[]
        return setByPath(next, path, [...arr, item]) as BrandKit
      })
    },
    removeItem(path, index) {
      updateKit(kit.id, (k) => {
        const next = deepClone(k)
        const arr = [...(getByPath(next, path) as unknown[])]
        arr.splice(index, 1)
        return setByPath(next, path, arr) as BrandKit
      })
    },
  }

  function handleAddCategory(label: string, icon: string) {
    const id = `cat-${Date.now()}`
    const newCat: Category = { id, label, icon, custom: true, rules: [], hidden: false }
    updateKit(kit.id, (k) => ({ ...k, categories: [...(k.categories || []), newCat] }))
    setSection(id)
  }

  function handleDeleteCategory(id: string) {
    updateKit(kit.id, (k) => ({ ...k, categories: k.categories.filter((c: Category) => c.id !== id) }))
    if (section === id) setSection('overview')
  }

  function handleReorderCategory(id: string, dir: -1 | 1) {
    updateKit(kit.id, (k) => {
      const cats = [...k.categories]
      const idx = cats.findIndex((c: Category) => c.id === id)
      if (idx < 0) return k
      const target = idx + dir
      if (target < 0 || target >= cats.length) return k
      ;[cats[idx], cats[target]] = [cats[target], cats[idx]]
      return { ...k, categories: cats }
    })
  }

  function handleToggleCategoryHidden(id: string) {
    updateKit(kit.id, (k) => ({
      ...k,
      categories: k.categories.map((c: Category) => c.id === id ? { ...c, hidden: !c.hidden } : c),
    }))
  }

  const isApplied = appliedId === kit.id

  function renderBody() {
    switch (section) {
      case 'overview': return <Overview kit={kit} go={setSection} onNew={() => setModal({ type: 'new' })} ed={ed} showWelcomeBanner={showWelcomeBanner} onDismissBanner={() => setShowWelcomeBanner(false)} />
      case 'colors': return <Colors kit={kit} ed={ed} />
      case 'typography': return <Typography kit={kit} ed={ed} />
      case 'logos': return <Logos kit={kit} ed={ed} />
      case 'imagery': return <Imagery kit={kit} ed={ed} />
      case 'tone': return <Tone kit={kit} ed={ed} />
      case 'layout': return <Layout kit={kit} ed={ed} />
      case 'themes': return <Themes kit={kit} />
      default: {
        const cat = kit.categories.find((c: Category) => c.id === section)
        if (!cat) return <div className="fade-in" style={{ padding: 32, color: 'var(--t3)' }}>Section not found.</div>
        return (
          <div className="fade-in">
            <div className="sec-head">
              <div>
                <div className="h-eyebrow">{cat.label}</div>
                <h2 className="h2">{cat.label}</h2>
              </div>
            </div>
            <div className="card" style={{ padding: '6px 20px' }}>
              {(cat.rules ?? []).length === 0
                ? <div className="tiny" style={{ padding: '18px 0' }}>No rules yet. Click "Add rule" to start.</div>
                : (cat.rules ?? []).map((r, i) => (
                    <div key={i} className="rule">
                      <div className="rbody">
                        <b>{r.t}</b>
                        {r.d && <p>{r.d}</p>}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )
      }
    }
  }

  return (
    <div className="detail">
      <SubSidebar
        kit={kit}
        activeSection={section}
        onSection={setSection}
        onAddCategory={() => setShowAddCat(true)}
        onDeleteCategory={handleDeleteCategory}
        onReorderCategory={handleReorderCategory}
        onToggleCategoryHidden={handleToggleCategoryHidden}
      />

      <div className="detail-panel">
        {!kit.onboarding && <div className="detail-toolbar">
          <div className="kit-header-info">
            <div className="kit-header-logo" style={kit.symbolSrc ? { background: '#0a0a0a' } : kit.logoStyle}>
              {kit.symbolSrc
                ? <img src={kit.symbolSrc} alt={kit.name} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                : kit.logoText}
            </div>
            <div className="kit-header-text-col">
              {/* ── kit name ── */}
              {editingName ? (
                <input
                  ref={nameRef}
                  className="kit-header-name-input"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitName()
                    if (e.key === 'Escape') { setNameDraft(kit.name); setEditingName(false) }
                  }}
                />
              ) : (
                <div className="kit-header-inline-row" onClick={() => setEditingName(true)}>
                  <span className="kit-header-name">{kit.name}</span>
                  <span className="kit-header-inline-edit-btn" title="Rename">
                    <Pencil style={{ width: 11, height: 11 }} />
                  </span>
                </div>
              )}

              {/* ── description / tagline ── */}
              {editingDesc ? (
                <input
                  ref={descRef}
                  className="kit-header-sub-input"
                  value={descDraft}
                  placeholder="Add a description…"
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={commitDesc}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitDesc()
                    if (e.key === 'Escape') { setDescDraft(kit.tagline); setEditingDesc(false) }
                  }}
                />
              ) : (
                <div className="kit-header-inline-row kit-header-inline-row--sub" onClick={() => setEditingDesc(true)}>
                  <span className="kit-header-sub">
                    {kit.tagline || <span className="kit-header-sub--empty">Add a description…</span>}
                  </span>
                  <span className="kit-header-inline-edit-btn" title="Edit description">
                    <Pencil style={{ width: 10, height: 10 }} />
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="grow" />

          {/* "Use in a design" dropdown */}
          <div className="design-menu-wrap" ref={designMenuRef}>
            <button
              className="btn primary sm"
              onClick={() => setDesignMenuOpen((o) => !o)}
            >
              Use in a design
              <svg viewBox="0 0 12 12" fill="currentColor" style={{ width: 11, height: 11, marginLeft: 5, opacity: 0.8, flexShrink: 0 }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>

            {designMenuOpen && (
              <div className="design-menu">
                <div className="design-menu-label">Create new design</div>
                {(kit.themes ?? []).length === 0 ? (
                  <div className="design-menu-empty">
                    <p className="design-menu-empty-text">
                      Add a brand theme first to use this kit in a design.
                    </p>
                    <button
                      className="design-menu-empty-cta"
                      onClick={() => {
                        setDesignMenuOpen(false)
                        setModal({ type: 'new-theme' })
                      }}
                    >
                      Create a theme
                    </button>
                  </div>
                ) : (
                  [
                    {
                      id: 'presentation',
                      label: 'Presentation',
                      slug: 'presentation',
                      icon: (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                          <rect x="2" y="3" width="16" height="11" rx="1.5" />
                          <path d="M7 17h6M10 14v3" />
                        </svg>
                      ),
                    },
                    {
                      id: 'social',
                      label: 'Social Post',
                      slug: 'social-post',
                      icon: (
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                          <rect x="3" y="3" width="14" height="14" rx="2" />
                          <circle cx="7.5" cy="7.5" r="1.5" />
                          <path d="M3 13l4-4 3 3 2-2 5 5" />
                        </svg>
                      ),
                    },
                  ].map(({ id, label, slug, icon }) => (
                    <button
                      key={id}
                      className="design-menu-item"
                      onClick={() => {
                        setDesignMenuOpen(false)
                        setAppliedId(kit.id)
                        navigate(`/create/${slug}`)
                      }}
                    >
                      <span className="design-menu-item-icon">{icon}</span>
                      <span className="design-menu-item-label">{label}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* three-dot menu */}
          <div className="kit-more-wrap" ref={menuRef}>
            <button
              className="kit-header-more"
              onClick={() => setMenuOpen((o) => !o)}
              title="Kit options"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <circle cx="10" cy="4" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="10" cy="16" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div className="kit-more-menu">
                <button className="kit-more-item danger" onClick={handleDelete}>
                  <Trash style={{ width: 13, height: 13 }} />
                  Delete kit
                </button>
              </div>
            )}
          </div>
        </div>}

        <div className="detail-body">
          {renderBody()}
        </div>
      </div>

      {showAddCat && (
        <AddCategoryModal
          onClose={() => setShowAddCat(false)}
          onAdd={handleAddCategory}
        />
      )}
      {showDoc && (
        <GuidelineModal kit={kit} onClose={() => setShowDoc(false)} />
      )}

      {/* "In development" nudge toast */}
      {devToast && (
        <div className="dev-toast">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, color: 'var(--accent)' }}>
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3M8 11h.01" />
          </svg>
          This feature is in development
        </div>
      )}
    </div>
  )
}
