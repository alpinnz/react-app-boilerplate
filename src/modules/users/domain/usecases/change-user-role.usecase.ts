import type { UserRepository } from '../repositories/user.repository'

/** Membuat operasi untuk menetapkan peran baru pada pengguna. */
export function createChangeUserRole(repository: UserRepository) {
  return (userId: string, roleId: string, signal?: AbortSignal) => repository.changeUserRole(userId, roleId, signal)
}

/** Tipe operasi perubahan peran yang dipasok ke presentation. */
export type ChangeUserRole = ReturnType<typeof createChangeUserRole>
