import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/shared/lib/utils'

// ── Root / Trigger / Close ────────────────────────────────────────────────────

const EditorDialog = DialogPrimitive.Root
const EditorDialogTrigger = DialogPrimitive.Trigger
const EditorDialogClose = DialogPrimitive.Close

// ── Overlay ───────────────────────────────────────────────────────────────────

const EditorDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('mv3-dialog-overlay', className)}
    {...props}
  />
))
EditorDialogOverlay.displayName = 'EditorDialogOverlay'

// ── Content ───────────────────────────────────────────────────────────────────

interface EditorDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Suppress the default close button */
  hideClose?: boolean
  /** Width preset: 'sm' | 'md' | 'lg' | 'xl'. Defaults to 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const EditorDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  EditorDialogContentProps
>(({ className, children, hideClose, size = 'md', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <EditorDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'mv3-dialog-content',
        `mv3-dialog-content--${size}`,
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="mv3-dialog-close" aria-label="Close">
          <svg
            width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
EditorDialogContent.displayName = 'EditorDialogContent'

// ── Convenience layout primitives ─────────────────────────────────────────────

const EditorDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mv3-dialog-header', className)} {...props} />
)
EditorDialogHeader.displayName = 'EditorDialogHeader'

const EditorDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('mv3-dialog-title', className)}
    {...props}
  />
))
EditorDialogTitle.displayName = 'EditorDialogTitle'

const EditorDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mv3-dialog-body', className)} {...props} />
)
EditorDialogBody.displayName = 'EditorDialogBody'

const EditorDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mv3-dialog-footer', className)} {...props} />
)
EditorDialogFooter.displayName = 'EditorDialogFooter'

export {
  EditorDialog,
  EditorDialogTrigger,
  EditorDialogClose,
  EditorDialogOverlay,
  EditorDialogContent,
  EditorDialogHeader,
  EditorDialogTitle,
  EditorDialogBody,
  EditorDialogFooter,
}
