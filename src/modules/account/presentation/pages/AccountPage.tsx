import { useContext, useEffect, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { TextField } from '@/shared/presentation/ui/molecules/TextField'
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
  const { translate, format } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const store = useContext(AccountContext)
  if (!store) throw new Error('Provider akun belum dipasang.')
  const state = useStore(store, (current) => current)
  const busy = state.actionStatus.type === 'loading'

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = await state.saveProfile()
    if (name) onProfileNameChanged(name)
  }
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await state.changePassword()) onSessionEnded('passwordChanged')
  }
  async function deactivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await state.deactivate()) onSessionEnded('deactivated')
  }

  if (state.profile.status.type === 'loading' || state.profile.status.type === 'initial') return <Surface><InlineFeedback tone="info">{translate('account.loadingProfile')}</InlineFeedback></Surface>
  if (state.profile.status.type === 'failure') return <Surface><InlineFeedback tone="error">{localizeMessage(state.profile.status.failure.message)}</InlineFeedback><Button className="mt-4" onClick={() => void state.load()}>{translate('common.retry')}</Button></Surface>
  const profile = state.profile.data
  if (!profile) return <Surface><InlineFeedback tone="info">{translate('account.profileUnavailable')}</InlineFeedback></Surface>
  const hasUnsavedChanges = state.name !== profile.name || state.phoneNumber !== (profile.phoneNumber ?? '') ||
    state.countryCode !== (profile.countryCode ?? '') || !!(state.currentPassword || state.newPassword || state.confirmNewPassword || state.deactivatePassword)

  return (
    <div className="grid gap-4">
      <UnsavedChangesPrompt when={hasUnsavedChanges} />
      <Surface>
        <h1 className="text-page-title font-semibold tracking-tight">{translate('account.account')}</h1>
        <p className="mt-2 text-sm text-content-muted">{profile.email} · {format('account.accountRole', { role: profile.role.name, level: profile.role.level })}</p>
        <form className="mt-5 grid max-w-xl gap-3" onSubmit={(event) => void saveProfile(event)}>
          <TextField id="account-name" label={translate('common.name')} required maxLength={100} value={state.name} onChange={(event) => state.setField('name', event.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id="account-phone" label={translate('common.phone')} maxLength={20} value={state.phoneNumber} onChange={(event) => state.setField('phoneNumber', event.target.value)} />
            <TextField id="account-country" label={translate('common.countryCode')} maxLength={5} value={state.countryCode} onChange={(event) => state.setField('countryCode', event.target.value)} />
          </div>
          {state.actionStatus.type === 'failure' && state.actionStatus.action === 'profile' && <InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback>}
          {state.actionStatus.type === 'success' && state.actionStatus.action === 'profile' && <InlineFeedback tone="success">{translate('account.profileSaved')}</InlineFeedback>}
          <Button type="submit" disabled={busy}>{translate('account.saveProfile')}</Button>
        </form>
      </Surface>
      <Surface>
        <h2 className="text-xl font-semibold">{translate('account.changePassword')}</h2>
        <p className="mt-2 text-sm text-content-muted">{translate('account.changePasswordDescription')}</p>
        <form className="mt-4 grid max-w-xl gap-3" onSubmit={(event) => void changePassword(event)}>
          <TextField id="account-current-password" label={translate('account.currentPassword')} type="password" autoComplete="current-password" required minLength={8} maxLength={72} value={state.currentPassword} onChange={(event) => state.setField('currentPassword', event.target.value)} />
          <TextField id="account-new-password" label={translate('account.newPassword')} type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={state.newPassword} onChange={(event) => state.setField('newPassword', event.target.value)} hint={translate('auth.passwordHint')} />
          <TextField id="account-confirm-password" label={translate('account.confirmNewPassword')} type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={state.confirmNewPassword} onChange={(event) => state.setField('confirmNewPassword', event.target.value)} />
          {state.actionStatus.type === 'failure' && state.actionStatus.action === 'password' && <InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback>}
          <Button type="submit" disabled={busy}>{translate('account.changePassword')}</Button>
        </form>
      </Surface>
      <Surface>
        <h2 className="text-xl font-semibold text-danger">{translate('account.deactivateAccount')}</h2>
        <p className="mt-2 text-sm text-content-muted">{translate('account.deactivateDescription')}</p>
        <form className="mt-4 grid max-w-xl gap-3" onSubmit={(event) => void deactivate(event)}>
          <TextField id="deactivate-password" label={translate('account.confirmCurrentPassword')} type="password" autoComplete="current-password" required minLength={8} maxLength={72} value={state.deactivatePassword} onChange={(event) => state.setField('deactivatePassword', event.target.value)} />
          {state.actionStatus.type === 'failure' && state.actionStatus.action === 'deactivate' && <InlineFeedback tone="error">{localizeMessage(state.actionStatus.message)}</InlineFeedback>}
          <Button type="submit" variant="danger" disabled={busy}>{translate('account.deactivateAccount')}</Button>
        </form>
      </Surface>
    </div>
  )
}

/** Renders profile editing, password changes, and account deactivation. */
export function AccountPage({ operations, onProfileNameChanged, onSessionEnded }: AccountPageProps) {
  const [store] = useState(() => createAccountStore(operations))
  useEffect(() => { void store.getState().load(); return () => store.getState().cancelPending() }, [store])
  return <AccountContext.Provider value={store}><AccountView onProfileNameChanged={onProfileNameChanged} onSessionEnded={onSessionEnded} /></AccountContext.Provider>
}
