import { StrictMode, useContext } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { useStore } from 'zustand'
import type { GetUsers } from '../src/modules/users/domain/usecases/get-users.usecase'
import type { User } from '../src/modules/users/domain/entities/user'
import type { Page } from '../src/shared/domain/page'
import type { Result } from '../src/shared/domain/result'
import type { UserFailure } from '../src/modules/users/domain/failures/user.failure'
import { UserListProvider } from '../src/modules/users/presentation/pages/user-list/state/UserListProvider'
import { UserListContext } from '../src/modules/users/presentation/pages/user-list/state/user-list.context'

afterEach(cleanup)

function Probe() {
  const store = useContext(UserListContext)
  if (!store) throw new Error('Missing provider')
  const users = useStore(store, (state) => state.users)
  return <p>{users.data?.items[0]?.name ?? users.status.type}</p>
}

it('reloads after Strict Mode effect cleanup and ignores the first response', async () => {
  let completeFirst!: (value: Result<Page<User>, UserFailure>) => void
  const first = new Promise<Result<Page<User>, UserFailure>>((resolve) => { completeFirst = resolve })
  const secondUser: User = { id: '2', name: 'Data baru', email: 'new@example.test', phoneNumber: null, countryCode: null }
  const oldUser: User = { ...secondUser, id: '1', name: 'Data lama' }
  const getUsers = vi.fn<GetUsers>().mockReturnValueOnce(first).mockResolvedValueOnce({ ok: true, data: { items: [secondUser], nextCursor: null } })

  render(<StrictMode><UserListProvider getUsers={getUsers}><Probe /></UserListProvider></StrictMode>)
  await waitFor(() => expect(screen.getByText('Data baru')).toBeTruthy())
  expect(getUsers).toHaveBeenCalledTimes(2)
  completeFirst({ ok: true, data: { items: [oldUser], nextCursor: null } })
  await first
  expect(screen.getByText('Data baru')).toBeTruthy()
})
