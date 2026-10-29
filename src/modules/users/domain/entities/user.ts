/** User entity exposed by user operations and presentation components. */
export type User = {
  id: string
  roleId?: string
  name: string
  email: string
  phoneNumber: string | null
  countryCode: string | null
}
