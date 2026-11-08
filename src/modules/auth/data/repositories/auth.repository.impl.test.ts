import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HttpClient } from '@/infrastructure/http/http-client'
import { createAuthRepository } from './auth.repository.impl'

const accessToken = 'a'.repeat(43)
const refreshToken = 'b'.repeat(43)

function tokenResponse(tokens = { access_token: accessToken, refresh_token: refreshToken }) {
  return {
    code: 'success',
    data: {
      ...tokens, token_type: 'Bearer', expires_in: 900, refresh_expires_in: 86_400, user: { id: 'user-1' },
    },
  }
}

const sessionResponse = {
  code: 'success',
  data: { id: 'user-1', name: 'Alya', email: 'alya@example.test', role: { name: 'owner', level: 100 } },
}

afterEach(() => localStorage.clear())

describe('auth repository session persistence', () => {
  it('given successful login, when storing the session, then persists only the API token fields', async () => {
    const http: HttpClient = {
      request: vi.fn(async (path) => path === '/auth/login' ? tokenResponse() : sessionResponse),
    }
    const repository = createAuthRepository(http)

    await expect(repository.login({ email: ' alya@example.test ', password: 'Valid!Password1', rememberMe: true })).resolves.toEqual({
      ok: true, data: { userId: 'user-1', name: 'Alya', email: 'alya@example.test', role: { name: 'owner', level: 100 } },
    })

    expect(JSON.parse(localStorage.getItem('auth-session') ?? 'null')).toEqual({
      access_token: accessToken, refresh_token: refreshToken, token_type: 'Bearer', expires_in: 900, refresh_expires_in: 86_400,
    })
    expect(localStorage.getItem('react-app.auth.tokens')).toBeNull()
  })

  it('given a persisted session, when restoring it, then validates the stored access token with the API', async () => {
    localStorage.setItem('auth-session', JSON.stringify({
      access_token: accessToken, refresh_token: refreshToken, token_type: 'Bearer', expires_in: 900, refresh_expires_in: 86_400,
    }))
    const http: HttpClient = { request: vi.fn().mockResolvedValue(sessionResponse) }
    const repository = createAuthRepository(http)

    await expect(repository.restoreSession()).resolves.toEqual({
      ok: true, data: { userId: 'user-1', name: 'Alya', email: 'alya@example.test', role: { name: 'owner', level: 100 } },
    })

    expect(http.request).toHaveBeenCalledWith('/users/me', { signal: undefined, accessToken })
  })

  it('given valid legacy tokens, when restoring a session, then migrates them for the current runtime', async () => {
    const now = Date.now()
    localStorage.setItem('react-app.auth.tokens', JSON.stringify({
      accessToken, refreshToken, refreshAt: now + 60_000, refreshExpiresAt: now + 86_400_000,
    }))
    const http: HttpClient = { request: vi.fn().mockResolvedValue(sessionResponse) }
    const repository = createAuthRepository(http)

    await expect(repository.restoreSession()).resolves.toMatchObject({ ok: true, data: { userId: 'user-1' } })

    expect(http.request).toHaveBeenCalledWith('/users/me', { signal: undefined, accessToken })
  })

  it('given invalid or expired stored tokens, when restoring a session, then returns no session without a network call', async () => {
    localStorage.setItem('auth-session', JSON.stringify({ access_token: 'invalid' }))
    localStorage.setItem('react-app.auth.tokens', JSON.stringify({
      accessToken, refreshToken, refreshAt: Date.now() - 120_000, refreshExpiresAt: Date.now() - 1_000,
    }))
    const http: HttpClient = { request: vi.fn() }
    const repository = createAuthRepository(http)

    await expect(repository.restoreSession()).resolves.toBeNull()

    expect(http.request).not.toHaveBeenCalled()
  })
})
