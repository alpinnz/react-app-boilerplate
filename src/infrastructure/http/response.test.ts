import { describe, expect, it } from 'vitest'
import { assertResponseCode, isRecord, responseData } from './response'

describe('API response envelopes', () => {
  it('given a valid envelope, when reading its data, then returns the payload', () => {
    const payload = { code: 'success', data: { id: 'user-1' } }

    expect(isRecord(payload)).toBe(true)
    expect(responseData(payload, 'success')).toEqual({ id: 'user-1' })
  })

  it.each([null, [], { code: 'created' }, { code: 'success' }])(
    'given an invalid envelope, when reading its data, then rejects it',
    (payload) => {
      expect(() => responseData(payload, 'success')).toThrow('invalidResponse')
    },
  )

  it('given the expected code, when validating a no-data response, then accepts it', () => {
    expect(() => assertResponseCode({ code: 'deleted' }, 'deleted')).not.toThrow()
  })

  it('given a different response code, when validating a no-data response, then rejects it', () => {
    expect(() => assertResponseCode({ code: 'success' }, 'deleted')).toThrow('invalidResponse')
  })
})
