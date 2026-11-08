import { describe, expect, it } from 'vitest'
import { mapAccountProfile, mapAccountProfileUpdate } from './account-profile.mapper'

describe('account profile mappers', () => {
  it('given a profile DTO, when mapping it, then converts API names to domain names', () => {
    expect(mapAccountProfile({
      id: 'account-1', name: 'Alya', email: 'alya@example.test', phone_number: '+628123456789',
      country_code: 'ID', role: { id: 'role-1', name: 'owner', level: 100 },
    })).toEqual({
      id: 'account-1', name: 'Alya', email: 'alya@example.test', phoneNumber: '+628123456789',
      countryCode: 'ID', role: { id: 'role-1', name: 'owner', level: 100 },
    })
  })

  it('given an updated profile DTO, when mapping it, then returns only editable profile fields', () => {
    expect(mapAccountProfileUpdate({ name: 'Alya Baru', phone_number: null, country_code: null })).toEqual({
      name: 'Alya Baru', phoneNumber: null, countryCode: null,
    })
  })
})
