import { useEffect, useState, type ReactNode } from 'react'
import type { GetUsers } from '@/modules/users/domain/usecases/get-users.usecase'
import { UserListContext } from './user-list.context'
import { createUserListStore } from './user-list.store'

/** Membuat store daftar sekali per mount, memuat halaman pertama, dan membatalkan request saat unmount. */
export function UserListProvider({ getUsers, children }: { getUsers: GetUsers; children: ReactNode }) {
  const [store] = useState(() => createUserListStore(getUsers))

  useEffect(() => {
    void store.getState().fetchUsers()
    return () => store.getState().cancelPending()
  }, [store])

  return <UserListContext.Provider value={store}>{children}</UserListContext.Provider>
}
