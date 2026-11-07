import type { AuthRepository } from '../repositories/auth.repository'

/** Restores an existing session from the browser's persisted authentication tokens. */
export function createRestoreSession(repository: AuthRepository) {
  return (signal?: AbortSignal) => repository.restoreSession(signal)
}

/** Tipe operasi pemulihan session yang digunakan app. */
export type RestoreSession = ReturnType<typeof createRestoreSession>
