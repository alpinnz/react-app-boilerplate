import { useContext, useEffect, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { InputPassword } from '@/shared/presentation/ui/atoms/InputPassword'
import { InputText } from '@/shared/presentation/ui/atoms/InputText'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { InputPhoneNumber } from '@/shared/presentation/ui/molecules/InputPhoneNumber'
import { PageHeading } from '@/shared/presentation/ui/molecules/PageHeading'
import { getFieldError } from '@/shared/presentation/validation/field-errors'
import { ConfirmationDialog } from '@/shared/presentation/ui/organisms/ConfirmationDialog'
import { Modal } from '@/shared/presentation/ui/organisms/Modal'
import { useFailureToast, useToast } from '@/shared/presentation/ui/organisms/useToast'
import { PullToRefresh } from '@/shared/presentation/ui/organisms/PullToRefresh'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import type { AccountUseCases } from '../../domain/usecases/account.usecases'
import { AccountContext } from '../state/account.context'
import { createAccountStore } from '../state/account.store'

/** Describes why an account action ended the current session. */
export type AccountSessionEndReason = 'passwordChanged' | 'deactivated'

type AccountPageProps = {
  operations: AccountUseCases
  onProfileNameChanged: (name: string) => void
  onSessionEnded: (reason: AccountSessionEndReason) => void
}

function AccountView({ onProfileNameChanged, onSessionEnded }: Pick<AccountPageProps, 'onProfileNameChanged' | 'onSessionEnded'>) {
  const { translate } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const { showToast } = useToast()
  const showFailureToast = useFailureToast()
  const contextStore = useContext(AccountContext)
  if (!contextStore) throw new Error('Provider akun belum dipasang.')
  const store = contextStore
  const state = useStore(store, (current) => current)
  const busy = state.actionStatus.type === 'loading'
  const [activeDialog, setActiveDialog] = useState<'profile' | 'password' | 'deactivate' | null>(null)
  const [isDiscardPromptOpen, setIsDiscardPromptOpen] = useState(false)

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = await store.getState().saveProfile()
    const status = store.getState().actionStatus
    if (name) {
      showToast({ tone: 'success', title: translate('account.profileSaved'), description: translate('account.profileSavedToastDescription') })
      closeDialog()
      onProfileNameChanged(name)
    } else if (status.type === 'failure') {
      showFailureToast(status.message)
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const changed = await store.getState().changePassword()
    const status = store.getState().actionStatus
    if (changed) {
      closeDialog()
      onSessionEnded('passwordChanged')
    } else if (status.type === 'failure') {
      showFailureToast(status.message)
    }
  }

  async function deactivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const deactivated = await store.getState().deactivate()
    const status = store.getState().actionStatus
    if (deactivated) {
      closeDialog()
      onSessionEnded('deactivated')
    } else if (status.type === 'failure') {
      showFailureToast(status.message)
    }
  }

  const isDialogDirty = activeDialog === 'profile'
    ? state.name !== state.profile.data?.name || state.phoneNumber !== (state.profile.data?.phoneNumber ?? '') || state.countryCode !== (state.profile.data?.countryCode ?? '')
    : activeDialog === 'password'
      ? !!(state.currentPassword || state.newPassword || state.confirmNewPassword)
      : activeDialog === 'deactivate'
        ? !!state.deactivatePassword
        : false

  function closeDialog() {
    setActiveDialog(null)
    setIsDiscardPromptOpen(false)
  }

  function discardDialogChanges() {
    if (activeDialog === 'profile' && state.profile.data) {
      state.setField('name', state.profile.data.name)
      state.setField('phoneNumber', state.profile.data.phoneNumber ?? '')
      state.setField('countryCode', state.profile.data.countryCode ?? '')
    }
    if (activeDialog === 'password') {
      state.setField('currentPassword', '')
      state.setField('newPassword', '')
      state.setField('confirmNewPassword', '')
    }
    if (activeDialog === 'deactivate') state.setField('deactivatePassword', '')
    closeDialog()
  }

  function requestClose() {
    if (busy) return
    if (isDialogDirty) setIsDiscardPromptOpen(true)
    else closeDialog()
  }

  async function refreshProfile() {
    await store.getState().load()
    const status = store.getState().profile.status
    if (status.type === 'failure') showFailureToast(status.failure.message)
  }

  if ((state.profile.status.type === 'loading' || state.profile.status.type === 'initial') && !state.profile.data) return <InlineFeedback tone="info">{translate('account.loadingProfile')}</InlineFeedback>
  if (state.profile.status.type === 'failure' && !state.profile.data) return <div><InlineFeedback tone="error">{localizeMessage(state.profile.status.failure.message)}</InlineFeedback><Button className="mt-form" onClick={() => void refreshProfile()}>{translate('common.retry')}</Button></div>
  const profile = state.profile.data
  if (!profile) return <InlineFeedback tone="info">{translate('account.profileUnavailable')}</InlineFeedback>
  const hasUnsavedChanges = state.name !== profile.name || state.phoneNumber !== (profile.phoneNumber ?? '') ||
    state.countryCode !== (profile.countryCode ?? '') || !!(state.currentPassword || state.newPassword || state.confirmNewPassword || state.deactivatePassword)
  const actionFailure = state.actionStatus.type === 'failure' ? state.actionStatus : undefined
  const phoneErrorText = [
    getFieldError(actionFailure?.action === 'profile' ? actionFailure.fieldErrors : undefined, 'phoneNumber'),
    getFieldError(actionFailure?.action === 'profile' ? actionFailure.fieldErrors : undefined, 'countryCode'),
  ].filter((message): message is string => Boolean(message)).map(localizeMessage).join(' ') || undefined

  return (
    <div className="grid gap-section">
      <UnsavedChangesPrompt when={hasUnsavedChanges} />
      <PullToRefresh
        onRefresh={refreshProfile}
        isRefreshing={state.profile.status.type === 'refreshing'}
        disabled={busy || state.profile.status.type === 'loading'}
        pullLabel={translate('common.pullToRefresh')}
        releaseLabel={translate('common.releaseToRefresh')}
        refreshingLabel={translate('common.refreshing')}
      >
      <p className="max-w-3xl text-app-body-regular-regular text-content-muted">{translate('account.accountDescription')}</p>
      {state.profile.status.type === 'failure' && <div className="mt-form"><InlineFeedback tone="error">{localizeMessage(state.profile.status.failure.message)}</InlineFeedback></div>}
      <div className="grid gap-section xl:grid-cols-2 xl:items-start">
        <Surface>
          <PageHeading level="section" title={translate('account.profile')} description={translate('account.profileSummary')} actions={<Button type="button" variant="secondary" onClick={() => setActiveDialog('profile')}>{translate('account.editProfile')}</Button>} />
          <dl className="mt-section grid gap-x-section gap-y-form text-app-body-regular-regular md:grid-cols-2">
            <div><dt className="text-app-label-semi-bold text-content-muted">{translate('common.name')}</dt><dd className="mt-1 text-app-body-regular-medium">{profile.name}</dd></div>
            <div><dt className="text-app-label-semi-bold text-content-muted">{translate('common.email')}</dt><dd className="mt-1 break-all text-app-body-regular-medium">{profile.email}</dd></div>
            <div><dt className="text-app-label-semi-bold text-content-muted">{translate('common.phone')}</dt><dd className="mt-1 text-app-body-regular-medium">{profile.phoneNumber ? `${profile.countryCode ?? ''} ${profile.phoneNumber}` : translate('common.emptyField')}</dd></div>
            <div><dt className="text-app-label-semi-bold text-content-muted">{translate('common.role')}</dt><dd className="mt-1 text-app-body-regular-medium capitalize">{profile.role.name}</dd></div>
          </dl>
        </Surface>
        <Surface>
          <PageHeading level="section" title={translate('account.changePassword')} description={translate('account.changePasswordDescription')} actions={<Button type="button" variant="secondary" onClick={() => setActiveDialog('password')}>{translate('account.changePassword')}</Button>} />
        </Surface>
        <Surface className="border-danger/30 xl:col-span-2">
          <PageHeading level="section" tone="danger" title={translate('account.deactivateAccount')} description={translate('account.deactivateDescription')} actions={<Button type="button" variant="danger" onClick={() => setActiveDialog('deactivate')}>{translate('account.deactivateAccount')}</Button>} />
        </Surface>
      </div>
      </PullToRefresh>
      {activeDialog === 'profile' && <Modal title={translate('account.editProfile')} description={translate('account.profileSummary')} onDismiss={requestClose} canDismiss={!busy} mobilePresentation="sheet" footer={<>
        <Button type="button" variant="secondary" disabled={busy} onClick={requestClose}>{translate('common.cancel')}</Button>
        <Button type="submit" form="account-profile-form" disabled={busy} loading={busy} loadingLabel={translate('common.saving')}>{translate('account.saveProfile')}</Button>
      </>}>
        <form id="account-profile-form" className="grid gap-form" onSubmit={(event) => void saveProfile(event)}>
          <GroupForm controlId="account-name" labelText={translate('common.name')} errorText={localizeMessage(getFieldError(actionFailure?.action === 'profile' ? actionFailure.fieldErrors : undefined, 'name') ?? '') || undefined}>
            <InputText name="name" autoComplete="name" autoFocus required maxLength={100} value={state.name} onChange={(event) => state.setField('name', event.target.value)} />
          </GroupForm>
          <GroupForm controlId="account-phone" labelText={translate('common.phone')} errorText={phoneErrorText}>
            <InputPhoneNumber
              id="account-phone"
              name="phone_number"
              countryCodeName="country_code"
              maxLength={20}
              phoneNumber={state.phoneNumber}
              countryCode={state.countryCode}
              onPhoneNumberChange={(value) => state.setField('phoneNumber', value)}
              onCountryCodeChange={(value) => state.setField('countryCode', value)}
            />
          </GroupForm>
          {actionFailure?.action === 'profile' && !actionFailure.fieldErrors && <InlineFeedback tone="error">{localizeMessage(actionFailure.message)}</InlineFeedback>}
        </form>
      </Modal>}
      {activeDialog === 'password' && <Modal title={translate('account.changePassword')} description={translate('account.changePasswordDescription')} onDismiss={requestClose} canDismiss={!busy} mobilePresentation="sheet" footer={<>
        <Button type="button" variant="secondary" disabled={busy} onClick={requestClose}>{translate('common.cancel')}</Button>
        <Button type="submit" form="account-password-form" disabled={busy} loading={busy} loadingLabel={translate('common.saving')}>{translate('account.changePassword')}</Button>
      </>}>
        <form id="account-password-form" className="grid gap-form" onSubmit={(event) => void changePassword(event)}>
          <input type="text" name="username" autoComplete="username" value={profile.email} readOnly tabIndex={-1} aria-hidden="true" className="sr-only" />
          <GroupForm controlId="account-current-password" labelText={translate('account.currentPassword')} errorText={localizeMessage(getFieldError(actionFailure?.action === 'password' ? actionFailure.fieldErrors : undefined, 'currentPassword') ?? '') || undefined}>
            <InputPassword name="current_password" autoComplete="current-password" autoFocus required minLength={8} maxLength={72} value={state.currentPassword} onChange={(event) => state.setField('currentPassword', event.target.value)} />
          </GroupForm>
          <GroupForm controlId="account-new-password" labelText={translate('account.newPassword')} hintText={translate('auth.passwordHint')} errorText={localizeMessage(getFieldError(actionFailure?.action === 'password' ? actionFailure.fieldErrors : undefined, 'newPassword') ?? '') || undefined}>
            <InputPassword name="new_password" autoComplete="new-password" required minLength={8} maxLength={72} value={state.newPassword} onChange={(event) => state.setField('newPassword', event.target.value)} />
          </GroupForm>
          <GroupForm controlId="account-confirm-password" labelText={translate('account.confirmNewPassword')} errorText={localizeMessage(getFieldError(actionFailure?.action === 'password' ? actionFailure.fieldErrors : undefined, 'confirmNewPassword') ?? '') || undefined}>
            <InputPassword name="new_password_confirmation" autoComplete="new-password" required minLength={8} maxLength={72} value={state.confirmNewPassword} onChange={(event) => state.setField('confirmNewPassword', event.target.value)} />
          </GroupForm>
          {actionFailure?.action === 'password' && !actionFailure.fieldErrors && <InlineFeedback tone="error">{localizeMessage(actionFailure.message)}</InlineFeedback>}
        </form>
      </Modal>}
      {activeDialog === 'deactivate' && <Modal role="alertdialog" title={translate('account.deactivateAccount')} description={translate('account.deactivateDescription')} onDismiss={requestClose} canDismiss={!busy} footer={<>
        <Button type="button" variant="secondary" disabled={busy} onClick={requestClose}>{translate('common.cancel')}</Button>
        <Button type="submit" form="account-deactivate-form" variant="danger" disabled={busy} loading={busy} loadingLabel={translate('common.loading')}>{translate('account.deactivateAccount')}</Button>
      </>}>
        <form id="account-deactivate-form" className="grid gap-form" onSubmit={(event) => void deactivate(event)}>
          <GroupForm controlId="deactivate-password" labelText={translate('account.confirmCurrentPassword')} errorText={localizeMessage(getFieldError(actionFailure?.action === 'deactivate' ? actionFailure.fieldErrors : undefined, 'currentPassword') ?? '') || undefined}>
            <InputPassword name="current_password" autoComplete="current-password" autoFocus required minLength={8} maxLength={72} value={state.deactivatePassword} onChange={(event) => state.setField('deactivatePassword', event.target.value)} />
          </GroupForm>
          {actionFailure?.action === 'deactivate' && !actionFailure.fieldErrors && <InlineFeedback tone="error">{localizeMessage(actionFailure.message)}</InlineFeedback>}
        </form>
      </Modal>}
      {isDiscardPromptOpen && <ConfirmationDialog
        title={translate('common.unsavedTitle')}
        description={translate('common.unsavedDescription')}
        cancelLabel={translate('common.continueEditing')}
        confirmLabel={translate('common.discard')}
        onDismiss={() => setIsDiscardPromptOpen(false)}
        onConfirm={discardDialogChanges}
      />}
    </div>
  )
}

/** Renders profile editing, password changes, and account deactivation. */
export function AccountPage({ operations, onProfileNameChanged, onSessionEnded }: AccountPageProps) {
  const [store] = useState(() => createAccountStore(operations))
  useEffect(() => { void store.getState().load(); return () => store.getState().cancelPending() }, [store])
  return <AccountContext.Provider value={store}><AccountView onProfileNameChanged={onProfileNameChanged} onSessionEnded={onSessionEnded} /></AccountContext.Provider>
}
