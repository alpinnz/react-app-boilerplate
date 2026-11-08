import { describe, expect, it } from 'vitest'
import { parseAccountProfileResponse, parseAccountProfileUpdateResponse } from './account-profile.dto'

describe('account profile response parsing', () => {
  const profile = {
    code: 'success',
    data: {
      id: 'account-1', name: 'Alya', email: 'alya@example.test', phone_number: null, country_code: null,
      role: { id: 'role-1', name: 'owner', level: 100 },
    },
  }

  it('given a valid profile envelope, when parsing it, then preserves the profile contract', () => {
    expect(parseAccountProfileResponse(profile)).toEqual(profile.data)
  })

  it.each([
    { ...profile, code: 'updated' },
    { ...profile, data: { ...profile.data, role: null } },
    { ...profile, data: { ...profile.data, phone_number: 42 } },
    { ...profile, data: { ...profile.data, role: { ...profile.data.role, level: 1.5 } } },
  ])('given a malformed profile envelope, when parsing it, then rejects it', (payload) => {
    expect(() => parseAccountProfileResponse(payload)).toThrow('invalidResponse')
  })

  it('given a valid profile update envelope, when parsing it, then returns editable profile fields', () => {
    expect(parseAccountProfileUpdateResponse({
      code: 'updated', data: { name: 'Alya Baru', phone_number: null, country_code: 'ID' },
    })).toEqual({ name: 'Alya Baru', phone_number: null, country_code: 'ID' })
  })

  it('given an update with the wrong response code, when parsing it, then rejects it', () => {
    expect(() => parseAccountProfileUpdateResponse({
      code: 'success', data: { name: 'Alya', phone_number: null, country_code: null },
    })).toThrow('invalidResponse')
  })
})
