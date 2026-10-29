import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LocalizationProvider } from '@valfuse-node/react'
import localization from './app/localization/generated/localization.manifest.json'
import { getRequestLanguage, localeStorage } from './app/localization/locale'
import { AppRouter } from './app/router/AppRouter'
import { apiBaseUrl } from './config/env'
import { createHttpClient } from './infrastructure/http/http-client'
import { createAccountDependencies } from './modules/account'
import { createAuthDependencies, SessionProvider } from './modules/auth'
import { createHealthDependencies } from './modules/health'
import { createRoleDependencies } from './modules/roles'
import { createUsersDependencies } from './modules/users'

/**
 * Creates the application dependency graph once and provides it to the router.
 * Keeping infrastructure composition here prevents modules from importing
 * one another's implementations directly.
 */
const http = createHttpClient(apiBaseUrl, fetch, getRequestLanguage)
const auth = createAuthDependencies(http)
const users = createUsersDependencies(http, auth.getAccessToken, auth.invalidateSession)
const account = createAccountDependencies(http, auth.getAccessToken, auth.invalidateSession)
const roles = createRoleDependencies(http, auth.getAccessToken, auth.invalidateSession)
const getHealth = createHealthDependencies(http)
// useBlocker needs a data router; module routes remain composed by AppRouter.
const router = createBrowserRouter([{ path: '*', element: <AppRouter auth={auth} users={users} account={account} roles={roles} getHealth={getHealth} /> }])

function App() {
  return (
    <LocalizationProvider manifest={localization} storage={localeStorage} initialLocale="id">
      <SessionProvider login={auth.login} logout={auth.logout} subscribeSessionInvalidated={auth.subscribeSessionInvalidated}>
        <RouterProvider router={router} />
      </SessionProvider>
    </LocalizationProvider>
  )
}

export default App
