import { useRef, useState, useEffect, useCallback } from 'react'
import * as I from '@/shared/icons'
import { ProtoCard } from './ProtoCard'

interface Proto {
  title: string
  flows: string[]
  status: 'live' | 'coming-soon'
  thumbnail?: string
  to: string
}

export function ProtoScroller({ protos }: { protos: Proto[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    sync()
    const el = trackRef.current
    el?.addEventListener('scroll', sync, { passive: true })
    const ro = new ResizeObserver(sync)
    if (el) ro.observe(el)
    return () => { el?.removeEventListener('scroll', sync); ro.disconnect() }
  }, [sync, protos])

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75, behavior: 'smooth' })
  }

  return (
    <div className="ps-wrap">
      {canLeft && (
        <button className="ps-chevron ps-chevron-left" onClick={() => scroll('left')} aria-label="Scroll left">
          <I.Chevron style={{ width: 16, height: 16, transform: 'rotate(-90deg)' }} />
        </button>
      )}

      <div className="ps-track" ref={trackRef}>
        {protos.map((p) => (
          <ProtoCard key={p.to} {...p} />
        ))}
      </div>

      {canRight && (
        <button className="ps-chevron ps-chevron-right" onClick={() => scroll('right')} aria-label="Scroll right">
          <I.Chevron style={{ width: 16, height: 16, transform: 'rotate(90deg)' }} />
        </button>
      )}
    </div>
  )
}
