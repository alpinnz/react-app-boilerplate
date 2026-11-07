import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useEffect, type ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { InputSearch } from '../atoms/InputSearch'
import { IconButton } from '../atoms/IconButton'

/** Ikon navigasi yang tersedia pada sidebar bersama. */
export type NavigationIconName = 'account' | 'users' | 'roles' | 'status'

type SideNavigationProps = {
  isOpen: boolean
  isCollapsed: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  onClose: () => void
  onToggleCollapse: () => void
  brandName: string
  brandDescription: string
  brandMark: string
  footer?: ReactNode
  children: ReactNode
}

type SideNavigationItemProps = {
  icon: NavigationIconName
  isActive: boolean
  isCollapsed?: boolean
  children: ReactNode
}

type NavigationContentProps = Omit<SideNavigationProps, 'isOpen' | 'onToggleCollapse'> & {
  showCloseButton?: boolean
}

const navigationIconPaths: Record<NavigationIconName, ReactNode> = {
  account: <><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  roles: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  status: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
}

/** Item visual sidebar; status aktif dan tujuan navigasi dimiliki pemanggil. */
export function SideNavigationItem({ icon, isActive, isCollapsed = false, children }: SideNavigationItemProps) {
  const stateClasses = isActive
    ? 'bg-action-soft text-action'
    : 'text-content hover:bg-sidebar-hover'
  const itemSpacing = isCollapsed ? 'gap-2.5 px-2 lg:justify-center lg:gap-0 lg:px-1.5' : 'gap-2.5 px-2'
  const labelVisibility = isCollapsed ? 'min-w-0 truncate lg:sr-only' : 'min-w-0 truncate'

  return (
    <span className={`flex min-h-10 items-center rounded-control text-app-body-regular-medium transition-colors ${itemSpacing} ${stateClasses}`}>
      <span className={`grid size-7 shrink-0 place-items-center ${isActive ? 'text-action' : 'text-content-muted'}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">{navigationIconPaths[icon]}</svg>
      </span>
      <span className={labelVisibility}>{children}</span>
    </span>
  )
}

function NavigationContent({ brandName, brandDescription, brandMark, footer, children, isCollapsed, searchValue, onSearchChange, onClose, showCloseButton = false }: NavigationContentProps) {
  const { translate } = useLocalization()

  return <>
    <div className={`flex h-20 shrink-0 items-center border-b border-line ${isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3.5'}`}>
      <div className={`grid shrink-0 place-items-center rounded-control bg-action text-app-body-regular-bold text-on-action shadow-surface ${isCollapsed ? 'size-8' : 'size-9'}`}>{brandMark}</div>
      {!isCollapsed && <div className="min-w-0 flex-1">
        <strong className="block truncate text-app-body-regular-semi-bold text-content">{brandName}</strong>
        <span className="mt-1 block truncate text-app-caption-regular text-content-muted">{brandDescription}</span>
      </div>}
      {showCloseButton ? <IconButton
        type="button"
        data-autofocus
        aria-label={translate('app.closeNavigation')}
        variant="neutral"
        className="!shrink-0 lg:hidden"
        onClick={onClose}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5"><path d="M5 5l14 14M19 5 5 19" /></svg>
      </IconButton> : null}
    </div>
    {!isCollapsed && <div className="shrink-0 border-b border-line px-4 py-1.5 lg:pr-6">
      <label htmlFor={showCloseButton ? 'mobile-navigation-search' : 'desktop-navigation-search'} className="sr-only">{translate('app.searchNavigation')}</label>
      <InputSearch
        id={showCloseButton ? 'mobile-navigation-search' : 'desktop-navigation-search'}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={translate('app.searchNavigation')}
        className="text-app-body-regular-regular placeholder:text-content-muted/80"
      />
    </div>}
    <nav aria-label={translate('app.mainNavigation')} className={`min-h-0 flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-form'}`}>
      <div className="grid gap-form">{children}</div>
    </nav>
    {footer && <div className={`shrink-0 border-t border-line ${isCollapsed ? 'p-2' : 'p-form'}`}>{footer}</div>}
  </>
}

/** Sidebar desktop statis dan drawer mobile dengan manajemen fokus Headless UI. */
export function SideNavigation({ isOpen, isCollapsed, searchValue, onSearchChange, onClose, onToggleCollapse, brandName, brandDescription, brandMark, footer, children }: SideNavigationProps) {
  const { translate } = useLocalization()

  useEffect(() => {
    const desktopLayout = window.matchMedia?.('(min-width: 64rem)')
    if (!desktopLayout) return

    const closeDrawerOnResize = (event: MediaQueryListEvent) => {
      if (event.matches) onClose()
    }

    desktopLayout.addEventListener('change', closeDrawerOnResize)
    return () => desktopLayout.removeEventListener('change', closeDrawerOnResize)
  }, [onClose])

  const contentProps = { brandName, brandDescription, brandMark, footer, children, isCollapsed: false, searchValue, onSearchChange, onClose, onToggleCollapse }

  return <>
    <Dialog open={isOpen} transition onClose={onClose} className="relative z-50 lg:hidden">
      <DialogBackdrop transition className="fixed inset-0 bg-overlay/70 duration-200 ease-out data-closed:opacity-0 motion-reduce:transition-none" />
      <DialogPanel transition className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-sidebar shadow-popover duration-200 ease-out data-closed:-translate-x-full motion-reduce:transition-none">
        <DialogTitle className="sr-only">{translate('app.mainNavigation')}</DialogTitle>
        <NavigationContent {...contentProps} showCloseButton />
      </DialogPanel>
    </Dialog>
    <aside className={`relative hidden shrink-0 flex-col border-r border-line bg-sidebar transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <NavigationContent {...contentProps} isCollapsed={isCollapsed} />
      <IconButton
        type="button"
        aria-label={translate(isCollapsed ? 'app.expandNavigation' : 'app.collapseNavigation')}
        title={translate(isCollapsed ? 'app.expandNavigation' : 'app.collapseNavigation')}
        variant="neutral-bordered"
        size="small"
        className="!absolute -right-5 top-[5.5rem] z-20 hidden !rounded-full shadow-surface lg:!inline-flex"
        onClick={onToggleCollapse}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`size-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16m3-10 2 2-2 2" /></svg>
      </IconButton>
    </aside>
  </>
}
