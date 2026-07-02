import type { BrandKit } from '@/features/brand-kit/types/brand'
import type { EditorActions } from './types'
import { ArrowRight, Plus } from '@/shared/icons'
import { OnboardingOverview } from './OnboardingOverview'
import { Banner } from './shared'
import { useUIStore } from '@/shared/store/useUIStore'

/* ── shared logo mark ─────────────────────────────────────── */
function Mark({ kit, size = 40 }: { kit: BrandKit; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22, flexShrink: 0,
      display: 'grid', placeItems: 'center',
      fontWeight: 800, fontSize: size * 0.38, letterSpacing: '-0.03em',
      ...kit.logoStyle,
    }}>
      {kit.logoText}
    </div>
  )
}

function TextLogoTile({ kit, bg, small }: { kit: BrandKit; bg: string; small?: boolean }) {
  const hex = bg.replace('#', '').padEnd(6, '0')
  const lum = parseInt(hex.slice(0, 2), 16) * 0.299 + parseInt(hex.slice(2, 4), 16) * 0.587 + parseInt(hex.slice(4, 6), 16) * 0.114
  const dark = lum < 128
  return (
    <div className="ov-thumb" style={{ background: bg, flexDirection: 'column', gap: 2, padding: '6px 8px', justifyContent: 'center' }}>
      <Mark kit={kit} size={small ? 18 : 22} />
      <span style={{ fontSize: small ? 7 : 8, fontWeight: 800, letterSpacing: '.04em', color: dark ? 'rgba(255,255,255,.65)' : 'rgba(0,0,0,.5)', whiteSpace: 'nowrap' }}>
        {kit.name.toUpperCase()}
      </span>
    </div>
  )
}

interface OverviewProps {
  kit: BrandKit
  go: (id: string) => void
  onNew: () => void
  ed?: EditorActions
  showWelcomeBanner?: boolean
  onDismissBanner?: () => void
}

/* ── card: Logos ──────────────────────────────────────────── */
function LogosCard({ kit, go }: { kit: BrandKit; go: () => void }) {
  const variants = kit.logos.variants
  const bgs = [
    (kit.logoStyle.background as string) ?? '#111',
    variants[0]?.bg ?? '#0a0a0a',
    variants[1]?.bg ?? '#f0f0f0',
    variants[2]?.bg ?? '#1b1b1b',
  ]
  return (
    <div className="ov-card" onClick={go}>
      <div className="ov-card-left">
        <div className="ov-card-title">Logos</div>
        <div className="ov-card-count">{kit.logos.variants.length} variants</div>
        <button className="ov-link">View all <ArrowRight style={{ width: 12, height: 12 }} /></button>
      </div>
      <div className="ov-thumbs">
        {[0, 1, 2].map((i) => {
          const v = variants[i]
          return v ? (
            <div key={i} className="ov-thumb" style={{ background: v.bg ?? '#0a0a0a' }}>
              {v.src && <img src={v.src} alt={v.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
            </div>
          ) : (
            <div key={i} className="ov-thumb" style={{ background: bgs[i] }} />
          )
        })}
        <div className="ov-thumb" style={{ background: '#1b1b1b' }} />
      </div>
    </div>
  )
}

/* ── card: Colors ─────────────────────────────────────────── */
function ColorsCard({ kit, go }: { kit: BrandKit; go: () => void }) {
  const swatches = kit.colors.palettes.flatMap((p) => p.colors).slice(0, 4)
  return (
    <div className="ov-card" onClick={go}>
      <div className="ov-card-left">
        <div className="ov-card-title">Colors</div>
        <div className="ov-card-count">{kit.colors.palettes.length} palette{kit.colors.palettes.length !== 1 ? 's' : ''}</div>
        <button className="ov-link">View all <ArrowRight style={{ width: 12, height: 12 }} /></button>
      </div>
      <div className="ov-thumbs">
        {swatches.map((c, i) => (
          <div key={i} className="ov-thumb" style={{ background: c.hex, border: parseInt(c.hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16) > 0xeeeeee ? '1px solid #333' : 'none' }} />
        ))}
      </div>
    </div>
  )
}

/* ── card: Typography ─────────────────────────────────────── */
function TypographyCard({ kit, go }: { kit: BrandKit; go: () => void }) {
  return (
    <div className="ov-card" onClick={go}>
      <div className="ov-card-left">
        <div className="ov-card-title">Typography</div>
        <div className="ov-card-count">2 typefaces</div>
        <button className="ov-link">View details <ArrowRight style={{ width: 12, height: 12 }} /></button>
      </div>
      <div className="ov-type-thumbs">
        <div className="ov-type-tile">
          <div className="ov-type-tile-top">
            <span className="ov-tile-role">HEADING</span>
            <span className="ov-tile-fam">{kit.type.display.family}</span>
          </div>
          <span className="ov-tile-ag" style={{ fontWeight: 800, fontSize: 38 }}>Ag</span>
        </div>
        <div className="ov-type-tile">
          <div className="ov-type-tile-top">
            <span className="ov-tile-role">BODY</span>
            <span className="ov-tile-fam">{kit.type.body.family}</span>
          </div>
          <span className="ov-tile-ag" style={{ fontWeight: 400, fontSize: 38 }}>Ag</span>
        </div>
      </div>
    </div>
  )
}

/* ── card: Brand Voices ───────────────────────────────────── */
function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function VoiceCard({ kit, go }: { kit: BrandKit; go: () => void }) {
  const first = kit.tone.attrs[0]
  const second = kit.tone.attrs[1]
  return (
    <div className="ov-card" onClick={go}>
      <div className="ov-card-left">
        <div className="ov-card-title">Brand Voices</div>
        <div className="ov-card-count">1 voice · English</div>
        <button className="ov-link">View details <ArrowRight style={{ width: 12, height: 12 }} /></button>
      </div>
      <div className="ov-voice-box">
        <div className="ov-voice-box-icon"><MicIcon /></div>
        <div className="ov-voice-box-lang">ENGLISH</div>
        <div className="ov-voice-box-name">{first?.t ?? 'Minimal'}</div>
        {second && (
          <div className="ov-voice-box-chip">
            <span className="ov-voice-chip-dot" />
            {second.t}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── card: Brand Themes ───────────────────────────────────── */
const ANGLES_OV = [135, 150, 120, 160]

function kitThemeGrads(kit: BrandKit): string[] {
  const colors = kit.colors.palettes.flatMap((p) => p.colors).map((c) => c.hex).filter(Boolean)
  if (colors.length < 2) return [
    'linear-gradient(135deg,#ec4899,#ffde42)',
    'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    'linear-gradient(135deg,#14b8a6,#3b82f6)',
    'linear-gradient(135deg,#f97316,#ec4899)',
  ]
  return ANGLES_OV.map((angle, i) => {
    const a = colors[i % colors.length]
    const b = colors[(i + 1) % colors.length]
    return `linear-gradient(${angle}deg,${a},${b})`
  })
}

function ThemesCard({ kit, go }: { kit: BrandKit; go: () => void }) {
  const { setModal } = useUIStore()
  const themes = kit.themes ?? []
  const count = themes.length
  const grads = kitThemeGrads(kit)

  if (count === 0) {
    return (
      <div style={{
        gridColumn: '1 / -1', display: 'flex', borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--line)', minHeight: 180, position: 'relative',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      }}>
        {/* Left: info + CTA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '22px 24px', zIndex: 1 }}>
          <div className="ov-te-tag">Brand Themes</div>
          <div className="ov-te-title">Define your creative direction</div>
          <div className="ov-te-desc">
            A rule set that tells AI how to apply your brand to presentations, social posts, and more.
          </div>
          <button
            className="ov-te-btn"
            onClick={(e) => { e.stopPropagation(); setModal({ type: 'new-theme' }) }}
          >
            <Plus style={{ width: 13, height: 13 }} /> New Theme
          </button>
        </div>

        {/* Right: decorative gradient columns */}
        <div style={{ width: 200, flexShrink: 0, display: 'flex', gap: 6, padding: '12px 16px 12px 0', alignItems: 'stretch' }}>
          {grads.slice(0, 4).map((g, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 8, background: g,
              opacity: 0.18 + i * 0.06,
            }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="ov-card"
      style={{ flexDirection: 'column', gap: 16, gridColumn: '1 / -1', cursor: 'pointer' }}
      onClick={go}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="ov-card-title">Brand Themes</div>
          <div className="ov-card-count">{count} theme{count !== 1 ? 's' : ''}</div>
        </div>
        <button className="ov-link" onClick={(e) => { e.stopPropagation(); go() }}>
          View all <ArrowRight style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {/* Theme tiles */}
      <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
        {themes.slice(0, 4).map((t) => {
          const grad = grads[t.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % grads.length]
          return (
            <div key={t.id} className="ov-theme-tile">
              <div style={{ aspectRatio: '16 / 9', background: t.thumbnailSrc ? undefined : grad, position: 'relative' }}>
                {t.thumbnailSrc && <img src={t.thumbnailSrc} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div className="ov-theme-tile-footer">
                <div className="ov-theme-tile-name">{t.name}</div>
                <div className="ov-theme-tile-count">{t.rules.length} guideline{t.rules.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── card: Image Assets ───────────────────────────────────── */
const IMG_ACCENTS = ['#ec4899', '#ffde42', '#a78bfa', '#34d399']

function ImgTile({ idx }: { idx: number }) {
  const accent = IMG_ACCENTS[idx % IMG_ACCENTS.length]
  const bg = idx % 2 === 0 ? '#111' : '#181818'
  return (
    <div className="ov-thumb ov-img-tile" style={{ background: bg, padding: '7px 9px', flexDirection: 'column', gap: 2, justifyContent: 'flex-end', alignItems: 'flex-start' }}>
      <div style={{ width: '55%', height: 2, background: accent, borderRadius: 2, marginBottom: 2 }} />
      {[40, 55, 48].map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height: 1.5, background: '#fff', borderRadius: 2, opacity: 0.45 }} />
      ))}
    </div>
  )
}

function ImageryCard({ kit, go }: { kit: BrandKit; go: () => void }) {
  return (
    <div className="ov-card" onClick={go}>
      <div className="ov-card-left">
        <div className="ov-card-title">Image Assets</div>
        <div className="ov-card-count">{kit.imagery.tags.length} images</div>
        <button className="ov-link">View all <ArrowRight style={{ width: 12, height: 12 }} /></button>
      </div>
      <div className="ov-thumbs">
        {[0, 1, 2, 3].map((i) => <ImgTile key={i} idx={i} />)}
      </div>
    </div>
  )
}

/* ── main ─────────────────────────────────────────────────── */
export function Overview({ kit, go, ed, showWelcomeBanner, onDismissBanner }: OverviewProps) {
  if (kit.onboarding && ed) {
    return <OnboardingOverview kit={kit} ed={ed} go={go} />
  }

  return (
    <div className="fade-in ov-wrap">
      {kit.sample && (
        <Banner
          tag="SAMPLE BRAND KIT"
          title={<>What is<br />Brand Kit?</>}
          description="Brand Kit locks in your logo, colors, fonts, and voice across presentations, social, and everything you create. Set it once, customize anytime."
          style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, #0e0c00) 0%, color-mix(in srgb, var(--accent) 6%, #0a0e1a) 100%)' }}
        />
      )}

      {showWelcomeBanner && (
        <Banner
          tag="✦ BRAND KIT CREATED"
          title={<>Your brand kit<br />is ready!</>}
          description="Keep building — add your logos, fill in colors, set your typography, and define your voice for a complete brand foundation."
          onDismiss={onDismissBanner}
        />
      )}

      <div className="ov-grid">
        <ThemesCard kit={kit} go={() => go('themes')} />
        <LogosCard kit={kit} go={() => go('logos')} />
        <ColorsCard kit={kit} go={() => go('colors')} />
        <TypographyCard kit={kit} go={() => go('typography')} />
        <VoiceCard kit={kit} go={() => go('tone')} />
        <ImageryCard kit={kit} go={() => go('imagery')} />
      </div>
    </div>
  )
}
