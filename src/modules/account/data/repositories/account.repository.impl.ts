import { createAuthorizedRequest } from '@/infrastructure/http/authorized-request'
import type { HttpClient } from '@/infrastructure/http/http-client'
import { mapOperationFailure } from '@/infrastructure/http/map-operation-failure'
import { assertResponseCode, isRecord, responseData } from '@/infrastructure/http/response'
import type { AccountProfile } from '../../domain/entities/account-profile'
import type { AccountRepository } from '../../domain/repositories/account.repository'

function parseProfile(payload: unknown): AccountProfile {
  const data = responseData(payload, 'success')
  if (!isRecord(data) || typeof data.id !== 'string' || typeof data.name !== 'string' || typeof data.email !== 'string' ||
    !(typeof data.phone_number === 'string' || data.phone_number === null) ||
    !(typeof data.country_code === 'string' || data.country_code === null) || !isRecord(data.role) ||
    typeof data.role.id !== 'string' || typeof data.role.name !== 'string' ||
    !Number.isSafeInteger(data.role.level)) throw new Error('invalidResponse')
  return {
    id: data.id, name: data.name, email: data.email,
    phoneNumber: data.phone_number, countryCode: data.country_code,
    role: { id: data.role.id, name: data.role.name, level: data.role.level as number },
  }
}

/** Menghubungkan kontrak akun ke endpoint profil milik pengguna aktif. */
export function createAccountRepository(http: HttpClient, getAccessToken: () => Promise<string>, onUnauthorized: () => void): AccountRepository {
  const request = createAuthorizedRequest(http, getAccessToken, onUnauthorized)
  return {
    async getProfile(signal) {
      try { return { ok: true, data: parseProfile(await request('/users/me', { signal })) } }
      catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async updateProfile(input, signal) {
      try {
        const data = responseData(await request('/users/me', { method: 'PATCH', signal, body: {
          name: input.name, phone_number: input.phoneNumber, country_code: input.countryCode,
        } }), 'updated')
        if (!isRecord(data) || typeof data.name !== 'string' ||
          !(typeof data.phone_number === 'string' || data.phone_number === null) ||
          !(typeof data.country_code === 'string' || data.country_code === null)) throw new Error('invalidResponse')
        return { ok: true, data: { name: data.name, phoneNumber: data.phone_number, countryCode: data.country_code } }
      } catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async changePassword(input, signal) {
      try {
        assertResponseCode(await request('/users/me/password', { method: 'PUT', signal, body: {
          current_password: input.currentPassword, new_password: input.newPassword, confirm_new_password: input.confirmNewPassword,
        } }), 'updated')
        return { ok: true, data: null }
      } catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async deactivateAccount(currentPassword, signal) {
      try {
        assertResponseCode(await request('/users/me', { method: 'DELETE', signal, body: { current_password: currentPassword } }), 'deleted')
        return { ok: true, data: null }
      } catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
  }
}
