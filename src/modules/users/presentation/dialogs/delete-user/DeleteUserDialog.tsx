import { useContext } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { AsyncActionPattern } from '@/shared/presentation/ui/patterns/AsyncActionPattern'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
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
  const store = useContext(DeleteUserContext)
  if (!store) throw new Error('DeleteUserProvider belum dipasang.')
  const status = useStore(store, (state) => state.status)
  const remove = useStore(store, (state) => state.remove)
  const busy = status.type === 'loading'

  async function confirm() {
    const deletedId = await remove()
    if (deletedId) onDeleted(deletedId)
  }

  return (
    <Modal titleId="delete-title" descriptionId="delete-description" onDismiss={onClose} canDismiss={!busy}>
      <h2 id="delete-title" className="mb-3 text-xl font-semibold">{translate('users.deleteUser')}</h2>
      <AsyncActionPattern
        error={status.type === 'failure' ? localizeMessage(status.failure.message) : undefined}
        actions={<>
          <Button type="button" variant="secondary" autoFocus disabled={busy} onClick={onClose}>{translate('common.cancel')}</Button>
          <Button type="button" variant="danger" disabled={busy} onClick={() => void confirm()}>{busy ? translate('users.deleting') : translate('common.delete')}</Button>
        </>}
      >
        <p id="delete-description" className="text-sm leading-relaxed text-content-muted">{format('users.deleteUserDescription', { name: user.name })}</p>
      </AsyncActionPattern>
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
