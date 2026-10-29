/**
 * Public API for the signed-in user's profile and account settings.
 *
 * @packageDocumentation
 */

export { AccountPage } from './presentation/pages/AccountPage'
export type { AccountUseCases } from './domain/usecases/account.usecases'
export type { AccountSessionEndReason } from './presentation/pages/AccountPage'
export { createAccountDependencies } from './di/account.dependencies'
export { accountRoutePaths, createAccountRoutes } from './router/account.routes'
