import { useContext, useEffect, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { Link } from 'react-router-dom'
import { useStore } from 'zustand'
import type { RegistrationUseCases } from '@/modules/auth/domain/usecases/register.usecase'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { TextField } from '@/shared/presentation/ui/molecules/TextField'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { RegisterContext } from './state/register.context'
import { createRegisterStore } from './state/register.store'

function RegisterForm() {
  const { translate } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const store = useContext(RegisterContext)
  if (!store) throw new Error('RegisterProvider belum dipasang.')
  const fields = useStore(store, (state) => state)
  const status = useStore(store, (state) => state.status)
  const setField = useStore(store, (state) => state.setField)
  const submit = useStore(store, (state) => state.submit)
  const busy = status.type === 'loading'
  const hasUnsavedChanges = status.type !== 'success' && !!(fields.name || fields.email || fields.phoneNumber || fields.countryCode || fields.password || fields.confirmPassword)

  function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void submit() }

  return (
    <Surface className="w-full max-w-xl">
      <UnsavedChangesPrompt when={hasUnsavedChanges} />
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-action">{translate('auth.registerEyebrow')}</p>
      <h1 className="mt-1 text-page-title font-semibold tracking-tight">{translate('auth.registerTitle')}</h1>
      <p className="mt-2 text-sm text-content-muted">{translate('auth.registerDescription')}</p>
      {status.type === 'success' ? (
        <div className="mt-6 grid gap-4">
          <InlineFeedback tone="success">{translate('auth.registerSuccess')}</InlineFeedback>
          <Link className="font-semibold text-action underline" to="/login">{translate('auth.goToLogin')}</Link>
        </div>
      ) : (
        <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
          <TextField id="register-name" label={translate('common.name')} required maxLength={100} value={fields.name} onChange={(event) => setField('name', event.target.value)} />
          <TextField id="register-email" label={translate('common.email')} type="email" autoComplete="username" required maxLength={254} value={fields.email} onChange={(event) => setField('email', event.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id="register-phone" label={translate('common.phone')} maxLength={20} value={fields.phoneNumber ?? ''} onChange={(event) => setField('phoneNumber', event.target.value)} />
            <TextField id="register-country" label={translate('common.countryCode')} maxLength={5} placeholder="+62" value={fields.countryCode ?? ''} onChange={(event) => setField('countryCode', event.target.value)} />
          </div>
          <TextField id="register-password" label={translate('common.password')} type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={fields.password} onChange={(event) => setField('password', event.target.value)} hint={translate('auth.passwordHint')} />
          <TextField id="register-confirm" label={translate('auth.confirmPassword')} type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={fields.confirmPassword} onChange={(event) => setField('confirmPassword', event.target.value)} />
          {status.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(status.message)}</InlineFeedback>}
          <Button type="submit" disabled={busy}>{busy ? translate('auth.registering') : translate('auth.register')}</Button>
          <Link className="text-center text-sm font-semibold text-action underline" to="/login">{translate('auth.loginLink')}</Link>
        </form>
      )}
    </Surface>
  )
}

/** Renders account registration using the supplied registration operation. */
export function RegisterPage({ register }: { register: RegistrationUseCases['register'] }) {
  const [store] = useState(() => createRegisterStore(register))
  useEffect(() => () => store.getState().cancelPending(), [store])
  return <RegisterContext.Provider value={store}><RegisterForm /></RegisterContext.Provider>
}
