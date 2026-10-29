import { useParams } from 'react-router-dom'
import { useLocalization } from '@valfuse-node/react'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { userPermissionLevels } from '../domain/values/user-permission-levels'
import { UserDetailPage } from '../presentation/pages/user-detail/UserDetailPage'
import { UserListPage } from '../presentation/pages/user-list/UserListPage'
import type { UsersRouteDependencies } from './users.routes'

function RestrictedMessage() {
  const { translate } = useLocalization()
  return <Surface><h1 className="text-page-title font-semibold tracking-tight">{translate('users.restrictedTitle')}</h1><p className="mt-3 text-content-muted">{translate('users.restrictedDescription')}</p></Surface>
}

/** Memeriksa akses daftar dan memasok operasi ke halaman pengguna. */
export function UsersPageRoute({ users, currentUserId, actorLevel }: Omit<UsersRouteDependencies, 'listAssignableRoles'>) {
  if (actorLevel < userPermissionLevels.viewUsers) return <RestrictedMessage />
  return <UserListPage key={currentUserId} {...users} currentUserId={currentUserId} canEdit={actorLevel >= userPermissionLevels.manageUsers} />
}

/** Memeriksa akses detail dan memasok operasi untuk record pengguna terpilih. */
export function UserDetailRoute({ users, listAssignableRoles, currentUserId, actorLevel }: UsersRouteDependencies) {
  const { userId } = useParams()
  if (!userId) return null
  if (actorLevel < userPermissionLevels.viewUsers) return <RestrictedMessage />

  return <UserDetailPage
    key={userId}
    userId={userId}
    currentUserId={currentUserId}
    actorLevel={actorLevel}
    getUser={users.getUser}
    changeUserRole={users.changeUserRole}
    listAssignableRoles={listAssignableRoles}
    updateUser={users.updateUser}
    deleteUser={users.deleteUser}
  />
}
