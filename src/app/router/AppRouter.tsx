import { useContext } from 'react'
import { Navigate, Outlet, useRoutes, useSearchParams } from 'react-router-dom'
import { useStore } from 'zustand'
import { accountRoutePaths, createAccountRoutes, type AccountSessionEndReason, type AccountUseCases } from '@/modules/account'
import { authRoutePaths, createAuthRoutes, SessionContext, type RegistrationUseCases } from '@/modules/auth'
import { createHealthRoutes, type GetHealth } from '@/modules/health'
import { createOnboardingRoutes } from '@/modules/onboarding'
import { createRolesRoutes, type RoleUseCases } from '@/modules/roles'
import { createUsersRoutes, userPermissionLevels, usersRoutePaths, type UsersDependencies } from '@/modules/users'
import { appBrand } from '@/config/brand'
import { LanguageSwitcher } from '../localization/LanguageSwitcher'
import { ThemeToggleButton } from '../theme/ThemeToggleButton'
import { AppTemplate } from '../templates/AppTemplate'
import { AuthTemplate } from '../templates/AuthTemplate'
import { PageFrame } from '../templates/PageFrame'
import { PageShell } from '../templates/PageShell'
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
  const sessionState = useStore(sessionStore, (state) => state.session)

  if (sessionState.status.type === 'loading') {
    return <AuthTemplate><div role="status" aria-live="polite">Memulihkan sesi…</div></AuthTemplate>
  }

  if (sessionState.data) {
    const session = sessionState.data
    const landingPath = session.role.level >= userPermissionLevels.viewUsers
      ? usersRoutePaths.list
      : accountRoutePaths.account

    return <Navigate to={landingPath} replace />
  }

  return <AuthTemplate><Outlet /></AuthTemplate>
}

/** Composition root route: menggabungkan public API modul dan layout aplikasi. */
export function AppRouter({ auth, users, account, roles, getHealth }: RouterDependencies) {
  const sessionStore = useSessionStore()
  const session = useStore(sessionStore, (state) => state.session.data)
  const renameSession = useStore(sessionStore, (state) => state.rename)
  const invalidateSession = useStore(sessionStore, (state) => state.invalidate)
  const [searchParams] = useSearchParams()
  const loginNotice = searchParams.has('passwordChanged') ? 'passwordChanged'
    : searchParams.has('deactivated') ? 'deactivated' : null

  function endSession(reason: AccountSessionEndReason) {
    invalidateSession()
    // A full navigation keeps the notice URL intact while clearing the in-memory session.
    window.location.replace(`${authRoutePaths.login}?${reason}=1`)
  }

  const healthRoutes = createHealthRoutes(getHealth, !!session).map((route) => ({
    ...route,
    element: session
      ? <AppTemplate>{route.element}</AppTemplate>
      : <AuthTemplate variant="standalone">{route.element}</AuthTemplate>,
  }))
  const authenticatedLandingPath = session
    ? session.role.level >= userPermissionLevels.viewUsers ? usersRoutePaths.list : accountRoutePaths.account
    : null
  const onboardingRoutes = createOnboardingRoutes({
    brandName: appBrand.name,
    brandMark: appBrand.mark,
    languageSwitcher: <div className="flex items-center gap-2"><ThemeToggleButton /><LanguageSwitcher /></div>,
  }).map((route) => ({
    ...route,
    element: authenticatedLandingPath
      ? <Navigate to={authenticatedLandingPath} replace />
      : <PageFrame variant="onboarding"><PageShell className="mx-auto my-auto w-full max-w-6xl overflow-hidden">{route.element}</PageShell></PageFrame>,
  }))

  return useRoutes([
    ...onboardingRoutes,
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
