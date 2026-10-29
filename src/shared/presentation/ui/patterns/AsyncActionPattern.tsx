import type { ReactNode } from 'react'
import { InlineFeedback } from '../molecules/InlineFeedback'

/** Susunan konsisten untuk konten operasi async, error, dan area tindakan. */
export function AsyncActionPattern({ error, children, actions }: {
  error?: string
  children: ReactNode
  actions: ReactNode
}) {
  return (
    <div className="grid gap-4">
      {children}
      {error && <InlineFeedback tone="error">{error}</InlineFeedback>}
      <div className="flex flex-wrap justify-end gap-2">{actions}</div>
    </div>
  )
}
