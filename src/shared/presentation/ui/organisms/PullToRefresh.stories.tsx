import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../atoms/Button'
import { Surface } from '../atoms/Surface'
import { PullToRefresh } from './PullToRefresh'

const content = <Surface><h2 className="text-app-subtitle-semi-bold">User list</h2><p className="mt-2 text-app-body-regular-regular text-content-muted">On a touch viewport, pull down from the top of the main scroller to refresh.</p><Button type="button" variant="secondary" className="mt-4">Keyboard-accessible action</Button></Surface>

const meta = {
  title: 'Shared UI/Organisms/PullToRefresh',
  component: PullToRefresh,
  args: {
    onRefresh: async () => undefined,
    pullLabel: 'Pull down to refresh',
    releaseLabel: 'Release to refresh',
    refreshingLabel: 'Refreshing…',
    children: content,
  },
  argTypes: { onRefresh: { control: false }, children: { control: false } },
  render: (args) => <div className="min-h-dvh overflow-y-auto p-4 sm:p-6"><PullToRefresh {...args} /></div>,
  parameters: { docs: { description: { component: 'Adds a touch pull gesture while keeping the page scroll and keyboard controls available.' } } },
} satisfies Meta<typeof PullToRefresh>

export default meta
type Story = StoryObj<typeof meta>

export const TouchViewport: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } }
