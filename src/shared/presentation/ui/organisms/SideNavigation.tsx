import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'

/** Ikon navigasi yang tersedia pada sidebar bersama. */
export type NavigationIconName = 'account' | 'users' | 'roles'

type SideNavigationProps = {
  isOpen: boolean
  onClose: () => void
  brandName: string
  brandDescription: string
  brandMark: string
  footer?: ReactNode
  children: ReactNode
}

type SideNavigationItemProps = {
  icon: NavigationIconName
  isActive: boolean
  children: ReactNode
}

const navigationIconPaths: Record<NavigationIconName, ReactNode> = {
  account: <><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  roles: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
}

/** Item visual sidebar; status aktif dan tujuan navigasi dimiliki pemanggil. */
export function SideNavigationItem({ icon, isActive, children }: SideNavigationItemProps) {
  const stateClasses = isActive ? 'bg-sidebar-active text-action' : 'text-content-muted hover:bg-sidebar-hover hover:text-content'

  return (
    <span className={`flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors ${stateClasses}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0">{navigationIconPaths[icon]}</svg>
      <span>{children}</span>
    </span>
  )
}

/** Sidebar responsif yang menyerahkan isi menu dan state buka ke pemanggil. */
export function SideNavigation({ isOpen, onClose, brandName, brandDescription, brandMark, footer, children }: SideNavigationProps) {
  const { translate } = useLocalization()
  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    return () => { if (previousFocus?.isConnected) previousFocus.focus() }
  }, [isOpen])

  function onPanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') { onClose(); return }
    if (event.key !== 'Tab') return
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  return <>
    {isOpen && <button type="button" tabIndex={-1} aria-hidden="true" className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={onClose} />}
    <aside ref={panelRef} role={isOpen ? 'dialog' : undefined} aria-modal={isOpen ? true : undefined} aria-label={isOpen ? translate('app.mainNavigation') : undefined} onKeyDown={onPanelKeyDown} className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-line bg-sidebar transition-transform duration-200 motion-reduce:transition-none lg:static lg:z-auto lg:visible lg:translate-x-0 ${isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}>
      <div className="flex h-16 items-center gap-3 border-b border-line px-4">
        <div className="grid size-10 place-items-center rounded-control bg-action font-black text-on-action shadow-surface">{brandMark}</div>
        <div className="min-w-0 flex-1"><strong className="block leading-none text-content">{brandName}</strong><span className="mt-1 block text-xs text-content-muted">{brandDescription}</span></div>
        <button ref={closeButtonRef} type="button" aria-label={translate('app.closeNavigation')} className="grid size-10 place-items-center rounded-control border border-line bg-surface text-content lg:hidden" onClick={onClose}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5"><path d="M5 5l14 14M19 5 5 19" /></svg>
        </button>
      </div>
      <nav aria-label={translate('app.mainNavigation')} className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="mb-3 px-3 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-content-muted">{translate('app.workspace')}</p>
        <div className="grid gap-1">{children}</div>
      </nav>
      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </aside>
  </>
}
