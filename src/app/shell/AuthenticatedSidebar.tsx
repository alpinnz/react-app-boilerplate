import { useContext, useEffect, useState } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from 'zustand'
import { appBrand } from '@/config/brand'
import { SessionContext } from '@/modules/auth'
import { healthRoutePaths } from '@/modules/health'
import { rolesRoutePaths } from '@/modules/roles'
import { userPermissionLevels, usersRoutePaths } from '@/modules/users'
import { SideNavigation, SideNavigationItem } from '@/shared/presentation/ui/organisms/SideNavigation'

/** Menyaring navigasi menurut level peran dan menutup menu setelah berpindah route. */
export function AuthenticatedSidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: { isOpen: boolean; isCollapsed: boolean; onClose: () => void; onToggleCollapse: () => void }) {
  const { translate } = useLocalization()
  const location = useLocation()
  const [searchState, setSearchState] = useState({ pathname: location.pathname, value: '' })
  const searchTerm = searchState.pathname === location.pathname ? searchState.value : ''
  const navigationSections = [
    {
      label: translate('app.accessManagement'),
      links: [
        { to: usersRoutePaths.list, label: translate('users.users'), icon: 'users' as const, minimumRoleLevel: userPermissionLevels.viewUsers },
        { to: rolesRoutePaths.list, label: translate('roles.rolesAccess'), icon: 'roles' as const, minimumRoleLevel: 0 },
      ],
    },
    {
      label: translate('app.system'),
      links: [{ to: healthRoutePaths.status, label: translate('health.serviceStatus'), icon: 'status' as const, minimumRoleLevel: 0 }],
    },
  ]
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  const session = useStore(store, (state) => state.session.data)

  useEffect(() => { onClose() }, [location.pathname, onClose])

  function updateSearchTerm(value: string) {
    setSearchState({ pathname: location.pathname, value })
  }

  function toggleNavigationWidth() {
    setSearchState({ pathname: location.pathname, value: '' })
    onToggleCollapse()
  }

  const searchPattern = searchTerm.trim().toLocaleLowerCase()
  const visibleSections = navigationSections.map((section) => {
    const sectionMatches = section.label.toLocaleLowerCase().includes(searchPattern)
    const links = section.links.filter((link) =>
      !!session && session.role.level >= link.minimumRoleLevel &&
      (!searchPattern || sectionMatches || link.label.toLocaleLowerCase().includes(searchPattern)),
    )
    return { ...section, links }
  }).filter((section) => section.links.length > 0)

  return <SideNavigation
    isOpen={isOpen}
    isCollapsed={isCollapsed}
    searchValue={searchTerm}
    onSearchChange={updateSearchTerm}
    onClose={onClose}
    onToggleCollapse={toggleNavigationWidth}
    brandName={appBrand.name}
    brandDescription={appBrand.description}
    brandMark={appBrand.mark}
  >
    {visibleSections.map((section, sectionIndex) => <section
      key={section.label}
      aria-label={section.label}
      className={sectionIndex === 0 ? '' : 'border-t border-line pt-3'}
    >
        <h2 className={isCollapsed ? 'mb-1 px-2 text-app-label-semi-bold text-content-muted lg:sr-only' : 'mb-1 px-2 text-app-label-semi-bold text-content-muted'}>{section.label}</h2>
        <div className="grid gap-field">
          {section.links.map((link) => <NavLink key={link.to} to={link.to} title={isCollapsed ? link.label : undefined} className="block rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            {({ isActive }) => <SideNavigationItem icon={link.icon} isActive={isActive} isCollapsed={isCollapsed}>{link.label}</SideNavigationItem>}
          </NavLink>)}
        </div>
      </section>)}
    {searchPattern && visibleSections.length === 0 && <p role="status" className="px-2 py-3 text-app-body-regular-regular text-content-muted">{translate('app.noNavigationMatches')}</p>}
  </SideNavigation>
}
