import type { UserRepository, GetUsersInput } from '../repositories/user.repository'

/** Membuat operasi pagination daftar pengguna. */
export function createGetUsers(repository: UserRepository) {
  return (input: GetUsersInput, signal?: AbortSignal) => repository.getUsers(input, signal)
}

/** Tipe operasi pembacaan daftar pengguna. */
export type GetUsers = ReturnType<typeof createGetUsers>
