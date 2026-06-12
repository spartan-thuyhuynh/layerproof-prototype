import { useState } from 'react'
import { Plus } from '@/icons'
import type { BrandKit, BrandTheme } from '@/types/brand'
import { SecHead, Banner } from './shared'
import { ThemeDetailModal } from '@/components/modals/ThemeDetailModal'
import { useBrandStore } from '@/store/useBrandStore'
import { useUIStore } from '@/store/useUIStore'

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg,#ec4899,#ffde42)',
  'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  'linear-gradient(135deg,#14b8a6,#3b82f6)',
  'linear-gradient(135deg,#f97316,#ec4899)',
  'linear-gradient(135deg,#22c55e,#14b8a6)',
]

const ANGLES = [135, 150, 120, 160, 145]

/** Build gradient variants from the kit's palette colors */
function buildBrandGradients(kit: BrandKit): string[] {
  const colors = kit.colors.palettes.flatMap((p) => p.colors).map((c) => c.hex).filter(Boolean)
  if (colors.length < 2) return FALLBACK_GRADIENTS
  // Build pairs: rotate through available colors with different angles
  const pairs: [string, string][] = []
  for (let i = 0; i < Math.max(colors.length, 5); i++) {
    const a = colors[i % colors.length]
    const b = colors[(i + 1) % colors.length]
    pairs.push([a, b])
  }
  return pairs.map(([a, b], i) => `linear-gradient(${ANGLES[i % ANGLES.length]}deg,${a},${b})`)
}

function gradientForTheme(id: string, gradients: string[]) {
  const idx = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length
  return gradients[idx]
}

interface ThemesProps {
  kit: BrandKit
}

export function Themes({ kit }: ThemesProps) {
  const { deleteTheme } = useBrandStore()
  const { setModal } = useUIStore()
  const [selectedTheme, setSelectedTheme] = useState<BrandTheme | null>(null)
  const [devToast, setDevToast] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem('themes_banner_dismissed') === '1')

  const themes = kit.themes ?? []
  const brandGradients = buildBrandGradients(kit)

  function handleCreateWithTheme() {
    setSelectedTheme(null)
    setDevToast(true)
    setTimeout(() => setDevToast(false), 3000)
  }

  return (
    <div className="fade-in themes-page">
      <SecHead
        title="Brand Themes"
        desc="Define prompt rule sets for applying this brand kit to campaigns, templates, and creative briefs."
        right={
          <button className="logos-upload-btn" onClick={() => setModal({ type: 'new-theme' })}>
            + New Theme
          </button>
        }
      />

      {!bannerDismissed && (
        <Banner
          tag="BRAND THEMES"
          title={<>Prompt rules for<br />on-brand content</>}
          description="Brand Themes are reusable prompt rule sets that tell AI how to apply your brand — colors, fonts, and voice — to a specific type of content. Create a theme for social posts, pitch decks, or email campaigns, then select it when generating to stay on-brand."
          onDismiss={() => { localStorage.setItem('themes_banner_dismissed', '1'); setBannerDismissed(true) }}
          style={{ margin: '0 0 24px' }}
        />
      )}

      {themes.length === 0 ? (
        <div
          onClick={() => setModal({ type: 'new-theme' })}
          style={{
            border: '1.5px dashed var(--line-2)',
            borderRadius: 'var(--radius)',
            padding: '48px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            color: 'var(--t3)',
            transition: 'border-color .15s, color .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-2)'
            e.currentTarget.style.color = 'var(--t2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-2)'
            e.currentTarget.style.color = 'var(--t3)'
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px dashed var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus style={{ width: 18, height: 18 }} />
          </div>
          <div style={{ fontSize: 14 }}>Create your first theme</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Style guides for campaigns, social posts, decks, and more</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              gradients={brandGradients}
              onClick={() => setSelectedTheme(theme)}
              onDelete={() => deleteTheme(kit.id, theme.id)}
            />
          ))}
          {/* "Add" card */}
          <button
            onClick={() => setModal({ type: 'new-theme' })}
            style={{
              border: '1.5px dashed var(--line-2)',
              borderRadius: 'var(--radius)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: 'var(--t3)',
              minHeight: 200,
              transition: 'border-color .15s, color .15s',
            }}
          >
            <Plus style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 13 }}>New theme</span>
          </button>
        </div>
      )}

      {selectedTheme && (
        <ThemeDetailModal
          theme={selectedTheme}
          kit={kit}
          kitId={kit.id}
          onClose={() => setSelectedTheme(null)}
          onCreateWithTheme={handleCreateWithTheme}
        />
      )}

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

interface ThemeCardProps {
  theme: BrandTheme
  gradients: string[]
  onClick: () => void
  onDelete: () => void
}

function ThemeCard({ theme, gradients, onClick, onDelete }: ThemeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="card hover"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
    >
      {/* Thumbnail */}
      <div
        onClick={onClick}
        style={{ height: 160, position: 'relative', overflow: 'hidden' }}
      >
        {theme.thumbnailSrc ? (
          <img
            src={theme.thumbnailSrc}
            alt={theme.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: gradientForTheme(theme.id, gradients) }} />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onClick} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{theme.name}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{theme.rules.length} guideline{theme.rules.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Kebab menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: '4px 6px', borderRadius: 6 }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <circle cx="10" cy="4.5" r="1.4" />
              <circle cx="10" cy="10" r="1.4" />
              <circle cx="10" cy="15.5" r="1.4" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setMenuOpen(false)}
              />
              <div style={{ position: 'absolute', right: 0, bottom: '100%', marginBottom: 4, background: 'var(--card-2)', border: '1px solid var(--line-2)', borderRadius: 10, minWidth: 130, zIndex: 100, padding: '4px 0', boxShadow: 'var(--shadow)' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick() }}
                  style={{ width: '100%', background: 'none', border: 'none', color: 'var(--t1)', cursor: 'pointer', padding: '9px 14px', textAlign: 'left', fontSize: 13 }}
                >
                  View details
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete() }}
                  style={{ width: '100%', background: 'none', border: 'none', color: 'var(--c-red)', cursor: 'pointer', padding: '9px 14px', textAlign: 'left', fontSize: 13 }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
