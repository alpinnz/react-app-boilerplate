import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../atoms/Button'
import { AsyncActionPattern } from './AsyncActionPattern'

const meta = {
  title: 'Shared UI/Patterns/AsyncActionPattern',
  component: AsyncActionPattern,
  args: {
    children: <p className="text-app-body-regular-regular text-content-muted">Update the account details, then save your changes.</p>,
    actions: <><Button type="button" variant="secondary">Cancel</Button><Button type="button">Save changes</Button></>,
  },
  argTypes: { children: { control: false }, actions: { control: false } },
  render: (args) => <div className="max-w-xl p-6"><AsyncActionPattern {...args} /></div>,
  parameters: { docs: { description: { component: 'Consistent layout for async forms: content, optional error feedback, and a separated action row.' } } },
} satisfies Meta<typeof AsyncActionPattern>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {}
export const Failed: Story = { args: { error: 'The server could not save this change. Try again.' } }
