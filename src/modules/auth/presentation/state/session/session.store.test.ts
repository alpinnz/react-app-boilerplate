import { describe, expect, it, vi } from 'vitest'
import type { Login } from '../../../domain/usecases/login.usecase'
import type { Logout } from '../../../domain/usecases/logout.usecase'
import type { RestoreSession } from '../../../domain/usecases/restore-session.usecase'
import { createSessionStore } from './session.store'

const session = { userId: 'user-1', name: 'Alya', email: 'alya@example.test', role: { name: 'owner', level: 100 } }

describe('session store', () => {
  it('given valid credentials, when login succeeds, then stores the session and allows it to be renamed', async () => {
    const login = vi.fn<Login>().mockResolvedValue({ ok: true, data: session })
    const logout = vi.fn<Logout>().mockResolvedValue({ ok: true, data: null })
    const store = createSessionStore({ login, logout })

    await expect(store.getState().login('alya@example.test', 'Valid!Password1', true)).resolves.toBe(true)
    store.getState().rename('Alya Baru')

    expect(login).toHaveBeenCalledWith({ email: 'alya@example.test', password: 'Valid!Password1', rememberMe: true }, expect.any(AbortSignal))
    expect(store.getState().session.data?.name).toBe('Alya Baru')
  })

  it('given rejected credentials, when login fails, then keeps a safe failure and does not create a session', async () => {
    const login = vi.fn<Login>().mockResolvedValue({
      ok: false, failure: { kind: 'invalidCredentials', message: 'Email atau kata sandi tidak cocok.' },
    })
    const store = createSessionStore({ login, logout: vi.fn<Logout>() })

    await expect(store.getState().login('alya@example.test', 'wrong', false)).resolves.toBe(false)

    expect(store.getState().session).toEqual({
      data: null,
      status: { type: 'failure', failure: { kind: 'invalidCredentials', message: 'Email atau kata sandi tidak cocok.' } },
    })
  })

  it('given a persisted session, when restoring it, then stores the restored identity', async () => {
    const restoreSession = vi.fn<RestoreSession>().mockResolvedValue({ ok: true, data: session })
    const store = createSessionStore({ login: vi.fn<Login>(), logout: vi.fn<Logout>(), restoreSession })

    await store.getState().restoreSession?.()

    expect(store.getState().session).toEqual({ data: session, status: { type: 'success' } })
  })

  it('given an unauthorized restore result, when restoring the session, then returns to the initial state', async () => {
    const restoreSession = vi.fn<RestoreSession>().mockResolvedValue({
      ok: false, failure: { kind: 'unauthorized', message: 'Sesi berakhir.' },
    })
    const store = createSessionStore({ login: vi.fn<Login>(), logout: vi.fn<Logout>(), restoreSession })

    await store.getState().restoreSession?.()

    expect(store.getState().session).toEqual({ data: null, status: { type: 'initial' } })
  })

  it('given an active session, when logout starts, then clears local access before the remote request completes', async () => {
    let completeLogout!: (result: Awaited<ReturnType<Logout>>) => void
    const logout = vi.fn<Logout>().mockReturnValue(new Promise((resolve) => { completeLogout = resolve }))
    const store = createSessionStore({ login: vi.fn<Login>().mockResolvedValue({ ok: true, data: session }), logout })
    await store.getState().login('alya@example.test', 'Valid!Password1', false)

    const pendingLogout = store.getState().logout()

    expect(store.getState().session).toEqual({ data: null, status: { type: 'initial' } })
    completeLogout({ ok: true, data: null })
    await expect(pendingLogout).resolves.toBeNull()
  })
})
