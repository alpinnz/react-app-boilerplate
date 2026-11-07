import { useContext, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { InputText } from '@/shared/presentation/ui/atoms/InputText'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { InputPhoneNumber } from '@/shared/presentation/ui/molecules/InputPhoneNumber'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { AsyncActionPattern } from '@/shared/presentation/ui/patterns/AsyncActionPattern'
import { getFieldError } from '@/shared/presentation/validation/field-errors'
import { useFailureToast } from '@/shared/presentation/ui/organisms/useToast'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import type { User } from '@/modules/users/domain/entities/user'
import type { UpdateUser } from '@/modules/users/domain/usecases/update-user.usecase'
import { EditUserContext } from './state/edit-user.context'
import { EditUserProvider } from './state/EditUserProvider'

function EditUserForm({ user, hasPendingRoleChange, onSaved, onClose }: { user: User; hasPendingRoleChange: boolean; onSaved: (user: User) => void; onClose: () => void }) {
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const showFailureToast = useFailureToast()
  const contextStore = useContext(EditUserContext)
  if (!contextStore) throw new Error('EditUserProvider belum dipasang.')
  const store = contextStore
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
    else {
      const currentStatus = store.getState().status
      if (currentStatus.type === 'failure') showFailureToast(currentStatus.failure.message)
    }
  }

  const failure = status.type === 'failure' ? status.failure : undefined
  const phoneErrorText = [
    getFieldError(failure?.fieldErrors, 'phoneNumber'),
    getFieldError(failure?.fieldErrors, 'countryCode'),
  ].filter((message): message is string => Boolean(message)).map(localizeMessage).join(' ') || undefined

  return <>
    <UnsavedChangesPrompt when={isDirty || hasPendingRoleChange} />
    <Modal title={translate('users.editUser')} description={format('users.editUserDescription', { name: user.name })} onDismiss={requestClose} canDismiss={!busy} mobilePresentation="sheet" footer={<>
      <Button type="button" variant="secondary" disabled={busy} onClick={requestClose}>{translate('common.cancel')}</Button>
      <Button type="submit" form="user-edit-form" disabled={busy} loading={busy} loadingLabel={translate('common.saving')}>{translate('common.save')}</Button>
    </>}>
      <form id="user-edit-form" onSubmit={(event) => void submit(event)}>
        <AsyncActionPattern
          error={failure && !failure.fieldErrors ? localizeMessage(failure.message) : undefined}
        >
          <GroupForm controlId="edit-name" labelText={translate('common.name')} errorText={localizeMessage(getFieldError(failure?.fieldErrors, 'name') ?? '') || undefined}>
            <InputText name="name" autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
          </GroupForm>
          <p className="text-app-body-regular-regular text-content-muted">{format('users.emailReadOnly', { email: user.email })}</p>
          <GroupForm controlId="edit-phone" labelText={translate('common.phone')} errorText={phoneErrorText}>
            <InputPhoneNumber
              id="edit-phone"
              name="phone_number"
              countryCodeName="country_code"
              maxLength={20}
              phoneNumber={phoneNumber}
              countryCode={countryCode}
              onPhoneNumberChange={setPhoneNumber}
              onCountryCodeChange={setCountryCode}
            />
          </GroupForm>
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
