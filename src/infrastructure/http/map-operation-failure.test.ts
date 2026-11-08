import { describe, expect, it } from 'vitest'
import { HttpError } from './http-client'
import { mapOperationFailure } from './map-operation-failure'

describe('mapOperationFailure', () => {
  it.each([
    [400, 'invalidInput', 'Data yang dikirim tidak valid.'],
    [401, 'unauthorized', 'Sesi berakhir. Silakan masuk lagi.'],
    [403, 'forbidden', 'Anda tidak memiliki izin untuk operasi ini.'],
    [404, 'notFound', 'Data tidak ditemukan.'],
    [409, 'conflict', 'Perubahan bertentangan dengan data terbaru.'],
    [503, 'network', 'Layanan sedang tidak tersedia. Coba lagi nanti.'],
  ] as const)('given HTTP %i, when mapping the failure, then returns %s', (status, kind, message) => {
    expect(mapOperationFailure(new HttpError('http', status))).toEqual({ kind, message })
  })

  it('given a validation response, when mapping it, then preserves safe field errors and server text', () => {
    expect(mapOperationFailure(new HttpError('http', 422, 'validation_error', 'Periksa input.', { email: 'Tidak valid.' }))).toEqual({
      kind: 'invalidInput',
      message: 'Periksa input.',
      fieldErrors: { email: 'Tidak valid.' },
    })
  })

  it.each([
    [new HttpError('network'), 'network'],
    [new HttpError('timeout'), 'network'],
    [new HttpError('invalidResponse'), 'invalidResponse'],
    [new Error('unexpected'), 'unexpected'],
  ] as const)('given a transport failure, when mapping it, then returns the expected failure category', (error, kind) => {
    expect(mapOperationFailure(error).kind).toBe(kind)
  })
})
