import { describe, expect, it } from 'vitest'
import { getFieldError } from './field-errors'

describe('getFieldError', () => {
  it('given camelCase field errors, when looking up a field, then finds the matching message', () => {
    expect(getFieldError({ phone_number: 'Nomor tidak valid.' }, 'phoneNumber')).toBe('Nomor tidak valid.')
  })

  it('given password confirmation aliases, when looking up confirmation, then finds the server field message', () => {
    expect(getFieldError({ password_confirmation: 'Belum sama.' }, 'confirmPassword')).toBe('Belum sama.')
    expect(getFieldError({ new_password_confirmation: 'Belum sama.' }, 'confirmNewPassword')).toBe('Belum sama.')
  })

  it('given no matching error, when looking up a field, then returns undefined', () => {
    expect(getFieldError(undefined, 'email')).toBeUndefined()
    expect(getFieldError({ name: 'Wajib diisi.' }, 'email')).toBeUndefined()
  })
})
