import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { LocalizationProvider, memoryStrategy } from '@valfuse-node/react'
import localization from '../src/app/localization/generated/localization.manifest.json'
import { AppRouter } from '../src/app/router/AppRouter'
import { SessionProvider } from '../src/modules/auth'
import type { User } from '../src/modules/users/domain/entities/user'
import type { GetUsers } from '../src/modules/users/domain/usecases/get-users.usecase'
import type { UpdateUser } from '../src/modules/users/domain/usecases/update-user.usecase'
import type { DeleteUser } from '../src/modules/users/domain/usecases/delete-user.usecase'

function routerDependencies(getUsers: GetUsers, updateUser: UpdateUser, deleteUser: DeleteUser) {
  return {
    auth: { registration: { register: vi.fn(), createUser: vi.fn() } },
    users: { getUsers, getUser: vi.fn(), changeUserRole: vi.fn(), updateUser, deleteUser },
    account: { getProfile: vi.fn(), updateProfile: vi.fn(), changePassword: vi.fn(), deactivateAccount: vi.fn() },
    roles: { listRoles: vi.fn(), getRole: vi.fn(), createRole: vi.fn(), updateRole: vi.fn(), deleteRole: vi.fn() },
    getHealth: vi.fn(),
  }
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(cleanup)

describe('owner user flow', () => {
  it('logs in, edits another user, and deletes them', async () => {
    const user = userEvent.setup()
    let users: User[] = [{ id: 'u1', name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: null }]
    const getUsers = vi.fn<GetUsers>().mockImplementation(async () => ({ ok: true, data: { items: users, nextCursor: null } }))
    const updateUser = vi.fn<UpdateUser>().mockImplementation(async (input) => {
      users = users.map((entry) => entry.id === input.id ? { ...entry, name: input.name, phoneNumber: input.phoneNumber, countryCode: input.countryCode } : entry)
      return { ok: true, data: users[0] }
    })
    const deleteUser = vi.fn<DeleteUser>().mockImplementation(async (id) => {
      users = users.filter((entry) => entry.id !== id)
      return { ok: true, data: id }
    })
    const login = vi.fn().mockResolvedValue({ ok: true, data: { userId: 'owner', name: 'Owner', email: 'owner@example.test', role: { name: 'owner', level: 100 } } })
    const logout = vi.fn().mockResolvedValue({ ok: true, data: null })

    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...routerDependencies(getUsers, updateUser, deleteUser)} /> }], { initialEntries: ['/login'] })
    render(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
      <SessionProvider login={login} logout={logout} subscribeSessionInvalidated={() => () => undefined}>
        <RouterProvider router={router} />
      </SessionProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'owner@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('checkbox', { name: /Perpanjang sesi saya/ }))
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(login).toHaveBeenCalledWith({ email: 'owner@example.test', password: 'Valid!Password1', rememberMe: true }, expect.any(AbortSignal))
    expect(await screen.findByText('Alya')).toBeTruthy()
    expect(getUsers).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByRole('textbox', { name: 'Nama' }))
    await user.type(screen.getByRole('textbox', { name: 'Nama' }), 'Alya Baru')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByText('Alya Baru')).toBeTruthy()
    expect(updateUser).toHaveBeenCalledWith({ id: 'u1', name: 'Alya Baru', phoneNumber: '', countryCode: '' }, expect.any(AbortSignal))

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.clear(screen.getByRole('textbox', { name: 'Nama' }))
    await user.type(screen.getByRole('textbox', { name: 'Nama' }), 'Draft')
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    const discardDialog = screen.getByRole('dialog', { name: 'Batalkan perubahan pengguna?' })
    await user.click(within(discardDialog).getByRole('button', { name: 'Buang perubahan' }))
    expect(screen.getByText('Alya Baru')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Hapus' }))
    expect(screen.getByText('Hapus Alya Baru dari daftar pengguna akun ini?')).toBeTruthy()
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hapus' }))
    await waitFor(() => expect(screen.getByText('Belum ada pengguna.')).toBeTruthy())
    expect(deleteUser).toHaveBeenCalledWith('u1', expect.any(AbortSignal))

    await user.click(screen.getByRole('button', { name: /Menu akun/ }))
    await user.click(screen.getByRole('button', { name: 'Keluar' }))
    const logoutDialog = screen.getByRole('dialog', { name: 'Keluar dari akun?' })
    expect(within(logoutDialog).getByText('Sesi aktif di tab ini akan diakhiri. Anda dapat masuk kembali kapan saja.')).toBeTruthy()
    await user.click(within(logoutDialog).getByRole('button', { name: 'Ya, keluar' }))
    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeTruthy()
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('shows the list without write actions for an admin', async () => {
    const user = userEvent.setup()
    const target: User = { id: 'u1', name: 'Alya', email: 'alya@example.test', phoneNumber: null, countryCode: null }
    const getUsers = vi.fn<GetUsers>().mockResolvedValue({ ok: true, data: { items: [target], nextCursor: null } })
    const updateUser = vi.fn<UpdateUser>()
    const deleteUser = vi.fn<DeleteUser>()
    const login = vi.fn().mockResolvedValue({ ok: true, data: { userId: 'admin', name: 'Admin', email: 'admin@example.test', role: { name: 'admin', level: 80 } } })

    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...routerDependencies(getUsers, updateUser, deleteUser)} /> }], { initialEntries: ['/login'] })
    render(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
      <SessionProvider login={login} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
        <RouterProvider router={router} />
      </SessionProvider>
      </LocalizationProvider>,
    )
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'admin@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByText('Alya')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Hapus' })).toBeNull()
  })

  it('sends staff to their account instead of the restricted user list', async () => {
    const user = userEvent.setup()
    const getUsers = vi.fn<GetUsers>()
    const dependencies = routerDependencies(getUsers, vi.fn<UpdateUser>(), vi.fn<DeleteUser>())
    dependencies.account.getProfile.mockResolvedValue({
      ok: true,
      data: {
        id: 'staff', name: 'Staff', email: 'staff@example.test', phoneNumber: null, countryCode: null,
        role: { id: 'staff-role', name: 'staff', level: 50 },
      },
    })
    const login = vi.fn().mockResolvedValue({
      ok: true,
      data: { userId: 'staff', name: 'Staff', email: 'staff@example.test', role: { name: 'staff', level: 50 } },
    })

    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...dependencies} /> }], { initialEntries: ['/login'] })
    render(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
      <SessionProvider login={login} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
        <RouterProvider router={router} />
      </SessionProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'staff@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(await screen.findByRole('heading', { name: 'Akun saya' })).toBeTruthy()
    expect(getUsers).not.toHaveBeenCalled()
  })

  it('confirms navigation away from an unfinished login form', async () => {
    const user = userEvent.setup()
    const dependencies = routerDependencies(vi.fn<GetUsers>(), vi.fn<UpdateUser>(), vi.fn<DeleteUser>())
    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...dependencies} /> }], { initialEntries: ['/login'] })

    render(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
      <SessionProvider login={vi.fn()} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
        <RouterProvider router={router} />
      </SessionProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'draft@example.test')
    expect(screen.getByRole('button', { name: 'Indonesia' }).getAttribute('aria-pressed')).toBe('true')
    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveProperty('value', 'draft@example.test')
    expect(screen.getByRole('button', { name: 'English' }).getAttribute('aria-pressed')).toBe('true')
    await user.click(screen.getByRole('button', { name: 'Indonesia' }))
    await user.click(screen.getByRole('link', { name: 'Belum punya akun? Daftar' }))
    const firstPrompt = screen.getByRole('dialog', { name: 'Tinggalkan perubahan?' })
    await user.click(within(firstPrompt).getByRole('button', { name: 'Tetap di halaman' }))
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveProperty('value', 'draft@example.test')

    await user.click(screen.getByRole('link', { name: 'Belum punya akun? Daftar' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Tinggalkan perubahan?' })).getByRole('button', { name: 'Tinggalkan halaman' }))
    expect(await screen.findByRole('heading', { name: 'Daftar akun' })).toBeTruthy()
  })
})
