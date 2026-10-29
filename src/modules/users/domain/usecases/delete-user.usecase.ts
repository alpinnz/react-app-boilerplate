import type { UserRepository } from '../repositories/user.repository'

/** Membuat operasi penonaktifan/penghapusan pengguna melalui repository. */
export function createDeleteUser(repository: UserRepository) {
  return (id: string, signal?: AbortSignal) => repository.deleteUser(id, signal)
}

/** Tipe operasi penghapusan pengguna yang dipasok ke presentation. */
export type DeleteUser = ReturnType<typeof createDeleteUser>
