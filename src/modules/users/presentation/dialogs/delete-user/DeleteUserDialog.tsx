import { useContext } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { AsyncActionPattern } from '@/shared/presentation/ui/patterns/AsyncActionPattern'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { useFailureToast } from '@/shared/presentation/ui/organisms/useToast'
import type { User } from '@/modules/users/domain/entities/user'
import type { DeleteUser } from '@/modules/users/domain/usecases/delete-user.usecase'
import { DeleteUserContext } from './state/delete-user.context'
import { DeleteUserProvider } from './state/DeleteUserProvider'

function DeleteUserConfirmation({ user, onDeleted, onClose }: {
  user: User
  onDeleted: (id: string) => void
  onClose: () => void
}) {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const showFailureToast = useFailureToast()
  const contextStore = useContext(DeleteUserContext)
  if (!contextStore) throw new Error('DeleteUserProvider belum dipasang.')
  const store = contextStore
  const status = useStore(store, (state) => state.status)
  const remove = useStore(store, (state) => state.remove)
  const busy = status.type === 'loading'

  async function confirm() {
    const deletedId = await remove()
    if (deletedId) onDeleted(deletedId)
    else {
      const currentStatus = store.getState().status
      if (currentStatus.type === 'failure') showFailureToast(currentStatus.failure.message)
    }
  }

  return (
    <Modal
      role="alertdialog"
      title={format('users.deleteUserTitle', { name: user.name })}
      description={translate('users.deleteUserDescription')}
      onDismiss={onClose}
      canDismiss={!busy}
      footer={<>
        <Button type="button" variant="secondary" autoFocus disabled={busy} onClick={onClose}>{translate('common.cancel')}</Button>
        <Button type="button" variant="danger" disabled={busy} loading={busy} loadingLabel={translate('users.deleting')} onClick={() => void confirm()}>{translate('common.delete')}</Button>
      </>}
    >
      <AsyncActionPattern
        error={status.type === 'failure' ? localizeMessage(status.failure.message) : undefined}
      />
    </Modal>
  )
}

/**
 * Provides isolated delete state and asks for confirmation before removal.
 * `onDeleted` is called only after the delete action returns the removed ID.
 */
export function DeleteUserDialog({ user, deleteUser, onDeleted, onClose }: {
  user: User
  deleteUser: DeleteUser
  onDeleted: (id: string) => void
  onClose: () => void
}) {
  return (
    <DeleteUserProvider userId={user.id} deleteUser={deleteUser}>
      <DeleteUserConfirmation user={user} onDeleted={onDeleted} onClose={onClose} />
    </DeleteUserProvider>
  )
}
