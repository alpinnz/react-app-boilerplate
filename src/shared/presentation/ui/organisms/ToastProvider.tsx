import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { ToastContext, type ToastInput, type ToastTone } from './ToastContext'
import { IconButton } from '../atoms/IconButton'

type ToastItem = ToastInput & { id: number }

const toneClasses: Record<ToastTone, string> = {
  default: 'border-line bg-surface text-content',
  success: 'border-accent/30 bg-surface text-content',
  info: 'border-action/30 bg-surface text-content',
  warning: 'border-warning/30 bg-surface text-content',
  error: 'border-danger/30 bg-surface text-content',
}

const iconClasses: Record<ToastTone, string> = {
  default: 'text-content-muted',
  success: 'text-accent-strong',
  info: 'text-action',
  warning: 'text-warning',
  error: 'text-danger',
}

const iconPaths: Record<ToastTone, ReactNode> = {
  default: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  success: <path d="m5 12 4 4L19 6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  warning: <><path d="M12 3.5 2.8 19h18.4L12 3.5Z" /><path d="M12 9v4m0 3h.01" /></>,
  error: <path d="M12 8v4m0 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { translate } = useLocalization()
  const [isPaused, setIsPaused] = useState(false)
  const [isEntered, setIsEntered] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const dismissTimer = useRef<number | null>(null)
  const dismiss = useCallback(() => {
    if (isDismissing) return
    setIsDismissing(true)
    dismissTimer.current = window.setTimeout(() => onDismiss(toast.id), 160)
  }, [isDismissing, onDismiss, toast.id])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsEntered(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => () => {
    if (dismissTimer.current !== null) window.clearTimeout(dismissTimer.current)
  }, [])

  useEffect(() => {
    if (isPaused || isDismissing || toast.tone === 'error') return
    const timeout = window.setTimeout(dismiss, 6000)
    return () => window.clearTimeout(timeout)
  }, [dismiss, isDismissing, isPaused, toast.tone])

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
      }}
      className={`flex items-start gap-3 rounded-surface border p-3.5 md:p-4 shadow-popover transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none ${isEntered && !isDismissing ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'} ${toneClasses[toast.tone]}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 size-5 shrink-0 ${iconClasses[toast.tone]}`}>
        {iconPaths[toast.tone]}
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-app-body-regular-semi-bold">{toast.title}</p>
        <p className="mt-0.5 text-app-body-small-regular text-content-muted">{toast.description}</p>
      </div>
      <IconButton
        type="button"
        aria-label={translate('app.dismissNotification')}
        size="small"
        variant="neutral"
        className="!shrink-0 hover:!bg-canvas"
        onClick={dismiss}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-4"><path d="m5 5 10 10M15 5 5 15" /></svg>
      </IconButton>
    </div>
  )
}

/** App-scoped toast queue for short operation feedback across routes. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { translate } = useLocalization()
  const nextId = useRef(0)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((toast: ToastInput) => {
    const id = ++nextId.current
    setToasts((current) => [...current.slice(-2), { ...toast, id }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div role="region" aria-label={translate('app.notifications')} className="pointer-events-none fixed inset-x-3 top-16 z-[70] grid justify-items-end gap-2 md:inset-x-auto md:right-6 md:top-20 md:w-full md:max-w-sm">
        {toasts.map((toast) => <div key={toast.id} className="pointer-events-auto"><ToastCard toast={toast} onDismiss={dismissToast} /></div>)}
      </div>
    </ToastContext.Provider>
  )
}
