import type { OperationFailure } from '@/shared/domain/operation-failure'
import type { Result } from '@/shared/domain/result'

/** Role option that the current actor may assign to another user. */
export type AssignableRole = { id: string; name: string; level: number }

/** Loads role options available to the current actor. */
export type ListAssignableRoles = (signal?: AbortSignal) => Promise<Result<AssignableRole[], OperationFailure>>
