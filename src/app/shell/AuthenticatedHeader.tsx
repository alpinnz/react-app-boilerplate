import { useContext, useState } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { LanguageSwitcher } from '../localization/LanguageSwitcher'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
import { appBrand } from '@/config/brand'
import { authRoutePaths, SessionContext } from '@/modules/auth'
import { accountRoutePaths } from '@/modules/account'
import { healthRoutePaths } from '@/modules/health'
import { rolesRoutePaths } from '@/modules/roles'
import { usersRoutePaths } from '@/modules/users'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { TopNavigation } from '@/shared/presentation/ui/organisms/TopNavigation'

/** Menghubungkan navigasi akun dengan session, route, dan konfirmasi logout. */
export function AuthenticatedHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { translate } = useLocalization()
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  const session = useStore(store, (state) => state.session.data)
  const logout = useStore(store, (state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pageDetails = [
    { match: usersRoutePaths.detailPrefix, title: translate('users.userDetail'), section: translate('app.accessManagement') },
    { match: usersRoutePaths.list, title: translate('users.users'), section: translate('app.accessManagement') },
    { match: rolesRoutePaths.list, title: translate('roles.rolesAccess'), section: translate('app.accessManagement') },
    { match: accountRoutePaths.account, title: translate('account.account'), section: translate('app.settings') },
    { match: healthRoutePaths.status, title: translate('health.serviceStatus'), section: translate('app.system') },
  ]
  const page = pageDetails.find((entry) => location.pathname.startsWith(entry.match)) ?? { title: 'Workspace', section: appBrand.name }

  async function confirmLogout() {
    setIsLoggingOut(true)
    await logout()
    navigate(authRoutePaths.login, { replace: true })
  }

  if (!session) return null

  return <>
    <TopNavigation
      section={page.section}
      title={page.title}
      endSlot={<LanguageSwitcher />}
      account={{ name: session.name, email: session.email, role: session.role.name }}
      onMenuOpen={onMenuOpen}
      onAccountSelect={() => navigate(accountRoutePaths.account)}
      onLogoutRequest={() => setIsLogoutOpen(true)}
    />
    {isLogoutOpen && <ConfirmationDialog
      title={translate('app.logoutTitle')}
      description={translate('app.logoutDescription')}
      cancelLabel={translate('common.cancel')}
      confirmLabel={isLoggingOut ? translate('app.loggingOut') : translate('app.confirmLogout')}
      isConfirming={isLoggingOut}
      onDismiss={() => setIsLogoutOpen(false)}
      onConfirm={() => void confirmLogout()}
    />}
  </>
}
