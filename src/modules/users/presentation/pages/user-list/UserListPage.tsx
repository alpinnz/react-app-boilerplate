import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import type { GetUsers } from '@/modules/users/domain/usecases/get-users.usecase'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { UserListProvider } from './state/UserListProvider'
import { UserListView } from './UserListView'

/** Renders a user list with paging and the actions allowed for the current actor. */
export function UserListPage({ getUsers, updateUser, deleteUser, currentUserId, canEdit }: {
  getUsers: GetUsers
  updateUser: UpdateUser
  deleteUser: DeleteUser
  currentUserId: string
  canEdit: boolean
}) {
  return (
    <UserListProvider getUsers={getUsers}>
      <UserListView updateUser={updateUser} deleteUser={deleteUser} currentUserId={currentUserId} canEdit={canEdit} />
    </UserListProvider>
  )
}
