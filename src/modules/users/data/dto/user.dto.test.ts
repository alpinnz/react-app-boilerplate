import { describe, expect, it } from 'vitest'
import { parseChangeRoleResponse, parseDeleteResponse, parseUser, parseUserDetailsResponse, parseUserResponse, parseUsersResponse } from './user.dto'

describe('user response parsing', () => {
  const user = { id: 'user-1', role_id: 'role-1', name: 'Alya', email: 'alya@example.test', phone_number: null, country_code: 'ID' }

  it('given a valid user record, when parsing it, then returns the API contract fields', () => {
    expect(parseUser(user)).toEqual(user)
  })

  it('given a user page, when parsing it, then validates the entries and pagination metadata', () => {
    expect(parseUsersResponse({
      code: 'success', data: { items: [user] }, meta: { pagination: { page: 2, has_next: true } },
    })).toEqual({ items: [user], page: 2, hasNext: true })
  })

  it('given a malformed user or page, when parsing it, then rejects it', () => {
    expect(() => parseUser({ ...user, phone_number: 123 })).toThrow('invalidResponse')
    expect(() => parseUsersResponse({
      code: 'success', data: { items: [user] }, meta: { pagination: { page: 0, has_next: 'yes' } },
    })).toThrow('invalidResponse')
  })

  it('given a valid detail and update envelope, when parsing each response, then returns the user record', () => {
    expect(parseUserDetailsResponse({ code: 'success', data: user })).toEqual(user)
    expect(parseUserResponse({ code: 'updated', data: user })).toEqual(user)
  })

  it('given a mismatched role assignment, when validating its response, then rejects it', () => {
    expect(() => parseChangeRoleResponse({
      code: 'updated', data: { user_id: 'another-user', role_id: 'role-1' },
    }, 'user-1', 'role-1')).toThrow('invalidResponse')
  })

  it('given a deleted response, when validating it, then requires the deleted code', () => {
    expect(() => parseDeleteResponse({ code: 'deleted' })).not.toThrow()
    expect(() => parseDeleteResponse({ code: 'success' })).toThrow('invalidResponse')
  })
})
