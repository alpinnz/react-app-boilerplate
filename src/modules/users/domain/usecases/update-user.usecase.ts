import type { Result } from '@/shared/domain/result'
import type { User } from '../entities/user'
import type { UserFailure } from '../failures/user.failure'
import type { UserRepository } from '../repositories/user.repository'
import type { UpdateUserInput } from '../values/update-user-input'

/**
 * Membuat operasi perubahan profil pengguna dengan normalisasi dan validasi field.
 *
 * @param repository - Kontrak domain untuk memperbarui pengguna.
 * @returns Operasi yang mengembalikan pengguna terbaru atau kegagalan domain.
 */
export function createUpdateUser(repository: UserRepository) {
  return (input: UpdateUserInput, signal?: AbortSignal): Promise<Result<User, UserFailure>> => {
    const name = input.name.trim()
    const phoneNumber = input.phoneNumber?.trim() || null
    const countryCode = input.countryCode?.trim() || null
    const fieldErrors: Record<string, string> = {}
    if (!name || name.length > 100) fieldErrors.name = 'Nama wajib diisi dan maksimal 100 karakter.'
    if ((phoneNumber?.length ?? 0) > 20) fieldErrors.phoneNumber = 'Nomor telepon maksimal 20 karakter.'
    if ((countryCode?.length ?? 0) > 5) fieldErrors.countryCode = 'Kode negara maksimal 5 karakter.'
    if (!input.id || Object.keys(fieldErrors).length) {
      return Promise.resolve({ ok: false, failure: { kind: 'invalidInput', message: 'Isi nama dan nomor telepon yang valid.', fieldErrors } })
    }
    return repository.updateUser({ id: input.id, name, phoneNumber, countryCode }, signal)
  }
}

/** Tipe operasi perubahan profil pengguna. */
export type UpdateUser = ReturnType<typeof createUpdateUser>
