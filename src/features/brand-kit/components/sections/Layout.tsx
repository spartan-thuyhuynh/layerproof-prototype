import type { BrandKit } from '@/features/brand-kit/types/brand'
import { EditText } from '@/features/brand-kit/components/edit/EditText'
import { RemoveBtn, AddBtn } from '@/features/brand-kit/components/edit/RemoveBtn'
import { SecHead, EditHint } from './shared'
import { Grid, Plus, Ruler } from '@/shared/icons'
import type { EditorActions } from './types'

interface LayoutProps {
  kit: BrandKit
  ed: EditorActions
}

export function Layout({ kit, ed }: LayoutProps) {
  const maxSp = Math.max(...kit.layout.spacing, 1)

  return (
    <div className="fade-in">
      <SecHead title="Layout & spacing" desc="Grid, spacing scale, and corner radii." right={<EditHint />} />

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 22 }}>
        <div className="card">
          <div className="h3" style={{ marginBottom: 14 }}>Grid</div>
          <div className="gridviz" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
            {Array.from({ length: 6 }).map((_, i) => <i key={i} />)}
          </div>
          <div className="chip" style={{ marginTop: 12 }}>
            <Grid style={{ width: 14, height: 14 }} />
            <EditText value={kit.layout.grid} onCommit={(v) => ed.setVal(['layout', 'grid'], v)} />
          </div>
        </div>

        <div className="card">
          <div className="h3" style={{ marginBottom: 14 }}>Corner radius</div>
          <div className="radiusviz">
            {kit.layout.radius.map((r, i) => (
              <div key={i} className="rr" style={{ borderRadius: r.v, position: 'relative' }}>
                <RemoveBtn title="Delete" onClick={() => ed.removeItem(['layout', 'radius'], i)} />
                <EditText className="rr-l" value={r.l} onCommit={(v) => ed.setVal(['layout', 'radius', i, 'l'], v)} />
                <div className="rr-v">
                  <EditText numeric value={r.v} onCommit={(v) => ed.setVal(['layout', 'radius', i, 'v'], v)} />
                  px
                </div>
              </div>
            ))}
            <button className="rr rr-add" title="Add radius" onClick={() => ed.addItem(['layout', 'radius'], { v: 10, l: 'New' })}>
              <Plus />
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="h3" style={{ marginBottom: 18 }}>Spacing scale</div>
        <div className="spacing-scale">
          {kit.layout.spacing.map((v, i) => (
            <div key={i} className="sp" style={{ width: 46 }}>
              <div className="bar" style={{ height: 20 + (v / maxSp) * 90 }} />
              <EditText className="v" numeric value={v} onCommit={(val) => ed.setVal(['layout', 'spacing', i], val)} />
              <RemoveBtn title="Delete" onClick={() => ed.removeItem(['layout', 'spacing'], i)} />
            </div>
          ))}
          <div className="sp" style={{ width: 46 }}>
            <button className="sp-add" title="Add spacing step" onClick={() => ed.addItem(['layout', 'spacing'], maxSp * 2)}>
              <Plus />
            </button>
          </div>
        </div>
      </div>

      <div className="h3" style={{ marginBottom: 4 }}>Layout rules</div>
      <div className="card" style={{ padding: '4px 20px', marginTop: 14 }}>
        {kit.layout.rules.length
          ? kit.layout.rules.map((r, i) => (
              <div key={i} className="rule">
                <div className="rk"><Ruler /></div>
                <div className="rbody">
                  <EditText tag="b" value={r.t} onCommit={(v) => ed.setVal(['layout', 'rules', i, 't'], v)} />
                  <EditText tag="p" multiline value={r.d} onCommit={(v) => ed.setVal(['layout', 'rules', i, 'd'], v)} />
                </div>
                <RemoveBtn title="Delete rule" onClick={() => ed.removeItem(['layout', 'rules'], i)} />
              </div>
            ))
          : <div className="tiny" style={{ padding: '16px 0' }}>No rules yet.</div>
        }
      </div>
      <AddBtn label="Add layout rule" onClick={() => ed.addItem(['layout', 'rules'], { t: 'New layout rule', d: 'Describe the constraint…' })} />
    </div>
  )
}
