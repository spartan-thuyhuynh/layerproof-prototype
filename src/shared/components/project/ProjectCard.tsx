import * as I from '@/shared/icons'
import type { RecentProject } from '@/data/recent-projects'

interface ProjectCardProps {
  project: RecentProject
  onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const Icon = I.Icons[project.thumbIcon]
  return (
    <div className={`proj-card${project.deleted ? ' proj-card--deleted' : ''}`} onClick={onClick}>
      <div className="proj-card-thumb" style={{ background: project.thumbBg }}>
        {Icon && <Icon style={{ color: project.typeColor, width: 40, height: 40, opacity: 0.4 }} />}
        {project.deleted ? (
          <span className="proj-card-deleted-badge">
            <I.Trash style={{ width: 12, height: 12 }} /> Deleted
          </span>
        ) : (
          <button
            className="proj-card-menu"
            onClick={e => e.stopPropagation()}
            aria-label="More options"
          >
            <I.MoreHoriz />
          </button>
        )}
      </div>
      <div className="proj-card-body">
        <p className="proj-card-title">{project.title}</p>
        <div className="proj-card-type-row">
          <span
            className="proj-card-type-icon"
            style={{ background: project.typeColor }}
          >
            {Icon && <Icon style={{ width: 13, height: 13, color: '#fff' }} />}
          </span>
          <span className="proj-card-type-name">{project.type}</span>
        </div>
        <p className="proj-card-date">{project.lastAction}</p>
      </div>
    </div>
  )
}
