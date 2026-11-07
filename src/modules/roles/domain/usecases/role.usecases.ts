import type { RoleRepository, RoleInput } from '../repositories/role.repository'

const roleNamePattern = /^[a-z][a-z0-9_-]{0,49}$/

/**
 * Membuat operasi peran dan menegakkan format nama serta hierarki level aktor.
 *
 * @param repository - Kontrak domain untuk penyimpanan peran.
 * @returns Operasi baca dan perubahan katalog peran.
 */
export function createRoleUseCases(repository: RoleRepository) {
  function validate(input: RoleInput, actorLevel: number) {
    const fieldErrors: Record<string, string> = {}
    if (!roleNamePattern.test(input.name)) fieldErrors.name = 'Nama peran hanya boleh huruf kecil, angka, garis bawah, atau tanda hubung.'
    if (!Number.isSafeInteger(input.level) || input.level < 1 || input.level >= actorLevel) {
      fieldErrors.level = 'Level harus bilangan bulat positif di bawah level Anda.'
    }
    if (Object.keys(fieldErrors).length) {
      return { ok: false as const, failure: { kind: 'invalidInput' as const, message: 'Periksa nama dan level peran.', fieldErrors } }
    }
    return null
  }
  return {
    listRoles: (signal?: AbortSignal) => repository.listRoles(signal),
    getRole: (id: string, signal?: AbortSignal) => repository.getRole(id, signal),
    createRole: (input: RoleInput, actorLevel: number, signal?: AbortSignal) => {
      const normalized = { ...input, name: input.name.trim() }
      const failure = validate(normalized, actorLevel)
      return failure ? Promise.resolve(failure) : repository.createRole(normalized, signal)
    },
    updateRole: (id: string, input: RoleInput, actorLevel: number, signal?: AbortSignal) => {
      const normalized = { ...input, name: input.name.trim() }
      const failure = validate(normalized, actorLevel)
      return failure ? Promise.resolve(failure) : repository.updateRole(id, normalized, signal)
    },
    deleteRole: (id: string, signal?: AbortSignal) => repository.deleteRole(id, signal),
  }
}

/** Role operations consumed by role presentation and app route composition. */
export type RoleUseCases = ReturnType<typeof createRoleUseCases>
