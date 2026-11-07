import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LocalizationProvider, memoryStrategy } from '@valfuse-node/react'
import localization from '../src/app/localization/generated/localization.manifest.json'
import { AppRouter } from '../src/app/router/AppRouter'
import { ThemeProvider } from '../src/app/theme/ThemeProvider'
import { SessionProvider } from '../src/modules/auth'
import { ToastProvider } from '../src/shared/presentation/ui/organisms/ToastProvider'
import type { User } from '../src/modules/users/domain/entities/user'
import type { GetUsers } from '../src/modules/users/domain/usecases/get-users.usecase'
import type { UpdateUser } from '../src/modules/users/domain/usecases/update-user.usecase'
import type { DeleteUser } from '../src/modules/users/domain/usecases/delete-user.usecase'

function renderWithTheme(ui: ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

function routerDependencies(getUsers: GetUsers, updateUser: UpdateUser, deleteUser: DeleteUser, registration = { register: vi.fn(), createUser: vi.fn() }) {
  return {
    auth: { registration },
    users: { getUsers, getUser: vi.fn(), changeUserRole: vi.fn(), updateUser, deleteUser },
    account: { getProfile: vi.fn(), updateProfile: vi.fn(), changePassword: vi.fn(), deactivateAccount: vi.fn() },
    roles: { listRoles: vi.fn(), getRole: vi.fn(), createRole: vi.fn(), updateRole: vi.fn(), deleteRole: vi.fn() },
    getHealth: vi.fn(),
  }
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  const ResizeObserverMock = class {
    constructor(callback: ResizeObserverCallback) { void callback }
    observe(target: Element) { void target }
    unobserve(target: Element) { void target }
    disconnect() {}
  }
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: ResizeObserverMock })
  Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: ResizeObserverMock })
})
afterEach(cleanup)

describe('owner user flow', () => {
  it('shows registration success in one toast and leaves a sign-in action', async () => {
    const user = userEvent.setup()
    const registration = { register: vi.fn().mockResolvedValue({ ok: true, data: 'new-user' }), createUser: vi.fn() }
    const dependencies = routerDependencies(vi.fn<GetUsers>(), vi.fn<UpdateUser>(), vi.fn<DeleteUser>(), registration)
    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...dependencies} /> }], { initialEntries: ['/register'] })

    renderWithTheme(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <ToastProvider>
          <SessionProvider login={vi.fn()} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
            <RouterProvider router={router} />
          </SessionProvider>
        </ToastProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Nama' }), 'Demo Admin')
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'demo@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.type(screen.getByLabelText('Konfirmasi kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('button', { name: 'Daftar' }))

    expect(await screen.findByRole('heading', { name: 'Pendaftaran selesai' })).toBeTruthy()
    expect(await within(screen.getByRole('region', { name: 'Notifikasi' })).findByText('Akun berhasil dibuat')).toBeTruthy()
    expect(within(screen.getByRole('main')).queryByText('Akun berhasil dibuat')).toBeNull()
    expect(screen.getAllByRole('link', { name: 'Masuk' }).length).toBeGreaterThan(0)
  })

  it('shows a rate-limit login failure in the toast without duplicating it inline', async () => {
    const user = userEvent.setup()
    const message = 'Terlalu banyak percobaan masuk. Tunggu beberapa saat lalu coba lagi.'
    const dependencies = routerDependencies(vi.fn<GetUsers>(), vi.fn<UpdateUser>(), vi.fn<DeleteUser>())
    const login = vi.fn().mockResolvedValue({ ok: false, failure: { kind: 'rateLimited', message } })
    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...dependencies} /> }], { initialEntries: ['/login'] })

    renderWithTheme(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <ToastProvider>
          <SessionProvider login={login} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
            <RouterProvider router={router} />
          </SessionProvider>
        </ToastProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'owner@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    const notifications = within(screen.getByRole('region', { name: 'Notifikasi' }))
    expect(await notifications.findByText(message)).toBeTruthy()
    expect(within(screen.getByRole('main')).queryByText(message)).toBeNull()
  })

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
    renderWithTheme(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <ToastProvider>
          <SessionProvider login={login} logout={logout} subscribeSessionInvalidated={() => () => undefined}>
            <RouterProvider router={router} />
          </SessionProvider>
        </ToastProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'owner@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('checkbox', { name: /Perpanjang masa sesi/ }))
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(login).toHaveBeenCalledWith({ email: 'owner@example.test', password: 'Valid!Password1', rememberMe: true }, expect.any(AbortSignal))
    expect(screen.queryByRole('button', { name: /Ganti bahasa|Change language/ })).toBeNull()
    await user.click(await screen.findByRole('button', { name: /Menu akun: Owner/ }))
    expect(screen.getByRole('menuitem', { name: 'Bahasa Indonesia' }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'English' })).toBeTruthy()
    await user.click(screen.getByRole('menuitem', { name: 'English' }))
    expect(await screen.findByRole('searchbox', { name: 'Search users' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Account menu: Owner/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Indonesian' }))
    expect(await screen.findByRole('searchbox', { name: 'Cari pengguna' })).toBeTruthy()
    const userTable = within(await screen.findByRole('region', { name: 'Daftar pengguna' }))
    expect(await userTable.findByText('Alya')).toBeTruthy()
    const userSearch = screen.getByRole('searchbox', { name: 'Cari pengguna' })
    await user.type(userSearch, 'tidak-ada')
    expect(await screen.findByText('Tidak ada pengguna yang cocok.')).toBeTruthy()
    expect(screen.queryByText('Muat halaman berikutnya untuk memperluas hasil pencarian.')).toBeNull()
    await user.clear(userSearch)
    expect(getUsers).toHaveBeenCalledTimes(1)

    await user.click(userTable.getByRole('button', { name: 'Edit Alya' }))
    await user.clear(screen.getByRole('textbox', { name: 'Nama' }))
    await user.type(screen.getByRole('textbox', { name: 'Nama' }), 'Alya Baru')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await userTable.findByText('Alya Baru')).toBeTruthy()
    expect(updateUser).toHaveBeenCalledWith({ id: 'u1', name: 'Alya Baru', phoneNumber: '', countryCode: '' }, expect.any(AbortSignal))

    await user.click(userTable.getByRole('button', { name: 'Edit Alya Baru' }))
    await user.clear(screen.getByRole('textbox', { name: 'Nama' }))
    await user.type(screen.getByRole('textbox', { name: 'Nama' }), 'Draft')
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    const discardDialog = screen.getByRole('alertdialog', { name: 'Buang perubahan pengguna?' })
    await user.click(within(discardDialog).getByRole('button', { name: 'Buang perubahan' }))
    expect(userTable.getByText('Alya Baru')).toBeTruthy()

    await user.click(userTable.getByRole('button', { name: 'Hapus Alya Baru' }))
    expect(screen.getByRole('alertdialog', { name: 'Hapus Alya Baru?' })).toBeTruthy()
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Hapus' }))
    await waitFor(() => expect(screen.getByText('Belum ada pengguna.')).toBeTruthy())
    expect(deleteUser).toHaveBeenCalledWith('u1', expect.any(AbortSignal))

    await user.click(screen.getByRole('button', { name: /Owner/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Keluar' }))
    const logoutDialog = screen.getByRole('alertdialog', { name: 'Keluar dari akun?' })
    expect(within(logoutDialog).getByText('Anda akan keluar dari akun di browser ini. Sesi tersimpan akan dihapus dan Anda perlu masuk kembali untuk membuka halaman yang memerlukan autentikasi.')).toBeTruthy()
    await user.click(within(logoutDialog).getByRole('button', { name: 'Keluar dari akun' }))
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
    renderWithTheme(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <ToastProvider>
          <SessionProvider login={login} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
            <RouterProvider router={router} />
          </SessionProvider>
        </ToastProvider>
      </LocalizationProvider>,
    )
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'admin@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    const userTable = within(await screen.findByRole('region', { name: 'Daftar pengguna' }))
    expect(await userTable.findByText('Alya')).toBeTruthy()
    expect(userTable.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(userTable.queryByRole('button', { name: 'Hapus' })).toBeNull()
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
    renderWithTheme(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <ToastProvider>
          <SessionProvider login={login} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
            <RouterProvider router={router} />
          </SessionProvider>
        </ToastProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'staff@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(await screen.findByRole('heading', { name: 'Akun saya' })).toBeTruthy()
    expect(getUsers).not.toHaveBeenCalled()
  })

  it('keeps login navigation free of unsaved-change prompts', async () => {
    const user = userEvent.setup()
    const dependencies = routerDependencies(vi.fn<GetUsers>(), vi.fn<UpdateUser>(), vi.fn<DeleteUser>())
    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...dependencies} /> }], { initialEntries: ['/login'] })

    renderWithTheme(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <ToastProvider>
          <SessionProvider login={vi.fn()} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
            <RouterProvider router={router} />
          </SessionProvider>
        </ToastProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'draft@example.test')
    await user.click(screen.getByRole('button', { name: /Ganti bahasa/ }))
    expect(screen.getByRole('menuitem', { name: 'Bahasa Indonesia' }).getAttribute('aria-current')).toBe('true')
    await user.click(screen.getByRole('menuitem', { name: 'English' }))
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveProperty('value', 'draft@example.test')
    await user.click(screen.getByRole('button', { name: /Change language/ }))
    await user.click(screen.getByRole('menuitem', { name: 'Indonesian' }))
    await user.click(screen.getByRole('link', { name: 'Belum punya akun? Daftar' }))
    expect(await screen.findByRole('heading', { name: 'Daftar akun' })).toBeTruthy()
    expect(screen.queryByRole('alertdialog', { name: 'Tinggalkan perubahan?' })).toBeNull()
  })
})

describe('role detail flow', () => {
  it('shows useful read-only details for a built-in role', async () => {
    const user = userEvent.setup()
    const dependencies = routerDependencies(vi.fn<GetUsers>(), vi.fn<UpdateUser>(), vi.fn<DeleteUser>())
    const roles = [
      { id: 'owner-role', name: 'owner', level: 100 },
      { id: 'admin-role', name: 'admin', level: 80 },
    ]
    dependencies.roles.listRoles.mockResolvedValue({ ok: true, data: roles })
    dependencies.roles.getRole.mockImplementation(async (id: string) => {
      const role = roles.find((entry) => entry.id === id)
      return role ? { ok: true, data: role } : { ok: false, failure: { kind: 'notFound', message: 'Peran tidak ditemukan.' } }
    })
    const login = vi.fn().mockResolvedValue({ ok: true, data: { userId: 'owner', name: 'Owner', email: 'owner@example.test', role: { name: 'owner', level: 100 } } })

    const router = createMemoryRouter([{ path: '*', element: <AppRouter {...dependencies} /> }], { initialEntries: ['/login'] })
    renderWithTheme(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <ToastProvider>
          <SessionProvider login={login} logout={vi.fn()} subscribeSessionInvalidated={() => () => undefined}>
            <RouterProvider router={router} />
          </SessionProvider>
        </ToastProvider>
      </LocalizationProvider>,
    )

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'owner@example.test')
    await user.type(screen.getByLabelText('Kata sandi'), 'Valid!Password1')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))
    await user.click(await screen.findByRole('link', { name: 'Peran & akses' }))
    await user.click((await screen.findAllByRole('button', { name: 'Aksi lainnya untuk admin' }))[0])
    await user.click(screen.getByRole('menuitem', { name: 'Detail' }))

    const dialog = within(await screen.findByRole('dialog', { name: /Detail peran/ }))
    expect(dialog.getByText('admin')).toBeTruthy()
    expect(dialog.getByText('80')).toBeTruthy()
    expect(dialog.getByText('Bawaan')).toBeTruthy()
    expect(dialog.getByText('Peran bawaan dan peran dengan level setara atau lebih tinggi tidak dapat diubah.')).toBeTruthy()
  })
})
