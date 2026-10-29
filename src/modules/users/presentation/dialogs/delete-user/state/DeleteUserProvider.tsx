import { useEffect, useState, type ReactNode } from 'react'
import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import { DeleteUserContext } from './delete-user.context'
import { createDeleteUserStore } from './delete-user.store'

/** Membuat store penghapusan per user dan membatalkan request saat dialog unmount. */
export function DeleteUserProvider({ userId, deleteUser, children }: {
  userId: string
  deleteUser: DeleteUser
  children: ReactNode
}) {
  const [store] = useState(() => createDeleteUserStore(userId, deleteUser))
  useEffect(() => () => store.getState().cancelPending(), [store])
  return <DeleteUserContext.Provider value={store}>{children}</DeleteUserContext.Provider>
}
