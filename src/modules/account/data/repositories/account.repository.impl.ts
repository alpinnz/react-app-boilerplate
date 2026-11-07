import { createAuthorizedRequest } from '@/infrastructure/http/authorized-request'
import type { AccessTokenProvider, SessionInvalidationHandler } from '@/infrastructure/http/authorized-request'
import type { HttpClient } from '@/infrastructure/http/http-client'
import { mapOperationFailure } from '@/infrastructure/http/map-operation-failure'
import { assertResponseCode } from '@/infrastructure/http/response'
import type { AccountRepository } from '../../domain/repositories/account.repository'
import { parseAccountProfileResponse, parseAccountProfileUpdateResponse } from '../dto/account-profile.dto'
import { mapAccountProfile, mapAccountProfileUpdate } from '../mappers/account-profile.mapper'

/** Menghubungkan kontrak akun ke endpoint profil milik pengguna aktif. */
export function createAccountRepository(http: HttpClient, getAccessToken: AccessTokenProvider, onUnauthorized: SessionInvalidationHandler): AccountRepository {
  const request = createAuthorizedRequest(http, getAccessToken, onUnauthorized)
  return {
    async getProfile(signal) {
      try {
        const profileDto = parseAccountProfileResponse(await request('/users/me', { signal }))
        return { ok: true, data: mapAccountProfile(profileDto) }
      } catch (error) { return { ok: false, failure: mapOperationFailure(error) } }
    },
    async updateProfile(input, signal) {
      try {
        const profileDto = parseAccountProfileUpdateResponse(await request('/users/me', { method: 'PATCH', signal, body: {
          name: input.name, phone_number: input.phoneNumber, country_code: input.countryCode,
        } }))
        return { ok: true, data: mapAccountProfileUpdate(profileDto) }
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
