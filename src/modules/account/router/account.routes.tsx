import type { RouteObject } from 'react-router-dom'
import type { AccountUseCases } from '../domain/usecases/account.usecases'
import type { AccountSessionEndReason } from '../presentation/pages/AccountPage'
import { AccountPage } from '../presentation/pages/AccountPage'

/** URL paths owned by the account module. */
export const accountRoutePaths = {
  account: '/account',
}

type AccountRouteDependencies = {
  operations: AccountUseCases
  onProfileNameChanged: (name: string) => void
  onSessionEnded: (reason: AccountSessionEndReason) => void
}

/**
 * Creates account routes with operations supplied by the application composition root.
 *
 * @param options - Account operations and callbacks for app-owned session effects.
 * @returns React Router route objects for account settings.
 */
export function createAccountRoutes(options: AccountRouteDependencies): RouteObject[] {
  const { operations, onProfileNameChanged, onSessionEnded } = options
  return [{
    path: accountRoutePaths.account,
    element: <AccountPage operations={operations} onProfileNameChanged={onProfileNameChanged} onSessionEnded={onSessionEnded} />,
  }]
}
