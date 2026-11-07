import type { FieldErrors } from '@/shared/domain/operation-failure'

function normalizeFieldName(fieldName: string) {
  return fieldName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[-\s]/g, '_').toLocaleLowerCase()
}

const fieldAliases: Record<string, string[]> = {
  confirm_new_password: ['new_password_confirmation', 'password_confirmation'],
  confirm_password: ['password_confirmation'],
}

/** Finds a field error across camelCase and snake_case API property names. */
export function getFieldError(fieldErrors: FieldErrors | undefined, fieldName: string) {
  if (!fieldErrors) return undefined
  const expected = normalizeFieldName(fieldName)
  const aliases = fieldAliases[expected] ?? []
  const entry = Object.entries(fieldErrors).find(([key]) => {
    const normalizedKey = normalizeFieldName(key)
    return normalizedKey === expected || aliases.includes(normalizedKey)
  })
  return entry?.[1]
}
