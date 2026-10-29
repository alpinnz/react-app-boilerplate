import { useContext, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { TextField } from '@/shared/presentation/ui/molecules/TextField'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { AsyncActionPattern } from '@/shared/presentation/ui/patterns/AsyncActionPattern'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import type { User } from '@/modules/users/domain/entities/user'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { EditUserContext } from './state/edit-user.context'
import { EditUserProvider } from './state/EditUserProvider'

function EditUserForm({ user, hasPendingRoleChange, onSaved, onClose }: { user: User; hasPendingRoleChange: boolean; onSaved: (user: User) => void; onClose: () => void }) {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const store = useContext(EditUserContext)
  if (!store) throw new Error('EditUserProvider belum dipasang.')
  const name = useStore(store, (state) => state.name)
  const phoneNumber = useStore(store, (state) => state.phoneNumber)
  const countryCode = useStore(store, (state) => state.countryCode)
  const status = useStore(store, (state) => state.status)
  const setName = useStore(store, (state) => state.setName)
  const setPhoneNumber = useStore(store, (state) => state.setPhoneNumber)
  const setCountryCode = useStore(store, (state) => state.setCountryCode)
  const save = useStore(store, (state) => state.save)
  const busy = status.type === 'loading'
  const [isDiscardPromptOpen, setIsDiscardPromptOpen] = useState(false)
  const isDirty = name !== user.name || phoneNumber !== (user.phoneNumber ?? '') || countryCode !== (user.countryCode ?? '')

  function requestClose() {
    if (isDirty) setIsDiscardPromptOpen(true)
    else onClose()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const saved = await save()
    if (saved) onSaved(saved)
  }

  return <>
    <UnsavedChangesPrompt when={isDirty || hasPendingRoleChange} />
    <Modal titleId="edit-title" onDismiss={requestClose} canDismiss={!busy}>
      <h2 id="edit-title" className="mb-5 text-xl font-semibold">{translate('users.editUser')}</h2>
      <form onSubmit={(event) => void submit(event)}>
        <AsyncActionPattern
          error={status.type === 'failure' ? localizeMessage(status.failure.message) : undefined}
          actions={<>
            <Button type="button" variant="secondary" disabled={busy} onClick={requestClose}>{translate('common.cancel')}</Button>
            <Button type="submit" disabled={busy}>{busy ? translate('common.saving') : translate('common.save')}</Button>
          </>}
        >
          <TextField id="edit-name" label={translate('common.name')} autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
          <p className="text-sm text-content-muted">{format('users.emailReadOnly', { email: user.email })}</p>
          <TextField id="edit-phone" label={translate('common.phone')} maxLength={20} value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
          <TextField id="edit-country" label={translate('common.countryCode')} maxLength={5} value={countryCode} onChange={(event) => setCountryCode(event.target.value)} placeholder="+62" />
        </AsyncActionPattern>
      </form>
    </Modal>
    {isDiscardPromptOpen && <ConfirmationDialog
      title={translate('users.discardUserTitle')}
      description={translate('users.discardUserDescription')}
      cancelLabel={translate('common.continueEditing')}
      confirmLabel={translate('common.discard')}
      onDismiss={() => setIsDiscardPromptOpen(false)}
      onConfirm={onClose}
    />}
  </>
}

/**
 * Provides isolated edit state for the selected user and renders its modal.
 * The parent refreshes the list after a successful save via `onSaved`.
 */
export function EditUserModal({ user, updateUser, hasPendingRoleChange = false, onSaved, onClose }: {
  user: User
  updateUser: UpdateUser
  hasPendingRoleChange?: boolean
  onSaved: (user: User) => void
  onClose: () => void
}) {
  return (
    <EditUserProvider user={user} updateUser={updateUser}>
      <EditUserForm user={user} hasPendingRoleChange={hasPendingRoleChange} onSaved={onSaved} onClose={onClose} />
    </EditUserProvider>
  )
}
