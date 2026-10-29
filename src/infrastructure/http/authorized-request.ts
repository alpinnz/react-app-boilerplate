import { HttpError, type HttpClient } from './http-client'

/**
 * Membuat request terautentikasi dan memberi tahu pemilik session saat menerima 401.
 *
 * @param http - Client transport bersama.
 * @param getAccessToken - Sumber access token aktif.
 * @param onUnauthorized - Callback invalidasi session pada respons 401.
 * @returns Fungsi request yang menambahkan token tanpa menyimpan state autentikasi.
 */
export function createAuthorizedRequest(http: HttpClient, getAccessToken: () => Promise<string>, onUnauthorized: () => void) {
  return async (path: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; signal?: AbortSignal } = {}) => {
    try {
      const accessToken = await getAccessToken()
      return await http.request(path, { ...options, accessToken })
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) onUnauthorized()
      throw error
    }
  }
}
