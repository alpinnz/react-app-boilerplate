import type { AuthRepository } from '../repositories/auth.repository'

/** Membuat operasi logout melalui kontrak autentikasi domain. */
export function createLogout(repository: AuthRepository) {
  return () => repository.logout()
}

/** Tipe fungsi logout yang digunakan store session. */
export type Logout = ReturnType<typeof createLogout>
