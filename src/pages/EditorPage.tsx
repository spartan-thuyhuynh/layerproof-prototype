import { useParams, useNavigate } from 'react-router-dom'
import { PRODUCT_CONFIGS } from '@/features/create/config'
import { EditorSample } from '@/features/create/components/EditorSample'

export function EditorPage() {
  const { product } = useParams<{ product: string }>()
  const navigate = useNavigate()
  const config = product ? PRODUCT_CONFIGS[product] : undefined

  if (!config) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, color: 'var(--t1)', background: 'var(--panel)' }}>
        <p style={{ fontSize: 18, fontWeight: 600 }}>Editor not found for: "{product}"</p>
        <button onClick={() => navigate('/home')} style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--line-2)', color: 'var(--t1)', cursor: 'pointer', fontFamily: 'inherit' }}>
          Go Home
        </button>
      </div>
    )
  }

  return <EditorSample config={config} />
}
