import type { Meta, StoryObj } from '@storybook/react-vite'
import { TopNavigation } from './TopNavigation'

const meta = {
  title: 'Shared UI/Organisms/TopNavigation',
  component: TopNavigation,
  args: {
    title: 'User list',
    breadcrumbs: [{ id: 'section', content: 'Access management' }],
    account: { name: 'Alex Morgan', email: 'alex@example.test', role: 'owner' },
    themeMode: 'light',
    onThemeToggle: () => undefined,
    onMenuOpen: () => undefined,
    onAccountSelect: () => undefined,
    onLogoutRequest: () => undefined,
  },
  argTypes: { onMenuOpen: { control: false }, onAccountSelect: { control: false }, onLogoutRequest: { control: false }, onThemeToggle: { control: false } },
  parameters: { docs: { description: { component: 'Application header with page title and breadcrumbs, notification and account popovers, plus an appearance preference in the account menu.' } } },
} satisfies Meta<typeof TopNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {}
export const Mobile: Story = { globals: { viewport: { value: 'mobile2', isRotated: false } } }
