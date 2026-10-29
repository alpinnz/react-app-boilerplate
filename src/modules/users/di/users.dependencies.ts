import { createUserRemoteDataSource } from '@/modules/users/data/datasources/user-remote.datasource'
import { createUserRepository } from '@/modules/users/data/repositories/user.repository.impl'
import { createDeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import { createChangeUserRole } from '@/modules/users/domain/usecases/change-user-role.usecase'
import { createGetUser } from '@/modules/users/domain/usecases/get-user.usecase'
import { createGetUsers } from '@/modules/users/domain/usecases/get-users.usecase'
import { createUpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import type { HttpClient } from '@/infrastructure/http/http-client'

/**
 * Creates user operations backed by the shared HTTP client.
 *
 * @param http - Shared HTTP client used by user data adapters.
 * @param getAccessToken - Reads the current access token for protected requests.
 * @param onUnauthorized - Invalidates the active session after an unauthorized response.
 * @returns User operations ready for route composition.
 */
export function createUsersDependencies(http: HttpClient, getAccessToken: () => Promise<string>, onUnauthorized: () => void) {
  const repository = createUserRepository(createUserRemoteDataSource(http, getAccessToken, onUnauthorized))
  return {
    getUsers: createGetUsers(repository),
    getUser: createGetUser(repository),
    changeUserRole: createChangeUserRole(repository),
    updateUser: createUpdateUser(repository),
    deleteUser: createDeleteUser(repository),
  }
}
