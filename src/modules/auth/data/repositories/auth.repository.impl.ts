import { HttpError, type HttpClient } from '@/infrastructure/http/http-client'
import { createAuthorizedRequest } from '@/infrastructure/http/authorized-request'
import type { AuthFailure } from '../../domain/failures/auth.failure'
import type { AuthRepository } from '../../domain/repositories/auth.repository'
import { parseSessionResponse, parseTokenResponse } from '../dto/session.dto'

function toAuthFailure(error: unknown): AuthFailure {
  if (error instanceof HttpError) {
    const failure = (kind: AuthFailure['kind'], fallback: string): AuthFailure => ({
      kind,
      message: error.serverMessage ?? fallback,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    })
    if (error.status === 401) return failure('unauthorized', 'Sesi berakhir. Silakan masuk lagi.')
    if (error.status === 422) {
      return { kind: 'invalidCredentials', message: 'Email atau kata sandi tidak cocok.' }
    }
    if (error.status === 429) {
      return { kind: 'rateLimited', message: 'Terlalu banyak percobaan masuk. Tunggu beberapa saat lalu coba lagi.' }
    }
    if (error.kind === 'network' || error.kind === 'timeout') return failure('network', 'Tidak dapat terhubung ke server. Coba lagi.')
    if (error.kind === 'invalidResponse') return failure('invalidResponse', 'Respons server tidak valid.')
    if (error.kind === 'http') return failure('unexpected', 'Operasi akun gagal. Coba lagi.')
  }
  if (error instanceof Error && error.message === 'invalidResponse') {
    return { kind: 'invalidResponse', message: 'Respons server tidak valid.' }
  }
  return { kind: 'unexpected', message: 'Operasi akun gagal. Coba lagi.' }
}

/** Runtime token state, including refresh deadlines that stay out of browser storage. */
type AuthTokens = Omit<ReturnType<typeof parseTokenResponse>, 'userId'> & { userId: string | null }
/** Identifies the token pair a failed request was sent with. */
type AuthSessionVersion = Pick<AuthTokens, 'accessToken' | 'refreshToken'>

/** Exact five-field JSON shape stored under `auth-session`. */
type PersistedAuthSession = {
  access_token: string
  refresh_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_expires_in: number
}

const AUTH_SESSION_STORAGE_KEY = 'auth-session'
const LEGACY_AUTH_TOKENS_STORAGE_KEY = 'react-app.auth.tokens'
const AUTH_SESSION_LOCK_NAME = 'react-app-auth-session'
const authTokenPattern = /^[A-Za-z0-9_-]{43}$/
let fallbackAuthSessionLock: Promise<void> = Promise.resolve()

/** Returns browser storage when the current environment exposes it. */
function getLocalStorage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

/** Serializes session mutations across tabs, with a same-tab queue as fallback. */
function withAuthSessionLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(AUTH_SESSION_LOCK_NAME, operation)
  }
  const pendingOperation = fallbackAuthSessionLock.then(operation, operation)
  fallbackAuthSessionLock = pendingOperation.then(() => undefined, () => undefined)
  return pendingOperation
}

/** Parses the stable five-field session format stored under `auth-session`. */
function parsePersistedAuthSession(serializedAuthSession: string): AuthTokens | null {
  try {
    const parsedAuthSession: unknown = JSON.parse(serializedAuthSession)
    if (typeof parsedAuthSession !== 'object' || parsedAuthSession === null || Array.isArray(parsedAuthSession)) return null
    const authSessionRecord = parsedAuthSession as Record<string, unknown>
    if (typeof authSessionRecord.access_token !== 'string' || !authTokenPattern.test(authSessionRecord.access_token) ||
        typeof authSessionRecord.refresh_token !== 'string' || !authTokenPattern.test(authSessionRecord.refresh_token) ||
        authSessionRecord.token_type !== 'Bearer' ||
        typeof authSessionRecord.expires_in !== 'number' || !Number.isFinite(authSessionRecord.expires_in) || authSessionRecord.expires_in <= 0 ||
        typeof authSessionRecord.refresh_expires_in !== 'number' || !Number.isFinite(authSessionRecord.refresh_expires_in) || authSessionRecord.refresh_expires_in <= 0) {
      return null
    }
    return {
      accessToken: authSessionRecord.access_token,
      refreshToken: authSessionRecord.refresh_token,
      expiresIn: authSessionRecord.expires_in,
      refreshExpiresIn: authSessionRecord.refresh_expires_in,
      refreshAt: Date.now() + authSessionRecord.expires_in * 1000 - Math.min(30_000, authSessionRecord.expires_in * 500),
      refreshExpiresAt: Date.now() + authSessionRecord.refresh_expires_in * 1000,
      userId: null,
    }
  } catch {
    return null
  }
}

/** Converts the previous internal storage shape to the current token session. */
function migrateLegacyAuthTokens(serializedLegacyTokens: string): AuthTokens | null {
  try {
    const parsedLegacyTokens: unknown = JSON.parse(serializedLegacyTokens)
    if (typeof parsedLegacyTokens !== 'object' || parsedLegacyTokens === null || Array.isArray(parsedLegacyTokens)) return null
    const legacyTokenRecord = parsedLegacyTokens as Record<string, unknown>
    if (typeof legacyTokenRecord.accessToken !== 'string' || !authTokenPattern.test(legacyTokenRecord.accessToken) ||
        typeof legacyTokenRecord.refreshToken !== 'string' || !authTokenPattern.test(legacyTokenRecord.refreshToken) ||
        typeof legacyTokenRecord.refreshAt !== 'number' || !Number.isFinite(legacyTokenRecord.refreshAt) ||
        typeof legacyTokenRecord.refreshExpiresAt !== 'number' || !Number.isFinite(legacyTokenRecord.refreshExpiresAt)) {
      return null
    }
    const refreshExpiresIn = Math.ceil((legacyTokenRecord.refreshExpiresAt - Date.now()) / 1000)
    if (refreshExpiresIn <= 0) return null
    return {
      accessToken: legacyTokenRecord.accessToken,
      refreshToken: legacyTokenRecord.refreshToken,
      expiresIn: Math.max(1, Math.ceil((legacyTokenRecord.refreshAt - Date.now()) / 1000)),
      refreshExpiresIn,
      refreshAt: legacyTokenRecord.refreshAt,
      refreshExpiresAt: legacyTokenRecord.refreshExpiresAt,
      userId: null,
    }
  } catch {
    return null
  }
}

/** Reads current or legacy session data without mutating shared storage. */
function loadPersistedAuthTokens(): AuthTokens | null {
  const storage = getLocalStorage()
  if (!storage) return null
  try {
    const serializedAuthSession = storage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (serializedAuthSession) {
      const authSession = parsePersistedAuthSession(serializedAuthSession)
      if (authSession) return authSession
    }

    const serializedLegacyTokens = storage.getItem(LEGACY_AUTH_TOKENS_STORAGE_KEY)
    if (!serializedLegacyTokens) return null
    return migrateLegacyAuthTokens(serializedLegacyTokens)
  } catch {
    return null
  }
}

/** Stores only the five API-compatible token fields, without client-only metadata. */
function persistAuthTokens(tokens: AuthTokens): boolean {
  const storage = getLocalStorage()
  if (!storage) return false
  const persistedAuthSession: PersistedAuthSession = {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    token_type: 'Bearer',
    expires_in: tokens.expiresIn,
    refresh_expires_in: tokens.refreshExpiresIn,
  }
  try {
    storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(persistedAuthSession))
    try { storage.removeItem(LEGACY_AUTH_TOKENS_STORAGE_KEY) } catch { /* The current key remains authoritative if legacy cleanup fails. */ }
    return true
  } catch {
    try { storage.removeItem(AUTH_SESSION_STORAGE_KEY) } catch { /* A failed write must not leave an older session as the apparent current session. */ }
    return false
  }
}

/** Clears current and legacy session keys when logout or token rejection ends the session. */
function clearPersistedAuthTokens() {
  const storage = getLocalStorage()
  if (!storage) return
  for (const storageKey of [AUTH_SESSION_STORAGE_KEY, LEGACY_AUTH_TOKENS_STORAGE_KEY]) {
    try { storage.removeItem(storageKey) } catch { /* Keep the active tab session if browser storage is unavailable. */ }
  }
}

/**
 * Membuat adapter autentikasi dengan token tersimpan di memori dan localStorage.
 * Refresh bersama dikunci per tab dan lintas tab; generation mencegah respons
 * lama menghidupkan kembali session yang telah dibatalkan.
 */
export function createAuthRepository(http: HttpClient): AuthRepository & {
  getAccessToken: (forceRefresh?: boolean, rejectedAccessToken?: string) => Promise<string>
  invalidateSession: () => void
  subscribeSessionInvalidated: (listener: () => void) => () => void
} {
  let tokens: AuthTokens | null = loadPersistedAuthTokens()
  let hasPersistedAuthSession = Boolean(tokens)
  let refreshPending: Promise<string> | null = null
  let sessionInvalidationPending: Promise<void> | null = null
  let generation = 0
  let sessionMutationPending = false
  let sessionMutationGeneration = 0
  let onSessionInvalidated: (() => void) | null = null

  function invalidateSession(expectedSession: AuthSessionVersion | null = tokens) {
    const latestPersistedTokens = loadPersistedAuthTokens()
    if (latestPersistedTokens && (!expectedSession ||
      latestPersistedTokens.accessToken !== expectedSession.accessToken ||
      latestPersistedTokens.refreshToken !== expectedSession.refreshToken)) {
      tokens = latestPersistedTokens
      hasPersistedAuthSession = true
      return
    }
    if (sessionInvalidationPending) return

    ++generation
    tokens = null
    hasPersistedAuthSession = false
    refreshPending = null
    const invalidation = withAuthSessionLock(async () => {
      const currentPersistedTokens = loadPersistedAuthTokens()
      const expectedSessionIsCurrent = expectedSession &&
        currentPersistedTokens?.accessToken === expectedSession.accessToken &&
        currentPersistedTokens.refreshToken === expectedSession.refreshToken
      if (currentPersistedTokens && !expectedSessionIsCurrent) {
        tokens = currentPersistedTokens
        hasPersistedAuthSession = true
        return
      }
      clearPersistedAuthTokens()
      onSessionInvalidated?.()
    }).finally(() => {
      if (sessionInvalidationPending === invalidation) sessionInvalidationPending = null
    })
    sessionInvalidationPending = invalidation
    void invalidation.catch(() => undefined)
  }

  async function refreshAuthTokens(rejectedAccessToken?: string): Promise<string> {
    if (!tokens) throw new HttpError('http', 401)
    if (!refreshPending) {
      const requestGeneration = generation
      const observedAccessToken = tokens.accessToken
      const observedRefreshToken = tokens.refreshToken
      const refreshRequest = withAuthSessionLock(async () => {
        if (requestGeneration !== generation || sessionMutationPending) throw new HttpError('aborted')

        const storage = getLocalStorage()
        const latestPersistedTokens = loadPersistedAuthTokens()
        if (latestPersistedTokens) {
          const anotherTabUpdatedSession = latestPersistedTokens.accessToken !== observedAccessToken ||
            latestPersistedTokens.refreshToken !== observedRefreshToken
          tokens = latestPersistedTokens
          hasPersistedAuthSession = true
          // Reuse a token rotated by another tab instead of rotating it again.
          if (anotherTabUpdatedSession && (!rejectedAccessToken || latestPersistedTokens.accessToken !== rejectedAccessToken)) {
            return latestPersistedTokens.accessToken
          }
        } else if (storage && hasPersistedAuthSession) {
          invalidateSession({ accessToken: observedAccessToken, refreshToken: observedRefreshToken })
          throw new HttpError('http', 401)
        }

        const currentTokens = tokens
        if (!currentTokens) throw new HttpError('http', 401)
        if (rejectedAccessToken && currentTokens.accessToken !== rejectedAccessToken) return currentTokens.accessToken

        return http.request('/auth/refresh-token', { method: 'POST', body: { refresh_token: currentTokens.refreshToken } })
          .then((payload) => {
            const refreshedTokens = parseTokenResponse(payload)
            if (requestGeneration !== generation) throw new HttpError('aborted')
            tokens = refreshedTokens
            hasPersistedAuthSession = persistAuthTokens(refreshedTokens)
            return refreshedTokens.accessToken
          }).catch((error: unknown) => {
            if (requestGeneration === generation && (
              error instanceof HttpError && (error.status === 401 || error.status === 422 || error.kind === 'invalidResponse') ||
              error instanceof Error && error.message === 'invalidResponse'
            )) invalidateSession(currentTokens)
            throw error
          })
        }).finally(() => { if (refreshPending === refreshRequest) refreshPending = null })
      refreshPending = refreshRequest
    }
    return refreshPending
  }

  async function getAccessToken(forceRefresh = false, rejectedAccessToken?: string): Promise<string> {
    if (sessionMutationPending) throw new HttpError('aborted')
    if (!tokens) throw new HttpError('http', 401)
    // Hold new authenticated requests while the shared refresh is in flight.
    if (refreshPending) return refreshPending
    if (tokens.refreshExpiresAt <= Date.now()) {
      invalidateSession(tokens)
      throw new HttpError('http', 401)
    }
    if (rejectedAccessToken && tokens.accessToken !== rejectedAccessToken) return tokens.accessToken
    if (!forceRefresh && Date.now() < tokens.refreshAt) return tokens.accessToken
    // Semua request yang tiba saat refresh aktif memakai promise yang sama.
    return refreshAuthTokens(rejectedAccessToken)
  }

  const sendAuthorizedRequest = createAuthorizedRequest(http, getAccessToken, invalidateSession)

  return {
    getAccessToken,
    invalidateSession,
    subscribeSessionInvalidated(listener) {
      onSessionInvalidated = listener
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key !== null && event.key !== AUTH_SESSION_STORAGE_KEY && event.key !== LEGACY_AUTH_TOKENS_STORAGE_KEY) return
        const latestPersistedTokens = loadPersistedAuthTokens()
        if (latestPersistedTokens) {
          tokens = latestPersistedTokens
          hasPersistedAuthSession = true
          return
        }
        if (tokens) invalidateSession(tokens)
        else hasPersistedAuthSession = false
      }
      if (typeof window !== 'undefined') window.addEventListener('storage', handleStorageChange)
      return () => {
        if (typeof window !== 'undefined') window.removeEventListener('storage', handleStorageChange)
        if (onSessionInvalidated === listener) onSessionInvalidated = null
      }
    },
    async restoreSession(signal) {
      if (!tokens) return null
      const requestGeneration = generation
      try {
        // Validate the stored access token first; the authorized request refreshes only after a 401.
        const session = parseSessionResponse(await sendAuthorizedRequest('/users/me', { signal }))
        if (requestGeneration !== generation || signal?.aborted) throw new HttpError('aborted')
        if (!tokens || tokens.userId && session.userId !== tokens.userId) throw new Error('invalidResponse')
        return { ok: true, data: session }
      } catch (error) {
        if (requestGeneration === generation && error instanceof Error && error.message === 'invalidResponse') invalidateSession()
        return { ok: false, failure: toAuthFailure(error) }
      }
    },
    async login(input, signal) {
      const mutationGeneration = ++sessionMutationGeneration
      sessionMutationPending = true
      try {
        await refreshPending?.catch(() => undefined)
        if (mutationGeneration !== sessionMutationGeneration || signal?.aborted) throw new HttpError('aborted')
        const requestGeneration = ++generation
        const session = await withAuthSessionLock(async () => {
          if (requestGeneration !== generation || mutationGeneration !== sessionMutationGeneration || signal?.aborted) {
            throw new HttpError('aborted')
          }
          const payload = await http.request('/auth/login', {
            method: 'POST', body: { email: input.email.trim(), password: input.password, remember_me: input.rememberMe }, signal,
          })
          const issuedTokens = parseTokenResponse(payload)
          if (requestGeneration !== generation || mutationGeneration !== sessionMutationGeneration || signal?.aborted) {
            throw new HttpError('aborted')
          }
          let sessionTokens = issuedTokens
          let userSession: ReturnType<typeof parseSessionResponse>
          try {
            userSession = parseSessionResponse(await http.request('/users/me', { accessToken: sessionTokens.accessToken, signal }))
          } catch (error) {
            if (!(error instanceof HttpError) || error.status !== 401) throw error
            if (requestGeneration !== generation || mutationGeneration !== sessionMutationGeneration || signal?.aborted) {
              throw new HttpError('aborted')
            }
            const refreshedPayload = await http.request('/auth/refresh-token', {
              method: 'POST', body: { refresh_token: sessionTokens.refreshToken }, signal,
            })
            sessionTokens = parseTokenResponse(refreshedPayload)
            if (requestGeneration !== generation || mutationGeneration !== sessionMutationGeneration || signal?.aborted) {
              throw new HttpError('aborted')
            }
            userSession = parseSessionResponse(await http.request('/users/me', { accessToken: sessionTokens.accessToken, signal }))
          }
          if (userSession.userId !== sessionTokens.userId) throw new Error('invalidResponse')
          if (requestGeneration !== generation || mutationGeneration !== sessionMutationGeneration || signal?.aborted) {
            throw new HttpError('aborted')
          }
          tokens = sessionTokens
          hasPersistedAuthSession = persistAuthTokens(sessionTokens)
          return userSession
        })
        return { ok: true, data: session }
      } catch (error) {
        return { ok: false, failure: toAuthFailure(error) }
      } finally {
        if (mutationGeneration === sessionMutationGeneration) sessionMutationPending = false
      }
    },
    async logout() {
      const mutationGeneration = ++sessionMutationGeneration
      sessionMutationPending = true
      try {
        await refreshPending?.catch(() => undefined)
        if (mutationGeneration !== sessionMutationGeneration) throw new HttpError('aborted')
        const requestGeneration = ++generation
        return await withAuthSessionLock(async () => {
          if (requestGeneration !== generation || mutationGeneration !== sessionMutationGeneration) throw new HttpError('aborted')
          const latestPersistedTokens = loadPersistedAuthTokens()
          if (latestPersistedTokens) {
            tokens = latestPersistedTokens
            hasPersistedAuthSession = true
          }
          const refreshToken = tokens?.refreshToken
          tokens = null
          hasPersistedAuthSession = false
          clearPersistedAuthTokens()
          if (refreshToken) await http.request('/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } })
          return { ok: true, data: null }
        })
      } catch (error) {
        return { ok: false, failure: toAuthFailure(error) }
      } finally {
        if (mutationGeneration === sessionMutationGeneration) sessionMutationPending = false
      }
    },
  }
}
