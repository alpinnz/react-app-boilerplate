import { createAuthorizedRequest } from '@/infrastructure/http/authorized-request'
import type { HttpClient } from '@/infrastructure/http/http-client'
import { mapOperationFailure } from '@/infrastructure/http/map-operation-failure'
import { assertResponseCode, isRecord, responseData } from '@/infrastructure/http/response'
import type { Role } from '../../domain/entities/role'
import type { RoleRepository } from '../../domain/repositories/role.repository'

function parseRole(value: unknown): Role {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string' ||
    !Number.isSafeInteger(value.level) || (value.level as number) < 1) throw new Error('invalidResponse')
  return { id: value.id, name: value.name, level: value.level as number }
}

/** Menghubungkan kontrak katalog peran ke endpoint API terautentikasi. */
export function createRoleRepository(http: HttpClient, getAccessToken: () => Promise<string>, onUnauthorized: () => void): RoleRepository {
  const request = createAuthorizedRequest(http, getAccessToken, onUnauthorized)
  return {
    async listRoles(signal) {
      try {
        const data = responseData(await request('/roles', { signal }), 'success')
        if (!isRecord(data) || !Array.isArray(data.items) || !Number.isSafeInteger(data.count)) throw new Error('invalidResponse')
        const roles = data.items.map(parseRole)
        if (roles.length !== data.count) throw new Error('invalidResponse')
        return { ok: true, data: roles }
      } catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async getRole(id, signal) {
      try { return { ok: true, data: parseRole(responseData(await request(`/roles/${encodeURIComponent(id)}`, { signal }), 'success')) } }
      catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async createRole(input, signal) {
      try { return { ok: true, data: parseRole(responseData(await request('/roles', { method: 'POST', body: input, signal }), 'created')) } }
      catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async updateRole(id, input, signal) {
      try { return { ok: true, data: parseRole(responseData(await request(`/roles/${encodeURIComponent(id)}`, { method: 'PATCH', body: input, signal }), 'updated')) } }
      catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async deleteRole(id, signal) {
      try {
        assertResponseCode(await request(`/roles/${encodeURIComponent(id)}`, { method: 'DELETE', signal }), 'deleted')
        return { ok: true, data: null }
      } catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
  }
}
