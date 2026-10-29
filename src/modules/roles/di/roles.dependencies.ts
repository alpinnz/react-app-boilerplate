import { createRoleRepository } from '@/modules/roles/data/repositories/role.repository.impl'
import { createRoleUseCases } from '@/modules/roles/domain/usecases/role.usecases'
import type { HttpClient } from '@/infrastructure/http/http-client'

/**
 * Creates role operations backed by the shared HTTP client.
 *
 * @param http - Shared HTTP client used by role data adapters.
 * @param getAccessToken - Reads the current access token for protected requests.
 * @param onUnauthorized - Invalidates the active session after an unauthorized response.
 * @returns Role operations ready for app-level composition.
 */
export function createRoleDependencies(http: HttpClient, getAccessToken: () => Promise<string>, onUnauthorized: () => void) {
  return createRoleUseCases(createRoleRepository(http, getAccessToken, onUnauthorized))
}
