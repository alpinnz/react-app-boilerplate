import { createServer, type Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createHttpClient } from '../src/infrastructure/http/http-client'
import { createAuthRepository } from '../src/modules/auth/data/repositories/auth.repository.impl'
import { createUserRemoteDataSource } from '../src/modules/users/data/datasources/user-remote.datasource'
import { createUserRepository } from '../src/modules/users/data/repositories/user.repository.impl'
import { createUpdateUser } from '../src/modules/users/domain/usecases/update-user.usecase'

const userId = '01a17aa8-1c00-7007-8107-100000000007'
const targetId = '01a17aa8-1c00-700b-810b-10000000000b'
const user = {
  id: targetId, name: 'Alya', email: 'alya@example.test', role_id: '01a17aa8-1c00-7001-8101-100000000001',
  phone_number: null, country_code: null, created_at: '2026-10-28T00:00:00.000Z', updated_at: '2026-10-28T00:00:00.000Z',
}
const meta = { request_id: '01a17aa8-1c00-700a-810a-10000000000a' }
const tokenPayload = {
  access_token: 'a'.repeat(43), refresh_token: 'b'.repeat(43), token_type: 'Bearer',
  expires_in: 900, refresh_expires_in: 86400, user: { id: userId },
}

describe('API contract integration over HTTP', () => {
  let server: Server
  let baseUrl: string
  const requests: { method: string; path: string; body: unknown; language: string | undefined }[] = []

  beforeAll(async () => {
    server = createServer(async (request, response) => {
      const path = request.url ?? ''
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(chunk as Buffer)
      const bodyText = Buffer.concat(chunks).toString()
      const body = bodyText ? JSON.parse(bodyText) as unknown : null
      requests.push({ method: request.method ?? '', path, body, language: request.headers['accept-language'] })
      response.setHeader('Content-Type', 'application/json')
      const send = (status: number, payload: unknown) => { response.statusCode = status; response.end(JSON.stringify(payload)) }

      if (path === '/api/v1/auth/login' && request.method === 'POST') {
        if (body && typeof body === 'object' && 'email' in body && body.email === 'limited@example.test') {
          return send(429, { message: 'too many requests', code: 'too_many_requests', meta })
        }
        if (body && typeof body === 'object' && 'password' in body && body.password === 'wrongpass') {
          return send(422, { message: 'invalid', code: 'validation_error', errors: [{ field: 'email', location: 'body', code: 'invalid', message: 'invalid' }], meta })
        }
        const expiresIn = body && typeof body === 'object' && 'email' in body && body.email === 'short@example.test' ? 1 : 900
        return send(200, { message: 'success', code: 'success', data: { ...tokenPayload, expires_in: expiresIn }, meta })
      }
      if (path === '/api/v1/auth/refresh-token') return send(422, { message: 'invalid', code: 'validation_error', meta })
      if (path === '/api/v1/users/me') {
        if (request.headers.authorization !== `Bearer ${tokenPayload.access_token}`) return send(401, { message: 'unauthorized', code: 'unauthorized', meta })
        return send(200, { message: 'success', code: 'success', data: {
          ...user, id: userId, name: 'Owner', email: 'owner@example.test',
          role: { id: '01a17aa8-1c00-7001-8101-100000000001', name: 'owner', level: 100 },
        }, meta })
      }
      if (path === '/api/v1/users?page=1&limit=20') {
        return send(200, { message: 'success', code: 'success', data: { items: [user], count: 1 },
          meta: { ...meta, pagination: { page: 1, limit: 20, total: 1, total_page: 1, has_next: false, has_prev: false } },
        })
      }
      if (path === '/api/v1/users?page=2&limit=20') {
        return send(401, { message: 'unauthorized', code: 'unauthorized', meta })
      }
      if (path === `/api/v1/users/${targetId}` && request.method === 'PUT') {
        return send(200, { message: 'updated', code: 'updated', data: { ...user, name: 'Alya Baru' }, meta })
      }
      if (path === `/api/v1/users/${targetId}` && request.method === 'DELETE') {
        return send(200, { message: 'deleted', code: 'deleted', meta })
      }
      if (path === '/api/v1/auth/logout') return send(200, { message: 'success', code: 'success', meta })
      send(404, { message: 'not found', code: 'not_found', meta })
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing server port')
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => { await new Promise<void>((resolve) => server.close(() => resolve())) })

  it('sends the contracted auth, list, edit, delete, and logout requests', async () => {
    requests.length = 0
    const http = createHttpClient(baseUrl)
    const auth = createAuthRepository(http)
    const repository = createUserRepository(createUserRemoteDataSource(http, auth.getAccessToken, auth.invalidateSession))
    const login = await auth.login({ email: 'owner@example.test', password: 'Valid!Password1', rememberMe: false })
    expect(login.ok && login.data.role.level).toBe(100)
    const list = await repository.getUsers({ cursor: null })
    expect(list.ok && list.data.items[0].name).toBe('Alya')
    const updated = await createUpdateUser(repository)({ id: targetId, name: 'Alya Baru', phoneNumber: null, countryCode: null })
    expect(updated.ok && updated.data.name).toBe('Alya Baru')
    expect((requests.find((request) => request.method === 'PUT')?.body as Record<string, unknown>).email).toBeUndefined()
    const deleted = await repository.deleteUser(targetId)
    expect(deleted).toEqual({ ok: true, data: targetId })
    await auth.logout()
    expect(requests.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'POST /api/v1/auth/login', 'GET /api/v1/users/me', 'GET /api/v1/users?page=1&limit=20',
      `PUT /api/v1/users/${targetId}`, `DELETE /api/v1/users/${targetId}`, 'POST /api/v1/auth/logout',
    ])
  })

  it('maps invalid credentials without showing server details', async () => {
    const auth = createAuthRepository(createHttpClient(baseUrl))
    const response = await auth.login({ email: 'owner@example.test', password: 'wrongpass', rememberMe: false })
    expect(response).toEqual({ ok: false, failure: { kind: 'invalidCredentials', message: 'Email atau kata sandi tidak cocok.' } })
  })

  it('forwards the remember option and current locale to the API', async () => {
    requests.length = 0
    let language = 'en'
    const auth = createAuthRepository(createHttpClient(baseUrl, fetch, () => language))
    const login = await auth.login({ email: 'owner@example.test', password: 'Valid!Password1', rememberMe: true })
    expect(login.ok).toBe(true)
    expect(requests[0].body).toEqual({ email: 'owner@example.test', password: 'Valid!Password1', remember_me: true })
    expect(requests.every((request) => request.language === 'en')).toBe(true)
    language = 'id'
    await auth.logout()
    expect(requests.at(-1)?.language).toBe('id')
  })

  it('maps login rate limiting to an actionable failure', async () => {
    const auth = createAuthRepository(createHttpClient(baseUrl))
    const response = await auth.login({ email: 'limited@example.test', password: 'Valid!Password1', rememberMe: false })
    expect(response).toEqual({
      ok: false,
      failure: { kind: 'rateLimited', message: 'Terlalu banyak percobaan masuk. Tunggu beberapa saat lalu coba lagi.' },
    })
  })

  it('invalidates the session when a rotated refresh token is rejected', async () => {
    const now = Date.now()
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now)
    try {
      const auth = createAuthRepository(createHttpClient(baseUrl))
      const invalidated = vi.fn()
      auth.subscribeSessionInvalidated(invalidated)
      const login = await auth.login({ email: 'short@example.test', password: 'Valid!Password1', rememberMe: false })
      expect(login.ok).toBe(true)
      clock.mockReturnValue(now + 600)
      await expect(auth.getAccessToken()).rejects.toBeTruthy()
      expect(invalidated).toHaveBeenCalledTimes(1)
    } finally {
      clock.mockRestore()
    }
  })

  it('clears the session when a protected endpoint rejects the access token', async () => {
    const http = createHttpClient(baseUrl)
    const auth = createAuthRepository(http)
    const invalidated = vi.fn()
    auth.subscribeSessionInvalidated(invalidated)
    await auth.login({ email: 'owner@example.test', password: 'Valid!Password1', rememberMe: false })
    const repository = createUserRepository(createUserRemoteDataSource(http, auth.getAccessToken, auth.invalidateSession))
    const page = await repository.getUsers({ cursor: '2' })
    expect(page).toEqual({ ok: false, failure: { kind: 'unauthorized', message: 'Sesi berakhir. Silakan masuk lagi.' } })
    expect(invalidated).toHaveBeenCalledTimes(1)
    await expect(auth.getAccessToken()).rejects.toBeTruthy()
  })
})
