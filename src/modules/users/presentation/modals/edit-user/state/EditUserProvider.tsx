import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@/modules/users/domain/entities/user'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { EditUserContext } from './edit-user.context'
import { createEditUserStore } from './edit-user.store'

/** Membuat store edit per modal dan membatalkan request ketika modal dilepas. */
export function EditUserProvider({ user, updateUser, children }: { user: User; updateUser: UpdateUser; children: ReactNode }) {
  const [store] = useState(() => createEditUserStore(user, updateUser))
  useEffect(() => () => store.getState().cancelPending(), [store])
  return <EditUserContext.Provider value={store}>{children}</EditUserContext.Provider>
}
