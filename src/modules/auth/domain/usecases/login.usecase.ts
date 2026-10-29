import type { AuthRepository, LoginInput } from '../repositories/auth.repository'

/** Membuat operasi login yang bergantung pada kontrak autentikasi domain. */
export function createLogin(repository: AuthRepository) {
  return (input: LoginInput, signal?: AbortSignal) => repository.login(input, signal)
}

/** Tipe fungsi login yang digunakan store session. */
export type Login = ReturnType<typeof createLogin>
