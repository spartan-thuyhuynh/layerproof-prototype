import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface ProtoCardProps {
  title: string
  flows: string[]
  status: 'live' | 'coming-soon'
  thumbnail?: string
  to: string
}

export function ProtoCard({ title, flows, status, thumbnail, to }: ProtoCardProps) {
  const navigate = useNavigate()
  const isLive = status === 'live'

  return (
    <div
      className={`card proto-card${isLive ? '' : ' disabled'}`}
      onClick={() => isLive && navigate(to)}
      role={isLive ? 'button' : undefined}
      tabIndex={isLive ? 0 : undefined}
      onKeyDown={(e) => { if (isLive && (e.key === 'Enter' || e.key === ' ')) navigate(to) }}
    >
      <div className="proto-thumb">
        {thumbnail
          ? <img src={thumbnail} alt={title} />
          : <div className="proto-thumb-placeholder" />
        }
      </div>

      <div className="proto-body">
        <div className="proto-badge-row">
          <h3 className="proto-title">{title}</h3>
          {isLive
            ? <span className="chip solid">LIVE</span>
            : <span className="chip proto-chip-dashed">SOON</span>
          }
        </div>

        <ul className="proto-flows">
          {flows.map((flow) => (
            <li key={flow} className="proto-flow-item">
              <span className="proto-flow-dot" />
              {flow}
            </li>
          ))}
        </ul>

        {isLive && (
          <div className="proto-cta">
            <span>View Prototype</span>
            <ArrowRight size={14} />
          </div>
        )}
      </div>
    </div>
  )
}
