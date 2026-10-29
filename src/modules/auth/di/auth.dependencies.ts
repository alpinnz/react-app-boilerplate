import { createAuthRepository } from '@/modules/auth/data/repositories/auth.repository.impl'
import { createRegistrationRepository } from '@/modules/auth/data/repositories/registration.repository.impl'
import { createLogin } from '@/modules/auth/domain/usecases/login.usecase'
import { createLogout } from '@/modules/auth/domain/usecases/logout.usecase'
import { createRegistrationUseCases } from '@/modules/auth/domain/usecases/register.usecase'
import type { HttpClient } from '@/infrastructure/http/http-client'

/**
 * Creates authentication and registration operations from the shared HTTP client.
 *
 * @param http - HTTP client used by authentication data adapters.
 * @returns Session operations and token callbacks for app-level composition.
 */
export function createAuthDependencies(http: HttpClient) {
  const repository = createAuthRepository(http)
  return {
    login: createLogin(repository),
    logout: createLogout(repository),
    registration: createRegistrationUseCases(createRegistrationRepository(http)),
    getAccessToken: repository.getAccessToken,
    invalidateSession: repository.invalidateSession,
    subscribeSessionInvalidated: repository.subscribeSessionInvalidated,
  }
}
