import { createAuthorizedRequest } from '@/infrastructure/http/authorized-request'
import type { HttpClient } from '@/infrastructure/http/http-client'
import type { UpdateUserInput } from '../../domain/values/update-user-input'
import { parseChangeRoleResponse, parseDeleteResponse, parseUserDetailsResponse, parseUserResponse, parseUsersResponse } from '../dto/user.dto'

/**
 * Membuat adapter endpoint pengguna dan memvalidasi setiap respons API.
 *
 * @param http - Client HTTP aplikasi.
 * @param getAccessToken - Sumber token untuk request yang memerlukan autentikasi.
 * @param onUnauthorized - Callback saat backend menolak access token.
 * @returns Operasi remote pengguna sebelum pemetaan ke entity domain.
 */
export function createUserRemoteDataSource(http: HttpClient, getAccessToken: () => Promise<string>, onUnauthorized: () => void) {
  const request = createAuthorizedRequest(http, getAccessToken, onUnauthorized)

  return {
    async getUsers(page: number, signal?: AbortSignal) {
      return parseUsersResponse(await request(`/users?page=${page}&limit=20`, { signal }))
    },
    async getUser(id: string, signal?: AbortSignal) {
      return parseUserDetailsResponse(await request(`/users/${encodeURIComponent(id)}`, { signal }))
    },
    async changeUserRole(userId: string, roleId: string, signal?: AbortSignal) {
      parseChangeRoleResponse(await request(`/users/${encodeURIComponent(userId)}/role`, {
        method: 'PATCH', body: { role_id: roleId }, signal,
      }), userId, roleId)
    },
    async updateUser(input: UpdateUserInput, signal?: AbortSignal) {
      return parseUserResponse(await request(`/users/${encodeURIComponent(input.id)}`, {
        method: 'PUT', signal,
        body: { name: input.name, phone_number: input.phoneNumber, country_code: input.countryCode },
      }))
    },
    async deleteUser(id: string, signal?: AbortSignal) {
      parseDeleteResponse(await request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE', signal }))
    },
  }
}

/** Kontrak operasi data source remote untuk repository pengguna. */
export type UserRemoteDataSource = ReturnType<typeof createUserRemoteDataSource>
