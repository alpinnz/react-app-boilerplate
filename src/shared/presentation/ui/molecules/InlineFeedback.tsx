import type { ReactNode } from 'react'

type FeedbackTone = 'default' | 'info' | 'success' | 'warning' | 'error'

const toneClasses: Record<FeedbackTone, string> = {
  default: 'border-line bg-canvas text-content',
  info: 'border-action/20 bg-action-soft text-content',
  success: 'border-accent/25 bg-accent-soft text-accent-strong',
  warning: 'border-warning/30 bg-warning-soft text-warning',
  error: 'border-danger/30 bg-danger-soft text-danger',
}

const toneIcons: Record<FeedbackTone, ReactNode> = {
  default: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  success: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  warning: <><path d="M12 3.5 2.8 19h18.4L12 3.5Z" /><path d="M12 9v4m0 3h.01" /></>,
  error: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></>,
}

/** Pesan status berwarna semantik dengan ikon yang tidak mengulang teks. */
export function InlineFeedback({ tone, children }: { tone: FeedbackTone; children: ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-control border px-3 py-2 text-app-body-regular-regular ${toneClasses[tone]}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0">
        {toneIcons[tone]}
      </svg>
      <span className="min-w-0">{children}</span>
    </p>
  )
}
