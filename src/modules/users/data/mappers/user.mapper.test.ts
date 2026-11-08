import { describe, expect, it } from 'vitest'
import { mapUser } from './user.mapper'

describe('mapUser', () => {
  it('given a user DTO, when mapping it, then converts backend field names to the domain entity', () => {
    expect(mapUser({
      id: 'user-1', role_id: 'role-1', name: 'Alya', email: 'alya@example.test',
      phone_number: '+628123456789', country_code: 'ID',
    })).toEqual({
      id: 'user-1', roleId: 'role-1', name: 'Alya', email: 'alya@example.test',
      phoneNumber: '+628123456789', countryCode: 'ID',
    })
  })
})
