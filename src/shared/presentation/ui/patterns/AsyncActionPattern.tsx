import type { ReactNode } from 'react'
import { InlineFeedback } from '../molecules/InlineFeedback'

/** Groups async operation content and errors; actions are optional when a modal owns the footer. */
export function AsyncActionPattern({ error, children, actions }: {
  error?: string
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="grid gap-form">
      {children && children}
      {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
      {actions && <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-form">{actions}</div>}
    </div>
  )
}
