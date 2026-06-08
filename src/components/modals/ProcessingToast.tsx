import { useEffect, useState } from 'react'
import { Portal } from '@/lib/Portal'

/* ── per-category content ─────────────────────────────────────── */
interface ToastMeta {
  header: string
  title: string
  icon: React.ReactNode
}

const iconStyle = { width: 22, height: 22 }

const TOAST_META: Record<string, ToastMeta> = {
  logos: {
    header: 'Uploading logos',
    title: 'Processing logo files',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  colors: {
    header: 'Processing colors',
    title: 'Building color palette',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <circle cx="13.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="10.5" r="2.5" />
        <circle cx="8.5" cy="7.5" r="2.5" />
        <circle cx="6.5" cy="12.5" r="2.5" />
        <path d="M12 20.5a8.5 8.5 0 0 1 0-17" />
      </svg>
    ),
  },
  typography: {
    header: 'Setting up fonts',
    title: 'Configuring typography',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  tone: {
    header: 'Defining brand voice',
    title: 'Configuring voice settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  imagery: {
    header: 'Uploading assets',
    title: 'Processing image assets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  url: {
    header: 'Importing brand',
    title: 'Processing brand URL',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  pdf: {
    header: 'Importing brand',
    title: 'Analyzing brand PDF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  general: {
    header: 'Building brand kit',
    title: 'Setting up your brand kit',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
}

/* ── Animated ellipsis ────────────────────────────────────────── */
function Ellipsis() {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 4 ? '.' : d + '.'), 500)
    return () => clearInterval(t)
  }, [])
  return <span>In progress{dots}</span>
}

/* ── Progress bar ─────────────────────────────────────────────── */
function ProgressBar({ duration }: { duration: number }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const t = setInterval(() => {
      const elapsed = Date.now() - start
      setPct(Math.min((elapsed / duration) * 100, 100))
    }, 50)
    return () => clearInterval(t)
  }, [duration])
  return (
    <div style={{ height: 3, background: '#2a2a2a', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 2,
        background: 'var(--accent)',
        width: `${pct}%`,
        transition: 'width 50ms linear',
      }} />
    </div>
  )
}

/* ── Toast ────────────────────────────────────────────────────── */
interface ProcessingToastProps {
  category: string
  duration?: number          // ms, default 5000
  onDismiss: () => void
}

export function ProcessingToast({ category, duration = 5000, onDismiss }: ProcessingToastProps) {
  const meta = TOAST_META[category] ?? TOAST_META.general
  const [visible, setVisible] = useState(false)

  // slide-in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)       // wait for slide-out
    }, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  return (
    <Portal>
      <div
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 340,
          background: '#181818',
          border: '1px solid #2e2e2e',
          borderRadius: 14,
          boxShadow: '0 8px 40px rgba(0,0,0,.55)',
          overflow: 'hidden',
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s ease',
        }}
      >
        {/* header bar */}
        <div style={{
          padding: '11px 16px 10px',
          borderBottom: '1px solid #242424',
          fontSize: 12,
          fontWeight: 700,
          color: '#888',
          letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>
          {meta.header}
        </div>

        {/* body */}
        <div style={{
          padding: '14px 16px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 13,
        }}>
          {/* icon */}
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: '#242424',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
            color: 'var(--t2)',
          }}>
            {meta.icon}
          </div>

          {/* text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>
              {meta.title}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--t3)' }}>
              <Ellipsis />
            </div>
            <ProgressBar duration={duration} />
          </div>

          {/* cancel */}
          <button
            onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
            style={{
              flexShrink: 0,
              background: 'none',
              border: '1px solid #333',
              borderRadius: 8,
              color: 'var(--t2)',
              fontSize: 12.5,
              fontWeight: 600,
              padding: '5px 11px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginTop: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#505050'; e.currentTarget.style.color = 'var(--t1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = 'var(--t2)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Portal>
  )
}
