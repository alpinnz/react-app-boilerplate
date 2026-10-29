import type { Page } from '@/shared/domain/page'
import type { Result } from '@/shared/domain/result'
import type { User } from '../entities/user'
import type { UserFailure } from '../failures/user.failure'
import type { UpdateUserInput } from '../values/update-user-input'

/** Parameter pagination untuk membaca daftar pengguna. */
export type GetUsersInput = { cursor: string | null }

/** Kontrak domain untuk membaca serta mengubah pengguna dan perannya. */
export interface UserRepository {
  getUsers(input: GetUsersInput, signal?: AbortSignal): Promise<Result<Page<User>, UserFailure>>
  getUser(id: string, signal?: AbortSignal): Promise<Result<User, UserFailure>>
  changeUserRole(userId: string, roleId: string, signal?: AbortSignal): Promise<Result<null, UserFailure>>
  updateUser(input: UpdateUserInput, signal?: AbortSignal): Promise<Result<User, UserFailure>>
  deleteUser(id: string, signal?: AbortSignal): Promise<Result<string, UserFailure>>
}
