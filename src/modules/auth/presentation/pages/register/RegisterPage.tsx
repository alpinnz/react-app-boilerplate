import { useContext, useEffect, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import type { RegistrationUseCases } from '@/modules/auth/domain/usecases/register.usecase'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Hyperlink } from '@/shared/presentation/ui/atoms/Hyperlink'
import { InputEmail } from '@/shared/presentation/ui/atoms/InputEmail'
import { InputPassword } from '@/shared/presentation/ui/atoms/InputPassword'
import { InputText } from '@/shared/presentation/ui/atoms/InputText'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { PageHeading } from '@/shared/presentation/ui/molecules/PageHeading'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { InputPhoneNumber } from '@/shared/presentation/ui/molecules/InputPhoneNumber'
import { getFieldError } from '@/shared/presentation/validation/field-errors'
import { useFailureToast, useToast } from '@/shared/presentation/ui/organisms/useToast'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { RegisterContext } from './state/register.context'
import { createRegisterStore } from './state/register.store'

function RegisterForm() {
  const { translate } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const { showToast } = useToast()
  const showFailureToast = useFailureToast()
  const contextStore = useContext(RegisterContext)
  if (!contextStore) throw new Error('RegisterProvider belum dipasang.')
  const store = contextStore
  const fields = useStore(store, (state) => state)
  const status = useStore(store, (state) => state.status)
  const setField = useStore(store, (state) => state.setField)
  const busy = status.type === 'loading'
  const phoneErrorText = [
    getFieldError(status.type === 'failure' ? status.fieldErrors : undefined, 'phoneNumber'),
    getFieldError(status.type === 'failure' ? status.fieldErrors : undefined, 'countryCode'),
  ].filter((message): message is string => Boolean(message)).map(localizeMessage).join(' ') || undefined

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await store.getState().submit()
    const currentStatus = store.getState().status
    if (currentStatus.type === 'success') {
      showToast({ tone: 'success', title: translate('auth.registerSuccessToastTitle'), description: translate('auth.registerSuccessToastDescription') })
    } else if (currentStatus.type === 'failure') {
      showFailureToast(currentStatus.message)
    }
  }

  return (
    <>
      <PageHeading
        title={status.type === 'success' ? translate('auth.registerCompleteTitle') : translate('auth.registerTitle')}
        description={status.type === 'success' ? undefined : translate('auth.registerDescription')}
        titleSize="compact"
        breadcrumbs={{
          ariaLabel: translate('app.breadcrumbs'),
          items: [{ id: 'login', content: <Hyperlink to="/login" className="!text-app-hyperlink-regular-regular">{translate('auth.loginTitle')}</Hyperlink> }],
        }}
      />
      {status.type === 'success' ? (
        <div className="mt-section flex justify-center">
          <Hyperlink to="/login" treatment="solid" className="!text-app-hyperlink-regular-semi-bold underline">{translate('auth.goToLogin')}</Hyperlink>
        </div>
      ) : (
        <form className="mt-section grid gap-form" onSubmit={onSubmit}>
          <GroupForm controlId="register-name" labelText={translate('common.name')} errorText={localizeMessage(getFieldError(status.type === 'failure' ? status.fieldErrors : undefined, 'name') ?? '') || undefined}>
            <InputText name="name" required maxLength={100} value={fields.name} onChange={(event) => setField('name', event.target.value)} />
          </GroupForm>
          <GroupForm controlId="register-email" labelText={translate('common.email')} errorText={localizeMessage(getFieldError(status.type === 'failure' ? status.fieldErrors : undefined, 'email') ?? '') || undefined}>
            <InputEmail name="email" autoComplete="username" required maxLength={254} value={fields.email} onChange={(event) => setField('email', event.target.value)} />
          </GroupForm>
          <GroupForm controlId="register-phone" labelText={translate('common.phone')} errorText={phoneErrorText}>
            <InputPhoneNumber
              id="register-phone"
              name="phone_number"
              countryCodeName="country_code"
              maxLength={20}
              phoneNumber={fields.phoneNumber ?? ''}
              countryCode={fields.countryCode ?? ''}
              onPhoneNumberChange={(value) => setField('phoneNumber', value)}
              onCountryCodeChange={(value) => setField('countryCode', value)}
            />
          </GroupForm>
          <GroupForm controlId="register-password" labelText={translate('common.password')} hintText={translate('auth.passwordHint')} errorText={localizeMessage(getFieldError(status.type === 'failure' ? status.fieldErrors : undefined, 'password') ?? '') || undefined}>
            <InputPassword name="password" autoComplete="new-password" required minLength={8} maxLength={72} value={fields.password} onChange={(event) => setField('password', event.target.value)} />
          </GroupForm>
          <GroupForm controlId="register-confirm" labelText={translate('auth.confirmPassword')} errorText={localizeMessage(getFieldError(status.type === 'failure' ? status.fieldErrors : undefined, 'confirmPassword') ?? '') || undefined}>
            <InputPassword name="password_confirmation" autoComplete="new-password" required minLength={8} maxLength={72} value={fields.confirmPassword} onChange={(event) => setField('confirmPassword', event.target.value)} />
          </GroupForm>
          {status.type === 'failure' && !status.fieldErrors && <InlineFeedback tone="error">{localizeMessage(status.message)}</InlineFeedback>}
          <Button type="submit" disabled={busy} loading={busy} loadingLabel={translate('auth.registering')}>{translate('auth.register')}</Button>
          <Hyperlink to="/login" treatment="solid" className="text-center !text-app-hyperlink-regular-semi-bold">{translate('auth.loginLink')}</Hyperlink>
        </form>
      )}
    </>
  )
}

/** Renders account registration using the supplied registration operation. */
export function RegisterPage({ register }: { register: RegistrationUseCases['register'] }) {
  const [store] = useState(() => createRegisterStore(register))
  useEffect(() => () => store.getState().cancelPending(), [store])
  return <RegisterContext.Provider value={store}><RegisterForm /></RegisterContext.Provider>
}
