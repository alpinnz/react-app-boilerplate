import { createAccountRepository } from '@/modules/account/data/repositories/account.repository.impl'
import { createAccountUseCases } from '@/modules/account/domain/usecases/account.usecases'
import type { AccessTokenProvider, SessionInvalidationHandler } from '@/infrastructure/http/authorized-request'
import type { HttpClient } from '@/infrastructure/http/http-client'

/**
 * Creates account operations backed by the shared HTTP client.
 *
 * @param http - Shared HTTP client used by account data adapters.
 * @param getAccessToken - Reads the current access token for protected requests.
 * @param onUnauthorized - Invalidates the active session after an unauthorized response.
 * @returns Account operations ready for app-level composition.
 */
export function createAccountDependencies(http: HttpClient, getAccessToken: AccessTokenProvider, onUnauthorized: SessionInvalidationHandler) {
  return createAccountUseCases(createAccountRepository(http, getAccessToken, onUnauthorized))
}
