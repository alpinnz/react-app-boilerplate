import { HttpError, type HttpClient } from './http-client'

/** Shared auth callbacks injected by the application composition root. */
export type AccessTokenProvider = (forceRefresh?: boolean, rejectedAccessToken?: string) => Promise<string>
export type SessionInvalidationHandler = () => void

/**
 * Mengulang satu kali request terautentikasi setelah provider bersama memperbarui token.
 *
 * @param http - Client transport bersama.
 * @param getAccessToken - Provider bersama yang menahan request saat refresh berjalan.
 * @param onUnauthorized - Callback invalidasi session jika retry tetap ditolak.
 * @returns Fungsi request yang menambahkan token tanpa menyimpan state autentikasi.
 */
export function createAuthorizedRequest(
  http: HttpClient,
  getAccessToken: AccessTokenProvider,
  onUnauthorized: SessionInvalidationHandler,
) {
  return async (path: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; signal?: AbortSignal } = {}) => {
    const isUnauthorized = (error: unknown) => error instanceof HttpError && error.status === 401
    const isSessionTokenRejected = (error: unknown) => error instanceof HttpError && (
      error.status === 401 || error.status === 422 || error.kind === 'invalidResponse'
    ) || error instanceof Error && error.message === 'invalidResponse'

    const accessToken = await getAccessToken()

    try {
      return await http.request(path, { ...options, accessToken })
    } catch (requestError) {
      if (!isUnauthorized(requestError)) throw requestError

      let refreshedAccessToken: string
      try {
        refreshedAccessToken = await getAccessToken(true, accessToken)
      } catch (refreshError) {
        if (isSessionTokenRejected(refreshError)) throw requestError
        throw refreshError
      }

      try {
        return await http.request(path, { ...options, accessToken: refreshedAccessToken })
      } catch (retryError) {
        if (isUnauthorized(retryError)) onUnauthorized()
        throw retryError
      }
    }
  }
}
