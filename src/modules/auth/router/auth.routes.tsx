import type { RouteObject } from 'react-router-dom'
import type { RegistrationUseCases } from '../domain/usecases/register.usecase'
import { LoginPage } from '../presentation/pages/login/LoginPage'
import { RegisterPage } from '../presentation/pages/register/RegisterPage'

/** URL paths owned by the auth module. */
export const authRoutePaths = {
  login: '/login',
  register: '/register',
}

/**
 * App-owned dependencies required to construct the authentication routes.
 */
export type AuthRouteOptions = {
  registration: RegistrationUseCases
  loginNotice: string | null
}

/**
 * Creates sign-in and registration routes.
 *
 * @param options - Registration operation and app-owned login navigation state.
 * @returns React Router route objects for public authentication pages.
 */
export function createAuthRoutes(options: AuthRouteOptions): RouteObject[] {
  const { registration, loginNotice } = options
  return [
    { path: authRoutePaths.login, element: <LoginPage notice={loginNotice} /> },
    { path: authRoutePaths.register, element: <RegisterPage register={registration.register} /> },
  ]
}
