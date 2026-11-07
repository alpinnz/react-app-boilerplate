import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  className?: string
  titleSection?: ReactNode
  titleSectionClassName?: string
}

/** Responsive page surface with optional title/actions and flexible content slots. */
export function PageShell({ children, className = '', titleSection, titleSectionClassName = 'mb-section' }: PageShellProps) {
  return (
    <div className={`min-w-0 rounded-surface bg-surface p-surface shadow-surface ${className}`}>
      {titleSection && <div className={`min-w-0 ${titleSectionClassName}`}>{titleSection}</div>}
      {children}
    </div>
  )
}
