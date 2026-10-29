import { useContext } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { TextField } from '@/shared/presentation/ui/molecules/TextField'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { DeleteUserDialog } from '../../dialogs/delete-user/DeleteUserDialog'
import { EditUserModal } from '../../modals/edit-user/EditUserModal'
import { UserList } from '../../organisms/UserList'
import { UserListContext } from './state/user-list.context'

/**
 * Composes the user list, its loading states, and edit/delete overlays.
 * Search is intentionally local to the currently loaded page because the API
 * contract does not provide a search parameter.
 */
export function UserListView({ updateUser, deleteUser, currentUserId, canEdit }: {
  updateUser: UpdateUser
  deleteUser: DeleteUser
  currentUserId: string
  canEdit: boolean
}) {
  const { translate } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const store = useContext(UserListContext)
  if (!store) throw new Error('UserListProvider belum dipasang.')
  const users = useStore(store, (state) => state.users)
  const filter = useStore(store, (state) => state.filter)
  const editingUser = useStore(store, (state) => state.editingUser)
  const deletingUser = useStore(store, (state) => state.deletingUser)
  const setFilter = useStore(store, (state) => state.setFilter)
  const refresh = useStore(store, (state) => state.refreshUsers)
  const loadMore = useStore(store, (state) => state.loadMoreUsers)
  const openEdit = useStore(store, (state) => state.openEdit)
  const openDelete = useStore(store, (state) => state.openDelete)
  const closeOverlay = useStore(store, (state) => state.closeOverlay)
  const busy = ['loading', 'refreshing', 'loadMore'].includes(users.status.type)
  const visibleUsers = users.data?.items.filter((user) =>
    `${user.name} ${user.email}`.toLocaleLowerCase().includes(filter.search.trim().toLocaleLowerCase()),
  ) ?? []

  function reconcile() {
    closeOverlay()
    void refresh()
  }

  return (
    <Surface aria-busy={busy}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-action">{translate('users.userFeature')}</p>
          <h1 className="mt-1 text-page-title font-semibold tracking-tight">{translate('users.userList')}</h1>
          <p className="mt-2 text-sm text-content-muted">{translate('users.userListDescription')}</p>
        </div>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void refresh()}>{translate('common.refresh')}</Button>
      </div>
      <div className="mt-6 max-w-md">
        <TextField id="user-search" label={translate('users.searchUsers')} type="search" value={filter.search} onChange={(event) => void setFilter({ search: event.target.value })} placeholder={translate('users.nameOrEmail')} />
      </div>
      <div className="mt-5 grid gap-3">
        {users.status.type === 'initial' && <InlineFeedback tone="info">{translate('users.readyUsers')}</InlineFeedback>}
        {users.status.type === 'loading' && <InlineFeedback tone="info">{translate('users.loadingUsers')}</InlineFeedback>}
        {users.status.type === 'refreshing' && <InlineFeedback tone="info">{translate('users.refreshing')}</InlineFeedback>}
        {users.status.type === 'noData' && <InlineFeedback tone="info">{translate('users.noUsers')}</InlineFeedback>}
        {users.status.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(users.status.failure.message)}</InlineFeedback>}
        {users.data && users.data.items.length > 0 && visibleUsers.length === 0 && <InlineFeedback tone="info">{translate('users.noMatches')}</InlineFeedback>}
        {visibleUsers.length > 0 && <UserList users={visibleUsers} currentUserId={currentUserId} canEdit={canEdit} onEdit={openEdit} onDelete={openDelete} />}
      </div>
      {users.data?.nextCursor && (
        <Button type="button" className="mt-6" disabled={busy} onClick={() => void loadMore()}>
          {users.status.type === 'loadMore' ? translate('common.loading') : translate('users.loadMore')}
        </Button>
      )}
      {editingUser && <EditUserModal key={editingUser.id} user={editingUser} updateUser={updateUser} onSaved={reconcile} onClose={closeOverlay} />}
      {deletingUser && <DeleteUserDialog key={deletingUser.id} user={deletingUser} deleteUser={deleteUser} onDeleted={reconcile} onClose={closeOverlay} />}
    </Surface>
  )
}
