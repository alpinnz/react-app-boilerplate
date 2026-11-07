import { useContext, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Hyperlink } from '@/shared/presentation/ui/atoms/Hyperlink'
import { InputEmail } from '@/shared/presentation/ui/atoms/InputEmail'
import { InputPassword } from '@/shared/presentation/ui/atoms/InputPassword'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { GroupForm } from '@/shared/presentation/ui/molecules/GroupForm'
import { PageHeading } from '@/shared/presentation/ui/molecules/PageHeading'
import { getFieldError } from '@/shared/presentation/validation/field-errors'
import { useFailureToast, useToast } from '@/shared/presentation/ui/organisms/useToast'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { SessionContext } from '../../state/session/session.context'

type LoginPageProps = {
  notice: 'passwordChanged' | 'deactivated' | null
}

/** Renders the sign-in form with app-provided navigation and session notices. */
export function LoginPage({ notice }: LoginPageProps) {
  const contextStore = useContext(SessionContext)
  if (!contextStore) throw new Error('SessionProvider belum dipasang.')
  const store = contextStore
  const session = useStore(store, (state) => state.session)
  const login = useStore(store, (state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { translate } = useLocalization()
  const localizeMessage = useLocalizedMessage()
  const { showToast } = useToast()
  const showFailureToast = useFailureToast()
  const shownNotice = useRef<LoginPageProps['notice']>(null)

  const noticeMessage = notice === 'passwordChanged' ? translate('account.passwordChangedNotice')
    : notice === 'deactivated' ? translate('account.deactivatedNotice') : null

  useEffect(() => {
    if (!notice || !noticeMessage || shownNotice.current === notice) return
    shownNotice.current = notice
    showToast({ tone: 'success', title: translate('common.actionSucceeded'), description: noticeMessage })
  }, [notice, noticeMessage, showToast, translate])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await login(email, password, rememberMe)) {
      setPassword('')
      showToast({ tone: 'success', title: translate('auth.loginSuccessToastTitle'), description: translate('auth.loginSuccessToastDescription') })
      return
    }
    const status = store.getState().session.status
    if (status.type === 'failure' && status.failure.kind !== 'invalidCredentials' && !status.failure.fieldErrors) {
      showFailureToast(status.failure.message)
    }
  }

  const failure = session.status.type === 'failure' ? session.status.failure : undefined

  return (
    <>
      <PageHeading title={translate('auth.loginTitle')} description={translate('auth.loginDescription')} titleSize="compact" />
      <form className="mt-section grid gap-form" onSubmit={(event) => void submit(event)}>
        <GroupForm controlId="login-email" labelText={translate('common.email')} errorText={localizeMessage(getFieldError(failure?.fieldErrors, 'email') ?? '') || undefined}>
          <InputEmail name="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
        </GroupForm>
        <GroupForm controlId="login-password" labelText={translate('common.password')} errorText={localizeMessage(getFieldError(failure?.fieldErrors, 'password') ?? '') || undefined}>
          <InputPassword name="password" autoComplete="current-password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} />
        </GroupForm>
        <label className="flex cursor-pointer items-start gap-3 rounded-control px-1 py-1 transition-colors hover:bg-canvas/60">
          <input id="login-remember-me" name="remember_me" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-action" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          <strong className="block text-app-body-regular-semi-bold text-content">{translate('auth.rememberMe')}</strong>
        </label>
        {failure?.kind === 'invalidCredentials' && !failure.fieldErrors && <InlineFeedback tone="error">{localizeMessage(failure.message)}</InlineFeedback>}
        <Button type="submit" disabled={session.status.type === 'loading'} loading={session.status.type === 'loading'} loadingLabel={translate('auth.loggingIn')}>
          {translate('auth.loginTitle')}
        </Button>
      </form>
      <Hyperlink to="/register" treatment="solid" className="mt-form block text-center !text-app-hyperlink-regular-semi-bold">{translate('auth.registerLink')}</Hyperlink>
    </>
  )
}
