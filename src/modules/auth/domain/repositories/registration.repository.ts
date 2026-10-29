import type { Result } from '@/shared/domain/result'
import type { OperationFailure } from '@/shared/domain/operation-failure'

/** Data pendaftaran yang telah dinormalisasi untuk operasi registrasi/pembuatan user. */
export type RegistrationInput = {
  name: string
  email: string
  phoneNumber: string | null
  countryCode: string | null
  password: string
  confirmPassword: string
}

/** Kontrak domain untuk registrasi mandiri dan pembuatan akun oleh admin. */
export interface RegistrationRepository {
  register(input: RegistrationInput, signal?: AbortSignal): Promise<Result<string, OperationFailure>>
  createUser(input: RegistrationInput, signal?: AbortSignal): Promise<Result<string, OperationFailure>>
}
