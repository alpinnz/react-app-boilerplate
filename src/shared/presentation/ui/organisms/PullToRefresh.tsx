import { useEffect, useRef, useState, type ReactNode } from 'react'

type PullToRefreshProps = {
  children: ReactNode
  onRefresh: () => Promise<void>
  isRefreshing?: boolean
  disabled?: boolean
  pullLabel: string
  releaseLabel: string
  refreshingLabel: string
}

const triggerDistance = 72
const indicatorLimit = 60

/** Adds an accessible touch pull gesture to content inside the app's main scroller. */
export function PullToRefresh({ children, onRefresh, isRefreshing = false, disabled = false, pullLabel, releaseLabel, refreshingLabel }: PullToRefreshProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pullRefreshActiveRef = useRef(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isArmed, setIsArmed] = useState(false)
  const [isPullRefreshing, setIsPullRefreshing] = useState(false)

  useEffect(() => {
    const region = rootRef.current
    if (!region) return

    let gesture: { startX: number; startY: number; distance: number } | null = null

    function resetGesture() {
      gesture = null
      setPullDistance(0)
      setIsArmed(false)
    }

    function onTouchStart(event: TouchEvent) {
      if (!window.matchMedia('(max-width: 767px)').matches || disabled || isRefreshing || pullRefreshActiveRef.current || event.touches.length !== 1) return
      const target = event.target
      if (!(target instanceof Element) || target.closest('button, a, input, textarea, select, [role="button"], [role="dialog"], [contenteditable="true"], [data-no-pull-to-refresh]')) return

      const scroller = rootRef.current?.closest('main') ?? document.scrollingElement
      if (!scroller || scroller.scrollTop > 0) return

      const touch = event.touches[0]
      gesture = { startX: touch.clientX, startY: touch.clientY, distance: 0 }
    }

    function onTouchMove(event: TouchEvent) {
      if (!gesture || event.touches.length !== 1 || disabled || isRefreshing || pullRefreshActiveRef.current) return
      const touch = event.touches[0]
      const deltaY = touch.clientY - gesture.startY
      const deltaX = touch.clientX - gesture.startX
      if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
        if (deltaY < 0 || Math.abs(deltaX) > Math.abs(deltaY)) resetGesture()
        return
      }

      const scroller = rootRef.current?.closest('main') ?? document.scrollingElement
      if (scroller && scroller.scrollTop > 0) {
        resetGesture()
        return
      }

      event.preventDefault()
      gesture.distance = deltaY
      setPullDistance(Math.min(indicatorLimit, Math.round(deltaY * 0.72)))
      setIsArmed(deltaY >= triggerDistance)
    }

    function onTouchEnd() {
      if (!gesture) return
      const shouldRefresh = gesture.distance >= triggerDistance && !disabled && !isRefreshing && !pullRefreshActiveRef.current
      resetGesture()
      if (!shouldRefresh) return

      pullRefreshActiveRef.current = true
      setIsPullRefreshing(true)
      void Promise.resolve().then(onRefresh).then(() => {
        pullRefreshActiveRef.current = false
        setIsPullRefreshing(false)
      }, () => {
        pullRefreshActiveRef.current = false
        setIsPullRefreshing(false)
      })
    }

    region.addEventListener('touchstart', onTouchStart, { passive: true })
    region.addEventListener('touchmove', onTouchMove, { passive: false })
    region.addEventListener('touchend', onTouchEnd, { passive: true })
    region.addEventListener('touchcancel', resetGesture, { passive: true })
    return () => {
      region.removeEventListener('touchstart', onTouchStart)
      region.removeEventListener('touchmove', onTouchMove)
      region.removeEventListener('touchend', onTouchEnd)
      region.removeEventListener('touchcancel', resetGesture)
    }
  }, [disabled, isRefreshing, onRefresh])

  const isRefreshingNow = isRefreshing || isPullRefreshing
  const indicatorHeight = isRefreshingNow ? indicatorLimit : pullDistance
  const indicatorLabel = isRefreshingNow ? refreshingLabel : isArmed ? releaseLabel : pullLabel

  return (
    <div ref={rootRef} data-pull-to-refresh-region="true">
      <div
        role="status"
        aria-live="polite"
        aria-hidden={indicatorHeight === 0}
        className="flex items-end justify-center overflow-hidden text-app-body-small-medium text-content-muted transition-[height] duration-100 ease-out motion-reduce:transition-none"
        style={{ height: indicatorHeight }}
      >
        <span className="mb-2 inline-flex min-h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 shadow-surface">
          {isRefreshingNow ? <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-action/25 border-t-action motion-reduce:animate-none" /> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`size-4 text-action transition-transform ${isArmed ? 'rotate-180' : ''}`}><path d="M12 5v14m-6-6 6 6 6-6" /></svg>}
          {indicatorLabel}
        </span>
      </div>
      {children}
    </div>
  )
}
