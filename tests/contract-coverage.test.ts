import { createServer, type Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAccountRepository } from '../src/modules/account/data/repositories/account.repository.impl'
import { createAccountUseCases } from '../src/modules/account/domain/usecases/account.usecases'
import { createRegistrationRepository } from '../src/modules/auth/data/repositories/registration.repository.impl'
import { createRegistrationUseCases } from '../src/modules/auth/domain/usecases/register.usecase'
import { createHealthRepository } from '../src/modules/health/data/repositories/health.repository.impl'
import { createGetHealth } from '../src/modules/health/domain/usecases/get-health.usecase'
import { createRoleRepository } from '../src/modules/roles/data/repositories/role.repository.impl'
import { createRoleUseCases } from '../src/modules/roles/domain/usecases/role.usecases'
import { createUserRemoteDataSource } from '../src/modules/users/data/datasources/user-remote.datasource'
import { createUserRepository } from '../src/modules/users/data/repositories/user.repository.impl'
import { createHttpClient } from '../src/infrastructure/http/http-client'

const accountId = '01a17aa8-1c00-7007-8107-100000000007'
const targetId = '01a17aa8-1c00-700b-810b-10000000000b'
const roleId = '01a17aa8-1c00-7001-8101-100000000001'
const profile = {
  id: accountId, role_id: roleId, name: 'Owner', email: 'owner@example.test', phone_number: null,
  country_code: null, created_at: '2026-10-28T00:00:00.000Z', updated_at: '2026-10-28T00:00:00.000Z',
  role: { id: roleId, name: 'owner', level: 100 },
}
const target = { ...profile, id: targetId, name: 'Alya', email: 'alya@example.test', role_id: 'user-role' }
const meta = { request_id: '01a17aa8-1c00-700a-810a-10000000000a' }
const success = (code: string, data?: unknown) => ({ message: code, code, ...(data === undefined ? {} : { data }), meta })
const registration = { name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: null, password: 'Valid!Password1', confirmPassword: 'Valid!Password1' }

describe('remaining OpenAPI operations over HTTP', () => {
  let server: Server
  let baseUrl: string
  const requests: { method: string; path: string; body: unknown; authorization: string | undefined }[] = []

  beforeAll(async () => {
    server = createServer(async (request, response) => {
      const path = request.url ?? ''
      const chunks: Buffer[] = []
      for await (const chunk of request) chunks.push(chunk as Buffer)
      const bodyText = Buffer.concat(chunks).toString()
      const body = bodyText ? JSON.parse(bodyText) as unknown : null
      const method = request.method ?? ''
      requests.push({ method, path, body, authorization: request.headers.authorization })
      response.setHeader('Content-Type', 'application/json')
      const send = (status: number, payload: unknown) => { response.statusCode = status; response.end(JSON.stringify(payload)) }

      if (path === '/api/v1/health' && method === 'GET') return send(200, { status: 'ok', checks: { database: { status: 'ok' } } })
      if ((path === '/api/v1/auth/register' || path === '/api/v1/users') && method === 'POST') return send(201, success('created', { id: accountId }))
      if (path === '/api/v1/roles' && method === 'GET') return send(200, success('success', { items: [{ id: roleId, name: 'owner', level: 100 }], count: 1 }))
      if (path === '/api/v1/roles' && method === 'POST') {
        if (body && typeof body === 'object' && 'name' in body && body.name === 'duplicate') return send(409, { message: 'conflict', code: 'conflict', meta })
        return send(201, success('created', { id: roleId, name: 'support', level: 20 }))
      }
      if (path === `/api/v1/roles/${roleId}` && method === 'GET') return send(200, success('success', { id: roleId, name: 'support', level: 20 }))
      if (path === `/api/v1/roles/${roleId}` && method === 'PATCH') return send(200, success('updated', { id: roleId, name: 'support_agent', level: 25 }))
      if (path === `/api/v1/roles/${roleId}` && method === 'DELETE') return send(200, success('deleted'))
      if (path === '/api/v1/users/me' && method === 'GET') return send(200, success('success', profile))
      if (path === '/api/v1/users/me' && method === 'PATCH') return send(200, success('updated', { ...profile, name: 'Owner Baru' }))
      if (path === '/api/v1/users/me' && method === 'DELETE') return send(200, success('deleted'))
      if (path === '/api/v1/users/me/password' && method === 'PUT') return send(200, success('updated'))
      if (path === `/api/v1/users/${targetId}` && method === 'GET') return send(200, success('success', target))
      if (path === `/api/v1/users/${targetId}/role` && method === 'PATCH') return send(200, success('updated', { user_id: targetId, role_id: roleId }))
      return send(501, { message: 'unexpected request', code: 'not_implemented', meta })
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing server port')
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => { await new Promise<void>((resolve) => server.close(() => resolve())) })

  it('sends registration, health, profile, role, and user detail requests to contracted paths', async () => {
    requests.length = 0
    const http = createHttpClient(baseUrl)
    const registrations = createRegistrationUseCases(createRegistrationRepository(http))
    expect(await registrations.register(registration)).toEqual({ ok: true, data: accountId })
    expect(await registrations.createUser(registration)).toEqual({ ok: true, data: accountId })
    expect(await createGetHealth(createHealthRepository(http))()).toEqual({ ok: true, data: { api: 'ok', database: 'ok' } })

    const getAccessToken = async () => 'a'.repeat(43)
    const account = createAccountUseCases(createAccountRepository(http, getAccessToken, () => undefined))
    const roles = createRoleUseCases(createRoleRepository(http, getAccessToken, () => undefined))
    const users = createUserRepository(createUserRemoteDataSource(http, getAccessToken, () => undefined))

    const current = await account.getProfile()
    expect(current.ok && current.data.role.level).toBe(100)
    expect(await account.updateProfile({ name: 'Owner Baru', phoneNumber: null, countryCode: null })).toEqual({ ok: true, data: { name: 'Owner Baru', phoneNumber: null, countryCode: null } })
    expect(await account.changePassword({ currentPassword: 'Valid!Password1', newPassword: 'New!Password123', confirmNewPassword: 'New!Password123' })).toEqual({ ok: true, data: null })
    expect(await account.deactivateAccount('Valid!Password1')).toEqual({ ok: true, data: null })

    const listed = await roles.listRoles()
    expect(listed.ok && listed.data[0].name).toBe('owner')
    expect(await roles.getRole(roleId)).toEqual({ ok: true, data: { id: roleId, name: 'support', level: 20 } })
    expect(await roles.createRole({ name: 'support', level: 20 }, 100)).toEqual({ ok: true, data: { id: roleId, name: 'support', level: 20 } })
    expect(await roles.updateRole(roleId, { name: 'support_agent', level: 25 }, 100)).toEqual({ ok: true, data: { id: roleId, name: 'support_agent', level: 25 } })
    expect(await roles.deleteRole(roleId)).toEqual({ ok: true, data: null })

    const detail = await users.getUser(targetId)
    expect(detail.ok && detail.data.name).toBe('Alya')
    expect(await users.changeUserRole(targetId, roleId)).toEqual({ ok: true, data: null })

    expect(requests.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'POST /api/v1/auth/register', 'POST /api/v1/users', 'GET /api/v1/health',
      'GET /api/v1/users/me', 'PATCH /api/v1/users/me', 'PUT /api/v1/users/me/password', 'DELETE /api/v1/users/me',
      'GET /api/v1/roles', `GET /api/v1/roles/${roleId}`, 'POST /api/v1/roles', `PATCH /api/v1/roles/${roleId}`, `DELETE /api/v1/roles/${roleId}`,
      `GET /api/v1/users/${targetId}`, `PATCH /api/v1/users/${targetId}/role`,
    ])
    expect(requests.find((entry) => entry.path === '/api/v1/users/me' && entry.method === 'PATCH')?.body).toEqual({ name: 'Owner Baru', phone_number: null, country_code: null })
    expect(requests.find((entry) => entry.path === '/api/v1/users/me/password')?.body).toEqual({ current_password: 'Valid!Password1', new_password: 'New!Password123', confirm_new_password: 'New!Password123' })
    expect(requests.find((entry) => entry.path === '/api/v1/users/me' && entry.method === 'DELETE')?.body).toEqual({ current_password: 'Valid!Password1' })
    expect(requests.find((entry) => entry.path.endsWith('/role') && entry.method === 'PATCH')?.body).toEqual({ role_id: roleId })
    expect(requests.filter((entry) => entry.authorization).length).toBe(11)
    expect(requests.filter((entry) => entry.authorization).every((entry) => entry.authorization === `Bearer ${'a'.repeat(43)}`)).toBe(true)
  })

  it('maps role conflicts to a safe user-facing failure', async () => {
    const http = createHttpClient(baseUrl)
    const roles = createRoleUseCases(createRoleRepository(http, async () => 'a'.repeat(43), () => undefined))
    expect(await roles.createRole({ name: 'duplicate', level: 20 }, 100)).toEqual({ ok: false, failure: { kind: 'conflict', message: 'Perubahan bertentangan dengan data terbaru.' } })
  })
})
