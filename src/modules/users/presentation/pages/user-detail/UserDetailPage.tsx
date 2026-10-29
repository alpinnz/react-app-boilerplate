import { useContext, useEffect, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
import type { ChangeUserRole } from '@/modules/users/domain/usecases/change-user-role.usecase'
import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import type { GetUser } from '@/modules/users/domain/usecases/get-user.usecase'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { userPermissionLevels } from '@/modules/users/domain/values/user-permission-levels'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { DeleteUserDialog } from '../../dialogs/delete-user/DeleteUserDialog'
import { EditUserModal } from '../../modals/edit-user/EditUserModal'
import type { ListAssignableRoles } from './assignable-role'
import { UserDetailContext } from './state/user-detail.context'
import { createUserDetailStore } from './state/user-detail.store'

function UserDetailView({ currentUserId, actorLevel, updateUser, deleteUser }: {
  currentUserId: string; actorLevel: number; updateUser: UpdateUser; deleteUser: DeleteUser
}) {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const store = useContext(UserDetailContext)
  if (!store) throw new Error('UserDetailProvider belum dipasang.')
  const state = useStore(store, (current) => current)
  const navigate = useNavigate()
  const user = state.user.data
  const role = state.roles?.find((entry) => entry.id === user?.roleId)
  const canAssign = !!user && user.id !== currentUserId && !!role && role.level < actorLevel
  const availableRoles = state.roles?.filter((entry) => entry.level < actorLevel && entry.id !== user?.roleId) ?? []
  const busy = state.actionStatus.type === 'loading'
  const hasPendingRoleChange = !!user && !!state.selectedRoleId && state.selectedRoleId !== user.roleId

  function assign(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void state.assignRole() }

  return <Surface>
    {!state.isEditing && !state.isDeleting && <UnsavedChangesPrompt when={hasPendingRoleChange} />}
    <Link to="/users" className="text-sm font-semibold text-action underline">{translate('users.backToUsers')}</Link>
    {(state.user.status.type === 'initial' || state.user.status.type === 'loading') && <div className="mt-5"><InlineFeedback tone="info">{translate('users.loadingUsers')}</InlineFeedback></div>}
    {state.user.status.type === 'failure' && <div className="mt-5 grid gap-4"><InlineFeedback tone="error">{localizeMessage(state.user.status.failure.message)}</InlineFeedback><Button type="button" onClick={() => void state.load()}>{translate('common.retry')}</Button></div>}
    {user && <>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-page-title font-semibold tracking-tight">{user.name}</h1><p className="mt-2 text-sm text-content-muted">{user.email}</p></div>
        {actorLevel >= userPermissionLevels.manageUsers && user.id !== currentUserId && <div className="flex gap-2"><Button type="button" variant="secondary" onClick={state.openEdit}>{translate('common.edit')}</Button><Button type="button" variant="danger" onClick={state.openDelete}>{translate('common.delete')}</Button></div>}
      </div>
      <dl className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase text-content-muted">{translate('common.role')}</dt><dd className="mt-1 font-medium">{role?.name ?? translate('common.unknown')}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-content-muted">{translate('common.phone')}</dt><dd className="mt-1 font-medium">{user.phoneNumber ? `${user.countryCode ?? ''} ${user.phoneNumber}` : translate('common.emptyField')}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-content-muted">{translate('users.userId')}</dt><dd className="mt-1 break-all text-sm">{user.id}</dd></div>
      </dl>
      <div className="mt-6 border-t border-line pt-5">
        <h2 className="text-xl font-semibold">{translate('users.changeRole')}</h2>
        <p className="mt-2 text-sm text-content-muted">{translate('users.changeRoleDescription')}</p>
        {state.rolesError && <div className="mt-4"><InlineFeedback tone="error">{localizeMessage(state.rolesError)}</InlineFeedback><Button className="mt-3" variant="secondary" onClick={() => void state.load()}>{translate('common.retry')}</Button></div>}
        {canAssign && availableRoles.length > 0 ? <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={assign}>
          <div className="grid min-w-48 gap-2"><label htmlFor="user-role" className="text-sm font-semibold">{translate('users.newRole')}</label><select id="user-role" required className="min-h-11 rounded-control border border-line-strong bg-surface px-3 text-content" value={state.selectedRoleId === user.roleId ? '' : state.selectedRoleId} onChange={(event) => state.setSelectedRoleId(event.target.value)}><option value="">{translate('users.selectRole')}</option>{availableRoles.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({format('users.roleLevel', { level: entry.level })})</option>)}</select></div>
          <Button type="submit" disabled={busy || !state.selectedRoleId || state.selectedRoleId === user.roleId}>{translate('users.saveRole')}</Button>
        </form> : !state.rolesError && <div className="mt-4"><InlineFeedback tone="info">{translate('users.roleChangeUnavailable')}</InlineFeedback></div>}
        {state.actionStatus.type === 'failure' && <div className="mt-4"><InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback></div>}
        {state.actionStatus.type === 'success' && <div className="mt-4"><InlineFeedback tone="success">{translate('users.roleChanged')}</InlineFeedback></div>}
      </div>
      {state.isEditing && <EditUserModal user={user} updateUser={updateUser} hasPendingRoleChange={hasPendingRoleChange} onSaved={state.applySavedUser} onClose={state.closeOverlay} />}
      {state.isDeleting && <DeleteUserDialog user={user} deleteUser={deleteUser} onDeleted={() => navigate('/users', { replace: true })} onClose={state.closeOverlay} />}
    </>}
  </Surface>
}

/** Renders a user's details and permitted profile or role actions. */
export function UserDetailPage({ userId, currentUserId, actorLevel, getUser, changeUserRole, listAssignableRoles, updateUser, deleteUser }: {
  userId: string; currentUserId: string; actorLevel: number; getUser: GetUser; changeUserRole: ChangeUserRole
  listAssignableRoles: ListAssignableRoles; updateUser: UpdateUser; deleteUser: DeleteUser
}) {
  const [store] = useState(() => createUserDetailStore(userId, getUser, changeUserRole, listAssignableRoles))
  useEffect(() => { void store.getState().load(); return () => store.getState().cancelPending() }, [store])
  return <UserDetailContext.Provider value={store}><UserDetailView currentUserId={currentUserId} actorLevel={actorLevel} updateUser={updateUser} deleteUser={deleteUser} /></UserDetailContext.Provider>
}
