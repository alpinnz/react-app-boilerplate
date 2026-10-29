import type { UserRepository } from '../repositories/user.repository'

/** Membuat operasi untuk memuat satu pengguna berdasarkan ID. */
export function createGetUser(repository: UserRepository) {
  return (id: string, signal?: AbortSignal) => repository.getUser(id, signal)
}

/** Tipe operasi pembacaan detail pengguna. */
export type GetUser = ReturnType<typeof createGetUser>
