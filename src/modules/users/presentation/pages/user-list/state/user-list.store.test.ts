import { describe, expect, it, vi } from 'vitest'
import type { Result } from '@/shared/domain/result'
import type { Page } from '@/shared/domain/page'
import type { User } from '@/modules/users/domain/entities/user'
import type { UserFailure } from '@/modules/users/domain/failures/user.failure'
import type { GetUsers } from '@/modules/users/domain/usecases/get-users.usecase'
import { createUserListStore } from './user-list.store'

const alya: User = { id: '1', name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: null }
const bima: User = { id: '2', name: 'Bima', email: 'bima@example.test', phoneNumber: null, countryCode: null }

function success(items: User[], nextCursor: string | null = null): Result<Page<User>, UserFailure> {
  return { ok: true, data: { items, nextCursor } }
}

function deferred() {
  let complete!: (result: Result<Page<User>, UserFailure>) => void
  const promise = new Promise<Result<Page<User>, UserFailure>>((resolve) => { complete = resolve })
  return { promise, complete }
}

describe('user list store', () => {
  it('loads data and represents an empty result', async () => {
    const getUsers = vi.fn<GetUsers>().mockResolvedValueOnce(success([alya])).mockResolvedValueOnce(success([]))
    const store = createUserListStore(getUsers)
    const loading = store.getState().fetchUsers()
    expect(store.getState().users.status.type).toBe('loading')
    await loading
    expect(store.getState().users).toEqual({ data: { items: [alya], nextCursor: null }, status: { type: 'success' } })
    await store.getState().fetchUsers()
    expect(store.getState().users.status.type).toBe('noData')
  })

  it('merges pages by ID and prevents duplicate requests for one cursor', async () => {
    const next = deferred()
    const getUsers = vi.fn<GetUsers>().mockResolvedValueOnce(success([alya], '1')).mockReturnValueOnce(next.promise)
    const store = createUserListStore(getUsers)
    await store.getState().fetchUsers()
    const first = store.getState().loadMoreUsers()
    const second = store.getState().loadMoreUsers()
    expect(getUsers).toHaveBeenCalledTimes(2)
    next.complete(success([{ ...alya, name: 'Alya Baru' }, bima]))
    await Promise.all([first, second])
    expect(store.getState().users.data).toEqual({ items: [{ ...alya, name: 'Alya Baru' }, bima], nextCursor: null })
    await store.getState().loadMoreUsers()
    expect(getUsers).toHaveBeenCalledTimes(2)
  })

  it('keeps a populated list when the next page is empty', async () => {
    const getUsers = vi.fn<GetUsers>().mockResolvedValueOnce(success([alya], '2')).mockResolvedValueOnce(success([]))
    const store = createUserListStore(getUsers)
    await store.getState().fetchUsers()
    await store.getState().loadMoreUsers()
    expect(store.getState().users.data).toEqual({ items: [alya], nextCursor: null })
    expect(store.getState().users.status.type).toBe('success')
  })

  it('ignores stale results even when a dependency ignores abort', async () => {
    const oldRequest = deferred()
    const newRequest = deferred()
    const getUsers = vi.fn<GetUsers>().mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(newRequest.promise)
    const store = createUserListStore(getUsers)
    const oldSearch = store.getState().fetchUsers()
    const newSearch = store.getState().fetchUsers()
    newRequest.complete(success([bima]))
    await newSearch
    oldRequest.complete(success([alya]))
    await oldSearch
    expect(store.getState().users.data?.items).toEqual([bima])
  })

  it('keeps previous data on refresh failure and ignores work after cleanup', async () => {
    const pending = deferred()
    const getUsers = vi.fn<GetUsers>()
      .mockResolvedValueOnce(success([alya]))
      .mockResolvedValueOnce({ ok: false, failure: { kind: 'network', message: 'Jaringan gagal.' } })
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(success([bima]))
    const store = createUserListStore(getUsers)
    await store.getState().fetchUsers()
    await store.getState().refreshUsers()
    expect(store.getState().users.data?.items).toEqual([alya])
    expect(store.getState().users.status.type).toBe('failure')
    const unfinished = store.getState().refreshUsers()
    store.getState().cancelPending()
    pending.complete(success([]))
    await unfinished
    expect(store.getState().users.data?.items).toEqual([alya])
    await store.getState().fetchUsers()
    expect(store.getState().users.data?.items).toEqual([bima])
  })

  it('isolates separate store instances', async () => {
    const getUsers = vi.fn<GetUsers>().mockResolvedValue(success([alya]))
    const first = createUserListStore(getUsers)
    const second = createUserListStore(getUsers)
    await first.getState().fetchUsers()
    expect(second.getState().users.status.type).toBe('initial')
  })
})
