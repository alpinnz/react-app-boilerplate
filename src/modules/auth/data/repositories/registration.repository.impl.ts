import type { HttpClient } from '@/infrastructure/http/http-client'
import { mapOperationFailure } from '@/infrastructure/http/map-operation-failure'
import { isRecord, responseData } from '@/infrastructure/http/response'
import type { RegistrationRepository, RegistrationInput } from '../../domain/repositories/registration.repository'

/** Menghubungkan operasi registrasi dan pembuatan user ke endpoint backend. */
export function createRegistrationRepository(http: HttpClient): RegistrationRepository {
  async function submit(path: '/auth/register' | '/users', input: RegistrationInput, signal?: AbortSignal) {
    try {
      const data = responseData(await http.request(path, { method: 'POST', signal, body: {
        name: input.name, email: input.email, phone_number: input.phoneNumber, country_code: input.countryCode,
        password: input.password, confirm_password: input.confirmPassword,
      } }), 'created')
      if (!isRecord(data) || typeof data.id !== 'string') throw new Error('invalidResponse')
      return { ok: true as const, data: data.id }
    } catch (error) { return { ok: false as const, failure: mapOperationFailure(error) } }
  }
  return {
    register: (input, signal) => submit('/auth/register', input, signal),
    createUser: (input, signal) => submit('/users', input, signal),
  }
}
