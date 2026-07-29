import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/shared/lib/utils'

// Re-export the provider so callers can wrap their tree once at the layout level.
const EditorTooltipProvider = TooltipPrimitive.Provider

// ── Simple all-in-one wrapper ─────────────────────────────────────────────────
// Usage:
//   <EditorTooltip label="Version history" side="bottom">
//     <button className="mv3-icon-btn" ...>...</button>
//   </EditorTooltip>

interface EditorTooltipProps {
  label: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
  className?: string
  children: React.ReactNode
}

function EditorTooltip({
  label,
  side = 'bottom',
  delayDuration = 600,
  className,
  children,
}: EditorTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn('mv3-tooltip', className)}
          >
            {label}
            <TooltipPrimitive.Arrow className="mv3-tooltip-arrow" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

// ── Escape hatch — raw primitives if you need custom structure ────────────────

const EditorTooltipRoot = TooltipPrimitive.Root
const EditorTooltipTrigger = TooltipPrimitive.Trigger
const EditorTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn('mv3-tooltip', className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
EditorTooltipContent.displayName = 'EditorTooltipContent'

export {
  EditorTooltip,
  EditorTooltipProvider,
  EditorTooltipRoot,
  EditorTooltipTrigger,
  EditorTooltipContent,
}
