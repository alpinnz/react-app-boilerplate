import { useContext, useState } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
import { appBrand } from '@/config/brand'
import { authRoutePaths, SessionContext } from '@/modules/auth'
import { accountRoutePaths } from '@/modules/account'
import { healthRoutePaths } from '@/modules/health'
import { rolesRoutePaths } from '@/modules/roles'
import { usersRoutePaths } from '@/modules/users'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { Hyperlink } from '@/shared/presentation/ui/atoms/Hyperlink'
import { TopNavigation } from '@/shared/presentation/ui/organisms/TopNavigation'
import type { BreadcrumbEntry } from '@/shared/presentation/ui/molecules/Breadcrumbs'
import { useFailureToast, useToast } from '@/shared/presentation/ui/organisms/useToast'
import { useThemePreference } from '../theme/theme'

/** Menghubungkan navigasi akun dengan session, route, dan konfirmasi logout. */
export function AuthenticatedHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { translate } = useLocalization()
  const { showToast } = useToast()
  const showFailureToast = useFailureToast()
  const { mode: themeMode, toggleMode: onThemeToggle } = useThemePreference()
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  const session = useStore(store, (state) => state.session.data)
  const logout = useStore(store, (state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pageDetails: Array<{
    match: string
    title: string
    section: string
    parentBreadcrumb?: { label: string; to: string }
  }> = [
    {
      match: usersRoutePaths.detailPrefix,
      title: translate('users.userDetail'),
      section: translate('app.accessManagement'),
      parentBreadcrumb: { label: translate('users.users'), to: usersRoutePaths.list },
    },
    { match: usersRoutePaths.list, title: translate('users.userList'), section: translate('app.accessManagement') },
    { match: rolesRoutePaths.list, title: translate('roles.roles'), section: translate('app.accessManagement') },
    { match: accountRoutePaths.account, title: translate('account.account'), section: translate('app.settings') },
    { match: healthRoutePaths.status, title: translate('health.serviceStatus'), section: translate('app.system') },
  ]
  const page = pageDetails.find((entry) => location.pathname.startsWith(entry.match)) ?? {
    title: appBrand.name,
    section: appBrand.description,
    parentBreadcrumb: undefined,
  }
  const breadcrumbs: BreadcrumbEntry[] = [
    { id: 'section', content: page.section, hideBelowSm: !!page.parentBreadcrumb },
    ...(page.parentBreadcrumb ? [{
      id: 'parent',
      content: <Hyperlink to={page.parentBreadcrumb.to} className="!text-app-hyperlink-regular-regular">{page.parentBreadcrumb.label}</Hyperlink>,
    }] : []),
  ]

  async function confirmLogout() {
    setIsLoggingOut(true)
    const failure = await logout()
    if (failure) {
      showFailureToast(failure.message)
    } else {
      showToast({ tone: 'success', title: translate('app.logoutSuccessToastTitle'), description: translate('app.logoutSuccessToastDescription') })
    }
    navigate(authRoutePaths.login, { replace: true })
  }

  if (!session) return null

  return <>
    <TopNavigation
      title={page.title}
      breadcrumbs={breadcrumbs}
      account={{ name: session.name, email: session.email, role: session.role.name }}
      themeMode={themeMode}
      onThemeToggle={onThemeToggle}
      onMenuOpen={onMenuOpen}
      onAccountSelect={() => navigate(accountRoutePaths.account)}
      onLogoutRequest={() => setIsLogoutOpen(true)}
    />
    {isLogoutOpen && <ConfirmationDialog
      title={translate('app.logoutTitle')}
      description={translate('app.logoutDescription')}
      cancelLabel={translate('app.cancelLogout')}
      confirmLabel={isLoggingOut ? translate('app.loggingOut') : translate('app.confirmLogout')}
      isConfirming={isLoggingOut}
      onDismiss={() => setIsLogoutOpen(false)}
      onConfirm={() => void confirmLogout()}
    />}
  </>
}
