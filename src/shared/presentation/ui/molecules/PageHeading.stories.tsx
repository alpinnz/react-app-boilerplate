import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../atoms/Button'
import { PageHeading } from './PageHeading'

const meta = {
  title: 'Shared UI/Molecules/PageHeading',
  component: PageHeading,
  args: { title: 'User list', description: 'Search loaded users, then open a profile to review access.' },
  parameters: { docs: { description: { component: 'Responsive page or section heading with optional eyebrow, supporting text, tone, and actions.' } } },
} satisfies Meta<typeof PageHeading>

export default meta
type Story = StoryObj<typeof meta>

export const Page: Story = {}
export const WithBreadcrumbs: Story = {
  args: {
    breadcrumbs: {
      ariaLabel: 'Breadcrumb',
      items: [{ id: 'section', content: 'Access management' }],
    },
  },
}
export const WithActions: Story = { args: { actions: <Button type="button">Add user</Button> } }
export const Section: Story = { args: { level: 'section', title: 'Profile information', description: 'Update the details attached to this account.', eyebrow: 'Account settings' } }
export const Destructive: Story = { args: { title: 'Delete role', description: 'This action cannot be undone.', tone: 'danger', titleSize: 'compact' } }
