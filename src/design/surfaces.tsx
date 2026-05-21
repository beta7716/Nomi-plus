import { Paper, type PaperProps } from '@mantine/core'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../utils/cn'

type PanelCardPadding = 'compact' | 'default' | 'comfortable'
type InlinePanelPadding = 'compact' | 'default'

const panelCardPaddingBySize: Record<PanelCardPadding, PaperProps['p']> = {
  compact: 'sm',
  default: 'md',
  comfortable: 'lg',
}

const inlinePanelPaddingBySize: Record<InlinePanelPadding, string> = {
  compact: '8px',
  default: '12px',
}

export type PanelCardProps = Omit<PaperProps, 'children' | 'p' | 'radius' | 'withBorder'> & Omit<HTMLAttributes<HTMLDivElement>, keyof PaperProps> & {
  children?: ReactNode
  padding?: PanelCardPadding
}

export const PanelCard = forwardRef<HTMLDivElement, PanelCardProps>(function PanelCard(
  {
    children,
    className,
    padding = 'default',
    ...props
  },
  ref,
) {
  const rootClassName = cn(
    'tc-panel-card',
    'rounded-panel border border-border-subtle bg-[linear-gradient(180deg,rgba(16,22,29,0.98),rgba(10,14,20,0.98))]',
    'shadow-[0_18px_40px_rgba(0,0,0,0.28)]',
    className,
  )

  return (
    <Paper
      {...props}
      ref={ref}
      className={rootClassName}
      p={panelCardPaddingBySize[padding]}
      radius="sm"
      shadow="xs"
      withBorder
    >
      {children}
    </Paper>
  )
})

export type InlinePanelProps = Omit<PaperProps, 'children'> & Omit<HTMLAttributes<HTMLDivElement>, keyof PaperProps> & {
  children?: ReactNode
  padding?: InlinePanelPadding
}

export const InlinePanel = forwardRef<HTMLDivElement, InlinePanelProps>(function InlinePanel(
  {
    children,
    className,
    padding = 'default',
    style,
    ...props
  },
  ref,
) {
  const rootClassName = cn(
    'tc-inline-panel',
    'rounded-none bg-surface-inline border-0 shadow-none',
    'data-[emphasis=strong]:bg-[rgba(96,165,250,0.08)]',
    className,
  )

  return (
    <Paper
      {...props}
      ref={ref}
      className={rootClassName}
      style={{
        padding: inlinePanelPaddingBySize[padding],
        ...style,
      }}
    >
      {children}
    </Paper>
  )
})
