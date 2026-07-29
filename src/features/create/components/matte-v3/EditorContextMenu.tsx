import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '@/shared/lib/utils'

// ── Root / Trigger ────────────────────────────────────────────────────────────

const EditorContextMenu = DropdownMenuPrimitive.Root
const EditorContextMenuTrigger = DropdownMenuPrimitive.Trigger

// ── Content ───────────────────────────────────────────────────────────────────

const EditorContextMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('mv3-ctx-menu', className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
EditorContextMenuContent.displayName = 'EditorContextMenuContent'

// ── Item ──────────────────────────────────────────────────────────────────────

interface EditorContextMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  danger?: boolean
  icon?: React.ReactNode
}

const EditorContextMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  EditorContextMenuItemProps
>(({ className, danger, icon, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn('mv3-ctx-item', danger && 'mv3-ctx-item--danger', className)}
    {...props}
  >
    {icon && <span className="mv3-ctx-item-icon">{icon}</span>}
    {children}
  </DropdownMenuPrimitive.Item>
))
EditorContextMenuItem.displayName = 'EditorContextMenuItem'

// ── Separator ─────────────────────────────────────────────────────────────────

const EditorContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('mv3-ctx-sep', className)}
    {...props}
  />
))
EditorContextMenuSeparator.displayName = 'EditorContextMenuSeparator'

// ── Label (non-interactive heading inside the menu) ───────────────────────────

const EditorContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('mv3-ctx-label', className)}
    {...props}
  />
))
EditorContextMenuLabel.displayName = 'EditorContextMenuLabel'

// ── Sub-menu ──────────────────────────────────────────────────────────────────

const EditorContextMenuSub = DropdownMenuPrimitive.Sub

const EditorContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    icon?: React.ReactNode
  }
>(({ className, icon, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn('mv3-ctx-item mv3-ctx-item--sub', className)}
    {...props}
  >
    {icon && <span className="mv3-ctx-item-icon">{icon}</span>}
    {children}
    <svg
      className="mv3-ctx-sub-chevron"
      width="10" height="10" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </DropdownMenuPrimitive.SubTrigger>
))
EditorContextMenuSubTrigger.displayName = 'EditorContextMenuSubTrigger'

const EditorContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn('mv3-ctx-menu', className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
EditorContextMenuSubContent.displayName = 'EditorContextMenuSubContent'

export {
  EditorContextMenu,
  EditorContextMenuTrigger,
  EditorContextMenuContent,
  EditorContextMenuItem,
  EditorContextMenuSeparator,
  EditorContextMenuLabel,
  EditorContextMenuSub,
  EditorContextMenuSubTrigger,
  EditorContextMenuSubContent,
}
