import { afterEach, describe, expect, it, vi } from 'vitest'
import { createHttpClient } from './http-client'

afterEach(() => vi.useRealTimers())

function makeResponse(status: number, body: string | unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => typeof body === 'string' ? body : JSON.stringify(body),
  } as Response
}

describe('createHttpClient', () => {
  it('given a JSON request, when sending it, then applies the API path, locale, token, and body', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(makeResponse(200, { code: 'success' }))
    const client = createHttpClient('https://api.example.test/', fetcher, () => 'en')

    await client.request('/users', { method: 'POST', body: { name: 'Alya' }, accessToken: 'token-1' })

    expect(fetcher).toHaveBeenCalledWith('https://api.example.test/api/v1/users', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Accept-Language': 'en',
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-1',
      }),
      body: '{"name":"Alya"}',
      cache: 'no-store',
    }))
  })

  it('given a validation error response, when reading it, then exposes bounded server and field messages', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(makeResponse(422, {
      code: 'validation_error',
      message: ' Periksa data. ',
      errors: [{ field: 'profile.email', message: 'Email tidak valid.' }],
    }))
    const client = createHttpClient('https://api.example.test', fetcher)

    await expect(client.request('/users')).rejects.toMatchObject({
      kind: 'http',
      status: 422,
      code: 'validation_error',
      serverMessage: 'Periksa data.',
      fieldErrors: { email: 'Email tidak valid.' },
    })
  })

  it('given malformed JSON, when reading the response, then reports an invalid response', async () => {
    const client = createHttpClient('https://api.example.test', vi.fn<typeof fetch>().mockResolvedValue(makeResponse(200, 'not json')))

    await expect(client.request('/users')).rejects.toMatchObject({ kind: 'invalidResponse' })
  })

  it('given a network rejection, when sending a request, then reports a network failure', async () => {
    const client = createHttpClient('https://api.example.test', vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')))

    await expect(client.request('/users')).rejects.toMatchObject({ kind: 'network' })
  })

  it('given an aborted request signal, when the request is cancelled, then reports an aborted error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
    }))
    const client = createHttpClient('https://api.example.test', fetcher)
    const controller = new AbortController()
    const request = client.request('/users', { signal: controller.signal })

    controller.abort()

    await expect(request).rejects.toMatchObject({ kind: 'aborted' })
  })

  it('given a request that exceeds its deadline, when the timer expires, then reports a timeout', async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
    }))
    const client = createHttpClient('https://api.example.test', fetcher)
    const request = client.request('/slow')
    const timeoutExpectation = expect(request).rejects.toMatchObject({ kind: 'timeout' })

    await vi.advanceTimersByTimeAsync(10_000)

    await timeoutExpectation
  })
})
