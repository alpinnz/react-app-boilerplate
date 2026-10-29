import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'

/** Data minimal akun yang ditampilkan pada menu profil navigasi. */
export type AccountSummary = {
  name: string
  email: string
  role: string
}

type TopNavigationProps = {
  section: string
  title: string
  account: AccountSummary
  onMenuOpen: () => void
  onAccountSelect: () => void
  onLogoutRequest: () => void
  endSlot?: ReactNode
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A'
}

/** Header navigasi dengan menu akun dan callback untuk tindakan app-level. */
export function TopNavigation({ section, title, account, onMenuOpen, onAccountSelect, onLogoutRequest, endSlot }: TopNavigationProps) {
  const { translate } = useLocalization()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAccountMenuOpen) return
    const closeOnPointer = (event: PointerEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) setIsAccountMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAccountMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOnPointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isAccountMenuOpen])

  return (
    <header className="relative z-30 flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-2 shadow-shell sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button type="button" aria-label={translate('app.openNavigation')} className="grid size-11 shrink-0 place-items-center rounded-control border border-line bg-surface text-content lg:hidden" onClick={onMenuOpen}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-content-muted">{section} <span aria-hidden="true">/</span></p>
          <p className="truncate text-base font-semibold tracking-tight text-content sm:text-xl">{title}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
      {endSlot}
      <div ref={popoverRef} className="relative">
        <button type="button" aria-controls="account-menu" aria-expanded={isAccountMenuOpen} className="flex min-h-11 min-w-11 items-center gap-3 rounded-control border border-line bg-surface px-1 py-1.5 text-left transition-colors hover:bg-sidebar-hover sm:px-2 sm:pr-3" onClick={() => setIsAccountMenuOpen((open) => !open)}>
          <span className="sr-only">{translate('app.accountMenu')}</span>
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-on-accent">{initials(account.name)}</span>
          <span className="hidden min-w-0 sm:block"><strong className="block max-w-40 truncate text-sm leading-tight text-content">{account.name}</strong><span className="block text-xs capitalize text-content-muted">{account.role}</span></span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="hidden size-4 text-content-muted sm:block"><path d="m6 8 4 4 4-4" /></svg>
        </button>
        {isAccountMenuOpen && <div id="account-menu" className="absolute right-0 top-[calc(100%+0.5rem)] w-72 overflow-hidden rounded-surface border border-line bg-surface p-2 shadow-popover">
          <div className="flex items-center gap-3 px-3 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent">{initials(account.name)}</span>
            <div className="min-w-0"><strong className="block truncate text-sm text-content">{account.name}</strong><span className="block truncate text-xs text-content-muted">{account.email}</span></div>
          </div>
          <div className="my-1 border-t border-line" />
          <button type="button" className="flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium text-content hover:bg-sidebar-hover" onClick={() => { setIsAccountMenuOpen(false); onAccountSelect() }}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>{translate('app.manageAccount')}
          </button>
          <button type="button" className="flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-medium text-danger hover:bg-danger-soft" onClick={() => { setIsAccountMenuOpen(false); onLogoutRequest() }}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5"><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></svg>{translate('app.logout')}
          </button>
        </div>}
      </div>
      </div>
    </header>
  )
}
