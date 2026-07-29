import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/shared/lib/utils'

// ── Root ──────────────────────────────────────────────────────────────────────

const EditorTabs = TabsPrimitive.Root

// ── Tab list (the button row) ─────────────────────────────────────────────────

const EditorTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('mv3-tab-list', className)}
    {...props}
  />
))
EditorTabsList.displayName = 'EditorTabsList'

// ── Individual tab trigger ────────────────────────────────────────────────────

const EditorTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn('mv3-tab-trigger', className)}
    {...props}
  />
))
EditorTabsTrigger.displayName = 'EditorTabsTrigger'

// ── Tab panel ─────────────────────────────────────────────────────────────────

const EditorTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mv3-tab-content', className)}
    {...props}
  />
))
EditorTabsContent.displayName = 'EditorTabsContent'

// ── Convenience: fully-composed tab group ─────────────────────────────────────
// Usage:
//   <EditorTabGroup
//     tabs={[{ value: 'preview', label: 'Image preview' }, { value: 'publishing', label: 'Publishing' }]}
//     value={editorTab}
//     onValueChange={setEditorTab}
//   />

interface TabDef {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

interface EditorTabGroupProps {
  tabs: TabDef[]
  value: string
  onValueChange: (v: string) => void
  className?: string
  listClassName?: string
}

function EditorTabGroup({ tabs, value, onValueChange, className, listClassName }: EditorTabGroupProps) {
  return (
    <EditorTabs value={value} onValueChange={onValueChange} className={className}>
      <EditorTabsList className={listClassName}>
        {tabs.map(t => (
          <EditorTabsTrigger key={t.value} value={t.value} disabled={t.disabled}>
            {t.label}
          </EditorTabsTrigger>
        ))}
      </EditorTabsList>
    </EditorTabs>
  )
}

export {
  EditorTabs,
  EditorTabsList,
  EditorTabsTrigger,
  EditorTabsContent,
  EditorTabGroup,
}
