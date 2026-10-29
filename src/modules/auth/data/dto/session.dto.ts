import type { Session } from '../../domain/entities/session'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Memvalidasi envelope token dan menghitung waktu refresh sebelum token kedaluwarsa. */
export function parseTokenResponse(payload: unknown) {
  if (!isRecord(payload) || payload.code !== 'success' || !isRecord(payload.data)) throw new Error('invalidResponse')
  const data = payload.data
  const tokenPattern = /^[A-Za-z0-9_-]{43}$/
  if (typeof data.access_token !== 'string' || !tokenPattern.test(data.access_token) ||
      typeof data.refresh_token !== 'string' || !tokenPattern.test(data.refresh_token) ||
      data.token_type !== 'Bearer' || typeof data.expires_in !== 'number' || data.expires_in <= 0 ||
      typeof data.refresh_expires_in !== 'number' || data.refresh_expires_in <= 0 ||
      !isRecord(data.user) || typeof data.user.id !== 'string') throw new Error('invalidResponse')
  const now = Date.now()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    refreshAt: now + data.expires_in * 1000 - Math.min(30_000, data.expires_in * 500),
    refreshExpiresAt: now + data.refresh_expires_in * 1000,
    userId: data.user.id,
  }
}

/** Memvalidasi dan memetakan identitas pengguna aktif dari envelope API. */
export function parseSessionResponse(payload: unknown): Session {
  if (!isRecord(payload) || payload.code !== 'success' || !isRecord(payload.data)) throw new Error('invalidResponse')
  const data = payload.data
  if (typeof data.id !== 'string' || typeof data.name !== 'string' || typeof data.email !== 'string' ||
      !isRecord(data.role) || typeof data.role.name !== 'string' ||
      typeof data.role.level !== 'number' || !Number.isSafeInteger(data.role.level)) {
    throw new Error('invalidResponse')
  }
  return { userId: data.id, name: data.name, email: data.email, role: { name: data.role.name, level: data.role.level } }
}
