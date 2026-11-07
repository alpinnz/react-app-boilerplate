import { useContext } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { InputSearch } from '@/shared/presentation/ui/atoms/InputSearch'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { useToast } from '@/shared/presentation/ui/organisms/useToast'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { DeleteUserDialog } from '../../dialogs/delete-user/DeleteUserDialog'
import { EditUserModal } from '../../modals/edit-user/EditUserModal'
import { UserList } from '../../organisms/UserList'
import { PullToRefresh } from '@/shared/presentation/ui/organisms/PullToRefresh'
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
  const { translate, format } = useLocalization()
  const { showToast } = useToast()
  const localizeMessage = useLocalizedMessage()
  const contextStore = useContext(UserListContext)
  if (!contextStore) throw new Error('UserListProvider belum dipasang.')
  const store = contextStore
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
  const searchTerm = filter.search.trim()
  const isSearchingUsers = searchTerm.length > 0
  const visibleUsers = users.data?.items.filter((user) =>
    `${user.name} ${user.email}`.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()),
  ) ?? []
  const emptyTitle = isSearchingUsers ? translate('users.noMatches') : translate('users.noUsers')
  let emptyDescription = translate('users.noUsersDescription')
  if (isSearchingUsers) {
    emptyDescription = users.data?.nextCursor
      ? translate('users.searchLoadedHint')
      : translate('users.noMatchesDescription')
  }

  async function refreshUsers() {
    await refresh()
  }

  async function loadMoreUsers() {
    await loadMore()
  }

  function reconcileSavedUser(name: string) {
    closeOverlay()
    showToast({ tone: 'success', title: translate('users.userSavedToastTitle'), description: format('users.userSavedToastDescription', { name }) })
    void refreshUsers()
  }

  function reconcileDeletedUser(id: string) {
    const name = users.data?.items.find((user) => user.id === id)?.name ?? id
    closeOverlay()
    showToast({ tone: 'success', title: translate('users.userDeletedToastTitle'), description: format('users.userDeletedToastDescription', { name }) })
    void refreshUsers()
  }

  return (
    <div className="min-w-0" aria-busy={busy}>
      <PullToRefresh
        onRefresh={refreshUsers}
        isRefreshing={users.status.type === 'refreshing'}
        disabled={busy}
        pullLabel={translate('common.pullToRefresh')}
        releaseLabel={translate('common.releaseToRefresh')}
        refreshingLabel={translate('common.refreshing')}
      >
        <p className="max-w-3xl text-app-body-regular-regular text-content-muted">{translate('users.userListDescription')}</p>
        <div className="mt-section w-full max-w-lg">
          <GroupForm controlId="user-search" labelText={translate('users.searchUsers')}>
            <InputSearch value={filter.search} onChange={(event) => void setFilter({ search: event.target.value })} placeholder={translate('users.nameOrEmail')} />
          </GroupForm>
        </div>
        {users.status.type === 'failure' && <div className="mt-form"><InlineFeedback tone="error">{localizeMessage(users.status.failure.message)}</InlineFeedback></div>}
        {(users.data !== null || users.status.type === 'initial' || users.status.type === 'loading') && (
          <div className="mt-section">
            <UserList
              users={visibleUsers}
              currentUserId={currentUserId}
              canEdit={canEdit}
              isLoading={users.status.type === 'initial' || users.status.type === 'loading'}
              isRefreshing={users.status.type === 'refreshing'}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              onEdit={openEdit}
              onDelete={openDelete}
              footer={users.data?.nextCursor ? <div className="flex w-full justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size={users.status.type === 'loadMore' ? 'medium' : 'small'}
                  disabled={busy}
                  loading={users.status.type === 'loadMore'}
                  loadingLabel={translate('users.loadingMoreUsers')}
                  loadingPresentation="indicator-with-label"
                  onClick={() => void loadMoreUsers()}
                >
                  {translate('users.loadMore')}
                </Button>
              </div> : null}
            />
          </div>
        )}
      </PullToRefresh>
      {editingUser && <EditUserModal key={editingUser.id} user={editingUser} updateUser={updateUser} onSaved={(user) => reconcileSavedUser(user.name)} onClose={closeOverlay} />}
      {deletingUser && <DeleteUserDialog key={deletingUser.id} user={deletingUser} deleteUser={deleteUser} onDeleted={reconcileDeletedUser} onClose={closeOverlay} />}
    </div>
  )
}
