export function MiniPostPreview() {
  return (
    <div style={{ aspectRatio: '1', height: '100%', maxWidth: '100%', background: '#f8f8f8', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 6 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', opacity: .07, pointerEvents: 'none' }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ border: '1px solid #999', borderRadius: 3, margin: 3, background: '#aaa' }} />
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 6px', gap: 4 }}>
        <div style={{ fontSize: 6, fontWeight: 800, color: '#111', lineHeight: 1.2, maxWidth: 100 }}>Safeguarding Your Innovation</div>
        <div style={{ fontSize: 4, color: '#555', lineHeight: 1.3, maxWidth: 90 }}>Mastering IP Strategy</div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#22c55e" stroke="none" style={{ margin: '2px 0' }}>
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="white"/>
        </svg>
        <div style={{ fontSize: 4, fontWeight: 700, padding: '2px 6px', borderRadius: 8, border: '0.5px solid #111', color: '#111', background: '#fff' }}>Explore IP Best Practices</div>
      </div>
    </div>
  )
}
