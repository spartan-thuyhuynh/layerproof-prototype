import { useState, useRef, useEffect } from 'react'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import type { EditorActions } from './types'
import { CategoryUploadModal } from '@/features/brand-kit/components/modals/CategoryUploadModal'
import { ColorPickerModal } from '@/features/brand-kit/components/modals/ColorPickerModal'
import { TypographyPickerModal } from '@/features/brand-kit/components/modals/TypographyPickerModal'
import { VoicePickerModal } from '@/features/brand-kit/components/modals/VoicePickerModal'
import { ProcessingToast } from '@/features/brand-kit/components/modals/ProcessingToast'

interface OnboardingOverviewProps {
  kit: BrandKit
  ed: EditorActions
  go: (section: string) => void
}

/* ── section tiles config ──────────────────────────────────────── */
// imageSrc: path relative to /public — drop the file there and it shows automatically.
// User uploads always override imageSrc. Set imageSrc to '' to show the placeholder.
const SECTION_TILES = [
  {
    id: 'logos',
    label: 'Logo',
    imageSrc: `${import.meta.env.BASE_URL}onboarding/logo.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    desc: 'Logo variants and usage rules',
  },
  {
    id: 'colors',
    label: 'Colors',
    imageSrc: `${import.meta.env.BASE_URL}onboarding/colors.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="10.5" r="2.5" />
        <circle cx="8.5" cy="7.5" r="2.5" />
        <circle cx="6.5" cy="12.5" r="2.5" />
        <path d="M12 20.5a8.5 8.5 0 0 1 0-17" />
      </svg>
    ),
    desc: 'Brand palettes and swatches',
  },
  {
    id: 'typography',
    label: 'Typography',
    imageSrc: `${import.meta.env.BASE_URL}onboarding/typography.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    desc: 'Heading and body typefaces',
  },
  {
    id: 'tone',
    label: 'Voices',
    imageSrc: `${import.meta.env.BASE_URL}onboarding/voices.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    desc: 'Tone, language, and style',
  },
  {
    id: 'imagery',
    label: 'Image Assets',
    imageSrc: `${import.meta.env.BASE_URL}onboarding/imagery.png`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    desc: 'Visual assets and style rules',
  },
]

/* ── icons ─────────────────────────────────────────────────────── */
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function UploadIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" style={{ width: 12, height: 12 }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/* ── illustration placeholder (right of import card) ───────────── */
// Drop /public/onboarding/illustration.png — it shows automatically.
// The placeholder text is hidden once the image loads.
function IllustrationSlot() {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <div className="ob-illus-slot">
      {!errored && (
        <img
          src={`${import.meta.env.BASE_URL}onboarding/illustration.png`}
          className="ob-illus-img"
          alt="illustration"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity .2s' }}
        />
      )}
      {(!loaded || errored) && (
        <div className="ob-illus-placeholder">
          <ImageIcon />
          <span>illustration.png</span>
        </div>
      )}
    </div>
  )
}

/* ── tile ────────────────────────────────────────────────────────── */
interface TileProps {
  label: string
  icon: React.ReactNode
  defaultImage: string
  onClick: () => void
}

function Tile({ label, icon, defaultImage, onClick }: TileProps) {
  return (
    <div className="ob-tile" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="ob-tile-square">
        <div className="ob-tile-dropzone">
          {defaultImage
            ? <img src={defaultImage} className="ob-tile-img" alt={label} />
            : <div className="ob-tile-placeholder"><ImageIcon /></div>
          }
        </div>
      </div>
      <div className="ob-tile-body">
        <div className="ob-tile-meta">
          <span className="ob-tile-icon">{icon}</span>
          <span className="ob-tile-label">{label}</span>
        </div>
      </div>
    </div>
  )
}

/* ── main ─────────────────────────────────────────────────────── */
export function OnboardingOverview({ kit, ed, go }: OnboardingOverviewProps) {
  const [url, setUrl] = useState('')
  const [activeModal, setActiveModal] = useState<string | null>(null)   // categoryId
  const [toastCategory, setToastCategory] = useState<string | null>(null)

  // Load Anton for the hero title
  useEffect(() => {
    const id = 'gf-anton'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Anton&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  function finishOnboarding(category = 'general') {
    setToastCategory(category)
  }

  function completeOnboarding() {
    ed.setVal(['onboarding'], false)
    go('overview')
    setToastCategory(null)
  }

  function handleUrlImport() {
    if (!url.trim()) return
    finishOnboarding('url')
  }

  return (
    <div className="fade-in ob-page">
      {/* ── hero ── */}
      <div className="ob-hero">
        <h1 className="ob-hero-title">Your Brand,<br />Organized in One Place</h1>
        <p className="ob-hero-sub">
          Build a Brand Kit to manage your assets, guidelines, and templates.<br />
          Use it for consistent branding across projects and AI outputs.
        </p>
      </div>

      {/* ── import card ── */}
      <div className="ob-import-card">
        <div className="ob-import-left">
          <div className="ob-import-title">Create your Brand Kit <span className="accent">in seconds</span></div>
          <div className="ob-import-sub">Paste your brand guideline URL or upload a PDF</div>

          <div className="ob-url-row">
            <div className="ob-url-input-wrap">
              <LinkIcon />
              <input
                className="ob-url-input"
                type="url"
                placeholder="https://your-brand-guidelines.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleUrlImport() }}
              />
              <button className="ob-url-btn" onClick={handleUrlImport} disabled={!url.trim()}>
                Import
              </button>
            </div>
          </div>

          <label className="ob-upload-btn">
            <UploadIcon />
            Upload Guideline PDF
            <input type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={() => finishOnboarding('pdf')} />
          </label>
        </div>

        <IllustrationSlot />
      </div>

      {/* ── "or" divider ── */}
      <div className="ob-or-divider">
        <div className="ob-or-line" />
        <span className="ob-or-label">or configure manually</span>
        <div className="ob-or-line" />
      </div>

      {/* ── section tiles ── */}
      <div className="ob-tiles">
        {SECTION_TILES.map(({ id, label, icon, imageSrc }) => (
          <Tile
            key={id}
            label={label}
            icon={icon}
            defaultImage={imageSrc}
            onClick={() => setActiveModal(id)}
          />
        ))}
      </div>

      {/* ── category modals ── */}
      {activeModal === 'colors' && (
        <ColorPickerModal
          kit={kit}
          ed={ed}
          onClose={() => setActiveModal(null)}
          onDone={() => { setActiveModal(null); finishOnboarding('colors') }}
        />
      )}
      {activeModal === 'typography' && (
        <TypographyPickerModal
          kit={kit}
          ed={ed}
          onClose={() => setActiveModal(null)}
          onDone={() => { setActiveModal(null); finishOnboarding('typography') }}
        />
      )}
      {activeModal === 'tone' && (
        <VoicePickerModal
          kit={kit}
          ed={ed}
          onClose={() => setActiveModal(null)}
          onDone={() => { setActiveModal(null); finishOnboarding('tone') }}
        />
      )}
      {activeModal && activeModal !== 'colors' && activeModal !== 'typography' && activeModal !== 'tone' && (
        <CategoryUploadModal
          categoryId={activeModal}
          initialImage={null}
          onClose={() => setActiveModal(null)}
          onDone={() => { setActiveModal(null); finishOnboarding(activeModal) }}
        />
      )}

      {toastCategory && (
        <ProcessingToast
          category={toastCategory}
          duration={5000}
          onDismiss={completeOnboarding}
        />
      )}
    </div>
  )
}
