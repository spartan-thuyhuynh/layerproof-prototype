export interface RecentProject {
  id: string
  title: string
  workspace: string
  type: string
  typeColor: string
  thumbBg: string
  thumbIcon: string
  thumbIconColor: string
  lastAction: string
}

export const RECENT_PROJECTS: RecentProject[] = [
  {
    id: '1',
    title: 'Social Campaign - promotion poster for Uselink...',
    workspace: 'Workspace 2026-06-05T07:40:25.377831566Z',
    type: 'Social Post',
    typeColor: '#f97316',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Social',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last viewed on Jun 9, 2026',
  },
  {
    id: '2',
    title: 'Social Campaign - Implement fairness in ML...',
    workspace: 'Workspace 2026-06-09T04:30:54.854407767Z',
    type: 'Social Post',
    typeColor: '#f97316',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Social',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jun 9, 2026',
  },
  {
    id: '3',
    title: 'Designing a Meta-Analysis Framework',
    workspace: 'Workspace 2026-06-02T07:45:01.636606599Z',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jun 9, 2026',
  },
  {
    id: '4',
    title: 'Social Campaign - Learn inflation and deflation',
    workspace: 'Workspace 2026-06-02T07:50:14.394582222Z',
    type: 'Social Post',
    typeColor: '#f97316',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Social',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jun 5, 2026',
  },
  {
    id: '5',
    title: 'Blog Post - Present agile methodology training',
    workspace: 'Personal Project',
    type: 'Docs',
    typeColor: '#14b8a6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Docs',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Jun 2, 2026',
  },
  {
    id: '6',
    title: 'Mathematical Biology: Bridging Disciplines for...',
    workspace: 'Workspace 2026-04-06T03:32:01.257243322Z',
    type: 'Presentation',
    typeColor: '#8b5cf6',
    thumbBg: 'var(--card-2)',
    thumbIcon: 'Present',
    thumbIconColor: 'var(--t3)',
    lastAction: 'Last edited on Apr 15, 2026',
  },
]
