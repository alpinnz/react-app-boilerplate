import { describe, expect, it, vi } from 'vitest'
import { HttpError, type HttpClient } from './http-client'
import { createAuthorizedRequest } from './authorized-request'

describe('authorized request', () => {
  it('given an accepted request, when sending it, then attaches the current access token', async () => {
    const http: HttpClient = { request: vi.fn().mockResolvedValue({ code: 'success' }) }
    const getAccessToken = vi.fn().mockResolvedValue('access-1')
    const request = createAuthorizedRequest(http, getAccessToken, vi.fn())

    await request('/users')

    expect(http.request).toHaveBeenCalledWith('/users', { accessToken: 'access-1' })
    expect(getAccessToken).toHaveBeenCalledOnce()
  })

  it('given the first request returns 401, when token refresh succeeds, then retries once with the new token', async () => {
    const http: HttpClient = {
      request: vi.fn().mockRejectedValueOnce(new HttpError('http', 401)).mockResolvedValueOnce({ code: 'success' }),
    }
    const getAccessToken = vi.fn().mockResolvedValueOnce('access-1').mockResolvedValueOnce('access-2')
    const request = createAuthorizedRequest(http, getAccessToken, vi.fn())

    await expect(request('/users', { method: 'GET' })).resolves.toEqual({ code: 'success' })

    expect(http.request).toHaveBeenNthCalledWith(1, '/users', { method: 'GET', accessToken: 'access-1' })
    expect(http.request).toHaveBeenNthCalledWith(2, '/users', { method: 'GET', accessToken: 'access-2' })
    expect(getAccessToken).toHaveBeenNthCalledWith(2, true, 'access-1')
  })

  it('given a non-401 failure, when sending an authorized request, then does not refresh or retry', async () => {
    const forbidden = new HttpError('http', 403)
    const http: HttpClient = { request: vi.fn().mockRejectedValue(forbidden) }
    const getAccessToken = vi.fn().mockResolvedValue('access-1')
    const request = createAuthorizedRequest(http, getAccessToken, vi.fn())

    await expect(request('/users')).rejects.toBe(forbidden)

    expect(http.request).toHaveBeenCalledOnce()
    expect(getAccessToken).toHaveBeenCalledOnce()
  })

  it('given the retry also returns 401, when the request completes, then invalidates the session and propagates the error', async () => {
    const unauthorized = new HttpError('http', 401)
    const http: HttpClient = { request: vi.fn().mockRejectedValue(unauthorized) }
    const getAccessToken = vi.fn().mockResolvedValueOnce('access-1').mockResolvedValueOnce('access-2')
    const onUnauthorized = vi.fn()
    const request = createAuthorizedRequest(http, getAccessToken, onUnauthorized)

    await expect(request('/users')).rejects.toBe(unauthorized)

    expect(http.request).toHaveBeenCalledTimes(2)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
