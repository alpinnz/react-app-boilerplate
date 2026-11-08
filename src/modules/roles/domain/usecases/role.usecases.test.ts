import { describe, expect, it, vi } from 'vitest'
import type { RoleRepository } from '../repositories/role.repository'
import { createRoleUseCases } from './role.usecases'

function createRepository() {
  return {
    listRoles: vi.fn<RoleRepository['listRoles']>(),
    getRole: vi.fn<RoleRepository['getRole']>(),
    createRole: vi.fn<RoleRepository['createRole']>(),
    updateRole: vi.fn<RoleRepository['updateRole']>(),
    deleteRole: vi.fn<RoleRepository['deleteRole']>(),
  } satisfies RoleRepository
}

describe('role use cases', () => {
  it('given a valid role name, when creating a role, then trims it and forwards the actor signal', async () => {
    const repository = createRepository()
    repository.createRole.mockResolvedValue({ ok: true, data: { id: 'role-1', name: 'support', level: 20 } })
    const signal = new AbortController().signal

    await createRoleUseCases(repository).createRole({ name: ' support ', level: 20 }, 100, signal)

    expect(repository.createRole).toHaveBeenCalledWith({ name: 'support', level: 20 }, signal)
  })

  it.each([
    [{ name: 'Support', level: 20 }, 100, 'name'],
    [{ name: 'support agent', level: 20 }, 100, 'name'],
    [{ name: 'support', level: 100 }, 100, 'level'],
    [{ name: 'support', level: 1.5 }, 100, 'level'],
    [{ name: 'support', level: 0 }, 100, 'level'],
  ] as const)('given invalid role input, when creating a role, then reports a field validation error', async (input, actorLevel, field) => {
    const repository = createRepository()

    await expect(createRoleUseCases(repository).createRole(input, actorLevel)).resolves.toMatchObject({
      ok: false,
      failure: { kind: 'invalidInput', fieldErrors: { [field]: expect.any(String) } },
    })
    expect(repository.createRole).not.toHaveBeenCalled()
  })

  it('given an existing role and valid changes, when updating it, then forwards the normalized role and id', async () => {
    const repository = createRepository()
    repository.updateRole.mockResolvedValue({ ok: true, data: { id: 'role-1', name: 'support_agent', level: 25 } })

    await createRoleUseCases(repository).updateRole('role-1', { name: ' support_agent ', level: 25 }, 100)

    expect(repository.updateRole).toHaveBeenCalledWith('role-1', { name: 'support_agent', level: 25 }, undefined)
  })
})
