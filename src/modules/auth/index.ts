/**
 * Public API for sign-in, registration, and session state.
 *
 * @packageDocumentation
 */

export { LoginPage } from './presentation/pages/login/LoginPage'
export { RegisterPage } from './presentation/pages/register/RegisterPage'
export type { RegistrationUseCases } from './domain/usecases/register.usecase'
export { SessionProvider } from './presentation/state/session/SessionProvider'
export { SessionContext } from './presentation/state/session/session.context'
export { createAuthDependencies } from './di/auth.dependencies'
export { authRoutePaths, createAuthRoutes } from './router/auth.routes'
export type { AuthRouteOptions } from './router/auth.routes'
