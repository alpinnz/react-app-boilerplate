import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseSessionResponse, parseTokenResponse } from './session.dto'

describe('session response parsing', () => {
  afterEach(() => vi.restoreAllMocks())

  it('given valid tokens, when parsing them, then calculates the refresh window', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    const payload = {
      code: 'success',
      data: {
        access_token: 'a'.repeat(43), refresh_token: 'b'.repeat(43), token_type: 'Bearer',
        expires_in: 900, refresh_expires_in: 86_400, user: { id: 'user-1' },
      },
    }

    expect(parseTokenResponse(payload)).toEqual({
      accessToken: 'a'.repeat(43), refreshToken: 'b'.repeat(43), expiresIn: 900, refreshExpiresIn: 86_400,
      refreshAt: 871_000, refreshExpiresAt: 86_401_000, userId: 'user-1',
    })
  })

  it('given an invalid token payload, when parsing it, then rejects malformed tokens and expirations', () => {
    const payload = {
      code: 'success',
      data: {
        access_token: 'short', refresh_token: 'b'.repeat(43), token_type: 'Bearer',
        expires_in: 900, refresh_expires_in: 86_400, user: { id: 'user-1' },
      },
    }

    expect(() => parseTokenResponse(payload)).toThrow('invalidResponse')
    expect(() => parseTokenResponse({ ...payload, data: { ...payload.data, access_token: 'a'.repeat(43), expires_in: 0 } })).toThrow('invalidResponse')
  })

  it('given a valid session envelope, when parsing it, then maps the authenticated identity', () => {
    expect(parseSessionResponse({
      code: 'success', data: { id: 'user-1', name: 'Alya', email: 'alya@example.test', role: { name: 'owner', level: 100 } },
    })).toEqual({ userId: 'user-1', name: 'Alya', email: 'alya@example.test', role: { name: 'owner', level: 100 } })
  })

  it('given an invalid role level, when parsing the session, then rejects it', () => {
    expect(() => parseSessionResponse({
      code: 'success', data: { id: 'user-1', name: 'Alya', email: 'alya@example.test', role: { name: 'owner', level: 1.5 } },
    })).toThrow('invalidResponse')
  })
})
