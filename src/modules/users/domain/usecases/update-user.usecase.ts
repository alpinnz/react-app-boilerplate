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
    if (!input.id || !name || name.length > 100 || (phoneNumber?.length ?? 0) > 20 || (countryCode?.length ?? 0) > 5) {
      return Promise.resolve({ ok: false, failure: { kind: 'invalidInput', message: 'Isi nama dan nomor telepon yang valid.' } })
    }
    return repository.updateUser({ id: input.id, name, phoneNumber, countryCode }, signal)
  }
}

/** Tipe operasi perubahan profil pengguna. */
export type UpdateUser = ReturnType<typeof createUpdateUser>
