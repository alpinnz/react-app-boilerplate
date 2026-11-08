import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocalizationProvider, memoryStrategy } from '@valfuse-node/react'
import localization from '../src/app/localization/generated/localization.manifest.json'
import { LanguageSwitcher } from '../src/app/localization/LanguageSwitcher'
import { TextField } from '../src/shared/presentation/ui/molecules/TextField'
import { TopNavigation } from '../src/shared/presentation/ui/organisms/TopNavigation'

afterEach(cleanup)

beforeAll(() => {
  const ResizeObserverMock = class {
    constructor(callback: ResizeObserverCallback) { void callback }
    observe(target: Element) { void target }
    unobserve(target: Element) { void target }
    disconnect() {}
  }
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: ResizeObserverMock })
  Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: ResizeObserverMock })
})

describe('TextField', () => {
  it('given a password field, when activating its visibility control, then toggles visibility accessibly', async () => {
    const user = userEvent.setup()
    render(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <TextField id="password" label="Kata sandi" type="password" value="" onChange={() => undefined} />
      </LocalizationProvider>,
    )

    const password = screen.getByLabelText('Kata sandi') as HTMLInputElement
    expect(password.type).toBe('password')

    const showPassword = screen.getByRole('button', { name: 'Tampilkan kata sandi' })
    expect(showPassword.getAttribute('aria-pressed')).toBe('false')
    await user.click(showPassword)

    expect(password.type).toBe('text')
    expect(screen.getByRole('button', { name: 'Sembunyikan kata sandi' }).getAttribute('aria-pressed')).toBe('true')
    await user.click(screen.getByRole('button', { name: 'Sembunyikan kata sandi' }))

    expect(password.type).toBe('password')
  })
})

describe('navigation accessible names', () => {
  it('given a locale switcher, when changing languages, then keeps the visible locale in its accessible name', async () => {
    const user = userEvent.setup()
    render(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <LanguageSwitcher />
      </LocalizationProvider>,
    )

    expect(screen.getByRole('button', { name: 'ID, Ganti bahasa' }).textContent).toBe('ID')
    await user.click(screen.getByRole('button', { name: 'ID, Ganti bahasa' }))
    await user.click(screen.getByRole('menuitem', { name: 'English' }))
    expect(screen.getByRole('button', { name: 'EN, Change language' }).textContent).toBe('EN')
  })

  it('given an authenticated account menu, when rendered, then names its purpose and account holder', () => {
    render(
      <LocalizationProvider manifest={localization} storage={memoryStrategy()} initialLocale="id">
        <TopNavigation
          title="Akun saya"
          breadcrumbs={[{ id: 'section', content: 'Pengaturan' }]}
          account={{ name: 'Local Demo Admin', email: 'demo-admin@example.test', role: 'owner' }}
          onMenuOpen={() => undefined}
          onAccountSelect={() => undefined}
          onLogoutRequest={() => undefined}
        />
      </LocalizationProvider>,
    )

    const accountMenu = screen.getByRole('button', { name: 'LD, Menu akun: Local Demo Admin' })
    expect(accountMenu.getAttribute('aria-label')).toBe('LD, Menu akun: Local Demo Admin')
  })
})
