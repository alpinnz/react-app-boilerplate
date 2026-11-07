import type { Meta, StoryObj } from '@storybook/react-vite'
import { SideNavigation, SideNavigationItem } from './SideNavigation'

const navigationItems = <>
  <section aria-label="Workspace">
    <h2 className="mb-1 px-2 text-app-label-semi-bold text-content-muted">Workspace</h2>
    <div className="grid gap-1">
      <SideNavigationItem icon="users" isActive>Users</SideNavigationItem>
      <SideNavigationItem icon="roles" isActive={false}>Roles and access</SideNavigationItem>
    </div>
  </section>
  <section aria-label="Settings" className="border-t border-dashed border-line pt-3">
    <h2 className="mb-1 px-2 text-app-label-semi-bold text-content-muted">Settings</h2>
    <SideNavigationItem icon="account" isActive={false}>My account</SideNavigationItem>
  </section>
</>

const meta = {
  title: 'Shared UI/Organisms/SideNavigation',
  component: SideNavigation,
  args: {
    isOpen: false,
    isCollapsed: false,
    searchValue: '',
    onSearchChange: () => undefined,
    onClose: () => undefined,
    onToggleCollapse: () => undefined,
    brandName: 'React App',
    brandDescription: 'Boilerplate',
    brandMark: 'R',
    children: navigationItems,
  },
  argTypes: { onSearchChange: { control: false }, onClose: { control: false }, onToggleCollapse: { control: false }, children: { control: false } },
  parameters: { docs: { description: { component: 'Responsive sidebar that renders a desktop navigation rail and a focus-managed mobile drawer.' } } },
} satisfies Meta<typeof SideNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = {}
export const Collapsed: Story = { args: { isCollapsed: true } }
export const MobileDrawer: Story = { args: { isOpen: true }, globals: { viewport: { value: 'mobile1', isRotated: false } } }
