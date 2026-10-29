import { useContext, useState, type FormEvent } from 'react'
import { useLocalization } from '@valfuse-node/react'
import { Link } from 'react-router-dom'
import { useStore } from 'zustand'
import { Button } from '@/shared/presentation/ui/atoms/Button'
import { Surface } from '@/shared/presentation/ui/atoms/Surface'
import { InlineFeedback } from '@/shared/presentation/ui/molecules/InlineFeedback'
import { TextField } from '@/shared/presentation/ui/molecules/TextField'
import { UnsavedChangesPrompt } from '@/shared/presentation/ui/organisms/UnsavedChangesPrompt'
import { useLocalizedMessage } from '@/shared/presentation/localization/useLocalizedMessage'
import { SessionContext } from '../../state/session/session.context'

type LoginPageProps = {
  notice: string | null
}

/** Renders the sign-in form with app-provided navigation and session notices. */
export function LoginPage({ notice }: LoginPageProps) {
  const store = useContext(SessionContext)
  if (!store) throw new Error('SessionProvider belum dipasang.')
  const session = useStore(store, (state) => state.session)
  const login = useStore(store, (state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { translate } = useLocalization()
  const localizeMessage = useLocalizedMessage()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (await login(email, password, rememberMe)) setPassword('')
  }

  return (
    <Surface className="w-full max-w-md">
      <UnsavedChangesPrompt when={!!(email || password || rememberMe) && !session.data} />
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-action">{translate('auth.loginEyebrow')}</p>
      <h1 className="mt-1 text-page-title font-semibold tracking-tight">{translate('auth.loginTitle')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-content-muted">{translate('auth.loginDescription')}</p>
        {notice && <div className="mt-5"><InlineFeedback tone="info">{notice}</InlineFeedback></div>}
      <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
        <TextField id="login-email" label={translate('common.email')} autoComplete="username" type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField id="login-password" label={translate('common.password')} autoComplete="current-password" type="password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} />
        <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-canvas/60 px-4 py-3 transition-colors hover:border-action/40">
          <input id="login-remember-me" name="remember_me" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-action" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          <span><strong className="block text-sm font-semibold text-content">{translate('auth.rememberMe')}</strong><span className="mt-0.5 block text-xs leading-relaxed text-content-muted">{translate('auth.rememberHint')}</span></span>
        </label>
        {session.status.type === 'failure' && <InlineFeedback tone="error">{localizeMessage(session.status.failure.message)}</InlineFeedback>}
        <Button type="submit" disabled={session.status.type === 'loading'}>
          {session.status.type === 'loading' ? translate('auth.loggingIn') : translate('auth.loginTitle')}
        </Button>
      </form>
        <Link className="mt-5 block text-center text-sm font-semibold text-action underline" to="/register">{translate('auth.registerLink')}</Link>
    </Surface>
  )
}
