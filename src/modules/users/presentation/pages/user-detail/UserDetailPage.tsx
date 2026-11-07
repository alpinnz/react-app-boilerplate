import { useContext, useEffect, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'zustand'
import type { ChangeUserRole } from '@/modules/users/domain/usecases/change-user-role.usecase'
import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import type { GetUser } from '@/modules/users/domain/usecases/get-user.usecase'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { userPermissionLevels } from '@/modules/users/domain/values/user-permission-levels'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { InputSelect } from '@/shared/presentation/ui/atoms/InputSelect'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { PageHeading } from '@/shared/presentation/ui/molecules/PageHeading'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { getFieldError } from '@/shared/presentation/validation/field-errors'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { useFailureToast, useToast } from '@/shared/presentation/ui/organisms/useToast'
import { PullToRefresh } from '@/shared/presentation/ui/organisms/PullToRefresh'
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
  const { showToast } = useToast()
  const showFailureToast = useFailureToast()
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDiscardRolePromptOpen, setIsDiscardRolePromptOpen] = useState(false)
  const contextStore = useContext(UserDetailContext)
  if (!contextStore) throw new Error('UserDetailProvider belum dipasang.')
  const store = contextStore!
  const state = useStore(store, (current) => current)
  const navigate = useNavigate()
  const user = state.user.data
  const role = state.roles?.find((entry) => entry.id === user?.roleId)
  const canAssign = !!user && user.id !== currentUserId && !!role && role.level < actorLevel
  const availableRoles = state.roles?.filter((entry) => entry.level < actorLevel && entry.id !== user?.roleId) ?? []
  const busy = state.actionStatus.type === 'loading'
  const userIsLoading = state.user.status.type === 'loading' || state.user.status.type === 'refreshing'
  const hasPendingRoleChange = !!user && !!state.selectedRoleId && state.selectedRoleId !== user.roleId

  async function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await store.getState().assignRole()
    const status = store.getState().actionStatus
    if (status.type === 'success') {
      showToast({ tone: 'success', title: translate('users.roleChangeSavedToastTitle'), description: format('users.roleChangeSavedToastDescription', { name: user?.name ?? '' }) })
      setIsRoleDialogOpen(false)
    } else if (status.type === 'failure') {
      showFailureToast(status.message)
    }
  }

  async function refreshUserDetails() {
    await store.getState().load()
    const { user, rolesError } = store.getState()
    if (user.status.type === 'failure') showFailureToast(user.status.failure.message)
    if (rolesError) showFailureToast(rolesError)
  }

  function closeRoleDialog() {
    store.getState().setSelectedRoleId(user?.roleId ?? '')
    setIsRoleDialogOpen(false)
    setIsDiscardRolePromptOpen(false)
  }

  function requestRoleDialogClose() {
    if (hasPendingRoleChange) setIsDiscardRolePromptOpen(true)
    else closeRoleDialog()
  }

  function applySavedUser(savedUser: NonNullable<typeof user>) {
    state.applySavedUser(savedUser)
    showToast({ tone: 'success', title: translate('users.userSavedToastTitle'), description: format('users.userSavedToastDescription', { name: savedUser.name }) })
  }

  function navigateAfterDelete() {
    showToast({ tone: 'success', title: translate('users.userDeletedToastTitle'), description: format('users.userDeletedToastDescription', { name: user?.name ?? '' }) })
    navigate('/users', { replace: true })
  }

  return <div className="min-w-0" aria-busy={userIsLoading}>
    <PullToRefresh
      onRefresh={refreshUserDetails}
      isRefreshing={state.user.status.type === 'refreshing'}
      disabled={busy || state.user.status.type === 'loading'}
      pullLabel={translate('common.pullToRefresh')}
      releaseLabel={translate('common.releaseToRefresh')}
      refreshingLabel={translate('common.refreshing')}
    >
    {!state.isEditing && !state.isDeleting && !isRoleDialogOpen && <UnsavedChangesPrompt when={hasPendingRoleChange} />}
    {(state.user.status.type === 'initial' || state.user.status.type === 'loading') && <div className="mt-section"><InlineFeedback tone="info">{translate('users.loadingUsers')}</InlineFeedback></div>}
    {state.user.status.type === 'failure' && <div className="mt-section grid gap-form"><InlineFeedback tone="error">{localizeMessage(state.user.status.failure.message)}</InlineFeedback>{!user && <Button type="button" disabled={busy || userIsLoading} onClick={() => void refreshUserDetails()}>{translate('common.retry')}</Button>}</div>}
    {user && <>
      <PageHeading
        level="section"
        title={user.name}
        description={user.email}
        actions={actorLevel >= userPermissionLevels.manageUsers && user.id !== currentUserId && <>
          <Button type="button" variant="secondary" onClick={state.openEdit}>{translate('common.edit')}</Button>
          <Button type="button" variant="danger" onClick={state.openDelete}>{translate('common.delete')}</Button>
        </>}
      />
      <dl className="mt-section grid gap-form border-t border-line pt-form md:grid-cols-2">
        <div><dt className="text-app-label-medium text-content-muted">{translate('common.role')}</dt><dd className="mt-1 text-app-body-regular-medium">{role?.name ?? translate('common.unknown')}</dd></div>
        <div><dt className="text-app-label-medium text-content-muted">{translate('common.phone')}</dt><dd className="mt-1 text-app-body-regular-medium">{user.phoneNumber ? `${user.countryCode ?? ''} ${user.phoneNumber}` : translate('common.emptyField')}</dd></div>
        <div className="md:col-span-2"><dt className="text-app-label-medium text-content-muted">{translate('users.userId')}</dt><dd className="mt-1 break-all font-mono text-app-caption-regular text-content-muted">{user.id}</dd></div>
      </dl>
      <div className="mt-section border-t border-line pt-section">
        <PageHeading level="section" title={translate('users.changeRole')} description={format('users.changeRoleDescription', { name: user.name })} />
        {state.rolesError && <div className="mt-form"><InlineFeedback tone="error">{localizeMessage(state.rolesError)}</InlineFeedback><Button className="mt-field" variant="secondary" disabled={userIsLoading} onClick={() => void refreshUserDetails()}>{translate('common.retry')}</Button></div>}
        {canAssign && availableRoles.length > 0 ? <Button type="button" className="mt-form" onClick={() => setIsRoleDialogOpen(true)}>{translate('users.changeRole')}</Button> : !state.rolesError && <div className="mt-form"><InlineFeedback tone="info">{translate('users.roleChangeUnavailable')}</InlineFeedback></div>}
      </div>
      {isRoleDialogOpen && <Modal title={translate('users.changeRole')} description={format('users.changeRoleDescription', { name: user.name })} onDismiss={requestRoleDialogClose} canDismiss={!busy} mobilePresentation="sheet" footer={<>
        <Button type="button" variant="secondary" disabled={busy} onClick={requestRoleDialogClose}>{translate('common.cancel')}</Button>
        <Button type="submit" form="user-role-form" disabled={busy || !state.selectedRoleId || state.selectedRoleId === user.roleId} loading={busy} loadingLabel={translate('common.saving')}>{translate('users.saveRole')}</Button>
      </>}>
        <form id="user-role-form" className="grid gap-form" onSubmit={(event) => void assign(event)}>
          <GroupForm
            controlId="user-role"
            labelText={translate('users.newRole')}
            errorText={state.actionStatus.type === 'failure' ? localizeMessage(getFieldError(state.actionStatus.fieldErrors, 'roleId') ?? '') || undefined : undefined}
          >
            <InputSelect
              name="role_id"
              required
              value={state.selectedRoleId === user.roleId ? '' : state.selectedRoleId}
              onChange={(event) => state.setSelectedRoleId(event.target.value)}
            >
              <option value="">{translate('users.selectRole')}</option>
              {availableRoles.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} ({format('users.roleLevel', { level: entry.level })})</option>)}
            </InputSelect>
          </GroupForm>
          {state.actionStatus.type === 'failure' && !getFieldError(state.actionStatus.fieldErrors, 'roleId') && <InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback>}
        </form>
      </Modal>}
      {isDiscardRolePromptOpen && <ConfirmationDialog
        title={translate('roles.discardRoleTitle')}
        description={translate('roles.discardRoleDescription')}
        cancelLabel={translate('common.continueEditing')}
        confirmLabel={translate('common.discard')}
        onDismiss={() => setIsDiscardRolePromptOpen(false)}
        onConfirm={closeRoleDialog}
      />}
      {state.isEditing && <EditUserModal user={user} updateUser={updateUser} hasPendingRoleChange={hasPendingRoleChange} onSaved={applySavedUser} onClose={state.closeOverlay} />}
      {state.isDeleting && <DeleteUserDialog user={user} deleteUser={deleteUser} onDeleted={navigateAfterDelete} onClose={state.closeOverlay} />}
    </>}
    </PullToRefresh>
  </div>
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
