import type { ReactNode } from 'react'

type FeedbackTone = 'info' | 'success' | 'error'

const toneClasses: Record<FeedbackTone, string> = {
  info: 'border-action/20 bg-action-soft text-content',
  success: 'border-accent/25 bg-accent-soft text-accent-strong',
  error: 'border-danger/30 bg-danger-soft text-danger',
}

const toneIcons: Record<FeedbackTone, ReactNode> = {
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  success: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  error: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></>,
}

/** Pesan status berwarna semantik dengan ikon yang tidak mengulang teks. */
export function InlineFeedback({ tone, children }: { tone: FeedbackTone; children: ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-control border px-3 py-2.5 text-sm leading-relaxed ${toneClasses[tone]}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0">
        {toneIcons[tone]}
      </svg>
      <span className="min-w-0">{children}</span>
    </p>
  )
}
