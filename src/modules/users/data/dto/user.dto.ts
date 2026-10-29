/** Bentuk record pengguna sesuai nama field pada respons API backend. */
export type UserDto = {
  id: string
  role_id: string
  name: string
  email: string
  phone_number: string | null
  country_code: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Memvalidasi satu record API sebelum dipakai oleh mapper. */
export function parseUser(value: unknown): UserDto {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.role_id !== 'string' || typeof value.name !== 'string' ||
      typeof value.email !== 'string' ||
      !(typeof value.phone_number === 'string' || value.phone_number === null) ||
      !(typeof value.country_code === 'string' || value.country_code === null)) {
    throw new Error('invalidResponse')
  }
  return {
    id: value.id, role_id: value.role_id, name: value.name, email: value.email,
    phone_number: value.phone_number, country_code: value.country_code,
  }
}

/** Memvalidasi halaman daftar pengguna dan metadata pagination backend. */
export function parseUsersResponse(payload: unknown) {
  if (!isRecord(payload) || payload.code !== 'success' || !isRecord(payload.data) ||
      !Array.isArray(payload.data.items) || !isRecord(payload.meta) || !isRecord(payload.meta.pagination)) {
    throw new Error('invalidResponse')
  }
  const pagination = payload.meta.pagination
  if (!Number.isSafeInteger(pagination.page) || typeof pagination.has_next !== 'boolean') throw new Error('invalidResponse')
  return { items: payload.data.items.map(parseUser), page: pagination.page as number, hasNext: pagination.has_next }
}

/** Memvalidasi envelope respons `updated` dari perubahan pengguna. */
export function parseUserResponse(payload: unknown): UserDto {
  if (!isRecord(payload) || payload.code !== 'updated') throw new Error('invalidResponse')
  return parseUser(payload.data)
}

/** Memvalidasi envelope `success` dari pembacaan detail pengguna. */
export function parseUserDetailsResponse(payload: unknown): UserDto {
  if (!isRecord(payload) || payload.code !== 'success') throw new Error('invalidResponse')
  return parseUser(payload.data)
}

/** Memastikan backend mengonfirmasi pasangan pengguna dan peran yang diminta. */
export function parseChangeRoleResponse(payload: unknown, userId: string, roleId: string): void {
  if (!isRecord(payload) || payload.code !== 'updated' || !isRecord(payload.data) ||
    payload.data.user_id !== userId || payload.data.role_id !== roleId) throw new Error('invalidResponse')
}

/** Memastikan respons penonaktifan pengguna memakai kode `deleted`. */
export function parseDeleteResponse(payload: unknown): void {
  if (!isRecord(payload) || payload.code !== 'deleted') throw new Error('invalidResponse')
}
