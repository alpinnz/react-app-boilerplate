import { useContext, useEffect } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from 'zustand'
import { appBrand } from '@/config/brand'
import { SessionContext } from '@/modules/auth'
import { accountRoutePaths } from '@/modules/account'
import { rolesRoutePaths } from '@/modules/roles'
import { userPermissionLevels, usersRoutePaths } from '@/modules/users'
import { SideNavigation, SideNavigationItem } from '@/shared/presentation/ui/organisms/SideNavigation'

/** Menyaring navigasi menurut level peran dan menutup menu setelah berpindah route. */
export function AuthenticatedSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { translate } = useLocalization()
  const navigationLinks = [
    { to: accountRoutePaths.account, label: translate('account.account'), icon: 'account' as const, minimumRoleLevel: 0 },
    { to: usersRoutePaths.list, label: translate('users.users'), icon: 'users' as const, minimumRoleLevel: userPermissionLevels.viewUsers },
    { to: rolesRoutePaths.list, label: translate('roles.rolesAccess'), icon: 'roles' as const, minimumRoleLevel: 0 },
  ]
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  const session = useStore(store, (state) => state.session.data)
  const location = useLocation()

  useEffect(() => { onClose() }, [location.pathname, onClose])

  return <SideNavigation isOpen={isOpen} onClose={onClose} brandName={appBrand.name} brandDescription={appBrand.description} brandMark={appBrand.mark}>
    {navigationLinks.filter((link) => !!session && session.role.level >= link.minimumRoleLevel).map((link) => <NavLink key={link.to} to={link.to} className="block rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
      {({ isActive }) => <SideNavigationItem icon={link.icon} isActive={isActive}>{link.label}</SideNavigationItem>}
    </NavLink>)}
  </SideNavigation>
}
