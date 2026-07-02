import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface TipProps {
  label: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tip({ label, children, side = 'top' }: TipProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="tip-content">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
