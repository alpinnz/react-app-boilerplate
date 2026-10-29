import { HttpError, type HttpClient } from '@/infrastructure/http/http-client'
import type { AuthFailure } from '../../domain/failures/auth.failure'
import type { AuthRepository } from '../../domain/repositories/auth.repository'
import { parseSessionResponse, parseTokenResponse } from '../dto/session.dto'

function toAuthFailure(error: unknown): AuthFailure {
  if (error instanceof HttpError) {
    if (error.status === 401) return { kind: 'unauthorized', message: 'Sesi berakhir. Silakan masuk lagi.' }
    if (error.status === 422) return { kind: 'invalidCredentials', message: 'Email atau kata sandi tidak cocok.' }
    if (error.status === 429) return { kind: 'rateLimited', message: 'Terlalu banyak percobaan masuk. Tunggu beberapa saat lalu coba lagi.' }
    if (error.kind === 'network' || error.kind === 'timeout') return { kind: 'network', message: 'Tidak dapat terhubung ke server. Coba lagi.' }
    if (error.kind === 'invalidResponse') return { kind: 'invalidResponse', message: 'Respons server tidak valid.' }
  }
  if (error instanceof Error && error.message === 'invalidResponse') {
    return { kind: 'invalidResponse', message: 'Respons server tidak valid.' }
  }
  return { kind: 'unexpected', message: 'Operasi akun gagal. Coba lagi.' }
}

type Tokens = ReturnType<typeof parseTokenResponse>

/**
 * Membuat adapter autentikasi dengan token hanya tersimpan di memori.
 * Refresh token dilakukan satu kali untuk request bersamaan; generation menjaga
 * hasil request lama tidak menghidupkan kembali session yang telah dibatalkan.
 */
export function createAuthRepository(http: HttpClient): AuthRepository & {
  getAccessToken: () => Promise<string>
  invalidateSession: () => void
  subscribeSessionInvalidated: (listener: () => void) => () => void
} {
  let tokens: Tokens | null = null
  let refreshPending: Promise<string> | null = null
  let generation = 0
  let onSessionInvalidated: (() => void) | null = null

  function invalidateSession() {
    ++generation
    tokens = null
    refreshPending = null
    onSessionInvalidated?.()
  }

  async function getAccessToken(): Promise<string> {
    if (!tokens) throw new HttpError('http', 401)
    if (tokens.refreshExpiresAt <= Date.now()) {
      invalidateSession()
      throw new HttpError('http', 401)
    }
    if (Date.now() < tokens.refreshAt) return tokens.accessToken
    // Semua request yang tiba saat refresh aktif memakai promise yang sama.
    if (!refreshPending) {
      const current = tokens
      const requestGeneration = generation
      const pending = http.request('/auth/refresh-token', { method: 'POST', body: { refresh_token: current.refreshToken } })
        .then((payload) => {
          const rotated = parseTokenResponse(payload)
          if (requestGeneration !== generation) throw new HttpError('aborted')
          tokens = rotated
          return rotated.accessToken
        }).catch((error: unknown) => {
          if (requestGeneration === generation && (
            error instanceof HttpError && (error.status === 401 || error.status === 422 || error.kind === 'invalidResponse') ||
            error instanceof Error && error.message === 'invalidResponse'
          )) {
            invalidateSession()
          }
          throw error
        }).finally(() => { if (refreshPending === pending) refreshPending = null })
      refreshPending = pending
    }
    return refreshPending
  }

  return {
    getAccessToken,
    invalidateSession,
    subscribeSessionInvalidated(listener) {
      onSessionInvalidated = listener
      return () => { if (onSessionInvalidated === listener) onSessionInvalidated = null }
    },
    async login(input, signal) {
      const requestGeneration = ++generation
      tokens = null
      refreshPending = null
      try {
        const payload = await http.request('/auth/login', {
          method: 'POST', body: { email: input.email.trim(), password: input.password, remember_me: input.rememberMe }, signal,
        })
        const issued = parseTokenResponse(payload)
        if (requestGeneration !== generation || signal?.aborted) throw new HttpError('aborted')
        tokens = issued
        const session = parseSessionResponse(await http.request('/users/me', { accessToken: issued.accessToken, signal }))
        if (session.userId !== issued.userId) throw new Error('invalidResponse')
        if (requestGeneration !== generation || signal?.aborted) throw new HttpError('aborted')
        return { ok: true, data: session }
      } catch (error) {
        if (requestGeneration === generation) tokens = null
        return { ok: false, failure: toAuthFailure(error) }
      }
    },
    async logout() {
      ++generation
      const refreshToken = tokens?.refreshToken
      tokens = null
      refreshPending = null
      if (!refreshToken) return { ok: true, data: null }
      try {
        await http.request('/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } })
        return { ok: true, data: null }
      } catch (error) {
        return { ok: false, failure: toAuthFailure(error) }
      }
    },
  }
}
