/** Bentuk profil akun dengan nama field sesuai kontrak API backend. */
export type AccountProfileDto = {
  id: string
  name: string
  email: string
  phone_number: string | null
  country_code: string | null
  role: { id: string; name: string; level: number }
}

/** Bentuk data profil yang dikembalikan API setelah perubahan berhasil. */
export type AccountProfileUpdateDto = {
  name: string
  phone_number: string | null
  country_code: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Validates the profile response envelope and its untrusted API fields. */
export function parseAccountProfileResponse(payload: unknown): AccountProfileDto {
  if (!isRecord(payload) || payload.code !== 'success' || !isRecord(payload.data)) {
    throw new Error('invalidResponse')
  }

  const data = payload.data
  if (typeof data.id !== 'string' || typeof data.name !== 'string' || typeof data.email !== 'string' ||
      !(typeof data.phone_number === 'string' || data.phone_number === null) ||
      !(typeof data.country_code === 'string' || data.country_code === null) || !isRecord(data.role) ||
      typeof data.role.id !== 'string' || typeof data.role.name !== 'string' ||
      !Number.isSafeInteger(data.role.level)) {
    throw new Error('invalidResponse')
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone_number: data.phone_number,
    country_code: data.country_code,
    role: { id: data.role.id, name: data.role.name, level: data.role.level as number },
  }
}

/** Validates the updated profile response without leaking transport field names into the domain. */
export function parseAccountProfileUpdateResponse(payload: unknown): AccountProfileUpdateDto {
  if (!isRecord(payload) || payload.code !== 'updated' || !isRecord(payload.data)) {
    throw new Error('invalidResponse')
  }

  const data = payload.data
  if (typeof data.name !== 'string' ||
      !(typeof data.phone_number === 'string' || data.phone_number === null) ||
      !(typeof data.country_code === 'string' || data.country_code === null)) {
    throw new Error('invalidResponse')
  }

  return {
    name: data.name,
    phone_number: data.phone_number,
    country_code: data.country_code,
  }
}
