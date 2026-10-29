import { useContext } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { Navigate, Outlet, useRoutes, useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'
import { accountRoutePaths, createAccountRoutes, type AccountSessionEndReason, type AccountUseCases } from '@/modules/account'
import { authRoutePaths, createAuthRoutes, SessionContext, type RegistrationUseCases } from '@/modules/auth'
import { createHealthRoutes, type GetHealth } from '@/modules/health'
import { createRolesRoutes, type RoleUseCases } from '@/modules/roles'
import { createUsersRoutes, userPermissionLevels, usersRoutePaths, type UsersDependencies } from '@/modules/users'
import { AppTemplate } from '../templates/AppTemplate'
import { AuthTemplate } from '../templates/AuthTemplate'
import { ProtectedRoute } from './ProtectedRoute'

type RouterDependencies = {
  auth: { registration: RegistrationUseCases }
  users: UsersDependencies
  account: AccountUseCases
  roles: RoleUseCases
  getHealth: GetHealth
}

function useSessionStore() {
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  return store
}

function AuthenticatedLayout() {
  return <ProtectedRoute><AppTemplate><Outlet /></AppTemplate></ProtectedRoute>
}

function PublicAuthLayout() {
  const sessionStore = useSessionStore()
  const session = useStore(sessionStore, (state) => state.session.data)

  if (session) {
    const landingPath = session.role.level >= userPermissionLevels.viewUsers
      ? usersRoutePaths.list
      : accountRoutePaths.account

    return <Navigate to={landingPath} replace />
  }

  return <AuthTemplate><Outlet /></AuthTemplate>
}

/** Composition root route: menggabungkan public API modul dan layout aplikasi. */
export function AppRouter({ auth, users, account, roles, getHealth }: RouterDependencies) {
  const { translate } = useLocalization()
  const sessionStore = useSessionStore()
  const session = useStore(sessionStore, (state) => state.session.data)
  const renameSession = useStore(sessionStore, (state) => state.rename)
  const invalidateSession = useStore(sessionStore, (state) => state.invalidate)
  const [searchParams] = useSearchParams()
  const loginNotice = searchParams.has('passwordChanged') ? translate('account.passwordChangedNotice')
    : searchParams.has('deactivated') ? translate('account.deactivatedNotice') : null

  function endSession(reason: AccountSessionEndReason) {
    invalidateSession()
    // A full navigation keeps the notice URL intact while clearing the in-memory session.
    window.location.replace(`${authRoutePaths.login}?${reason}=1`)
  }

  const healthRoutes = createHealthRoutes(getHealth).map((route) => ({
    ...route,
    element: session
      ? <AppTemplate>{route.element}</AppTemplate>
      : <AuthTemplate>{route.element}</AuthTemplate>,
  }))

  return useRoutes([
    {
      element: <PublicAuthLayout />,
      children: createAuthRoutes({
        registration: auth.registration,
        loginNotice,
      }),
    },
    {
      element: <AuthenticatedLayout />,
      children: [
        ...createAccountRoutes({ operations: account, onProfileNameChanged: renameSession, onSessionEnded: endSession }),
        ...createRolesRoutes({ operations: roles, actorLevel: session?.role.level ?? 0, currentUserId: session?.userId ?? '' }),
        ...createUsersRoutes({ users, listAssignableRoles: roles.listRoles, actorLevel: session?.role.level ?? 0, currentUserId: session?.userId ?? '' }),
      ],
    },
    ...healthRoutes,
    { path: '*', element: <Navigate to={accountRoutePaths.account} replace /> },
  ])
}
