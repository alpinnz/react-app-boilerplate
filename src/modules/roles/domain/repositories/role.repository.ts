import type { Result } from '@/shared/domain/result'
import type { OperationFailure } from '@/shared/domain/operation-failure'
import type { Role } from '../entities/role'

/** Nama dan level yang dibutuhkan saat membuat atau mengubah peran. */
export type RoleInput = { name: string; level: number }

/** Kontrak domain untuk katalog dan administrasi peran. */
export interface RoleRepository {
  listRoles(signal?: AbortSignal): Promise<Result<Role[], OperationFailure>>
  getRole(id: string, signal?: AbortSignal): Promise<Result<Role, OperationFailure>>
  createRole(input: RoleInput, signal?: AbortSignal): Promise<Result<Role, OperationFailure>>
  updateRole(id: string, input: RoleInput, signal?: AbortSignal): Promise<Result<Role, OperationFailure>>
  deleteRole(id: string, signal?: AbortSignal): Promise<Result<null, OperationFailure>>
}
