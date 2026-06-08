import { useState, useEffect, useRef } from 'react'
import type { BrandKit, Category } from '@/types/brand'
import { SubSidebar } from '@/components/layout/SubSidebar'
import { Overview } from '@/components/sections/Overview'
import { Colors } from '@/components/sections/Colors'
import { Typography } from '@/components/sections/Typography'
import { Logos } from '@/components/sections/Logos'
import { Imagery } from '@/components/sections/Imagery'
import { Tone } from '@/components/sections/Tone'
import { Layout } from '@/components/sections/Layout'
import { AddCategoryModal } from '@/components/modals/AddCategoryModal'
import { GuidelineModal } from '@/components/modals/GuidelineModal'
import { useBrandStore } from '@/store/useBrandStore'
import { useUIStore } from '@/store/useUIStore'
import { deepClone } from '@/lib/utils'
import type { EditorActions, PathSegment } from '@/components/sections/types'
import { Wand, Zap, Pencil, Trash } from '@/icons'

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
  const [section, setSection] = useState('overview')
  const [showAddCat, setShowAddCat] = useState(false)
  const [showDoc, setShowDoc] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  const prevOnboarding = useRef(kit.onboarding)

  // Kit-menu (three-dot) state
  const [menuOpen, setMenuOpen]       = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [nameDraft, setNameDraft]     = useState(kit.name)
  const [descDraft, setDescDraft]     = useState(kit.tagline)
  const menuRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLInputElement>(null)

  // Sync drafts when kit switches
  useEffect(() => { setNameDraft(kit.name) },    [kit.name])
  useEffect(() => { setDescDraft(kit.tagline) }, [kit.tagline])

  // Close menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
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
          <button
            className="btn primary sm"
            onClick={() => setAppliedId(isApplied ? '' : kit.id)}
          >
            {isApplied ? 'Applied ✓' : 'Use in a design'}
          </button>

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

    </div>
  )
}
