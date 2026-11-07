import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { useEffect, type ReactNode } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { Breadcrumbs, type BreadcrumbEntry } from '../molecules/Breadcrumbs'
import { Button } from '../atoms/Button'
import { IconButton } from '../atoms/IconButton'

/** Data minimal akun yang ditampilkan pada menu profil navigasi. */
export type AccountSummary = {
  name: string
  email: string
  role: string
}

type TopNavigationProps = {
  title: string
  breadcrumbs: readonly BreadcrumbEntry[]
  account: AccountSummary
  onMenuOpen: () => void
  onAccountSelect: () => void
  onLogoutRequest: () => void
  themeMode?: 'light' | 'dark'
  onThemeToggle?: () => void
  endSlot?: ReactNode
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A'
}

/** Header halaman dengan breadcrumb, notifikasi, dan popover akun berbasis Headless UI. */
export function TopNavigation({ title, breadcrumbs, account, onMenuOpen, onAccountSelect, onLogoutRequest, themeMode, onThemeToggle, endSlot }: TopNavigationProps) {
  const { locale, setLocale, translate } = useLocalization()

  useEffect(() => { document.documentElement.lang = locale }, [locale])

  return (
    <header className="relative z-30 grid min-h-20 shrink-0 items-center border-b border-line bg-surface px-page-gutter py-1.5">
      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 lg:gap-x-0">
        <IconButton type="button" aria-label={translate('app.openNavigation')} variant="neutral-bordered" className="col-start-1 row-start-1 !shrink-0 lg:hidden" onClick={onMenuOpen}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </IconButton>
        <h1 className="col-start-2 row-start-1 min-w-0 truncate text-app-title-semi-bold text-content">{title}</h1>
        <div className="col-start-2 col-end-3 row-start-2 min-w-0">
          <Breadcrumbs
            ariaLabel={translate('app.breadcrumbs')}
            items={breadcrumbs}
            currentLabel={title}
          />
        </div>
        <div className="col-start-3 row-start-1 row-span-2 flex shrink-0 items-center gap-2 md:gap-3">
          {endSlot}
          <Popover className="relative">
            <PopoverButton
              as={IconButton}
              aria-label={translate('app.notifications')}
              variant="neutral-bordered"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
              </svg>
            </PopoverButton>
            <PopoverPanel
              anchor="bottom end"
              modal={false}
              transition
              role="dialog"
              aria-labelledby="notifications-panel-title"
              className="z-50 mt-2 w-80 max-w-[calc(100vw_-_2rem)] overflow-hidden rounded-surface border border-line bg-surface shadow-popover outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <div className="border-b border-line px-4 py-3">
                <h2 id="notifications-panel-title" className="text-app-body-regular-semi-bold text-content">{translate('app.notifications')}</h2>
              </div>
              <div className="grid min-h-16 place-items-center px-4 py-4 text-center">
                <p className="text-app-body-small-regular text-content-muted">{translate('app.noNotifications')}</p>
              </div>
            </PopoverPanel>
          </Popover>
          <Menu as="div" className="relative">
            <MenuButton
              as={IconButton}
              aria-label={`${initials(account.name)}, ${translate('app.accountMenu')}: ${account.name}`}
              variant="neutral"
              className="!shrink-0 !rounded-full !bg-surface"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-app-label-bold text-on-accent">{initials(account.name)}</span>
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              modal={false}
              transition
              className="z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-surface border border-line bg-surface p-2 shadow-popover outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 sm:w-72"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-app-body-small-bold text-on-accent">{initials(account.name)}</span>
                <div className="min-w-0">
                  <strong className="block truncate text-app-body-regular-semi-bold text-content">{account.name}</strong>
                  <span className="block truncate text-app-caption-regular text-content-muted">{account.email}</span>
                  <span className="mt-1 inline-flex rounded-full bg-accent-soft px-2 py-0.5 text-app-label-semi-bold capitalize text-accent-strong">{account.role}</span>
                </div>
              </div>
              {themeMode && onThemeToggle && <>
                <MenuSeparator className="my-1 border-t border-line" />
                <div role="group" aria-labelledby="account-appearance-label" className="px-1 pb-1 pt-2">
                  <p id="account-appearance-label" className="px-2 pb-1 text-app-label-semi-bold text-content-muted">{translate('app.appearance')}</p>
                  <MenuItem
                    as={Button}
                    type="button"
                    aria-current={themeMode === 'dark' ? 'true' : undefined}
                    variant="neutral"
                    className="!min-h-10 !w-full !justify-between !gap-3 !px-3 !py-2 !text-left !text-app-body-regular-medium !text-content data-focus:!bg-sidebar-hover"
                    onClick={onThemeToggle}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-content-muted">
                        <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.6 8.6 0 1 0 20.2 15.4Z" />
                      </svg>
                      {translate('app.darkMode')}
                    </span>
                    <span aria-hidden="true" className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${themeMode === 'dark' ? 'bg-action' : 'bg-line-strong'}`}>
                      <span className={`size-4 rounded-full bg-surface shadow-sm transition-transform ${themeMode === 'dark' ? 'translate-x-4' : ''}`} />
                    </span>
                  </MenuItem>
                </div>
              </>}
              <MenuSeparator className="my-1 border-t border-line" />
              <div role="group" aria-labelledby="account-language-label" className="px-1 pb-1 pt-2">
                <div className="flex items-center gap-2 px-2 pb-1">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-content-muted">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" />
                  </svg>
                  <p id="account-language-label" className="text-app-label-semi-bold text-content-muted">{translate('common.language')}</p>
                </div>
                <MenuItem
                  as={Button}
                  type="button"
                  aria-current={locale === 'id' ? 'true' : undefined}
                  variant="neutral"
                  className={`!min-h-10 !w-full !justify-between !gap-3 !px-3 !py-2 !text-left !text-app-body-regular-medium data-focus:!bg-sidebar-hover ${locale === 'id' ? '!text-app-body-regular-semi-bold !text-action' : '!text-content'}`}
                  onClick={() => setLocale('id')}
                >
                  {translate('common.indonesian')}
                  {locale === 'id' && <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m4 10 4 4 8-8" /></svg>}
                </MenuItem>
                <MenuItem
                  as={Button}
                  type="button"
                  aria-current={locale === 'en' ? 'true' : undefined}
                  variant="neutral"
                  className={`!min-h-10 !w-full !justify-between !gap-3 !px-3 !py-2 !text-left !text-app-body-regular-medium data-focus:!bg-sidebar-hover ${locale === 'en' ? '!text-app-body-regular-semi-bold !text-action' : '!text-content'}`}
                  onClick={() => setLocale('en')}
                >
                  {translate('common.english')}
                  {locale === 'en' && <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m4 10 4 4 8-8" /></svg>}
                </MenuItem>
              </div>
              <MenuSeparator className="my-1 border-t border-line" />
              <MenuItem
                as={Button}
                type="button"
                variant="neutral"
                className="!min-h-10 !w-full !justify-start !gap-3 !px-3 !py-2 !text-left !text-app-body-regular-medium !text-content data-focus:!bg-sidebar-hover"
                onClick={onAccountSelect}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5 text-content-muted"><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
                {translate('app.profile')}
              </MenuItem>
              <MenuItem
                as={Button}
                type="button"
                variant="quiet"
                className="!min-h-10 !w-full !justify-start !gap-3 !px-3 !py-2 !text-left !text-app-body-regular-medium data-focus:!bg-danger-soft"
                onClick={onLogoutRequest}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5"><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></svg>
                {translate('app.logout')}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  )
}
