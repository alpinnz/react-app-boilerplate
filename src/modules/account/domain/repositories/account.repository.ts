import type { Result } from '@/shared/domain/result'
import type { OperationFailure } from '@/shared/domain/operation-failure'
import type { AccountProfile } from '../entities/account-profile'

/** Field profil yang dapat diubah pemilik akun. */
export type AccountProfileInput = { name: string; phoneNumber: string | null; countryCode: string | null }
/** Field yang diperlukan untuk mengganti kata sandi akun. */
export type ChangePasswordInput = { currentPassword: string; newPassword: string; confirmNewPassword: string }

/** Kontrak domain untuk membaca dan mengubah profil serta status akun sendiri. */
export interface AccountRepository {
  getProfile(signal?: AbortSignal): Promise<Result<AccountProfile, OperationFailure>>
  updateProfile(input: AccountProfileInput, signal?: AbortSignal): Promise<Result<AccountProfileInput, OperationFailure>>
  changePassword(input: ChangePasswordInput, signal?: AbortSignal): Promise<Result<null, OperationFailure>>
  deactivateAccount(currentPassword: string, signal?: AbortSignal): Promise<Result<null, OperationFailure>>
}
