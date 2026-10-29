import type { Result } from '@/shared/domain/result'
import type { Session } from '../entities/session'
import type { AuthFailure } from '../failures/auth.failure'

/** Kredensial dan preferensi sesi yang dikirim saat login. */
export type LoginInput = { email: string; password: string; rememberMe: boolean }

/** Kontrak domain untuk autentikasi dan pengakhiran sesi. */
export interface AuthRepository {
  login(input: LoginInput, signal?: AbortSignal): Promise<Result<Session, AuthFailure>>
  logout(): Promise<Result<null, AuthFailure>>
}
