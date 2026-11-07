import type { Meta, StoryObj } from '@storybook/react-vite'
import { SideNavigationItem } from './SideNavigation'

function NavigationItemExamples() {
  return <nav aria-label="Navigation item examples" className="grid max-w-xs gap-1 rounded-surface border border-line bg-sidebar p-3">
    <SideNavigationItem icon="users" isActive>Users</SideNavigationItem>
    <SideNavigationItem icon="roles" isActive={false}>Roles and access</SideNavigationItem>
    <SideNavigationItem icon="account" isActive={false} isCollapsed>My account</SideNavigationItem>
  </nav>
}

const meta = {
  title: 'Shared UI/Organisms/SideNavigationItem',
  component: NavigationItemExamples,
  parameters: { docs: { description: { component: 'Navigation item states used inside SideNavigation. Labels remain available to assistive technology in collapsed mode.' } } },
} satisfies Meta<typeof NavigationItemExamples>

export default meta
type Story = StoryObj<typeof meta>

export const ActiveAndInactive: Story = {}
