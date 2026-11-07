import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumbs, type BreadcrumbEntry } from './Breadcrumbs'

const meta = {
  title: 'Shared UI/Molecules/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    ariaLabel: 'Breadcrumb',
    items: [
      { id: 'access', content: 'Access management' },
      { id: 'users', content: <a className="hover:text-action" href="#users">Users</a> },
    ] satisfies BreadcrumbEntry[],
    currentLabel: 'User details',
  },
  parameters: { docs: { description: { component: 'Semantic breadcrumb group with a current-page segment and caller-owned ancestor links.' } } },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const UserDetails: Story = {}
export const LongTrail: Story = {
  args: {
    items: [
      { id: 'workspace', content: 'Workspace' },
      { id: 'access', content: 'Access management' },
      { id: 'users', content: <a className="hover:text-action" href="#users">Users</a> },
    ],
    currentLabel: 'User details',
  },
}
